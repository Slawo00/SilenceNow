import { DEFAULTS } from '../utils/constants';
import { isBassDominant } from '../utils/calculations';
import DatabaseService from './DatabaseService';

class EventDetector {
  constructor() {
    this.activeEvent = null;
    this.eventStartTime = null;
    this.eventPeakDb = 0;
    this.eventMeasurements = [];
  }

  processMeasurement(measurement) {
    const { decibel, freqBands, timestamp } = measurement;

    if (decibel >= DEFAULTS.THRESHOLD_DB) {
      if (!this.activeEvent) {
        this.startEvent(measurement);
      } else {
        this.continueEvent(measurement);
      }
    } else {
      if (this.activeEvent) {
        this.endEvent();
      }
    }
  }

  startEvent(measurement) {
    this.activeEvent = {
      startTime: measurement.timestamp,
      startDecibel: measurement.decibel,
      peakDecibel: measurement.decibel,
      measurements: [measurement],
    };
    this.eventStartTime = Date.now();
    console.log('Event started:', measurement.decibel, 'dB');
  }

  continueEvent(measurement) {
    this.activeEvent.measurements.push(measurement);

    if (measurement.decibel > this.activeEvent.peakDecibel) {
      this.activeEvent.peakDecibel = measurement.decibel;
    }
  }

  async endEvent() {
    const duration = Date.now() - this.eventStartTime;

    if (duration < DEFAULTS.EVENT_MIN_DURATION) {
      console.log('Event too short, discarded');
      this.activeEvent = null;
      return;
    }

    const avgDecibel = this.activeEvent.measurements.reduce(
      (sum, m) => sum + m.decibel,
      0
    ) / this.activeEvent.measurements.length;

    const avgFreqBands = {
      bass: this.activeEvent.measurements.reduce((sum, m) => sum + m.freqBands.bass, 0) / this.activeEvent.measurements.length,
      lowMid: this.activeEvent.measurements.reduce((sum, m) => sum + m.freqBands.lowMid, 0) / this.activeEvent.measurements.length,
      mid: this.activeEvent.measurements.reduce((sum, m) => sum + m.freqBands.mid, 0) / this.activeEvent.measurements.length,
      highMid: this.activeEvent.measurements.reduce((sum, m) => sum + m.freqBands.highMid, 0) / this.activeEvent.measurements.length,
      high: this.activeEvent.measurements.reduce((sum, m) => sum + m.freqBands.high, 0) / this.activeEvent.measurements.length,
    };

    let classification = 'Loud';
    if (isBassDominant(avgFreqBands)) {
      classification = 'Music (Bass)';
    } else if (avgDecibel > 80) {
      classification = 'Very Loud';
    }

    const event = {
      timestamp: this.activeEvent.startTime,
      decibel: Math.round(avgDecibel),
      duration: Math.round(duration / 1000),
      freqBands: avgFreqBands,
      classification,
    };

    await DatabaseService.insertEvent(event);

    console.log('Event saved:', event);

    this.activeEvent = null;
    this.eventStartTime = null;
  }
}

export default new EventDetector();
