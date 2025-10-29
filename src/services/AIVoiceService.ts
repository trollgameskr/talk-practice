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
  private ttsConfig: TTSConfig = DEFAULT_TTS_CONFIG;
  private proxyUrl: string = '';
  private apiKey: string = '';

  constructor(proxyUrl?: string) {
    // Check if GOOGLE_TTS_API_KEY is available in environment (for development/GitHub Pages)
    // This allows direct API calls without a proxy server
    const envApiKey =
      typeof process !== 'undefined' &&
      process.env &&
      process.env.GOOGLE_TTS_API_KEY;
    if (envApiKey) {
      this.apiKey = envApiKey;
      console.log('AI Voice Service: Using direct API key from environment');
    }

    // Accept proxy URL instead of API key for security
    // In production (GitHub Pages), don't default to localhost as it won't work
    if (proxyUrl) {
      this.proxyUrl = proxyUrl;
    } else if (
      typeof globalThis !== 'undefined' &&
      (globalThis as any).location &&
      (globalThis as any).location.hostname === 'localhost'
    ) {
      // Only use localhost in local development if no API key is available
      if (!this.apiKey) {
        this.proxyUrl = 'http://localhost:4000';
      }
    } else {
      // Production: check if API key is available, otherwise TTS will be disabled
      if (!this.apiKey) {
        this.proxyUrl = '';
      }
    }
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

      // Log initialization status with availability info
      if (this.apiKey) {
        console.log('AI Voice Service initialized with direct API access');
      } else if (this.proxyUrl) {
        console.log(
          `AI Voice Service initialized with proxy: ${this.proxyUrl}`,
        );
      } else {
        console.log(
          'AI Voice Service initialized (TTS unavailable - no API key or proxy configured)',
        );
      }
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
    const startTime = Date.now();
    console.log('[AIVoiceService] Starting speech synthesis', {
      textLength: text.length,
      textPreview: text.substring(0, 50),
      hasApiKey: !!this.apiKey,
      hasProxyUrl: !!this.proxyUrl,
      timestamp: new Date().toISOString(),
    });

    // Stop any ongoing speech
    if (this.isSpeaking) {
      console.log('[AIVoiceService] Stopping ongoing speech');
      await this.stopSpeaking();
    }

    try {
      // Use Google Cloud TTS API for AI voice generation
      const audioContent = await this.generateAIVoice(text);
      const generationTime = Date.now() - startTime;

      if (audioContent) {
        console.log('[AIVoiceService] Audio content generated successfully', {
          generationTimeMs: generationTime,
          audioContentLength: audioContent.length,
        });
        await this.playAudio(audioContent);
        const totalTime = Date.now() - startTime;
        console.log('[AIVoiceService] Speech synthesis completed', {
          totalTimeMs: totalTime,
        });
        return;
      } else {
        const errorMsg =
          'No audio content generated (API key or proxy not configured)';
        console.error('[AIVoiceService] Speech synthesis failed:', errorMsg, {
          hasApiKey: !!this.apiKey,
          hasProxyUrl: !!this.proxyUrl,
          generationTimeMs: generationTime,
        });
        throw new Error(errorMsg);
      }
    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error('[AIVoiceService] Failed to generate AI voice:', {
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        totalTimeMs: totalTime,
        hasApiKey: !!this.apiKey,
        hasProxyUrl: !!this.proxyUrl,
        proxyUrl: this.proxyUrl,
      });
      throw error;
    }
  }

  /**
   * Generate AI voice using Google Cloud Text-to-Speech API
   * Supports both proxy server and direct API calls
   */
  private async generateAIVoice(text: string): Promise<string | null> {
    const startTime = Date.now();

    // Check if API key or proxy is available
    if (!this.apiKey && !this.proxyUrl) {
      const errorMsg =
        'Cannot generate voice: TTS API key or proxy not configured';
      console.warn(`[AIVoiceService] ${errorMsg}`, {
        hasApiKey: false,
        hasProxyUrl: false,
        timestamp: new Date().toISOString(),
      });
      return null;
    }

    try {
      // Use custom voice if enabled, otherwise use selected voice
      const voiceName =
        this.ttsConfig.useCustomVoice && this.ttsConfig.customVoiceName
          ? this.ttsConfig.customVoiceName
          : this.ttsConfig.voiceName;

      const languageCode =
        this.ttsConfig.useCustomVoice && this.ttsConfig.customLanguageCode
          ? this.ttsConfig.customLanguageCode
          : this.ttsConfig.languageCode;

      const gender =
        this.ttsConfig.useCustomVoice && this.ttsConfig.customGender
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

      let url: string;
      let headers: any = {
        'Content-Type': 'application/json',
      };
      let body: any;

      // Use direct API call if API key is available, otherwise use proxy
      if (this.apiKey) {
        // Direct API call to Google Cloud TTS
        url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`;
        body = requestBody;
        console.log('[AIVoiceService] Using direct Google Cloud TTS API', {
          voiceName,
          languageCode,
        });
      } else {
        // Call the proxy server
        url = `${this.proxyUrl}/api/synthesize`;
        // Proxy expects a slightly different format
        body = {
          text: text,
          voice: {
            languageCode: languageCode,
            name: voiceName,
            ssmlGender: gender,
          },
          audioConfig: {
            speakingRate: this.ttsConfig.speakingRate,
            pitch: this.ttsConfig.pitch,
            volumeGainDb: this.ttsConfig.volumeGainDb,
          },
        };
        console.log('[AIVoiceService] Using TTS proxy server', {
          proxyUrl: this.proxyUrl,
          voiceName,
          languageCode,
        });
      }

      console.log('[AIVoiceService] Sending TTS API request', {
        url: this.apiKey ? 'Google Cloud TTS API' : url,
        textLength: text.length,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      });

      const fetchTime = Date.now() - startTime;
      console.log('[AIVoiceService] TTS API response received', {
        status: response.status,
        ok: response.ok,
        fetchTimeMs: fetchTime,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = `API request failed: ${response.status} - ${
          errorData.error || 'Unknown error'
        }`;
        console.error('[AIVoiceService] TTS API request failed', {
          status: response.status,
          errorData,
          url: this.apiKey ? 'Google Cloud TTS API' : url,
          fetchTimeMs: fetchTime,
        });
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const totalTime = Date.now() - startTime;

      if (!data.audioContent) {
        console.error('[AIVoiceService] No audio content in response', {
          hasData: !!data,
          dataKeys: Object.keys(data || {}),
          totalTimeMs: totalTime,
        });
      } else {
        console.log('[AIVoiceService] Audio content received', {
          audioContentLength: data.audioContent.length,
          totalTimeMs: totalTime,
        });
      }

      return data.audioContent; // Base64 encoded audio
    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error('[AIVoiceService] Error generating AI voice', {
        error: error instanceof Error ? error.message : String(error),
        errorType:
          error instanceof Error ? error.constructor.name : typeof error,
        totalTimeMs: totalTime,
        hasApiKey: !!this.apiKey,
        hasProxyUrl: !!this.proxyUrl,
        proxyUrl: this.proxyUrl,
      });
      throw error;
    }
  }

  /**
   * Play audio content
   */
  private async playAudio(base64Audio: string): Promise<void> {
    const startTime = Date.now();
    console.log('[AIVoiceService] Starting audio playback', {
      audioDataLength: base64Audio.length,
      timestamp: new Date().toISOString(),
    });

    return new Promise((resolve, reject) => {
      try {
        this.isSpeaking = true;

        // Create audio element with base64 data (browser only)
        const audioSrc = `data:audio/mp3;base64,${base64Audio}`;

        // Use any type to avoid TypeScript DOM type issues
        const AudioConstructor = (globalThis as any).Audio;
        if (!AudioConstructor) {
          const errorMsg = 'Audio API not available in this environment';
          console.error('[AIVoiceService]', errorMsg);
          throw new Error(errorMsg);
        }

        this.currentAudio = new AudioConstructor(audioSrc);
        console.log('[AIVoiceService] Audio element created');

        // Wait for audio to be ready before playing to prevent cutting off the beginning
        this.currentAudio.oncanplay = () => {
          const loadTime = Date.now() - startTime;
          console.log('[AIVoiceService] Audio ready to play', {
            loadTimeMs: loadTime,
          });
          this.currentAudio.play().catch((playError: any) => {
            console.error('[AIVoiceService] Audio play failed', {
              error:
                playError instanceof Error
                  ? playError.message
                  : String(playError),
              loadTimeMs: loadTime,
            });
            reject(playError);
          });
        };

        this.currentAudio.onended = () => {
          const totalTime = Date.now() - startTime;
          console.log('[AIVoiceService] Audio playback completed', {
            totalTimeMs: totalTime,
          });
          this.isSpeaking = false;
          this.currentAudio = null;
          resolve();
        };

        this.currentAudio.onerror = (error: any) => {
          const totalTime = Date.now() - startTime;
          console.error('[AIVoiceService] Audio playback error', {
            error: error instanceof Error ? error.message : String(error),
            totalTimeMs: totalTime,
          });
          this.isSpeaking = false;
          this.currentAudio = null;
          reject(error);
        };

        // Trigger loading
        console.log('[AIVoiceService] Loading audio...');
        this.currentAudio.load();
      } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error('[AIVoiceService] Failed to initialize audio playback', {
          error: error instanceof Error ? error.message : String(error),
          totalTimeMs: totalTime,
        });
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
   * Set proxy URL for TTS API calls
   */
  setProxyUrl(proxyUrl: string) {
    this.proxyUrl = proxyUrl;
  }

  /**
   * Get the voice method currently being used
   */
  getVoiceMethod(): string {
    if (this.apiKey) {
      return 'Google Cloud TTS (Direct API - AI 음성)';
    }
    if (this.proxyUrl) {
      return 'Google Cloud TTS (Proxy - AI 음성)';
    }
    return 'TTS Not Available';
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
