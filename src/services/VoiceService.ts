/**
 * Voice Service
 * Handles voice recognition and AI-generated speech
 */

import Voice from '@react-native-community/voice';
import AIVoiceService from './AIVoiceService';

export class VoiceService {
  private isListening: boolean = false;
  private onResultCallback: ((text: string) => void) | null = null;
  private onErrorCallback: ((error: any) => void) | null = null;
  private aiVoiceService: AIVoiceService;

  constructor(apiKey?: string) {
    this.initializeVoice();
    this.aiVoiceService = new AIVoiceService(apiKey);
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
   * Speak text using AI voice generation
   */
  async speak(text: string): Promise<void> {
    try {
      await this.aiVoiceService.speak(text);
    } catch (error) {
      console.error('Error speaking text:', error);
    }
  }

  /**
   * Stop speaking
   */
  async stopSpeaking(): Promise<void> {
    try {
      await this.aiVoiceService.stopSpeaking();
    } catch (error) {
      console.error('Error stopping AI voice:', error);
    }
  }
  
  /**
   * Set API key for AI voice service
   */
  setApiKey(apiKey: string) {
    this.aiVoiceService.setApiKey(apiKey);
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
   * Cleanup
   */
  async destroy() {
    try {
      await Voice.destroy();
      await this.aiVoiceService.destroy();
    } catch (error) {
      console.error('Error destroying voice service:', error);
    }
  }
}

export default VoiceService;
