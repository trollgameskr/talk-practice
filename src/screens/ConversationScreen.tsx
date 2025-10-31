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
  CJKCharacterBreakdown,
} from '../types';
import GeminiService from '../services/GeminiService';
import VoiceService from '../services/VoiceService';
import StorageService from '../services/StorageService';
import LogCaptureService from '../services/LogCaptureService';
import SessionInfoModal from '../components/SessionInfoModal';
import {generateId, formatDuration, openURL} from '../utils/helpers';
import {STORAGE_KEYS, CONVERSATION_CONFIG} from '../config/gemini.config';
import {getTargetLanguage, getCurrentLanguage} from '../config/i18n.config';

const storageService = new StorageService();

// Maximum number of cached CJK breakdowns to prevent memory issues
const MAX_CJK_CACHE_SIZE = 50;

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
  const [cjkCharacterBreakdown, setCjkCharacterBreakdown] = useState<
    CJKCharacterBreakdown[]
  >([]);
  const [showCJKBreakdownModal, setShowCJKBreakdownModal] = useState(false);
  const [selectedSentenceForBreakdown, setSelectedSentenceForBreakdown] =
    useState<string>('');
  const [cjkBreakdownCache, setCjkBreakdownCache] = useState<
    Record<string, CJKCharacterBreakdown[]>
  >({});
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
  const [initializationStatus, setInitializationStatus] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [showSessionInfoModal, setShowSessionInfoModal] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<string>('en');
  const [maxSessionDuration, setMaxSessionDuration] = useState(CONVERSATION_CONFIG.maxDuration);

  const geminiService = useRef<GeminiService | null>(null);
  const voiceService = useRef<VoiceService | null>(null);
  const logCaptureService = useRef<LogCaptureService | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionSavedRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef(generateId());
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate progress percentage
  const progressPercentage = Math.round(
    (elapsedTime / maxSessionDuration) * 100,
  );
  const isTimeUp = elapsedTime >= maxSessionDuration;
  const remainingTimeText = isTimeUp
    ? 'Time limit reached'
    : `${formatDuration(maxSessionDuration - elapsedTime)} remaining`;

  useEffect(() => {
    // Initialize log capture service
    logCaptureService.current = new LogCaptureService();
    logCaptureService.current.startCapture();

    // Load session duration preference
    loadSessionDuration();

    // Start new session directly without checking for saved session
    initializeServices();
    startTimer();

    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle navigation back button to end session
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      // Prevent default behavior if session has messages
      if (messages.length > 0 && !sessionSavedRef.current) {
        e.preventDefault();
        
        // Prompt user to confirm
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
                // Unblock and navigate
                navigation.dispatch(e.data.action);
              },
            },
          ],
        );
      }
    });

    return unsubscribe;
  }, [navigation, messages]);

  // Listen for header button press to open session info modal
  useEffect(() => {
    if (route.params?.openSessionInfoTrigger) {
      setShowSessionInfoModal(true);
    }
  }, [route.params?.openSessionInfoTrigger]);

  /**
   * Load session duration preference
   */
  const loadSessionDuration = async () => {
    try {
      const savedValue = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_DURATION);
      if (savedValue) {
        const duration = parseInt(savedValue, 10);
        if (!isNaN(duration) && duration > 0) {
          setMaxSessionDuration(duration);
        }
      }
    } catch (error) {
      console.error('Error loading session duration:', error);
    }
  };

  /**
   * Helper function to handle TTS errors consistently
   */
  const handleTTSError = (speechError: any) => {
    // Check if this is a TTS_API_NOT_ENABLED error (Feature 3)
    const error = speechError as any;
    if (error.message === 'TTS_API_NOT_ENABLED' && error.isServiceDisabled) {
      // Extract project ID from error data if available
      let projectId = '';
      let activationUrl = '';

      if (error.errorData?.error?.details) {
        const details = error.errorData.error.details.find((d: any) =>
          d['@type']?.includes('ErrorInfo'),
        );
        if (details?.metadata?.consumer) {
          projectId = details.metadata.consumer.replace('projects/', '');
        }
        if (details?.metadata?.activationUrl) {
          activationUrl = details.metadata.activationUrl;
        }
      }

      // Build console URL
      const consoleUrl =
        activationUrl ||
        `https://console.developers.google.com/apis/api/texttospeech.googleapis.com/overview?project=${projectId}`;

      // Show specific error for TTS API not enabled
      Alert.alert(
        t('conversation.errors.ttsApiNotEnabled.title'),
        t('conversation.errors.ttsApiNotEnabled.message'),
        [
          {
            text: t('conversation.errors.ttsApiNotEnabled.continue'),
            style: 'cancel',
          },
          {
            text: t('conversation.errors.ttsApiNotEnabled.openConsole'),
            onPress: async () => {
              if (consoleUrl) {
                await openURL(consoleUrl);
              }
            },
          },
          {
            text: t('conversation.errors.ttsApiNotEnabled.usDeviceTTS'),
            onPress: () => navigation.navigate('Settings'),
          },
        ],
      );
    } else {
      // Show generic error message for other errors
      Alert.alert(
        t('conversation.errors.aiSpeechFailed.title'),
        t('conversation.errors.aiSpeechFailed.message'),
        [
          {
            text: t('conversation.errors.aiSpeechFailed.continue'),
            style: 'cancel',
          },
          {
            text: t('conversation.errors.aiSpeechFailed.goToSettings'),
            onPress: () => navigation.navigate('Settings'),
          },
        ],
      );
    }
  };

  const initializeServices = async () => {
    try {
      setIsLoading(true);
      setIsInitializing(true);
      setInitializationStatus(
        t('conversation.initialization.checkingApiKey', {
          defaultValue: 'Checking API key...',
        }),
      );
      console.log('[ConversationScreen] Starting service initialization');

      // Set up initialization timeout (20 seconds)
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      initTimeoutRef.current = setTimeout(() => {
        console.error(
          '[ConversationScreen] Initialization timeout after 20 seconds',
        );
        setIsLoading(false);
        setIsInitializing(false);
        Alert.alert(
          t('conversation.errors.initTimeout.title', {
            defaultValue: 'Initialization Timeout',
          }),
          t('conversation.errors.initTimeout.message', {
            defaultValue:
              'The conversation failed to start within 20 seconds. This may be due to a slow network connection or API issues. Please check the logs and try again.',
          }),
          [
            {
              text: t('conversation.buttons.copyLogs', {
                defaultValue: 'Copy Logs',
              }),
              onPress: handleCopyLogs,
            },
            {
              text: t('conversation.errors.initTimeout.goBack', {
                defaultValue: 'Go Back',
              }),
              onPress: () => navigation.goBack(),
              style: 'cancel',
            },
            {
              text: t('conversation.errors.initTimeout.retry', {
                defaultValue: 'Retry',
              }),
              onPress: () => initializeServices(),
            },
          ],
        );
      }, 20000); // 20 second timeout

      // Load API key from storage
      const apiKey = await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
      if (!apiKey) {
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
        }
        Alert.alert(
          t('conversation.apiKeyRequired.title'),
          t('conversation.apiKeyRequired.message'),
          [
            {
              text: t('conversation.apiKeyRequired.cancel'),
              onPress: () => navigation.goBack(),
              style: 'cancel',
            },
            {
              text: t('conversation.apiKeyRequired.goToSettings'),
              onPress: () => navigation.navigate('Settings'),
            },
          ],
        );
        setIsLoading(false);
        setIsInitializing(false);
        return;
      }

      setInitializationStatus(
        t('conversation.initialization.loadingPreferences', {
          defaultValue: 'Loading preferences...',
        }),
      );
      console.log('[ConversationScreen] Loading user preferences');

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

      setInitializationStatus(
        t('conversation.initialization.initializingAI', {
          defaultValue: 'Initializing AI service...',
        }),
      );
      console.log('[ConversationScreen] Initializing Gemini service');

      // Load language preferences
      const loadedTargetLanguage = await getTargetLanguage();
      const nativeLanguage = getCurrentLanguage();

      // Store target language in state for CJK breakdown feature
      setTargetLanguage(loadedTargetLanguage);

      // Initialize Gemini service with API key, sentence length, and languages
      geminiService.current = new GeminiService(
        apiKey,
        sentenceLength,
        loadedTargetLanguage,
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
      // Note: VoiceService uses the TTS proxy server instead of direct API calls
      // The proxy URL defaults to http://localhost:4000
      if (!loadedTextOnlyMode) {
        setInitializationStatus(
          t('conversation.initialization.initializingVoice', {
            defaultValue: 'Initializing voice service...',
          }),
        );
        console.log('[ConversationScreen] Initializing voice service');
        voiceService.current = new VoiceService();
        // Set the target language for TTS
        await voiceService.current.setLanguage(loadedTargetLanguage);
      }

      // Always start a new conversation
      setInitializationStatus(
        t('conversation.initialization.startingConversation', {
          defaultValue: 'Starting conversation...',
        }),
      );
      console.log(
        '[ConversationScreen] Starting new conversation with topic:',
        topic,
      );
      const starterMessage = await geminiService.current.startConversation(
        topic,
      );

      console.log(
        '[ConversationScreen] Received starter message:',
        starterMessage,
      );
      console.log(
        '[ConversationScreen] Starter message length:',
        starterMessage?.length || 0,
      );

      if (!starterMessage) {
        console.error('[ConversationScreen] Starter message is empty!');
        throw new Error('Failed to generate starter message');
      }

      let assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: starterMessage,
        timestamp: new Date(),
      };

      console.log(
        '[ConversationScreen] Created assistant message with ID:',
        assistantMessage.id,
      );

      // Enrich message with translation, pronunciation, and grammar highlights
      // Pass loaded values directly to avoid relying on state (Feature 1 fix)
      setInitializationStatus(
        t('conversation.initialization.enrichingMessage', {
          defaultValue: 'Preparing message...',
        }),
      );
      console.log('[ConversationScreen] Enriching assistant message');
      assistantMessage = await enrichAssistantMessage(assistantMessage, {
        translation: loadedShowTranslation,
        pronunciation: loadedShowPronunciation,
        grammarHighlights: loadedShowGrammarHighlights,
      });

      console.log('[ConversationScreen] Setting messages with starter message');
      setMessages([assistantMessage]);
      console.log('[ConversationScreen] Messages state updated');

      // Run sample answer generation and AI speech in parallel to reduce wait time
      const tasks = [];

      // Task 1: Generate 2 sample answer options for the user
      // Pass loaded values directly to avoid relying on state (Bug 2 fix)
      setInitializationStatus(
        t('conversation.initialization.generatingSamples', {
          defaultValue: 'Generating sample responses...',
        }),
      );
      console.log('[ConversationScreen] Generating sample answers');
      tasks.push(
        generateSampleAnswers(starterMessage, {
          translation: loadedShowTranslation,
          pronunciation: loadedShowPronunciation,
        }).then(() => {
          console.log('[ConversationScreen] Sample answers generated');
        }),
      );

      // Task 2: Speak the starter message (only if not in text-only mode)
      if (!loadedTextOnlyMode && voiceService.current) {
        setInitializationStatus(
          t('conversation.initialization.playingVoice', {
            defaultValue: 'Playing AI voice...',
          }),
        );
        tasks.push(
          voiceService.current
            .speak(starterMessage, 'ai')
            .then(() => {
              // Get the voice method that was used
              const method = voiceService.current!.getVoiceMethod();
              updateVoiceMethod(method);
              console.log(
                '[ConversationScreen] AI speech completed successfully',
              );
            })
            .catch(speechError => {
              console.error(
                '[ConversationScreen] Failed to speak starter message',
                {
                  error:
                    speechError instanceof Error
                      ? speechError.message
                      : String(speechError),
                  starterMessageLength: starterMessage.length,
                },
              );

              // Use helper function to handle TTS error
              handleTTSError(speechError);
            }),
        );
        console.log(
          '[ConversationScreen] Starting AI speech for starter message',
        );
        console.log(
          '[ConversationScreen] Starter message to speak:',
          starterMessage,
        );
      } else {
        console.log(
          '[ConversationScreen] Skipping speech - text-only mode:',
          loadedTextOnlyMode,
          'voiceService:',
          !!voiceService.current,
        );
      }

      // Wait for all tasks to complete
      await Promise.all(tasks);

      console.log('[ConversationScreen] Conversation initialization complete');

      // Clear timeout on successful initialization
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }

      setInitializationStatus('');
      setIsLoading(false);
      setIsInitializing(false);
      console.log('[ConversationScreen] Initialization completed successfully');
    } catch (error) {
      console.error('[ConversationScreen] Error initializing services:', error);

      // Clear timeout on error
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }

      setInitializationStatus('');
      setIsLoading(false);
      setIsInitializing(false);

      Alert.alert(
        'Error',
        'Failed to initialize conversation. Please check your API key in Settings and review the logs for details.',
        [
          {
            text: t('conversation.buttons.copyLogs', {
              defaultValue: 'Copy Logs',
            }),
            onPress: handleCopyLogs,
          },
          {
            text: 'Go to Settings',
            onPress: () => navigation.navigate('Settings'),
          },
          {text: 'OK', style: 'cancel'},
        ],
      );
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

    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
    }

    if (geminiService.current) {
      geminiService.current.endConversation();
    }

    if (voiceService.current) {
      await voiceService.current.destroy();
    }

    if (logCaptureService.current) {
      logCaptureService.current.stopCapture();
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

  /**
   * Update voice method without showing toast notification
   */
  const updateVoiceMethod = (method: string) => {
    setVoiceMethod(method);
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

      // Run sample answer generation and AI speech in parallel to reduce wait time
      const tasks = [];

      // Task 1: Generate 2 sample answer options for user to practice with
      tasks.push(generateSampleAnswers(response));

      // Task 2: Speak the response only if shouldSpeak is true and not in text-only mode
      if (shouldSpeak && !textOnlyMode && voiceService.current) {
        setIsSpeaking(true);
        tasks.push(
          voiceService.current
            .speak(response, 'ai')
            .then(() => {
              // Get the voice method that was used
              const method = voiceService.current!.getVoiceMethod();
              updateVoiceMethod(method);
              console.log(
                '[ConversationScreen] AI speech for response completed',
              );
            })
            .catch(speechError => {
              console.error(
                '[ConversationScreen] Failed to speak AI response',
                {
                  error:
                    speechError instanceof Error
                      ? speechError.message
                      : String(speechError),
                  responseLength: response.length,
                },
              );
              // Use helper function to handle TTS error
              handleTTSError(speechError);
            })
            .finally(() => {
              setIsSpeaking(false);
            }),
        );
      }

      // Wait for all tasks to complete
      await Promise.all(tasks);

      setIsLoading(false);
    } catch (error) {
      console.error('Error handling message:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to get response. Please try again.');
    }
  };

  const handleEndSession = async () => {
    // 세션 종료 확인 alert 표시
    Alert.alert(
      t('conversation.endSession.title'),
      t('conversation.endSession.message'),
      [
        {text: t('conversation.endSession.cancel'), style: 'cancel'},
        {
          text: t('conversation.endSession.confirm'),
          style: 'destructive',
          onPress: async () => {
            // 세션 저장
            sessionSavedRef.current = true;
            await saveSession();
            
            // 세션 종료 안내 모달 표시
            Alert.alert(
              t('conversation.sessionEnded.title'),
              t('conversation.sessionEnded.message'),
              [
                {
                  text: t('conversation.sessionEnded.goToHome'),
                  onPress: () => {
                    // 홈 화면으로 안전하게 이동 (네비게이션 스택 리셋)
                    // 세션 종료 후 뒤로 가기로 대화 화면에 돌아올 수 없도록 함
                    navigation.reset({
                      index: 0,
                      routes: [{name: 'Home'}],
                    });
                  },
                },
              ],
              {cancelable: false}, // 모달 외부 클릭으로 닫기 방지
            );
          },
        },
      ],
    );
  };

  const handleCopyLogs = async () => {
    try {
      if (!logCaptureService.current) {
        Alert.alert(
          t('conversation.copyLogs.error'),
          t('conversation.copyLogs.noLogs'),
        );
        return;
      }

      const logs = logCaptureService.current.getLogs();

      // Copy to clipboard - using a cross-platform approach
      // Type assertion for web APIs
      const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
      if (nav && nav.clipboard) {
        // Modern browsers
        await nav.clipboard.writeText(logs);
        Alert.alert(t('conversation.copyLogs.success'));
      } else if (
        typeof globalThis !== 'undefined' &&
        (globalThis as any).document
      ) {
        // Fallback for older browsers or environments without clipboard API
        // Create a temporary textarea element
        const doc = (globalThis as any).document;
        const textarea = doc.createElement('textarea');
        textarea.value = logs;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        doc.body.appendChild(textarea);
        textarea.select();
        doc.execCommand('copy');
        doc.body.removeChild(textarea);
        Alert.alert(t('conversation.copyLogs.success'));
      } else {
        // No clipboard API available
        Alert.alert(t('conversation.copyLogs.error'));
      }
    } catch (error) {
      console.error('Error copying logs:', error);
      Alert.alert(t('conversation.copyLogs.error'));
    }
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

  const handleCJKModalContentClick = (e: any) => {
    e.stopPropagation();
  };

  const handleCJKBreakdownRequest = async (sentence: string) => {
    if (!geminiService.current || !sentence.trim()) {
      return;
    }

    // Check if the target language is Chinese or Japanese
    if (targetLanguage !== 'zh' && targetLanguage !== 'ja') {
      return;
    }

    setSelectedSentenceForBreakdown(sentence);
    setShowCJKBreakdownModal(true);

    // Check if breakdown is already cached
    if (cjkBreakdownCache[sentence]) {
      setCjkCharacterBreakdown(cjkBreakdownCache[sentence]);
      return;
    }

    // Not in cache, fetch from API
    setCjkCharacterBreakdown([]); // Clear previous breakdown

    try {
      const breakdown = await geminiService.current.getCJKCharacterBreakdown(
        sentence,
      );
      setCjkCharacterBreakdown(breakdown);
      // Cache the result with LRU behavior
      setCjkBreakdownCache(prev => {
        const newCache = {...prev, [sentence]: breakdown};
        // If cache exceeds max size, remove oldest entry
        const cacheKeys = Object.keys(newCache);
        if (cacheKeys.length > MAX_CJK_CACHE_SIZE) {
          // Remove the first (oldest) key
          delete newCache[cacheKeys[0]];
        }
        return newCache;
      });
    } catch (error) {
      console.error('Error getting CJK character breakdown:', error);
      setCjkCharacterBreakdown([]);
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

        try {
          console.log(
            '[ConversationScreen] Starting user speech for sample response',
          );
          await voiceService.current.speak(sample, 'user');

          // Get the voice method that was used
          const method = voiceService.current.getVoiceMethod();
          updateVoiceMethod(method);
          console.log('[ConversationScreen] User speech for sample completed');
        } catch (speechError) {
          console.error(
            '[ConversationScreen] Failed to speak sample response',
            {
              error:
                speechError instanceof Error
                  ? speechError.message
                  : String(speechError),
              sampleLength: sample.length,
            },
          );
          // Use helper function to handle TTS error
          handleTTSError(speechError);
        } finally {
          setIsSpeaking(false);
          // Do NOT auto-close the modal - user must close it manually
        }

        // Feature 2: Do NOT start AI speech while modal is open
        // Pass false to prevent AI from speaking until modal is closed
        await handleUserMessage(sample, false);
      } catch (error) {
        console.error('[ConversationScreen] Error in handleUseSample:', error);
        setIsSpeaking(false);
        // Do NOT auto-close the modal on error - user must close it manually
        await handleUserMessage(sample, false);
      }
    } else {
      await handleUserMessage(sample, autoReadResponse);
    }
  };

  /**
   * Feature 1: Handle replaying audio for a message
   */
  const handleReplayAudio = async (message: Message) => {
    if (!voiceService.current || textOnlyMode) {
      return;
    }

    try {
      setIsSpeaking(true);
      const voiceType = message.role === 'assistant' ? 'ai' : 'user';
      await voiceService.current.replayAudio(message.content, voiceType);
      console.log('[ConversationScreen] Audio replay completed');
    } catch (error) {
      console.error('[ConversationScreen] Failed to replay audio:', error);
      Alert.alert('Error', 'Failed to replay audio. Please try again.');
    } finally {
      setIsSpeaking(false);
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
        {/* Compact progress bar */}
        <View style={styles.compactProgressBarContainer}>
          <View
            style={[
              styles.compactProgressBarFill,
              {
                width: `${Math.min(progressPercentage, 100)}%`,
                backgroundColor: isTimeUp ? '#ef4444' : '#3b82f6',
              },
            ]}
          />
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
        contentContainerStyle={styles.messagesContent}>
        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1;
          // Find the last AI message - check if this is the last message and it's from assistant
          const isLastAIMessage = isLastMessage && message.role === 'assistant';

          return (
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
                  isLastAIMessage && styles.lastAIMessageBubble,
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
                    {/* CJK Character Breakdown button and Replay button in the same row */}
                    <View style={styles.aiMessageButtonsRow}>
                      {(targetLanguage === 'zh' || targetLanguage === 'ja') && (
                        <TouchableOpacity
                          style={styles.cjkBreakdownButton}
                          onPress={() =>
                            handleCJKBreakdownRequest(message.content)
                          }>
                          <Text style={styles.cjkBreakdownButtonText}>
                            📖 {targetLanguage === 'zh' ? '汉字解析' : '漢字解析'}
                          </Text>
                        </TouchableOpacity>
                      )}
                      {/* Feature 1: Replay button for AI messages */}
                      {!textOnlyMode && (
                        <TouchableOpacity
                          style={styles.replayButton}
                          onPress={() => handleReplayAudio(message)}
                          disabled={isSpeaking}>
                          <Text style={styles.replayButtonText}>
                            {isSpeaking ? '⏸️ Playing...' : '🔊 Replay'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={[styles.messageText, styles.userText]}>
                      {message.content}
                    </Text>
                    {/* Feature 1: Replay button for user messages */}
                    {!textOnlyMode && (
                      <TouchableOpacity
                        style={styles.replayButton}
                        onPress={() => handleReplayAudio(message)}
                        disabled={isSpeaking}>
                        <Text style={styles.replayButtonText}>
                          {isSpeaking ? '⏸️ Playing...' : '🔊 Replay'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>

              {/* Feature 2: Tap to Speak button on the right of last AI message */}
              {isLastAIMessage && !textOnlyMode && !isListening && (
                <TouchableOpacity
                  style={styles.tapToSpeakIconButton}
                  onPress={handleToggleListening}
                  disabled={isLoading || isSpeaking}
                  accessibilityLabel="Tap to Speak"
                  accessibilityRole="button">
                  <Text style={styles.tapToSpeakIcon}>🎤</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3b82f6" />
            {isInitializing && initializationStatus && (
              <Text style={styles.initializationStatusText}>
                {initializationStatus}
              </Text>
            )}
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
          // Only show the main Tap to Speak button if there are no messages or if listening
          (messages.length === 0 || isListening) && (
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
          )
        )}

        {isSpeaking && (
          <View style={styles.speakingIndicator}>
            <Text style={styles.speakingText}>🔊 AI Speaking...</Text>
          </View>
        )}

        {/* 2 Response Test Options - User can select one to practice */}
        {showSamples && enrichedSampleAnswers.length > 0 && (
          <View style={styles.samplesContainer}>
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

      {/* CJK Character Breakdown Modal */}
      <Modal
        visible={showCJKBreakdownModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCJKBreakdownModal(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCJKBreakdownModal(false)}>
          <Pressable
            style={styles.cjkModalContent}
            onPress={handleCJKModalContentClick}>
            <Text style={styles.modalTitle}>
              {targetLanguage === 'zh' ? '汉字解析' : '漢字解析'}
            </Text>
            <Text style={styles.cjkOriginalSentence}>
              {selectedSentenceForBreakdown}
            </Text>
            <ScrollView style={styles.cjkBreakdownScroll}>
              {cjkCharacterBreakdown.length > 0 ? (
                cjkCharacterBreakdown.map((item, index) => (
                  <View key={index} style={styles.cjkCharacterItem}>
                    <Text style={styles.cjkCharacter}>{item.character}</Text>
                    <View style={styles.cjkCharacterDetails}>
                      <Text style={styles.cjkPronunciation}>
                        🔊 {item.pronunciation}
                      </Text>
                      {item.reading && (
                        <Text style={styles.cjkReading}>📝 {item.reading}</Text>
                      )}
                      <Text style={styles.cjkMeaning}>💬 {item.meaning}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <ActivityIndicator size="large" color="#3b82f6" />
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCJKBreakdownModal(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Session Info Modal */}
      <SessionInfoModal
        visible={showSessionInfoModal}
        onClose={() => setShowSessionInfoModal(false)}
        onEndSession={handleEndSession}
        onCopyLogs={handleCopyLogs}
        sessionDuration={elapsedTime}
        tokenUsage={geminiService.current?.getSessionTokenUsage()}
        voiceModel={voiceMethod}
        logs={logCaptureService.current?.getLogs() || ''}
      />
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 1,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  compactProgressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactProgressBarFill: {
    height: '100%',
    borderRadius: 2,
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
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userRow: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  assistantRow: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  lastAIMessageBubble: {
    maxWidth: '70%',
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
  initializationStatusText: {
    fontSize: 14,
    color: '#3b82f6',
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
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
    maxHeight: 300,
  },
  samplesScrollView: {
    maxHeight: 280,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
  cjkBreakdownButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  cjkBreakdownButtonText: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  cjkModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    height: '100%',
  },
  cjkOriginalSentence: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    textAlign: 'center',
  },
  cjkBreakdownScroll: {
    flex: 1,
  },
  cjkCharacterItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cjkCharacter: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    marginRight: 16,
    minWidth: 50,
    textAlign: 'center',
  },
  cjkCharacterDetails: {
    flex: 1,
  },
  cjkPronunciation: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '600',
    marginBottom: 4,
  },
  cjkReading: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
    marginBottom: 4,
  },
  cjkMeaning: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
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
  // AI message buttons row (CJK breakdown + Replay)
  aiMessageButtonsRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  // Feature 1: Replay button styles
  replayButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  replayButtonText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
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
  // Feature 2: Tap to Speak icon button styles
  tapToSpeakIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tapToSpeakIcon: {
    fontSize: 24,
  },
});

export default ConversationScreen;
