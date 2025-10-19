/**
 * Test for VoiceShim.web.js - specifically testing the fix for AI not responding after user speaks
 */

describe('VoiceShim', () => {
  let Voice: any;
  let mockRecognition: any;
  let mockSpeechRecognitionClass: any;

  beforeEach(() => {
    // Mock the Web Speech API
    mockRecognition = {
      lang: '',
      continuous: false,
      interimResults: false,
      maxAlternatives: 1,
      onstart: null,
      onend: null,
      onresult: null,
      onerror: null,
      start: jest.fn(),
      stop: jest.fn(),
      abort: jest.fn(),
    };

    mockSpeechRecognitionClass = jest.fn(() => mockRecognition);

    (global as any).window = {
      SpeechRecognition: mockSpeechRecognitionClass,
    };

    // Clear the module cache and re-import
    jest.resetModules();
    Voice = require('../services/web/VoiceShim.web.js').default;
  });

  afterEach(() => {
    delete (global as any).window;
  });

  it('should send interim results as final when speech ends without final results', async () => {
    const onResultCallback = jest.fn();
    const onEndCallback = jest.fn();

    Voice.onSpeechResults = onResultCallback;
    Voice.onSpeechEnd = onEndCallback;

    // Start recognition
    await Voice.start('en-US');

    expect(mockRecognition.start).toHaveBeenCalled();

    // Simulate speech start
    if (mockRecognition.onstart) {
      mockRecognition.onstart();
    }

    // Simulate interim results (user speaking)
    if (mockRecognition.onresult) {
      mockRecognition.onresult({
        results: [
          {
            0: {transcript: 'Hello world'},
            isFinal: false,
          },
        ],
        length: 1,
      });
    }

    // At this point, onSpeechResults should not have been called yet
    // because the results are only interim
    expect(onResultCallback).not.toHaveBeenCalled();

    // Simulate speech end WITHOUT a final result event
    // This is the bug scenario - the Web Speech API sometimes ends
    // without sending a final result
    if (mockRecognition.onend) {
      mockRecognition.onend();
    }

    // AFTER THE FIX: The interim results should be sent as final results
    // when speech ends
    expect(onResultCallback).toHaveBeenCalledWith({
      value: ['Hello world'],
    });
    expect(onEndCallback).toHaveBeenCalled();
  });

  it('should NOT send interim results if final results were already sent', async () => {
    const onResultCallback = jest.fn();
    const onEndCallback = jest.fn();

    Voice.onSpeechResults = onResultCallback;
    Voice.onSpeechEnd = onEndCallback;

    await Voice.start('en-US');

    // Simulate interim results
    if (mockRecognition.onresult) {
      mockRecognition.onresult({
        results: [
          {
            0: {transcript: 'Hello'},
            isFinal: false,
          },
        ],
        length: 1,
      });
    }

    // Clear the mock to track new calls
    onResultCallback.mockClear();

    // Simulate final results being sent
    if (mockRecognition.onresult) {
      mockRecognition.onresult({
        results: [
          {
            0: {transcript: 'Hello world'},
            isFinal: true,
          },
        ],
        length: 1,
      });
    }

    // Final results should have been sent
    expect(onResultCallback).toHaveBeenCalledWith({
      value: ['Hello world'],
    });

    // Clear the mock again
    onResultCallback.mockClear();

    // Simulate speech end
    if (mockRecognition.onend) {
      mockRecognition.onend();
    }

    // Should NOT send interim results again since final results were already sent
    expect(onResultCallback).not.toHaveBeenCalled();
    expect(onEndCallback).toHaveBeenCalled();
  });

  it('should handle speech end with no results gracefully', async () => {
    const onResultCallback = jest.fn();
    const onEndCallback = jest.fn();

    Voice.onSpeechResults = onResultCallback;
    Voice.onSpeechEnd = onEndCallback;

    await Voice.start('en-US');

    // Simulate speech end without any results
    if (mockRecognition.onend) {
      mockRecognition.onend();
    }

    // Should not try to send empty results
    expect(onResultCallback).not.toHaveBeenCalled();
    expect(onEndCallback).toHaveBeenCalled();
  });
});
