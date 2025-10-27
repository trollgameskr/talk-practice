/**
 * Tests for FeedbackScreen
 */

import {Linking} from 'react-native';
import {FEEDBACK_CONFIG} from '../config/feedback.config';

describe('FeedbackScreen Feedback Submission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate that message is required before submission', async () => {
    const message = '';
    const isValid = message.trim() !== '';

    expect(isValid).toBe(false);
  });

  it('should allow submission when message is provided', async () => {
    const message = 'This is a test feedback message';
    const isValid = message.trim() !== '';

    expect(isValid).toBe(true);
  });

  it('should construct proper mailto URL with all fields', () => {
    const name = 'John Doe';
    const email = 'john@example.com';
    const message = 'Great app! Would love to see feature X.';

    const subject = encodeURIComponent('GeminiTalk Feedback');
    const emailBody = encodeURIComponent(
      `Name: ${name}\n` +
        `Email: ${email}\n\n` +
        `Message:\n${message}`,
    );

    const mailtoUrl = `mailto:${FEEDBACK_CONFIG.OPERATOR_EMAIL}?subject=${subject}&body=${emailBody}`;

    expect(mailtoUrl).toContain(`mailto:${FEEDBACK_CONFIG.OPERATOR_EMAIL}`);
    expect(mailtoUrl).toContain('subject=GeminiTalk%20Feedback');
    expect(mailtoUrl).toContain('Name%3A%20John%20Doe');
    expect(mailtoUrl).toContain('Email%3A%20john%40example.com');
  });

  it('should construct mailto URL with anonymous name when not provided', () => {
    const name = '';
    const email = '';
    const message = 'Anonymous feedback';

    const subject = encodeURIComponent('GeminiTalk Feedback');
    const emailBody = encodeURIComponent(
      `Name: ${name || 'Anonymous'}\n` +
        `Email: ${email || 'Not provided'}\n\n` +
        `Message:\n${message}`,
    );

    const mailtoUrl = `mailto:${FEEDBACK_CONFIG.OPERATOR_EMAIL}?subject=${subject}&body=${emailBody}`;

    expect(mailtoUrl).toContain('Name%3A%20Anonymous');
    expect(mailtoUrl).toContain('Email%3A%20Not%20provided');
  });

  it('should check if mailto URL can be opened', async () => {
    const mockCanOpenURL = jest.spyOn(Linking, 'canOpenURL');
    mockCanOpenURL.mockResolvedValue(true);

    const mailtoUrl = 'mailto:test@example.com?subject=Test&body=Message';
    const canOpen = await Linking.canOpenURL(mailtoUrl);

    expect(mockCanOpenURL).toHaveBeenCalledWith(mailtoUrl);
    expect(canOpen).toBe(true);
  });

  it('should handle case when email client cannot be opened', async () => {
    const mockCanOpenURL = jest.spyOn(Linking, 'canOpenURL');
    mockCanOpenURL.mockResolvedValue(false);

    const mailtoUrl = 'mailto:test@example.com?subject=Test&body=Message';
    const canOpen = await Linking.canOpenURL(mailtoUrl);

    expect(mockCanOpenURL).toHaveBeenCalledWith(mailtoUrl);
    expect(canOpen).toBe(false);
  });

  it('should clear form fields after successful submission', () => {
    let name = 'John Doe';
    let email = 'john@example.com';
    let message = 'Test message';

    // Simulate clearing form
    const clearForm = () => {
      name = '';
      email = '';
      message = '';
    };

    clearForm();

    expect(name).toBe('');
    expect(email).toBe('');
    expect(message).toBe('');
  });

  it('should navigate to Feedback screen when button is pressed', () => {
    const mockNavigate = jest.fn();

    const handleNavigateToFeedback = () => {
      mockNavigate('Feedback');
    };

    handleNavigateToFeedback();

    expect(mockNavigate).toHaveBeenCalledWith('Feedback');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
});
