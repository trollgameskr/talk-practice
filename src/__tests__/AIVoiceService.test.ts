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
    it('should return voice method', () => {
      const method = service.getVoiceMethod();
      expect(method).toBe('Google Cloud TTS (AI 음성)');
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

      // Mock Audio constructor to avoid browser API errors in tests
      const mockAudio = {
        load: jest.fn(),
        play: jest.fn().mockResolvedValue(undefined),
        pause: jest.fn(),
        oncanplay: null as any,
        onended: null as any,
        onerror: null as any,
        currentTime: 0,
      };
      (global as any).Audio = jest.fn(() => mockAudio);

      // Start speaking in background
      const speakPromise = service.speak('Hello, world!');
      
      // Wait a bit for fetch to be called
      await new Promise(resolve => setTimeout(resolve, 100));

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

      // Simulate audio ready and ended to resolve the promise
      if (mockAudio.oncanplay) {
        mockAudio.oncanplay();
      }
      if (mockAudio.onended) {
        mockAudio.onended();
      }

      // Now wait for speak to complete
      await speakPromise;
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
  });

  describe('stopSpeaking', () => {
    it('should stop speaking without errors', async () => {
      await service.stopSpeaking();
      expect(service.getIsSpeaking()).toBe(false);
    });
  });
});
