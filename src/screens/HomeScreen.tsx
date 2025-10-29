/**
 * Home Screen
 */

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import StorageService from '../services/StorageService';
import {UserProgress} from '../types';
import {formatDuration} from '../utils/helpers';
import CostDisplay from '../components/CostDisplay';
import {STORAGE_KEYS} from '../config/gemini.config';
import {useTheme} from '../contexts/ThemeContext';

const storageService = new StorageService();

const HomeScreen = ({navigation}: any) => {
  const {theme} = useTheme();
  const {t} = useTranslation();
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    loadProgress();
    checkApiKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProgress = async () => {
    const userProgress = await storageService.getUserProgress();
    setProgress(userProgress);
  };

  const checkApiKey = async () => {
    const apiKey = await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
    if (!apiKey) {
      Alert.alert(
        t('home.apiKeyRequired.title'),
        t('home.apiKeyRequired.message'),
        [
          {text: t('home.apiKeyRequired.later'), style: 'cancel'},
          {
            text: t('home.apiKeyRequired.goToSettings'),
            onPress: () => navigation.navigate('Settings'),
          },
        ],
      );
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView style={styles.scrollView}>
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.colors.backgroundSecondary,
              borderBottomColor: theme.colors.border,
            },
          ]}>
          <Text style={[styles.title, {color: theme.colors.text}]}>
            {t('home.title')}
          </Text>
          <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
            {t('home.subtitle')}
          </Text>
        </View>

        {progress && (
          <>
            <View style={styles.statsContainer}>
              <View
                style={[styles.statCard, {backgroundColor: theme.colors.card}]}>
                <Text style={[styles.statValue, {color: theme.colors.primary}]}>
                  {progress.totalSessions}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    {color: theme.colors.textSecondary},
                  ]}>
                  {t('home.stats.totalSessions')}
                </Text>
              </View>
              <View
                style={[styles.statCard, {backgroundColor: theme.colors.card}]}>
                <Text style={[styles.statValue, {color: theme.colors.primary}]}>
                  {formatDuration(progress.totalDuration)}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    {color: theme.colors.textSecondary},
                  ]}>
                  {t('home.stats.practiceTime')}
                </Text>
              </View>
              <View
                style={[styles.statCard, {backgroundColor: theme.colors.card}]}>
                <Text style={[styles.statValue, {color: theme.colors.primary}]}>
                  {progress.overallScore.toFixed(0)}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    {color: theme.colors.textSecondary},
                  ]}>
                  {t('home.stats.overallScore')}
                </Text>
              </View>
            </View>

            <View style={styles.costContainer}>
              <CostDisplay />
            </View>
          </>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              {backgroundColor: theme.colors.buttonPrimary},
            ]}
            onPress={() => navigation.navigate('TopicSelection')}>
            <Text
              style={[
                styles.buttonText,
                {color: theme.colors.buttonPrimaryText},
              ]}>
              {t('home.buttons.startPractice')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.secondaryButton,
              {
                backgroundColor: theme.colors.buttonSecondary,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => navigation.navigate('Progress')}>
            <Text
              style={[
                styles.secondaryButtonText,
                {color: theme.colors.buttonSecondaryText},
              ]}>
              {t('home.buttons.viewProgress')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.secondaryButton,
              {
                backgroundColor: theme.colors.buttonSecondary,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => navigation.navigate('Settings')}>
            <Text
              style={[
                styles.secondaryButtonText,
                {color: theme.colors.buttonSecondaryText},
              ]}>
              {t('home.buttons.settings')}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.infoContainer,
            {
              backgroundColor: theme.colors.primaryLight,
              borderLeftColor: theme.colors.primary,
            },
          ]}>
          <Text style={[styles.infoTitle, {color: theme.colors.text}]}>
            {t('home.howItWorks.title')}
          </Text>
          <Text style={[styles.infoText, {color: theme.colors.textSecondary}]}>
            {t('home.howItWorks.step1')}
            {'\n'}
            {t('home.howItWorks.step2')}
            {'\n'}
            {t('home.howItWorks.step3')}
            {'\n'}
            {t('home.howItWorks.step4')}
          </Text>
        </View>

        {progress && progress.achievements.length > 0 && (
          <View
            style={[
              styles.achievementsContainer,
              {backgroundColor: theme.colors.card},
            ]}>
            <Text
              style={[styles.achievementsTitle, {color: theme.colors.text}]}>
              {t('home.achievements.title')}
            </Text>
            {progress.achievements
              .slice(-3)
              .reverse()
              .map(achievement => (
                <View
                  key={achievement.id}
                  style={[
                    styles.achievementCard,
                    {backgroundColor: theme.colors.backgroundTertiary},
                  ]}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <View style={styles.achievementInfo}>
                    <Text
                      style={[
                        styles.achievementTitle,
                        {color: theme.colors.text},
                      ]}>
                      {achievement.title}
                    </Text>
                    <Text
                      style={[
                        styles.achievementDescription,
                        {color: theme.colors.textSecondary},
                      ]}>
                      {achievement.description}
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        )}
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
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {},
  secondaryButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoContainer: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  achievementsContainer: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 12,
  },
  costContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
});

export default HomeScreen;
