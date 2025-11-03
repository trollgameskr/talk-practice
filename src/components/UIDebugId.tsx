/**
 * UIDebugId Component - Displays unique ID for UI elements in developer mode
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useDeveloperMode} from '../contexts/DeveloperModeContext';
import {useTheme} from '../contexts/ThemeContext';

interface UIDebugIdProps {
  id: number;
}

const UIDebugId: React.FC<UIDebugIdProps> = ({id}) => {
  const {isDeveloperMode} = useDeveloperMode();
  const {theme} = useTheme();

  if (!isDeveloperMode) {
    return null;
  }

  return (
    <View
      style={[
        styles.debugContainer,
        {
          backgroundColor: theme.colors.error,
          borderColor: theme.colors.buttonPrimaryText,
        },
      ]}>
      <Text style={[styles.debugText, {color: theme.colors.buttonPrimaryText}]}>
        {id}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  debugContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    minWidth: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    zIndex: 9999,
  },
  debugText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});

export default UIDebugId;
