import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../../contexts/ThemeContext';
import UIDebugId from '../../components/UIDebugId';

interface SettingsCategory {
  id: string;
  icon: string;
  title: string;
  description: string;
  screen: string;
}

const SettingsMainScreen = ({navigation}: any) => {
  const {theme} = useTheme();
  const {t} = useTranslation();

  const categories: SettingsCategory[] = [
    {
      id: 'appearance',
      icon: '🎨',
      title: t('settings.categories.appearance.title'),
      description: t('settings.categories.appearance.description'),
      screen: 'AppearanceSettings',
    },
    {
      id: 'language',
      icon: '🌐',
      title: t('settings.categories.language.title'),
      description: t('settings.categories.language.description'),
      screen: 'LanguageSettings',
    },
    {
      id: 'api',
      icon: '🔑',
      title: t('settings.categories.api.title'),
      description: t('settings.categories.api.description'),
      screen: 'AllSettings',
    },
    {
      id: 'tts',
      icon: '🎤',
      title: t('settings.categories.tts.title'),
      description: t('settings.categories.tts.description'),
      screen: 'AllSettings',
    },
    {
      id: 'conversation',
      icon: '🗣️',
      title: t('settings.categories.conversation.title'),
      description: t('settings.categories.conversation.description'),
      screen: 'AllSettings',
    },
    {
      id: 'account',
      icon: '👤',
      title: t('settings.categories.account.title'),
      description: t('settings.categories.account.description'),
      screen: 'AllSettings',
    },
    {
      id: 'data',
      icon: '💾',
      title: t('settings.categories.data.title'),
      description: t('settings.categories.data.description'),
      screen: 'AllSettings',
    },
    {
      id: 'about',
      icon: 'ℹ️',
      title: t('settings.categories.about.title'),
      description: t('settings.categories.about.description'),
      screen: 'AllSettings',
    },
  ];

  const renderCategory = (category: SettingsCategory, index: number) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryCard,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={() =>
        navigation.navigate(category.screen, {category: category.id})
      }>
      <UIDebugId id={6 + index} />
      <View style={styles.categoryIcon}>
        <Text style={styles.categoryIconText}>{category.icon}</Text>
      </View>
      <View style={styles.categoryContent}>
        <Text style={[styles.categoryTitle, {color: theme.colors.text}]}>
          {category.title}
        </Text>
        <Text
          style={[
            styles.categoryDescription,
            {color: theme.colors.textSecondary},
          ]}>
          {category.description}
        </Text>
      </View>
      <Text style={[styles.categoryArrow, {color: theme.colors.textTertiary}]}>
        ›
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <UIDebugId id={5} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
            {t('settings.main.title')}
          </Text>
          <Text
            style={[
              styles.headerDescription,
              {color: theme.colors.textSecondary},
            ]}>
            {t('settings.main.description')}
          </Text>
        </View>

        <View style={styles.categoriesContainer}>
          {categories.map((category, index) => renderCategory(category, index))}
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
  header: {
    padding: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  categoriesContainer: {
    padding: 16,
    paddingTop: 0,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryIconText: {
    fontSize: 28,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  categoryArrow: {
    fontSize: 32,
    fontWeight: '300',
    marginLeft: 8,
  },
});

export default SettingsMainScreen;
