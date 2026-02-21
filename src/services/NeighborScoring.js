/**
 * NeighborScoring Service V2
 * 
 * Berechnet einen Score (0-100) ob ein Lärm-Event wahrscheinlich 
 * vom Nachbarn stammt oder selbst verursacht wurde.
 * 
 * Score > 60: Auto "Nachbar" (neighbor)
 * Score 30-60: "Unbestätigt" (unconfirmed)
 * Score < 30: Nicht loggen (discard)
 * 
 * Alle Faktoren mit Ist-Werten werden für Audit-Trail gespeichert.
 */

import { NEIGHBOR_THRESHOLDS } from '../utils/constants';

class NeighborScoring {
  /**
   * Berechnet den Nachbar-Score für ein Event.
   * Gibt ALLE Faktoren mit Ist-Werten zurück für Audit-Trail.
   *
   * @param {Object} params
   * @param {number} params.avgAcceleration - Durchschnittliche Beschleunigung (m/s²)
   * @param {number} params.bassRatio - (bass+lowMid) / (mid+highMid+high)
   * @param {number} params.midRatio - (mid+highMid) / totalEnergy
   * @param {number} params.dbVariance - Standardabweichung der dB-Werte
   * @param {boolean} params.isNighttime - Nachtruhe (22-06 Uhr)
   * @param {number} params.durationMs - Dauer des Events in ms
   * @param {number} params.avgDecibel - Durchschnittlicher Dezibel-Wert
   * @returns {Object} { score, label, factors }
   */
  calculateScore({
    avgAcceleration = 0,
    bassRatio = 0,
    midRatio = 0,
    dbVariance = 0,
    isNighttime = false,
    durationMs = 0,
    avgDecibel = 0,
  }) {
    let score = 0;
    const factors = [];
    const durationSec = Math.round(durationMs / 1000);
    const hour = new Date().getHours();
    const minute = new Date().getMinutes();

    // ── #1: Vibration erkannt (+25) ──
    // Strukturschall durch Bohren/Hämmern: Accelerometer zwischen 0.015 und 0.05
    const vibrationDetected = avgAcceleration >= 0.015 && avgAcceleration < 0.05;
    factors.push({
      id: 1,
      rule: 'vibration_detected',
      label: 'Vibration erkannt',
      maxPoints: 25,
      points: vibrationDetected ? 25 : 0,
      fulfilled: vibrationDetected,
      condition: '0.015 ≤ avgAcc < 0.05',
      actualValue: avgAcceleration.toFixed(4),
      unit: 'm/s²',
    });
    if (vibrationDetected) score += 25;

    // ── #2: Bass-dominant / Wandfilter (+30) ──
    // Wände filtern hohe Frequenzen → bassRatio steigt
    const bassDominant = bassRatio > 1.5;
    factors.push({
      id: 2,
      rule: 'bass_dominant',
      label: 'Bass-dominant (Wandfilter)',
      maxPoints: 30,
      points: bassDominant ? 30 : 0,
      fulfilled: bassDominant,
      condition: 'bassRatio > 1.5',
      actualValue: bassRatio.toFixed(2),
      unit: 'ratio',
    });
    if (bassDominant) score += 30;

    // ── #3: Extrem bass-lastig (+10 Bonus) ──
    const extremeBass = bassRatio > 2.5;
    factors.push({
      id: 3,
      rule: 'extreme_bass',
      label: 'Extrem bass-lastig',
      maxPoints: 10,
      points: extremeBass ? 10 : 0,
      fulfilled: extremeBass,
      condition: 'bassRatio > 2.5',
      actualValue: bassRatio.toFixed(2),
      unit: 'ratio',
    });
    if (extremeBass) score += 10;

    // ── #4: Handy liegt still (+25) ──
    const phoneStill = avgAcceleration < 0.015;
    factors.push({
      id: 4,
      rule: 'phone_still',
      label: 'Handy liegt still',
      maxPoints: 25,
      points: phoneStill ? 25 : 0,
      fulfilled: phoneStill,
      condition: 'avgAcc < 0.015',
      actualValue: avgAcceleration.toFixed(4),
      unit: 'm/s²',
    });
    if (phoneStill) score += 25;

    // ── #5: Nachtruhe (+25) ──
    factors.push({
      id: 5,
      rule: 'nighttime',
      label: 'Nachtruhe (22-06)',
      maxPoints: 25,
      points: isNighttime ? 25 : 0,
      fulfilled: isNighttime,
      condition: 'Uhrzeit 22:00-06:00',
      actualValue: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      unit: 'Uhr',
    });
    if (isNighttime) score += 25;

    // ── #6: Dauer > 2 Min (+15) ──
    const duration2min = durationMs > 120000;
    factors.push({
      id: 6,
      rule: 'duration_2min',
      label: 'Dauer > 2 Min',
      maxPoints: 15,
      points: duration2min ? 15 : 0,
      fulfilled: duration2min,
      condition: '> 120s',
      actualValue: `${durationSec}`,
      unit: 's',
    });
    if (duration2min) score += 15;

    // ── #7: Dauer > 5 Min (+10 Bonus) ──
    const duration5min = durationMs > 300000;
    factors.push({
      id: 7,
      rule: 'duration_5min',
      label: 'Dauer > 5 Min',
      maxPoints: 10,
      points: duration5min ? 10 : 0,
      fulfilled: duration5min,
      condition: '> 300s',
      actualValue: `${durationSec}`,
      unit: 's',
    });
    if (duration5min) score += 10;

    // ── #8: Handy bewegt sich (-25) ──
    const phoneMoving = avgAcceleration > 0.3;
    factors.push({
      id: 8,
      rule: 'phone_moving',
      label: 'Handy bewegt sich',
      maxPoints: -25,
      points: phoneMoving ? -25 : 0,
      fulfilled: phoneMoving,
      condition: 'avgAcc > 0.3',
      actualValue: avgAcceleration.toFixed(4),
      unit: 'm/s²',
    });
    if (phoneMoving) score -= 25;

    // ── #9: Gespräch erkannt (-20) ──
    // Hoher Mid-Anteil + starke dB-Schwankung (Sprechpausen)
    const conversationDetected = midRatio > 0.45 && dbVariance > 10;
    factors.push({
      id: 9,
      rule: 'conversation_detected',
      label: 'Gespräch erkannt',
      maxPoints: -20,
      points: conversationDetected ? -20 : 0,
      fulfilled: conversationDetected,
      condition: 'midRatio > 0.45 UND dbVariance > 10',
      actualValue: `midRatio=${midRatio.toFixed(2)}, dbVar=${dbVariance.toFixed(1)}`,
      unit: '',
    });
    if (conversationDetected) score -= 20;

    // ── #10: TV/Eigen-Audio erkannt (-15) ──
    // Mittlere bassRatio + sehr stabile Lautstärke
    const tvDetected = bassRatio >= 0.4 && bassRatio <= 1.2 && dbVariance < 3;
    factors.push({
      id: 10,
      rule: 'tv_detected',
      label: 'TV/Eigen-Audio erkannt',
      maxPoints: -15,
      points: tvDetected ? -15 : 0,
      fulfilled: tvDetected,
      condition: 'bassRatio 0.4-1.2 UND dbVariance < 3',
      actualValue: `bassRatio=${bassRatio.toFixed(2)}, dbVar=${dbVariance.toFixed(1)}`,
      unit: '',
    });
    if (tvDetected) score -= 15;

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
    console.log(`[NeighborScoring] Event: ${avgDecibel.toFixed(1)} dB, ${durationSec}s`);
    factors.forEach(f => {
      const status = f.fulfilled ? '✅' : '❌';
      const sign = f.maxPoints >= 0 ? '+' : '';
      console.log(`[NeighborScoring] #${f.id} ${status} ${f.label}: ${f.actualValue} ${f.unit} (${f.condition}) → ${sign}${f.points}/${sign}${f.maxPoints}`);
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
