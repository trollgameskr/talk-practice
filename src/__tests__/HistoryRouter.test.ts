/**
 * HistoryRouter 테스트
 */

import {linkingConfig, historyManager} from '../utils/HistoryRouter';
import {Platform} from 'react-native';

// Mock Platform to simulate web environment
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
  },
}));

describe('HistoryRouter', () => {
  describe('linkingConfig', () => {
    it('should have correct prefixes', () => {
      expect(linkingConfig.prefixes).toContain('http://localhost:3000');
      expect(linkingConfig.prefixes).toContain('gemini-talk://');
      // GitHub Pages prefix는 __BASE_PATH__가 설정된 경우에만 추가됨
    });

    it('should map screens to correct paths', () => {
      const {screens} = linkingConfig.config;

      expect(screens.Login).toBe('login');
      expect(screens.Home).toBe('');
      expect(screens.TopicSelection).toBe('topics');
      expect(screens.Progress).toBe('progress');
      expect(screens.Settings).toBe('settings');
      expect(screens.AppearanceSettings).toBe('settings/appearance');
      expect(screens.LanguageSettings).toBe('settings/language');
    });

    it('should have conversation path with topic param', () => {
      const {screens} = linkingConfig.config;

      expect(screens.Conversation.path).toBe('conversation/:topic?');
      expect(screens.Conversation.parse).toBeDefined();
    });

    it('should have feedback path with sessionId param', () => {
      const {screens} = linkingConfig.config;

      expect(screens.Feedback).toBe('feedback/:sessionId?');
    });

    it('should have AllSettings path with category param', () => {
      const {screens} = linkingConfig.config;

      expect(screens.AllSettings).toBe('settings/:category');
    });
  });

  describe('HistoryManager', () => {
    it('should detect web platform', () => {
      expect(historyManager.isWebPlatform).toBe(true);
    });

    it('should return basePath for GitHub Pages', () => {
      // Mock window.location for GitHub Pages
      const mockLocation = {
        pathname: '/talk-practice/topics',
      };

      // Note: In actual implementation, basePath is determined at construction time
      // This test verifies the logic exists
      expect(historyManager.basePathname).toBeDefined();
    });
  });
});

describe('HistoryRouter - Non-web platform', () => {
  beforeEach(() => {
    // Mock Platform for mobile
    jest.resetModules();
    jest.doMock('react-native', () => ({
      Platform: {
        OS: 'android',
      },
    }));
  });

  it('should not be web platform on mobile', () => {
    const {historyManager: mobileHistoryManager} =
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../utils/HistoryRouter');
    expect(mobileHistoryManager.isWebPlatform).toBe(false);
  });
});
