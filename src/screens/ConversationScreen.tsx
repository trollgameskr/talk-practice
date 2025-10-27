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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import {STORAGE_KEYS, VoicePersonality} from '../config/gemini.config';
import {getTargetLanguage, getCurrentLanguage} from '../config/i18n.config';

const storageService = new StorageService();

const ConversationScreen = ({route, navigation}: any) => {
  const {topic} = route.params as {topic: ConversationTopic};

  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStartTime] = useState(new Date());
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

  const geminiService = useRef<GeminiService | null>(null);
  const voiceService = useRef<VoiceService | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionSavedRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef(generateId());

  useEffect(() => {
    initializeServices();
    startTimer();

    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeServices = async () => {
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
      const sentenceLength = (sentenceLengthPref as any) || 'medium';

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

      // Load voice accent preferences
      const aiVoiceAccentPref = await AsyncStorage.getItem(
        STORAGE_KEYS.AI_VOICE_ACCENT,
      );
      const aiVoiceAccent = aiVoiceAccentPref || 'en-US';

      // Load voice personality preferences
      const aiVoicePersonalityPref = await AsyncStorage.getItem(
        STORAGE_KEYS.AI_VOICE_PERSONALITY,
      );
      const aiVoicePersonality =
        (aiVoicePersonalityPref as VoicePersonality) || 'cheerful_female';

      // Response voice accent and personality will be loaded when needed (handleUseSample)

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

      // Initialize Voice service with accent and personality
      voiceService.current = new VoiceService(
        undefined,
        aiVoiceAccent,
        aiVoicePersonality,
      );

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

      // Speak the starter message
      if (voiceService.current) {
        await voiceService.current.speak(starterMessage);
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

      // Speak the response only if shouldSpeak is true
      if (shouldSpeak && voiceService.current) {
        setIsSpeaking(true);
        await voiceService.current.speak(response);
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

  const handleUseSample = async (sample: string) => {
    setShowSamples(false);

    // If auto-read is enabled, temporarily switch to response voice accent and personality
    if (autoReadResponse && voiceService.current) {
      try {
        const responseVoiceAccentPref = await AsyncStorage.getItem(
          STORAGE_KEYS.RESPONSE_VOICE_ACCENT,
        );
        const responseVoiceAccent = responseVoiceAccentPref || 'en-US';

        const responseVoicePersonalityPref = await AsyncStorage.getItem(
          STORAGE_KEYS.RESPONSE_VOICE_PERSONALITY,
        );
        const responseVoicePersonality =
          (responseVoicePersonalityPref as VoicePersonality) ||
          'cheerful_female';

        voiceService.current.setVoiceAccent(responseVoiceAccent);
        voiceService.current.setVoicePersonality(responseVoicePersonality);

        await handleUserMessage(sample, autoReadResponse);

        // Restore AI voice accent and personality
        const aiVoiceAccentPref = await AsyncStorage.getItem(
          STORAGE_KEYS.AI_VOICE_ACCENT,
        );
        const aiVoiceAccent = aiVoiceAccentPref || 'en-US';

        const aiVoicePersonalityPref = await AsyncStorage.getItem(
          STORAGE_KEYS.AI_VOICE_PERSONALITY,
        );
        const aiVoicePersonality =
          (aiVoicePersonalityPref as VoicePersonality) || 'cheerful_female';

        voiceService.current.setVoiceAccent(aiVoiceAccent);
        voiceService.current.setVoicePersonality(aiVoicePersonality);
      } catch (error) {
        console.error('Error switching voice accent/personality:', error);
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
      if (/[a-zA-Z'-]/.test(char)) {
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

        {isSpeaking && (
          <View style={styles.speakingIndicator}>
            <Text style={styles.speakingText}>🔊 AI Speaking...</Text>
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
                  onPress={() => handleUseSample(sample.text)}>
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
});

export default ConversationScreen;
