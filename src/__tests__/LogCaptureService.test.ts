/**
 * LogCaptureService Tests
 */

import LogCaptureService from '../services/LogCaptureService';

describe('LogCaptureService', () => {
  let logCaptureService: LogCaptureService;
  let originalConsoleLog: typeof console.log;
  let originalConsoleError: typeof console.error;
  let originalConsoleWarn: typeof console.warn;

  beforeEach(() => {
    // Store original console methods
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    originalConsoleWarn = console.warn;

    // Create new instance
    logCaptureService = new LogCaptureService();
  });

  afterEach(() => {
    // Stop capture and restore original console methods
    logCaptureService.stopCapture();

    // Ensure console methods are restored
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  it('should capture AIVoiceService logs', () => {
    logCaptureService.startCapture();

    console.log('[AIVoiceService] Test log message');

    const logs = logCaptureService.getLogs();
    expect(logs).toContain('[AIVoiceService] Test log message');
  });

  it('should capture VoiceService logs', () => {
    logCaptureService.startCapture();

    console.log('[VoiceService] Test log message');

    const logs = logCaptureService.getLogs();
    expect(logs).toContain('[VoiceService] Test log message');
  });

  it('should not capture logs from other services', () => {
    logCaptureService.startCapture();

    console.log('[OtherService] Test log message');

    const logs = logCaptureService.getLogs();
    expect(logs).not.toContain('[OtherService] Test log message');
  });

  it('should capture error logs', () => {
    logCaptureService.startCapture();

    console.error('[AIVoiceService] Test error message');

    const logs = logCaptureService.getLogs();
    expect(logs).toContain('ERROR');
    expect(logs).toContain('[AIVoiceService] Test error message');
  });

  it('should capture warn logs', () => {
    logCaptureService.startCapture();

    console.warn('[VoiceService] Test warning message');

    const logs = logCaptureService.getLogs();
    expect(logs).toContain('WARN');
    expect(logs).toContain('[VoiceService] Test warning message');
  });

  it('should capture object logs as JSON', () => {
    logCaptureService.startCapture();

    console.log('[AIVoiceService] Test object', {status: 'success', code: 200});

    const logs = logCaptureService.getLogs();
    expect(logs).toContain('[AIVoiceService] Test object');
    expect(logs).toContain('"status"');
    expect(logs).toContain('"success"');
  });

  it('should return message when no logs captured', () => {
    logCaptureService.startCapture();

    const logs = logCaptureService.getLogs();
    expect(logs).toBe('No AI Voice Service logs captured yet.');
  });

  it('should clear logs', () => {
    logCaptureService.startCapture();

    console.log('[AIVoiceService] Test log message');
    expect(logCaptureService.getLogCount()).toBe(1);

    logCaptureService.clearLogs();
    expect(logCaptureService.getLogCount()).toBe(0);
  });

  it('should limit number of logs', () => {
    logCaptureService.startCapture();

    // Add more than maxLogs (500)
    for (let i = 0; i < 600; i++) {
      console.log(`[AIVoiceService] Test log message ${i}`);
    }

    expect(logCaptureService.getLogCount()).toBe(500);
  });

  it('should restore original console methods on stop', () => {
    logCaptureService.startCapture();
    
    // After starting capture, console.log should be overridden
    const capturedLog = console.log;
    expect(console.log).not.toBe(originalConsoleLog);

    logCaptureService.stopCapture();

    // After stop, the original console.log should be restored
    expect(console.log).toBe(originalConsoleLog);
    expect(console.log).not.toBe(capturedLog);
  });
});
