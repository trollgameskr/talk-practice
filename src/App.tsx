/**
 * GeminiTalk - Main App Component
 */

import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {StatusBar, StyleSheet, ActivityIndicator, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Context
import {ThemeProvider, useTheme} from './contexts/ThemeContext';

const firebaseService = new FirebaseService();

const Stack = createStackNavigator();

const HeaderRight = () => <CostDisplay compact />;

const AppContent = () => {
  const {theme} = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);
  const [isFirebaseConfigured] = useState<boolean>(
    firebaseService.isFirebaseConfigured(),
  );

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

  // Show loading indicator while checking auth state
  if (isAuthenticated === null) {
    return (
      <View style={[styles.loadingContainer, {backgroundColor: theme.colors.background}]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle={theme.colors.statusBarStyle} backgroundColor={theme.colors.statusBarBackground} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={isAuthenticated ? 'Home' : 'Login'}
          screenOptions={{
            headerStyle: {...styles.header, backgroundColor: theme.colors.backgroundSecondary},
            headerTintColor: theme.colors.text,
            headerTitleStyle: styles.headerTitle,
            headerRight: isAuthenticated ? HeaderRight : undefined,
          }}>
          {!isAuthenticated && isFirebaseConfigured ? (
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
                options={{title: 'GeminiTalk'}}
              />
              <Stack.Screen
                name="TopicSelection"
                component={TopicSelectionScreen}
                options={{title: 'Choose Topic'}}
              />
              <Stack.Screen
                name="Conversation"
                component={ConversationScreen}
                options={{title: 'Practice'}}
              />
              <Stack.Screen
                name="Progress"
                component={ProgressScreen}
                options={{title: 'Your Progress'}}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{title: 'Settings'}}
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
  },
  header: {
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

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
