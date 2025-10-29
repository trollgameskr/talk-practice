/**
 * Google Cloud Text-to-Speech Configuration
 * Voice options for different languages
 */

export interface VoiceOption {
  name: string;
  displayName: string;
  gender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  languageCode: string;
}

export interface LanguageVoiceGroup {
  language: string;
  languageCode: string;
  voices: VoiceOption[];
}

// Default voice configurations grouped by language
export const DEFAULT_VOICES: LanguageVoiceGroup[] = [
  {
    language: '영어 (English)',
    languageCode: 'en-US',
    voices: [
      {
        name: 'en-US-Neural2-A',
        displayName: 'en-US-Neural2-A (여성)',
        gender: 'FEMALE',
        languageCode: 'en-US',
      },
      {
        name: 'en-US-Neural2-B',
        displayName: 'en-US-Neural2-B (남성)',
        gender: 'MALE',
        languageCode: 'en-US',
      },
      {
        name: 'en-US-Wavenet-D',
        displayName: 'en-US-Wavenet-D (여성)',
        gender: 'FEMALE',
        languageCode: 'en-US',
      },
      {
        name: 'en-GB-Neural2-C',
        displayName: 'en-GB-Neural2-C (여성)',
        gender: 'FEMALE',
        languageCode: 'en-GB',
      },
      {
        name: 'en-AU-Chirp3-HD-F',
        displayName: 'en-AU-Chirp3-HD-F (여성)',
        gender: 'FEMALE',
        languageCode: 'en-AU',
      },
    ],
  },
  {
    language: '한국어 (Korean)',
    languageCode: 'ko-KR',
    voices: [
      {
        name: 'ko-KR-Neural2-A',
        displayName: 'ko-KR-Neural2-A (여성)',
        gender: 'FEMALE',
        languageCode: 'ko-KR',
      },
      {
        name: 'ko-KR-Neural2-B',
        displayName: 'ko-KR-Neural2-B (남성)',
        gender: 'MALE',
        languageCode: 'ko-KR',
      },
      {
        name: 'ko-KR-Standard-A',
        displayName: 'ko-KR-Standard-A (여성)',
        gender: 'FEMALE',
        languageCode: 'ko-KR',
      },
      {
        name: 'ko-KR-Wavenet-C',
        displayName: 'ko-KR-Wavenet-C (여성)',
        gender: 'FEMALE',
        languageCode: 'ko-KR',
      },
      {
        name: 'ko-KR-Wavenet-D',
        displayName: 'ko-KR-Wavenet-D (남성)',
        gender: 'MALE',
        languageCode: 'ko-KR',
      },
    ],
  },
  {
    language: '일본어 (Japanese)',
    languageCode: 'ja-JP',
    voices: [
      {
        name: 'ja-JP-Neural2-A',
        displayName: 'ja-JP-Neural2-A (여성)',
        gender: 'FEMALE',
        languageCode: 'ja-JP',
      },
      {
        name: 'ja-JP-Neural2-B',
        displayName: 'ja-JP-Neural2-B (남성)',
        gender: 'MALE',
        languageCode: 'ja-JP',
      },
      {
        name: 'ja-JP-Wavenet-C',
        displayName: 'ja-JP-Wavenet-C (여성)',
        gender: 'FEMALE',
        languageCode: 'ja-JP',
      },
      {
        name: 'ja-JP-Wavenet-D',
        displayName: 'ja-JP-Wavenet-D (남성)',
        gender: 'MALE',
        languageCode: 'ja-JP',
      },
      {
        name: 'ja-JP-Standard-A',
        displayName: 'ja-JP-Standard-A (여성)',
        gender: 'FEMALE',
        languageCode: 'ja-JP',
      },
    ],
  },
  {
    language: '중국어 (Chinese, 만다린)',
    languageCode: 'cmn-CN',
    voices: [
      {
        name: 'cmn-CN-Neural2-A',
        displayName: 'cmn-CN-Neural2-A (여성)',
        gender: 'FEMALE',
        languageCode: 'cmn-CN',
      },
      {
        name: 'cmn-CN-Neural2-B',
        displayName: 'cmn-CN-Neural2-B (남성)',
        gender: 'MALE',
        languageCode: 'cmn-CN',
      },
      {
        name: 'cmn-CN-Wavenet-C',
        displayName: 'cmn-CN-Wavenet-C (여성)',
        gender: 'FEMALE',
        languageCode: 'cmn-CN',
      },
      {
        name: 'cmn-CN-Wavenet-D',
        displayName: 'cmn-CN-Wavenet-D (남성)',
        gender: 'MALE',
        languageCode: 'cmn-CN',
      },
      {
        name: 'cmn-CN-Standard-A',
        displayName: 'cmn-CN-Standard-A (여성)',
        gender: 'FEMALE',
        languageCode: 'cmn-CN',
      },
    ],
  },
  {
    language: '스페인어 (Spanish)',
    languageCode: 'es-ES',
    voices: [
      {
        name: 'es-ES-Neural2-A',
        displayName: 'es-ES-Neural2-A (여성)',
        gender: 'FEMALE',
        languageCode: 'es-ES',
      },
      {
        name: 'es-ES-Neural2-B',
        displayName: 'es-ES-Neural2-B (남성)',
        gender: 'MALE',
        languageCode: 'es-ES',
      },
      {
        name: 'es-ES-Wavenet-C',
        displayName: 'es-ES-Wavenet-C (여성)',
        gender: 'FEMALE',
        languageCode: 'es-ES',
      },
      {
        name: 'es-ES-Wavenet-D',
        displayName: 'es-ES-Wavenet-D (남성)',
        gender: 'MALE',
        languageCode: 'es-ES',
      },
      {
        name: 'es-ES-Standard-A',
        displayName: 'es-ES-Standard-A (여성)',
        gender: 'FEMALE',
        languageCode: 'es-ES',
      },
    ],
  },
  {
    language: '프랑스어 (French)',
    languageCode: 'fr-FR',
    voices: [
      {
        name: 'fr-FR-Neural2-A',
        displayName: 'fr-FR-Neural2-A (여성)',
        gender: 'FEMALE',
        languageCode: 'fr-FR',
      },
      {
        name: 'fr-FR-Neural2-B',
        displayName: 'fr-FR-Neural2-B (남성)',
        gender: 'MALE',
        languageCode: 'fr-FR',
      },
      {
        name: 'fr-FR-Wavenet-C',
        displayName: 'fr-FR-Wavenet-C (여성)',
        gender: 'FEMALE',
        languageCode: 'fr-FR',
      },
      {
        name: 'fr-FR-Wavenet-D',
        displayName: 'fr-FR-Wavenet-D (남성)',
        gender: 'MALE',
        languageCode: 'fr-FR',
      },
      {
        name: 'fr-FR-Standard-A',
        displayName: 'fr-FR-Standard-A (여성)',
        gender: 'FEMALE',
        languageCode: 'fr-FR',
      },
    ],
  },
  {
    language: '독일어 (German)',
    languageCode: 'de-DE',
    voices: [
      {
        name: 'de-DE-Neural2-A',
        displayName: 'de-DE-Neural2-A (여성)',
        gender: 'FEMALE',
        languageCode: 'de-DE',
      },
      {
        name: 'de-DE-Neural2-B',
        displayName: 'de-DE-Neural2-B (남성)',
        gender: 'MALE',
        languageCode: 'de-DE',
      },
      {
        name: 'de-DE-Wavenet-C',
        displayName: 'de-DE-Wavenet-C (여성)',
        gender: 'FEMALE',
        languageCode: 'de-DE',
      },
      {
        name: 'de-DE-Wavenet-D',
        displayName: 'de-DE-Wavenet-D (남성)',
        gender: 'MALE',
        languageCode: 'de-DE',
      },
      {
        name: 'de-DE-Standard-A',
        displayName: 'de-DE-Standard-A (여성)',
        gender: 'FEMALE',
        languageCode: 'de-DE',
      },
    ],
  },
];

