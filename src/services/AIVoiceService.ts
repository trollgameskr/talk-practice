/**
 * AI Voice Service
 * Handles AI-generated voice synthesis using Google Cloud Text-to-Speech API
 * This service generates natural-sounding AI voices instead of using basic TTS
 */

export class AIVoiceService {
  private isInitialized: boolean = false;
  private isSpeaking: boolean = false;
  private currentAudio: any = null; // HTMLAudioElement in browser
  private apiKey: string = '';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || '';
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
        await this.playAudio(audioContent);
        return;
      }
    } catch (error) {
      // Silent fallback to Web Speech API
    }

    // Use enhanced Web Speech API with best AI voice selection
    // This automatically selects Google, Microsoft Neural, or other premium voices
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
      
      const requestBody = {
        input: {
          text: text
        },
        voice: {
          languageCode: 'en-US',
          name: 'en-US-Neural2-F', // Neural2 voices are AI-generated
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.95,
          pitch: 0.0,
          volumeGainDb: 0.0
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
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
        
        this.currentAudio.play().catch(reject);
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

    return new Promise((resolve, reject) => {
      try {
        // Wait for voices to be loaded
        const voices = win.speechSynthesis.getVoices();
        
        const SpeechSynthesisUtteranceConstructor = win.SpeechSynthesisUtterance;
        const utterance = new SpeechSynthesisUtteranceConstructor(text);
        
        // Select the best AI voice available
        const bestVoice = this.selectBestVoice(voices);
        if (bestVoice) {
          utterance.voice = bestVoice;
          console.log('Using AI voice:', bestVoice.name);
        } else {
          console.log('Using default system voice');
        }
        
        // Configure for natural speech
        utterance.lang = 'en-US';
        utterance.rate = 0.95; // Slightly slower for clarity
        utterance.pitch = 1.0; // Natural pitch
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
          console.error('Speech synthesis error:', event);
          reject(event);
        };
        
        win.speechSynthesis.speak(utterance);
      } catch (error) {
        this.isSpeaking = false;
        reject(error);
      }
    });
  }

  /**
   * Select the best AI/Neural voice from available voices
   */
  private selectBestVoice(voices: any[]): any {
    if (voices.length === 0) return null;

    // Priority order for AI/Neural voices:
    // 1. Google voices (highest quality)
    // 2. Microsoft voices with "Neural" in name
    // 3. Apple Premium voices
    // 4. Any quality US English voice
    const voicePriorities = [
      (v: any) => v.name.includes('Google') && v.name.includes('US'),
      (v: any) => v.name.includes('Google') && v.lang === 'en-US',
      (v: any) => v.name.includes('Microsoft') && v.name.includes('Neural'),
      (v: any) => v.name.includes('Premium') && v.lang === 'en-US',
      (v: any) => v.name.includes('Enhanced') && v.lang === 'en-US',
      (v: any) => v.lang === 'en-US' && v.localService,
      (v: any) => v.lang === 'en-US',
      (v: any) => v.lang.startsWith('en'),
    ];

    for (const priorityCheck of voicePriorities) {
      const voice = voices.find(priorityCheck);
      if (voice) return voice;
    }

    return voices[0];
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
   * Cleanup
   */
  async destroy() {
    await this.stopSpeaking();
    this.isInitialized = false;
  }
}

export default AIVoiceService;
