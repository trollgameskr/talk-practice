/**
 * i18n Configuration
 */

import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../locales/en.json';
import ko from '../locales/ko.json';

const LANGUAGE_STORAGE_KEY = '@language';

const resources = {
  en: {translation: en},
  ko: {translation: ko},
};

// Get saved language or use default
const getInitialLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return savedLanguage || 'ko'; // Default to Korean
  } catch (error) {
    return 'ko';
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
];

export {initI18n, LANGUAGE_STORAGE_KEY};
export default i18n;
