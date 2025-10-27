/**
 * Topic Selection Screen
 */

import React, {useEffect} from 'react';
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
import {ConversationTopic} from '../types';
import {getTopicDisplayName, getTopicIcon} from '../utils/helpers';
import {STORAGE_KEYS} from '../config/gemini.config';

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
  useEffect(() => {
    checkApiKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkApiKey = async () => {
    const apiKey = await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
    if (!apiKey) {
      Alert.alert(
        'API Key Required',
        'You need a Gemini API key to start practicing. You can get one for free from Google AI Studio.\n\nPlease go to Settings to configure your API key.',
        [
          {text: 'Cancel', onPress: () => navigation.goBack()},
          {
            text: 'Go to Settings',
            onPress: () => navigation.navigate('Settings'),
          },
        ],
      );
    }
  };

  const handleTopicSelect = async (topic: ConversationTopic) => {
    // Check API key again before navigation
    const apiKey = await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
    if (!apiKey) {
      Alert.alert(
        'API Key Required',
        'You need a Gemini API key to start practicing. You can get one for free from Google AI Studio.\n\nPlease go to Settings to configure your API key.',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Go to Settings',
            onPress: () => navigation.navigate('Settings'),
          },
        ],
      );
      return;
    }
    navigation.navigate('Conversation', {topic});
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Topic</Text>
          <Text style={styles.subtitle}>
            Select a conversation topic to practice
          </Text>
        </View>

        <View style={styles.topicsContainer}>
          {topics.map(({topic, description}) => (
            <TouchableOpacity
              key={topic}
              style={styles.topicCard}
              onPress={() => handleTopicSelect(topic)}>
              <View style={styles.topicIconContainer}>
                <Text style={styles.topicIcon}>{getTopicIcon(topic)}</Text>
              </View>
              <View style={styles.topicInfo}>
                <Text style={styles.topicName}>
                  {getTopicDisplayName(topic)}
                </Text>
                <Text style={styles.topicDescription}>{description}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tipContainer}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
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
