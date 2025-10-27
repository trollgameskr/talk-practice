/**
 * GeminiTalk - Main App Component
 */

import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {StatusBar, StyleSheet, ActivityIndicator, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';

// Screens
import HomeScreen from './screens/HomeScreen';
import TopicSelectionScreen from './screens/TopicSelectionScreen';
import ConversationScreen from './screens/ConversationScreen';
import ProgressScreen from './screens/ProgressScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen, {GUEST_MODE_KEY} from './screens/LoginScreen';

// Services
import FirebaseService from './services/FirebaseService';

// Components
import CostDisplay from './components/CostDisplay';

// i18n
import {initI18n} from './config/i18n.config';

const firebaseService = new FirebaseService();

const Stack = createStackNavigator();

const HeaderRight = () => <CostDisplay compact />;

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);
  const [isFirebaseConfigured] = useState<boolean>(
    firebaseService.isFirebaseConfigured(),
  );
  const [i18nInitialized, setI18nInitialized] = useState(false);

  // Initialize i18n
  useEffect(() => {
    const init = async () => {
      await initI18n();
      setI18nInitialized(true);
    };
    init();
  }, []);

  useEffect(() => {
    const checkAuthState = async () => {
      // Check if user is in guest mode
      const guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
      if (guestMode === 'true') {
        setIsGuestMode(true);
        setIsAuthenticated(true);
        return;
      }

      // If Firebase is not configured, skip authentication
      if (!isFirebaseConfigured) {
        setIsAuthenticated(true);
        return;
      }

      // Set up auth state listener when Firebase is configured
      const unsubscribe = firebaseService.onAuthStateChange(user => {
        setIsAuthenticated(user !== null);
      });

      return unsubscribe;
    };

    const unsubscribe = checkAuthState();
    return () => {
      if (unsubscribe && typeof unsubscribe.then === 'function') {
        unsubscribe.then(unsub => unsub && unsub());
      }
    };
  }, [isFirebaseConfigured]);

  // Listen for guest mode changes
  useEffect(() => {
    const interval = setInterval(async () => {
      const guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
      if (guestMode === 'true' && !isGuestMode) {
        setIsGuestMode(true);
        setIsAuthenticated(true);
      } else if (guestMode !== 'true' && isGuestMode) {
        setIsGuestMode(false);
        // Will be handled by auth state listener
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isGuestMode]);

  // Show loading indicator while checking auth state or initializing i18n
  if (isAuthenticated === null || !i18nInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return <AppContent isAuthenticated={isAuthenticated} />;
};

const AppContent = ({isAuthenticated}: {isAuthenticated: boolean}) => {
  const {t} = useTranslation();

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={isAuthenticated ? 'Home' : 'Login'}
          screenOptions={{
            headerStyle: styles.header,
            headerTintColor: '#1f2937',
            headerTitleStyle: styles.headerTitle,
            headerRight: isAuthenticated ? HeaderRight : undefined,
          }}>
          {!isAuthenticated && firebaseService.isFirebaseConfigured() ? (
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{headerShown: false}}
            />
          ) : (
            <>
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{title: t('app.name')}}
              />
              <Stack.Screen
                name="TopicSelection"
                component={TopicSelectionScreen}
                options={{title: t('navigation.topicSelection')}}
              />
              <Stack.Screen
                name="Conversation"
                component={ConversationScreen}
                options={{title: t('navigation.conversation')}}
              />
              <Stack.Screen
                name="Progress"
                component={ProgressScreen}
                options={{title: t('navigation.progress')}}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{title: t('navigation.settings')}}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontWeight: '600',
    fontSize: 18,
  },
});

export default App;
