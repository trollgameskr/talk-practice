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
  translation?: string; // Translation to native language
  pronunciation?: string; // Phonetic pronunciation guide
  grammarHighlights?: GrammarHighlight[]; // Grammar patterns and idioms to highlight
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
  tokenUsage?: TokenUsage;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number; // in USD
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
  totalCost: number; // Total cost in USD
  totalTokens: number; // Total tokens used
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

export interface VocabularyWord {
  id: string;
  word: string;
  definition: string;
  examples: string[];
  addedDate: Date;
  fromSession?: string; // session ID where this word was encountered
  reviewed: boolean;
}

export interface GrammarHighlight {
  text: string; // The text to highlight
  type: 'grammar' | 'idiom' | 'phrase';
  explanation: string; // Explanation in native language
  examples?: string[]; // Usage examples
  startIndex: number; // Start position in the message
  endIndex: number; // End position in the message
}

export interface CJKCharacterBreakdown {
  character: string; // The individual character or word
  meaning: string; // Meaning/definition in native language
  pronunciation: string; // Pinyin for Chinese, Romaji for Japanese
  reading?: string; // Additional reading info (e.g., hiragana for Japanese)
}

export interface CJKSentenceBreakdown {
  original: string; // Original sentence
  characters: CJKCharacterBreakdown[]; // Character-by-character breakdown
}
