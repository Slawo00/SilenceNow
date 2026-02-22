import { Audio } from 'expo-av';
import { estimateFrequencyBands } from '../utils/calculations';
import { DEFAULTS } from '../utils/constants';

class AudioMonitor {
  constructor() {
    this.recording = null;
    this.silentSound = null;
    this.isMonitoring = false;
    this.currentDecibel = 0;
    this.measurementInterval = null;
  }

  async requestPermission() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Microphone permission denied');
      }
      return true;
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  }

  async startMonitoring(onMeasurement) {
    if (this.isMonitoring) {
      return;
    }

    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) return;

      // 🔥 AUTO-ACTIVATE 24/7 MODE
      const BackgroundKeepAlive = require('./BackgroundKeepAlive').default;
      await BackgroundKeepAlive.enableNightMode();
      console.log('[AudioMonitor] 🌙 Auto-activated 24/7 background mode');

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        // 🔥 NIGHT MODE: Optimiert für 24/7 Background
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      });

      await this._startSilentAudio();

      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });
      await this.recording.startAsync();

      this.isMonitoring = true;

      this.measurementInterval = setInterval(async () => {
        if (!this.isMonitoring || !this.recording) return;
        try {
          const status = await this.recording.getStatusAsync();
          if (!status.isRecording) return;

          const metering = status.metering ?? -160;
          const dbSPL = this._convertToSPL(metering);
          this.currentDecibel = dbSPL;
          console.log(`[AudioMonitor] raw=${metering.toFixed(1)} dBFS → ${dbSPL} dB SPL`);

          const normalizedMetering = Math.max(0, Math.min(1, (metering + 160) / 160));
          const freqBands = estimateFrequencyBands(normalizedMetering);

          if (onMeasurement) {
            onMeasurement({
              decibel: this.currentDecibel,
              freqBands,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.warn('Measurement read error:', error.message);
        }
      }, DEFAULTS.SAMPLE_INTERVAL);

      console.log('Monitoring started (with background audio)');
    } catch (error) {
      console.error('Error starting monitoring:', error);
      this.isMonitoring = false;
      await this._cleanupRecording();
      await this._stopSilentAudio();
    }
  }

  async _startSilentAudio() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=' },
        { isLooping: true, volume: 0.01, shouldPlay: true }
      );
      this.silentSound = sound;
      console.log('Silent background audio started');
    } catch (error) {
      console.warn('Silent audio error (non-critical):', error.message);
    }
  }

  async _stopSilentAudio() {
    if (this.silentSound) {
      try {
        await this.silentSound.stopAsync();
        await this.silentSound.unloadAsync();
      } catch (_) {}
      this.silentSound = null;
    }
  }

  _convertToSPL(meteringDbFS) {
    const clamped = Math.max(-80, Math.min(0, meteringDbFS));
    const dbSPL = clamped + 100;
    return Math.max(20, Math.min(130, Math.round(dbSPL)));
  }

  async stopMonitoring() {
    this.isMonitoring = false;

    if (this.measurementInterval) {
      clearInterval(this.measurementInterval);
      this.measurementInterval = null;
    }

    await this._cleanupRecording();
    await this._stopSilentAudio();
    this.currentDecibel = 0;

    // 🔥 AUTO-DISABLE 24/7 MODE WHEN STOPPING
    try {
      const BackgroundKeepAlive = require('./BackgroundKeepAlive').default;
      await BackgroundKeepAlive.disableNightMode();
      console.log('[AudioMonitor] ☀️ Disabled 24/7 background mode');
    } catch (error) {
      console.warn('[AudioMonitor] Failed to disable background mode:', error);
    }

    console.log('Monitoring stopped');
  }

  async _cleanupRecording() {
    if (this.recording) {
      try {
        const status = await this.recording.getStatusAsync();
        if (status.isRecording) {
          await this.recording.stopAndUnloadAsync();
        }
      } catch (e) {
        try {
          await this.recording.stopAndUnloadAsync();
        } catch (_) {}
      }
      this.recording = null;
    }
  }

  getCurrentDecibel() {
    return this.currentDecibel;
  }
}

export default new AudioMonitor();
