/**
 * Storage Service
 * Handles learning log and achievement tracking with AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ConversationSession,
  UserProgress,
  ConversationTopic,
  TopicProgress,
  Achievement,
} from '../types';

const STORAGE_KEYS = {
  SESSIONS: '@gemini_talk_sessions',
  USER_PROGRESS: '@gemini_talk_progress',
  CURRENT_SESSION: '@gemini_talk_current_session',
};

export class StorageService {
  /**
   * Save a conversation session
   */
  async saveSession(session: ConversationSession): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      sessions.push(session);
      await AsyncStorage.setItem(
        STORAGE_KEYS.SESSIONS,
        JSON.stringify(sessions),
      );
      
      // Update user progress
      await this.updateUserProgress(session);
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  }

  /**
   * Get all conversation sessions
   */
  async getAllSessions(): Promise<ConversationSession[]> {
    try {
      const sessionsJson = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (!sessionsJson) {
        return [];
      }
      return JSON.parse(sessionsJson);
    } catch (error) {
      console.error('Error getting sessions:', error);
      return [];
    }
  }

  /**
   * Get sessions by topic
   */
  async getSessionsByTopic(topic: ConversationTopic): Promise<ConversationSession[]> {
    const sessions = await this.getAllSessions();
    return sessions.filter(s => s.topic === topic);
  }

  /**
   * Save current session (for auto-save)
   */
  async saveCurrentSession(session: Partial<ConversationSession>): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_SESSION,
        JSON.stringify(session),
      );
    } catch (error) {
      console.error('Error saving current session:', error);
    }
  }

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<Partial<ConversationSession> | null> {
    try {
      const sessionJson = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
      if (!sessionJson) {
        return null;
      }
      return JSON.parse(sessionJson);
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  /**
   * Clear current session
   */
  async clearCurrentSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    } catch (error) {
      console.error('Error clearing current session:', error);
    }
  }

  /**
   * Update user progress based on completed session
   */
  async updateUserProgress(session: ConversationSession): Promise<void> {
    try {
      const progress = await this.getUserProgress();
      
      // Update overall stats
      progress.totalSessions += 1;
      progress.totalDuration += session.duration;
      progress.averageSessionDuration = 
        progress.totalDuration / progress.totalSessions;

      // Update topic progress
      const topicProg = progress.topicProgress[session.topic];
      topicProg.sessionsCompleted += 1;
      topicProg.lastSessionDate = new Date(session.endTime || session.startTime);
      
      // Calculate average score
      if (session.feedback) {
        const sessionScore = this.calculateSessionScore(session);
        topicProg.averageScore = 
          (topicProg.averageScore * (topicProg.sessionsCompleted - 1) + sessionScore) /
          topicProg.sessionsCompleted;
      }

      // Calculate overall score
      progress.overallScore = this.calculateOverallScore(progress);

      // Check for achievements
      const newAchievements = this.checkAchievements(progress);
      progress.achievements.push(...newAchievements);

      // Calculate retention rate (simplified)
      progress.retentionRate = this.calculateRetentionRate(await this.getAllSessions());

      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROGRESS,
        JSON.stringify(progress),
      );
    } catch (error) {
      console.error('Error updating user progress:', error);
    }
  }

  /**
   * Get user progress
   */
  async getUserProgress(): Promise<UserProgress> {
    try {
      const progressJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
      if (!progressJson) {
        return this.getDefaultProgress();
      }
      return JSON.parse(progressJson);
    } catch (error) {
      console.error('Error getting user progress:', error);
      return this.getDefaultProgress();
    }
  }

  /**
   * Get default user progress structure
   */
  private getDefaultProgress(): UserProgress {
    return {
      userId: 'default_user',
      totalSessions: 0,
      totalDuration: 0,
      averageSessionDuration: 0,
      topicProgress: {
        [ConversationTopic.DAILY]: this.getDefaultTopicProgress(),
        [ConversationTopic.TRAVEL]: this.getDefaultTopicProgress(),
        [ConversationTopic.BUSINESS]: this.getDefaultTopicProgress(),
        [ConversationTopic.CASUAL]: this.getDefaultTopicProgress(),
        [ConversationTopic.PROFESSIONAL]: this.getDefaultTopicProgress(),
      },
      overallScore: 0,
      achievements: [],
      retentionRate: 0,
    };
  }

  /**
   * Get default topic progress
   */
  private getDefaultTopicProgress(): TopicProgress {
    return {
      sessionsCompleted: 0,
      averageScore: 0,
      lastSessionDate: new Date(),
      improvementRate: 0,
    };
  }

  /**
   * Calculate session score from feedback
   */
  private calculateSessionScore(session: ConversationSession): number {
    if (!session.feedback) {
      return 0;
    }
    
    const {pronunciation, grammar, fluency, vocabulary} = session.feedback;
    return (
      pronunciation.score +
      grammar.score +
      fluency +
      vocabulary.score
    ) / 4;
  }

  /**
   * Calculate overall score across all topics
   */
  private calculateOverallScore(progress: UserProgress): number {
    const scores = Object.values(progress.topicProgress)
      .filter(tp => tp.sessionsCompleted > 0)
      .map(tp => tp.averageScore);
    
    if (scores.length === 0) {
      return 0;
    }
    
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  /**
   * Check for new achievements
   */
  private checkAchievements(progress: UserProgress): Achievement[] {
    const achievements: Achievement[] = [];
    const existingIds = new Set(progress.achievements.map(a => a.id));

    // First session achievement
    if (progress.totalSessions === 1 && !existingIds.has('first_session')) {
      achievements.push({
        id: 'first_session',
        title: 'First Steps',
        description: 'Completed your first conversation session!',
        earnedDate: new Date(),
        icon: '🎉',
      });
    }

    // 10 sessions achievement
    if (progress.totalSessions === 10 && !existingIds.has('ten_sessions')) {
      achievements.push({
        id: 'ten_sessions',
        title: 'Dedicated Learner',
        description: 'Completed 10 conversation sessions!',
        earnedDate: new Date(),
        icon: '⭐',
      });
    }

    // 1 hour total achievement
    if (progress.totalDuration >= 3600 && !existingIds.has('one_hour')) {
      achievements.push({
        id: 'one_hour',
        title: 'Hour of Practice',
        description: 'Practiced for a total of 1 hour!',
        earnedDate: new Date(),
        icon: '⏰',
      });
    }

    // High score achievement
    if (progress.overallScore >= 90 && !existingIds.has('high_score')) {
      achievements.push({
        id: 'high_score',
        title: 'Excellence',
        description: 'Achieved an overall score of 90+!',
        earnedDate: new Date(),
        icon: '🏆',
      });
    }

    return achievements;
  }

  /**
   * Calculate retention rate (simplified)
   */
  private calculateRetentionRate(sessions: ConversationSession[]): number {
    if (sessions.length < 2) {
      return 100;
    }

    // Calculate based on session frequency
    const now = new Date();
    const recentSessions = sessions.filter(s => {
      const sessionDate = new Date(s.startTime);
      const daysDiff = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30;
    });

    return Math.min(100, (recentSessions.length / sessions.length) * 100);
  }

  /**
   * Clear all data
   */
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.SESSIONS,
        STORAGE_KEYS.USER_PROGRESS,
        STORAGE_KEYS.CURRENT_SESSION,
      ]);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  /**
   * Export data as JSON
   */
  async exportData(): Promise<string> {
    const sessions = await this.getAllSessions();
    const progress = await this.getUserProgress();
    
    return JSON.stringify({
      sessions,
      progress,
      exportDate: new Date().toISOString(),
    }, null, 2);
  }
}

export default StorageService;
