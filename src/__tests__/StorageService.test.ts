/**
 * Tests for StorageService
 */

import StorageService from '../services/StorageService';
import {ConversationTopic, ConversationSession} from '../types';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    service = new StorageService();
  });

  afterEach(async () => {
    await service.clearAllData();
  });

  describe('saveSession', () => {
    it('should save a session', async () => {
      const session: ConversationSession = {
        id: 'test-session-1',
        topic: ConversationTopic.DAILY,
        startTime: new Date(),
        endTime: new Date(),
        messages: [],
        duration: 300,
      };

      await service.saveSession(session);
      const sessions = await service.getAllSessions();
      
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe('test-session-1');
    });

    it('should save multiple sessions', async () => {
      const session1: ConversationSession = {
        id: 'session-1',
        topic: ConversationTopic.DAILY,
        startTime: new Date(),
        duration: 300,
        messages: [],
      };

      const session2: ConversationSession = {
        id: 'session-2',
        topic: ConversationTopic.TRAVEL,
        startTime: new Date(),
        duration: 400,
        messages: [],
      };

      await service.saveSession(session1);
      await service.saveSession(session2);
      
      const sessions = await service.getAllSessions();
      expect(sessions).toHaveLength(2);
    });
  });

  describe('getAllSessions', () => {
    it('should return empty array when no sessions', async () => {
      const sessions = await service.getAllSessions();
      expect(sessions).toEqual([]);
    });

    it('should return all saved sessions', async () => {
      const session: ConversationSession = {
        id: 'test-session',
        topic: ConversationTopic.BUSINESS,
        startTime: new Date(),
        duration: 500,
        messages: [],
      };

      await service.saveSession(session);
      const sessions = await service.getAllSessions();
      
      expect(sessions).toHaveLength(1);
    });
  });

  describe('getSessionsByTopic', () => {
    it('should filter sessions by topic', async () => {
      const dailySession: ConversationSession = {
        id: 'daily-1',
        topic: ConversationTopic.DAILY,
        startTime: new Date(),
        duration: 300,
        messages: [],
      };

      const travelSession: ConversationSession = {
        id: 'travel-1',
        topic: ConversationTopic.TRAVEL,
        startTime: new Date(),
        duration: 400,
        messages: [],
      };

      await service.saveSession(dailySession);
      await service.saveSession(travelSession);
      
      const dailySessions = await service.getSessionsByTopic(ConversationTopic.DAILY);
      expect(dailySessions).toHaveLength(1);
      expect(dailySessions[0].topic).toBe(ConversationTopic.DAILY);
    });
  });

  describe('getUserProgress', () => {
    it('should return default progress for new user', async () => {
      const progress = await service.getUserProgress();
      
      expect(progress.totalSessions).toBe(0);
      expect(progress.totalDuration).toBe(0);
      expect(progress.overallScore).toBe(0);
      expect(progress.achievements).toEqual([]);
    });

    it('should update progress after saving session', async () => {
      const session: ConversationSession = {
        id: 'test-session',
        topic: ConversationTopic.DAILY,
        startTime: new Date(Date.now() - 300000),
        endTime: new Date(),
        duration: 300,
        messages: [],
      };

      await service.saveSession(session);
      const progress = await service.getUserProgress();
      
      expect(progress.totalSessions).toBe(1);
      expect(progress.totalDuration).toBe(300);
    });
  });

  describe('currentSession', () => {
    it('should save and retrieve current session', async () => {
      const partialSession = {
        id: 'current-session',
        topic: ConversationTopic.CASUAL,
        startTime: new Date(),
        messages: [],
      };

      await service.saveCurrentSession(partialSession);
      const retrieved = await service.getCurrentSession();
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('current-session');
    });

    it('should return null when no current session', async () => {
      const session = await service.getCurrentSession();
      expect(session).toBeNull();
    });

    it('should clear current session', async () => {
      const partialSession = {
        id: 'temp-session',
        topic: ConversationTopic.DAILY,
      };

      await service.saveCurrentSession(partialSession);
      await service.clearCurrentSession();
      
      const retrieved = await service.getCurrentSession();
      expect(retrieved).toBeNull();
    });
  });

  describe('clearAllData', () => {
    it('should clear all data', async () => {
      const session: ConversationSession = {
        id: 'test-session',
        topic: ConversationTopic.DAILY,
        startTime: new Date(),
        duration: 300,
        messages: [],
      };

      await service.saveSession(session);
      await service.clearAllData();
      
      const sessions = await service.getAllSessions();
      const progress = await service.getUserProgress();
      
      expect(sessions).toEqual([]);
      expect(progress.totalSessions).toBe(0);
    });
  });

  describe('exportData', () => {
    it('should export data as JSON string', async () => {
      const session: ConversationSession = {
        id: 'export-test',
        topic: ConversationTopic.PROFESSIONAL,
        startTime: new Date(),
        duration: 600,
        messages: [],
      };

      await service.saveSession(session);
      const jsonData = await service.exportData();
      
      expect(jsonData).toBeDefined();
      expect(typeof jsonData).toBe('string');
      
      const parsed = JSON.parse(jsonData);
      expect(parsed.sessions).toBeDefined();
      expect(parsed.progress).toBeDefined();
      expect(parsed.exportDate).toBeDefined();
    });
  });
});
