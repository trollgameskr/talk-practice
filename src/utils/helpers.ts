/**
 * Helper utility functions
 */

import {Linking, Alert} from 'react-native';

/**
 * Open URL in browser
 */
export async function openURL(url: string): Promise<void> {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', `Cannot open URL: ${url}`);
    }
  } catch (error) {
    console.error('Error opening URL:', error);
    Alert.alert('Error', 'Failed to open URL');
  }
}

/**
 * Format duration in seconds to readable string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date): string {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return d.toLocaleDateString('en-US', options);
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get topic display name
 */
export function getTopicDisplayName(topic: string): string {
  const names: Record<string, string> = {
    daily: 'Daily Conversation',
    travel: 'Travel English',
    business: 'Business English',
    casual: 'Casual Chat',
    professional: 'Professional Communication',
  };
  return names[topic] || topic;
}

/**
 * Get topic icon
 */
export function getTopicIcon(topic: string): string {
  const icons: Record<string, string> = {
    daily: '🏠',
    travel: '✈️',
    business: '💼',
    casual: '😊',
    professional: '👔',
  };
  return icons[topic] || '💬';
}

/**
 * Calculate percentage improvement
 */
export function calculateImprovement(
  oldScore: number,
  newScore: number,
): number {
  if (oldScore === 0) {
    return newScore > 0 ? 100 : 0;
  }
  return Math.round(((newScore - oldScore) / oldScore) * 100);
}

/**
 * Get score color based on value
 */
export function getScoreColor(score: number): string {
  if (score >= 90) {
    return '#22c55e';
  } // green
  if (score >= 75) {
    return '#3b82f6';
  } // blue
  if (score >= 60) {
    return '#f59e0b';
  } // orange
  return '#ef4444'; // red
}

/**
 * Get score label
 */
export function getScoreLabel(score: number): string {
  if (score >= 90) {
    return 'Excellent';
  }
  if (score >= 75) {
    return 'Good';
  }
  if (score >= 60) {
    return 'Fair';
  }
  return 'Needs Improvement';
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) {
    return text;
  }
  return text.substring(0, length) + '...';
}

/**
 * Validate API key format
 */
export function isValidApiKey(apiKey: string): boolean {
  // Strict validation: accept Google-like API keys that start with 'AIza' and are
  // reasonably long. Reject empty and obviously invalid keys.
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  // Typical Google API keys start with 'AIza' and include an alphanumeric suffix.
  if (apiKey.startsWith('AIza') && apiKey.length > 20) {
    return true;
  }
  return false;
}

/**
 * Language name mapping for all supported languages
 */
export const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  ko: 'Korean',
  ja: 'Japanese',
  zh: 'Chinese',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
};
