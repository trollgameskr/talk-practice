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

const FeedbackScreen = () => {
  const {theme} = useTheme();
  const {t} = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendFeedback = async () => {
    // Validate message
    if (!message.trim()) {
      Alert.alert(t('common.error'), t('feedback.validation.messageRequired'));
      return;
    }

    setIsSending(true);

    try {
      // Prepare email content
      const subject = encodeURIComponent(
        t('feedback.emailSubject', {appName: 'GeminiTalk'}),
      );
      const emailBody = encodeURIComponent(
        `${t('feedback.emailBody.name')}: ${name || t('feedback.emailBody.anonymous')}\n` +
          `${t('feedback.emailBody.email')}: ${email || t('feedback.emailBody.notProvided')}\n\n` +
          `${t('feedback.emailBody.message')}:\n${message}`,
      );

      // Open email client with pre-filled content
      // Note: Update this email address to the actual operator's email
      const mailtoUrl = `mailto:trollgameskr@gmail.com?subject=${subject}&body=${emailBody}`;

      const supported = await Linking.canOpenURL(mailtoUrl);

      if (supported) {
        await Linking.openURL(mailtoUrl);
        // Clear form after sending
        setName('');
        setEmail('');
        setMessage('');
        Alert.alert(
          t('common.success'),
          t('feedback.sendSuccess'),
          [{text: t('common.ok')}],
        );
      } else {
        Alert.alert(
          t('common.error'),
          t('feedback.errors.cannotOpenEmail'),
          [{text: t('common.ok')}],
        );
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
      Alert.alert(
        t('common.error'),
        t('feedback.errors.sendFailed'),
        [{text: t('common.ok')}],
      );
    } finally {
      setIsSending(false);
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
            {t('feedback.description')}
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
              💡 {t('feedback.tip')}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, {color: theme.colors.text}]}>
                {t('feedback.fields.name.label')}
                <Text
                  style={[styles.optional, {color: theme.colors.textTertiary}]}>
                  {' '}
                  ({t('feedback.fields.optional')})
                </Text>
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
                value={name}
                onChangeText={setName}
                placeholder={t('feedback.fields.name.placeholder')}
                placeholderTextColor={theme.colors.textTertiary}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, {color: theme.colors.text}]}>
                {t('feedback.fields.email.label')}
                <Text
                  style={[styles.optional, {color: theme.colors.textTertiary}]}>
                  {' '}
                  ({t('feedback.fields.optional')})
                </Text>
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
                value={email}
                onChangeText={setEmail}
                placeholder={t('feedback.fields.email.placeholder')}
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text
                style={[
                  styles.helpText,
                  {color: theme.colors.textTertiary},
                ]}>
                {t('feedback.fields.email.help')}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, {color: theme.colors.text}]}>
                {t('feedback.fields.message.label')}
                <Text style={[styles.required, {color: theme.colors.error}]}>
                  {' '}
                  *
                </Text>
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.inputBorder,
                    color: theme.colors.text,
                  },
                ]}
                value={message}
                onChangeText={setMessage}
                placeholder={t('feedback.fields.message.placeholder')}
                placeholderTextColor={theme.colors.textTertiary}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              <Text
                style={[
                  styles.helpText,
                  {color: theme.colors.textTertiary},
                ]}>
                {t('feedback.fields.message.help')}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                {backgroundColor: theme.colors.buttonPrimary},
                isSending && styles.submitButtonDisabled,
              ]}
              onPress={handleSendFeedback}
              disabled={isSending}>
              <Text
                style={[
                  styles.submitButtonText,
                  {color: theme.colors.buttonPrimaryText},
                ]}>
                {isSending
                  ? t('feedback.sending')
                  : t('feedback.submitButton')}
              </Text>
            </TouchableOpacity>
          </View>
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
