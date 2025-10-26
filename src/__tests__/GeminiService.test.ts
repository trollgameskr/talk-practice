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
});
