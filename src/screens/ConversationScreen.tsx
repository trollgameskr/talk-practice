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
} from 'react-native';
import {ConversationTopic, Message, ConversationSession} from '../types';
import GeminiService from '../services/GeminiService';
import VoiceService from '../services/VoiceService';
import StorageService from '../services/StorageService';
import {generateId, formatDuration} from '../utils/helpers';
import {CONVERSATION_CONFIG} from '../config/gemini.config';

const storageService = new StorageService();

const ConversationScreen = ({route, navigation}: any) => {
  const {topic} = route.params as {topic: ConversationTopic};
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStartTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const geminiService = useRef<GeminiService | null>(null);
  const voiceService = useRef<VoiceService | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeServices();
    startTimer();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeServices = async () => {
    try {
      setIsLoading(true);
      
      // Initialize Gemini service
      geminiService.current = new GeminiService('');
      
      // Initialize Voice service
      voiceService.current = new VoiceService();
      
      // Start conversation
      const starterMessage = await geminiService.current.startConversation(topic);
      
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: starterMessage,
        timestamp: new Date(),
      };
      
      setMessages([assistantMessage]);
      
      // Speak the starter message
      if (voiceService.current) {
        await voiceService.current.speak(starterMessage);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing services:', error);
      Alert.alert('Error', 'Failed to initialize conversation. Please check your API key in Settings.');
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
    
    if (geminiService.current) {
      geminiService.current.endConversation();
    }
    
    if (voiceService.current) {
      await voiceService.current.destroy();
    }
    
    // Save session
    if (messages.length > 0) {
      await saveSession();
    }
  };

  const handleStartListening = async () => {
    if (!voiceService.current) return;
    
    try {
      setIsListening(true);
      await voiceService.current.startListening(
        async (text) => {
          setIsListening(false);
          await handleUserMessage(text);
        },
        (error) => {
          console.error('Voice error:', error);
          setIsListening(false);
          Alert.alert('Error', 'Voice recognition failed. Please try again.');
        }
      );
    } catch (error) {
      console.error('Error starting listening:', error);
      setIsListening(false);
    }
  };

  const handleStopListening = async () => {
    if (!voiceService.current) return;
    
    try {
      await voiceService.current.stopListening();
      setIsListening(false);
    } catch (error) {
      console.error('Error stopping listening:', error);
    }
  };

  const handleUserMessage = async (text: string) => {
    if (!text.trim() || !geminiService.current) return;
    
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
            await saveSession();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const saveSession = async () => {
    if (messages.length === 0) return;
    
    try {
      // Get feedback for the session
      let feedback;
      if (geminiService.current && messages.length > 2) {
        const userMessages = messages
          .filter(m => m.role === 'user')
          .map(m => m.content)
          .join(' ');
        feedback = await geminiService.current.analyzeFeedback(userMessages);
      }
      
      // Get token usage
      const tokenUsage = geminiService.current?.getSessionTokenUsage();
      
      const session: ConversationSession = {
        id: generateId(),
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
        {messages.map((message) => (
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
              <Text
                style={[
                  styles.messageText,
                  message.role === 'user'
                    ? styles.userText
                    : styles.assistantText,
                ]}>
                {message.content}
              </Text>
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
          style={[
            styles.micButton,
            isListening && styles.micButtonActive,
          ]}
          onPress={isListening ? handleStopListening : handleStartListening}
          disabled={isLoading || isSpeaking}>
          <Text style={styles.micIcon}>
            {isListening ? '⏸️' : '🎤'}
          </Text>
          <Text style={styles.micText}>
            {isListening ? 'Stop' : 'Speak'}
          </Text>
        </TouchableOpacity>

        {isSpeaking && (
          <View style={styles.speakingIndicator}>
            <Text style={styles.speakingText}>🔊 AI Speaking...</Text>
          </View>
        )}
      </View>
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
});

export default ConversationScreen;
