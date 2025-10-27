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
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
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
import {useTheme} from '../contexts/ThemeContext';
import {
  saveLanguage,
  getAvailableLanguages,
  getCurrentLanguage,
  saveTargetLanguage,
  getTargetLanguage,
  getAvailableTargetLanguages,
} from '../config/i18n.config';

const storageService = new StorageService();
const firebaseService = new FirebaseService();
const GEMINI_API_KEY_URL = 'https://makersuite.google.com/app/apikey';

const SettingsScreen = ({navigation}: any) => {
  const {theme, isDark, toggleTheme} = useTheme();
  const {t, i18n} = useTranslation();
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [sentenceLength, setSentenceLength] =
    useState<SentenceLength>('medium');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [selectedTargetLanguage, setSelectedTargetLanguage] =
    useState<string>('en');

  useEffect(() => {
    loadApiKey();
    loadUserInfo();
    loadSentenceLength();
    loadLanguage();
    loadTargetLanguage();
  }, []);

  const loadLanguage = async () => {
    const currentLang = await getCurrentLanguage();
    setSelectedLanguage(currentLang);
  };

  const loadTargetLanguage = async () => {
    const targetLang = await getTargetLanguage();
    setSelectedTargetLanguage(targetLang);
  };

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
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            🎨 Appearance
          </Text>
          <View style={styles.themeRow}>
            <View style={styles.themeInfo}>
              <Text style={[styles.themeLabel, {color: theme.colors.text}]}>
                Dark Mode
              </Text>
              <Text
                style={[
                  styles.themeDescription,
                  {color: theme.colors.textSecondary},
                ]}>
                Switch between light and dark theme
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={
                isDark
                  ? theme.colors.buttonPrimaryText
                  : theme.colors.inputBackground
              }
            />
          </View>
        </View>

        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            {t('settings.sections.language.title')}
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              {color: theme.colors.textSecondary},
            ]}>
            {t('settings.sections.language.description')}
          </Text>

          <View style={styles.optionGroup}>
            <Text style={[styles.optionLabel, {color: theme.colors.text}]}>
              {t('settings.sections.language.nativeLanguage')}
            </Text>
            {getAvailableLanguages().map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.border,
                  },
                  selectedLanguage === lang.code && {
                    ...styles.optionButtonActive,
                    borderColor: theme.colors.primary,
                    backgroundColor: theme.colors.primaryLight,
                  },
                ]}
                onPress={async () => {
                  await saveLanguage(lang.code);
                  await i18n.changeLanguage(lang.code);
                  setSelectedLanguage(lang.code);
                  Alert.alert(
                    t('common.success'),
                    t('settings.sections.language.success'),
                  );
                }}>
                <View style={styles.optionContent}>
                  <View style={styles.optionHeader}>
                    <Text
                      style={[
                        styles.optionTitle,
                        {color: theme.colors.text},
                        selectedLanguage === lang.code && {
                          ...styles.optionTitleActive,
                          color: theme.colors.primary,
                        },
                      ]}>
                      {lang.name}
                    </Text>
                    {selectedLanguage === lang.code && (
                      <Text
                        style={[
                          styles.checkMark,
                          {color: theme.colors.primary},
                        ]}>
                        ✓
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.optionGroup}>
            <Text style={[styles.optionLabel, {color: theme.colors.text}]}>
              {t('settings.sections.language.targetLanguage')}
            </Text>
            {getAvailableTargetLanguages().map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.border,
                  },
                  selectedTargetLanguage === lang.code && {
                    ...styles.optionButtonActive,
                    borderColor: theme.colors.primary,
                    backgroundColor: theme.colors.primaryLight,
                  },
                ]}
                onPress={async () => {
                  await saveTargetLanguage(lang.code);
                  setSelectedTargetLanguage(lang.code);
                  Alert.alert(
                    t('common.success'),
                    t('settings.sections.language.success'),
                  );
                }}>
                <View style={styles.optionContent}>
                  <View style={styles.optionHeader}>
                    <Text
                      style={[
                        styles.optionTitle,
                        {color: theme.colors.text},
                        selectedTargetLanguage === lang.code && {
                          ...styles.optionTitleActive,
                          color: theme.colors.primary,
                        },
                      ]}>
                      {t(
                        `settings.sections.language.targetLanguages.${lang.code}`,
                      )}
                    </Text>
                    {selectedTargetLanguage === lang.code && (
                      <Text
                        style={[
                          styles.checkMark,
                          {color: theme.colors.primary},
                        ]}>
                        ✓
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {isGuestMode && (
          <View
            style={[
              styles.section,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              👤 Guest Mode
            </Text>
            <View style={styles.infoRow}>
              <Text
                style={[styles.infoLabel, {color: theme.colors.textSecondary}]}>
                Status
              </Text>
              <Text style={[styles.infoValue, {color: theme.colors.text}]}>
                Using as Guest
              </Text>
            </View>
            <View
              style={[
                styles.guestInfoBox,
                {
                  backgroundColor: isDark ? '#422006' : '#fef3c7',
                  borderLeftColor: theme.colors.warning,
                },
              ]}>
              <Text
                style={[
                  styles.guestInfoText,
                  {color: isDark ? '#fbbf24' : '#92400e'},
                ]}>
                ℹ️ You are using the app in guest mode. Your data is saved
                locally on this device only.
              </Text>
              <Text
                style={[
                  styles.guestInfoText,
                  {color: isDark ? '#fbbf24' : '#92400e'},
                ]}>
                💡 Create an account to sync your data across devices and keep
                it safe in the cloud.
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                styles.dangerButton,
                {
                  backgroundColor: isDark ? '#7f1d1d' : '#fef2f2',
                  borderColor: isDark ? '#991b1b' : '#fecaca',
                },
              ]}
              onPress={handleExitGuestMode}>
              <Text
                style={[
                  styles.secondaryButtonText,
                  styles.dangerText,
                  {color: isDark ? '#fca5a5' : '#dc2626'},
                ]}>
                🚪 Exit Guest Mode
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {userEmail && (
          <View
            style={[
              styles.section,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              Account
            </Text>
            <View style={styles.infoRow}>
              <Text
                style={[styles.infoLabel, {color: theme.colors.textSecondary}]}>
                Logged in as
              </Text>
              <Text style={[styles.infoValue, {color: theme.colors.text}]}>
                {' '}
                {userEmail}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                styles.dangerButton,
                {
                  backgroundColor: isDark ? '#7f1d1d' : '#fef2f2',
                  borderColor: isDark ? '#991b1b' : '#fecaca',
                },
              ]}
              onPress={handleLogout}>
              <Text
                style={[
                  styles.secondaryButtonText,
                  styles.dangerText,
                  {color: isDark ? '#fca5a5' : '#dc2626'},
                ]}>
                🚪 Logout
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            API Configuration
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              {color: theme.colors.textSecondary},
            ]}>
            Enter your Gemini API key to enable conversation features
          </Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, {color: theme.colors.text}]}>
              Gemini API Key
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.inputBorder,
                  color: theme.colors.text,
                },
              ]}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="Enter your Gemini API key"
              placeholderTextColor={theme.colors.textTertiary}
              secureTextEntry={!isApiKeyVisible}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setIsApiKeyVisible(!isApiKeyVisible)}>
              <Text
                style={[
                  styles.toggleButtonText,
                  {color: theme.colors.primary},
                ]}>
                {isApiKeyVisible ? '👁️ Hide' : '👁️‍🗨️ Show'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              {backgroundColor: theme.colors.buttonPrimary},
            ]}
            onPress={handleSaveApiKey}>
            <Text
              style={[
                styles.primaryButtonText,
                {color: theme.colors.buttonPrimaryText},
              ]}>
              Save API Key
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                backgroundColor: theme.colors.buttonSecondary,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={handleGetApiKey}>
            <Text
              style={[
                styles.secondaryButtonText,
                {color: theme.colors.buttonSecondaryText},
              ]}>
              🔑 Get API Key from Google AI Studio
            </Text>
          </TouchableOpacity>

          <View
            style={[
              styles.infoBox,
              {
                backgroundColor: theme.colors.primaryLight,
                borderLeftColor: theme.colors.primary,
              },
            ]}>
            <Text style={[styles.infoText, {color: theme.colors.primaryDark}]}>
              ℹ️ Don't have an API key? Click the button above to get one from
              Google AI Studio (free with usage limits)
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            🗣️ Conversation Settings
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              {color: theme.colors.textSecondary},
            ]}>
            Adjust the length of AI responses and suggested user responses
          </Text>

          <View style={styles.optionGroup}>
            <Text style={[styles.optionLabel, {color: theme.colors.text}]}>
              Response Length
            </Text>
            {(Object.keys(SENTENCE_LENGTH_CONFIG) as SentenceLength[]).map(
              length => (
                <TouchableOpacity
                  key={length}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: theme.colors.inputBackground,
                      borderColor: theme.colors.border,
                    },
                    sentenceLength === length && {
                      ...styles.optionButtonActive,
                      borderColor: theme.colors.primary,
                      backgroundColor: theme.colors.primaryLight,
                    },
                  ]}
                  onPress={() => handleSentenceLengthChange(length)}>
                  <View style={styles.optionContent}>
                    <View style={styles.optionHeader}>
                      <Text
                        style={[
                          styles.optionTitle,
                          {color: theme.colors.text},
                          sentenceLength === length && {
                            ...styles.optionTitleActive,
                            color: theme.colors.primary,
                          },
                        ]}>
                        {SENTENCE_LENGTH_CONFIG[length].label}
                      </Text>
                      {sentenceLength === length && (
                        <Text
                          style={[
                            styles.checkMark,
                            {color: theme.colors.primary},
                          ]}>
                          ✓
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.optionDescription,
                        {color: theme.colors.textSecondary},
                        sentenceLength === length && {
                          ...styles.optionDescriptionActive,
                          color: theme.colors.primaryDark,
                        },
                      ]}>
                      {SENTENCE_LENGTH_CONFIG[length].description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ),
            )}
          </View>

          <View
            style={[
              styles.infoBox,
              {
                backgroundColor: theme.colors.primaryLight,
                borderLeftColor: theme.colors.primary,
              },
            ]}>
            <Text style={[styles.infoText, {color: theme.colors.primaryDark}]}>
              💡 Shorter responses are easier to follow and respond to, making
              practice more engaging. Longer responses provide more context and
              detail.
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Data Management
          </Text>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                backgroundColor: theme.colors.buttonSecondary,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={handleExportData}>
            <Text
              style={[
                styles.secondaryButtonText,
                {color: theme.colors.buttonSecondaryText},
              ]}>
              📤 Export Data
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              styles.dangerButton,
              {
                backgroundColor: isDark ? '#7f1d1d' : '#fef2f2',
                borderColor: isDark ? '#991b1b' : '#fecaca',
              },
            ]}
            onPress={handleClearData}>
            <Text
              style={[
                styles.secondaryButtonText,
                styles.dangerText,
                {color: isDark ? '#fca5a5' : '#dc2626'},
              ]}>
              🗑️ Clear All Data
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            About
          </Text>
          <View style={styles.infoRow}>
            <Text
              style={[styles.infoLabel, {color: theme.colors.textSecondary}]}>
              App Name
            </Text>
            <Text style={[styles.infoValue, {color: theme.colors.text}]}>
              GeminiTalk
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text
              style={[styles.infoLabel, {color: theme.colors.textSecondary}]}>
              Version
            </Text>
            <Text style={[styles.infoValue, {color: theme.colors.text}]}>
              1.0.0
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text
              style={[styles.infoLabel, {color: theme.colors.textSecondary}]}>
              Last Modified
            </Text>
            <Text style={[styles.infoValue, {color: theme.colors.text}]}>
              {formatDate(BUILD_INFO.timestamp)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text
              style={[styles.infoLabel, {color: theme.colors.textSecondary}]}>
              Description
            </Text>
            <Text style={[styles.infoValue, {color: theme.colors.text}]}>
              Real-time English Conversation Coach
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              {backgroundColor: theme.colors.buttonPrimary},
              {marginTop: 16},
            ]}
            onPress={() => navigation.navigate('Feedback')}>
            <Text
              style={[
                styles.primaryButtonText,
                {color: theme.colors.buttonPrimaryText},
              ]}>
              💬 {t('settings.sections.feedback.buttonLabel')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, {color: theme.colors.textTertiary}]}>
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
  },
  scrollView: {
    flex: 1,
  },
  section: {
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
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  themeInfo: {
    flex: 1,
    marginRight: 16,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  toggleButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  toggleButtonText: {
    fontSize: 14,
  },
  primaryButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dangerButton: {},
  dangerText: {},
  infoBox: {
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  infoText: {
    fontSize: 13,
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
  },
  infoValue: {
    fontSize: 14,
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
    textAlign: 'center',
  },
  guestInfoBox: {
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    marginBottom: 12,
  },
  guestInfoText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  optionGroup: {
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  optionButton: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
  },
  optionButtonActive: {},
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
  },
  optionTitleActive: {},
  optionDescription: {
    fontSize: 13,
  },
  optionDescriptionActive: {},
  checkMark: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
