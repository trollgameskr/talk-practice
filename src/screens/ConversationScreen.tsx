/**
 * Conversation Screen - Main practice interface
 */

import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import {
  ConversationTopic,
  Message,
  ConversationSession,
  VocabularyWord,
} from '../types';
import GeminiService from '../services/GeminiService';
import VoiceService from '../services/VoiceService';
import StorageService from '../services/StorageService';
import {generateId, formatDuration} from '../utils/helpers';
import {STORAGE_KEYS} from '../config/gemini.config';
import {getTargetLanguage, getCurrentLanguage} from '../config/i18n.config';

const storageService = new StorageService();

const ConversationScreen = ({route, navigation}: any) => {
  const {topic} = route.params as {topic: ConversationTopic};
  const {t} = useTranslation();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [enrichedSampleAnswers, setEnrichedSampleAnswers] = useState<
    Array<{
      text: string;
      translation?: string;
      pronunciation?: string;
    }>
  >([]);
  const [showSamples, setShowSamples] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordDefinition, setWordDefinition] = useState<{
    definition: string;
    examples: string[];
  } | null>(null);
  const [showDefinitionModal, setShowDefinitionModal] = useState(false);
  const [autoReadResponse, setAutoReadResponse] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showPronunciation, setShowPronunciation] = useState(false);
  const [showGrammarHighlights, setShowGrammarHighlights] = useState(false);
  const [selectedGrammarHighlight, setSelectedGrammarHighlight] = useState<{
    text: string;
    type: 'grammar' | 'idiom' | 'phrase';
    explanation: string;
    examples?: string[];
    startIndex: number;
    endIndex: number;
  } | null>(null);
  const [showGrammarModal, setShowGrammarModal] = useState(false);
  const [showVoiceDisplayModal, setShowVoiceDisplayModal] = useState(false);
  const [voiceDisplayText, setVoiceDisplayText] = useState('');
  const [voiceDisplayTranslation, setVoiceDisplayTranslation] = useState('');
  const [voiceDisplayPronunciation, setVoiceDisplayPronunciation] =
    useState('');
  const [voiceMethod, setVoiceMethod] = useState<string>('Web Speech API');
  const [textOnlyMode, setTextOnlyMode] = useState(false);
  const [userInputText, setUserInputText] = useState('');

  const geminiService = useRef<GeminiService | null>(null);
  const voiceService = useRef<VoiceService | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionSavedRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef(generateId());
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isResumingRef = useRef(false);

  useEffect(() => {
    checkForSavedSession();
    startTimer();

    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Auto-save session state periodically
   */
  useEffect(() => {
    // Only auto-save if we have messages and haven't saved the final session
    if (messages.length > 0 && !sessionSavedRef.current) {
      // Save current session state every 10 seconds
      const saveCurrentState = async () => {
        try {
          const currentSession: Partial<ConversationSession> = {
            id: sessionIdRef.current,
            topic,
            startTime: sessionStartTime,
            messages,
            duration: elapsedTime,
          };
          await storageService.saveCurrentSession(currentSession);
        } catch (error) {
          console.error('Error auto-saving session:', error);
        }
      };

      saveCurrentState();

      // Set up periodic auto-save
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setInterval(saveCurrentState, 10000); // Save every 10 seconds

      return () => {
        if (autoSaveTimerRef.current) {
          clearInterval(autoSaveTimerRef.current);
        }
      };
    }
  }, [messages, elapsedTime, topic, sessionStartTime]);

  /**
   * Check for saved session and prompt user to resume
   */
  const checkForSavedSession = async () => {
    try {
      const savedSession = await storageService.getCurrentSession();

      if (
        savedSession &&
        savedSession.messages &&
        savedSession.messages.length > 0
      ) {
        // Check if the saved session is for the same topic
        if (savedSession.topic === topic) {
          // Prompt user to resume
          Alert.alert(
            t('conversation.resumeSession.title'),
            t('conversation.resumeSession.message'),
            [
              {
                text: t('conversation.resumeSession.startNew'),
                onPress: async () => {
                  await storageService.clearCurrentSession();
                  await initializeServices();
                },
                style: 'cancel',
              },
              {
                text: t('conversation.resumeSession.resume'),
                onPress: () => resumeSession(savedSession),
              },
            ],
          );
        } else {
          // Different topic, clear saved session and start new
          await storageService.clearCurrentSession();
          await initializeServices();
        }
      } else {
        // No saved session, start new
        await initializeServices();
      }
    } catch (error) {
      console.error('Error checking for saved session:', error);
      await initializeServices();
    }
  };

  /**
   * Resume from saved session
   */
  const resumeSession = async (savedSession: Partial<ConversationSession>) => {
    try {
      isResumingRef.current = true;
      setIsLoading(true);

      // Restore session state
      if (savedSession.id) {
        sessionIdRef.current = savedSession.id;
      }
      if (savedSession.messages) {
        setMessages(savedSession.messages);
      }
      if (savedSession.startTime) {
        setSessionStartTime(new Date(savedSession.startTime));
      }
      if (savedSession.duration) {
        setElapsedTime(savedSession.duration);
      }

      // Initialize services
      await initializeServices(true); // Pass true to indicate resuming

      setIsLoading(false);
    } catch (error) {
      console.error('Error resuming session:', error);
      Alert.alert('Error', 'Failed to resume session. Starting new session.');
      await storageService.clearCurrentSession();
      await initializeServices();
    }
  };

  const initializeServices = async (isResuming: boolean = false) => {
    try {
      setIsLoading(true);

      // Load API key from storage
      const apiKey = await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
      if (!apiKey) {
        Alert.alert(
          'API Key Required',
          'You need a Gemini API key to start practicing. You can get one for free from Google AI Studio.\n\nGo to Settings to configure your API key.',
          [
            {text: 'Cancel', onPress: () => navigation.goBack()},
            {
              text: 'Go to Settings',
              onPress: () => navigation.navigate('Settings'),
            },
          ],
        );
        setIsLoading(false);
        return;
      }

      // Load sentence length preference from storage
      const sentenceLengthPref = await AsyncStorage.getItem(
        STORAGE_KEYS.SENTENCE_LENGTH,
      );
      const sentenceLength = (sentenceLengthPref as any) || 'short';

      // Load auto-read response preference from storage
      const autoReadPref = await AsyncStorage.getItem(
        STORAGE_KEYS.AUTO_READ_RESPONSE,
      );
      const loadedAutoRead =
        autoReadPref !== null ? autoReadPref === 'true' : true; // Default to true (Feature 3)
      setAutoReadResponse(loadedAutoRead);

      // Load display preferences
      const showTranslationPref = await AsyncStorage.getItem(
        STORAGE_KEYS.SHOW_TRANSLATION,
      );
      const loadedShowTranslation =
        showTranslationPref !== null ? showTranslationPref === 'true' : true; // Default to true (Feature 3)
      setShowTranslation(loadedShowTranslation);

      const showPronunciationPref = await AsyncStorage.getItem(
        STORAGE_KEYS.SHOW_PRONUNCIATION,
      );
      const loadedShowPronunciation =
        showPronunciationPref !== null
          ? showPronunciationPref === 'true'
          : true; // Default to true (Feature 3)
      setShowPronunciation(loadedShowPronunciation);

      const showGrammarHighlightsPref = await AsyncStorage.getItem(
        STORAGE_KEYS.SHOW_GRAMMAR_HIGHLIGHTS,
      );
      const loadedShowGrammarHighlights =
        showGrammarHighlightsPref !== null
          ? showGrammarHighlightsPref === 'true'
          : true; // Default to true (Feature 3)
      setShowGrammarHighlights(loadedShowGrammarHighlights);

      // Load text-only mode preference
      const textOnlyModePref = await AsyncStorage.getItem(
        STORAGE_KEYS.TEXT_ONLY_MODE,
      );
      const loadedTextOnlyMode =
        textOnlyModePref !== null ? textOnlyModePref === 'true' : false; // Default to false
      setTextOnlyMode(loadedTextOnlyMode);

      // Load language preferences
      const targetLanguage = await getTargetLanguage();
      const nativeLanguage = getCurrentLanguage();

      // Initialize Gemini service with API key, sentence length, and languages
      geminiService.current = new GeminiService(
        apiKey,
        sentenceLength,
        targetLanguage,
        nativeLanguage,
      );

      // Set up real-time token usage tracking
      geminiService.current.setTokenUsageCallback(async tokenUsage => {
        try {
          await storageService.updateTokenUsage(tokenUsage);
        } catch (error) {
          console.error('Error saving token usage:', error);
        }
      });

      // Initialize Voice service (only if not in text-only mode)
      if (!loadedTextOnlyMode) {
        voiceService.current = new VoiceService(apiKey);
      }

      // Only start a new conversation if not resuming
      if (!isResuming) {
        // Start conversation
        const starterMessage = await geminiService.current.startConversation(
          topic,
        );

        let assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: starterMessage,
          timestamp: new Date(),
        };

        // Enrich message with translation, pronunciation, and grammar highlights
        // Pass loaded values directly to avoid relying on state (Feature 1 fix)
        assistantMessage = await enrichAssistantMessage(assistantMessage, {
          translation: loadedShowTranslation,
          pronunciation: loadedShowPronunciation,
          grammarHighlights: loadedShowGrammarHighlights,
        });

        setMessages([assistantMessage]);

        // Generate 2 sample answer options for the user
        // Pass loaded values directly to avoid relying on state (Bug 2 fix)
        await generateSampleAnswers(starterMessage, {
          translation: loadedShowTranslation,
          pronunciation: loadedShowPronunciation,
        });

        // Speak the starter message (only if not in text-only mode)
        if (!loadedTextOnlyMode && voiceService.current) {
          await voiceService.current.speak(starterMessage);
          // Get the voice method that was used
          const method = voiceService.current.getVoiceMethod();
          setVoiceMethod(method);
        }
      } else {
        // When resuming, we need to restore the conversation context in Gemini
        // by replaying all the messages
        await geminiService.current.startConversation(topic);

        // Replay the conversation history to restore context
        for (let i = 0; i < messages.length; i++) {
          const msg = messages[i];
          if (msg.role === 'user') {
            // Send user messages to rebuild context
            await geminiService.current.sendMessage(msg.content);
          }
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing services:', error);
      Alert.alert(
        'Error',
        'Failed to initialize conversation. Please check your API key in Settings.',
      );
      setIsLoading(false);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  };

  const cleanup = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    if (geminiService.current) {
      geminiService.current.endConversation();
    }

    if (voiceService.current) {
      await voiceService.current.destroy();
    }

    // Save session only if not already saved
    if (messages.length > 0 && !sessionSavedRef.current) {
      await saveSession();
    }
  };

  const handleToggleListening = async () => {
    if (!voiceService.current) {
      return;
    }

    try {
      if (isListening) {
        // Stop listening
        await voiceService.current.stopListening();
        setIsListening(false);

        // Start silence timer for auto-response (feat 1)
        startSilenceTimer();
      } else {
        // Start listening
        setIsListening(true);
        await voiceService.current.startListening(
          async text => {
            await handleUserMessage(text);
          },
          error => {
            console.error('Voice error:', error);
            setIsListening(false);
            Alert.alert('Error', 'Voice recognition failed. Please try again.');
          },
        );
      }
    } catch (error) {
      console.error('Error toggling listening:', error);
      setIsListening(false);
    }
  };

  const startSilenceTimer = () => {
    // Clear any existing timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    // The auto-response feature is already implemented via VoiceService:
    // When user stops speaking, onSpeechEnd callback automatically calls
    // handleUserMessage which triggers the AI response. This timer is
    // kept for potential future enhancements to silence detection.
  };

  const handleSendTextMessage = async () => {
    if (!userInputText.trim()) {
      return;
    }

    const text = userInputText.trim();
    setUserInputText('');
    await handleUserMessage(text, !textOnlyMode);
  };

  /**
   * Enrich assistant message with translation, pronunciation, and grammar highlights
   */
  const enrichAssistantMessage = async (
    message: Message,
    options?: {
      translation?: boolean;
      pronunciation?: boolean;
      grammarHighlights?: boolean;
    },
  ): Promise<Message> => {
    if (!geminiService.current) {
      return message;
    }

    const enrichedMessage = {...message};

    // Use provided options or fall back to state values
    const enableTranslation =
      options?.translation !== undefined
        ? options.translation
        : showTranslation;
    const enablePronunciation =
      options?.pronunciation !== undefined
        ? options.pronunciation
        : showPronunciation;
    const enableGrammarHighlights =
      options?.grammarHighlights !== undefined
        ? options.grammarHighlights
        : showGrammarHighlights;

    try {
      // Fetch translation if enabled
      if (enableTranslation) {
        const translation = await geminiService.current.getTranslation(
          message.content,
        );
        enrichedMessage.translation = translation;
      }

      // Fetch pronunciation if enabled
      if (enablePronunciation) {
        const pronunciation = await geminiService.current.getPronunciation(
          message.content,
        );
        enrichedMessage.pronunciation = pronunciation;
      }

      // Fetch grammar highlights if enabled
      if (enableGrammarHighlights) {
        const highlights = await geminiService.current.getGrammarHighlights(
          message.content,
        );
        // Convert to GrammarHighlight format with positions
        enrichedMessage.grammarHighlights = highlights.map(h => ({
          text: h.text,
          type: h.type as 'grammar' | 'idiom' | 'phrase',
          explanation: h.explanation,
          examples: h.examples || [],
          startIndex: message.content.indexOf(h.text),
          endIndex: message.content.indexOf(h.text) + h.text.length,
        }));
      }
    } catch (error) {
      console.error('Error enriching message:', error);
    }

    return enrichedMessage;
  };

  const handleUserMessage = async (
    text: string,
    shouldSpeak: boolean = true,
  ) => {
    if (!text.trim() || !geminiService.current) {
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Get response from Gemini
      const response = await geminiService.current.sendMessage(text);

      let assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      // Enrich message with translation, pronunciation, and grammar highlights
      assistantMessage = await enrichAssistantMessage(assistantMessage);

      setMessages(prev => [...prev, assistantMessage]);

      // Generate 2 sample answer options for user to practice with
      await generateSampleAnswers(response);

      // Speak the response only if shouldSpeak is true and not in text-only mode
      if (shouldSpeak && !textOnlyMode && voiceService.current) {
        setIsSpeaking(true);
        await voiceService.current.speak(response);
        // Get the voice method that was used
        const method = voiceService.current.getVoiceMethod();
        setVoiceMethod(method);
        setIsSpeaking(false);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error handling message:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to get response. Please try again.');
    }
  };

  const handleEndSession = async () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end this practice session?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'End Session',
          style: 'destructive',
          onPress: async () => {
            // Mark session as saved to prevent duplicate saves
            sessionSavedRef.current = true;
            await saveSession();
            // Use setTimeout to ensure cleanup happens after navigation
            setTimeout(() => {
              navigation.goBack();
            }, 100);
          },
        },
      ],
    );
  };

  const generateSampleAnswers = async (
    aiMessage: string,
    options?: {
      translation?: boolean;
      pronunciation?: boolean;
    },
  ) => {
    if (!geminiService.current) {
      return;
    }

    try {
      const samples = await geminiService.current.generateSampleAnswers(
        aiMessage,
        2,
      );

      // Use provided options or fall back to state values
      const enableTranslation =
        options?.translation !== undefined
          ? options.translation
          : showTranslation;
      const enablePronunciation =
        options?.pronunciation !== undefined
          ? options.pronunciation
          : showPronunciation;

      // Enrich sample answers with translation and pronunciation (Feature 2)
      const enriched = await Promise.all(
        samples.map(async sample => {
          const result: {
            text: string;
            translation?: string;
            pronunciation?: string;
          } = {text: sample};

          try {
            if (enableTranslation) {
              result.translation = await geminiService.current!.getTranslation(
                sample,
              );
            }
            if (enablePronunciation) {
              result.pronunciation =
                await geminiService.current!.getPronunciation(sample);
            }
          } catch (error) {
            console.error('Error enriching sample answer:', error);
          }

          return result;
        }),
      );

      setEnrichedSampleAnswers(enriched);
      setShowSamples(true);
    } catch (error) {
      console.error('Error generating sample answers:', error);
    }
  };

  const handleWordPress = async (word: string) => {
    if (!geminiService.current || !word.trim()) {
      return;
    }

    // Clean the word (remove punctuation)
    const cleanWord = word.replace(/[.,!?;:()]/g, '').trim();
    if (!cleanWord) {
      return;
    }

    setSelectedWord(cleanWord);
    setShowDefinitionModal(true);

    try {
      const definition = await geminiService.current.getWordDefinition(
        cleanWord,
      );
      setWordDefinition(definition);

      // Automatically add to vocabulary (feat 4)
      const vocabWord: VocabularyWord = {
        id: generateId(),
        word: cleanWord,
        definition: definition.definition,
        examples: definition.examples,
        addedDate: new Date(),
        fromSession: sessionIdRef.current,
        reviewed: false,
      };

      await storageService.saveVocabularyWord(vocabWord);
    } catch (error) {
      console.error('Error getting word definition:', error);
      setWordDefinition({
        definition: '정의를 불러올 수 없습니다',
        examples: [],
      });
    }
  };

  const handleUseSample = async (sampleObj: {
    text: string;
    translation?: string;
    pronunciation?: string;
  }) => {
    const sample = sampleObj.text;
    setShowSamples(false);

    // If auto-read is enabled and not in text-only mode, read the sample
    if (autoReadResponse && !textOnlyMode && voiceService.current) {
      try {
        // Show the text with translation and pronunciation in large modal while playing voice
        setVoiceDisplayText(sample);
        setVoiceDisplayTranslation(sampleObj.translation || '');
        setVoiceDisplayPronunciation(sampleObj.pronunciation || '');
        setShowVoiceDisplayModal(true);

        // Speak the selected sample
        setIsSpeaking(true);
        await voiceService.current.speak(sample);

        // Get the voice method that was used
        const method = voiceService.current.getVoiceMethod();
        setVoiceMethod(method);

        setIsSpeaking(false);

        // Hide the modal after voice playback
        setShowVoiceDisplayModal(false);

        await handleUserMessage(sample, autoReadResponse);
      } catch (error) {
        console.error('Error reading sample:', error);
        setShowVoiceDisplayModal(false);
        await handleUserMessage(sample, autoReadResponse);
      }
    } else {
      await handleUserMessage(sample, autoReadResponse);
    }
  };

  const saveSession = async () => {
    if (messages.length === 0 || sessionSavedRef.current) {
      return;
    }

    try {
      sessionSavedRef.current = true;

      // Get feedback for the session
      let feedback;
      if (geminiService.current && messages.length > 2) {
        const userMessages = messages
          .filter(m => m.role === 'user')
          .map(m => m.content)
          .join(' ');
        feedback = await geminiService.current.analyzeFeedback(userMessages);
      }

      // Get token usage (provide default if not available)
      const tokenUsage =
        geminiService.current?.getSessionTokenUsage() || undefined;

      const session: ConversationSession = {
        id: sessionIdRef.current,
        topic,
        startTime: sessionStartTime,
        endTime: new Date(),
        messages,
        feedback,
        duration: elapsedTime,
        tokenUsage,
      };

      await storageService.saveSession(session);
      await storageService.clearCurrentSession();
    } catch (error) {
      console.error('Error saving session:', error);
      sessionSavedRef.current = false;
    }
  };

  /**
   * Render text with clickable words and grammar highlights
   */
  const renderClickableWords = (message: Message) => {
    const text = message.content;
    const grammarHighlights = message.grammarHighlights || [];

    // Split text into words while preserving spaces and punctuation
    const parts: {text: string; isWord: boolean; charIndex: number}[] = [];
    let currentWord = '';
    let currentNonWord = '';
    let charIndex = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      // Match word characters in any language (Unicode letters, digits, apostrophes, hyphens)
      // This supports English, Korean, Japanese, Chinese, and other languages
      if (/[\p{L}\p{N}'-]/u.test(char)) {
        // It's part of a word
        if (currentNonWord) {
          parts.push({text: currentNonWord, isWord: false, charIndex});
          charIndex += currentNonWord.length;
          currentNonWord = '';
        }
        currentWord += char;
      } else {
        // It's not part of a word (space, punctuation, etc.)
        if (currentWord) {
          parts.push({text: currentWord, isWord: true, charIndex});
          charIndex += currentWord.length;
          currentWord = '';
        }
        currentNonWord += char;
      }
    }

    // Push remaining text
    if (currentWord) {
      parts.push({text: currentWord, isWord: true, charIndex});
    }
    if (currentNonWord) {
      parts.push({text: currentNonWord, isWord: false, charIndex});
    }

    // Check if a part is within a grammar highlight
    const getHighlightForPosition = (
      position: number,
      length: number,
    ): (typeof grammarHighlights)[0] | null => {
      if (!showGrammarHighlights) {
        return null;
      }

      for (const highlight of grammarHighlights) {
        if (
          position >= highlight.startIndex &&
          position + length <= highlight.endIndex
        ) {
          return highlight;
        }
      }
      return null;
    };

    return (
      <Text style={[styles.messageText, styles.assistantText]}>
        {parts.map((part, index) => {
          const highlight = getHighlightForPosition(
            part.charIndex,
            part.text.length,
          );

          if (part.isWord) {
            if (highlight) {
              // Highlighted grammar/idiom
              return (
                <Text
                  key={`word-${index}-${part.text}`}
                  style={[
                    styles.clickableWord,
                    styles.grammarHighlight,
                    highlight.type === 'idiom' && styles.idiomHighlight,
                    highlight.type === 'phrase' && styles.phraseHighlight,
                  ]}
                  onPress={() => {
                    setSelectedGrammarHighlight(highlight);
                    setShowGrammarModal(true);
                  }}>
                  {part.text}
                </Text>
              );
            } else {
              // Regular clickable word
              return (
                <Text
                  key={`word-${index}-${part.text}`}
                  style={styles.clickableWord}
                  onPress={() => handleWordPress(part.text)}>
                  {part.text}
                </Text>
              );
            }
          } else {
            if (highlight) {
              // Non-word part within a highlight
              return (
                <Text
                  key={`nonword-${index}-${part.text.length}`}
                  style={[
                    styles.normalText,
                    styles.grammarHighlight,
                    highlight.type === 'idiom' && styles.idiomHighlight,
                    highlight.type === 'phrase' && styles.phraseHighlight,
                  ]}
                  onPress={() => {
                    setSelectedGrammarHighlight(highlight);
                    setShowGrammarModal(true);
                  }}>
                  {part.text}
                </Text>
              );
            } else {
              // Regular non-word
              return (
                <Text
                  key={`nonword-${index}-${part.text.length}`}
                  style={styles.normalText}>
                  {part.text}
                </Text>
              );
            }
          }
        })}
      </Text>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.timerText}>{formatDuration(elapsedTime)}</Text>
        <TouchableOpacity onPress={handleEndSession} style={styles.endButton}>
          <Text style={styles.endButtonText}>End Session</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
        contentContainerStyle={styles.messagesContent}>
        {messages.map(message => (
          <View
            key={message.id}
            style={[
              styles.messageRow,
              message.role === 'user' ? styles.userRow : styles.assistantRow,
            ]}>
            <View
              style={[
                styles.messageBubble,
                message.role === 'user'
                  ? styles.userBubble
                  : styles.assistantBubble,
              ]}>
              {message.role === 'assistant' ? (
                <>
                  <View style={styles.clickableTextContainer}>
                    {renderClickableWords(message)}
                  </View>
                  {showTranslation && message.translation && (
                    <Text style={styles.translationText}>
                      💬 {message.translation}
                    </Text>
                  )}
                  {showPronunciation && message.pronunciation && (
                    <Text style={styles.pronunciationText}>
                      🔊 {message.pronunciation}
                    </Text>
                  )}
                </>
              ) : (
                <Text style={[styles.messageText, styles.userText]}>
                  {message.content}
                </Text>
              )}
            </View>
          </View>
        ))}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3b82f6" />
          </View>
        )}
      </ScrollView>

      <View style={styles.controls}>
        {textOnlyMode ? (
          <View style={styles.textInputContainer}>
            <TextInput
              style={[styles.textInput, {color: '#1f2937'}]}
              value={userInputText}
              onChangeText={setUserInputText}
              placeholder="Type your message..."
              placeholderTextColor="#9ca3af"
              multiline
              maxLength={500}
              onSubmitEditing={handleSendTextMessage}
              editable={!isLoading && !isSpeaking}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!userInputText.trim() || isLoading || isSpeaking) &&
                  styles.sendButtonDisabled,
              ]}
              onPress={handleSendTextMessage}
              disabled={!userInputText.trim() || isLoading || isSpeaking}>
              <Text style={styles.sendButtonText}>📤</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Pressable
            style={[styles.micButton, isListening && styles.micButtonActive]}
            onPress={handleToggleListening}
            disabled={isLoading || isSpeaking}
            // @ts-ignore - onContextMenu is a web-only prop
            onContextMenu={(e: React.MouseEvent<HTMLElement>) =>
              e.preventDefault()
            }>
            <Text style={styles.micIcon}>{isListening ? '⏸️' : '🎤'}</Text>
            <Text style={styles.micText}>
              {isListening ? 'Tap to Stop' : 'Tap to Speak'}
            </Text>
          </Pressable>
        )}

        {isSpeaking && (
          <View style={styles.speakingIndicator}>
            <Text style={styles.speakingText}>🔊 AI Speaking...</Text>
          </View>
        )}

        {/* Voice Method Indicator */}
        {voiceMethod && (
          <View style={styles.voiceMethodIndicator}>
            <Text style={styles.voiceMethodIndicatorLabel}>🎙️ 음성 재생:</Text>
            <Text style={styles.voiceMethodIndicatorText}>{voiceMethod}</Text>
          </View>
        )}

        {/* 2 Response Test Options - User can select one to practice */}
        {showSamples && enrichedSampleAnswers.length > 0 && (
          <View style={styles.samplesContainer}>
            <Text style={styles.samplesTitle}>
              💡 Response Options (Choose one to practice):
            </Text>
            <ScrollView style={styles.samplesScrollView}>
              {enrichedSampleAnswers.map((sample, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.sampleButton}
                  onPress={() => handleUseSample(sample)}>
                  <View style={styles.sampleButtonContent}>
                    <Text style={styles.sampleNumber}>{index + 1}</Text>
                    <View style={styles.sampleTextContainer}>
                      <Text style={styles.sampleText}>{sample.text}</Text>
                      {showTranslation && sample.translation && (
                        <Text style={styles.sampleTranslationText}>
                          💬 {sample.translation}
                        </Text>
                      )}
                      {showPronunciation && sample.pronunciation && (
                        <Text style={styles.samplePronunciationText}>
                          🔊 {sample.pronunciation}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={() => setShowSamples(false)}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Word Definition Modal (feat 3) */}
      <Modal
        visible={showDefinitionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDefinitionModal(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowDefinitionModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedWord || 'Word Definition'}
            </Text>
            {wordDefinition ? (
              <>
                <Text style={styles.definitionText}>
                  {wordDefinition.definition}
                </Text>
                {wordDefinition.examples.length > 0 && (
                  <>
                    <Text style={styles.examplesTitle}>Examples:</Text>
                    {wordDefinition.examples.map((example, index) => (
                      <Text key={index} style={styles.exampleText}>
                        • {example}
                      </Text>
                    ))}
                  </>
                )}
                <Text style={styles.addedToVocabText}>
                  ✓ Added to vocabulary list
                </Text>
              </>
            ) : (
              <ActivityIndicator size="large" color="#3b82f6" />
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDefinitionModal(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Grammar/Idiom Modal */}
      <Modal
        visible={showGrammarModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGrammarModal(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowGrammarModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedGrammarHighlight?.text || 'Grammar Pattern'}
            </Text>
            {selectedGrammarHighlight && (
              <>
                <View style={styles.grammarTypeBadge}>
                  <Text style={styles.grammarTypeText}>
                    {selectedGrammarHighlight.type.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.definitionText}>
                  {selectedGrammarHighlight.explanation}
                </Text>
                {selectedGrammarHighlight.examples &&
                  selectedGrammarHighlight.examples.length > 0 && (
                    <>
                      <Text style={styles.examplesTitle}>Examples:</Text>
                      {selectedGrammarHighlight.examples.map(
                        (example, index) => (
                          <Text key={index} style={styles.exampleText}>
                            • {example}
                          </Text>
                        ),
                      )}
                    </>
                  )}
              </>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowGrammarModal(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Voice Display Modal - Shows selected response text in large format during playback */}
      <Modal
        visible={showVoiceDisplayModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowVoiceDisplayModal(false)}>
        <View style={styles.voiceDisplayOverlay}>
          <View style={styles.voiceDisplayContent}>
            <Text style={styles.voiceDisplayTitle}>🔊 음성 재생 중</Text>
            <Text style={styles.voiceDisplayText}>{voiceDisplayText}</Text>

            {/* Display translation if available */}
            {showTranslation && voiceDisplayTranslation && (
              <Text style={styles.voiceDisplayTranslation}>
                💬 {voiceDisplayTranslation}
              </Text>
            )}

            {/* Display pronunciation if available */}
            {showPronunciation && voiceDisplayPronunciation && (
              <Text style={styles.voiceDisplayPronunciation}>
                🔊 {voiceDisplayPronunciation}
              </Text>
            )}

            {/* Voice method display - matching token usage display style */}
            <View style={styles.voiceMethodDisplayContainer}>
              <Text style={styles.voiceMethodDisplayLabel}>
                🎙️ 음성 재생 모델:
              </Text>
              <Text style={styles.voiceMethodDisplayText}>{voiceMethod}</Text>
            </View>

            <TouchableOpacity
              style={styles.voiceDisplayCloseButton}
              onPress={() => setShowVoiceDisplayModal(false)}>
              <Text style={styles.voiceDisplayCloseText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  endButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  endButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  messagesContainer: {
    flex: 1,
    flexShrink: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageRow: {
    marginBottom: 12,
  },
  userRow: {
    alignItems: 'flex-end',
  },
  assistantRow: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#3b82f6',
  },
  assistantBubble: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#ffffff',
  },
  assistantText: {
    color: '#1f2937',
  },
  clickableTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  clickableWord: {
    color: '#3b82f6',
  },
  normalText: {
    color: '#1f2937',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  controls: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexShrink: 0,
  },
  micButton: {
    backgroundColor: '#3b82f6',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  micButtonActive: {
    backgroundColor: '#ef4444',
  },
  micIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  micText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  speakingIndicator: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    alignItems: 'center',
  },
  speakingText: {
    fontSize: 14,
    color: '#3b82f6',
  },
  voiceMethodIndicator: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  voiceMethodIndicatorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
    marginBottom: 4,
  },
  voiceMethodIndicatorText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#166534',
  },
  samplesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    maxHeight: 250,
  },
  samplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  samplesScrollView: {
    maxHeight: 180,
  },
  sampleButton: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  sampleButtonContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sampleNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3b82f6',
    marginRight: 8,
    minWidth: 20,
  },
  sampleTextContainer: {
    flex: 1,
  },
  sampleText: {
    fontSize: 14,
    color: '#1f2937',
  },
  sampleTranslationText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 16,
  },
  samplePronunciationText: {
    fontSize: 12,
    color: '#8b5cf6',
    fontStyle: 'italic',
    marginTop: 2,
    lineHeight: 16,
  },
  dismissButton: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  dismissText: {
    fontSize: 12,
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  definitionText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
    lineHeight: 24,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 6,
    lineHeight: 20,
  },
  addedToVocabText: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 12,
    fontStyle: 'italic',
  },
  closeButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  translationText: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 18,
  },
  pronunciationText: {
    fontSize: 13,
    color: '#8b5cf6',
    fontStyle: 'italic',
    marginTop: 6,
    lineHeight: 18,
  },
  grammarHighlight: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    fontWeight: '600',
  },
  idiomHighlight: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  phraseHighlight: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  grammarTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  grammarTypeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  voiceDisplayOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  voiceDisplayContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    width: '90%',
    maxWidth: 600,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  voiceDisplayTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3b82f6',
    marginBottom: 24,
    textAlign: 'center',
  },
  voiceDisplayText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 16,
  },
  voiceDisplayTranslation: {
    fontSize: 16,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  voiceDisplayPronunciation: {
    fontSize: 16,
    color: '#8b5cf6',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  voiceMethodDisplayContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#86efac',
    width: '100%',
  },
  voiceMethodDisplayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
    marginBottom: 6,
    textAlign: 'center',
  },
  voiceMethodDisplayText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
    textAlign: 'center',
  },
  voiceDisplayCloseButton: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  voiceDisplayCloseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 48,
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 24,
  },
});

export default ConversationScreen;
