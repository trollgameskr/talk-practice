/**
 * Cost Display Component
 * Persistent UI element to show API usage costs
 */

import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import StorageService from '../services/StorageService';
import {useTheme} from '../contexts/ThemeContext';

const storageService = new StorageService();

interface CostDisplayProps {
  compact?: boolean;
  onPress?: () => void;
}

const CostDisplay: React.FC<CostDisplayProps> = ({
  compact = false,
  onPress,
}) => {
  const {isDark} = useTheme();
  const [totalCost, setTotalCost] = useState<number>(0);
  const [totalTokens, setTotalTokens] = useState<number>(0);

  useEffect(() => {
    loadCostData();

    // Refresh every 2 seconds for more real-time updates
    const interval = setInterval(loadCostData, 2000);

    return () => clearInterval(interval);
  }, []);

  const loadCostData = async () => {
    try {
      const progress = await storageService.getUserProgress();
      setTotalCost(progress.totalCost || 0);
      setTotalTokens(progress.totalTokens || 0);
    } catch (error) {
      console.error('Error loading cost data:', error);
    }
  };

  const formatCost = (cost: number): string => {
    return `$${cost.toFixed(4)}`;
  };

  const formatTokens = (tokens: number): string => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  };

  const content = compact ? (
    <View
      style={[
        styles.compactContainer,
        {
          backgroundColor: isDark ? '#065f46' : '#f0fdf4',
          borderColor: isDark ? '#10b981' : '#86efac',
        },
      ]}>
      <Text
        style={[styles.compactText, {color: isDark ? '#d1fae5' : '#166534'}]}>
        💰 {formatCost(totalCost)} ({formatTokens(totalTokens)} tokens)
      </Text>
    </View>
  ) : (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#065f46' : '#f0fdf4',
          borderColor: isDark ? '#10b981' : '#86efac',
        },
      ]}>
      <View style={styles.row}>
        <Text style={[styles.label, {color: isDark ? '#d1fae5' : '#166534'}]}>
          💰 Total Cost:
        </Text>
        <Text style={[styles.value, {color: isDark ? '#a7f3d0' : '#15803d'}]}>
          {formatCost(totalCost)}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, {color: isDark ? '#d1fae5' : '#166534'}]}>
          🔢 Tokens Used:
        </Text>
        <Text style={[styles.value, {color: isDark ? '#a7f3d0' : '#15803d'}]}>
          {formatTokens(totalTokens)}
        </Text>
      </View>
    </View>
  );

  // If onPress is provided, wrap content in TouchableOpacity
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  compactContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
  },
  compactText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default CostDisplay;
