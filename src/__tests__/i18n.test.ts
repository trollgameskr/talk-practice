/**
 * i18n Configuration Tests
 */

import {
  getAvailableLanguages,
  getAvailableTargetLanguages,
  saveLanguage,
  saveTargetLanguage,
  getTargetLanguage,
} from '../config/i18n.config';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('i18n Configuration', () => {
  describe('getAvailableLanguages', () => {
    it('should return all supported UI languages', () => {
      const languages = getAvailableLanguages();
      expect(languages).toHaveLength(7);
      expect(languages.map(l => l.code)).toEqual([
        'ko',
        'en',
        'ja',
        'zh',
        'es',
        'fr',
        'de',
      ]);
    });

    it('should include language name and native name for each language', () => {
      const languages = getAvailableLanguages();
      languages.forEach(lang => {
        expect(lang).toHaveProperty('code');
        expect(lang).toHaveProperty('name');
        expect(lang).toHaveProperty('nativeName');
        expect(typeof lang.code).toBe('string');
        expect(typeof lang.name).toBe('string');
        expect(typeof lang.nativeName).toBe('string');
      });
    });
  });

  describe('getAvailableTargetLanguages', () => {
    it('should return all supported target languages', () => {
      const languages = getAvailableTargetLanguages();
      expect(languages).toHaveLength(7);
      expect(languages.map(l => l.code)).toEqual([
        'en',
        'ko',
        'ja',
        'zh',
        'es',
        'fr',
        'de',
      ]);
    });

    it('should include language code and name for each language', () => {
      const languages = getAvailableTargetLanguages();
      languages.forEach(lang => {
        expect(lang).toHaveProperty('code');
        expect(lang).toHaveProperty('name');
        expect(typeof lang.code).toBe('string');
        expect(typeof lang.name).toBe('string');
      });
    });
  });

  describe('saveLanguage', () => {
    it('should save language to AsyncStorage', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.setItem.mockResolvedValueOnce(undefined);

      await saveLanguage('ko');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@language', 'ko');
    });
  });

  describe('saveTargetLanguage', () => {
    it('should save target language to AsyncStorage', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.setItem.mockResolvedValueOnce(undefined);

      await saveTargetLanguage('en');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@target_language',
        'en',
      );
    });
  });

  describe('getTargetLanguage', () => {
    it('should return saved target language', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockResolvedValueOnce('ja');

      const language = await getTargetLanguage();

      expect(language).toBe('ja');
    });

    it('should return default language (en) when no language is saved', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockResolvedValueOnce(null);

      const language = await getTargetLanguage();

      expect(language).toBe('en');
    });
  });
});
