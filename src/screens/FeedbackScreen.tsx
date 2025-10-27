/**
 * Feedback Screen - Send feature requests and suggestions to the operator
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../contexts/ThemeContext';
import {FEEDBACK_CONFIG} from '../config/feedback.config';

const FeedbackScreen = () => {
  const {theme} = useTheme();
  const {t} = useTranslation();

  const handleSendFeedback = async () => {
    // Feature 5: Open GitHub Issues instead of email
    const githubIssuesUrl =
      'https://github.com/trollgameskr/talk-practice/issues';

    try {
      const supported = await Linking.canOpenURL(githubIssuesUrl);

      if (supported) {
        await Linking.openURL(githubIssuesUrl);
      } else {
        Alert.alert(
          t('common.error'),
          'Cannot open GitHub Issues. Please visit: ' + githubIssuesUrl,
          [{text: t('common.ok')}],
        );
      }
    } catch (error) {
      console.error('Error opening GitHub Issues:', error);
      Alert.alert(
        t('common.error'),
        'Failed to open GitHub Issues. Please visit: ' + githubIssuesUrl,
        [{text: t('common.ok')}],
      );
    }
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
          <Text style={[styles.title, {color: theme.colors.text}]}>
            {t('feedback.title')}
          </Text>
          <Text
            style={[
              styles.description,
              {color: theme.colors.textSecondary},
            ]}>
            Share your feedback, feature requests, and bug reports on our
            GitHub Issues page.
          </Text>

          <View
            style={[
              styles.infoBox,
              {
                backgroundColor: theme.colors.primaryLight,
                borderLeftColor: theme.colors.primary,
              },
            ]}>
            <Text style={[styles.infoText, {color: theme.colors.primaryDark}]}>
              💡 Click the button below to open GitHub Issues where you can
              create a new issue or view existing ones.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              {backgroundColor: theme.colors.buttonPrimary},
            ]}
            onPress={handleSendFeedback}>
            <Text
              style={[
                styles.submitButtonText,
                {color: theme.colors.buttonPrimaryText},
              ]}>
              🐙 Open GitHub Issues
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            📋 {t('feedback.examples.title')}
          </Text>
          <View style={styles.exampleList}>
            <Text
              style={[
                styles.exampleItem,
                {color: theme.colors.textSecondary},
              ]}>
              • {t('feedback.examples.item1')}
            </Text>
            <Text
              style={[
                styles.exampleItem,
                {color: theme.colors.textSecondary},
              ]}>
              • {t('feedback.examples.item2')}
            </Text>
            <Text
              style={[
                styles.exampleItem,
                {color: theme.colors.textSecondary},
              ]}>
              • {t('feedback.examples.item3')}
            </Text>
            <Text
              style={[
                styles.exampleItem,
                {color: theme.colors.textSecondary},
              ]}>
              • {t('feedback.examples.item4')}
            </Text>
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  formContainer: {
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  optional: {
    fontWeight: '400',
    fontSize: 12,
  },
  required: {
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 120,
  },
  helpText: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  exampleList: {
    marginLeft: 8,
  },
  exampleItem: {
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 4,
  },
});

export default FeedbackScreen;
