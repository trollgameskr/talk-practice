/**
 * Theme Context - Provides theme state and toggle functionality
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Theme,
  lightTheme,
  darkTheme,
  STORAGE_KEY_THEME,
} from '../config/theme.config';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({children}) => {
  const [theme, setTheme] = useState<Theme>(darkTheme);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(STORAGE_KEY_THEME);
      if (savedTheme === 'light') {
        setTheme(lightTheme);
        setIsDark(false);
      } else {
        // Default to dark theme
        setTheme(darkTheme);
        setIsDark(true);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newIsDark = !isDark;
      const newTheme = newIsDark ? darkTheme : lightTheme;
      setTheme(newTheme);
      setIsDark(newIsDark);
      await AsyncStorage.setItem(
        STORAGE_KEY_THEME,
        newIsDark ? 'dark' : 'light',
      );
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{theme, isDark, toggleTheme}}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
