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

const storageService = new StorageService();

const ConversationScreen = ({route, navigation}: any) => {
  const {topic} = route.params as {topic: ConversationTopic};

  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStartTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sampleAnswers, setSampleAnswers] = useState<string[]>([]);
  const [showSamples, setShowSamples] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordDefinition, setWordDefinition] = useState<{
    definition: string;
    examples: string[];
  } | null>(null);
  const [showDefinitionModal, setShowDefinitionModal] = useState(false);
  const [showWordInputModal, setShowWordInputModal] = useState(false);
  const [wordInput, setWordInput] = useState('');

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

      // Initialize Gemini service
      geminiService.current = new GeminiService('');

      // Initialize Voice service
      voiceService.current = new VoiceService();

      // Start conversation
      const starterMessage = await geminiService.current.startConversation(
        topic,
      );

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: starterMessage,
        timestamp: new Date(),
      };

      setMessages([assistantMessage]);

      // Generate 2 sample answer options for the user
      await generateSampleAnswers(starterMessage);

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

  const handleStartListening = async () => {
    if (!voiceService.current) {
      return;
    }

    try {
      setIsListening(true);
      await voiceService.current.startListening(
        async text => {
          setIsListening(false);
          await handleUserMessage(text);
        },
        error => {
          console.error('Voice error:', error);
          setIsListening(false);
          Alert.alert('Error', 'Voice recognition failed. Please try again.');
        },
      );
    } catch (error) {
      console.error('Error starting listening:', error);
      setIsListening(false);
    }
  };

  const handleStopListening = async () => {
    if (!voiceService.current) {
      return;
    }

    try {
      await voiceService.current.stopListening();
      setIsListening(false);

      // Start silence timer for auto-response (feat 1)
      startSilenceTimer();
    } catch (error) {
      console.error('Error stopping listening:', error);
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

  const handleUserMessage = async (text: string) => {
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

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Generate 2 sample answer options for user to practice with
      await generateSampleAnswers(response);

      // Speak the response
      if (voiceService.current) {
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

  const generateSampleAnswers = async (aiMessage: string) => {
    if (!geminiService.current) {
      return;
    }

    try {
      const samples = await geminiService.current.generateSampleAnswers(
        aiMessage,
        2,
      );
      setSampleAnswers(samples);
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
        definition: 'Unable to load definition',
        examples: [],
      });
    }
  };

  const handleUseSample = async (sample: string) => {
    setShowSamples(false);
    await handleUserMessage(sample);
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
                <Text
                  style={[styles.messageText, styles.assistantText]}
                  onPress={() => {
                    // Show cross-platform word input modal
                    setWordInput('');
                    setShowWordInputModal(true);
                  }}>
                  {message.content}
                </Text>
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
        <TouchableOpacity
          style={[styles.micButton, isListening && styles.micButtonActive]}
          onPress={isListening ? handleStopListening : handleStartListening}
          disabled={isLoading || isSpeaking}>
          <Text style={styles.micIcon}>{isListening ? '⏸️' : '🎤'}</Text>
          <Text style={styles.micText}>{isListening ? 'Stop' : 'Speak'}</Text>
        </TouchableOpacity>

        {isSpeaking && (
          <View style={styles.speakingIndicator}>
            <Text style={styles.speakingText}>🔊 AI Speaking...</Text>
          </View>
        )}

        {/* 2 Response Test Options - User can select one to practice */}
        {showSamples && sampleAnswers.length > 0 && (
          <View style={styles.samplesContainer}>
            <Text style={styles.samplesTitle}>💡 Response Options (Choose one to practice):</Text>
            {sampleAnswers.map((sample, index) => (
              <TouchableOpacity
                key={index}
                style={styles.sampleButton}
                onPress={() => handleUseSample(sample)}>
                <View style={styles.sampleButtonContent}>
                  <Text style={styles.sampleNumber}>{index + 1}</Text>
                  <Text style={styles.sampleText}>{sample}</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={() => setShowSamples(false)}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Word Input Modal (cross-platform) */}
      <Modal
        visible={showWordInputModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowWordInputModal(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowWordInputModal(false)}>
          <Pressable style={styles.modalContent}>
            <Text style={styles.modalTitle}>Look up a word</Text>
            <Text style={styles.inputLabel}>
              Enter a word or phrase to look up:
            </Text>
            <TextInput
              style={styles.wordInput}
              value={wordInput}
              onChangeText={setWordInput}
              placeholder="Type a word..."
              autoFocus={true}
              onSubmitEditing={() => {
                if (wordInput.trim()) {
                  setShowWordInputModal(false);
                  handleWordPress(wordInput.trim());
                }
              }}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowWordInputModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.lookupButton]}
                onPress={() => {
                  if (wordInput.trim()) {
                    setShowWordInputModal(false);
                    handleWordPress(wordInput.trim());
                  }
                }}>
                <Text style={styles.lookupButtonText}>Look Up</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

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
  },
  messagesContent: {
    padding: 16,
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  controls: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
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
  },
  samplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
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
  sampleText: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
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
  inputLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  wordInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  lookupButton: {
    backgroundColor: '#3b82f6',
  },
  lookupButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ConversationScreen;
