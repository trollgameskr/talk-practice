/**
 * AI Voice Service
 * Handles AI-generated voice synthesis using Google Cloud Text-to-Speech API
 * This service generates natural-sounding AI voices instead of using basic TTS
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TTSConfig,
  VoiceConfig,
  LanguageTTSConfigs,
  DEFAULT_TTS_CONFIG,
  getDefaultTTSConfigForLanguage,
} from '../config/tts.config';
import {STORAGE_KEYS} from '../config/gemini.config';
import {migrateOldTTSConfig} from '../utils/ttsMigration';

/**
 * TTS Model types and their capabilities
 */
export type TTSModel = 'Google Cloud TTS';

export interface TTSCapabilities {
  model: TTSModel;
}

export type VoiceType = 'ai' | 'user';

export class AIVoiceService {
  private isInitialized: boolean = false;
  private isSpeaking: boolean = false;
  private currentAudio: any = null; // HTMLAudioElement in browser
  private ttsConfigsByLanguage: LanguageTTSConfigs = {};
  private currentLanguage: string = 'en';
  private proxyUrl: string = '';
  private apiKey: string = '';
  // Feature 1: Audio cache for replay
  private audioCache: Map<string, string> = new Map(); // Map of text hash to base64 audio

  constructor(proxyUrl?: string) {
    // Accept proxy URL for backward compatibility (local development)
    // In production (GitHub Pages), users will provide their own TTS API key
    if (proxyUrl) {
      this.proxyUrl = proxyUrl;
    } else if (
      typeof globalThis !== 'undefined' &&
      (globalThis as any).location &&
      (globalThis as any).location.hostname === 'localhost'
    ) {
      // Only use localhost proxy in local development
      this.proxyUrl = 'http://localhost:4000';
    } else {
      // Production: TTS API key will be loaded from user storage in initialize()
      this.proxyUrl = '';
    }
    this.initialize();
  }

  /**
   * Initialize AI Voice Service
   */
  private async initialize() {
    try {
      // Load TTS API key from storage (user-provided)
      const storedApiKey = await AsyncStorage.getItem(STORAGE_KEYS.TTS_API_KEY);
      if (storedApiKey) {
        this.apiKey = storedApiKey;
        console.log('AI Voice Service: Using TTS API key from user storage');
      }

      // Load TTS configurations by language from storage
      await this.loadTTSConfigs();
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
   * Load TTS configurations by language from storage
   */
  private async loadTTSConfigs() {
    try {
      // Try migration first (will only migrate once)
      await migrateOldTTSConfig();

      const savedConfigsStr = await AsyncStorage.getItem(
        STORAGE_KEYS.TTS_CONFIGS_BY_LANGUAGE,
      );
      
      if (savedConfigsStr) {
        this.ttsConfigsByLanguage = JSON.parse(savedConfigsStr);
      } else {
        this.ttsConfigsByLanguage = {};
      }
    } catch (error) {
      console.error('Error loading TTS configs:', error);
      this.ttsConfigsByLanguage = {};
    }
  }

  /**
   * Get TTS config for current language
   */
  private getTTSConfigForLanguage(languageCode: string): TTSConfig {
    return (
      this.ttsConfigsByLanguage[languageCode] ||
      getDefaultTTSConfigForLanguage(languageCode)
    );
  }

  /**
   * Set current language
   */
  async setLanguage(languageCode: string) {
    this.currentLanguage = languageCode;
    await this.loadTTSConfigs();
  }

  /**
   * Update TTS configuration
   */
  async updateTTSConfig(config: Partial<TTSConfig>) {
    const currentConfig = this.getTTSConfigForLanguage(this.currentLanguage);
    const updatedConfig = {...currentConfig, ...config};
    this.ttsConfigsByLanguage[this.currentLanguage] = updatedConfig;
    
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.TTS_CONFIGS_BY_LANGUAGE,
        JSON.stringify(this.ttsConfigsByLanguage),
      );
    } catch (error) {
      console.error('Error saving TTS config:', error);
    }
  }

