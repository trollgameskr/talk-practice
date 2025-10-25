/**
 * GeminiTalk - Main App Component
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {StatusBar, StyleSheet} from 'react-native';

// Screens
import HomeScreen from './screens/HomeScreen';
import TopicSelectionScreen from './screens/TopicSelectionScreen';
import ConversationScreen from './screens/ConversationScreen';
import ProgressScreen from './screens/ProgressScreen';
import SettingsScreen from './screens/SettingsScreen';

// Components
import CostDisplay from './components/CostDisplay';

const Stack = createStackNavigator();

const HeaderRight = () => <CostDisplay compact />;

const App = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: styles.header,
            headerTintColor: '#1f2937',
            headerTitleStyle: styles.headerTitle,
            headerRight: HeaderRight,
          }}>
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
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

const styles = StyleSheet.create({
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
