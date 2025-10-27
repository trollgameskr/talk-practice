/**
 * Gemini Live API Service
 * Handles real-time voice recognition and natural language responses
 */

import {GoogleGenerativeAI} from '@google/generative-ai';
import {
  GEMINI_CONFIG,
  GEMINI_PRICING,
  SentenceLength,
  SENTENCE_LENGTH_CONFIG,
} from '../config/gemini.config';
import {ConversationTopic, Message, Feedback, TokenUsage} from '../types';
import {getConversationPrompts} from '../data/conversationPrompts';
import {LANGUAGE_NAMES} from '../utils/helpers';

export class GeminiService {
  private genAI!: GoogleGenerativeAI;
  private model: any;
  private chat: any;
  private currentTopic: ConversationTopic | null = null;
  private sentenceLength: SentenceLength = 'medium';
  private targetLanguage: string = 'en';
  private nativeLanguage: string = 'en';
  private sessionTokenUsage: TokenUsage = {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    estimatedCost: 0,
  };
  private onTokenUsageUpdate?: (tokenUsage: TokenUsage) => void;

  constructor(
    apiKey: string,
    sentenceLength?: SentenceLength,
    targetLanguage?: string,
    nativeLanguage?: string,
  ) {
    if (sentenceLength) {
      this.sentenceLength = sentenceLength;
    }
    if (targetLanguage) {
      this.targetLanguage = targetLanguage;
    }
    if (nativeLanguage) {
      this.nativeLanguage = nativeLanguage;
    }
    // The GoogleGenerativeAI constructor expects a plain string API key
    // Wrap in try/catch to surface errors.
    try {
      // Initialize the Google client with the provided API key
      // This works both in browser and non-browser environments when an API key is provided
      if (apiKey) {
        // Pass the API key directly as a string to the constructor
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
          model: GEMINI_CONFIG.model,
          generationConfig: GEMINI_CONFIG.generation,
        });
      }
    } catch (err) {
      console.error('Failed to initialize GoogleGenerativeAI:', err);
      // Rethrow so callers know initialization failed
      throw err;
    }
  }

  /**
   * Set callback to be called when token usage is updated
   */
  setTokenUsageCallback(callback: (tokenUsage: TokenUsage) => void) {
    this.onTokenUsageUpdate = callback;
  }

  /**
   * Initialize a new conversation session
   */
  async startConversation(topic: ConversationTopic): Promise<string> {
    this.currentTopic = topic;
    const conversationPrompts = getConversationPrompts(
      this.targetLanguage,
      this.nativeLanguage,
    );
    const prompt = conversationPrompts[topic];
    const lengthGuideline =
      SENTENCE_LENGTH_CONFIG[this.sentenceLength].guideline;
    const targetLangName = LANGUAGE_NAMES[this.targetLanguage] || 'English';

    if (this.model && typeof this.model.startChat === 'function') {
      this.chat = this.model.startChat({
        history: [
          {
            role: 'user',
            parts: [
              {
                text: `${prompt.systemPrompt}\n\nIMPORTANT: ${lengthGuideline}. This applies to all your responses.`,
              },
            ],
          },
          {
            role: 'model',
            parts: [
              {
                text: `I understand. I'm ready to help you practice ${targetLangName} conversation about ${topic}. Let's begin!`,
              },
            ],
          },
        ],
        generationConfig: GEMINI_CONFIG.generation,
      });
    }

    // Get a starter prompt (local static selection)
    const starterIndex = Math.floor(
      Math.random() * prompt.starterPrompts.length,
    );
    return prompt.starterPrompts[starterIndex];
  }

  /**
   * Send a message and get a response
   */
  async sendMessage(userMessage: string): Promise<string> {
    if (!this.chat) {
      throw new Error(
        'Conversation not started. Call startConversation first.',
      );
    }

    try {
      const result = await this.chat.sendMessage(userMessage);
      if (!result) {
        throw new Error('No result from chat.sendMessage');
      }

      const response = result.response;
      if (!response) {
        console.error('No response object on result from sendMessage:', result);
        throw new Error('Invalid response from model');
      }

      // Track token usage if available
      if (response.usageMetadata) {
        this.updateTokenUsage(response.usageMetadata);
      }

      // response.text may be a function returning the text
      const text =
        typeof response.text === 'function' ? response.text() : response.text;
      if (!text || (typeof text === 'string' && text.trim().length === 0)) {
        console.warn(
          'Model returned empty text for user message:',
          userMessage,
          result,
        );
      }
      return text;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Update token usage tracking
   */
  private updateTokenUsage(usageMetadata: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  }) {
    const inputTokens = usageMetadata.promptTokenCount || 0;
    const outputTokens = usageMetadata.candidatesTokenCount || 0;
    const totalTokens =
      usageMetadata.totalTokenCount || inputTokens + outputTokens;

    this.sessionTokenUsage.inputTokens += inputTokens;
    this.sessionTokenUsage.outputTokens += outputTokens;
    this.sessionTokenUsage.totalTokens += totalTokens;

    // Calculate cost
    const inputCost = (inputTokens / 1000) * GEMINI_PRICING.inputPer1K;
    const outputCost = (outputTokens / 1000) * GEMINI_PRICING.outputPer1K;
    this.sessionTokenUsage.estimatedCost += inputCost + outputCost;

    // Notify callback with the incremental token usage for this API call
    if (this.onTokenUsageUpdate) {
      this.onTokenUsageUpdate({
        inputTokens,
        outputTokens,
        totalTokens,
        estimatedCost: inputCost + outputCost,
      });
    }
  }

  /**
   * Get current session token usage
   */
  getSessionTokenUsage(): TokenUsage {
    return {...this.sessionTokenUsage};
  }

  /**
   * Reset session token usage
   */
  resetSessionTokenUsage() {
    this.sessionTokenUsage = {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      estimatedCost: 0,
    };
  }

  /**
   * Analyze user's response and provide feedback
   */
  async analyzeFeedback(userMessage: string): Promise<Feedback> {
    const feedbackPrompt = `Analyze this English sentence for pronunciation patterns, grammar, and vocabulary usage. Provide constructive feedback:

Sentence: "${userMessage}"

Provide feedback in JSON format with:
1. Pronunciation score (0-100) and potential issues
2. Grammar score (0-100) and errors with corrections
3. Fluency score (0-100)
4. Vocabulary score (0-100) and suggestions

Be encouraging and constructive.`;

    try {
      if (!this.model) {
        throw new Error('Model not initialized');
      }

      const result = await this.model.generateContent(feedbackPrompt);
      const response = result.response.text();

      // Parse the response to extract feedback
      return this.parseFeedbackResponse(response, userMessage);
    } catch (error) {
      console.error('Error analyzing feedback:', error);
      // Return default feedback on error
      return this.getDefaultFeedback();
    }
  }

  /**
   * Parse feedback response from Gemini
   */
  private parseFeedbackResponse(
    response: string,
    _originalMessage: string,
  ): Feedback {
    // Try to parse JSON response or extract information
    try {
      // Look for JSON in the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return this.formatFeedback(parsed);
      }
    } catch (e) {
      // If parsing fails, extract information from text
    }

    // Default feedback structure
    return this.getDefaultFeedback();
  }

  /**
   * Format parsed feedback into our structure
   */
  private formatFeedback(parsed: any): Feedback {
    return {
      pronunciation: {
        score: parsed.pronunciation?.score || 85,
        issues: parsed.pronunciation?.issues || [],
      },
      grammar: {
        score: parsed.grammar?.score || 85,
        errors: parsed.grammar?.errors || [],
      },
      fluency: parsed.fluency?.score || 85,
      vocabulary: {
        score: parsed.vocabulary?.score || 85,
        suggestions: parsed.vocabulary?.suggestions || [],
        usedWords: [],
      },
    };
  }

  /**
   * Get default feedback when analysis fails
   */
  private getDefaultFeedback(): Feedback {
    return {
      pronunciation: {
        score: 85,
        issues: [],
      },
      grammar: {
        score: 85,
        errors: [],
      },
      fluency: 85,
      vocabulary: {
        score: 85,
        suggestions: [],
        usedWords: [],
      },
    };
  }

  /**
   * Generate a conversation summary
   */
  async generateSummary(messages: Message[]): Promise<string> {
    const conversation = messages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    const summaryPrompt = `Summarize this English conversation practice session. Highlight key topics discussed, strengths shown, and areas for improvement:

${conversation}

Provide an encouraging summary in 2-3 sentences.`;

    try {
      if (!this.model) {
        throw new Error('Model not initialized');
      }

      const result = await this.model.generateContent(summaryPrompt);
      return result.response.text();
    } catch (error) {
      console.error('Error generating summary:', error);
      return 'Great conversation practice! Keep up the good work.';
    }
  }

  /**
   * Generate sample answers for the current conversation context
   */
  async generateSampleAnswers(
    lastMessage: string,
    count: number = 2,
  ): Promise<string[]> {
    const targetLangName = LANGUAGE_NAMES[this.targetLanguage] || 'English';

    const lengthGuideline =
      SENTENCE_LENGTH_CONFIG[this.sentenceLength].guideline;
    const samplePrompt = `Based on the question or statement: "${lastMessage}"

Generate ${count} different sample responses that a learner could use to practice ${targetLangName}. Make them:
1. Natural and conversational in ${targetLangName}
2. At an intermediate ${targetLangName} level
3. Appropriate for the context
4. Slightly different in tone or approach
5. ${lengthGuideline}

Format: Return only the sample responses in ${targetLangName}, one per line, without numbering or extra text.`;

    if (!this.chat) {
      throw new Error('Conversation not started');
    }

    try {
      if (!this.model) {
        throw new Error('Model not initialized');
      }

      const result = await this.model.generateContent(samplePrompt);
      const response = result.response.text();

      // Split by newlines and filter out empty lines
      const samples = response
        .split('\n')
        .filter((line: string) => line.trim().length > 0)
        .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, count);

      const defaultSamples = [
        'I understand what you mean.',
        'That sounds interesting, could you tell me more?',
      ];

      // Ensure at least 2 samples (or requested count if it's less than 2)
      while (samples.length < Math.min(2, count)) {
        const next = defaultSamples.shift();
        if (!next) {
          break;
        }
        samples.push(next);
      }

      return samples.length > 0
        ? samples
        : defaultSamples.slice(0, Math.min(2, count));
    } catch (error) {
      console.error('Error generating sample answers:', error);
      // Return default samples on error
      return [
        'I understand what you mean.',
        'That sounds interesting, could you tell me more?',
      ];
    }
  }

  /**
   * Get word definition and explanation
   */
  async getWordDefinition(
    word: string,
  ): Promise<{definition: string; examples: string[]}> {
    const targetLangName = LANGUAGE_NAMES[this.targetLanguage] || 'English';
    const nativeLangName = LANGUAGE_NAMES[this.nativeLanguage] || 'English';

    const definitionPrompt = `Provide a clear and concise explanation of the ${targetLangName} word or phrase "${word}" in ${nativeLangName}, along with 2 example sentences in ${targetLangName}.

Please format your response as JSON:
{
  "definition": "A simple explanation in ${nativeLangName}",
  "examples": ["example sentence 1 in ${targetLangName}", "example sentence 2 in ${targetLangName}"]
}`;

    try {
      if (!this.model) {
        throw new Error('Model not initialized');
      }

      const result = await this.model.generateContent(definitionPrompt);
      const response = result.response.text();

      // Try to parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          definition: parsed.definition || 'Definition not available',
          examples: parsed.examples || [],
        };
      }

      // Fallback if JSON parsing fails
      return {
        definition: 'Definition not available',
        examples: [],
      };
    } catch (error) {
      console.error('Error getting word definition:', error);
      return {
        definition: 'Definition not available',
        examples: [],
      };
    }
  }

  /**
   * End the current conversation
   */
  endConversation() {
    this.chat = null;
    this.currentTopic = null;
    this.resetSessionTokenUsage();
  }
}

export default GeminiService;
