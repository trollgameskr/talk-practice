/**
 * AI Voice Service
 * Handles AI-generated voice synthesis using Google Cloud Text-to-Speech API
 * This service generates natural-sounding AI voices instead of using basic TTS
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {TTSConfig, DEFAULT_TTS_CONFIG} from '../config/tts.config';
import {STORAGE_KEYS} from '../config/gemini.config';

/**
 * TTS Model types and their capabilities
 */
export type TTSModel = 'Google Cloud TTS';

export interface TTSCapabilities {
  model: TTSModel;
}

export class AIVoiceService {
  private isInitialized: boolean = false;
  private isSpeaking: boolean = false;
  private currentAudio: any = null; // HTMLAudioElement in browser
  private apiKey: string = '';
  private ttsConfig: TTSConfig = DEFAULT_TTS_CONFIG;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || '';
    this.initialize();
  }

  /**
   * Initialize AI Voice Service
   */
  private async initialize() {
    try {
      // Load TTS configuration from storage
      await this.loadTTSConfig();
      this.isInitialized = true;
      console.log('AI Voice Service initialized');
    } catch (error) {
      console.error('Error initializing AI Voice Service:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Load TTS configuration from storage
   */
  private async loadTTSConfig() {
    try {
      const savedConfig = await AsyncStorage.getItem(STORAGE_KEYS.TTS_CONFIG);
      if (savedConfig) {
        this.ttsConfig = JSON.parse(savedConfig);
      } else {
        this.ttsConfig = DEFAULT_TTS_CONFIG;
      }
    } catch (error) {
      console.error('Error loading TTS config:', error);
      this.ttsConfig = DEFAULT_TTS_CONFIG;
    }
  }

  /**
   * Update TTS configuration
   */
  async updateTTSConfig(config: Partial<TTSConfig>) {
    this.ttsConfig = {...this.ttsConfig, ...config};
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.TTS_CONFIG,
        JSON.stringify(this.ttsConfig),
      );
    } catch (error) {
      console.error('Error saving TTS config:', error);
    }
  }

  /**
   * Get current TTS configuration
   */
  getTTSConfig(): TTSConfig {
    return this.ttsConfig;
  }

  /**
   * Synthesize speech using AI-generated voices
   * Uses Google Cloud TTS API
   */
  async speak(text: string): Promise<void> {
    // Stop any ongoing speech
    if (this.isSpeaking) {
      await this.stopSpeaking();
    }

    try {
      // Use Google Cloud TTS API for AI voice generation
      const audioContent = await this.generateAIVoice(text);
      if (audioContent) {
        await this.playAudio(audioContent);
        return;
      }
    } catch (error) {
      console.error('Failed to generate AI voice:', error);
      throw error;
    }
  }

  /**
   * Generate AI voice using Google Cloud Text-to-Speech API
   * Note: This requires a valid API key and proper CORS setup
   */
  private async generateAIVoice(text: string): Promise<string | null> {
    // Skip Google Cloud TTS if no API key is configured
    if (!this.apiKey) {
      throw new Error('API key is required for voice generation');
    }

    try {
      const url = `${this.ttsConfig.endpoint}/v1/text:synthesize?key=${this.apiKey}`;

      // Use custom voice if enabled, otherwise use selected voice
      const voiceName = this.ttsConfig.useCustomVoice && this.ttsConfig.customVoiceName
        ? this.ttsConfig.customVoiceName
        : this.ttsConfig.voiceName;
      
      const languageCode = this.ttsConfig.useCustomVoice && this.ttsConfig.customLanguageCode
        ? this.ttsConfig.customLanguageCode
        : this.ttsConfig.languageCode;
      
      const gender = this.ttsConfig.useCustomVoice && this.ttsConfig.customGender
        ? this.ttsConfig.customGender
        : this.ttsConfig.ssmlGender;

      const requestBody = {
        input: {
          text: text,
        },
        voice: {
          languageCode: languageCode,
          name: voiceName,
          ssmlGender: gender,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: this.ttsConfig.speakingRate,
          pitch: this.ttsConfig.pitch,
          volumeGainDb: this.ttsConfig.volumeGainDb,
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.audioContent; // Base64 encoded audio
    } catch (error) {
      console.error('Error generating AI voice:', error);
      throw error;
    }
  }

  /**
   * Play audio content
   */
  private async playAudio(base64Audio: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.isSpeaking = true;

        // Create audio element with base64 data (browser only)
        const audioSrc = `data:audio/mp3;base64,${base64Audio}`;

        // Use any type to avoid TypeScript DOM type issues
        const AudioConstructor = (globalThis as any).Audio;
        if (!AudioConstructor) {
          throw new Error('Audio API not available');
        }

        this.currentAudio = new AudioConstructor(audioSrc);

        // Wait for audio to be ready before playing to prevent cutting off the beginning
        this.currentAudio.oncanplay = () => {
          this.currentAudio.play().catch(reject);
        };

        this.currentAudio.onended = () => {
          this.isSpeaking = false;
          this.currentAudio = null;
          resolve();
        };

        this.currentAudio.onerror = (error: any) => {
          this.isSpeaking = false;
          this.currentAudio = null;
          reject(error);
        };

        // Trigger loading
        this.currentAudio.load();
      } catch (error) {
        this.isSpeaking = false;
        reject(error);
      }
    });
  }

  /**
   * Stop speaking
   */
  async stopSpeaking(): Promise<void> {
    // Stop audio playback if using AI-generated audio
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {
        // Ignore errors during cleanup
      }
      this.currentAudio = null;
    }

    this.isSpeaking = false;
  }

  /**
   * Check if currently speaking
   */
  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Set API key for AI voice generation
   */
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get the voice method currently being used
   */
  getVoiceMethod(): string {
    return 'Google Cloud TTS (AI 음성)';
  }

  /**
   * Get the TTS model that will be used based on current configuration
   */
  getCurrentTTSModel(): TTSModel {
    return 'Google Cloud TTS';
  }

  /**
   * Get capabilities of the current TTS model
   */
  getTTSCapabilities(): TTSCapabilities {
    return {
      model: 'Google Cloud TTS',
    };
  }

  /**
   * Cleanup
   */
  async destroy() {
    await this.stopSpeaking();
    this.isInitialized = false;
  }
}

export default AIVoiceService;
