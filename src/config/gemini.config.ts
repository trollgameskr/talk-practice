/**
 * Gemini API Configuration
 */

export const GEMINI_CONFIG = {
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

// Gemini 1.5 Pro pricing (as of 2024)
// See: https://ai.google.dev/pricing
export const GEMINI_PRICING = {
  inputPer1K: 0.00125, // $0.00125 per 1K input tokens (prompts <= 128K tokens)
  outputPer1K: 0.005, // $0.005 per 1K output tokens
};

// Storage keys
export const STORAGE_KEYS = {
  API_KEY: '@gemini_api_key',
  TTS_API_KEY: '@tts_api_key',
  SENTENCE_LENGTH: '@sentence_length',
  AUTO_READ_RESPONSE: '@auto_read_response',
  SHOW_TRANSLATION: '@show_translation',
  SHOW_PRONUNCIATION: '@show_pronunciation',
  SHOW_GRAMMAR_HIGHLIGHTS: '@show_grammar_highlights',
  TEXT_ONLY_MODE: '@text_only_mode',
  TTS_CONFIG: '@tts_config',
} as const;
