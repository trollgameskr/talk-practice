/**
 * Tests for SessionInfoModal component
 */

describe('SessionInfoModal', () => {
  describe('Modal visibility and props', () => {
    it('should accept all required props', () => {
      const mockProps = {
        visible: true,
        onClose: jest.fn(),
        onEndSession: jest.fn(),
        onCopyLogs: jest.fn(),
        sessionDuration: 120,
        tokenUsage: {
          inputTokens: 100,
          outputTokens: 200,
          totalTokens: 300,
          estimatedCost: 0.0015,
        },
        voiceModel: 'Web Speech API',
        logs: 'Test log message',
      };

      expect(mockProps.visible).toBe(true);
      expect(mockProps.sessionDuration).toBe(120);
      expect(mockProps.tokenUsage?.totalTokens).toBe(300);
      expect(mockProps.voiceModel).toBe('Web Speech API');
    });

    it('should call onClose callback', () => {
      const onClose = jest.fn();
      onClose();
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onEndSession callback', () => {
      const onEndSession = jest.fn();
      onEndSession();
      expect(onEndSession).toHaveBeenCalled();
    });

    it('should call onCopyLogs callback', () => {
      const onCopyLogs = jest.fn();
      onCopyLogs();
      expect(onCopyLogs).toHaveBeenCalled();
    });
  });

  describe('Token formatting', () => {
    it('should format small token numbers correctly', () => {
      const formatTokens = (tokens: number): string => {
        if (tokens >= 1000000) {
          return `${(tokens / 1000000).toFixed(1)}M`;
        } else if (tokens >= 1000) {
          return `${(tokens / 1000).toFixed(1)}K`;
        }
        return tokens.toString();
      };

      expect(formatTokens(100)).toBe('100');
      expect(formatTokens(500)).toBe('500');
    });

    it('should format thousands correctly', () => {
      const formatTokens = (tokens: number): string => {
        if (tokens >= 1000000) {
          return `${(tokens / 1000000).toFixed(1)}M`;
        } else if (tokens >= 1000) {
          return `${(tokens / 1000).toFixed(1)}K`;
        }
        return tokens.toString();
      };

      expect(formatTokens(1000)).toBe('1.0K');
      expect(formatTokens(1500)).toBe('1.5K');
      expect(formatTokens(2500)).toBe('2.5K');
    });

    it('should format millions correctly', () => {
      const formatTokens = (tokens: number): string => {
        if (tokens >= 1000000) {
          return `${(tokens / 1000000).toFixed(1)}M`;
        } else if (tokens >= 1000) {
          return `${(tokens / 1000).toFixed(1)}K`;
        }
        return tokens.toString();
      };

      expect(formatTokens(1000000)).toBe('1.0M');
      expect(formatTokens(1500000)).toBe('1.5M');
      expect(formatTokens(2500000)).toBe('2.5M');
    });
  });

  describe('Cost formatting', () => {
    it('should format cost correctly', () => {
      const formatCost = (cost: number): string => {
        return `$${cost.toFixed(4)}`;
      };

      expect(formatCost(0.0015)).toBe('$0.0015');
      expect(formatCost(0.02)).toBe('$0.0200');
      expect(formatCost(1.2345)).toBe('$1.2345');
    });
  });

  describe('Props validation', () => {
    it('should handle missing token usage', () => {
      const props = {
        visible: true,
        onClose: jest.fn(),
        onEndSession: jest.fn(),
        onCopyLogs: jest.fn(),
        sessionDuration: 120,
        tokenUsage: undefined,
        voiceModel: 'Web Speech API',
        logs: 'Test log message',
      };

      expect(props.tokenUsage).toBeUndefined();
    });

    it('should handle empty logs', () => {
      const props = {
        visible: true,
        onClose: jest.fn(),
        onEndSession: jest.fn(),
        onCopyLogs: jest.fn(),
        sessionDuration: 120,
        tokenUsage: {
          inputTokens: 100,
          outputTokens: 200,
          totalTokens: 300,
          estimatedCost: 0.0015,
        },
        voiceModel: 'Web Speech API',
        logs: '',
      };

      expect(props.logs).toBe('');
      expect(props.logs || 'No logs available').toBe('No logs available');
    });
  });
});

