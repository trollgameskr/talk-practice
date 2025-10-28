/**
 * Gemini API Configuration
 */

export const GEMINI_CONFIG = {
  apiKey: process.env.GEMINI_API_KEY || '',
  model: 'gemini-2.5-flash-lite-preview-09-2025',

  // Voice settings
  voice: {
    sampleRate: 16000,
    encoding: 'LINEAR16',
    languageCode: 'en-US',
  },

  // Generation settings
  generation: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
    candidateCount: 1,
  },

  // Safety settings
  safety: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
  ],
};

export const CONVERSATION_CONFIG = {
  maxDuration: 1800, // 30 minutes in seconds
  minSessionDuration: 60, // 1 minute
  feedbackDelay: 2000, // 2 seconds
  autoSaveInterval: 30000, // 30 seconds
};

// Sentence length options for AI responses and suggested user responses
export type SentenceLength = 'short' | 'medium' | 'long';

export const SENTENCE_LENGTH_CONFIG = {
  short: {
    label: 'Short',
    description: '1-2 sentences (Quick and easy)',
    guideline: 'Keep responses to 1-2 short sentences (10-20 words total)',
  },
  medium: {
    label: 'Medium',
    description: '2-3 sentences (Balanced)',
    guideline: 'Keep responses to 2-3 sentences (20-35 words total)',
  },
  long: {
    label: 'Long',
    description: '3-5 sentences (Detailed)',
    guideline:
      'Provide detailed responses with 3-5 sentences (35-60 words total)',
  },
};

// Voice accent options
export type VoiceAccent = 'en-US' | 'en-GB' | 'en-AU' | 'en-IN' | 'en-CA';

export const VOICE_ACCENT_OPTIONS = {
  'en-US': {
    label: 'American English',
    code: 'en-US',
  },
  'en-GB': {
    label: 'British English',
    code: 'en-GB',
  },
  'en-AU': {
    label: 'Australian English',
    code: 'en-AU',
  },
  'en-IN': {
    label: 'Indian English',
    code: 'en-IN',
  },
  'en-CA': {
    label: 'Canadian English',
    code: 'en-CA',
  },
};

// Feature 6: Voice personality types
export type VoicePersonality =
  | 'cheerful_male'
  | 'calm_male'
  | 'friendly_male'
  | 'serious_male'
  | 'humorous_male'
  | 'cautious_male'
  | 'lively_female'
  | 'energetic_female'
  | 'calm_female'
  | 'warm_female'
  | 'cheerful_female'
  | 'cautious_female';

export const VOICE_PERSONALITY_OPTIONS = {
  cheerful_male: {
    label: '괘활한 남성',
    labelEn: 'Cheerful Male',
    code: 'cheerful_male',
  },
  calm_male: {
    label: '차분한 남자',
    labelEn: 'Calm Male',
    code: 'calm_male',
  },
  friendly_male: {
    label: '친절한 아저씨',
    labelEn: 'Friendly Male',
    code: 'friendly_male',
  },
  serious_male: {
    label: '진지한 남자',
    labelEn: 'Serious Male',
    code: 'serious_male',
  },
  humorous_male: {
    label: '유머러스한 남자',
    labelEn: 'Humorous Male',
    code: 'humorous_male',
  },
  cautious_male: {
    label: '신중한 남자',
    labelEn: 'Cautious Male',
    code: 'cautious_male',
  },
  lively_female: {
    label: '발랄한 여성',
    labelEn: 'Lively Female',
    code: 'lively_female',
  },
  energetic_female: {
    label: '활기찬 소녀',
    labelEn: 'Energetic Female',
    code: 'energetic_female',
  },
  calm_female: {
    label: '차분한 여자',
    labelEn: 'Calm Female',
    code: 'calm_female',
  },
  warm_female: {
    label: '따뜻한 언니',
    labelEn: 'Warm Female',
    code: 'warm_female',
  },
  cheerful_female: {
    label: '유쾌한 여자',
    labelEn: 'Cheerful Female',
    code: 'cheerful_female',
  },
  cautious_female: {
    label: '신중한 여자',
    labelEn: 'Cautious Female',
    code: 'cautious_female',
  },
};

// Gemini 1.5 Pro pricing (as of 2024)
// See: https://ai.google.dev/pricing
export const GEMINI_PRICING = {
  inputPer1K: 0.00125, // $0.00125 per 1K input tokens (prompts <= 128K tokens)
  outputPer1K: 0.005, // $0.005 per 1K output tokens
};

// Storage keys
export const STORAGE_KEYS = {
  API_KEY: '@gemini_api_key',
  SENTENCE_LENGTH: '@sentence_length',
  AUTO_READ_RESPONSE: '@auto_read_response',
  SHOW_TRANSLATION: '@show_translation',
  SHOW_PRONUNCIATION: '@show_pronunciation',
  SHOW_GRAMMAR_HIGHLIGHTS: '@show_grammar_highlights',
  AI_VOICE_ACCENT: '@ai_voice_accent',
  RESPONSE_VOICE_ACCENT: '@response_voice_accent',
  AI_VOICE_PERSONALITY: '@ai_voice_personality',
  RESPONSE_VOICE_PERSONALITY: '@response_voice_personality',
  TEXT_ONLY_MODE: '@text_only_mode',
} as const;