  /**
   * Get current TTS configuration
   */
  getTTSConfig(): TTSConfig {
    return this.getTTSConfigForLanguage(this.currentLanguage);
  }

  /**
   * Synthesize speech using AI-generated voices
   * Uses Google Cloud TTS API
   * @param text Text to speak
   * @param voiceType Type of voice to use: 'ai' for AI responses, 'user' for user response samples
   * @param useCache Whether to use cached audio (Feature 1)
   */
  async speak(text: string, voiceType: VoiceType = 'ai', useCache: boolean = true): Promise<void> {
    const startTime = Date.now();
    console.log('[AIVoiceService] Starting speech synthesis', {
      textLength: text.length,
      textPreview: text.substring(0, 50),
      voiceType,
      useCache,
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
      // Feature 1: Check cache first if enabled
      if (useCache) {
        const cachedAudio = this.getCachedAudio(text, voiceType);
        if (cachedAudio) {
          console.log('[AIVoiceService] Using cached audio');
          await this.playAudio(cachedAudio);
          const totalTime = Date.now() - startTime;
          console.log('[AIVoiceService] Cached speech playback completed', {
            totalTimeMs: totalTime,
          });
          return;
        }
      }

      // Use Google Cloud TTS API for AI voice generation
      const audioContent = await this.generateAIVoice(text, voiceType);
      const generationTime = Date.now() - startTime;

      if (audioContent) {
        console.log('[AIVoiceService] Audio content generated successfully', {
          generationTimeMs: generationTime,
          audioContentLength: audioContent.length,
        });
        
        // Feature 1: Cache the generated audio
        if (useCache) {
          this.cacheAudio(text, voiceType, audioContent);
        }
        
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
   * @param text Text to synthesize
   * @param voiceType Type of voice to use
   */
  private async generateAIVoice(
    text: string,
    voiceType: VoiceType,
  ): Promise<string | null> {
    const startTime = Date.now();

    // Store config state for logging (avoid logging sensitive apiKey)
    const hasApiKey = !!this.apiKey;
    const hasProxyUrl = !!this.proxyUrl;

    // Check if API key or proxy is available
    if (!hasApiKey && !hasProxyUrl) {
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
      // Get the appropriate voice config based on voice type
      const ttsConfig = this.getTTSConfigForLanguage(this.currentLanguage);
      const voiceConfig: VoiceConfig =
        voiceType === 'ai' ? ttsConfig.aiVoice : ttsConfig.userVoice;

      // Use custom voice if enabled, otherwise use selected voice
      const voiceName =
        voiceConfig.useCustomVoice && voiceConfig.customVoiceName
          ? voiceConfig.customVoiceName
          : voiceConfig.voiceName;

      const languageCode =
        voiceConfig.useCustomVoice && voiceConfig.customLanguageCode
          ? voiceConfig.customLanguageCode
          : voiceConfig.languageCode;

      const gender =
        voiceConfig.useCustomVoice && voiceConfig.customGender
          ? voiceConfig.customGender
          : voiceConfig.ssmlGender;

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
          speakingRate: voiceConfig.speakingRate,
          pitch: voiceConfig.pitch,
          volumeGainDb: voiceConfig.volumeGainDb,
        },
      };

      let url: string;
      let headers: any = {
        'Content-Type': 'application/json',
      };
      let body: any;
      let apiMethod: 'direct' | 'proxy';

      // Use direct API call if API key is available, otherwise use proxy
      if (this.apiKey) {
        // Direct API call to Google Cloud TTS
        url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`;
        body = requestBody;
        apiMethod = 'direct';
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
            speakingRate: voiceConfig.speakingRate,
            pitch: voiceConfig.pitch,
            volumeGainDb: voiceConfig.volumeGainDb,
          },
        };
        apiMethod = 'proxy';
        console.log('[AIVoiceService] Using TTS proxy server', {
          proxyUrl: this.proxyUrl,
          voiceName,
          languageCode,
        });
      }

      console.log('[AIVoiceService] Sending TTS API request', {
        url: apiMethod === 'direct' ? 'Google Cloud TTS API' : url,
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
        
        // Check for 403 SERVICE_DISABLED error specifically
        if (response.status === 403 && errorData.error) {
          const error = errorData.error;
          const isServiceDisabled = 
            error.status === 'PERMISSION_DENIED' &&
            (error.message?.includes('Cloud Text-to-Speech API has not been used') ||
             error.message?.includes('it is disabled'));
          
          if (isServiceDisabled) {
            // Create a detailed error for 403 SERVICE_DISABLED
            const detailedError = new Error('TTS_API_NOT_ENABLED');
            (detailedError as any).status = 403;
            (detailedError as any).errorData = errorData;
            (detailedError as any).isServiceDisabled = true;
            throw detailedError;
          }
        }
        
        const errorMsg = `API request failed: ${response.status} - ${
          errorData.error?.message || errorData.error || 'Unknown error'
        }`;
        console.error('[AIVoiceService] TTS API request failed', {
          status: response.status,
          errorData,
          url: apiMethod === 'direct' ? 'Google Cloud TTS API' : url,
          fetchTimeMs: fetchTime,
        });
        const error = new Error(errorMsg);
        (error as any).status = response.status;
        (error as any).errorData = errorData;
        throw error;
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
        hasApiKey,
        hasProxyUrl,
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
   * Set TTS API key
   */
  async setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    if (apiKey) {
      await AsyncStorage.setItem(STORAGE_KEYS.TTS_API_KEY, apiKey);
      console.log('AI Voice Service: TTS API key updated');
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.TTS_API_KEY);
      console.log('AI Voice Service: TTS API key removed');
    }
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
    // Feature 1: Clear audio cache on destroy
    this.clearAudioCache();
  }

  /**
   * Feature 1: Create a cache key from text and voice config
   */
  private getCacheKey(text: string, voiceType: VoiceType): string {
    const ttsConfig = this.getTTSConfigForLanguage(this.currentLanguage);
    const voiceConfig: VoiceConfig =
      voiceType === 'ai' ? ttsConfig.aiVoice : ttsConfig.userVoice;
    
    const voiceName =
      voiceConfig.useCustomVoice && voiceConfig.customVoiceName
        ? voiceConfig.customVoiceName
        : voiceConfig.voiceName;
    
    // Create a unique key based on text, voice, and language
    return `${text}|${voiceName}|${this.currentLanguage}|${voiceConfig.speakingRate}`;
  }

  /**
   * Feature 1: Get cached audio data
   */
  getCachedAudio(text: string, voiceType: VoiceType): string | null {
    const key = this.getCacheKey(text, voiceType);
    return this.audioCache.get(key) || null;
  }

  /**
   * Feature 1: Cache audio data
   */
  private cacheAudio(text: string, voiceType: VoiceType, audioData: string): void {
    const key = this.getCacheKey(text, voiceType);
    this.audioCache.set(key, audioData);
    console.log(`[AIVoiceService] Cached audio for key: ${key.substring(0, 50)}...`);
  }

  /**
   * Feature 1: Clear all cached audio
   */
  clearAudioCache(): void {
    const cacheSize = this.audioCache.size;
    this.audioCache.clear();
    console.log(`[AIVoiceService] Cleared ${cacheSize} cached audio items`);
  }

  /**
   * Feature 1: Play cached audio directly
   */
  async playCachedAudio(text: string, voiceType: VoiceType): Promise<boolean> {
    const cachedAudio = this.getCachedAudio(text, voiceType);
    if (cachedAudio) {
      console.log('[AIVoiceService] Playing cached audio');
      await this.playAudio(cachedAudio);
      return true;
    }
    return false;
  }
}

export default AIVoiceService;
