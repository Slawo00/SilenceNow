/**
 * NeighborScoring Service
 * 
 * Berechnet einen Score (0-100) ob ein Lärm-Event wahrscheinlich 
 * vom Nachbarn stammt oder selbst verursacht wurde.
 * 
 * Score > 60: Auto "Nachbar" (neighbor)
 * Score 30-60: "Unbestätigt" (unconfirmed)
 * Score < 30: Nicht loggen (discard)
 */

import { NEIGHBOR_THRESHOLDS } from '../utils/constants';

class NeighborScoring {
  /**
   * Berechnet den Nachbar-Score für ein Event
   * 
   * @param {Object} params
   * @param {boolean} params.vibrationDetected - Accelerometer hat Vibration erkannt
   * @param {boolean} params.phoneIsStill - Handy liegt still (keine Handbewegung)
   * @param {boolean} params.phoneIsMoving - Handy wird aktiv bewegt (in Hand)
   * @param {boolean} params.isNighttime - Nachtruhe (22-6 Uhr)
   * @param {number} params.durationMs - Dauer des Events in ms
   * @param {number} params.decibelVariance - Varianz der Dezibel-Werte
   * @param {number} params.avgDecibel - Durchschnittlicher Dezibel-Wert
   * @returns {Object} { score, label, factors }
   */
  calculateScore({
    vibrationDetected = false,
    phoneIsStill = false,
    phoneIsMoving = false,
    isNighttime = false,
    durationMs = 0,
    decibelVariance = 0,
    avgDecibel = 0,
  }) {
    let score = 0;
    const factors = [];

    // +30: Vibration erkannt (Accelerometer) → Trittschall/Bass durch Wände
    if (vibrationDetected) {
      score += 30;
      factors.push({ rule: 'vibration_detected', points: 30, desc: 'Vibration erkannt (Trittschall/Bass)' });
    }

    // +25: Handy liegt still + Lärm → Lärm kommt nicht vom Nutzer
    if (phoneIsStill && !phoneIsMoving) {
      score += 25;
      factors.push({ rule: 'phone_still', points: 25, desc: 'Handy liegt still während Lärm' });
    }

    // +20: Nachtruhe (22-6 Uhr) → Wahrscheinlicher Nachbar
    if (isNighttime) {
      score += 20;
      factors.push({ rule: 'nighttime', points: 20, desc: 'Nachtruhe (22-6 Uhr)' });
    }

    // +15: Dauer > 5 Minuten → Anhaltender Lärm = eher Nachbar
    if (durationMs > 5 * 60 * 1000) {
      score += 15;
      factors.push({ rule: 'long_duration', points: 15, desc: 'Dauer > 5 Minuten' });
    }

    // +10: Gleichmäßiger Pegel (niedrige Varianz) → Externe Quelle
    if (decibelVariance < 5) {
      score += 10;
      factors.push({ rule: 'steady_level', points: 10, desc: 'Gleichmäßiger Pegel' });
    }

    // -20: Handy bewegt sich → Nutzer ist aktiv, Lärm evtl. selbst verursacht
    if (phoneIsMoving) {
      score -= 20;
      factors.push({ rule: 'phone_moving', points: -20, desc: 'Handy wird bewegt' });
    }

    // -15: Starke Pegel-Schwankung → Inkonsistent, evtl. eigene Aktivität
    if (decibelVariance > 15) {
      score -= 15;
      factors.push({ rule: 'high_variance', points: -15, desc: 'Starke Pegel-Schwankung' });
    }

    // -10: Sehr hoher Pegel >80 dB → Evtl. direkte Quelle (eigenes Gerät)
    if (avgDecibel > 80) {
      score -= 10;
      factors.push({ rule: 'very_loud', points: -10, desc: 'Sehr hoher Pegel >80 dB' });
    }

    // Score auf 0-100 clampen
    score = Math.max(0, Math.min(100, score));

    // Label bestimmen
    let label;
    if (score > NEIGHBOR_THRESHOLDS.AUTO_NEIGHBOR) {
      label = 'neighbor';     // Auto "Nachbar"
    } else if (score >= NEIGHBOR_THRESHOLDS.UNCONFIRMED) {
      label = 'unconfirmed';  // "Unbestätigt"
    } else {
      label = 'discard';      // Nicht loggen
    }

    return { score, label, factors };
  }

  /**
   * Prüft ob ein Event geloggt werden soll
   * @param {number} score 
   * @returns {boolean}
   */
  shouldLog(score) {
    return score >= NEIGHBOR_THRESHOLDS.UNCONFIRMED;
  }

  /**
   * Gibt das Label für einen Score zurück
   * @param {number} score 
   * @returns {string}
   */
  getLabelForScore(score) {
    if (score > NEIGHBOR_THRESHOLDS.AUTO_NEIGHBOR) return 'neighbor';
    if (score >= NEIGHBOR_THRESHOLDS.UNCONFIRMED) return 'unconfirmed';
    return 'discard';
  }

  /**
   * Gibt ein Display-Label für die UI zurück
   * @param {string} label - neighbor|unconfirmed|discard
   * @returns {string}
   */
  getDisplayLabel(label) {
    switch (label) {
      case 'neighbor': return '🏠 Nachbar';
      case 'unconfirmed': return '❓ Unbestätigt';
      case 'discard': return '✖ Verworfen';
      default: return '❓ Unbekannt';
    }
  }
}

export default new NeighborScoring();
