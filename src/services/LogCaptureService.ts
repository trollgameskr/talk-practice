/**
 * Log Capture Service
 * Captures console logs for debugging purposes, specifically targeting
 * logs from AIVoiceService, VoiceService, DeviceTTSService, ConversationScreen, and GeminiService
 */

export class LogCaptureService {
  private logs: string[] = [];
  private maxLogs: number = 500;
  private originalConsoleLog: typeof console.log;
  private originalConsoleError: typeof console.error;
  private originalConsoleWarn: typeof console.warn;

  constructor() {
    this.originalConsoleLog = console.log;
    this.originalConsoleError = console.error;
    this.originalConsoleWarn = console.warn;
  }

  /**
   * Start capturing console logs
   */
  startCapture() {
    this.logs = [];

    // Override console.log
    console.log = (...args: any[]) => {
      this.captureLog('LOG', args);
      this.originalConsoleLog.apply(console, args);
    };

    // Override console.error
    console.error = (...args: any[]) => {
      this.captureLog('ERROR', args);
      this.originalConsoleError.apply(console, args);
    };

    // Override console.warn
    console.warn = (...args: any[]) => {
      this.captureLog('WARN', args);
      this.originalConsoleWarn.apply(console, args);
    };
  }

  /**
   * Capture a log entry
   */
  private captureLog(level: string, args: any[]) {
    try {
      const timestamp = new Date().toISOString();
      const message = args
        .map(arg => {
          if (typeof arg === 'string') {
            return arg;
          } else if (typeof arg === 'object') {
            return JSON.stringify(arg, null, 2);
          } else {
            return String(arg);
          }
        })
        .join(' ');

      // Check if this is a log we want to capture
      // Includes voice services, conversation screen, and Gemini service for full debugging
      if (
        message.includes('[AIVoiceService]') ||
        message.includes('[VoiceService]') ||
        message.includes('[DeviceTTSService]') ||
        message.includes('[ConversationScreen]') ||
        message.includes('[GeminiService]')
      ) {
        const logEntry = `[${timestamp}] ${level}: ${message}`;
        this.logs.push(logEntry);

        // Keep only the most recent logs
        if (this.logs.length > this.maxLogs) {
          this.logs.shift();
        }
      }
    } catch (error) {
      // Silently fail to avoid infinite loops
    }
  }

  /**
   * Stop capturing console logs and restore original functions
   */
  stopCapture() {
    console.log = this.originalConsoleLog;
    console.error = this.originalConsoleError;
    console.warn = this.originalConsoleWarn;
  }

  /**
   * Get captured logs as a string
   */
  getLogs(): string {
    if (this.logs.length === 0) {
      return 'No logs captured yet. Make sure conversation has been started.';
    }
    return this.logs.join('\n');
  }

  /**
   * Clear captured logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Get number of captured logs
   */
  getLogCount(): number {
    return this.logs.length;
  }
}

export default LogCaptureService;
