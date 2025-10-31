/**
 * Tests for TTSSettings preview functionality
 */

import AIVoiceService from '../services/AIVoiceService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../config/gemini.config';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock fetch globally
global.fetch = jest.fn();

// Shared test constants
const SAMPLE_TEXTS: {[key: string]: string} = {
  en: 'Hello! This is a preview of the selected voice. You can adjust the speed and other settings.',
  ko: '안녕하세요! 선택하신 음성의 미리듣기입니다. 속도와 다른 설정을 조정할 수 있습니다.',
  ja: 'こんにちは！選択した音声のプレビューです。速度やその他の設定を調整できます。',
};

const createTestVoiceConfig = (
  voiceName: string,
  languageCode: string,
  gender: 'MALE' | 'FEMALE',
  speakingRate = 1.0,
) => ({
  voiceName,
  languageCode,
  ssmlGender: gender as const,
  speakingRate,
  pitch: 0.0,
  volumeGainDb: 0.0,
  useCustomVoice: false,
});

const createTestTTSConfig = (langCode: string) => ({
  [langCode]: {
    aiVoice: createTestVoiceConfig('en-US-Standard-B', 'en-US', 'MALE', 1.5),
    userVoice: createTestVoiceConfig(
      'en-US-Standard-C',
      'en-US',
      'FEMALE',
      1.0,
    ),
    region: 'asia-northeast1',
    endpoint: 'https://texttospeech.googleapis.com',
  },
});

describe('TTSSettings Preview Functionality', () => {
  let service: AIVoiceService;

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    service = new AIVoiceService('http://localhost:4000');
  });

  afterEach(async () => {
    if (service) {
      await service.destroy();
    }
  });

  describe('getSampleTextForLanguage', () => {
    const getSampleText = (langCode: string) =>
      SAMPLE_TEXTS[langCode] || SAMPLE_TEXTS.en;

    it('should return English sample text for "en" language code', () => {
      expect(getSampleText('en')).toBe(SAMPLE_TEXTS.en);
    });

    it('should return Korean sample text for "ko" language code', () => {
      expect(getSampleText('ko')).toBe(SAMPLE_TEXTS.ko);
    });

    it('should return default English text for unknown language code', () => {
      expect(getSampleText('unknown')).toBe(SAMPLE_TEXTS.en);
    });
  });

  describe('Preview button functionality', () => {
    it('should call AIVoiceService.speak with correct voiceType for AI preview', async () => {
      const mockSpeak = jest.spyOn(service, 'speak');
      mockSpeak.mockResolvedValue();

      await service.speak('Test text', 'ai');

      expect(mockSpeak).toHaveBeenCalledWith('Test text', 'ai');
    });

    it('should call AIVoiceService.speak with correct voiceType for User preview', async () => {
      const mockSpeak = jest.spyOn(service, 'speak');
      mockSpeak.mockResolvedValue();

      await service.speak('Test text', 'user');

      expect(mockSpeak).toHaveBeenCalledWith('Test text', 'user');
    });

    it('should update TTS config before playing preview', async () => {
      const mockUpdateConfig = jest.spyOn(service, 'updateTTSConfig');
      mockUpdateConfig.mockResolvedValue();

      const testConfig = {
        aiVoice: createTestVoiceConfig(
          'en-US-Standard-B',
          'en-US',
          'MALE',
          1.5,
        ),
        userVoice: createTestVoiceConfig('en-US-Standard-C', 'en-US', 'FEMALE'),
        region: 'asia-northeast1',
        endpoint: 'https://texttospeech.googleapis.com',
      };

      await service.updateTTSConfig(testConfig);

      expect(mockUpdateConfig).toHaveBeenCalledWith(testConfig);
    });

    it('should set language before playing preview', async () => {
      const mockSetLanguage = jest.spyOn(service, 'setLanguage');
      mockSetLanguage.mockResolvedValue();

      await service.setLanguage('ko');

      expect(mockSetLanguage).toHaveBeenCalledWith('ko');
    });
  });

  describe('TTS Config persistence', () => {
    it('should save TTS config to AsyncStorage', async () => {
      const mockSetItem = jest.spyOn(AsyncStorage, 'setItem');
      mockSetItem.mockResolvedValue();

      const testConfig = createTestTTSConfig('en');

      await AsyncStorage.setItem(
        STORAGE_KEYS.TTS_CONFIGS_BY_LANGUAGE,
        JSON.stringify(testConfig),
      );

      expect(mockSetItem).toHaveBeenCalledWith(
        STORAGE_KEYS.TTS_CONFIGS_BY_LANGUAGE,
        JSON.stringify(testConfig),
      );
    });

    it('should load TTS config from AsyncStorage', async () => {
      const mockGetItem = jest.spyOn(AsyncStorage, 'getItem');
      const testConfig = {
        en: {
          aiVoice: createTestVoiceConfig(
            'en-US-Standard-B',
            'en-US',
            'MALE',
            1.5,
          ),
        },
      };

      mockGetItem.mockResolvedValue(JSON.stringify(testConfig));

      const result = await AsyncStorage.getItem(
        STORAGE_KEYS.TTS_CONFIGS_BY_LANGUAGE,
      );
      const parsedConfig = result ? JSON.parse(result) : null;

      expect(mockGetItem).toHaveBeenCalledWith(
        STORAGE_KEYS.TTS_CONFIGS_BY_LANGUAGE,
      );
      expect(parsedConfig).toEqual(testConfig);
    });
  });
});
