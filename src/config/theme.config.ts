/**
 * Theme Configuration
 */

export interface Colors {
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // UI colors
  border: string;
  card: string;
  shadow: string;
  
  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Component specific
  inputBackground: string;
  inputBorder: string;
  buttonPrimary: string;
  buttonPrimaryText: string;
  buttonSecondary: string;
  buttonSecondaryText: string;
  
  // Status bar
  statusBarStyle: 'light-content' | 'dark-content';
  statusBarBackground: string;
}

export interface Theme {
  colors: Colors;
  isDark: boolean;
}

// Light theme colors
const lightColors: Colors = {
  background: '#f9fafb',
  backgroundSecondary: '#ffffff',
  backgroundTertiary: '#f3f4f6',
  
  text: '#1f2937',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  
  primary: '#3b82f6',
  primaryLight: '#eff6ff',
  primaryDark: '#1e40af',
  
  border: '#e5e7eb',
  card: '#ffffff',
  shadow: '#000000',
  
  success: '#10b981',
  warning: '#f59e0b',
  error: '#dc2626',
  info: '#3b82f6',
  
  inputBackground: '#f9fafb',
  inputBorder: '#d1d5db',
  buttonPrimary: '#3b82f6',
  buttonPrimaryText: '#ffffff',
  buttonSecondary: '#ffffff',
  buttonSecondaryText: '#1f2937',
  
  statusBarStyle: 'dark-content',
  statusBarBackground: '#ffffff',
};

// Dark theme colors
const darkColors: Colors = {
  background: '#111827',
  backgroundSecondary: '#1f2937',
  backgroundTertiary: '#374151',
  
  text: '#f9fafb',
  textSecondary: '#d1d5db',
  textTertiary: '#9ca3af',
  
  primary: '#60a5fa',
  primaryLight: '#1e3a8a',
  primaryDark: '#93c5fd',
  
  border: '#374151',
  card: '#1f2937',
  shadow: '#000000',
  
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',
  
  inputBackground: '#374151',
  inputBorder: '#4b5563',
  buttonPrimary: '#3b82f6',
  buttonPrimaryText: '#ffffff',
  buttonSecondary: '#374151',
  buttonSecondaryText: '#f9fafb',
  
  statusBarStyle: 'light-content',
  statusBarBackground: '#1f2937',
};

export const lightTheme: Theme = {
  colors: lightColors,
  isDark: false,
};

export const darkTheme: Theme = {
  colors: darkColors,
  isDark: true,
};

export const STORAGE_KEY_THEME = '@theme_mode';
