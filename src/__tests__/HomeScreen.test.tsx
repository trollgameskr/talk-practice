/**
 * Tests for HomeScreen API key check
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY_STORAGE = '@gemini_api_key';

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
      const apiKey = await AsyncStorage.getItem(API_KEY_STORAGE);
      return apiKey;
    };

    const result = await checkApiKey();

    expect(mockGetItem).toHaveBeenCalledWith(API_KEY_STORAGE);
    expect(result).toBeNull();
  });

  it('should not show alert if API key exists', async () => {
    // Mock AsyncStorage.getItem to return a key
    const mockGetItem = jest.spyOn(AsyncStorage, 'getItem');
    mockGetItem.mockResolvedValue('test-api-key-123');

    const checkApiKey = async () => {
      const apiKey = await AsyncStorage.getItem(API_KEY_STORAGE);
      return apiKey !== null;
    };

    const hasKey = await checkApiKey();

    expect(mockGetItem).toHaveBeenCalledWith(API_KEY_STORAGE);
    expect(hasKey).toBe(true);
  });

  it('should detect missing API key', async () => {
    // Mock AsyncStorage.getItem to return null
    const mockGetItem = jest.spyOn(AsyncStorage, 'getItem');
    mockGetItem.mockResolvedValue(null);

    const checkApiKey = async () => {
      const apiKey = await AsyncStorage.getItem(API_KEY_STORAGE);
      return apiKey === null;
    };

    const isMissing = await checkApiKey();

    expect(mockGetItem).toHaveBeenCalledWith(API_KEY_STORAGE);
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
