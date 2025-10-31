/**
 * TTS Configuration Migration Utilities
 * Handles migration from old single TTS config to new per-language format
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {TTSConfig, LanguageTTSConfigs} from '../config/tts.config';
import {STORAGE_KEYS} from '../config/gemini.config';

/**
 * Migrate old TTS config format to new per-language format
 * This function should be called only once when the app loads
 * @returns true if migration was performed, false otherwise
 */
export async function migrateOldTTSConfig(): Promise<boolean> {
  try {
    // Check if new format already exists
    const newConfigStr = await AsyncStorage.getItem(
      STORAGE_KEYS.TTS_CONFIGS_BY_LANGUAGE,
    );
    if (newConfigStr) {
      // Migration already done
      return false;
    }

    // Try to load old format
    const oldConfigStr = await AsyncStorage.getItem(STORAGE_KEYS.TTS_CONFIG);
    if (!oldConfigStr) {
      // No old config to migrate
      return false;
    }

    const oldConfig = JSON.parse(oldConfigStr);

    // Check if it's the old format (has voiceName instead of aiVoice/userVoice)
    if (!oldConfig.voiceName || oldConfig.aiVoice || oldConfig.userVoice) {
      // Not old format or already migrated
      return false;
    }

    console.log('[TTSMigration] Migrating old TTS config to new format');

    // Convert old format to new format
    const migratedConfig: TTSConfig = {
      aiVoice: {
        voiceName: oldConfig.voiceName,
        languageCode: oldConfig.languageCode,
        ssmlGender: oldConfig.ssmlGender,
        speakingRate: oldConfig.speakingRate || 1.0,
        pitch: oldConfig.pitch || 0.0,
        volumeGainDb: oldConfig.volumeGainDb || 0.0,
        useCustomVoice: oldConfig.useCustomVoice || false,
        customVoiceName: oldConfig.customVoiceName,
        customLanguageCode: oldConfig.customLanguageCode,
        customGender: oldConfig.customGender,
      },
      userVoice: {
        voiceName: oldConfig.voiceName,
        languageCode: oldConfig.languageCode,
        ssmlGender: oldConfig.ssmlGender,
        speakingRate: oldConfig.speakingRate || 1.0,
        pitch: oldConfig.pitch || 0.0,
        volumeGainDb: oldConfig.volumeGainDb || 0.0,
        useCustomVoice: oldConfig.useCustomVoice || false,
        customVoiceName: oldConfig.customVoiceName,
        customLanguageCode: oldConfig.customLanguageCode,
        customGender: oldConfig.customGender,
      },
      region: oldConfig.region || 'asia-northeast1',
      endpoint: oldConfig.endpoint || 'https://texttospeech.googleapis.com',
    };

    // Save migrated config for all common languages
    const migratedConfigs: LanguageTTSConfigs = {
      en: migratedConfig,
      ko: migratedConfig,
      ja: migratedConfig,
      zh: migratedConfig,
      es: migratedConfig,
      fr: migratedConfig,
      de: migratedConfig,
    };

    // Save to new storage location
    await AsyncStorage.setItem(
      STORAGE_KEYS.TTS_CONFIGS_BY_LANGUAGE,
      JSON.stringify(migratedConfigs),
    );

    // Remove old config
    await AsyncStorage.removeItem(STORAGE_KEYS.TTS_CONFIG);

    console.log('[TTSMigration] Migration completed successfully');
    return true;
  } catch (error) {
    console.error('[TTSMigration] Error during migration:', error);
    return false;
  }
}
