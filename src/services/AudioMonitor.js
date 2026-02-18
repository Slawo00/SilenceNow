import { Audio } from 'expo-av';
import { estimateFrequencyBands } from '../utils/calculations';
import { DEFAULTS } from '../utils/constants';

class AudioMonitor {
  constructor() {
    this.recording = null;
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

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

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

      console.log('Monitoring started');
    } catch (error) {
      console.error('Error starting monitoring:', error);
      this.isMonitoring = false;
      await this._cleanupRecording();
    }
  }

  _convertToSPL(meteringDbFS) {
    const clamped = Math.max(-160, Math.min(0, meteringDbFS));
    const dbSPL = clamped + 90;
    return Math.max(20, Math.min(120, Math.round(dbSPL)));
  }

  async stopMonitoring() {
    this.isMonitoring = false;

    if (this.measurementInterval) {
      clearInterval(this.measurementInterval);
      this.measurementInterval = null;
    }

    await this._cleanupRecording();
    this.currentDecibel = 0;
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
