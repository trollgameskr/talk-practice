/**
 * Language Settings Screen
 * Extracted from SettingsScreen.tsx
 */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../../contexts/ThemeContext';
import CustomPicker from '../../components/CustomPicker';
import {
  saveLanguage,
  getAvailableLanguages,
  getCurrentLanguage,
  saveTargetLanguage,
  getTargetLanguage,
  getAvailableTargetLanguages,
} from '../../config/i18n.config';

const LanguageSettingsScreen = () => {
  const {theme} = useTheme();
  const {t, i18n} = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [selectedTargetLanguage, setSelectedTargetLanguage] =
    useState<string>('en');

  useEffect(() => {
    loadLanguage();
    loadTargetLanguage();
  }, []);

  const loadLanguage = async () => {
    const currentLang = await getCurrentLanguage();
    setSelectedLanguage(currentLang);
  };

  const loadTargetLanguage = async () => {
    const targetLang = await getTargetLanguage();
    setSelectedTargetLanguage(targetLang);
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            {t('settings.sections.language.title')}
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              {color: theme.colors.textSecondary},
            ]}>
            {t('settings.sections.language.description')}
          </Text>

          <View style={styles.optionGroup}>
            <Text style={[styles.optionLabel, {color: theme.colors.text}]}>
              {t('settings.sections.language.nativeLanguage')}
            </Text>
            <CustomPicker
              selectedValue={selectedLanguage}
              onValueChange={async (value: string) => {
                await saveLanguage(value);
                await i18n.changeLanguage(value);
                setSelectedLanguage(value);
                Alert.alert(
                  t('common.success'),
                  t('settings.sections.language.success'),
                );
              }}
              items={getAvailableLanguages().map(lang => ({
                label: lang.name,
                value: lang.code,
              }))}
              placeholder={t('settings.sections.language.nativeLanguage')}
              theme={theme}
              style={styles.pickerContainer}
            />
          </View>

          <View style={styles.optionGroup}>
            <Text style={[styles.optionLabel, {color: theme.colors.text}]}>
              {t('settings.sections.language.targetLanguage')}
            </Text>
            <CustomPicker
              selectedValue={selectedTargetLanguage}
              onValueChange={async (value: string) => {
                await saveTargetLanguage(value);
                setSelectedTargetLanguage(value);
                Alert.alert(
                  t('common.success'),
                  t('settings.sections.language.success'),
                );
              }}
              items={getAvailableTargetLanguages().map(lang => ({
                label: t(
                  `settings.sections.language.targetLanguages.${lang.code}`,
                ),
                value: lang.code,
              }))}
              placeholder={t('settings.sections.language.targetLanguage')}
              theme={theme}
              style={styles.pickerContainer}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
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
    marginBottom: 12,
  },
  pickerContainer: {
    marginBottom: 8,
  },
});

export default LanguageSettingsScreen;
