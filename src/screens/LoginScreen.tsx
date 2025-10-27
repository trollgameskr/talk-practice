/**
 * Login Screen
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FirebaseService from '../services/FirebaseService';
import {useTheme} from '../contexts/ThemeContext';

export const GUEST_MODE_KEY = '@guest_mode';

const firebaseService = new FirebaseService();

const LoginScreen = ({navigation: _navigation}: any) => {
  const {theme} = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await firebaseService.login(email, password);
        Alert.alert('Success', 'Logged in successfully!');
      } else {
        await firebaseService.register(email, password);
        Alert.alert('Success', 'Account created successfully!');
      }
      // Navigation will be handled by auth state listener in App.tsx
    } catch (error: any) {
      let errorMessage = 'An error occurred';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Authentication Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
  };

  const handleGuestMode = async () => {
    try {
      await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
      // Navigation will be handled by auth state listener in App.tsx
    } catch (error) {
      Alert.alert('Error', 'Failed to enter guest mode');
    }
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <View style={styles.content}>
          <Text style={[styles.title, {color: theme.colors.text}]}>GeminiTalk</Text>
          <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
            {isLogin ? 'Sign in to continue' : 'Create your account'}
          </Text>

          <View style={styles.formContainer}>
            <TextInput
              style={[styles.input, {backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder, color: theme.colors.text}]}
              placeholder="Email"
              placeholderTextColor={theme.colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
            />

            <TextInput
              style={[styles.input, {backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder, color: theme.colors.text}]}
              placeholder="Password"
              placeholderTextColor={theme.colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[styles.button, {backgroundColor: theme.colors.buttonPrimary}, isLoading && styles.buttonDisabled]}
              onPress={handleAuth}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={theme.colors.buttonPrimaryText} />
              ) : (
                <Text style={[styles.buttonText, {color: theme.colors.buttonPrimaryText}]}>
                  {isLogin ? 'Sign In' : 'Sign Up'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleButton}
              onPress={toggleMode}
              disabled={isLoading}>
              <Text style={[styles.toggleButtonText, {color: theme.colors.primary}]}>
                {isLogin
                  ? "Don't have an account? Sign Up"
                  : 'Already have an account? Sign In'}
              </Text>
            </TouchableOpacity>

            <View style={styles.guestDivider}>
              <View style={[styles.dividerLine, {backgroundColor: theme.colors.border}]} />
              <Text style={[styles.dividerText, {color: theme.colors.textSecondary}]}>OR</Text>
              <View style={[styles.dividerLine, {backgroundColor: theme.colors.border}]} />
            </View>

            <TouchableOpacity
              style={[styles.guestButton, {backgroundColor: theme.colors.buttonSecondary, borderColor: theme.colors.border}]}
              onPress={handleGuestMode}
              disabled={isLoading}>
              <Text style={[styles.guestButtonText, {color: theme.colors.buttonSecondaryText}]}>👤 Continue as Guest</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.infoContainer, {backgroundColor: theme.colors.primaryLight, borderLeftColor: theme.colors.primary}]}>
            <Text style={[styles.infoTitle, {color: theme.colors.text}]}>✨ Guest Mode</Text>
            <Text style={[styles.infoText, {color: theme.colors.textSecondary}]}>
              • Try the app without creating an account
            </Text>
            <Text style={[styles.infoText, {color: theme.colors.textSecondary}]}>
              • Data saved locally on this device only
            </Text>
            <Text style={[styles.infoText, {color: theme.colors.textSecondary}]}>
              • Create an account later to sync across devices
            </Text>
          </View>

          <View style={[styles.infoContainer, {backgroundColor: theme.colors.primaryLight, borderLeftColor: theme.colors.primary}]}>
            <Text style={[styles.infoTitle, {color: theme.colors.text}]}>🔑 Account Benefits</Text>
            <Text style={[styles.infoText, {color: theme.colors.textSecondary}]}>
              🔒 Your data is securely stored in Firebase
            </Text>
            <Text style={[styles.infoText, {color: theme.colors.textSecondary}]}>
              📊 Track your conversation history and progress
            </Text>
            <Text style={[styles.infoText, {color: theme.colors.textSecondary}]}>
              💰 Monitor your token usage and costs
            </Text>
            <Text style={[styles.infoText, {color: theme.colors.textSecondary}]}>
              🔄 Sync data across multiple devices
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  toggleButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  guestDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  guestButton: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  guestButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default LoginScreen;
