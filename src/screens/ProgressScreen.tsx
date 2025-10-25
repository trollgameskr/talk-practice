/**
 * Progress Screen - Display user progress and metrics
 */

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import StorageService from '../services/StorageService';
import {UserProgress, ConversationTopic} from '../types';
import {
  formatDuration,
  formatDate,
  getTopicDisplayName,
  getTopicIcon,
  getScoreColor,
  getScoreLabel,
} from '../utils/helpers';

const storageService = new StorageService();

const ProgressScreen = () => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'topics'>(
    'overview',
  );

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const userProgress = await storageService.getUserProgress();
    setProgress(userProgress);
  };

  if (!progress) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
          onPress={() => setSelectedTab('overview')}>
          <Text
            style={[
              styles.tabText,
              selectedTab === 'overview' && styles.activeTabText,
            ]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'topics' && styles.activeTab]}
          onPress={() => setSelectedTab('topics')}>
          <Text
            style={[
              styles.tabText,
              selectedTab === 'topics' && styles.activeTabText,
            ]}>
            Topics
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {selectedTab === 'overview' ? (
          <OverviewTab progress={progress} />
        ) : (
          <TopicsTab progress={progress} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const OverviewTab = ({progress}: {progress: UserProgress}) => {
  return (
    <View style={styles.tabContent}>
      <View style={styles.scoreCard}>
        <Text style={styles.scoreValue}>
          {progress.overallScore.toFixed(0)}
        </Text>
        <Text style={styles.scoreLabel}>Overall Score</Text>
        <Text
          style={[
            styles.scoreBadge,
            {backgroundColor: getScoreColor(progress.overallScore)},
          ]}>
          {getScoreLabel(progress.overallScore)}
        </Text>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{progress.totalSessions}</Text>
          <Text style={styles.metricLabel}>Total Sessions</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>
            {formatDuration(progress.totalDuration)}
          </Text>
          <Text style={styles.metricLabel}>Total Practice Time</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>
            {formatDuration(Math.round(progress.averageSessionDuration))}
          </Text>
          <Text style={styles.metricLabel}>Avg Session Duration</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>
            {progress.retentionRate.toFixed(0)}%
          </Text>
          <Text style={styles.metricLabel}>Retention Rate</Text>
        </View>
      </View>

      {progress.achievements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements 🏆</Text>
          {progress.achievements.map(achievement => (
            <View key={achievement.id} style={styles.achievementItem}>
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <View style={styles.achievementDetails}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
                <Text style={styles.achievementDate}>
                  {formatDate(achievement.earnedDate)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {progress.achievements.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🎯</Text>
          <Text style={styles.emptyStateText}>
            Keep practicing to earn achievements!
          </Text>
        </View>
      )}
    </View>
  );
};

const TopicsTab = ({progress}: {progress: UserProgress}) => {
  const topics = Object.keys(progress.topicProgress) as ConversationTopic[];

  return (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Topic Progress</Text>
      {topics.map(topic => {
        const topicProgress = progress.topicProgress[topic];
        return (
          <View key={topic} style={styles.topicCard}>
            <View style={styles.topicHeader}>
              <Text style={styles.topicIconLarge}>{getTopicIcon(topic)}</Text>
              <View style={styles.topicTitleContainer}>
                <Text style={styles.topicTitle}>
                  {getTopicDisplayName(topic)}
                </Text>
                <Text style={styles.topicSessions}>
                  {topicProgress.sessionsCompleted} session
                  {topicProgress.sessionsCompleted !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {topicProgress.sessionsCompleted > 0 && (
              <View style={styles.topicStats}>
                <View style={styles.topicStat}>
                  <Text style={styles.topicStatLabel}>Average Score</Text>
                  <Text
                    style={[
                      styles.topicStatValue,
                      {color: getScoreColor(topicProgress.averageScore)},
                    ]}>
                    {topicProgress.averageScore.toFixed(0)}
                  </Text>
                </View>
                <View style={styles.topicStat}>
                  <Text style={styles.topicStatLabel}>Last Session</Text>
                  <Text style={styles.topicStatValue}>
                    {formatDate(topicProgress.lastSessionDate)}
                  </Text>
                </View>
              </View>
            )}

            {topicProgress.sessionsCompleted === 0 && (
              <View style={styles.topicEmpty}>
                <Text style={styles.topicEmptyText}>
                  Start your first session in this topic!
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  scoreCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  scoreBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  achievementItem: {
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
  achievementDetails: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 11,
    color: '#9ca3af',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  topicCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  topicIconLarge: {
    fontSize: 40,
    marginRight: 12,
  },
  topicTitleContainer: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  topicSessions: {
    fontSize: 13,
    color: '#6b7280',
  },
  topicStats: {
    flexDirection: 'row',
    gap: 16,
  },
  topicStat: {
    flex: 1,
  },
  topicStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  topicStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  topicEmpty: {
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  topicEmptyText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default ProgressScreen;
