import { DEFAULTS } from '../utils/constants';
import { isBassDominant, classifyNoiseAI } from '../utils/calculations';
import DatabaseService from './DatabaseService';

class EventDetector {
  constructor() {
    this.activeEvent = null;
    this.eventStartTime = null;
    this.onEventSaved = null;
    this.quietSince = null;
    this._finalizing = false;
  }

  setOnEventSaved(callback) {
    this.onEventSaved = callback;
  }

  processMeasurement(measurement) {
    if (this._finalizing) return;

    const { decibel } = measurement;

    if (decibel >= DEFAULTS.THRESHOLD_DB) {
      this.quietSince = null;

      if (!this.activeEvent) {
        this.startEvent(measurement);
      } else {
        this.continueEvent(measurement);
      }
    } else {
      if (this.activeEvent) {
        if (!this.quietSince) {
          this.quietSince = Date.now();
        }

        const quietDuration = Date.now() - this.quietSince;
        if (quietDuration >= DEFAULTS.EVENT_MERGE_GAP) {
          this._finalizing = true;
          this.endEvent().finally(() => {
            this._finalizing = false;
          });
          this.quietSince = null;
        } else {
          this.continueEvent(measurement);
        }
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

  async forceEndEvent() {
    if (this.activeEvent && !this._finalizing) {
      this._finalizing = true;
      try {
        await this.endEvent();
      } finally {
        this._finalizing = false;
      }
    }
  }

  async endEvent() {
    const duration = Date.now() - this.eventStartTime;

    if (duration < DEFAULTS.EVENT_MIN_DURATION) {
      console.log('Event too short, discarded');
      this.activeEvent = null;
      this.eventStartTime = null;
      this.quietSince = null;
      return;
    }

    const loudMeasurements = this.activeEvent.measurements.filter(
      m => m.decibel >= DEFAULTS.THRESHOLD_DB
    );

    const measurementsForAvg = loudMeasurements.length > 0 ? loudMeasurements : this.activeEvent.measurements;

    const avgDecibel = measurementsForAvg.reduce(
      (sum, m) => sum + m.decibel,
      0
    ) / measurementsForAvg.length;

    const avgFreqBands = {
      bass: measurementsForAvg.reduce((sum, m) => sum + m.freqBands.bass, 0) / measurementsForAvg.length,
      lowMid: measurementsForAvg.reduce((sum, m) => sum + m.freqBands.lowMid, 0) / measurementsForAvg.length,
      mid: measurementsForAvg.reduce((sum, m) => sum + m.freqBands.mid, 0) / measurementsForAvg.length,
      highMid: measurementsForAvg.reduce((sum, m) => sum + m.freqBands.highMid, 0) / measurementsForAvg.length,
      high: measurementsForAvg.reduce((sum, m) => sum + m.freqBands.high, 0) / measurementsForAvg.length,
    };

    // AI-enhanced classification
    const aiResult = classifyNoiseAI(
      avgDecibel,
      avgFreqBands,
      Math.round(duration / 1000),
      this.activeEvent.measurements
    );

    // Use AI classification, fallback to simple rules
    let classification = aiResult.type || 'Loud';
    if (!aiResult.type || aiResult.confidence < 40) {
      if (isBassDominant(avgFreqBands)) {
        classification = 'Music (Bass)';
      } else if (avgDecibel > 80) {
        classification = 'Very Loud';
      }
    }

    const event = {
      timestamp: this.activeEvent.startTime,
      decibel: Math.round(avgDecibel),
      duration: Math.round(duration / 1000),
      freqBands: avgFreqBands,
      classification,
      // AI classification metadata
      aiType: aiResult.type,
      aiConfidence: aiResult.confidence,
      aiEmoji: aiResult.emoji,
      aiDescription: aiResult.description,
      aiLegalCategory: aiResult.legalCategory,
      aiSeverity: aiResult.severity,
    };

    await DatabaseService.insertEvent(event);
    console.log('Event saved:', event.classification, event.decibel, 'dB,', event.duration, 's');

    if (this.onEventSaved) {
      this.onEventSaved(event);
    }

    this.activeEvent = null;
    this.eventStartTime = null;
  }
}

export default new EventDetector();
