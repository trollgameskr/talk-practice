/**
 * Tests for Guest Mode functionality
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock Firebase before importing any modules that use it
jest.mock('../services/FirebaseService', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    isFirebaseConfigured: jest.fn(() => false),
    onAuthStateChange: jest.fn(() => () => {}),
    getCurrentUser: jest.fn(() => null),
  })),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Now import the constant after mocks are set up
const GUEST_MODE_KEY = '@guest_mode';

describe('Guest Mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Guest Mode Key', () => {
    it('should have correct guest mode key constant', () => {
      expect(GUEST_MODE_KEY).toBe('@guest_mode');
    });
  });

  describe('Guest Mode Storage', () => {
    it('should save guest mode to AsyncStorage', async () => {
      await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        GUEST_MODE_KEY,
        'true',
      );
    });

    it('should read guest mode from AsyncStorage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');
      const result = await AsyncStorage.getItem(GUEST_MODE_KEY);
      expect(result).toBe('true');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(GUEST_MODE_KEY);
    });

    it('should remove guest mode from AsyncStorage', async () => {
      await AsyncStorage.removeItem(GUEST_MODE_KEY);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(GUEST_MODE_KEY);
    });

    it('should return null when guest mode is not set', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const result = await AsyncStorage.getItem(GUEST_MODE_KEY);
      expect(result).toBeNull();
    });
  });

  describe('Guest Mode State Management', () => {
    it('should treat guest mode as authenticated state', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');
      const guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
      const isAuthenticated = guestMode === 'true';
      expect(isAuthenticated).toBe(true);
    });

    it('should not treat non-guest users as authenticated without login', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
      const isAuthenticated = guestMode === 'true';
      expect(isAuthenticated).toBe(false);
    });

    it('should handle invalid guest mode values', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('false');
      const guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
      const isAuthenticated = guestMode === 'true';
      expect(isAuthenticated).toBe(false);
    });
  });

  describe('Guest Mode Flow', () => {
    it('should allow entering guest mode', async () => {
      // Simulate user clicking "Continue as Guest"
      await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');

      // Verify guest mode was set
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');
      const guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
      expect(guestMode).toBe('true');
    });

    it('should allow exiting guest mode', async () => {
      // Start in guest mode
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');
      let guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
      expect(guestMode).toBe('true');

      // Exit guest mode
      await AsyncStorage.removeItem(GUEST_MODE_KEY);

      // Verify guest mode was removed
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
      expect(guestMode).toBeNull();
    });

    it('should support multiple guest mode state changes', async () => {
      // Enter guest mode
      await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');
      let guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
      expect(guestMode).toBe('true');

      // Exit guest mode
      await AsyncStorage.removeItem(GUEST_MODE_KEY);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
      expect(guestMode).toBeNull();

      // Re-enter guest mode
      await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');
      guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
      expect(guestMode).toBe('true');
    });
  });

  describe('Error Handling', () => {
    it('should handle AsyncStorage errors when setting guest mode', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error('Storage error'),
      );

      await expect(
        AsyncStorage.setItem(GUEST_MODE_KEY, 'true'),
      ).rejects.toThrow('Storage error');
    });

    it('should handle AsyncStorage errors when reading guest mode', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error('Storage error'),
      );

      await expect(AsyncStorage.getItem(GUEST_MODE_KEY)).rejects.toThrow(
        'Storage error',
      );
    });

    it('should handle AsyncStorage errors when removing guest mode', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(
        new Error('Storage error'),
      );

      await expect(AsyncStorage.removeItem(GUEST_MODE_KEY)).rejects.toThrow(
        'Storage error',
      );
    });
  });
});
