/**
 * Web Speech API Shim for @react-native-community/voice
 * Provides browser-based speech recognition
 */

/* eslint-env browser */

class Voice {
  constructor() {
    this.recognition = null;
    this.isRecognizing = false;
    this.lastResultIndex = 0;
  }

  onSpeechStart = null;
  onSpeechEnd = null;
  onSpeechResults = null;
  onSpeechError = null;

  start = async locale => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      const error = new Error('Speech recognition not supported in this browser');
      if (this.onSpeechError) {
        this.onSpeechError({error: {message: error.message}});
      }
      throw error;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (this.recognition) {
      this.recognition.stop();
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = locale || 'en-US';
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isRecognizing = true;
      this.lastResultIndex = 0;
      if (this.onSpeechStart) {
        this.onSpeechStart({});
      }
    };

    this.recognition.onend = () => {
      this.isRecognizing = false;
      if (this.onSpeechEnd) {
        this.onSpeechEnd({});
      }
    };

    this.recognition.onresult = event => {
      const results = [];
      
      // Process only new results starting from lastResultIndex
      for (let i = this.lastResultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          results.push(transcript);
          this.lastResultIndex = i + 1;
        }
      }

      // Only fire callback if we have final results
      if (results.length > 0 && this.onSpeechResults) {
        this.onSpeechResults({value: results});
      }
    };

    this.recognition.onerror = event => {
      if (this.onSpeechError) {
        this.onSpeechError({error: {message: event.error}});
      }
    };

    this.recognition.start();
  };

  stop = async () => {
    if (this.recognition && this.isRecognizing) {
      this.recognition.stop();
    }
  };

  cancel = async () => {
    if (this.recognition) {
      this.recognition.abort();
      this.isRecognizing = false;
    }
  };

  destroy = async () => {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
    this.onSpeechStart = null;
    this.onSpeechEnd = null;
    this.onSpeechResults = null;
    this.onSpeechError = null;
  };

  isAvailable = async () => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  };
}

// Export singleton instance to match react-native-community/voice API
const voiceInstance = new Voice();
export default voiceInstance;
