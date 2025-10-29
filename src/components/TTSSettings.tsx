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
  DEFAULT_TTS_CONFIG,
  DEFAULT_VOICES,
  SPEAKING_RATE_OPTIONS,
  TTS_DOCUMENTATION_URL,
  findVoiceByName,
  getLanguageGroupIndexByTargetLanguage,
} from '../config/tts.config';
import {STORAGE_KEYS} from '../config/gemini.config';
import {openURL} from '../utils/helpers';

interface TTSSettingsProps {
  targetLanguage: string;
}

const TTSSettings: React.FC<TTSSettingsProps> = ({targetLanguage}) => {
  const {theme} = useTheme();
  const [config, setConfig] = useState<TTSConfig>(DEFAULT_TTS_CONFIG);
  const [selectedLanguageGroup, setSelectedLanguageGroup] = useState(0);
  const isInitialMount = useRef(true);

  useEffect(() => {
    loadTTSConfig();
  }, []);

  // Auto-select language group and voice when target language changes
  useEffect(() => {
    // Skip the initial mount to avoid overwriting loaded config
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Set the initial language group
      const initialGroupIndex =
        getLanguageGroupIndexByTargetLanguage(targetLanguage);
      setSelectedLanguageGroup(initialGroupIndex);
      return;
    }

    const newLanguageGroupIndex =
      getLanguageGroupIndexByTargetLanguage(targetLanguage);
    setSelectedLanguageGroup(newLanguageGroupIndex);

    // Auto-select first voice for the language group
    const voices = DEFAULT_VOICES[newLanguageGroupIndex]?.voices || [];
    if (voices.length > 0) {
      const firstVoice = voices[0];
      const newConfig = {
        ...config,
        voiceName: firstVoice.name,
        languageCode: firstVoice.languageCode,
        ssmlGender: firstVoice.gender,
      };
      // Update config silently without showing success alert
      setConfig(newConfig);
      AsyncStorage.setItem(STORAGE_KEYS.TTS_CONFIG, JSON.stringify(newConfig));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetLanguage]);

  const loadTTSConfig = async () => {
    try {
      const savedConfig = await AsyncStorage.getItem(STORAGE_KEYS.TTS_CONFIG);
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Error loading TTS config:', error);
    }
  };

  const saveTTSConfig = async (newConfig: TTSConfig) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.TTS_CONFIG,
        JSON.stringify(newConfig),
      );
      setConfig(newConfig);
      Alert.alert('성공', 'TTS 설정이 저장되었습니다.');
    } catch (error) {
      console.error('Error saving TTS config:', error);
      Alert.alert('오류', 'TTS 설정 저장에 실패했습니다.');
    }
  };

  const handleVoiceChange = (voiceName: string) => {
    const voice = findVoiceByName(voiceName);
    if (voice) {
      const newConfig = {
        ...config,
        voiceName: voice.name,
        languageCode: voice.languageCode,
        ssmlGender: voice.gender,
      };
      saveTTSConfig(newConfig);
    }
  };

  const handleSpeakingRateChange = (rate: number) => {
    saveTTSConfig({...config, speakingRate: rate});
  };

  const handleCustomVoiceToggle = (value: boolean) => {
    saveTTSConfig({...config, useCustomVoice: value});
  };

  const handleOpenDocumentation = async () => {
    await openURL(TTS_DOCUMENTATION_URL);
  };

  const currentVoices = DEFAULT_VOICES[selectedLanguageGroup]?.voices || [];

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

      {/* Voice Selection - moved to be first after description */}
      <View style={styles.optionGroup}>
        <Text style={[styles.optionLabel, {color: theme.colors.text}]}>
          음성 선택
        </Text>
        <CustomPicker
          selectedValue={config.voiceName}
          onValueChange={handleVoiceChange}
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
          selectedValue={config.speakingRate.toString()}
          onValueChange={(value: string) =>
            handleSpeakingRateChange(parseFloat(value))
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

      {/* Custom Voice Toggle - moved below voice selection */}
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
            value={config.useCustomVoice}
            onValueChange={handleCustomVoiceToggle}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
            thumbColor={
              config.useCustomVoice
                ? theme.colors.buttonPrimaryText
                : theme.colors.inputBackground
            }
          />
        </View>
      </View>

      {/* Documentation Link - only shown when custom voice is enabled */}
      {config.useCustomVoice && (
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

      {/* Custom Voice Inputs */}
      {config.useCustomVoice && (
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
              value={config.customVoiceName || ''}
              onChangeText={text =>
                setConfig({...config, customVoiceName: text})
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
              value={config.customLanguageCode || ''}
              onChangeText={text =>
                setConfig({...config, customLanguageCode: text})
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
              selectedValue={config.customGender || 'FEMALE'}
              onValueChange={(value: string) =>
                setConfig({
                  ...config,
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

          <TouchableOpacity
            style={[
              styles.saveButton,
              {backgroundColor: theme.colors.buttonPrimary},
            ]}
            onPress={() => saveTTSConfig(config)}>
            <Text
              style={[
                styles.saveButtonText,
                {color: theme.colors.buttonPrimaryText},
              ]}>
              커스텀 설정 저장
            </Text>
          </TouchableOpacity>
        </>
      )}

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
