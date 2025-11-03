/**
 * Developer Mode Context - Provides developer mode state for UI debugging
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DeveloperModeContextType {
  isDeveloperMode: boolean;
  toggleDeveloperMode: () => void;
}

const DeveloperModeContext = createContext<
  DeveloperModeContextType | undefined
>(undefined);

const STORAGE_KEY_DEVELOPER_MODE = '@developer_mode';

interface DeveloperModeProviderProps {
  children: ReactNode;
}

export const DeveloperModeProvider: React.FC<DeveloperModeProviderProps> = ({
  children,
}) => {
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);

  useEffect(() => {
    loadDeveloperMode();
  }, []);

  const loadDeveloperMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem(STORAGE_KEY_DEVELOPER_MODE);
      setIsDeveloperMode(savedMode === 'true');
    } catch (error) {
      console.error('Error loading developer mode:', error);
    }
  };

  const toggleDeveloperMode = async () => {
    try {
      const newMode = !isDeveloperMode;
      setIsDeveloperMode(newMode);
      await AsyncStorage.setItem(
        STORAGE_KEY_DEVELOPER_MODE,
        newMode ? 'true' : 'false',
      );
    } catch (error) {
      console.error('Error toggling developer mode:', error);
    }
  };

  return (
    <DeveloperModeContext.Provider
      value={{isDeveloperMode, toggleDeveloperMode}}>
      {children}
    </DeveloperModeContext.Provider>
  );
};

export const useDeveloperMode = (): DeveloperModeContextType => {
  const context = useContext(DeveloperModeContext);
  if (!context) {
    throw new Error(
      'useDeveloperMode must be used within a DeveloperModeProvider',
    );
  }
  return context;
};
