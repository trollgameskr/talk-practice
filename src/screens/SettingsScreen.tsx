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
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import StorageService from '../services/StorageService';
import FirebaseService from '../services/FirebaseService';
import {isValidApiKey, openURL} from '../utils/helpers';
import {BUILD_INFO} from '../config/buildInfo';
import {GUEST_MODE_KEY} from './LoginScreen';
import CustomPicker from '../components/CustomPicker';
import {
  SentenceLength,
  SENTENCE_LENGTH_CONFIG,
  STORAGE_KEYS,
  VOICE_ACCENT_OPTIONS,
  VoiceAccent,
  VOICE_PERSONALITY_OPTIONS,
  VoicePersonality,
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
import {TTSCapabilities} from '../services/AIVoiceService';

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
    useState<SentenceLength>('short');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [selectedTargetLanguage, setSelectedTargetLanguage] =
    useState<string>('en');
  const [autoReadResponse, setAutoReadResponse] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showPronunciation, setShowPronunciation] = useState(false);
  const [showGrammarHighlights, setShowGrammarHighlights] = useState(false);
  const [aiVoiceAccent, setAiVoiceAccent] = useState<VoiceAccent>('en-US');
  const [responseVoiceAccent, setResponseVoiceAccent] =
    useState<VoiceAccent>('en-US');
  const [aiVoicePersonality, setAiVoicePersonality] =
    useState<VoicePersonality>('cheerful_male');
  const [responseVoicePersonality, setResponseVoicePersonality] =
    useState<VoicePersonality>('cheerful_female');
  const [ttsCapabilities, setTtsCapabilities] = useState<TTSCapabilities>({
    model: 'Web Speech API',
    supportsAccent: true,
    supportsPersonality: false,
  });

  const updateTTSCapabilities = React.useCallback(() => {
    // Determine capabilities based on API key presence
    // This matches the logic in AIVoiceService.getCurrentTTSModel()
    const hasApiKey = apiKey && apiKey.trim() !== '';

    if (hasApiKey) {
      // Google Cloud TTS supports both accent and personality
      setTtsCapabilities({
        model: 'Google Cloud TTS',
        supportsAccent: true,
        supportsPersonality: true,
      });
    } else {
      // Web Speech API supports accent but not reliable personality
      setTtsCapabilities({
        model: 'Web Speech API',
        supportsAccent: true,
        supportsPersonality: false,
      });
    }
  }, [apiKey]);

  // Update TTS capabilities when API key changes
  useEffect(() => {
    updateTTSCapabilities();
  }, [updateTTSCapabilities]);

  useEffect(() => {
    loadApiKey();
    loadUserInfo();
    loadSentenceLength();
    loadLanguage();
    loadTargetLanguage();
    loadAutoReadResponse();
    loadShowTranslation();
    loadShowPronunciation();
    loadShowGrammarHighlights();
    loadAiVoiceAccent();
    loadResponseVoiceAccent();
    loadAiVoicePersonality();
    loadResponseVoicePersonality();
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
      } else {
        // Default to 'short' if not set
        setSentenceLength('short');
      }
    } catch (error) {
      console.error('Error loading sentence length:', error);
    }
  };

  const loadAutoReadResponse = async () => {
    try {
      const savedValue = await AsyncStorage.getItem(
        STORAGE_KEYS.AUTO_READ_RESPONSE,
      );
      // Default to true if not set (Feature 3)
      setAutoReadResponse(savedValue !== null ? savedValue === 'true' : true);
    } catch (error) {
      console.error('Error loading auto-read response setting:', error);
    }
  };

  const loadShowTranslation = async () => {
    try {
      const savedValue = await AsyncStorage.getItem(
        STORAGE_KEYS.SHOW_TRANSLATION,
      );
      // Default to true if not set (Feature 3)
      setShowTranslation(savedValue !== null ? savedValue === 'true' : true);
    } catch (error) {
      console.error('Error loading show translation setting:', error);
    }
  };

  const loadShowPronunciation = async () => {
    try {
      const savedValue = await AsyncStorage.getItem(
        STORAGE_KEYS.SHOW_PRONUNCIATION,
      );
      // Default to true if not set (Feature 3)
      setShowPronunciation(savedValue !== null ? savedValue === 'true' : true);
    } catch (error) {
      console.error('Error loading show pronunciation setting:', error);
    }
  };

  const loadShowGrammarHighlights = async () => {
    try {
      const savedValue = await AsyncStorage.getItem(
        STORAGE_KEYS.SHOW_GRAMMAR_HIGHLIGHTS,
      );
      // Default to true if not set (Feature 3)
      setShowGrammarHighlights(
        savedValue !== null ? savedValue === 'true' : true,
      );
    } catch (error) {
      console.error('Error loading show grammar highlights setting:', error);
    }
  };

  const loadAiVoiceAccent = async () => {
    try {
      const savedValue = await AsyncStorage.getItem(
        STORAGE_KEYS.AI_VOICE_ACCENT,
      );
      if (savedValue) {
        setAiVoiceAccent(savedValue as VoiceAccent);
      }
    } catch (error) {
      console.error('Error loading AI voice accent:', error);
    }
  };

  const loadResponseVoiceAccent = async () => {
    try {
      const savedValue = await AsyncStorage.getItem(
        STORAGE_KEYS.RESPONSE_VOICE_ACCENT,
      );
      if (savedValue) {
        setResponseVoiceAccent(savedValue as VoiceAccent);
      }
    } catch (error) {
      console.error('Error loading response voice accent:', error);
    }
  };

  const loadAiVoicePersonality = async () => {
    try {
      const savedValue = await AsyncStorage.getItem(
        STORAGE_KEYS.AI_VOICE_PERSONALITY,
      );
      if (savedValue) {
        setAiVoicePersonality(savedValue as VoicePersonality);
      }
    } catch (error) {
      console.error('Error loading AI voice personality:', error);
    }
  };

  const loadResponseVoicePersonality = async () => {
    try {
      const savedValue = await AsyncStorage.getItem(
        STORAGE_KEYS.RESPONSE_VOICE_PERSONALITY,
      );
      if (savedValue) {
        setResponseVoicePersonality(savedValue as VoicePersonality);
      }
    } catch (error) {
      console.error('Error loading response voice personality:', error);
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
      // Update TTS capabilities after saving API key
      updateTTSCapabilities();
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

  const handleAutoReadResponseToggle = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.AUTO_READ_RESPONSE,
        value.toString(),
      );
      setAutoReadResponse(value);
    } catch (error) {
      console.error('Error saving auto-read response setting:', error);
      Alert.alert('Error', 'Failed to save auto-read response setting');
    }
  };

  const handleShowTranslationToggle = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SHOW_TRANSLATION,
        value.toString(),
      );
      setShowTranslation(value);
    } catch (error) {
      console.error('Error saving show translation setting:', error);
      Alert.alert('Error', 'Failed to save translation setting');
    }
  };

  const handleShowPronunciationToggle = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SHOW_PRONUNCIATION,
        value.toString(),
      );
      setShowPronunciation(value);
    } catch (error) {
      console.error('Error saving show pronunciation setting:', error);
      Alert.alert('Error', 'Failed to save pronunciation setting');
    }
  };

  const handleShowGrammarHighlightsToggle = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SHOW_GRAMMAR_HIGHLIGHTS,
        value.toString(),
      );
      setShowGrammarHighlights(value);
    } catch (error) {
      console.error('Error saving show grammar highlights setting:', error);
      Alert.alert('Error', 'Failed to save grammar highlights setting');
    }
  };

  const handleAiVoiceAccentChange = async (accent: VoiceAccent) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AI_VOICE_ACCENT, accent);
      setAiVoiceAccent(accent);
    } catch (error) {
      console.error('Error saving AI voice accent:', error);
      Alert.alert('Error', 'Failed to save AI voice accent');
    }
  };

  const handleResponseVoiceAccentChange = async (accent: VoiceAccent) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RESPONSE_VOICE_ACCENT, accent);
      setResponseVoiceAccent(accent);
    } catch (error) {
      console.error('Error saving response voice accent:', error);
      Alert.alert('Error', 'Failed to save response voice accent');
    }
  };

  const handleAiVoicePersonalityChange = async (
    personality: VoicePersonality,
  ) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.AI_VOICE_PERSONALITY,
        personality,
      );
      setAiVoicePersonality(personality);
    } catch (error) {
      console.error('Error saving AI voice personality:', error);
      Alert.alert('Error', 'Failed to save AI voice personality');
    }
  };

  const handleResponseVoicePersonalityChange = async (
    personality: VoicePersonality,
  ) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.RESPONSE_VOICE_PERSONALITY,
        personality,
      );
      setResponseVoicePersonality(personality);
    } catch (error) {
      console.error('Error saving response voice personality:', error);
      Alert.alert('Error', 'Failed to save response voice personality');
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
      <ScrollView
        style={[
          styles.scrollView,
          // Web-specific styles for scrollbar visibility
          Platform.OS === 'web' && {
            // @ts-ignore - Web-specific style
            overflow: 'scroll',
          },
        ]}
        contentContainerStyle={
          Platform.OS === 'web' ? styles.scrollContentWeb : undefined
        }
        showsVerticalScrollIndicator={true}>
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
            <CustomPicker
              selectedValue={selectedLanguage}
              onValueChange={async (value: string) => {
                await saveLanguage(value);
                await i18n.changeLanguage(value);
                setSelectedLanguage(value);
                Alert.alert(
                  t('common.success'),
                  t('settings.sections.language.success'),
                );
              }}
              items={getAvailableLanguages().map(lang => ({
                label: lang.name,
                value: lang.code,
              }))}
              placeholder={t('settings.sections.language.nativeLanguage')}
              theme={theme}
              style={styles.pickerContainer}
            />
          </View>

          <View style={styles.optionGroup}>
            <Text style={[styles.optionLabel, {color: theme.colors.text}]}>
              {t('settings.sections.language.targetLanguage')}
            </Text>
            <CustomPicker
              selectedValue={selectedTargetLanguage}
              onValueChange={async (value: string) => {
                await saveTargetLanguage(value);
                setSelectedTargetLanguage(value);
                Alert.alert(
                  t('common.success'),
                  t('settings.sections.language.success'),
                );
              }}
              items={getAvailableTargetLanguages().map(lang => ({
                label: t(
                  `settings.sections.language.targetLanguages.${lang.code}`,
                ),
                value: lang.code,
              }))}
              placeholder={t('settings.sections.language.targetLanguage')}
              theme={theme}
              style={styles.pickerContainer}
            />
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

          <View style={styles.optionGroup}>
            <View style={styles.themeRow}>
              <View style={styles.themeInfo}>
                <Text style={[styles.themeLabel, {color: theme.colors.text}]}>
                  {t('settings.sections.conversation.autoReadResponse.label')}
                </Text>
                <Text
                  style={[
                    styles.themeDescription,
                    {color: theme.colors.textSecondary},
                  ]}>
                  {t(
                    'settings.sections.conversation.autoReadResponse.description',
                  )}
                </Text>
              </View>
              <Switch
                value={autoReadResponse}
                onValueChange={handleAutoReadResponseToggle}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor={
                  autoReadResponse
                    ? theme.colors.buttonPrimaryText
                    : theme.colors.inputBackground
                }
              />
            </View>
          </View>

          <View style={styles.optionGroup}>
            <View style={styles.themeRow}>
              <View style={styles.themeInfo}>
                <Text style={[styles.themeLabel, {color: theme.colors.text}]}>
                  {t('settings.sections.conversation.showTranslation.label')}
                </Text>
                <Text
                  style={[
                    styles.themeDescription,
                    {color: theme.colors.textSecondary},
                  ]}>
                  {t(
                    'settings.sections.conversation.showTranslation.description',
                  )}
                </Text>
              </View>
              <Switch
                value={showTranslation}
                onValueChange={handleShowTranslationToggle}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor={
                  showTranslation
                    ? theme.colors.buttonPrimaryText
                    : theme.colors.inputBackground
                }
              />
            </View>
          </View>

          <View style={styles.optionGroup}>
            <View style={styles.themeRow}>
              <View style={styles.themeInfo}>
                <Text style={[styles.themeLabel, {color: theme.colors.text}]}>
                  {t('settings.sections.conversation.showPronunciation.label')}
                </Text>
                <Text
                  style={[
                    styles.themeDescription,
                    {color: theme.colors.textSecondary},
                  ]}>
                  {t(
                    'settings.sections.conversation.showPronunciation.description',
                  )}
                </Text>
              </View>
              <Switch
                value={showPronunciation}
                onValueChange={handleShowPronunciationToggle}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor={
                  showPronunciation
                    ? theme.colors.buttonPrimaryText
                    : theme.colors.inputBackground
                }
              />
            </View>
          </View>

          <View style={styles.optionGroup}>
            <View style={styles.themeRow}>
              <View style={styles.themeInfo}>
                <Text style={[styles.themeLabel, {color: theme.colors.text}]}>
                  {t(
                    'settings.sections.conversation.showGrammarHighlights.label',
                  )}
                </Text>
                <Text
                  style={[
                    styles.themeDescription,
                    {color: theme.colors.textSecondary},
                  ]}>
                  {t(
                    'settings.sections.conversation.showGrammarHighlights.description',
                  )}
                </Text>
              </View>
              <Switch
                value={showGrammarHighlights}
                onValueChange={handleShowGrammarHighlightsToggle}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor={
                  showGrammarHighlights
                    ? theme.colors.buttonPrimaryText
                    : theme.colors.inputBackground
                }
              />
            </View>
          </View>

          <View style={styles.optionGroup}>
            <Text style={[styles.optionLabel, {color: theme.colors.text}]}>
              {t('settings.sections.conversation.aiVoiceAccent.label')}
            </Text>
            <Text
              style={[
                styles.optionDescription,
                {color: theme.colors.textSecondary},
              ]}>
              {t('settings.sections.conversation.aiVoiceAccent.description')}
            </Text>
            {/* Feature 4: Show accent options only when target language is English */}
            {selectedTargetLanguage === 'en' ? (
              <CustomPicker
                selectedValue={aiVoiceAccent}
                onValueChange={(value: string) =>
                  handleAiVoiceAccentChange(value as VoiceAccent)
                }
                items={Object.keys(VOICE_ACCENT_OPTIONS).map(key => ({
                  label: VOICE_ACCENT_OPTIONS[key as VoiceAccent].label,
                  value: key,
                }))}
                placeholder="Select AI Voice Accent"
                theme={theme}
                style={styles.pickerContainer}
              />
            ) : (
              <View
                style={[
                  styles.infoBox,
                  {
                    backgroundColor: theme.colors.primaryLight,
                    borderLeftColor: theme.colors.primary,
                  },
                ]}>
                <Text
                  style={[styles.infoText, {color: theme.colors.primaryDark}]}>
                  ℹ️ Accent options are only available when learning English
                </Text>
              </View>
            )}
          </View>

          <View style={styles.optionGroup}>
            <Text style={[styles.optionLabel, {color: theme.colors.text}]}>
              {t('settings.sections.conversation.responseVoiceAccent.label')}
            </Text>
            <Text
              style={[
                styles.optionDescription,
                {color: theme.colors.textSecondary},
              ]}>
              {t(
                'settings.sections.conversation.responseVoiceAccent.description',
              )}
            </Text>
            {/* Feature 4: Show accent options only when target language is English */}
            {selectedTargetLanguage === 'en' ? (
              <CustomPicker
                selectedValue={responseVoiceAccent}
                onValueChange={(value: string) =>
                  handleResponseVoiceAccentChange(value as VoiceAccent)
                }
                items={Object.keys(VOICE_ACCENT_OPTIONS).map(key => ({
                  label: VOICE_ACCENT_OPTIONS[key as VoiceAccent].label,
                  value: key,
                }))}
                placeholder="Select Response Voice Accent"
                theme={theme}
                style={styles.pickerContainer}
              />
            ) : (
              <View
                style={[
                  styles.infoBox,
                  {
                    backgroundColor: theme.colors.primaryLight,
                    borderLeftColor: theme.colors.primary,
                  },
                ]}>
                <Text
                  style={[styles.infoText, {color: theme.colors.primaryDark}]}>
                  ℹ️ Accent options are only available when learning English
                </Text>
              </View>
            )}
          </View>

          {/* Feature 6: AI Voice Personality Selection */}
          {ttsCapabilities.supportsPersonality && (
            <View style={styles.optionGroup}>
              <Text style={[styles.optionLabel, {color: theme.colors.text}]}>
                AI Voice Personality
              </Text>
              <Text
                style={[
                  styles.optionDescription,
                  {color: theme.colors.textSecondary},
                ]}>
                Choose the personality type for the AI conversation partner
              </Text>
              <CustomPicker
                selectedValue={aiVoicePersonality}
                onValueChange={(value: string) =>
                  handleAiVoicePersonalityChange(value as VoicePersonality)
                }
                items={Object.keys(VOICE_PERSONALITY_OPTIONS).map(key => ({
                  label:
                    VOICE_PERSONALITY_OPTIONS[key as VoicePersonality].label,
                  value: key,
                }))}
                placeholder="Select AI Voice Personality"
                theme={theme}
                style={styles.pickerContainer}
              />
            </View>
          )}

          {/* Feature 6: Response Voice Personality Selection */}
          {ttsCapabilities.supportsPersonality && (
            <View style={styles.optionGroup}>
              <Text style={[styles.optionLabel, {color: theme.colors.text}]}>
                Your Voice Personality
              </Text>
              <Text
                style={[
                  styles.optionDescription,
                  {color: theme.colors.textSecondary},
                ]}>
                Choose the personality type for reading your selected responses
              </Text>
              <CustomPicker
                selectedValue={responseVoicePersonality}
                onValueChange={(value: string) =>
                  handleResponseVoicePersonalityChange(
                    value as VoicePersonality,
                  )
                }
                items={Object.keys(VOICE_PERSONALITY_OPTIONS).map(key => ({
                  label:
                    VOICE_PERSONALITY_OPTIONS[key as VoicePersonality].label,
                  value: key,
                }))}
                placeholder="Select Your Voice Personality"
                theme={theme}
                style={styles.pickerContainer}
              />
            </View>
          )}

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
  scrollContentWeb: {
    paddingBottom: 20,
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
  pickerContainer: {
    marginBottom: 8,
  },
});

export default SettingsScreen;
