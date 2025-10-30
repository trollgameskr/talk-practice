import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from '../contexts/ThemeContext';
import CustomPicker from './CustomPicker';
import {
  TTSConfig,
  VoiceConfig,
  LanguageTTSConfigs,
  DEFAULT_TTS_CONFIG,
  DEFAULT_VOICES,
  SPEAKING_RATE_OPTIONS,
  TTS_DOCUMENTATION_URL,
  findVoiceByName,
  getLanguageGroupIndexByTargetLanguage,
  getDefaultTTSConfigForLanguage,
} from '../config/tts.config';
import {STORAGE_KEYS} from '../config/gemini.config';
import {openURL} from '../utils/helpers';
import {migrateOldTTSConfig} from '../utils/ttsMigration';

interface TTSSettingsProps {
  targetLanguage: string;
}

const TTSSettings: React.FC<TTSSettingsProps> = ({targetLanguage}) => {
  const {theme} = useTheme();
  const [config, setConfig] = useState<TTSConfig>(DEFAULT_TTS_CONFIG);
  const [selectedLanguageGroup, setSelectedLanguageGroup] = useState(0);
  const isInitialMount = useRef(true);

  useEffect(() => {
    loadTTSConfigForLanguage(targetLanguage);
  }, [targetLanguage]);

  const loadTTSConfigForLanguage = async (langCode: string) => {
    try {
      // Try migration first (will only migrate once)
      await migrateOldTTSConfig();

      // Load language-specific configs
      const savedConfigsStr = await AsyncStorage.getItem(
        STORAGE_KEYS.TTS_CONFIGS_BY_LANGUAGE,
      );
      let savedConfigs: LanguageTTSConfigs = {};
      
      if (savedConfigsStr) {
        savedConfigs = JSON.parse(savedConfigsStr);
      }

      // Get config for current language or use default
      const langConfig = savedConfigs[langCode] || getDefaultTTSConfigForLanguage(langCode);
      setConfig(langConfig);

      // Set the language group
      const groupIndex = getLanguageGroupIndexByTargetLanguage(langCode);
      setSelectedLanguageGroup(groupIndex);
    } catch (error) {
      console.error('Error loading TTS config for language:', error);
      const defaultConfig = getDefaultTTSConfigForLanguage(langCode);
      setConfig(defaultConfig);
    }
  };

  const saveTTSConfigForLanguage = async (newConfig: TTSConfig) => {
    try {
      // Load existing configs
      const savedConfigsStr = await AsyncStorage.getItem(
        STORAGE_KEYS.TTS_CONFIGS_BY_LANGUAGE,
      );
      let savedConfigs: LanguageTTSConfigs = {};
      
      if (savedConfigsStr) {
        savedConfigs = JSON.parse(savedConfigsStr);
      }

      // Update config for current language
      savedConfigs[targetLanguage] = newConfig;

      // Save back to storage
      await AsyncStorage.setItem(
        STORAGE_KEYS.TTS_CONFIGS_BY_LANGUAGE,
        JSON.stringify(savedConfigs),
      );
      
      setConfig(newConfig);
      Alert.alert('성공', 'TTS 설정이 저장되었습니다.');
    } catch (error) {
      console.error('Error saving TTS config:', error);
      Alert.alert('오류', 'TTS 설정 저장에 실패했습니다.');
    }
  };

  const handleAIVoiceChange = (voiceName: string) => {
    const voice = findVoiceByName(voiceName);
    if (voice) {
      const newConfig = {
        ...config,
        aiVoice: {
          ...config.aiVoice,
          voiceName: voice.name,
          languageCode: voice.languageCode,
          ssmlGender: voice.gender,
        },
      };
      saveTTSConfigForLanguage(newConfig);
    }
  };

  const handleUserVoiceChange = (voiceName: string) => {
    const voice = findVoiceByName(voiceName);
    if (voice) {
      const newConfig = {
        ...config,
        userVoice: {
          ...config.userVoice,
          voiceName: voice.name,
          languageCode: voice.languageCode,
          ssmlGender: voice.gender,
        },
      };
      saveTTSConfigForLanguage(newConfig);
    }
  };

  const handleAISpeakingRateChange = (rate: number) => {
    saveTTSConfigForLanguage({
      ...config,
      aiVoice: {...config.aiVoice, speakingRate: rate},
    });
  };

  const handleUserSpeakingRateChange = (rate: number) => {
    saveTTSConfigForLanguage({
      ...config,
      userVoice: {...config.userVoice, speakingRate: rate},
    });
  };

  const handleAICustomVoiceToggle = (value: boolean) => {
    saveTTSConfigForLanguage({
      ...config,
      aiVoice: {...config.aiVoice, useCustomVoice: value},
    });
  };

  const handleUserCustomVoiceToggle = (value: boolean) => {
    saveTTSConfigForLanguage({
      ...config,
      userVoice: {...config.userVoice, useCustomVoice: value},
    });
  };

  const handleOpenDocumentation = async () => {
    await openURL(TTS_DOCUMENTATION_URL);
  };

  const currentVoices = DEFAULT_VOICES[selectedLanguageGroup]?.voices || [];

  // Helper function to render voice configuration section
  const renderVoiceConfigSection = (
    title: string,
    description: string,
    voiceConfig: VoiceConfig,
    onVoiceChange: (voiceName: string) => void,
    onSpeakingRateChange: (rate: number) => void,
    onCustomVoiceToggle: (value: boolean) => void,
    onConfigChange: (updatedConfig: Partial<VoiceConfig>) => void,
  ) => (
    <>
      <View style={styles.voiceSectionHeader}>
        <Text style={[styles.voiceSectionTitle, {color: theme.colors.primary}]}>
          {title}
        </Text>
        <Text style={[styles.voiceSectionDescription, {color: theme.colors.textSecondary}]}>
          {description}
        </Text>
      </View>

      {/* Voice Selection */}
      <View style={styles.optionGroup}>
        <Text style={[styles.optionLabel, {color: theme.colors.text}]}>
          음성 선택
        </Text>
        <CustomPicker
          selectedValue={voiceConfig.voiceName}
          onValueChange={onVoiceChange}
          items={currentVoices.map(voice => ({
            label: voice.displayName,
            value: voice.name,
          }))}
          placeholder="음성을 선택하세요"
          theme={theme}
          style={styles.pickerContainer}
        />
      </View>

      {/* Speaking Rate */}
      <View style={styles.optionGroup}>
        <Text style={[styles.optionLabel, {color: theme.colors.text}]}>
          말하기 속도
        </Text>
        <CustomPicker
          selectedValue={voiceConfig.speakingRate.toString()}
          onValueChange={(value: string) =>
            onSpeakingRateChange(parseFloat(value))
          }
          items={SPEAKING_RATE_OPTIONS.map(option => ({
            label: option.label,
            value: option.value.toString(),
          }))}
          placeholder="말하기 속도를 선택하세요"
          theme={theme}
          style={styles.pickerContainer}
        />
      </View>

      {/* Custom Voice Toggle */}
      <View style={styles.optionGroup}>
        <View style={styles.themeRow}>
          <View style={styles.themeInfo}>
            <Text style={[styles.themeLabel, {color: theme.colors.text}]}>
              커스텀 음성 사용
            </Text>
            <Text
              style={[
                styles.themeDescription,
                {color: theme.colors.textSecondary},
              ]}>
              직접 음성 이름을 입력하여 사용
            </Text>
          </View>
          <Switch
            value={voiceConfig.useCustomVoice}
            onValueChange={onCustomVoiceToggle}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
            thumbColor={
              voiceConfig.useCustomVoice
                ? theme.colors.buttonPrimaryText
                : theme.colors.inputBackground
            }
          />
        </View>
      </View>

      {/* Custom Voice Inputs */}
      {voiceConfig.useCustomVoice && (
        <>
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, {color: theme.colors.text}]}>
              커스텀 음성 이름
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.inputBorder,
                  color: theme.colors.text,
                },
              ]}
              value={voiceConfig.customVoiceName || ''}
              onChangeText={text =>
                onConfigChange({customVoiceName: text})
              }
              placeholder="예: en-US-Neural2-F"
              placeholderTextColor={theme.colors.textTertiary}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, {color: theme.colors.text}]}>
              커스텀 언어 코드
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.inputBorder,
                  color: theme.colors.text,
                },
              ]}
              value={voiceConfig.customLanguageCode || ''}
              onChangeText={text =>
                onConfigChange({customLanguageCode: text})
              }
              placeholder="예: en-US"
              placeholderTextColor={theme.colors.textTertiary}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.optionGroup}>
            <Text style={[styles.optionLabel, {color: theme.colors.text}]}>
              커스텀 성별
            </Text>
            <CustomPicker
              selectedValue={voiceConfig.customGender || 'FEMALE'}
              onValueChange={(value: string) =>
                onConfigChange({
                  customGender: value as 'MALE' | 'FEMALE' | 'NEUTRAL',
                })
              }
              items={[
                {label: '여성 (FEMALE)', value: 'FEMALE'},
                {label: '남성 (MALE)', value: 'MALE'},
                {label: '중성 (NEUTRAL)', value: 'NEUTRAL'},
              ]}
              placeholder="성별을 선택하세요"
              theme={theme}
              style={styles.pickerContainer}
            />
          </View>
        </>
      )}
    </>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}>
      <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
        🎙️ TTS 음성 설정
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {color: theme.colors.textSecondary},
        ]}>
        Google Cloud Text-to-Speech 음성 설정을 커스터마이징하세요
      </Text>

      {/* Documentation Link */}
      {(config.aiVoice.useCustomVoice || config.userVoice.useCustomVoice) && (
        <TouchableOpacity
          style={[
            styles.linkButton,
            {
              backgroundColor: theme.colors.buttonSecondary,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={handleOpenDocumentation}>
          <Text
            style={[
              styles.linkButtonText,
              {color: theme.colors.buttonSecondaryText},
            ]}>
            📚 다양한 음성 타입 보기 (Google Cloud 문서)
          </Text>
        </TouchableOpacity>
      )}

      {/* AI Response Voice Configuration */}
      {renderVoiceConfigSection(
        '🤖 AI 응답 음성',
        'AI가 응답할 때 사용하는 음성',
        config.aiVoice,
        handleAIVoiceChange,
        handleAISpeakingRateChange,
        handleAICustomVoiceToggle,
        (updates) => {
          const newConfig = {
            ...config,
            aiVoice: {...config.aiVoice, ...updates},
          };
          setConfig(newConfig);
        },
      )}

      {/* Separator */}
      <View style={styles.separator} />

      {/* User Response Voice Configuration */}
      {renderVoiceConfigSection(
        '👤 사용자 응답 음성',
        '선택지를 클릭했을 때 읽어주는 음성',
        config.userVoice,
        handleUserVoiceChange,
        handleUserSpeakingRateChange,
        handleUserCustomVoiceToggle,
        (updates) => {
          const newConfig = {
            ...config,
            userVoice: {...config.userVoice, ...updates},
          };
          setConfig(newConfig);
        },
      )}

      {/* Save Button */}
      <TouchableOpacity
        style={[
          styles.saveButton,
          {backgroundColor: theme.colors.buttonPrimary},
        ]}
        onPress={() => saveTTSConfigForLanguage(config)}>
        <Text
          style={[
            styles.saveButtonText,
            {color: theme.colors.buttonPrimaryText},
          ]}>
          설정 저장
        </Text>
      </TouchableOpacity>

      {/* Info Box */}
      <View
        style={[
          styles.infoBox,
          {
            backgroundColor: theme.colors.primaryLight,
            borderLeftColor: theme.colors.primary,
          },
        ]}>
        <Text style={[styles.infoText, {color: theme.colors.primaryDark}]}>
          ℹ️ 음성 설정은 Google Cloud Text-to-Speech API를 사용합니다. 설정을
          변경하면 다음 음성 재생부터 적용됩니다.
        </Text>
        <Text
          style={[
            styles.infoText,
            {color: theme.colors.primaryDark},
            {marginTop: 8},
          ]}>
          🌏 서버 리전: {config.region} (한국과 가까운 아시아 리전)
        </Text>
        <Text
          style={[
            styles.infoText,
            {color: theme.colors.primaryDark},
            {marginTop: 8},
          ]}>
          🗣️ 현재 언어: {DEFAULT_VOICES[selectedLanguageGroup]?.language || '영어'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  voiceSectionHeader: {
    marginTop: 16,
    marginBottom: 12,
  },
  voiceSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  voiceSectionDescription: {
    fontSize: 13,
    marginBottom: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  optionGroup: {
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  pickerContainer: {
    marginBottom: 8,
  },
  linkButton: {
    borderWidth: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  themeInfo: {
    flex: 1,
    marginRight: 16,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  saveButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default TTSSettings;
