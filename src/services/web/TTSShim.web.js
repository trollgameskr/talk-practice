/**
 * Web AI Voice Synthesis Shim for react-native-tts
 * Provides AI-generated voice using best available method
 * This is a compatibility shim that is no longer actively used
 * (AIVoiceService is used directly instead)
 */

/* eslint-env browser */

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

const Tts = {
  listeners: {},
  
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
        if (Tts.listeners['tts-start']) {
          Tts.listeners['tts-start'].forEach(callback => callback());
        }
      };

      utterance.onend = () => {
        // Call event listeners
        if (Tts.listeners['tts-finish']) {
          Tts.listeners['tts-finish'].forEach(callback => callback());
        }
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
      if (Tts.listeners['tts-cancel']) {
        Tts.listeners['tts-cancel'].forEach(callback => callback());
      }
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
    if (!Tts.listeners[event]) {
      Tts.listeners[event] = [];
    }
    Tts.listeners[event].push(callback);
  },
  
  removeEventListener: (event, callback) => {
    if (Tts.listeners[event]) {
      Tts.listeners[event] = Tts.listeners[event].filter(cb => cb !== callback);
    }
  },
  
  removeAllListeners: (event) => {
    if (event) {
      Tts.listeners[event] = [];
    } else {
      Tts.listeners = {};
    }
  },
};

// Defaults optimized for natural AI-like speech
Tts.defaultLanguage = 'en-US';
Tts.defaultRate = 0.95; // Slightly slower for clarity
Tts.defaultPitch = 1.0;

export default Tts;
