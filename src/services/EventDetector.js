/**
 * EventDetector V4.0 - Nachbar-Erkennung, Kategorisierung, Start/Ende
 * 
 * Der AKTIVE Detector, genutzt von HomeScreen.
 * 
 * Änderungen:
 * - NeighborScoring Integration
 * - MotionDetector Integration
 * - Automatische Lärm-Kategorisierung
 * - start_time / end_time statt timestamp/duration
 * - EVENT_MERGE_GAP = 180000 (3 Min)
 * - EVENT_MIN_DURATION = 30000 (30s), Ausnahme >80dB (10s)
 * - Durchschnittspegel nur über laute Phasen
 */

import { DEFAULTS, NOISE_CATEGORIES } from '../utils/constants';
import DatabaseService from './DatabaseService';
import NotificationService from './NotificationService';
import MotionDetector from './MotionDetector';
import NeighborScoring from './NeighborScoring';

class EventDetector {
  constructor() {
    this.activeEvent = null;
    this.eventStartTime = null;
    this.onEventSaved = null;
    this.quietSince = null;
    this._finalizing = false;
    this._motionStarted = false;
  }

  setOnEventSaved(callback) {
    this.onEventSaved = callback;
  }

  /**
   * Stellt sicher dass MotionDetector läuft
   */
  async _ensureMotion() {
    if (!this._motionStarted) {
      try {
        await MotionDetector.startMonitoring();
        this._motionStarted = true;
      } catch (e) {
        console.warn('[EventDetector] MotionDetector start failed:', e.message);
      }
    }
  }

