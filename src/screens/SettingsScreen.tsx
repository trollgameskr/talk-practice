/**
 * Settings Screen
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StorageService from '../services/StorageService';
import FirebaseService from '../services/FirebaseService';
import {isValidApiKey, openURL} from '../utils/helpers';
import {BUILD_INFO} from '../config/buildInfo';
import {GUEST_MODE_KEY} from './LoginScreen';
import {
  SentenceLength,
  SENTENCE_LENGTH_CONFIG,
  STORAGE_KEYS,
} from '../config/gemini.config';

const storageService = new StorageService();
const firebaseService = new FirebaseService();
const GEMINI_API_KEY_URL = 'https://makersuite.google.com/app/apikey';

const SettingsScreen = () => {
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [sentenceLength, setSentenceLength] =
    useState<SentenceLength>('medium');

  useEffect(() => {
    loadApiKey();
    loadUserInfo();
    loadSentenceLength();
  }, []);

  const loadUserInfo = async () => {
    const guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
    setIsGuestMode(guestMode === 'true');

    const user = firebaseService.getCurrentUser();
    if (user) {
      setUserEmail(user.email);
    }
  };

  const loadApiKey = async () => {
    try {
      const savedKey = await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
      if (savedKey) {
        setApiKey(savedKey);
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  };

  const loadSentenceLength = async () => {
    try {
      const savedLength = await AsyncStorage.getItem(
        STORAGE_KEYS.SENTENCE_LENGTH,
      );
      if (savedLength) {
        setSentenceLength(savedLength as SentenceLength);
      }
    } catch (error) {
      console.error('Error loading sentence length:', error);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter an API key');
      return;
    }

    if (!isValidApiKey(apiKey)) {
      Alert.alert(
        'Invalid API Key',
        'The API key format appears to be invalid. Please check and try again.',
      );
      return;
    }

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
      Alert.alert('Success', 'API key saved successfully!');
    } catch (error) {
      console.error('Error saving API key:', error);
      Alert.alert('Error', 'Failed to save API key');
    }
  };

  const handleSentenceLengthChange = async (length: SentenceLength) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SENTENCE_LENGTH, length);
      setSentenceLength(length);
      Alert.alert('Success', 'Sentence length preference saved!');
    } catch (error) {
      console.error('Error saving sentence length:', error);
      Alert.alert('Error', 'Failed to save sentence length preference');
    }
  };

  const handleGetApiKey = async () => {
    await openURL(GEMINI_API_KEY_URL);
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your conversation history and progress. This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.clearAllData();
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ],
    );
  };

  const handleExportData = async () => {
    try {
      const data = await storageService.exportData();
      // In a real app, you'd implement file saving or sharing here
      Alert.alert(
        'Export Data',
        'Data exported successfully!\n\nIn a production app, this would save to a file or share via email.',
      );
      console.log('Exported data:', data);
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await firebaseService.logout();
            Alert.alert('Success', 'Logged out successfully');
          } catch (error) {
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]);
  };

  const handleExitGuestMode = () => {
    Alert.alert(
      'Exit Guest Mode',
      'Would you like to create an account to save your data in the cloud?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Exit Guest Mode',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(GUEST_MODE_KEY);
              Alert.alert(
                'Guest Mode Exited',
                'You will need to restart the app to sign in or create an account.',
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to exit guest mode');
            }
          },
        },
      ],
    );
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Unknown';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {isGuestMode && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Guest Mode</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>Using as Guest</Text>
            </View>
            <View style={styles.guestInfoBox}>
              <Text style={styles.guestInfoText}>
                ℹ️ You are using the app in guest mode. Your data is saved
                locally on this device only.
              </Text>
              <Text style={styles.guestInfoText}>
                💡 Create an account to sync your data across devices and keep
                it safe in the cloud.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.secondaryButton, styles.dangerButton]}
              onPress={handleExitGuestMode}>
              <Text style={[styles.secondaryButtonText, styles.dangerText]}>
                🚪 Exit Guest Mode
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {userEmail && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Logged in as</Text>
              <Text style={styles.infoValue}>{userEmail}</Text>
            </View>
            <TouchableOpacity
              style={[styles.secondaryButton, styles.dangerButton]}
              onPress={handleLogout}>
              <Text style={[styles.secondaryButtonText, styles.dangerText]}>
                🚪 Logout
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Configuration</Text>
          <Text style={styles.sectionDescription}>
            Enter your Gemini API key to enable conversation features
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Gemini API Key</Text>
            <TextInput
              style={styles.input}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="Enter your Gemini API key"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!isApiKeyVisible}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setIsApiKeyVisible(!isApiKeyVisible)}>
              <Text style={styles.toggleButtonText}>
                {isApiKeyVisible ? '👁️ Hide' : '👁️‍🗨️ Show'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSaveApiKey}>
            <Text style={styles.primaryButtonText}>Save API Key</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGetApiKey}>
            <Text style={styles.secondaryButtonText}>
              🔑 Get API Key from Google AI Studio
            </Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ℹ️ Don't have an API key? Click the button above to get one from
              Google AI Studio (free with usage limits)
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗣️ Conversation Settings</Text>
          <Text style={styles.sectionDescription}>
            Adjust the length of AI responses and suggested user responses
          </Text>

          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>Response Length</Text>
            {(Object.keys(SENTENCE_LENGTH_CONFIG) as SentenceLength[]).map(
              length => (
                <TouchableOpacity
                  key={length}
                  style={[
                    styles.optionButton,
                    sentenceLength === length && styles.optionButtonActive,
                  ]}
                  onPress={() => handleSentenceLengthChange(length)}>
                  <View style={styles.optionContent}>
                    <View style={styles.optionHeader}>
                      <Text
                        style={[
                          styles.optionTitle,
                          sentenceLength === length && styles.optionTitleActive,
                        ]}>
                        {SENTENCE_LENGTH_CONFIG[length].label}
                      </Text>
                      {sentenceLength === length && (
                        <Text style={styles.checkMark}>✓</Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.optionDescription,
                        sentenceLength === length &&
                          styles.optionDescriptionActive,
                      ]}>
                      {SENTENCE_LENGTH_CONFIG[length].description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ),
            )}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Shorter responses are easier to follow and respond to, making
              practice more engaging. Longer responses provide more context and
              detail.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleExportData}>
            <Text style={styles.secondaryButtonText}>📤 Export Data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, styles.dangerButton]}
            onPress={handleClearData}>
            <Text style={[styles.secondaryButtonText, styles.dangerText]}>
              🗑️ Clear All Data
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Name</Text>
            <Text style={styles.infoValue}>GeminiTalk</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Modified</Text>
            <Text style={styles.infoValue}>
              {formatDate(BUILD_INFO.timestamp)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Description</Text>
            <Text style={styles.infoValue}>
              Real-time English Conversation Coach
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 GeminiTalk - Powered by Gemini Live API
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
  },
  toggleButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#3b82f6',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '500',
  },
  dangerButton: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  dangerText: {
    color: '#dc2626',
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  infoText: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  guestInfoBox: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
    marginBottom: 12,
  },
  guestInfoText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
    marginBottom: 8,
  },
  optionGroup: {
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  optionButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
  },
  optionButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  optionContent: {
    flex: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  optionTitleActive: {
    color: '#3b82f6',
  },
  optionDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  optionDescriptionActive: {
    color: '#1e40af',
  },
  checkMark: {
    fontSize: 18,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
