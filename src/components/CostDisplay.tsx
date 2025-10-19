/**
 * Cost Display Component
 * Persistent UI element to show API usage costs
 */

import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import StorageService from '../services/StorageService';

const storageService = new StorageService();

interface CostDisplayProps {
  compact?: boolean;
}

const CostDisplay: React.FC<CostDisplayProps> = ({compact = false}) => {
  const [totalCost, setTotalCost] = useState<number>(0);
  const [totalTokens, setTotalTokens] = useState<number>(0);

  useEffect(() => {
    loadCostData();
    
    // Refresh every 5 seconds
    const interval = setInterval(loadCostData, 5000);
    
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

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactText}>
          💰 {formatCost(totalCost)} ({formatTokens(totalTokens)} tokens)
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>💰 Total Cost:</Text>
        <Text style={styles.value}>{formatCost(totalCost)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>🔢 Tokens Used:</Text>
        <Text style={styles.value}>{formatTokens(totalTokens)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  compactContainer: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '500',
  },
  value: {
    fontSize: 12,
    color: '#15803d',
    fontWeight: '600',
  },
  compactText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
  },
});

export default CostDisplay;
