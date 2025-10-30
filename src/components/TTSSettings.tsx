import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  ActivityIndicator,
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
import AIVoiceService, {VoiceType} from '../services/AIVoiceService';

interface TTSSettingsProps {
  targetLanguage: string;
}

const TTSSettings: React.FC<TTSSettingsProps> = ({targetLanguage}) => {
  const {theme} = useTheme();
  const [config, setConfig] = useState<TTSConfig>(DEFAULT_TTS_CONFIG);
  const [selectedLanguageGroup, setSelectedLanguageGroup] = useState(0);
  const [isPlayingAIPreview, setIsPlayingAIPreview] = useState(false);
  const [isPlayingUserPreview, setIsPlayingUserPreview] = useState(false);
  const aiVoiceServiceRef = useRef<AIVoiceService | null>(null);

  useEffect(() => {
    loadTTSConfigForLanguage(targetLanguage);
    // Initialize AIVoiceService
    if (!aiVoiceServiceRef.current) {
      aiVoiceServiceRef.current = new AIVoiceService();
    }
    // Cleanup on unmount
    return () => {
      if (aiVoiceServiceRef.current) {
        aiVoiceServiceRef.current.destroy();
      }
    };
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
      const langConfig =
        savedConfigs[langCode] || getDefaultTTSConfigForLanguage(langCode);
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

      // Update AIVoiceService with new config
      if (aiVoiceServiceRef.current) {
        await aiVoiceServiceRef.current.setLanguage(targetLanguage);
        await aiVoiceServiceRef.current.updateTTSConfig(newConfig);
      }

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

  const getSampleTextForLanguage = (langCode: string): string => {
    const sampleTexts: {[key: string]: string} = {
      en: 'Hello! This is a preview of the selected voice. You can adjust the speed and other settings.',
      ko: '안녕하세요! 선택하신 음성의 미리듣기입니다. 속도와 다른 설정을 조정할 수 있습니다.',
      ja: 'こんにちは！選択した音声のプレビューです。速度やその他の設定を調整できます。',
      zh: '你好！这是所选语音的预览。您可以调整速度和其他设置。',
      es: '¡Hola! Esta es una vista previa de la voz seleccionada. Puede ajustar la velocidad y otras configuraciones.',
      fr: "Bonjour! Ceci est un aperçu de la voix sélectionnée. Vous pouvez ajuster la vitesse et d'autres paramètres.",
      de: 'Hallo! Dies ist eine Vorschau der ausgewählten Stimme. Sie können die Geschwindigkeit und andere Einstellungen anpassen.',
    };
    return sampleTexts[langCode] || sampleTexts.en;
  };

  const handlePreview = async (voiceType: VoiceType) => {
    if (!aiVoiceServiceRef.current) {
      Alert.alert('오류', 'TTS 서비스를 초기화할 수 없습니다.');
      return;
    }

    // Check if already playing
    if (voiceType === 'ai' && isPlayingAIPreview) {
      return;
    }
    if (voiceType === 'user' && isPlayingUserPreview) {
      return;
    }

    try {
      // Set loading state
      if (voiceType === 'ai') {
        setIsPlayingAIPreview(true);
      } else {
        setIsPlayingUserPreview(true);
      }

      // Update AIVoiceService with current config before playing
      await aiVoiceServiceRef.current.setLanguage(targetLanguage);
      await aiVoiceServiceRef.current.updateTTSConfig(config);

      // Get sample text for the current language
      const sampleText = getSampleTextForLanguage(targetLanguage);

      // Play the preview
      await aiVoiceServiceRef.current.speak(sampleText, voiceType);
    } catch (error) {
      console.error('Preview playback error:', error);

      // Check for specific error types
      if (error instanceof Error) {
        if (error.message === 'TTS_API_NOT_ENABLED') {
          Alert.alert(
            'TTS API 활성화 필요',
            'Google Cloud Text-to-Speech API가 활성화되어 있지 않습니다. Google Cloud Console에서 API를 활성화해주세요.',
          );
        } else if (error.message.includes('API key or proxy not configured')) {
          Alert.alert(
            '설정 필요',
            'TTS API 키가 설정되지 않았습니다. 설정 화면에서 TTS API 키를 입력해주세요.',
          );
        } else {
          Alert.alert(
            '재생 오류',
            `미리듣기 재생 중 오류가 발생했습니다: ${error.message}`,
          );
        }
      } else {
        Alert.alert('재생 오류', '미리듣기 재생 중 오류가 발생했습니다.');
      }
    } finally {
      // Clear loading state
      if (voiceType === 'ai') {
        setIsPlayingAIPreview(false);
      } else {
        setIsPlayingUserPreview(false);
      }
    }
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
    voiceType: VoiceType,
    isPlayingPreview: boolean,
  ) => (
    <>
      <View style={styles.voiceSectionHeader}>
        <Text style={[styles.voiceSectionTitle, {color: theme.colors.primary}]}>
          {title}
        </Text>
        <Text
          style={[
            styles.voiceSectionDescription,
            {color: theme.colors.textSecondary},
          ]}>
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

      {/* Preview Button */}
      <View style={styles.optionGroup}>
        <TouchableOpacity
          style={[
            styles.previewButton,
            {
              backgroundColor: theme.colors.buttonPrimary,
              opacity: isPlayingPreview ? 0.6 : 1,
            },
          ]}
          onPress={() => handlePreview(voiceType)}
          disabled={isPlayingPreview}>
          {isPlayingPreview ? (
            <View style={styles.previewButtonContent}>
              <ActivityIndicator
                size="small"
                color={theme.colors.buttonPrimaryText}
              />
              <Text
                style={[
                  styles.previewButtonText,
                  {color: theme.colors.buttonPrimaryText, marginLeft: 8},
                ]}>
                재생 중...
              </Text>
            </View>
          ) : (
            <Text
              style={[
                styles.previewButtonText,
                {color: theme.colors.buttonPrimaryText},
              ]}>
              🔊 미리듣기
            </Text>
          )}
        </TouchableOpacity>
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
              onChangeText={text => onConfigChange({customVoiceName: text})}
              placeholder="예: en-US-Standard-B"
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
              onChangeText={text => onConfigChange({customLanguageCode: text})}
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
        updates => {
          const newConfig = {
            ...config,
            aiVoice: {...config.aiVoice, ...updates},
          };
          setConfig(newConfig);
        },
        'ai',
        isPlayingAIPreview,
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
        updates => {
          const newConfig = {
            ...config,
            userVoice: {...config.userVoice, ...updates},
          };
          setConfig(newConfig);
        },
        'user',
        isPlayingUserPreview,
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
          🗣️ 현재 언어:{' '}
          {DEFAULT_VOICES[selectedLanguageGroup]?.language || '영어'}
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
  previewButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  previewButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  previewButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TTSSettings;
