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
} from 'react-native';
import StorageService from '../services/StorageService';
import {UserProgress} from '../types';
import {formatDuration} from '../utils/helpers';
import CostDisplay from '../components/CostDisplay';

const storageService = new StorageService();

const HomeScreen = ({navigation}: any) => {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const userProgress = await storageService.getUserProgress();
    setProgress(userProgress);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to GeminiTalk</Text>
          <Text style={styles.subtitle}>
            Your AI-powered English conversation coach
          </Text>
        </View>

        {progress && (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{progress.totalSessions}</Text>
                <Text style={styles.statLabel}>Total Sessions</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {formatDuration(progress.totalDuration)}
                </Text>
                <Text style={styles.statLabel}>Practice Time</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {progress.overallScore.toFixed(0)}
                </Text>
                <Text style={styles.statLabel}>Overall Score</Text>
              </View>
            </View>
            
            <View style={styles.costContainer}>
              <CostDisplay />
            </View>
          </>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('TopicSelection')}>
            <Text style={styles.buttonText}>🎯 Start Practice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('Progress')}>
            <Text style={styles.secondaryButtonText}>📊 View Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.secondaryButtonText}>⚙️ Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <Text style={styles.infoText}>
            1. Choose a conversation topic{'\n'}
            2. Practice speaking in English{'\n'}
            3. Get instant feedback{'\n'}
            4. Track your progress over time
          </Text>
        </View>

        {progress && progress.achievements.length > 0 && (
          <View style={styles.achievementsContainer}>
            <Text style={styles.achievementsTitle}>
              Recent Achievements 🏆
            </Text>
            {progress.achievements.slice(-3).reverse().map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>
                    {achievement.title}
                  </Text>
                  <Text style={styles.achievementDescription}>
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
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
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
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  infoContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  achievementsContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f9fafb',
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
    color: '#1f2937',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  costContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
});

export default HomeScreen;
