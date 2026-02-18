import { Audio } from 'expo-av';
import { estimateFrequencyBands } from '../utils/calculations';
import { DEFAULTS } from '../utils/constants';

class AudioMonitor {
  constructor() {
    this.recording = null;
    this.isMonitoring = false;
    this.currentDecibel = 0;
    this.listeners = [];
    this.silentSound = null;
  }

  async requestPermission() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Microphone permission denied');
      }
      console.log('Microphone permission granted');
      return true;
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  }

  async startBackgroundAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      this.silentSound = new Audio.Sound();
      await this.silentSound.loadAsync(
        { uri: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhAC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAUHAAAAAAAAAOGFjE+EAAAAAAAAAAAAAAAAAAAAAP/7kGQAD/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' },
        { isLooping: true, volume: 0 }
      );
      await this.silentSound.playAsync();

      console.log('Background audio started');
    } catch (error) {
      console.error('Background audio error:', error);
    }
  }

  async startMonitoring(onMeasurement) {
    if (this.isMonitoring) {
      console.log('Already monitoring');
      return;
    }

    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) return;

      await this.startBackgroundAudio();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      this.isMonitoring = true;

      this.measurementInterval = setInterval(async () => {
        await this.takeMeasurement(onMeasurement);
      }, DEFAULTS.SAMPLE_INTERVAL);

      console.log('Monitoring started');
    } catch (error) {
      console.error('Error starting monitoring:', error);
      this.isMonitoring = false;
    }
  }

  async takeMeasurement(callback) {
    try {
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      await new Promise(resolve => setTimeout(resolve, 1000));

      const status = await recording.getStatusAsync();
      await recording.stopAndUnloadAsync();

      const metering = status.metering || -160;
      const normalizedMetering = (metering + 160) / 160;
      const decibel = 30 + (normalizedMetering * 90);

      this.currentDecibel = Math.round(decibel);

      const freqBands = estimateFrequencyBands(normalizedMetering);

      if (callback) {
        callback({
          decibel: this.currentDecibel,
          freqBands,
          timestamp: new Date().toISOString(),
        });
      }

    } catch (error) {
      console.error('Measurement error:', error);
    }
  }

  async stopMonitoring() {
    this.isMonitoring = false;

    if (this.measurementInterval) {
      clearInterval(this.measurementInterval);
      this.measurementInterval = null;
    }

    if (this.silentSound) {
      await this.silentSound.stopAsync();
      await this.silentSound.unloadAsync();
      this.silentSound = null;
    }

    console.log('Monitoring stopped');
  }

  getCurrentDecibel() {
    return this.currentDecibel;
  }
}

export default new AudioMonitor();
