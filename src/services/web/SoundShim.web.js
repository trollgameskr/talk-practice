/**
 * Web Audio Shim for react-native-sound
 * Provides browser-based sound playback
 */

class Sound {
  constructor(filename, basePath, callback) {
    this.audio = new Audio();
    this.filename = filename;
    
    if (typeof basePath === 'function') {
      callback = basePath;
      basePath = '';
    }

    if (basePath === Sound.MAIN_BUNDLE || basePath === Sound.DOCUMENT || basePath === Sound.LIBRARY) {
      // Use filename as-is for bundled resources
      this.audio.src = filename;
    } else if (basePath) {
      this.audio.src = `${basePath}/${filename}`;
    } else {
      this.audio.src = filename;
    }

    this.audio.oncanplaythrough = () => {
      if (callback) callback(null);
    };

    this.audio.onerror = (error) => {
      if (callback) callback(error);
    };
  }

  play(callback) {
    this.audio.play()
      .then(() => {
        if (callback) callback(true);
      })
      .catch((error) => {
        if (callback) callback(false);
        console.error('Error playing sound:', error);
      });
  }

  pause(callback) {
    this.audio.pause();
    if (callback) callback();
  }

  stop(callback) {
    this.audio.pause();
    this.audio.currentTime = 0;
    if (callback) callback();
  }

  release() {
    this.audio.pause();
    this.audio.src = '';
  }

  getDuration() {
    return this.audio.duration;
  }

  getCurrentTime(callback) {
    if (callback) callback(this.audio.currentTime);
  }

  setCurrentTime(time) {
    this.audio.currentTime = time;
  }

  setVolume(volume) {
    this.audio.volume = Math.max(0, Math.min(1, volume));
  }

  getVolume(callback) {
    if (callback) callback(this.audio.volume);
  }

  setNumberOfLoops(loops) {
    this.audio.loop = loops === -1 || loops > 0;
  }

  setSpeed(speed) {
    this.audio.playbackRate = speed;
  }

  static setCategory(category) {
    // No-op for web
  }

  static enable() {
    // No-op for web
  }

  static enableInSilenceMode() {
    // No-op for web
  }
}

// Constants
Sound.MAIN_BUNDLE = 'MAIN_BUNDLE';
Sound.DOCUMENT = 'DOCUMENT';
Sound.LIBRARY = 'LIBRARY';
Sound.CACHES = 'CACHES';

export default Sound;
