/**
 * Tests for GeminiService
 */

import GeminiService from '../services/GeminiService';
import {ConversationTopic} from '../types';
import {SentenceLength} from '../config/gemini.config';

describe('GeminiService', () => {
  let service: GeminiService;

  beforeEach(() => {
    service = new GeminiService('test-api-key');
  });

  afterEach(() => {
    if (service) {
      service.endConversation();
    }
  });

  describe('startConversation', () => {
    it('should start conversation with a topic', async () => {
      const result = await service.startConversation(ConversationTopic.DAILY);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle different topics', async () => {
      const topics = [
        ConversationTopic.DAILY,
        ConversationTopic.TRAVEL,
        ConversationTopic.BUSINESS,
      ];

      for (const topic of topics) {
        const result = await service.startConversation(topic);
        expect(result).toBeDefined();
      }
    });

    it('should generate starter message in target language', async () => {
      // Test with Japanese as target language
      const japaneseService = new GeminiService(
        'test-api-key',
        'medium',
        'ja',
        'en',
      );

      const result = await japaneseService.startConversation(
        ConversationTopic.CASUAL,
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);

      japaneseService.endConversation();
    });

    it('should generate starter message for different target languages', async () => {
      const languages = [
        {code: 'ja', name: 'Japanese'},
        {code: 'ko', name: 'Korean'},
        {code: 'es', name: 'Spanish'},
      ];

      for (const lang of languages) {
        const langService = new GeminiService(
          'test-api-key',
          'medium',
          lang.code,
          'en',
        );

        const result = await langService.startConversation(
          ConversationTopic.DAILY,
        );

        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);

        langService.endConversation();
      }
    });
  });

  describe('sendMessage', () => {
    it('should send message and get response', async () => {
      await service.startConversation(ConversationTopic.DAILY);
      const response = await service.sendMessage('Hello, how are you?');

      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });

    it('should throw error if conversation not started', async () => {
      await expect(service.sendMessage('Hello')).rejects.toThrow(
        'Conversation not started',
      );
    });
  });

  describe('analyzeFeedback', () => {
    it('should analyze user message', async () => {
      const feedback = await service.analyzeFeedback(
        'I go to school yesterday',
      );

      expect(feedback).toBeDefined();
      expect(feedback.pronunciation).toBeDefined();
      expect(feedback.grammar).toBeDefined();
      expect(feedback.fluency).toBeDefined();
      expect(feedback.vocabulary).toBeDefined();
    });

    it('should return scores between 0 and 100', async () => {
      const feedback = await service.analyzeFeedback('This is a test sentence');

      expect(feedback.pronunciation.score).toBeGreaterThanOrEqual(0);
      expect(feedback.pronunciation.score).toBeLessThanOrEqual(100);
      expect(feedback.grammar.score).toBeGreaterThanOrEqual(0);
      expect(feedback.grammar.score).toBeLessThanOrEqual(100);
      expect(feedback.fluency).toBeGreaterThanOrEqual(0);
      expect(feedback.fluency).toBeLessThanOrEqual(100);
      expect(feedback.vocabulary.score).toBeGreaterThanOrEqual(0);
      expect(feedback.vocabulary.score).toBeLessThanOrEqual(100);
    });

    it('should handle empty message gracefully', async () => {
      const feedback = await service.analyzeFeedback('');
      expect(feedback).toBeDefined();
    });
  });

  describe('generateSampleAnswers', () => {
    it('should generate sample answers for AI message', async () => {
      await service.startConversation(ConversationTopic.DAILY);
      const samples = await service.generateSampleAnswers(
        'What did you do today?',
        2,
      );

      expect(samples).toBeDefined();
      expect(Array.isArray(samples)).toBe(true);
      expect(samples.length).toBe(2);
      samples.forEach(sample => {
        expect(typeof sample).toBe('string');
        expect(sample.length).toBeGreaterThan(0);
      });
    });

    it('should throw error if conversation not started', async () => {
      await expect(service.generateSampleAnswers('Hello', 2)).rejects.toThrow(
        'Conversation not started',
      );
    });

    it('should generate specified number of samples', async () => {
      await service.startConversation(ConversationTopic.DAILY);
      const samples = await service.generateSampleAnswers(
        'How was your day?',
        3,
      );

      expect(samples.length).toBeGreaterThanOrEqual(2);
      expect(samples.length).toBeLessThanOrEqual(3);
    });
  });

  describe('generateSummary', () => {
    it('should generate summary from messages', async () => {
      const messages = [
        {
          id: '1',
          role: 'assistant' as const,
          content: 'Hello! How are you?',
          timestamp: new Date(),
        },
        {
          id: '2',
          role: 'user' as const,
          content: 'I am fine, thanks!',
          timestamp: new Date(),
        },
      ];

      const summary = await service.generateSummary(messages);
      expect(summary).toBeDefined();
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);
    });

    it('should handle empty message array', async () => {
      const summary = await service.generateSummary([]);
      expect(summary).toBeDefined();
    });
  });

  describe('endConversation', () => {
    it('should end conversation without errors', () => {
      expect(() => service.endConversation()).not.toThrow();
    });

    it('should allow starting new conversation after ending', async () => {
      await service.startConversation(ConversationTopic.DAILY);
      service.endConversation();

      const result = await service.startConversation(ConversationTopic.TRAVEL);
      expect(result).toBeDefined();
    });
  });

  describe('sentence length configuration', () => {
    it('should initialize with default medium length', async () => {
      const defaultService = new GeminiService('test-api-key');
      const result = await defaultService.startConversation(
        ConversationTopic.DAILY,
      );
      expect(result).toBeDefined();
      defaultService.endConversation();
    });

    it('should initialize with short sentence length', async () => {
      const shortService = new GeminiService('test-api-key', 'short');
      const result = await shortService.startConversation(
        ConversationTopic.DAILY,
      );
      expect(result).toBeDefined();
      shortService.endConversation();
    });

    it('should initialize with medium sentence length', async () => {
      const mediumService = new GeminiService('test-api-key', 'medium');
      const result = await mediumService.startConversation(
        ConversationTopic.DAILY,
      );
      expect(result).toBeDefined();
      mediumService.endConversation();
    });

    it('should initialize with long sentence length', async () => {
      const longService = new GeminiService('test-api-key', 'long');
      const result = await longService.startConversation(
        ConversationTopic.DAILY,
      );
      expect(result).toBeDefined();
      longService.endConversation();
    });

    it('should accept all valid sentence length values', () => {
      const lengths: SentenceLength[] = ['short', 'medium', 'long'];
      lengths.forEach(length => {
        expect(() => new GeminiService('test-api-key', length)).not.toThrow();
      });
    });
  });

  describe('setTokenUsageCallback', () => {
    it('should accept and store callback function', () => {
      const mockCallback = jest.fn();
      service.setTokenUsageCallback(mockCallback);

      // Test passes if no error is thrown
      expect(true).toBe(true);
    });

    it('should work without callback set', async () => {
      // Should not throw error when no callback is set
      await service.startConversation(ConversationTopic.DAILY);
      await expect(service.sendMessage('Hello')).resolves.toBeDefined();
    });

    it('should retrieve token usage after API calls', async () => {
      await service.startConversation(ConversationTopic.DAILY);
      await service.sendMessage('Hello');

      const tokenUsage = service.getSessionTokenUsage();

      // Token usage should be defined with correct structure
      expect(tokenUsage).toHaveProperty('inputTokens');
      expect(tokenUsage).toHaveProperty('outputTokens');
      expect(tokenUsage).toHaveProperty('totalTokens');
      expect(tokenUsage).toHaveProperty('estimatedCost');

      // Values should be numbers (may be 0 in test environment)
      expect(typeof tokenUsage.inputTokens).toBe('number');
      expect(typeof tokenUsage.outputTokens).toBe('number');
      expect(typeof tokenUsage.totalTokens).toBe('number');
      expect(typeof tokenUsage.estimatedCost).toBe('number');
    });
  });

  describe('getCJKCharacterBreakdown', () => {
    it('should return breakdown for Chinese text', async () => {
      const chineseService = new GeminiService(
        'test-api-key',
        'medium',
        'zh',
        'en',
      );

      const breakdown =
        await chineseService.getCJKCharacterBreakdown('你好');

      expect(Array.isArray(breakdown)).toBe(true);
      if (breakdown.length > 0) {
        expect(breakdown[0]).toHaveProperty('character');
        expect(breakdown[0]).toHaveProperty('meaning');
        expect(breakdown[0]).toHaveProperty('pronunciation');
      }

      chineseService.endConversation();
    });

    it('should return breakdown for Japanese text', async () => {
      const japaneseService = new GeminiService(
        'test-api-key',
        'medium',
        'ja',
        'en',
      );

      const breakdown =
        await japaneseService.getCJKCharacterBreakdown('こんにちは');

      expect(Array.isArray(breakdown)).toBe(true);
      if (breakdown.length > 0) {
        expect(breakdown[0]).toHaveProperty('character');
        expect(breakdown[0]).toHaveProperty('meaning');
        expect(breakdown[0]).toHaveProperty('pronunciation');
        // Japanese may have reading field
        if (breakdown[0].reading) {
          expect(typeof breakdown[0].reading).toBe('string');
        }
      }

      japaneseService.endConversation();
    });

    it('should return empty array for non-CJK languages', async () => {
      const englishService = new GeminiService(
        'test-api-key',
        'medium',
        'en',
        'ko',
      );

      const breakdown =
        await englishService.getCJKCharacterBreakdown('Hello');

      expect(Array.isArray(breakdown)).toBe(true);
      expect(breakdown.length).toBe(0);

      englishService.endConversation();
    });

    it('should handle empty text gracefully', async () => {
      const chineseService = new GeminiService(
        'test-api-key',
        'medium',
        'zh',
        'en',
      );

      const breakdown = await chineseService.getCJKCharacterBreakdown('');

      expect(Array.isArray(breakdown)).toBe(true);

      chineseService.endConversation();
    });
  });
});
