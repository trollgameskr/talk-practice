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
import {useTranslation} from 'react-i18next';
import {ConversationTopic} from '../types';
import {getTopicIcon} from '../utils/helpers';

const TopicSelectionScreen = ({navigation}: any) => {
  const {t} = useTranslation();

  const topics = [
    {
      topic: ConversationTopic.DAILY,
      name: t('topicSelection.topics.daily.name'),
      description: t('topicSelection.topics.daily.description'),
    },
    {
      topic: ConversationTopic.TRAVEL,
      name: t('topicSelection.topics.travel.name'),
      description: t('topicSelection.topics.travel.description'),
    },
    {
      topic: ConversationTopic.BUSINESS,
      name: t('topicSelection.topics.business.name'),
      description: t('topicSelection.topics.business.description'),
    },
    {
      topic: ConversationTopic.CASUAL,
      name: t('topicSelection.topics.casual.name'),
      description: t('topicSelection.topics.casual.description'),
    },
    {
      topic: ConversationTopic.PROFESSIONAL,
      name: t('topicSelection.topics.professional.name'),
      description: t('topicSelection.topics.professional.description'),
    },
  ];

  const handleTopicSelect = (topic: ConversationTopic) => {
    navigation.navigate('Conversation', {topic});
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('topicSelection.title')}</Text>
          <Text style={styles.subtitle}>{t('topicSelection.subtitle')}</Text>
        </View>

        <View style={styles.topicsContainer}>
          {topics.map(({topic, name, description}) => (
            <TouchableOpacity
              key={topic}
              style={styles.topicCard}
              onPress={() => handleTopicSelect(topic)}>
              <View style={styles.topicIconContainer}>
                <Text style={styles.topicIcon}>{getTopicIcon(topic)}</Text>
              </View>
              <View style={styles.topicInfo}>
                <Text style={styles.topicName}>{name}</Text>
                <Text style={styles.topicDescription}>{description}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tipContainer}>
          <Text style={styles.tipIcon}>{t('topicSelection.tip.icon')}</Text>
          <Text style={styles.tipText}>{t('topicSelection.tip.text')}</Text>
        </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  topicsContainer: {
    padding: 20,
    gap: 12,
  },
  topicCard: {
    flexDirection: 'row',
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
  topicIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#eff6ff',
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
    color: '#1f2937',
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  arrow: {
    fontSize: 20,
    color: '#9ca3af',
    marginLeft: 8,
  },
  tipContainer: {
    flexDirection: 'row',
    margin: 20,
    padding: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
  },
});

export default TopicSelectionScreen;
