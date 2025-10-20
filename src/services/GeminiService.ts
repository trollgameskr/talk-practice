/**
 * Gemini Live API Service
 * Handles real-time voice recognition and natural language responses
 */

import {GoogleGenerativeAI} from '@google/generative-ai';
import {GEMINI_CONFIG, GEMINI_PRICING} from '../config/gemini.config';
import {ConversationTopic, Message, Feedback, TokenUsage} from '../types';
import {conversationPrompts} from '../data/conversationPrompts';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private chat: any;
  private currentTopic: ConversationTopic | null = null;
  private sessionTokenUsage: TokenUsage = {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    estimatedCost: 0,
  };

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey || GEMINI_CONFIG.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: GEMINI_CONFIG.model,
      generationConfig: GEMINI_CONFIG.generation,
    });
  }

  /**
   * Initialize a new conversation session
   */
  async startConversation(topic: ConversationTopic): Promise<string> {
    this.currentTopic = topic;
    const prompt = conversationPrompts[topic];

    this.chat = this.model.startChat({
      history: [
        {
          role: 'user',
          parts: [{text: prompt.systemPrompt}],
        },
        {
          role: 'model',
          parts: [
            {
              text: `I understand. I'm ready to help you practice English conversation about ${topic}. Let's begin!`,
            },
          ],
        },
      ],
      generationConfig: GEMINI_CONFIG.generation,
    });

    // Get a starter prompt
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
      const response = result.response;

      // Track token usage if available
      if (response.usageMetadata) {
        this.updateTokenUsage(response.usageMetadata);
      }

      return response.text();
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
      const result = await this.model.generateContent(feedbackPrompt);
      const response = result.response.text();

      // Parse the response to extract feedback
      // This is a simplified version - in production, you'd want more robust parsing
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
    if (!this.chat) {
      throw new Error(
        'Conversation not started. Call startConversation first.',
      );
    }

    const samplePrompt = `Based on the question or statement: "${lastMessage}"

Generate ${count} different sample responses that a learner could use to practice English. Make them:
1. Natural and conversational
2. At an intermediate English level
3. Appropriate for the context
4. Slightly different in tone or approach

Format: Return only the sample responses, one per line, without numbering or extra text.`;

    try {
      const result = await this.model.generateContent(samplePrompt);
      const response = result.response.text();

      // Split by newlines and filter out empty lines
      const samples = response
        .split('\n')
        .filter((line: string) => line.trim().length > 0)
        .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, count);

      return samples.length > 0
        ? samples
        : [
            'I understand what you mean.',
            'That sounds interesting, could you tell me more?',
          ];
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
    const definitionPrompt = `Provide a clear, concise definition and 2 example sentences for the English word or phrase: "${word}"

Format your response as JSON:
{
  "definition": "simple definition here",
  "examples": ["example sentence 1", "example sentence 2"]
}`;

    try {
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
