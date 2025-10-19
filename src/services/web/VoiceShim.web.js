/**
 * Web Speech API Shim for @react-native-community/voice
 * Provides browser-based speech recognition
 */

let recognition = null;
let isListening = false;

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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      throw new Error('Speech recognition not supported in this browser');
    }

    if (isListening) {
      await Voice.stop();
    }

    recognition = new SpeechRecognition();
    recognition.lang = locale;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isListening = true;
      if (Voice.onSpeechStart) {
        Voice.onSpeechStart({ error: false });
      }
    };

    recognition.onresult = (event) => {
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

      if (results.length > 0 && Voice.onSpeechResults) {
        Voice.onSpeechResults({ value: results });
      }

      if (interim.length > 0 && Voice.onSpeechPartialResults) {
        Voice.onSpeechPartialResults({ value: interim });
      }
    };

    recognition.onerror = (event) => {
      isListening = false;
      if (Voice.onSpeechError) {
        Voice.onSpeechError({ error: { message: event.error } });
      }
    };

    recognition.onend = () => {
      isListening = false;
      if (Voice.onSpeechEnd) {
        Voice.onSpeechEnd({ error: false });
      }
    };

    recognition.start();
  },

  stop: async () => {
    if (recognition && isListening) {
      recognition.stop();
      isListening = false;
    }
  },

  cancel: async () => {
    if (recognition) {
      recognition.abort();
      isListening = false;
    }
  },

  destroy: async () => {
    if (recognition) {
      recognition.abort();
      recognition = null;
      isListening = false;
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
