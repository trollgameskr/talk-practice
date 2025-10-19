/**
 * Type definitions for GeminiTalk
 */

export enum ConversationTopic {
  DAILY = 'daily',
  TRAVEL = 'travel',
  BUSINESS = 'business',
  CASUAL = 'casual',
  PROFESSIONAL = 'professional',
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface Feedback {
  pronunciation: PronunciationFeedback;
  grammar: GrammarFeedback;
  fluency: number; // 0-100
  vocabulary: VocabularyFeedback;
}

export interface PronunciationFeedback {
  score: number; // 0-100
  issues: Array<{
    word: string;
    suggestedPronunciation: string;
    confidence: number;
  }>;
}

export interface GrammarFeedback {
  score: number; // 0-100
  errors: Array<{
    text: string;
    correction: string;
    type: string;
    explanation: string;
  }>;
}

export interface VocabularyFeedback {
  score: number; // 0-100
  suggestions: string[];
  usedWords: string[];
}

export interface ConversationSession {
  id: string;
  topic: ConversationTopic;
  startTime: Date;
  endTime?: Date;
  messages: Message[];
  feedback?: Feedback;
  duration: number; // in seconds
}

export interface UserProgress {
  userId: string;
  totalSessions: number;
  totalDuration: number; // in seconds
  averageSessionDuration: number;
  topicProgress: Record<ConversationTopic, TopicProgress>;
  overallScore: number;
  achievements: Achievement[];
  retentionRate: number; // 0-100
}

export interface TopicProgress {
  sessionsCompleted: number;
  averageScore: number;
  lastSessionDate: Date;
  improvementRate: number; // percentage
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedDate: Date;
  icon: string;
}

export interface ConversationPrompt {
  topic: ConversationTopic;
  systemPrompt: string;
  starterPrompts: string[];
  keywords: string[];
}
