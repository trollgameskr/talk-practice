/**
 * Topic Selection Screen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {ConversationTopic} from '../types';
import {getTopicDisplayName, getTopicIcon} from '../utils/helpers';
import {useTheme} from '../contexts/ThemeContext';

const topics = [
  {
    topic: ConversationTopic.DAILY,
    description: 'Practice everyday conversations about daily life',
  },
  {
    topic: ConversationTopic.TRAVEL,
    description: 'Learn travel-related phrases and scenarios',
  },
  {
    topic: ConversationTopic.BUSINESS,
    description: 'Professional business English and etiquette',
  },
  {
    topic: ConversationTopic.CASUAL,
    description: 'Informal chats about entertainment and hobbies',
  },
  {
    topic: ConversationTopic.PROFESSIONAL,
    description: 'Workplace communication and collaboration',
  },
];

const TopicSelectionScreen = ({navigation}: any) => {
  const {theme, isDark} = useTheme();
  const handleTopicSelect = (topic: ConversationTopic) => {
    navigation.navigate('Conversation', {topic});
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView style={styles.scrollView}>
        <View style={[styles.header, {backgroundColor: theme.colors.backgroundSecondary, borderBottomColor: theme.colors.border}]}>
          <Text style={[styles.title, {color: theme.colors.text}]}>Choose Your Topic</Text>
          <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
            Select a conversation topic to practice
          </Text>
        </View>

        <View style={styles.topicsContainer}>
          {topics.map(({topic, description}) => (
            <TouchableOpacity
              key={topic}
              style={[styles.topicCard, {backgroundColor: theme.colors.card}]}
              onPress={() => handleTopicSelect(topic)}>
              <View style={[styles.topicIconContainer, {backgroundColor: theme.colors.primaryLight}]}>
                <Text style={styles.topicIcon}>{getTopicIcon(topic)}</Text>
              </View>
              <View style={styles.topicInfo}>
                <Text style={[styles.topicName, {color: theme.colors.text}]}>
                  {getTopicDisplayName(topic)}
                </Text>
                <Text style={[styles.topicDescription, {color: theme.colors.textSecondary}]}>{description}</Text>
              </View>
              <Text style={[styles.arrow, {color: theme.colors.textTertiary}]}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.tipContainer, {backgroundColor: isDark ? '#422006' : '#fef3c7', borderLeftColor: theme.colors.warning}]}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={[styles.tipText, {color: isDark ? '#fbbf24' : '#78350f'}]}>
            Tip: Start with topics you're comfortable with, then gradually try
            more challenging ones!
          </Text>
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
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
  topicsContainer: {
    padding: 20,
    gap: 12,
  },
  topicCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  topicIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  topicIcon: {
    fontSize: 24,
  },
  topicInfo: {
    flex: 1,
  },
  topicName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 13,
  },
  arrow: {
    fontSize: 20,
    marginLeft: 8,
  },
  tipContainer: {
    flexDirection: 'row',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default TopicSelectionScreen;
