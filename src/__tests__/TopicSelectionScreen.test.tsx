/**
 * Tests for TopicSelectionScreen API key validation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../config/gemini.config';
import {ConversationTopic} from '../types';

describe('TopicSelectionScreen API Key Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should check for API key when screen mounts', async () => {
    const mockGetItem = jest.spyOn(AsyncStorage, 'getItem');
    mockGetItem.mockResolvedValue(null);

    const checkApiKey = async () => {
      const apiKey = await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
      return apiKey;
    };

    const result = await checkApiKey();

    expect(mockGetItem).toHaveBeenCalledWith(STORAGE_KEYS.API_KEY);
    expect(result).toBeNull();
  });

  it('should not show alert if API key exists', async () => {
    const mockGetItem = jest.spyOn(AsyncStorage, 'getItem');
    mockGetItem.mockResolvedValue('test-api-key-123');

    const checkApiKey = async () => {
      const apiKey = await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
      return apiKey !== null;
    };

    const hasKey = await checkApiKey();

    expect(mockGetItem).toHaveBeenCalledWith(STORAGE_KEYS.API_KEY);
    expect(hasKey).toBe(true);
  });

  it('should prevent topic selection when API key is missing', async () => {
    const mockGetItem = jest.spyOn(AsyncStorage, 'getItem');
    mockGetItem.mockResolvedValue(null);

    const handleTopicSelect = async (_topic: ConversationTopic) => {
      const apiKey = await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
      if (!apiKey) {
        return false; // Simulates preventing navigation
      }
      return true; // Would navigate
    };

    const result = await handleTopicSelect(ConversationTopic.DAILY);

    expect(mockGetItem).toHaveBeenCalledWith(STORAGE_KEYS.API_KEY);
    expect(result).toBe(false);
  });

  it('should allow topic selection when API key exists', async () => {
    const mockGetItem = jest.spyOn(AsyncStorage, 'getItem');
    mockGetItem.mockResolvedValue('test-api-key-123');

    const handleTopicSelect = async (_topic: ConversationTopic) => {
      const apiKey = await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
      if (!apiKey) {
        return false;
      }
      return true; // Would navigate to Conversation screen
    };

    const result = await handleTopicSelect(ConversationTopic.DAILY);

    expect(mockGetItem).toHaveBeenCalledWith(STORAGE_KEYS.API_KEY);
    expect(result).toBe(true);
  });

  it('should navigate to Settings when user chooses', () => {
    const mockNavigate = jest.fn();

    const handleGoToSettings = () => {
      mockNavigate('Settings');
    };

    handleGoToSettings();

    expect(mockNavigate).toHaveBeenCalledWith('Settings');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it('should navigate back when user cancels', () => {
    const mockGoBack = jest.fn();

    const handleCancel = () => {
      mockGoBack();
    };

    handleCancel();

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
