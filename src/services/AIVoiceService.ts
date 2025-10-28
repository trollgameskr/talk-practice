/**
 * AI Voice Service
 * Handles AI-generated voice synthesis using Google Cloud Text-to-Speech API
 * This service generates natural-sounding AI voices instead of using basic TTS
 */

import {VoicePersonality} from '../config/gemini.config';

/**
 * TTS Model types and their capabilities
 */
export type TTSModel = 'Google Cloud TTS' | 'Web Speech API';

export interface TTSCapabilities {
  supportsAccent: boolean;
  supportsPersonality: boolean;
  model: TTSModel;
}

export class AIVoiceService {
  private isInitialized: boolean = false;
  private isSpeaking: boolean = false;
  private currentAudio: any = null; // HTMLAudioElement in browser
  private apiKey: string = '';
  private voiceAccent: string = 'en-US'; // Default accent
  private voicePersonality: VoicePersonality = 'cheerful_female'; // Default personality
  private lastUsedMethod: 'Google Cloud TTS' | 'Web Speech API' =
    'Web Speech API';
  private lastUsedVoiceName: string = '';

  constructor(
    apiKey?: string,
    voiceAccent?: string,
    voicePersonality?: VoicePersonality,
  ) {
    this.apiKey = apiKey || '';
    this.voiceAccent = voiceAccent || 'en-US';
    this.voicePersonality = voicePersonality || 'cheerful_female';
    this.initialize();
  }

