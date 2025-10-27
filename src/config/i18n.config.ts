/**
 * i18n Configuration
 */

import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../locales/en.json';
import ko from '../locales/ko.json';
import ja from '../locales/ja.json';
import zh from '../locales/zh.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import de from '../locales/de.json';

const LANGUAGE_STORAGE_KEY = '@language';
const TARGET_LANGUAGE_STORAGE_KEY = '@target_language';

const resources = {
  en: {translation: en},
  ko: {translation: ko},
  ja: {translation: ja},
  zh: {translation: zh},
  es: {translation: es},
  fr: {translation: fr},
  de: {translation: de},
};

// Detect system language
const getSystemLanguage = () => {
  // This will work in React Native
  const systemLocale =
    typeof navigator !== 'undefined' && navigator.language
      ? navigator.language
      : 'en';
  const languageCode = systemLocale.split('-')[0]; // Get 'ko' from 'ko-KR'
  // Check if we support this language
  const supportedLanguages = ['ko', 'en', 'ja', 'zh', 'es', 'fr', 'de'];
  return supportedLanguages.includes(languageCode) ? languageCode : 'en';
};

// Get saved language or use system language as default
const getInitialLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return savedLanguage || getSystemLanguage();
  } catch (error) {
    return getSystemLanguage();
  }
};

// Initialize i18n
const initI18n = async () => {
  const language = await getInitialLanguage();

  i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v3',
  });

  return i18n;
};

// Save language preference
export const saveLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

// Get current language
export const getCurrentLanguage = () => i18n.language;

// Get available languages
export const getAvailableLanguages = () => [
  {code: 'ko', name: '한국어', nativeName: '한국어'},
  {code: 'en', name: 'English', nativeName: 'English'},
  {code: 'ja', name: '日本語', nativeName: '日本語'},
  {code: 'zh', name: '中文', nativeName: '中文'},
  {code: 'es', name: 'Español', nativeName: 'Español'},
  {code: 'fr', name: 'Français', nativeName: 'Français'},
  {code: 'de', name: 'Deutsch', nativeName: 'Deutsch'},
];

// Get available target languages (languages to learn)
export const getAvailableTargetLanguages = () => [
  {code: 'en', name: 'English'},
  {code: 'ko', name: 'Korean'},
  {code: 'ja', name: 'Japanese'},
  {code: 'zh', name: 'Chinese'},
  {code: 'es', name: 'Spanish'},
  {code: 'fr', name: 'French'},
  {code: 'de', name: 'German'},
];

// Save target language preference
export const saveTargetLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem(TARGET_LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.error('Error saving target language:', error);
  }
};

// Get current target language
export const getTargetLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(
      TARGET_LANGUAGE_STORAGE_KEY,
    );
    return savedLanguage || 'en'; // Default to English as target language
  } catch (error) {
    return 'en';
  }
};

export {initI18n, LANGUAGE_STORAGE_KEY, TARGET_LANGUAGE_STORAGE_KEY};
export default i18n;
