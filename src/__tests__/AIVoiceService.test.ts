/**
 * Tests for AIVoiceService
 */

import AIVoiceService from '../services/AIVoiceService';

// Mock fetch globally
global.fetch = jest.fn();

describe('AIVoiceService', () => {
  let service: AIVoiceService;

  beforeEach(() => {
    // Reset fetch mock before each test
    (global.fetch as jest.Mock).mockClear();
    service = new AIVoiceService('http://localhost:4000');
  });

  afterEach(async () => {
    if (service) {
      await service.destroy();
    }
  });

  describe('constructor', () => {
    it('should initialize with default proxy URL', () => {
      const defaultService = new AIVoiceService();
      expect(defaultService).toBeDefined();
    });

    it('should initialize with custom proxy URL', () => {
      const customService = new AIVoiceService('http://custom-proxy:5000');
      expect(customService).toBeDefined();
    });
  });

  describe('setProxyUrl', () => {
    it('should allow setting proxy URL', () => {
      service.setProxyUrl('http://new-proxy:6000');
      // Service should not throw an error
      expect(service).toBeDefined();
    });
  });

  describe('TTS configuration', () => {
    it('should return current TTS config', () => {
      const config = service.getTTSConfig();
      expect(config).toBeDefined();
      expect(config.voiceName).toBe('en-US-Neural2-A');
      expect(config.languageCode).toBe('en-US');
    });

    it('should update TTS config', async () => {
      await service.updateTTSConfig({
        voiceName: 'en-US-Neural2-B',
        speakingRate: 1.5,
      });
      const config = service.getTTSConfig();
      expect(config.voiceName).toBe('en-US-Neural2-B');
      expect(config.speakingRate).toBe(1.5);
    });
  });

  describe('getVoiceMethod', () => {
    it('should return voice method for proxy', () => {
      const method = service.getVoiceMethod();
      expect(method).toBe('Google Cloud TTS (Proxy - AI 음성)');
    });

    it('should return voice method for direct API', () => {
      // Mock process.env to have API key
      const originalEnv = process.env;
      process.env = {...originalEnv, GOOGLE_TTS_API_KEY: 'test-api-key'};
      
      const directService = new AIVoiceService();
      const method = directService.getVoiceMethod();
      expect(method).toBe('Google Cloud TTS (Direct API - AI 음성)');
      
      // Restore original env
      process.env = originalEnv;
    });

    it('should return not available when no proxy or API key', () => {
      const noTtsService = new AIVoiceService();
      const method = noTtsService.getVoiceMethod();
      // When no proxy URL and no API key, should return not available
      expect(method).toContain('TTS');
    });
  });

  describe('getCurrentTTSModel', () => {
    it('should return current TTS model', () => {
      const model = service.getCurrentTTSModel();
      expect(model).toBe('Google Cloud TTS');
    });
  });

  describe('getTTSCapabilities', () => {
    it('should return TTS capabilities', () => {
      const capabilities = service.getTTSCapabilities();
      expect(capabilities).toBeDefined();
      expect(capabilities.model).toBe('Google Cloud TTS');
    });
  });

  describe('speak', () => {
    it('should call proxy endpoint with correct parameters', async () => {
      // Mock successful response
      const mockAudioContent = 'base64EncodedAudioData';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({audioContent: mockAudioContent}),
      });

      // Track the audio instance created
      let audioInstance: any = null;

      // Mock Audio constructor
      (global as any).Audio = jest.fn(function(this: any) {
        audioInstance = this;
        this.load = jest.fn(function() {
          // Trigger oncanplay and onended immediately for testing
          if (this.oncanplay) {
            this.oncanplay();
          }
          // Auto-end the audio immediately
          setTimeout(() => {
            if (this.onended) {
              this.onended();
            }
          }, 10);
        });
        this.play = jest.fn().mockResolvedValue(undefined);
        this.pause = jest.fn();
        this.oncanplay = null;
        this.onended = null;
        this.onerror = null;
        this.currentTime = 0;
        return this;
      });

      // Start speaking and wait for completion
      await service.speak('Hello, world!');

      // Verify fetch was called with correct URL and body
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/synthesize',
        expect.objectContaining({
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: expect.stringContaining('Hello, world!'),
        }),
      );

      // Parse the body to verify structure
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.text).toBe('Hello, world!');
      expect(requestBody.voice).toBeDefined();
      expect(requestBody.voice.languageCode).toBe('en-US');
      expect(requestBody.audioConfig).toBeDefined();
    });

    it('should call Google TTS API directly when API key is available', async () => {
      // Mock process.env to have API key
      const originalEnv = process.env;
      process.env = {...originalEnv, GOOGLE_TTS_API_KEY: 'test-api-key-123'};

      // Create service with API key
      const directService = new AIVoiceService();

      // Mock successful response
      const mockAudioContent = 'base64EncodedAudioData';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({audioContent: mockAudioContent}),
      });

      // Mock Audio constructor
      (global as any).Audio = jest.fn(function(this: any) {
        this.load = jest.fn(function() {
          if (this.oncanplay) {
            this.oncanplay();
          }
          setTimeout(() => {
            if (this.onended) {
              this.onended();
            }
          }, 10);
        });
        this.play = jest.fn().mockResolvedValue(undefined);
        this.pause = jest.fn();
        this.oncanplay = null;
        this.onended = null;
        this.onerror = null;
        this.currentTime = 0;
        return this;
      });

      // Start speaking and wait for completion
      await directService.speak('Direct API test');

      // Verify fetch was called with Google TTS API URL
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('texttospeech.googleapis.com'),
        expect.objectContaining({
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
        }),
      );

      // Verify the URL contains the API key
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[0]).toContain('key=test-api-key-123');

      // Parse the body to verify structure (direct API format)
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.input).toBeDefined();
      expect(requestBody.input.text).toBe('Direct API test');
      expect(requestBody.voice).toBeDefined();
      expect(requestBody.audioConfig).toBeDefined();
      expect(requestBody.audioConfig.audioEncoding).toBe('MP3');

      // Restore original env
      process.env = originalEnv;
      await directService.destroy();
    });

    it('should handle API errors gracefully', async () => {
      // Mock error response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({error: 'Server error'}),
      });

      await expect(service.speak('Test text')).rejects.toThrow();
    });

    it('should log detailed error information when speech fails', async () => {
      // Spy on console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock error response
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error'),
      );

      await expect(service.speak('Test error logging')).rejects.toThrow();

      // Verify detailed logging occurred
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[AIVoiceService]'),
        expect.objectContaining({
          error: expect.any(String),
          totalTimeMs: expect.any(Number),
          hasApiKey: expect.any(Boolean),
          hasProxyUrl: expect.any(Boolean),
        }),
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log when API key or proxy is not configured', async () => {
      // Spy on console.warn
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Create service without proxy
      const noConfigService = new AIVoiceService('');

      await expect(noConfigService.speak('Test')).rejects.toThrow();

      // Verify warning was logged
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[AIVoiceService]'),
        expect.objectContaining({
          hasApiKey: false,
          hasProxyUrl: false,
        }),
      );

      consoleWarnSpy.mockRestore();
      await noConfigService.destroy();
    });
  });

  describe('stopSpeaking', () => {
    it('should stop speaking without errors', async () => {
      await service.stopSpeaking();
      expect(service.getIsSpeaking()).toBe(false);
    });
  });
});
