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
 * Select the best AI voice from available voices for a given language
 * @param {string} language - The language code (e.g., 'en-US', 'ja-JP', 'ko-KR')
 */
const selectBestVoice = language => {
  if (!('speechSynthesis' in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    return null;
  }

  // Extract base language code (e.g., 'ja' from 'ja-JP')
  const baseLang = language ? language.split('-')[0] : 'en';
  const fullLang = language || 'en-US';

  console.log('[TTSShim] Selecting voice for language:', fullLang);

  // Priority order for selecting the best voice
  // 1. Google voice for the exact language
  // 2. Microsoft Neural voice for the exact language
  // 3. Premium/Enhanced voice for the exact language
  // 4. Any voice matching the exact language code
  // 5. Any voice matching the base language code
  // 6. Fallback to first available voice
  const voicePriorities = [
    v => v.name.includes('Google') && v.lang === fullLang,
    v => v.name.includes('Google') && v.lang.startsWith(baseLang),
    v =>
      v.name.includes('Microsoft') &&
      v.name.includes('Neural') &&
      v.lang === fullLang,
    v =>
      v.name.includes('Microsoft') &&
      v.name.includes('Neural') &&
      v.lang.startsWith(baseLang),
    v =>
      (v.name.includes('Premium') || v.name.includes('Enhanced')) &&
      v.lang === fullLang,
    v =>
      (v.name.includes('Premium') || v.name.includes('Enhanced')) &&
      v.lang.startsWith(baseLang),
    v => v.lang === fullLang,
    v => v.lang.startsWith(baseLang),
  ];

  for (const priorityCheck of voicePriorities) {
    const voice = voices.find(priorityCheck);
    if (voice) {
      console.log(
        '[TTSShim] Selected voice:',
        voice.name,
        'for language:',
        voice.lang,
      );
      return voice;
    }
  }

  console.warn(
    '[TTSShim] No matching voice found for language:',
    fullLang,
    '- using first available voice',
  );
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

      // Determine the language to use
      const targetLang = options.language || Tts.defaultLanguage || 'en-US';

      // Select the best voice for the target language
      const bestVoice = selectBestVoice(targetLang);
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      // Apply options with better defaults for AI-like speech
      utterance.lang = targetLang;
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

  removeAllListeners: event => {
    if (event) {
      Tts.listeners.set(event, []);
    } else {
      Tts.listeners.clear();
    }
  },
};

export default Tts;
