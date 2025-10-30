/**
 * Voice Service
 * Handles voice recognition and AI-generated speech
 */

import Voice from '@react-native-community/voice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AIVoiceService from './AIVoiceService';
import DeviceTTSService from './DeviceTTSService';
import {STORAGE_KEYS, TTSProvider} from '../config/gemini.config';

export class VoiceService {
  private isListening: boolean = false;
  private onResultCallback: ((text: string) => void) | null = null;
  private onErrorCallback: ((error: any) => void) | null = null;
  private aiVoiceService: AIVoiceService;
  private deviceTTSService: DeviceTTSService;
  private ttsProvider: TTSProvider = 'google-cloud'; // Default to Google Cloud
  private lastProcessedResult: string = '';
  private resultProcessingTimeout: NodeJS.Timeout | null = null;
  private isProcessingFinalResult: boolean = false;

  /**
   * Debounce delay for speech result processing (in milliseconds)
   * 
   * Increased to 500ms (from 100ms) to better handle mobile voice recognition issues:
   * - Mobile devices often fire multiple intermediate results during speech
   * - The longer delay prevents processing partial/intermediate results
   * - Works together with onSpeechPartialResults handler to ignore incomplete sentences
   * - Value chosen based on mobile testing to balance responsiveness vs accuracy
   * 
   * Note: If users on slower devices experience delays, this can be reduced to 300ms
   */
  private static readonly RESULT_DEBOUNCE_DELAY = 500;

  constructor(proxyUrl?: string) {
    this.initializeVoice();
    this.aiVoiceService = new AIVoiceService(proxyUrl);
    this.deviceTTSService = new DeviceTTSService();
    this.loadTTSProvider();
  }

  /**
   * Initialize voice recognition
   */
  private initializeVoice() {
    Voice.onSpeechStart = this.onSpeechStart.bind(this);
    Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
    Voice.onSpeechResults = this.onSpeechResults.bind(this);
    Voice.onSpeechPartialResults = this.onSpeechPartialResults.bind(this);
    Voice.onSpeechError = this.onSpeechError.bind(this);
  }

  /**
   * Load TTS provider preference from storage
   */
  private async loadTTSProvider() {
    try {
      const savedProvider = await AsyncStorage.getItem(STORAGE_KEYS.TTS_PROVIDER);
      if (savedProvider) {
        this.ttsProvider = savedProvider as TTSProvider;
        console.log('VoiceService: Loaded TTS provider:', this.ttsProvider);
      } else {
        // First time use - default to Google Cloud and save
        this.ttsProvider = 'google-cloud';
        await AsyncStorage.setItem(STORAGE_KEYS.TTS_PROVIDER, this.ttsProvider);
        console.log('VoiceService: First run - defaulting to Google Cloud TTS');
      }
    } catch (error) {
      console.error('Error loading TTS provider:', error);
      this.ttsProvider = 'google-cloud';
    }
  }

  /**
   * Set TTS provider
   */
  async setTTSProvider(provider: TTSProvider) {
    try {
      this.ttsProvider = provider;
      await AsyncStorage.setItem(STORAGE_KEYS.TTS_PROVIDER, provider);
      console.log('VoiceService: TTS provider set to:', provider);
    } catch (error) {
      console.error('Error setting TTS provider:', error);
    }
  }

  /**
   * Get current TTS provider
   */
  getTTSProvider(): TTSProvider {
    return this.ttsProvider;
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
      this.isProcessingFinalResult = false;

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
   * @param text Text to speak
   * @param voiceType Type of voice to use: 'ai' for AI responses, 'user' for user response samples
   */
  async speak(text: string, voiceType: 'ai' | 'user' = 'ai'): Promise<void> {
    const startTime = Date.now();
    console.log('[VoiceService] Speech request received', {
      textLength: text.length,
      textPreview: text.substring(0, 50),
      voiceType,
      provider: this.ttsProvider,
      timestamp: new Date().toISOString(),
    });

    try {
      // Use the selected TTS provider
      if (this.ttsProvider === 'device') {
        await this.deviceTTSService.speak(text, voiceType);
      } else {
        await this.aiVoiceService.speak(text, voiceType);
      }
      
      const duration = Date.now() - startTime;
      console.log('[VoiceService] Speech completed successfully', {
        durationMs: duration,
        provider: this.ttsProvider,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('[VoiceService] Speech synthesis failed', {
        error: error instanceof Error ? error.message : String(error),
        errorType:
          error instanceof Error ? error.constructor.name : typeof error,
        durationMs: duration,
        textLength: text.length,
        provider: this.ttsProvider,
      });
      // Propagate error to allow caller to handle it
      throw error;
    }
  }

  /**
   * Set language for TTS
   */
  async setLanguage(languageCode: string) {
    await this.aiVoiceService.setLanguage(languageCode);
    await this.deviceTTSService.setLanguage(languageCode);
  }

  /**
   * Stop speaking
   */
  async stopSpeaking(): Promise<void> {
    try {
      // Stop both TTS services
      await this.aiVoiceService.stopSpeaking();
      await this.deviceTTSService.stopSpeaking();
    } catch (error) {
      console.error('Error stopping voice:', error);
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
    if (this.ttsProvider === 'device') {
      return this.deviceTTSService.getVoiceMethod();
    }
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

  /**
   * Handle partial speech results - these are intermediate results while user is still speaking
   * We ignore these to avoid processing incomplete sentences
   */
  private onSpeechPartialResults(e: any) {
    console.log('Partial speech results (ignored):', e);
    // Do not process partial results - only process final results
  }

  private onSpeechResults(e: any) {
    console.log('Final speech results:', e);
    
    // Skip if we're already processing a final result
    if (this.isProcessingFinalResult) {
      console.log('Skipping result - already processing a final result');
      return;
    }
    
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

      // Mark that we're processing a final result
      this.isProcessingFinalResult = true;

      // Debounce result processing to avoid rapid duplicates
      // If another result comes within the debounce delay, the previous one will be cancelled
      this.resultProcessingTimeout = setTimeout(() => {
        this.lastProcessedResult = result;
        // Use optional chaining to safely call the callback
        this.onResultCallback?.(result);
        this.resultProcessingTimeout = null;
        this.isProcessingFinalResult = false;
      }, VoiceService.RESULT_DEBOUNCE_DELAY);
    }
  }

  private onSpeechError(e: any) {
    console.error('Speech error:', e);
    this.isListening = false;
    this.isProcessingFinalResult = false;
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
      await this.deviceTTSService.destroy();
    } catch (error) {
      console.error('Error destroying voice service:', error);
    }
  }
}

export default VoiceService;