  processMeasurement(measurement) {
    if (this._finalizing) return;

    // Sicherstellen dass MotionDetector läuft
    this._ensureMotion();

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
    console.log('[EventDetector] Event started:', measurement.decibel, 'dB');
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

  /**
   * Berechnet die Dezibel-Varianz
   */
  _calculateVariance(measurements) {
    if (measurements.length < 2) return 0;
    const values = measurements.map(m => m.decibel);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return variance;
  }

  /**
   * Automatische Lärm-Kategorisierung basierend auf Pegel-Mustern
   * Nur Dezibel-Werte + Motion verfügbar (kein FFT/Audio-Buffer)
   */
  _categorizeNoise(measurements, durationMs, motionStats) {
    const loudMeasurements = measurements.filter(m => m.decibel >= DEFAULTS.THRESHOLD_DB);
    if (loudMeasurements.length === 0) return NOISE_CATEGORIES.SONSTIGES;

    const values = loudMeasurements.map(m => m.decibel);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = this._calculateVariance(loudMeasurements);
    const stddev = Math.sqrt(variance);
    const maxDb = Math.max(...values);
    const durationSec = durationMs / 1000;

    // Spitzen-Analyse: Wie viele kurze Spitzen gibt es?
    let spikeCount = 0;
    let lastSpikeTime = 0;
    const spikeIntervals = [];
    for (let i = 1; i < loudMeasurements.length; i++) {
      const diff = loudMeasurements[i].decibel - loudMeasurements[i - 1].decibel;
      if (diff > 8) {
        const ts = loudMeasurements[i].timestamp || Date.now();
        if (lastSpikeTime > 0) {
          spikeIntervals.push(ts - lastSpikeTime);
        }
        lastSpikeTime = ts;
        spikeCount++;
      }
    }

    // Vibration vorhanden?
    const hasVibration = motionStats && motionStats.significantEvents > 2;
    const strongVibration = motionStats && motionStats.maxAcceleration > 0.3;

    // 🔨 Handwerk: extrem laut (>80dB), kurze repetitive Spitzen
    if (maxDb > 80 && spikeCount >= 3 && stddev > 8) {
      return NOISE_CATEGORIES.HANDWERK;
    }

    // 🐕 Hund: kurze wiederkehrende Spitzen (0.5-2s Intervalle)
    const avgInterval = spikeIntervals.length > 0
      ? spikeIntervals.reduce((a, b) => a + b, 0) / spikeIntervals.length
      : 0;
    if (spikeCount >= 3 && avgInterval > 500 && avgInterval < 3000 && stddev > 5) {
      return NOISE_CATEGORIES.HUND;
    }

    // 👣 Trittschall: Vibration stark aber Dezibel niedrig-mittel
    if (strongVibration && mean < 70) {
      return NOISE_CATEGORIES.TRITTSCHALL;
    }

    // 🎵 Musik: gleichmäßig, lang (>2 min), evtl. rhythmische Vibration
    if (stddev < 6 && durationSec > 120) {
      return NOISE_CATEGORIES.MUSIK;
    }

    // 🗣️ Geschrei: hohe Spitzen, unregelmäßig, lang
    if (maxDb > 70 && stddev > 8 && durationSec > 60) {
      return NOISE_CATEGORIES.GESCHREI;
    }

    // 🎵 Musik (kürzer): gleichmäßig, moderat
    if (stddev < 8 && durationSec > 30) {
      return NOISE_CATEGORIES.MUSIK;
    }

    // 👶 Kinder: Fallback wenn nichts anderes passt
    if (spikeCount >= 2 && stddev > 5 && mean < 75) {
      return NOISE_CATEGORIES.KINDER;
    }

    // ❓ Sonstiges
    return NOISE_CATEGORIES.SONSTIGES;
  }

  async endEvent() {
    const now = Date.now();
    const durationMs = now - this.eventStartTime;
    const peakDb = this.activeEvent.peakDecibel;

    // Mindestdauer: 30s normal, 10s bei >80dB
    const minDuration = peakDb > DEFAULTS.LOUD_THRESHOLD_DB
      ? DEFAULTS.EVENT_MIN_DURATION_LOUD
      : DEFAULTS.EVENT_MIN_DURATION;

    if (durationMs < minDuration) {
      console.log('[EventDetector] Event too short (' + Math.round(durationMs / 1000) + 's), discarded');
      this.activeEvent = null;
      this.eventStartTime = null;
      this.quietSince = null;
      return;
    }

    // Durchschnittspegel NUR über laute Phasen
    const loudMeasurements = this.activeEvent.measurements.filter(
      m => m.decibel >= DEFAULTS.THRESHOLD_DB
    );
    const measurementsForAvg = loudMeasurements.length > 0 ? loudMeasurements : this.activeEvent.measurements;

    const avgDecibel = measurementsForAvg.reduce(
      (sum, m) => sum + m.decibel, 0
    ) / measurementsForAvg.length;

    // Calculate average frequency bands safely
    const getFreq = (m, key) => (m.freqBands && m.freqBands[key]) || 0;
    const avgFreqBands = {
      bass: measurementsForAvg.reduce((sum, m) => sum + getFreq(m, 'bass'), 0) / measurementsForAvg.length,
      lowMid: measurementsForAvg.reduce((sum, m) => sum + getFreq(m, 'lowMid'), 0) / measurementsForAvg.length,
      mid: measurementsForAvg.reduce((sum, m) => sum + getFreq(m, 'mid'), 0) / measurementsForAvg.length,
      highMid: measurementsForAvg.reduce((sum, m) => sum + getFreq(m, 'highMid'), 0) / measurementsForAvg.length,
      high: measurementsForAvg.reduce((sum, m) => sum + getFreq(m, 'high'), 0) / measurementsForAvg.length,
    };

    // If freq bands are all zero, estimate from decibel
    const totalFreq = avgFreqBands.bass + avgFreqBands.lowMid + avgFreqBands.mid + avgFreqBands.highMid + avgFreqBands.high;
    if (totalFreq === 0 && avgDecibel > 0) {
      avgFreqBands.bass = avgDecibel * 0.30;
      avgFreqBands.lowMid = avgDecibel * 0.25;
      avgFreqBands.mid = avgDecibel * 0.25;
      avgFreqBands.highMid = avgDecibel * 0.12;
      avgFreqBands.high = avgDecibel * 0.08;
    }

    // ---- MOTION-ANALYSE ----
    const motionStats = MotionDetector.getMotionStatistics();
    const motionCorrelation = MotionDetector.analyzeMotionCorrelation(
      this.eventStartTime, durationMs / 2
    );

    // ---- NACHBAR-SCORING ----
    const decibelVariance = this._calculateVariance(this.activeEvent.measurements);
    const hour = new Date(this.activeEvent.startTime).getHours();
    const isNighttime = hour >= 22 || hour < 6;

    const neighborResult = NeighborScoring.calculateScore({
      vibrationDetected: motionCorrelation.hasMotion && motionCorrelation.motionIntensity > 0.2,
      phoneIsStill: !motionStats.isActive || motionStats.avgAcceleration < 0.05,
      phoneIsMoving: motionStats.isActive && motionStats.avgAcceleration > 0.3,
      isNighttime,
      durationMs,
      decibelVariance,
      avgDecibel,
      // Rohdaten für transparentes Logging
      motionIntensity: motionCorrelation.motionIntensity || 0,
      avgAcceleration: motionStats.avgAcceleration || 0,
    });

    // Score < 30: Nicht loggen
    if (!NeighborScoring.shouldLog(neighborResult.score)) {
      console.log('[EventDetector] Neighbor score too low (' + neighborResult.score + '), discarding');
      this.activeEvent = null;
      this.eventStartTime = null;
      this.quietSince = null;
      return;
    }

    // ---- AUTOMATISCHE KATEGORISIERUNG ----
    const category = this._categorizeNoise(
      this.activeEvent.measurements, durationMs, motionStats
    );

    // start_time / end_time berechnen
    const startTimeISO = new Date(this.activeEvent.startTime).toISOString();
    const endTimeISO = new Date(now).toISOString();

    // Severity hochstufen bei extremen Werten
    let severity = category.severity;
    if (avgDecibel > 75) severity = 'high';
    if (avgDecibel > 85) severity = 'very_high';

    const event = {
      timestamp: startTimeISO,
      start_time: startTimeISO,
      end_time: endTimeISO,
      decibel: Math.round(avgDecibel),
      avg_decibel: Math.round(avgDecibel * 10) / 10,
      peak_decibel: Math.round(peakDb * 10) / 10,
      duration: Math.round(durationMs / 1000),
      freqBands: avgFreqBands,
      classification: category.label,
      // Kategorie-Daten (einzige Quelle)
      noise_category: category.key,
      category_auto: true,
      aiType: category.label,
      aiEmoji: category.emoji,
      aiDescription: category.description,
      aiLegalCategory: category.legalCategory,
      aiSeverity: severity,
      aiConfidence: 0, // Nur Muster-Erkennung, keine echte AI-Konfidenz
      // Nachbar-Erkennung
      neighbor_score: neighborResult.score,
      source_confirmed: neighborResult.label === 'neighbor' ? 'neighbor' : 'unconfirmed',
    };

    await DatabaseService.insertEvent(event);
    console.log('[EventDetector] Event saved:', category.emoji, category.label,
      '| Score:', neighborResult.score, '(' + neighborResult.label + ')',
      '|', event.decibel, 'dB,', event.duration, 's');

    // Push notification
    try {
      await NotificationService.sendNoiseAlert({
        decibel: event.decibel,
        classification: category.emoji + ' ' + category.label,
        legalScore: event.legalScore || 0,
      });
    } catch (notifError) {
      console.warn('Notification failed (non-critical):', notifError.message);
    }

    if (this.onEventSaved) {
      this.onEventSaved(event);
    }

    this.activeEvent = null;
    this.eventStartTime = null;
  }
}

export default new EventDetector();
