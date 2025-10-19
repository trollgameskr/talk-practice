/**
 * Web Speech API Shim for @react-native-community/voice
 * Provides browser-based speech recognition
 */

/* eslint-env browser */

let recognition = null;
let isListening = false;
let lastFinalTranscript = '';
let lastInterimTranscript = '';

const Voice = {
  onSpeechStart: null,
  onSpeechEnd: null,
  onSpeechResults: null,
  onSpeechError: null,
  onSpeechPartialResults: null,

  isAvailable: async () => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  },

  start: async (locale = 'en-US') => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      throw new Error('Speech recognition not supported in this browser');
    }

    if (isListening) {
      await Voice.stop();
    }

    // Reset accumulated transcripts
    lastFinalTranscript = '';
    lastInterimTranscript = '';

    recognition = new SpeechRecognition();
    recognition.lang = locale;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isListening = true;
      if (Voice.onSpeechStart) {
        Voice.onSpeechStart({error: false});
      }
    };

    recognition.onresult = event => {
      const results = [];
      const interim = [];

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          results.push(transcript);
        } else {
          interim.push(transcript);
        }
      }

      // Store the accumulated transcripts
      if (results.length > 0) {
        lastFinalTranscript = results.join(' ');
        if (Voice.onSpeechResults) {
          Voice.onSpeechResults({value: results});
        }
      }

      if (interim.length > 0) {
        lastInterimTranscript = interim.join(' ');
        if (Voice.onSpeechPartialResults) {
          Voice.onSpeechPartialResults({value: interim});
        }
      }
    };

    recognition.onerror = event => {
      isListening = false;
      if (Voice.onSpeechError) {
        Voice.onSpeechError({error: {message: event.error}});
      }
    };

    recognition.onend = () => {
      isListening = false;

      // If we have accumulated transcripts but haven't sent final results yet,
      // send them now. This handles the case where speech ends before a final
      // result event is fired.
      if (
        !lastFinalTranscript &&
        lastInterimTranscript &&
        Voice.onSpeechResults
      ) {
        // Send the interim results as final results since recognition has ended
        Voice.onSpeechResults({value: [lastInterimTranscript]});
      }

      if (Voice.onSpeechEnd) {
        Voice.onSpeechEnd({error: false});
      }

      // Reset transcripts
      lastFinalTranscript = '';
      lastInterimTranscript = '';
    };

    recognition.start();
  },

  stop: async () => {
    if (recognition && isListening) {
      recognition.stop();
      isListening = false;
      // Note: onend handler will take care of sending final results
    }
  },

  cancel: async () => {
    if (recognition) {
      recognition.abort();
      isListening = false;
      // Reset transcripts on cancel
      lastFinalTranscript = '';
      lastInterimTranscript = '';
    }
  },

  destroy: async () => {
    if (recognition) {
      recognition.abort();
      recognition = null;
      isListening = false;
      lastFinalTranscript = '';
      lastInterimTranscript = '';
    }
  },

  removeAllListeners: () => {
    Voice.onSpeechStart = null;
    Voice.onSpeechEnd = null;
    Voice.onSpeechResults = null;
    Voice.onSpeechError = null;
    Voice.onSpeechPartialResults = null;
  },
};

export default Voice;
