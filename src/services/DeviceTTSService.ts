/**
 * Device TTS Service
 * Handles speech synthesis using the device's native TTS engine
 * This is a wrapper around react-native-tts (native) or Web Speech API (web)
 */

import {Platform} from 'react-native';

// Import based on platform - using require() for conditional imports
// This is necessary because we need runtime platform detection
// Dynamic imports would require async initialization which complicates the service
let Tts: any;
if (Platform.OS === 'web') {
  // Use web shim for web platform
  Tts = require('./web/TTSShim.web.js').default;
} else {
  // Use react-native-tts for native platforms
  Tts = require('react-native-tts').default;
}

export type VoiceType = 'ai' | 'user';

export class DeviceTTSService {
  private isInitialized: boolean = false;
  private isSpeaking: boolean = false;
  private currentLanguage: string = 'en';

  constructor() {
    this.initialize();
  }

  /**
   * Initialize Device TTS Service
   */
  private async initialize() {
    try {
      // Initialize TTS
      await Tts.getInitStatus();

      // Set default settings
      await Tts.setDefaultRate(0.5); // Normal speed
      await Tts.setDefaultPitch(1.0); // Normal pitch

      // Set language
      await Tts.setDefaultLanguage(
        this.getDeviceLanguageCode(this.currentLanguage),
      );

      this.isInitialized = true;
      console.log('Device TTS Service initialized');
    } catch (error) {
      console.error('Error initializing Device TTS Service:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Convert our language code to device TTS language code
   */
  private getDeviceLanguageCode(languageCode: string): string {
    const languageMap: {[key: string]: string} = {
      en: 'en-US',
      ko: 'ko-KR',
      ja: 'ja-JP',
      zh: 'zh-CN',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
    };
    return languageMap[languageCode] || 'en-US';
  }

  /**
   * Set current language
   */
  async setLanguage(languageCode: string) {
    this.currentLanguage = languageCode;
    try {
      await Tts.setDefaultLanguage(this.getDeviceLanguageCode(languageCode));
    } catch (error) {
      console.error('Error setting TTS language:', error);
    }
  }

  /**
   * Speak text using device TTS
   * @param text Text to speak
   * @param voiceType Type of voice to use (ignored for device TTS, kept for API compatibility)
   */
  async speak(text: string, voiceType: VoiceType = 'ai'): Promise<void> {
    const startTime = Date.now();
    console.log('[DeviceTTSService] Starting speech synthesis', {
      textLength: text.length,
      textPreview: text.substring(0, 50),
      voiceType,
      language: this.currentLanguage,
      timestamp: new Date().toISOString(),
    });

    // Stop any ongoing speech
    if (this.isSpeaking) {
      console.log('[DeviceTTSService] Stopping ongoing speech');
      await this.stopSpeaking();
    }

    try {
      this.isSpeaking = true;

      return new Promise((resolve, reject) => {
        // Set up event listeners
        Tts.addEventListener('tts-start', () => {
          console.log('[DeviceTTSService] Speech started');
        });

        Tts.addEventListener('tts-finish', () => {
          const totalTime = Date.now() - startTime;
          console.log('[DeviceTTSService] Speech completed', {
            totalTimeMs: totalTime,
          });
          this.isSpeaking = false;
          resolve();
        });

        Tts.addEventListener('tts-cancel', () => {
          console.log('[DeviceTTSService] Speech cancelled');
          this.isSpeaking = false;
          resolve();
        });

        // Speak the text with language option
        const deviceLanguageCode = this.getDeviceLanguageCode(
          this.currentLanguage,
        );
        Tts.speak(text, {language: deviceLanguageCode}).catch((error: any) => {
          const totalTime = Date.now() - startTime;
          console.error('[DeviceTTSService] Speech synthesis failed', {
            error: error instanceof Error ? error.message : String(error),
            totalTimeMs: totalTime,
          });
          this.isSpeaking = false;
          reject(error);
        });
      });
    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error('[DeviceTTSService] Failed to generate speech:', {
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        totalTimeMs: totalTime,
      });
      this.isSpeaking = false;
      throw error;
    }
  }

  /**
   * Stop speaking
   */
  async stopSpeaking(): Promise<void> {
    try {
      await Tts.stop();
      this.isSpeaking = false;
    } catch (error) {
      console.error('Error stopping device TTS:', error);
    }
  }

  /**
   * Check if currently speaking
   */
  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Get the voice method currently being used
   */
  getVoiceMethod(): string {
    return '기기 음성 (Device TTS)';
  }

  /**
   * Cleanup
   */
  async destroy() {
    await this.stopSpeaking();
    // Remove event listeners
    Tts.removeAllListeners('tts-start');
    Tts.removeAllListeners('tts-finish');
    Tts.removeAllListeners('tts-cancel');
    this.isInitialized = false;
  }
}

export default DeviceTTSService;
