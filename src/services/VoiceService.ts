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
  private lastProcessedResult: string = '';
  private resultProcessingTimeout: NodeJS.Timeout | null = null;

  // Debounce delay for speech result processing (in milliseconds)
  private static readonly RESULT_DEBOUNCE_DELAY = 100;

  constructor(proxyUrl?: string) {
    this.initializeVoice();
    this.aiVoiceService = new AIVoiceService(proxyUrl);
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

      // Clear the last processed result when stopping
      // so next session starts fresh
      this.lastProcessedResult = '';

      // Clear any pending result processing
      if (this.resultProcessingTimeout) {
        clearTimeout(this.resultProcessingTimeout);
        this.resultProcessingTimeout = null;
      }
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
   * Propagates errors to allow callers to handle speech failures
   */
  async speak(text: string): Promise<void> {
    const startTime = Date.now();
    console.log('[VoiceService] Speech request received', {
      textLength: text.length,
      textPreview: text.substring(0, 50),
      timestamp: new Date().toISOString(),
    });

    try {
      await this.aiVoiceService.speak(text);
      const duration = Date.now() - startTime;
      console.log('[VoiceService] Speech completed successfully', {
        durationMs: duration,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('[VoiceService] Speech synthesis failed', {
        error: error instanceof Error ? error.message : String(error),
        errorType:
          error instanceof Error ? error.constructor.name : typeof error,
        durationMs: duration,
        textLength: text.length,
      });
      // Propagate error to allow caller to handle it
      throw error;
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
   * Set proxy URL for TTS service
   */
  setProxyUrl(proxyUrl: string) {
    this.aiVoiceService.setProxyUrl(proxyUrl);
  }

  /**
   * Get the voice method currently being used
   */
  getVoiceMethod(): string {
    return this.aiVoiceService.getVoiceMethod();
  }

  /**
   * Get the current TTS model
   */
  getCurrentTTSModel() {
    return this.aiVoiceService.getCurrentTTSModel();
  }

  /**
   * Get TTS capabilities
   */
  getTTSCapabilities() {
    return this.aiVoiceService.getTTSCapabilities();
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
    // Don't automatically set isListening to false here
    // The user controls when to stop listening via the toggle button
  }

  private onSpeechResults(e: any) {
    console.log('Speech results:', e);
    if (e.value && e.value.length > 0 && this.onResultCallback) {
      const result = e.value[0];

      // Prevent duplicate processing of the same result
      // This can happen when the speech recognition API fires multiple events
      // for the same final result in continuous mode
      if (result === this.lastProcessedResult) {
        console.log('Skipping duplicate result:', result);
        return;
      }

      // Clear any pending result processing timeout
      if (this.resultProcessingTimeout) {
        clearTimeout(this.resultProcessingTimeout);
      }

      // Debounce result processing to avoid rapid duplicates
      // If another result comes within the debounce delay, the previous one will be cancelled
      this.resultProcessingTimeout = setTimeout(() => {
        this.lastProcessedResult = result;
        // Use optional chaining to safely call the callback
        this.onResultCallback?.(result);
        this.resultProcessingTimeout = null;
      }, VoiceService.RESULT_DEBOUNCE_DELAY);
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
      // Clear any pending timeouts
      if (this.resultProcessingTimeout) {
        clearTimeout(this.resultProcessingTimeout);
        this.resultProcessingTimeout = null;
      }

      await Voice.destroy();
      await this.aiVoiceService.destroy();
    } catch (error) {
      console.error('Error destroying voice service:', error);
    }
  }
}

export default VoiceService;
