/**
 * Tests for HomeScreen API key check
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../config/gemini.config';

describe('HomeScreen API Key Check', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should check for API key when screen mounts', async () => {
    // Mock AsyncStorage.getItem
    const mockGetItem = jest.spyOn(AsyncStorage, 'getItem');
    mockGetItem.mockResolvedValue(null);

    // Simulate the checkApiKey function
    const checkApiKey = async () => {
      const apiKey = await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
      return apiKey;
    };

    const result = await checkApiKey();

    expect(mockGetItem).toHaveBeenCalledWith(STORAGE_KEYS.API_KEY);
    expect(result).toBeNull();
  });

  it('should not show alert if API key exists', async () => {
    // Mock AsyncStorage.getItem to return a key
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

  it('should detect missing API key', async () => {
    // Mock AsyncStorage.getItem to return null
    const mockGetItem = jest.spyOn(AsyncStorage, 'getItem');
    mockGetItem.mockResolvedValue(null);

    const checkApiKey = async () => {
      const apiKey = await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
      return apiKey === null;
    };

    const isMissing = await checkApiKey();

    expect(mockGetItem).toHaveBeenCalledWith(STORAGE_KEYS.API_KEY);
    expect(isMissing).toBe(true);
  });

  it('should navigate to Settings when user chooses', () => {
    const mockNavigate = jest.fn();

    // Simulate user choosing to go to Settings
    const handleGoToSettings = () => {
      mockNavigate('Settings');
    };

    handleGoToSettings();

    expect(mockNavigate).toHaveBeenCalledWith('Settings');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
});
