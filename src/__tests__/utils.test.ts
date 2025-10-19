/**
 * Tests for utility functions
 */

import {
  formatDuration,
  formatDate,
  generateId,
  getTopicDisplayName,
  getTopicIcon,
  calculateImprovement,
  getScoreColor,
  getScoreLabel,
  truncate,
  isValidApiKey,
} from '../utils/helpers';

describe('Utility Functions', () => {
  describe('formatDuration', () => {
    it('should format seconds only', () => {
      expect(formatDuration(30)).toBe('30s');
    });

    it('should format minutes and seconds', () => {
      expect(formatDuration(90)).toBe('1m 30s');
    });

    it('should format hours, minutes and seconds', () => {
      expect(formatDuration(3665)).toBe('1h 1m 5s');
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with timestamp and random component', () => {
      const id = generateId();
      expect(id).toContain('-');
    });
  });

  describe('getTopicDisplayName', () => {
    it('should return correct display names', () => {
      expect(getTopicDisplayName('daily')).toBe('Daily Conversation');
      expect(getTopicDisplayName('travel')).toBe('Travel English');
      expect(getTopicDisplayName('business')).toBe('Business English');
    });

    it('should return the topic itself for unknown topics', () => {
      expect(getTopicDisplayName('unknown')).toBe('unknown');
    });
  });

  describe('getTopicIcon', () => {
    it('should return correct icons', () => {
      expect(getTopicIcon('daily')).toBe('🏠');
      expect(getTopicIcon('travel')).toBe('✈️');
      expect(getTopicIcon('business')).toBe('💼');
    });

    it('should return default icon for unknown topics', () => {
      expect(getTopicIcon('unknown')).toBe('💬');
    });
  });

  describe('calculateImprovement', () => {
    it('should calculate positive improvement', () => {
      expect(calculateImprovement(80, 90)).toBe(13);
    });

    it('should calculate negative improvement', () => {
      expect(calculateImprovement(90, 80)).toBe(-11);
    });

    it('should handle zero old score', () => {
      expect(calculateImprovement(0, 90)).toBe(100);
      expect(calculateImprovement(0, 0)).toBe(0);
    });
  });

  describe('getScoreColor', () => {
    it('should return green for excellent scores', () => {
      expect(getScoreColor(95)).toBe('#22c55e');
    });

    it('should return blue for good scores', () => {
      expect(getScoreColor(80)).toBe('#3b82f6');
    });

    it('should return orange for fair scores', () => {
      expect(getScoreColor(65)).toBe('#f59e0b');
    });

    it('should return red for poor scores', () => {
      expect(getScoreColor(50)).toBe('#ef4444');
    });
  });

  describe('getScoreLabel', () => {
    it('should return correct labels', () => {
      expect(getScoreLabel(95)).toBe('Excellent');
      expect(getScoreLabel(80)).toBe('Good');
      expect(getScoreLabel(65)).toBe('Fair');
      expect(getScoreLabel(50)).toBe('Needs Improvement');
    });
  });

  describe('truncate', () => {
    it('should not truncate short text', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
    });

    it('should truncate long text', () => {
      expect(truncate('Hello World!', 8)).toBe('Hello Wo...');
    });
  });

  describe('isValidApiKey', () => {
    it('should validate correct API key format', () => {
      expect(isValidApiKey('AIzaSyDummyKeyForTesting1234567890')).toBe(true);
    });

    it('should reject invalid API keys', () => {
      expect(isValidApiKey('')).toBe(false);
      expect(isValidApiKey('short')).toBe(false);
      expect(isValidApiKey('DoesNotStartWithAI1234567890')).toBe(false);
    });
  });
});
