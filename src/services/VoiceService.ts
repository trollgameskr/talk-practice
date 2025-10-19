/**
 * Voice Service
 * Handles voice recognition and text-to-speech
 */

import Voice from '@react-native-community/voice';
import Tts from 'react-native-tts';

export class VoiceService {
  private isListening: boolean = false;
  private onResultCallback: ((text: string) => void) | null = null;
  private onErrorCallback: ((error: any) => void) | null = null;
  private ttsFinishResolve: (() => void) | null = null;
  private ttsErrorReject: ((error: any) => void) | null = null;

  constructor() {
    this.initializeVoice();
    this.initializeTts();
  }

  /**
   * Initialize voice recognition
   */
  private initializeVoice() {
    Voice.onSpeechStart = this.onSpeechStart.bind(this);
    Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
    Voice.onSpeechResults = this.onSpeechResults.bind(this);
    Voice.onSpeechError = this.onSpeechError.bind(this);
  }

  /**
   * Initialize text-to-speech
   */
  private async initializeTts() {
    try {
      await Tts.setDefaultLanguage('en-US');
      await Tts.setDefaultRate(0.5);
      await Tts.setDefaultPitch(1.0);

      // Set up TTS event listeners
      Tts.addEventListener('tts-start', this.onTtsStart.bind(this));
      Tts.addEventListener('tts-finish', this.onTtsFinish.bind(this));
      Tts.addEventListener('tts-error', this.onTtsError.bind(this));
    } catch (error) {
      console.error('Error initializing TTS:', error);
    }
  }

  /**
   * Start listening for voice input
   */
  async startListening(
    onResult: (text: string) => void,
    onError?: (error: any) => void,
  ): Promise<void> {
    this.onResultCallback = onResult;
    this.onErrorCallback = onError || null;

    try {
      await Voice.start('en-US');
      this.isListening = true;
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }
    }
  }

  /**
   * Stop listening
   */
  async stopListening(): Promise<void> {
    try {
      await Voice.stop();
      this.isListening = false;
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  }

  /**
   * Cancel listening
   */
  async cancelListening(): Promise<void> {
    try {
      await Voice.cancel();
      this.isListening = false;
    } catch (error) {
      console.error('Error canceling voice recognition:', error);
    }
  }

  /**
   * Speak text using TTS
   * Returns a promise that resolves when TTS finishes speaking
   */
  async speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ttsFinishResolve = resolve;
      this.ttsErrorReject = reject;

      try {
        Tts.speak(text);
      } catch (error) {
        console.error('Error speaking text:', error);
        this.ttsFinishResolve = null;
        this.ttsErrorReject = null;
        reject(error);
      }
    });
  }

  /**
   * Stop speaking
   */
  async stopSpeaking(): Promise<void> {
    try {
      await Tts.stop();
    } catch (error) {
      console.error('Error stopping TTS:', error);
    }
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Voice recognition callbacks
   */
  private onSpeechStart(e: any) {
    console.log('Speech started:', e);
  }

  private onSpeechEnd(e: any) {
    console.log('Speech ended:', e);
    this.isListening = false;
  }

  private onSpeechResults(e: any) {
    console.log('Speech results:', e);
    if (e.value && e.value.length > 0 && this.onResultCallback) {
      this.onResultCallback(e.value[0]);
    }
  }

  private onSpeechError(e: any) {
    console.error('Speech error:', e);
    this.isListening = false;
    if (this.onErrorCallback) {
      this.onErrorCallback(e);
    }
  }

  /**
   * TTS callbacks
   */
  private onTtsStart(e: any) {
    console.log('TTS started:', e);
  }

  private onTtsFinish(e: any) {
    console.log('TTS finished:', e);
    if (this.ttsFinishResolve) {
      this.ttsFinishResolve();
      this.ttsFinishResolve = null;
      this.ttsErrorReject = null;
    }
  }

  private onTtsError(e: any) {
    console.error('TTS error:', e);
    if (this.ttsErrorReject) {
      this.ttsErrorReject(e);
      this.ttsFinishResolve = null;
      this.ttsErrorReject = null;
    }
  }

  /**
   * Cleanup
   */
  async destroy() {
    try {
      await Voice.destroy();
      await Tts.stop();

      // Remove TTS event listeners
      Tts.removeEventListener('tts-start', this.onTtsStart.bind(this));
      Tts.removeEventListener('tts-finish', this.onTtsFinish.bind(this));
      Tts.removeEventListener('tts-error', this.onTtsError.bind(this));

      // Clear any pending resolvers
      this.ttsFinishResolve = null;
      this.ttsErrorReject = null;
    } catch (error) {
      console.error('Error destroying voice service:', error);
    }
  }
}

export default VoiceService;
