import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
} from 'react-native';
import {useTheme} from '../../contexts/ThemeContext';
import {useDeveloperMode} from '../../contexts/DeveloperModeContext';
import UIDebugId from '../../components/UIDebugId';

const AppearanceSettingsScreen = () => {
  const {theme, isDark, toggleTheme} = useTheme();
  const {isDeveloperMode, toggleDeveloperMode} = useDeveloperMode();

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <UIDebugId id={1} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}>
          <UIDebugId id={2} />
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            🎨 Appearance
          </Text>
          <View style={styles.themeRow}>
            <UIDebugId id={3} />
            <View style={styles.themeInfo}>
              <Text style={[styles.themeLabel, {color: theme.colors.text}]}>
                Dark Mode
              </Text>
              <Text
                style={[
                  styles.themeDescription,
                  {color: theme.colors.textSecondary},
                ]}>
                Switch between light and dark theme
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={
                isDark
                  ? theme.colors.buttonPrimaryText
                  : theme.colors.inputBackground
              }
            />
          </View>
          <View
            style={[styles.separator, {backgroundColor: theme.colors.border}]}
          />
          <View style={styles.themeRow}>
            <UIDebugId id={4} />
            <View style={styles.themeInfo}>
              <Text style={[styles.themeLabel, {color: theme.colors.text}]}>
                Developer Mode
              </Text>
              <Text
                style={[
                  styles.themeDescription,
                  {color: theme.colors.textSecondary},
                ]}>
                Show UI element IDs for debugging
              </Text>
            </View>
            <Switch
              value={isDeveloperMode}
              onValueChange={toggleDeveloperMode}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={
                isDeveloperMode
                  ? theme.colors.buttonPrimaryText
                  : theme.colors.inputBackground
              }
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  themeInfo: {
    flex: 1,
    marginRight: 16,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
  },
  separator: {
    height: 1,
    marginVertical: 12,
  },
});

export default AppearanceSettingsScreen;
