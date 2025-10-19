/**
 * Gemini API Configuration
 */

export const GEMINI_CONFIG = {
  apiKey: process.env.GEMINI_API_KEY || '',
  model: 'gemini-1.5-pro',
  
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

// Gemini 1.5 Pro pricing (as of 2024)
// See: https://ai.google.dev/pricing
export const GEMINI_PRICING = {
  inputPer1K: 0.00125,  // $0.00125 per 1K input tokens (prompts <= 128K tokens)
  outputPer1K: 0.005,    // $0.005 per 1K output tokens
};
