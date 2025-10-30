/**
 * Web AI Voice Synthesis Shim for react-native-tts
 * Provides AI-generated voice using best available method
 * This is a compatibility shim that is no longer actively used
 * (AIVoiceService is used directly instead)
 */

/* eslint-env browser */

// Helper function to trigger event listeners
const triggerListeners = (listeners, event) => {
  if (listeners[event]) {
    listeners[event].forEach(callback => callback());
  }
};

/**
 * Select the best AI voice from available voices
 */
const selectBestVoice = () => {
  if (!('speechSynthesis' in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    return null;
  }

  // Priority order for AI/Neural voices
  const voicePriorities = [
    v => v.name.includes('Google') && v.name.includes('US'),
    v => v.name.includes('Google') && v.lang === 'en-US',
    v => v.name.includes('Microsoft') && v.name.includes('Neural'),
    v => v.name.includes('Premium') && v.lang === 'en-US',
    v => v.name.includes('Enhanced') && v.lang === 'en-US',
    v => v.lang === 'en-US' && v.localService,
    v => v.lang === 'en-US',
    v => v.lang.startsWith('en'),
  ];

  for (const priorityCheck of voicePriorities) {
    const voice = voices.find(priorityCheck);
    if (voice) {
      console.log('Selected AI voice:', voice.name);
      return voice;
    }
  }

  return voices[0];
};

// Initialize Tts object with proper structure
const Tts = {
  listeners: new Map(),
  defaultLanguage: 'en-US',
  defaultRate: 0.95, // Slightly slower for clarity
  defaultPitch: 1.0,
  
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

      // Select the best AI voice available
      const bestVoice = selectBestVoice();
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      // Apply options with better defaults for AI-like speech
      utterance.lang = options.language || Tts.defaultLanguage || 'en-US';
      utterance.rate =
        options.rate !== undefined ? options.rate : Tts.defaultRate || 0.95;
      utterance.pitch =
        options.pitch !== undefined ? options.pitch : Tts.defaultPitch || 1.0;
      utterance.volume = options.volume !== undefined ? options.volume : 1.0;

      utterance.onstart = () => {
        // Call event listeners
        triggerListeners(Tts.listeners, 'tts-start');
      };

      utterance.onend = () => {
        // Call event listeners
        triggerListeners(Tts.listeners, 'tts-finish');
        resolve();
      };
      
      utterance.onerror = event => {
        reject(event);
      };

      window.speechSynthesis.speak(utterance);
    });
  },

  stop: () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Call cancel event listeners
      triggerListeners(Tts.listeners, 'tts-cancel');
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

  setDefaultLanguage: language => {
    Tts.defaultLanguage = language;
    return Promise.resolve();
  },

  setDefaultRate: rate => {
    Tts.defaultRate = rate;
    return Promise.resolve();
  },

  setDefaultPitch: pitch => {
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

  addEventListener: (event, callback) => {
    if (!Tts.listeners.has(event)) {
      Tts.listeners.set(event, []);
    }
    Tts.listeners.get(event).push(callback);
  },
  
  removeEventListener: (event, callback) => {
    if (Tts.listeners.has(event)) {
      const callbacks = Tts.listeners.get(event).filter(cb => cb !== callback);
      Tts.listeners.set(event, callbacks);
    }
  },
  
  removeAllListeners: (event) => {
    if (event) {
      Tts.listeners.set(event, []);
    } else {
      Tts.listeners.clear();
    }
  },
};

export default Tts;
