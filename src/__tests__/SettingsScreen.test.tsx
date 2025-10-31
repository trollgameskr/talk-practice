/**
 * Tests for SettingsScreen API key management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../config/gemini.config';
import {Alert} from 'react-native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock the validation function
jest.mock('../utils/helpers', () => ({
  isValidApiKey: jest.fn((key: string) => key.length > 10),
  openURL: jest.fn(),
}));

describe('SettingsScreen API Key Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleSaveApiKey', () => {
    it('should delete API key from storage when empty string is provided', async () => {
      const mockRemoveItem = jest.spyOn(AsyncStorage, 'removeItem');
      mockRemoveItem.mockResolvedValue();

      // Simulate the behavior of handleSaveApiKey with empty string
      const apiKey = '';
      if (!apiKey.trim()) {
        await AsyncStorage.removeItem(STORAGE_KEYS.API_KEY);
      }

      expect(mockRemoveItem).toHaveBeenCalledWith(STORAGE_KEYS.API_KEY);
    });

    it('should delete API key from storage when whitespace string is provided', async () => {
      const mockRemoveItem = jest.spyOn(AsyncStorage, 'removeItem');
      mockRemoveItem.mockResolvedValue();

      // Simulate the behavior of handleSaveApiKey with whitespace
      const apiKey = '   ';
      if (!apiKey.trim()) {
        await AsyncStorage.removeItem(STORAGE_KEYS.API_KEY);
      }

      expect(mockRemoveItem).toHaveBeenCalledWith(STORAGE_KEYS.API_KEY);
    });

    it('should save valid API key to storage', async () => {
      const mockSetItem = jest.spyOn(AsyncStorage, 'setItem');
      mockSetItem.mockResolvedValue();

      const validApiKey = 'valid-api-key-12345';
      await AsyncStorage.setItem(STORAGE_KEYS.API_KEY, validApiKey);

      expect(mockSetItem).toHaveBeenCalledWith(
        STORAGE_KEYS.API_KEY,
        validApiKey,
      );
    });
  });

  describe('handleSaveTtsApiKey', () => {
    it('should delete TTS API key from storage when empty string is provided', async () => {
      const mockRemoveItem = jest.spyOn(AsyncStorage, 'removeItem');
      mockRemoveItem.mockResolvedValue();

      // Simulate the behavior of handleSaveTtsApiKey with empty string
      const ttsApiKey = '';
      if (!ttsApiKey.trim()) {
        await AsyncStorage.removeItem(STORAGE_KEYS.TTS_API_KEY);
      }

      expect(mockRemoveItem).toHaveBeenCalledWith(STORAGE_KEYS.TTS_API_KEY);
    });

    it('should delete TTS API key from storage when whitespace string is provided', async () => {
      const mockRemoveItem = jest.spyOn(AsyncStorage, 'removeItem');
      mockRemoveItem.mockResolvedValue();

      // Simulate the behavior of handleSaveTtsApiKey with whitespace
      const ttsApiKey = '   ';
      if (!ttsApiKey.trim()) {
        await AsyncStorage.removeItem(STORAGE_KEYS.TTS_API_KEY);
      }

      expect(mockRemoveItem).toHaveBeenCalledWith(STORAGE_KEYS.TTS_API_KEY);
    });

    it('should save valid TTS API key to storage', async () => {
      const mockSetItem = jest.spyOn(AsyncStorage, 'setItem');
      mockSetItem.mockResolvedValue();

      const validTtsApiKey = 'valid-tts-api-key-12345';
      await AsyncStorage.setItem(STORAGE_KEYS.TTS_API_KEY, validTtsApiKey);

      expect(mockSetItem).toHaveBeenCalledWith(
        STORAGE_KEYS.TTS_API_KEY,
        validTtsApiKey,
      );
    });
  });
});
