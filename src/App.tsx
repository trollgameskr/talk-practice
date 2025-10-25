/**
 * GeminiTalk - Main App Component
 */

import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {StatusBar, StyleSheet, ActivityIndicator, View} from 'react-native';

// Screens
import HomeScreen from './screens/HomeScreen';
import TopicSelectionScreen from './screens/TopicSelectionScreen';
import ConversationScreen from './screens/ConversationScreen';
import ProgressScreen from './screens/ProgressScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';

// Services
import FirebaseService from './services/FirebaseService';

// Components
import CostDisplay from './components/CostDisplay';

const firebaseService = new FirebaseService();

const Stack = createStackNavigator();

const HeaderRight = () => <CostDisplay compact />;

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = firebaseService.onAuthStateChange(user => {
      setIsAuthenticated(user !== null);
    });

    return () => unsubscribe();
  }, []);

  // Show loading indicator while checking auth state
  if (isAuthenticated === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

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
          {!isAuthenticated ? (
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
