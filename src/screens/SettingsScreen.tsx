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
} from '../config/i18n.config';

const storageService = new StorageService();
const firebaseService = new FirebaseService();
const GEMINI_API_KEY_URL = 'https://makersuite.google.com/app/apikey';

const SettingsScreen = () => {
  const {theme, isDark, toggleTheme} = useTheme();
  const {t} = useTranslation();
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [sentenceLength, setSentenceLength] =
    useState<SentenceLength>('medium');
  const [currentLanguage, setCurrentLanguage] = useState('ko');

  useEffect(() => {
    loadApiKey();
    loadUserInfo();
    loadSentenceLength();
    setCurrentLanguage(getCurrentLanguage());
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
      Alert.alert(t('common.error'), t('settings.sections.api.errors.empty'));
      return;
    }

    if (!isValidApiKey(apiKey)) {
      Alert.alert(t('common.error'), t('settings.sections.api.errors.invalid'));
      return;
    }

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
      Alert.alert(t('common.success'), t('settings.sections.api.success'));
    } catch (error) {
      console.error('Error saving API key:', error);
      Alert.alert(t('common.error'), 'Failed to save API key');
    }
  };

  const handleSentenceLengthChange = async (length: SentenceLength) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SENTENCE_LENGTH, length);
      setSentenceLength(length);
      Alert.alert(
        t('common.success'),
        t('settings.sections.conversation.success'),
      );
    } catch (error) {
      console.error('Error saving sentence length:', error);
      Alert.alert(
        t('common.error'),
        'Failed to save sentence length preference',
      );
    }
  };

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await saveLanguage(languageCode);
      setCurrentLanguage(languageCode);
      Alert.alert(t('common.success'), t('settings.sections.language.success'));
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert(t('common.error'), 'Failed to change language');
    }
  };

  const handleGetApiKey = async () => {
    await openURL(GEMINI_API_KEY_URL);
  };

  const handleClearData = () => {
    Alert.alert(
      t('settings.sections.data.clearConfirm.title'),
      t('settings.sections.data.clearConfirm.message'),
      [
        {
          text: t('settings.sections.data.clearConfirm.cancel'),
          style: 'cancel',
        },
        {
          text: t('settings.sections.data.clearConfirm.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.clearAllData();
              Alert.alert(
                t('common.success'),
                t('settings.sections.data.clearConfirm.success'),
              );
            } catch (error) {
              Alert.alert(
                t('common.error'),
                t('settings.sections.data.clearConfirm.error'),
              );
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
        t('settings.sections.data.exportSuccess.title'),
        t('settings.sections.data.exportSuccess.message'),
      );
      console.log('Exported data:', data);
    } catch (error) {
      Alert.alert(t('common.error'), t('settings.sections.data.exportError'));
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('settings.sections.account.logoutConfirm.title'),
      t('settings.sections.account.logoutConfirm.message'),
      [
        {
          text: t('settings.sections.account.logoutConfirm.cancel'),
          style: 'cancel',
        },
        {
          text: t('settings.sections.account.logoutConfirm.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await firebaseService.logout();
              Alert.alert(
                t('common.success'),
                t('settings.sections.account.logoutConfirm.success'),
              );
            } catch (error) {
              Alert.alert(
                t('common.error'),
                t('settings.sections.account.logoutConfirm.error'),
              );
            }
          },
        },
      ],
    );
  };

  const handleExitGuestMode = () => {
    Alert.alert(
      t('settings.sections.guestMode.exitConfirm.title'),
      t('settings.sections.guestMode.exitConfirm.message'),
      [
        {
          text: t('settings.sections.guestMode.exitConfirm.cancel'),
          style: 'cancel',
        },
        {
          text: t('settings.sections.guestMode.exitConfirm.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(GUEST_MODE_KEY);
              Alert.alert(
                t('settings.sections.guestMode.exitConfirm.success'),
                t('settings.sections.guestMode.exitConfirm.successMessage'),
              );
            } catch (error) {
              Alert.alert(
                t('common.error'),
                t('settings.sections.guestMode.exitConfirm.error'),
              );
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
    <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView style={styles.scrollView}>
        <View style={[styles.section, {backgroundColor: theme.colors.card, borderColor: theme.colors.border}]}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>🎨 Appearance</Text>
          <View style={styles.themeRow}>
            <View style={styles.themeInfo}>
              <Text style={[styles.themeLabel, {color: theme.colors.text}]}>Dark Mode</Text>
              <Text style={[styles.themeDescription, {color: theme.colors.textSecondary}]}>
                Switch between light and dark theme
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{false: theme.colors.border, true: theme.colors.primary}}
              thumbColor={isDark ? theme.colors.buttonPrimaryText : theme.colors.inputBackground}
            />
          </View>
        </View>

        {isGuestMode && (
          <View style={[styles.section, {backgroundColor: theme.colors.card, borderColor: theme.colors.border}]}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>👤 Guest Mode</Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, {color: theme.colors.textSecondary}]}>Status</Text>
              <Text style={[styles.infoValue, {color: theme.colors.text}]}>Using as Guest</Text>
            </View>
            <View style={[styles.guestInfoBox, {backgroundColor: isDark ? '#422006' : '#fef3c7', borderLeftColor: theme.colors.warning}]}>
              <Text style={[styles.guestInfoText, {color: isDark ? '#fbbf24' : '#92400e'}]}>
                ℹ️ You are using the app in guest mode. Your data is saved
                locally on this device only.
              </Text>
              <Text style={[styles.guestInfoText, {color: isDark ? '#fbbf24' : '#92400e'}]}>
                💡 Create an account to sync your data across devices and keep
                it safe in the cloud.
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('settings.sections.guestMode.title')}
            </Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {t('settings.sections.guestMode.status')}
              </Text>
              <Text style={styles.infoValue}>
                {t('settings.sections.guestMode.statusValue')}
              </Text>
            </View>
            <View style={styles.guestInfoBox}>
              <Text style={styles.guestInfoText}>
                {t('settings.sections.guestMode.info1')}
              </Text>
              <Text style={styles.guestInfoText}>
                {t('settings.sections.guestMode.info2')}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.secondaryButton, styles.dangerButton, {backgroundColor: isDark ? '#7f1d1d' : '#fef2f2', borderColor: isDark ? '#991b1b' : '#fecaca'}]}
              onPress={handleExitGuestMode}>
              <Text style={[styles.secondaryButtonText, styles.dangerText, {color: isDark ? '#fca5a5' : '#dc2626'}]}>
                🚪 Exit Guest Mode
              <Text style={[styles.secondaryButtonText, styles.dangerText]}>
                {t('settings.sections.guestMode.exitButton')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {userEmail && (
          <View style={[styles.section, {backgroundColor: theme.colors.card, borderColor: theme.colors.border}]}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>Account</Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, {color: theme.colors.textSecondary}]}>Logged in as</Text>
              <Text style={[styles.infoValue, {color: theme.colors.text}]}>  {userEmail}</Text>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('settings.sections.account.title')}
            </Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {t('settings.sections.account.loggedInAs')}
              </Text>
              <Text style={styles.infoValue}>{userEmail}</Text>
            </View>
            <TouchableOpacity
              style={[styles.secondaryButton, styles.dangerButton, {backgroundColor: isDark ? '#7f1d1d' : '#fef2f2', borderColor: isDark ? '#991b1b' : '#fecaca'}]}
              onPress={handleLogout}>
              <Text style={[styles.secondaryButtonText, styles.dangerText, {color: isDark ? '#fca5a5' : '#dc2626'}]}>
                🚪 Logout
              <Text style={[styles.secondaryButtonText, styles.dangerText]}>
                {t('settings.sections.account.logoutButton')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.section, {backgroundColor: theme.colors.card, borderColor: theme.colors.border}]}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>API Configuration</Text>
          <Text style={[styles.sectionDescription, {color: theme.colors.textSecondary}]}>
            Enter your Gemini API key to enable conversation features
          </Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, {color: theme.colors.text}]}>Gemini API Key</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.sections.api.title')}
          </Text>
          <Text style={styles.sectionDescription}>
            {t('settings.sections.api.description')}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              {t('settings.sections.api.apiKeyLabel')}
            </Text>
            <TextInput
              style={[styles.input, {backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder, color: theme.colors.text}]}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="Enter your Gemini API key"
              placeholderTextColor={theme.colors.textTertiary}
              placeholder={t('settings.sections.api.apiKeyPlaceholder')}
              placeholderTextColor="#9ca3af"
              secureTextEntry={!isApiKeyVisible}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setIsApiKeyVisible(!isApiKeyVisible)}>
              <Text style={[styles.toggleButtonText, {color: theme.colors.primary}]}>
                {isApiKeyVisible ? '👁️ Hide' : '👁️‍🗨️ Show'}
              <Text style={styles.toggleButtonText}>
                {isApiKeyVisible
                  ? t('settings.sections.api.hideButton')
                  : t('settings.sections.api.showButton')}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, {backgroundColor: theme.colors.buttonPrimary}]}
            onPress={handleSaveApiKey}>
            <Text style={[styles.primaryButtonText, {color: theme.colors.buttonPrimaryText}]}>Save API Key</Text>
            <Text style={styles.primaryButtonText}>
              {t('settings.sections.api.saveButton')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, {backgroundColor: theme.colors.buttonSecondary, borderColor: theme.colors.border}]}
            onPress={handleGetApiKey}>
            <Text style={[styles.secondaryButtonText, {color: theme.colors.buttonSecondaryText}]}>
              🔑 Get API Key from Google AI Studio
            </Text>
          </TouchableOpacity>

          <View style={[styles.infoBox, {backgroundColor: theme.colors.primaryLight, borderLeftColor: theme.colors.primary}]}>
            <Text style={[styles.infoText, {color: theme.colors.primaryDark}]}>
              ℹ️ Don't have an API key? Click the button above to get one from
              Google AI Studio (free with usage limits)
            <Text style={styles.secondaryButtonText}>
              {t('settings.sections.api.getKeyButton')}
            </Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {t('settings.sections.api.info')}
            </Text>
          </View>
        </View>

        <View style={[styles.section, {backgroundColor: theme.colors.card, borderColor: theme.colors.border}]}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>🗣️ Conversation Settings</Text>
          <Text style={[styles.sectionDescription, {color: theme.colors.textSecondary}]}>
            Adjust the length of AI responses and suggested user responses
          </Text>

          <View style={styles.optionGroup}>
            <Text style={[styles.optionLabel, {color: theme.colors.text}]}>Response Length</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.sections.conversation.title')}
          </Text>
          <Text style={styles.sectionDescription}>
            {t('settings.sections.conversation.description')}
          </Text>

          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>
              {t('settings.sections.conversation.responseLength')}
            </Text>
            {(Object.keys(SENTENCE_LENGTH_CONFIG) as SentenceLength[]).map(
              length => (
                <TouchableOpacity
                  key={length}
                  style={[
                    styles.optionButton,
                    {backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border},
                    sentenceLength === length && {...styles.optionButtonActive, borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight},
                  ]}
                  onPress={() => handleSentenceLengthChange(length)}>
                  <View style={styles.optionContent}>
                    <View style={styles.optionHeader}>
                      <Text
                        style={[
                          styles.optionTitle,
                          {color: theme.colors.text},
                          sentenceLength === length && {...styles.optionTitleActive, color: theme.colors.primary},
                        ]}>
                        {t(
                          `settings.sections.conversation.lengths.${length}.label`,
                        )}
                      </Text>
                      {sentenceLength === length && (
                        <Text style={[styles.checkMark, {color: theme.colors.primary}]}>✓</Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.optionDescription,
                        {color: theme.colors.textSecondary},
                        sentenceLength === length &&
                          {...styles.optionDescriptionActive, color: theme.colors.primaryDark},
                      ]}>
                      {t(
                        `settings.sections.conversation.lengths.${length}.description`,
                      )}
                    </Text>
                  </View>
                </TouchableOpacity>
              ),
            )}
          </View>

          <View style={[styles.infoBox, {backgroundColor: theme.colors.primaryLight, borderLeftColor: theme.colors.primary}]}>
            <Text style={[styles.infoText, {color: theme.colors.primaryDark}]}>
              💡 Shorter responses are easier to follow and respond to, making
              practice more engaging. Longer responses provide more context and
              detail.
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {t('settings.sections.conversation.info')}
            </Text>
          </View>
        </View>

        <View style={[styles.section, {backgroundColor: theme.colors.card, borderColor: theme.colors.border}]}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>Data Management</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.sections.language.title')}
          </Text>
          <Text style={styles.sectionDescription}>
            {t('settings.sections.language.description')}
          </Text>

          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>
              {t('settings.sections.language.currentLanguage')}
            </Text>
            {getAvailableLanguages().map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.optionButton,
                  currentLanguage === lang.code && styles.optionButtonActive,
                ]}
                onPress={() => handleLanguageChange(lang.code)}>
                <View style={styles.optionContent}>
                  <View style={styles.optionHeader}>
                    <Text
                      style={[
                        styles.optionTitle,
                        currentLanguage === lang.code &&
                          styles.optionTitleActive,
                      ]}>
                      {lang.nativeName}
                    </Text>
                    {currentLanguage === lang.code && (
                      <Text style={styles.checkMark}>✓</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.sections.data.title')}
          </Text>

          <TouchableOpacity
            style={[styles.secondaryButton, {backgroundColor: theme.colors.buttonSecondary, borderColor: theme.colors.border}]}
            onPress={handleExportData}>
            <Text style={[styles.secondaryButtonText, {color: theme.colors.buttonSecondaryText}]}>📤 Export Data</Text>
            <Text style={styles.secondaryButtonText}>
              {t('settings.sections.data.exportButton')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, styles.dangerButton, {backgroundColor: isDark ? '#7f1d1d' : '#fef2f2', borderColor: isDark ? '#991b1b' : '#fecaca'}]}
            onPress={handleClearData}>
            <Text style={[styles.secondaryButtonText, styles.dangerText, {color: isDark ? '#fca5a5' : '#dc2626'}]}>
              🗑️ Clear All Data
            <Text style={[styles.secondaryButtonText, styles.dangerText]}>
              {t('settings.sections.data.clearButton')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, {backgroundColor: theme.colors.card, borderColor: theme.colors.border}]}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>About</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, {color: theme.colors.textSecondary}]}>App Name</Text>
            <Text style={[styles.infoValue, {color: theme.colors.text}]}>GeminiTalk</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, {color: theme.colors.textSecondary}]}>Version</Text>
            <Text style={[styles.infoValue, {color: theme.colors.text}]}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, {color: theme.colors.textSecondary}]}>Last Modified</Text>
            <Text style={[styles.infoValue, {color: theme.colors.text}]}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.sections.about.title')}
          </Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {t('settings.sections.about.appName')}
            </Text>
            <Text style={styles.infoValue}>GeminiTalk</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {t('settings.sections.about.version')}
            </Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {t('settings.sections.about.lastModified')}
            </Text>
            <Text style={styles.infoValue}>
              {formatDate(BUILD_INFO.timestamp)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, {color: theme.colors.textSecondary}]}>Description</Text>
            <Text style={[styles.infoValue, {color: theme.colors.text}]}>
              Real-time English Conversation Coach
            <Text style={styles.infoLabel}>
              {t('settings.sections.about.description')}
            </Text>
            <Text style={styles.infoValue}>
              {t('settings.sections.about.descriptionValue')}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, {color: theme.colors.textTertiary}]}>
            © 2024 GeminiTalk - Powered by Gemini Live API
          </Text>
          <Text style={styles.footerText}>{t('settings.footer')}</Text>
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
  dangerButton: {
  },
  dangerText: {
  },
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
  optionButtonActive: {
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
  },
  optionTitleActive: {
  },
  optionDescription: {
    fontSize: 13,
  },
  optionDescriptionActive: {
  },
  checkMark: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
