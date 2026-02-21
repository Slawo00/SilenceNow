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
   * Gibt ALLE Faktoren zurück mit Ist-Werten und ob sie erfüllt wurden.
   */
  calculateScore({
    vibrationDetected = false,
    phoneIsStill = false,
    phoneIsMoving = false,
    isNighttime = false,
    durationMs = 0,
    decibelVariance = 0,
    avgDecibel = 0,
    // Rohdaten für Transparenz
    motionIntensity = 0,
    avgAcceleration = 0,
  }) {
    let score = 0;
    const factors = [];

    // +30: Vibration erkannt (Accelerometer) → Trittschall/Bass durch Wände
    factors.push({
      rule: 'vibration_detected',
      label: 'Vibration erkannt',
      maxPoints: 30,
      points: vibrationDetected ? 30 : 0,
      fulfilled: vibrationDetected,
      threshold: 'motionIntensity > 0.2',
      actualValue: motionIntensity.toFixed(3),
    });
    if (vibrationDetected) score += 30;

    // +25: Handy liegt still + Lärm → Lärm kommt nicht vom Nutzer
    const stillFulfilled = phoneIsStill && !phoneIsMoving;
    factors.push({
      rule: 'phone_still',
      label: 'Handy liegt still',
      maxPoints: 25,
      points: stillFulfilled ? 25 : 0,
      fulfilled: stillFulfilled,
      threshold: 'avgAcceleration < 0.05',
      actualValue: avgAcceleration.toFixed(4),
    });
    if (stillFulfilled) score += 25;

    // +20: Nachtruhe (22-6 Uhr)
    const hour = new Date().getHours();
    factors.push({
      rule: 'nighttime',
      label: 'Nachtruhe (22-06)',
      maxPoints: 20,
      points: isNighttime ? 20 : 0,
      fulfilled: isNighttime,
      threshold: 'Uhrzeit 22:00-06:00',
      actualValue: `${hour}:${String(new Date().getMinutes()).padStart(2, '0')} Uhr`,
    });
    if (isNighttime) score += 20;

    // +15: Dauer > 5 Minuten
    const durationSec = Math.round(durationMs / 1000);
    const longDuration = durationMs > 5 * 60 * 1000;
    factors.push({
      rule: 'long_duration',
      label: 'Dauer > 5 Min',
      maxPoints: 15,
      points: longDuration ? 15 : 0,
      fulfilled: longDuration,
      threshold: '> 300s',
      actualValue: `${durationSec}s`,
    });
    if (longDuration) score += 15;

    // +10: Gleichmäßiger Pegel (niedrige Varianz)
    const steadyLevel = decibelVariance < 5;
    factors.push({
      rule: 'steady_level',
      label: 'Gleichmäßiger Pegel',
      maxPoints: 10,
      points: steadyLevel ? 10 : 0,
      fulfilled: steadyLevel,
      threshold: 'Varianz < 5',
      actualValue: decibelVariance.toFixed(1),
    });
    if (steadyLevel) score += 10;

    // -20: Handy bewegt sich
    factors.push({
      rule: 'phone_moving',
      label: 'Handy bewegt sich',
      maxPoints: -20,
      points: phoneIsMoving ? -20 : 0,
      fulfilled: phoneIsMoving,
      threshold: 'avgAcceleration > 0.3',
      actualValue: avgAcceleration.toFixed(4),
    });
    if (phoneIsMoving) score -= 20;

    // -15: Starke Pegel-Schwankung
    const highVariance = decibelVariance > 15;
    factors.push({
      rule: 'high_variance',
      label: 'Starke Schwankung',
      maxPoints: -15,
      points: highVariance ? -15 : 0,
      fulfilled: highVariance,
      threshold: 'Varianz > 15',
      actualValue: decibelVariance.toFixed(1),
    });
    if (highVariance) score -= 15;

    // -10: Sehr hoher Pegel >80 dB
    const veryLoud = avgDecibel > 80;
    factors.push({
      rule: 'very_loud',
      label: 'Sehr laut >80 dB',
      maxPoints: -10,
      points: veryLoud ? -10 : 0,
      fulfilled: veryLoud,
      threshold: 'avgDecibel > 80',
      actualValue: `${avgDecibel.toFixed(1)} dB`,
    });
    if (veryLoud) score -= 10;

    // Score auf 0-100 clampen
    score = Math.max(0, Math.min(100, score));

    // Label bestimmen
    let label;
    if (score > NEIGHBOR_THRESHOLDS.AUTO_NEIGHBOR) {
      label = 'neighbor';
    } else if (score >= NEIGHBOR_THRESHOLDS.UNCONFIRMED) {
      label = 'unconfirmed';
    } else {
      label = 'discard';
    }

    // Detailliertes Logging
    console.log('[NeighborScoring] === SCORING DETAILS ===');
    factors.forEach(f => {
      const status = f.fulfilled ? '✅' : '❌';
      const sign = f.maxPoints >= 0 ? '+' : '';
      console.log(`[NeighborScoring] ${status} ${f.label}: ${f.actualValue} (Schwelle: ${f.threshold}) → ${sign}${f.points}/${sign}${f.maxPoints}`);
    });
    console.log(`[NeighborScoring] === GESAMT: ${score}/100 → ${label.toUpperCase()} ===`);

    return { score, label, factors };
  }

  shouldLog(score) {
    return score >= NEIGHBOR_THRESHOLDS.UNCONFIRMED;
  }

  getLabelForScore(score) {
    if (score > NEIGHBOR_THRESHOLDS.AUTO_NEIGHBOR) return 'neighbor';
    if (score >= NEIGHBOR_THRESHOLDS.UNCONFIRMED) return 'unconfirmed';
    return 'discard';
  }

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