  /**
   * Initialize AI Voice Service
   */
  private async initialize() {
    try {
      this.isInitialized = true;
      console.log('AI Voice Service initialized');
    } catch (error) {
      console.error('Error initializing AI Voice Service:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Determine if personality is male or female
   */
  private isMaleVoice(): boolean {
    return this.voicePersonality.includes('male');
  }

  /**
   * Synthesize speech using AI-generated voices
   * Attempts to use Google Cloud TTS API if configured, otherwise uses
   * the best available Web Speech API voice (Google, Microsoft Neural, etc.)
   */
  async speak(text: string): Promise<void> {
    // Stop any ongoing speech
    if (this.isSpeaking) {
      await this.stopSpeaking();
    }

    try {
      // Try to use Google Cloud TTS API for AI voice generation
      // This will be skipped if no API key is configured
      const audioContent = await this.generateAIVoice(text);
      if (audioContent) {
        this.lastUsedMethod = 'Google Cloud TTS';
        await this.playAudio(audioContent);
        return;
      }
    } catch (error) {
      // Silent fallback to Web Speech API
    }

    // Use enhanced Web Speech API with best AI voice selection
    // This automatically selects Google, Microsoft Neural, or other premium voices
    this.lastUsedMethod = 'Web Speech API';
    await this.speakWithEnhancedVoice(text);
  }

  /**
   * Generate AI voice using Google Cloud Text-to-Speech API
   * Note: This requires a valid API key and proper CORS setup
   * Falls back to Web Speech API if unavailable
   */
  private async generateAIVoice(text: string): Promise<string | null> {
    // Skip Google Cloud TTS if no API key is configured
    // This avoids unnecessary network requests and console errors
    if (!this.apiKey) {
      return null;
    }

    try {
      const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`;

      // Determine gender from personality
      const isMale = this.isMaleVoice();
      const gender = isMale ? 'MALE' : 'FEMALE';

      // Map voice accent and personality to Google TTS voice
      const voiceNameMap: {
        [key: string]: {male: string; female: string};
      } = {
        'en-US': {
          male: 'en-US-Neural2-D',
          female: 'en-US-Neural2-F',
        },
        'en-GB': {
          male: 'en-GB-Neural2-D',
          female: 'en-GB-Neural2-F',
        },
        'en-AU': {
          male: 'en-AU-Neural2-D',
          female: 'en-AU-Neural2-A',
        },
        'en-IN': {
          male: 'en-IN-Neural2-D',
          female: 'en-IN-Neural2-A',
        },
        'en-CA': {
          male: 'en-US-Neural2-D',
          female: 'en-US-Neural2-F',
        }, // Use US voice for Canada
      };

      const voiceSet = voiceNameMap[this.voiceAccent] || voiceNameMap['en-US'];
      const voiceName = isMale ? voiceSet.male : voiceSet.female;

      // Adjust pitch and speaking rate based on personality
      let pitch = 0.0;
      let speakingRate = 0.95;

      if (this.voicePersonality.includes('cheerful')) {
        pitch = 1.0;
        speakingRate = 1.0;
      } else if (this.voicePersonality.includes('calm')) {
        pitch = -1.0;
        speakingRate = 0.9;
      } else if (
        this.voicePersonality.includes('energetic') ||
        this.voicePersonality.includes('lively')
      ) {
        pitch = 2.0;
        speakingRate = 1.05;
      } else if (this.voicePersonality.includes('serious')) {
        pitch = -1.0;
        speakingRate = 0.85;
      } else if (this.voicePersonality.includes('humorous')) {
        pitch = 1.5;
        speakingRate = 1.0;
      } else if (this.voicePersonality.includes('cautious')) {
        pitch = -0.5;
        speakingRate = 0.9;
      } else if (
        this.voicePersonality.includes('friendly') ||
        this.voicePersonality.includes('warm')
      ) {
        pitch = 0.5;
        speakingRate = 0.95;
      }

      const requestBody = {
        input: {
          text: text,
        },
        voice: {
          languageCode: this.voiceAccent,
          name: voiceName,
          ssmlGender: gender,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: speakingRate,
          pitch: pitch,
          volumeGainDb: 0.0,
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
      // Silently fail and use fallback - this is expected in browser without backend
      return null;
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

        // Use canplay instead of canplaythrough for immediate playback
        // canplay fires as soon as enough data is buffered to begin playback
        // This provides faster response while still preventing initial cutoff
        this.currentAudio.oncanplay = () => {
          this.currentAudio.play().catch(reject);
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
   * Fallback: Speak with enhanced Web Speech API
   * Selects the best available AI/Neural voice from the system
   */
  private async speakWithEnhancedVoice(text: string): Promise<void> {
    const win = globalThis as any;
    if (!win.speechSynthesis) {
      console.warn('Speech synthesis not available');
      return;
    }

    // Ensure voices are loaded before speaking
    await this.ensureVoicesLoaded();

    return new Promise((resolve, reject) => {
      try {
        const voices = win.speechSynthesis.getVoices();

        const SpeechSynthesisUtteranceConstructor =
          win.SpeechSynthesisUtterance;
        const utterance = new SpeechSynthesisUtteranceConstructor(text);

        // Select the best AI voice available with the configured accent and personality
        const bestVoice = this.selectBestVoice(voices);
        if (bestVoice) {
          utterance.voice = bestVoice;
          this.lastUsedVoiceName = bestVoice.name;
          console.log('Using AI voice:', bestVoice.name);
        } else {
          this.lastUsedVoiceName = 'Default System Voice';
          console.log('Using default system voice');
        }

        // Adjust rate and pitch based on personality
        let rate = 0.95;
        let pitch = 1.0;

        if (this.voicePersonality.includes('cheerful')) {
          pitch = 1.1;
          rate = 1.0;
        } else if (this.voicePersonality.includes('calm')) {
          pitch = 0.9;
          rate = 0.9;
        } else if (
          this.voicePersonality.includes('energetic') ||
          this.voicePersonality.includes('lively')
        ) {
          pitch = 1.2;
          rate = 1.05;
        } else if (this.voicePersonality.includes('serious')) {
          pitch = 0.9;
          rate = 0.85;
        } else if (this.voicePersonality.includes('humorous')) {
          pitch = 1.15;
          rate = 1.0;
        } else if (this.voicePersonality.includes('cautious')) {
          pitch = 0.95;
          rate = 0.9;
        } else if (
          this.voicePersonality.includes('friendly') ||
          this.voicePersonality.includes('warm')
        ) {
          pitch = 1.05;
          rate = 0.95;
        }

        // Configure for natural speech with accent and personality
        utterance.lang = this.voiceAccent;
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = 1.0; // Full volume

        utterance.onstart = () => {
          this.isSpeaking = true;
        };

        utterance.onend = () => {
          this.isSpeaking = false;
          resolve();
        };

        utterance.onerror = (event: any) => {
          this.isSpeaking = false;
          // User cancellations are expected behavior, not errors
          if (event.error === 'interrupted' || event.error === 'canceled') {
            resolve();
            return;
          }
          // Log other errors but don't break the user experience
          console.warn('Speech synthesis error:', event.error);
          // Reject so caller knows speech failed, but they can handle gracefully
          reject(new Error(`Speech synthesis failed: ${event.error}`));
        };

        win.speechSynthesis.speak(utterance);
      } catch (error) {
        this.isSpeaking = false;
        console.warn('Error in speech synthesis:', error);
        reject(error);
      }
    });
  }

  /**
   * Ensure voices are loaded before using them
   */
  private async ensureVoicesLoaded(): Promise<void> {
    const win = globalThis as any;
    if (!win.speechSynthesis) {
      return;
    }

    return new Promise(resolve => {
      const voices = win.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve();
        return;
      }

      // Wait for voiceschanged event
      const timeout = setTimeout(() => {
        win.speechSynthesis.removeEventListener(
          'voiceschanged',
          handleVoicesChanged,
        );
        resolve();
      }, 1000);

      const handleVoicesChanged = () => {
        clearTimeout(timeout);
        win.speechSynthesis.removeEventListener(
          'voiceschanged',
          handleVoicesChanged,
        );
        resolve();
      };

      win.speechSynthesis.addEventListener(
        'voiceschanged',
        handleVoicesChanged,
      );
    });
  }

  /**
   * Select the best AI/Neural voice from available voices
   */
  private selectBestVoice(voices: any[]): any {
    if (voices.length === 0) {
      return null;
    }

    // Get language code without region (e.g., 'en' from 'en-US')
    const baseLang = this.voiceAccent.split('-')[0];

    // Determine preferred gender from personality
    const isMale = this.isMaleVoice();

    // Filter voices by gender preference
    const genderMatchingVoices = voices.filter((v: any) => {
      const voiceName = v.name.toLowerCase();
      const isMaleVoice =
        voiceName.includes('male') && !voiceName.includes('female');
      const isFemaleVoice = voiceName.includes('female');

      if (isMale) {
        return isMaleVoice || (!isMaleVoice && !isFemaleVoice);
      } else {
        return isFemaleVoice || (!isMaleVoice && !isFemaleVoice);
      }
    });

    // If we have gender-matching voices, prefer those; otherwise use all
    const voicesToSearch =
      genderMatchingVoices.length > 0 ? genderMatchingVoices : voices;

    // Priority order for AI/Neural voices with matching accent:
    // 1. Google voices matching accent
    // 2. Microsoft voices with "Neural" matching accent
    // 3. Apple Premium voices matching accent
    // 4. Any quality voice matching accent
    const voicePriorities = [
      (v: any) => v.name.includes('Google') && v.lang === this.voiceAccent,
      (v: any) => v.name.includes('Google') && v.lang.startsWith(baseLang),
      (v: any) =>
        v.name.includes('Microsoft') &&
        v.name.includes('Neural') &&
        v.lang === this.voiceAccent,
      (v: any) =>
        v.name.includes('Microsoft') &&
        v.name.includes('Neural') &&
        v.lang.startsWith(baseLang),
      (v: any) => v.name.includes('Premium') && v.lang === this.voiceAccent,
      (v: any) => v.name.includes('Enhanced') && v.lang === this.voiceAccent,
      (v: any) => v.lang === this.voiceAccent && v.localService,
      (v: any) => v.lang === this.voiceAccent,
      (v: any) => v.lang.startsWith(baseLang),
    ];

    for (const priorityCheck of voicePriorities) {
      const voice = voicesToSearch.find(priorityCheck);
      if (voice) {
        return voice;
      }
    }

    return voicesToSearch[0] || voices[0];
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

    // Stop Web Speech API if active
    const win = globalThis as any;
    if (win.speechSynthesis) {
      win.speechSynthesis.cancel();
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
   * Set voice accent
   */
  setVoiceAccent(accent: string) {
    this.voiceAccent = accent;
  }

  /**
   * Set voice personality
   */
  setVoicePersonality(personality: VoicePersonality) {
    this.voicePersonality = personality;
  }

  /**
   * Get the voice method currently being used
   */
  getVoiceMethod(): string {
    if (this.lastUsedMethod === 'Google Cloud TTS') {
      return 'Google Cloud TTS (AI 음성)';
    }
    if (this.lastUsedVoiceName) {
      return `${this.lastUsedMethod} (${this.lastUsedVoiceName})`;
    }
    return this.lastUsedMethod;
  }

  /**
   * Get the TTS model that will be used based on current configuration
   */
  getCurrentTTSModel(): TTSModel {
    // Google Cloud TTS is used when API key is configured
    if (this.apiKey && this.apiKey.trim() !== '') {
      return 'Google Cloud TTS';
    }
    // Otherwise, fallback to Web Speech API
    return 'Web Speech API';
  }

  /**
   * Get capabilities of the current TTS model
   */
  getTTSCapabilities(): TTSCapabilities {
    const model = this.getCurrentTTSModel();

    if (model === 'Google Cloud TTS') {
      // Google Cloud TTS fully supports both accent and personality
      return {
        model,
        supportsAccent: true,
        supportsPersonality: true,
      };
    } else {
      // Web Speech API supports accent selection but personality
      // adjustments via pitch/rate are less reliable and model-dependent
      return {
        model,
        supportsAccent: true,
        supportsPersonality: false,
      };
    }
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
