/**
 * Web Audio API Shim for react-native-audio-recorder-player
 * Provides browser-based audio recording
 */

/* eslint-env browser */

class AudioRecorderPlayer {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
  }

  async startRecorder(path, audioSet, meteringEnabled) {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({audio: true});
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      return 'recording';
    } catch (error) {
      console.error('Error starting recorder:', error);
      throw error;
    }
  }

  async stopRecorder() {
    return new Promise(resolve => {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, {type: 'audio/webm'});
          const audioUrl = URL.createObjectURL(audioBlob);

          if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
          }

          resolve(audioUrl);
        };

        this.mediaRecorder.stop();
      } else {
        resolve(null);
      }
    });
  }

  async pauseRecorder() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      return 'paused';
    }
    return null;
  }

  async resumeRecorder() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      return 'recording';
    }
    return null;
  }

  async startPlayer(path) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(path);
      audio
        .play()
        .then(() => resolve('playing'))
        .catch(reject);
    });
  }

  async stopPlayer() {
    // Implementation for stopping player
    return Promise.resolve();
  }

  async pausePlayer() {
    // Implementation for pausing player
    return Promise.resolve();
  }

  addRecordBackListener(listener) {
    // Implementation for record callback
  }

  addPlayBackListener(listener) {
    // Implementation for playback callback
  }

  removeRecordBackListener() {
    // Remove listener
  }

  removePlayBackListener() {
    // Remove listener
  }
}

export default AudioRecorderPlayer;
