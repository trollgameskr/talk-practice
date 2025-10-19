/**
 * Web Speech Synthesis API Shim for react-native-tts
 * Provides browser-based text-to-speech
 */

const Tts = {
  getInitStatus: async () => {
    return 'speechSynthesis' in window ? 'success' : 'error';
  },

  speak: (text, options = {}) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply options
      if (options.language) utterance.lang = options.language;
      if (options.rate) utterance.rate = options.rate;
      if (options.pitch) utterance.pitch = options.pitch;
      if (options.volume) utterance.volume = options.volume;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event);

      window.speechSynthesis.speak(utterance);
    });
  },

  stop: () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    return Promise.resolve();
  },

  pause: () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    return Promise.resolve();
  },

  resume: () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
    return Promise.resolve();
  },

  setDefaultLanguage: (language) => {
    // Store for future use
    Tts.defaultLanguage = language;
    return Promise.resolve();
  },

  setDefaultRate: (rate) => {
    Tts.defaultRate = rate;
    return Promise.resolve();
  },

  setDefaultPitch: (pitch) => {
    Tts.defaultPitch = pitch;
    return Promise.resolve();
  },

  voices: async () => {
    if (!('speechSynthesis' in window)) {
      return [];
    }

    return window.speechSynthesis.getVoices().map(voice => ({
      id: voice.voiceURI,
      name: voice.name,
      language: voice.lang,
    }));
  },

  addEventListener: () => {},
  removeEventListener: () => {},
};

// Defaults
Tts.defaultLanguage = 'en-US';
Tts.defaultRate = 1.0;
Tts.defaultPitch = 1.0;

export default Tts;
