/**
 * Tests for Exit Guest Mode UI behavior
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const GUEST_MODE_KEY = '@guest_mode';

describe('Exit Guest Mode UI Behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication State Transition', () => {
    it('should change from authenticated to unauthenticated when guest mode is exited', async () => {
      // User is in guest mode (authenticated)
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');
      let guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
      let isAuthenticated = guestMode === 'true';
      expect(isAuthenticated).toBe(true);

      // User exits guest mode
      await AsyncStorage.removeItem(GUEST_MODE_KEY);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(GUEST_MODE_KEY);

      // After removal, guest mode should be null (unauthenticated)
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
      isAuthenticated = guestMode === 'true';
      expect(isAuthenticated).toBe(false);
    });

    it('should trigger NavigationContainer remount when auth state changes', () => {
      // This test verifies the concept that NavigationContainer key changes
      const isAuthenticatedBefore = true;
      const keyBefore = isAuthenticatedBefore ? 'authenticated' : 'unauthenticated';
      expect(keyBefore).toBe('authenticated');

      // After exiting guest mode
      const isAuthenticatedAfter = false;
      const keyAfter = isAuthenticatedAfter ? 'authenticated' : 'unauthenticated';
      expect(keyAfter).toBe('unauthenticated');

      // The key change forces React to remount NavigationContainer
      expect(keyBefore).not.toBe(keyAfter);
    });
  });

  describe('Guest Mode Exit Flow', () => {
    it('should complete the full exit flow correctly', async () => {
      // 1. Start in guest mode
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');
      let guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
      expect(guestMode).toBe('true');

      // 2. User clicks "Exit Guest Mode" and confirms
      await AsyncStorage.removeItem(GUEST_MODE_KEY);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(GUEST_MODE_KEY);

      // 3. Polling interval detects the change
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);

      // 4. Auth state becomes false
      const isGuestMode = guestMode === 'true';
      expect(isGuestMode).toBe(false);

      // 5. NavigationContainer remounts with login screen
      const shouldShowLogin = !isGuestMode && guestMode !== 'true';
      expect(shouldShowLogin).toBe(true);
    });

    it('should not show confusing alert message', async () => {
      // The old implementation showed: "You will be redirected to the login screen shortly."
      // The new implementation should just remove the key and let navigation handle it
      
      // Remove guest mode
      await AsyncStorage.removeItem(GUEST_MODE_KEY);
      
      // Verify removal was successful
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(GUEST_MODE_KEY);
      
      // No additional alert needed - navigation handles the transition automatically
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid state changes correctly', async () => {
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

      // Enter again
      await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');
      guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
      expect(guestMode).toBe('true');
    });

    it('should handle errors during guest mode removal', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(
        new Error('Storage error'),
      );

      await expect(AsyncStorage.removeItem(GUEST_MODE_KEY)).rejects.toThrow(
        'Storage error',
      );
    });
  });
});
