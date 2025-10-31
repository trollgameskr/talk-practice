/**
 * Session Info Modal Component
 * Displays session information including logs, duration, token usage, and voice model
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {formatDuration} from '../utils/helpers';
import {TokenUsage} from '../types';

interface SessionInfoModalProps {
  visible: boolean;
  onClose: () => void;
  onEndSession: () => void;
  onCopyLogs: () => void;
  sessionDuration: number;
  tokenUsage?: TokenUsage;
  voiceModel: string;
  logs: string;
}

const SessionInfoModal: React.FC<SessionInfoModalProps> = ({
  visible,
  onClose,
  onEndSession,
  onCopyLogs,
  sessionDuration,
  tokenUsage,
  voiceModel,
  logs,
}) => {
  const handleEndSession = () => {
    // 모달 닫고 부모 컴포넌트의 세션 종료 핸들러 호출
    // 부모 컴포넌트(ConversationScreen)에서 확인 및 종료 안내를 처리함
    onClose();
    onEndSession();
  };

  const formatTokens = (tokens: number): string => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  };

  const formatCost = (cost: number): string => {
    return `$${cost.toFixed(4)}`;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>📊 Session Information</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {/* Session Duration */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⏱️ Session Duration</Text>
              <Text style={styles.sectionValue}>
                {formatDuration(sessionDuration)}
              </Text>
            </View>

            {/* Token Usage */}
            {tokenUsage && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💰 Token Usage</Text>
                <View style={styles.tokenInfo}>
                  <View style={styles.tokenRow}>
                    <Text style={styles.tokenLabel}>Input Tokens:</Text>
                    <Text style={styles.tokenValue}>
                      {formatTokens(tokenUsage.inputTokens)}
                    </Text>
                  </View>
                  <View style={styles.tokenRow}>
                    <Text style={styles.tokenLabel}>Output Tokens:</Text>
                    <Text style={styles.tokenValue}>
                      {formatTokens(tokenUsage.outputTokens)}
                    </Text>
                  </View>
                  <View style={styles.tokenRow}>
                    <Text style={styles.tokenLabel}>Total Tokens:</Text>
                    <Text style={styles.tokenValue}>
                      {formatTokens(tokenUsage.totalTokens)}
                    </Text>
                  </View>
                  <View style={styles.tokenRow}>
                    <Text style={styles.tokenLabel}>Estimated Cost:</Text>
                    <Text style={styles.tokenValue}>
                      {formatCost(tokenUsage.estimatedCost)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Voice Model */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎙️ Voice Model</Text>
              <Text style={styles.sectionValue}>{voiceModel}</Text>
            </View>

            {/* Logs */}
            <View style={styles.section}>
              <View style={styles.logsHeader}>
                <Text style={styles.sectionTitle}>📋 Logs</Text>
                <TouchableOpacity
                  onPress={onCopyLogs}
                  style={styles.copyLogsButton}>
                  <Text style={styles.copyLogsButtonText}>Copy Logs</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.logsContainer}>
                <Text style={styles.logsText}>
                  {logs || 'No logs available'}
                </Text>
              </ScrollView>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.endSessionButton}
              onPress={handleEndSession}>
              <Text style={styles.endSessionButtonText}>🚪 End Session</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  sectionValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  tokenInfo: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tokenLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#166534',
  },
  tokenValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803d',
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  copyLogsButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  copyLogsButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  logsContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 12,
    maxHeight: 200,
  },
  logsText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#d1d5db',
    lineHeight: 16,
  },
  actions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  endSessionButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  endSessionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SessionInfoModal;