// TTS Configuration interface
export interface TTSConfig {
  voiceName: string;
  languageCode: string;
  ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  speakingRate: number;
  pitch: number;
  volumeGainDb: number;
  useCustomVoice: boolean;
  customVoiceName?: string;
  customLanguageCode?: string;
  customGender?: 'MALE' | 'FEMALE' | 'NEUTRAL';
  // Region and endpoint configuration (closest to Korea)
  region: string;
  endpoint: string;
}

// Default TTS configuration
export const DEFAULT_TTS_CONFIG: TTSConfig = {
  voiceName: 'en-US-Neural2-A',
  languageCode: 'en-US',
  ssmlGender: 'FEMALE',
  speakingRate: 1.0,
  pitch: 0.0,
  volumeGainDb: 0.0,
  useCustomVoice: false,
  // Use Asia-Northeast region (Tokyo/Seoul) for low latency from Korea
  region: 'asia-northeast1',
  endpoint: 'https://texttospeech.googleapis.com',
};

// Speaking rate options
export const SPEAKING_RATE_OPTIONS = [
  {label: '매우 느림 (0.5x)', value: 0.5},
  {label: '느림 (0.75x)', value: 0.75},
  {label: '보통 (1.0x)', value: 1.0},
  {label: '빠름 (1.25x)', value: 1.25},
  {label: '매우 빠름 (1.5x)', value: 1.5},
];

// Google Cloud TTS documentation URL
export const TTS_DOCUMENTATION_URL =
  'https://cloud.google.com/text-to-speech/docs/list-voices-and-types';

// Helper function to get all voices as flat list for picker
export function getAllVoices(): VoiceOption[] {
  return DEFAULT_VOICES.flatMap(group => group.voices);
}

// Helper function to find voice by name
export function findVoiceByName(name: string): VoiceOption | undefined {
  return getAllVoices().find(voice => voice.name === name);
}

// Helper function to map target language code to TTS language group index
export function getLanguageGroupIndexByTargetLanguage(
  targetLang: string,
): number {
  const languageMap: {[key: string]: number} = {
    en: 0, // 영어 (English)
    ko: 1, // 한국어 (Korean)
    ja: 2, // 일본어 (Japanese)
    zh: 3, // 중국어 (Chinese)
    es: 4, // 스페인어 (Spanish)
    fr: 5, // 프랑스어 (French)
    de: 6, // 독일어 (German)
  };
  return languageMap[targetLang] ?? 0; // Default to English if not found
}
