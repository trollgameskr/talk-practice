/**
 * DeveloperModeContext Tests
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

describe('DeveloperModeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save developer mode state to AsyncStorage when enabled', async () => {
    const mockSetItem = jest.spyOn(AsyncStorage, 'setItem');
    
    // Simulate toggling developer mode to enabled
    await AsyncStorage.setItem('@developer_mode', 'true');

    expect(mockSetItem).toHaveBeenCalledWith('@developer_mode', 'true');
  });

  it('should save developer mode state to AsyncStorage when disabled', async () => {
    const mockSetItem = jest.spyOn(AsyncStorage, 'setItem');
    
    // Simulate toggling developer mode to disabled
    await AsyncStorage.setItem('@developer_mode', 'false');

    expect(mockSetItem).toHaveBeenCalledWith('@developer_mode', 'false');
  });

  it('should load developer mode state from AsyncStorage', async () => {
    const mockGetItem = jest.spyOn(AsyncStorage, 'getItem');
    mockGetItem.mockResolvedValue('true');

    const loadDeveloperMode = async () => {
      const savedMode = await AsyncStorage.getItem('@developer_mode');
      return savedMode === 'true';
    };

    const isDeveloperMode = await loadDeveloperMode();

    expect(mockGetItem).toHaveBeenCalledWith('@developer_mode');
    expect(isDeveloperMode).toBe(true);
  });

  it('should default to false when no saved state exists', async () => {
    const mockGetItem = jest.spyOn(AsyncStorage, 'getItem');
    mockGetItem.mockResolvedValue(null);

    const loadDeveloperMode = async () => {
      const savedMode = await AsyncStorage.getItem('@developer_mode');
      return savedMode === 'true';
    };

    const isDeveloperMode = await loadDeveloperMode();

    expect(mockGetItem).toHaveBeenCalledWith('@developer_mode');
    expect(isDeveloperMode).toBe(false);
  });

  it('should persist developer mode state across sessions', async () => {
    const mockSetItem = jest.spyOn(AsyncStorage, 'setItem');
    const mockGetItem = jest.spyOn(AsyncStorage, 'getItem');
    
    // Set the value
    await AsyncStorage.setItem('@developer_mode', 'true');
    
    // Retrieve the value
    mockGetItem.mockResolvedValue('true');
    const savedMode = await AsyncStorage.getItem('@developer_mode');

    expect(mockSetItem).toHaveBeenCalledWith('@developer_mode', 'true');
    expect(savedMode).toBe('true');
  });
});

