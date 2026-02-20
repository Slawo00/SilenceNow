/**
 * SilenceNow - Audio Calculations & Frequency Analysis
 * 
 * Enhanced frequency estimation based on decibel patterns
 * and temporal analysis for noise type classification.
 */

export const calculateRMS = (buffer) => {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
};

export const rmsToDecibels = (rms) => {
  if (rms === 0) return 0;
  const reference = 0.00002;
  const db = 20 * Math.log10(rms / reference);
  return Math.max(30, Math.min(120, db));
};

/**
 * Enhanced frequency band estimation from decibel measurements.
 * Uses decibel level + variance patterns to estimate frequency distribution.
 * 
 * On real hardware, expo-av only provides overall metering (dB),
 * not per-frequency data. We estimate bands based on:
 * - Absolute dB level (louder = more low frequency energy typically)
 * - Measurement variance (stable = tonal, variable = broadband)
 * - Time patterns (sudden spikes vs sustained = different sources)
 * 
 * @param {number} decibel - Current decibel measurement
 * @param {Array} recentMeasurements - Recent measurement history
 * @returns {Object} Estimated frequency bands
 */
export const estimateFrequencyBands = (decibel, recentMeasurements = []) => {
  if (decibel <= 0) {
    return { bass: 0, lowMid: 0, mid: 0, highMid: 0, high: 0 };
  }

  // Calculate variance from recent measurements for pattern detection
  let variance = 0;
  let trend = 0;
  
  if (recentMeasurements.length >= 3) {
    const recent = recentMeasurements.slice(-10).map(m => m.decibel || m);
    const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
    variance = recent.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recent.length;
    
    // Trend: rising or falling
    if (recent.length >= 2) {
      trend = recent[recent.length - 1] - recent[0];
    }
  }

  // Base energy distribution based on decibel level
  let bassRatio, lowMidRatio, midRatio, highMidRatio, highRatio;

  if (variance > 15) {
    // High variance → Broadband noise (traffic, construction, appliances)
    bassRatio = 0.30;
    lowMidRatio = 0.25;
    midRatio = 0.25;
    highMidRatio = 0.12;
    highRatio = 0.08;
  } else if (variance > 5) {
    // Medium variance → Mixed sources (TV, conversation with background)
    bassRatio = 0.20;
    lowMidRatio = 0.25;
    midRatio = 0.30;
    highMidRatio = 0.15;
    highRatio = 0.10;
  } else if (variance > 1) {
    // Low variance → Tonal content (music, single voice)
    bassRatio = 0.25;
    lowMidRatio = 0.20;
    midRatio = 0.35;
    highMidRatio = 0.12;
    highRatio = 0.08;
  } else {
    // Very stable → Constant hum (machinery, HVAC, bass through walls)
    bassRatio = 0.40;
    lowMidRatio = 0.25;
    midRatio = 0.20;
    highMidRatio = 0.10;
    highRatio = 0.05;
  }

  // Adjust for high decibel levels (louder typically has more bass energy)
  if (decibel > 80) {
    bassRatio += 0.10;
    highRatio -= 0.05;
    highMidRatio -= 0.05;
  } else if (decibel > 65) {
    bassRatio += 0.05;
    highRatio -= 0.03;
    highMidRatio -= 0.02;
  }

  // Sudden spike (rising trend) suggests impact noise → more high freq
  if (trend > 15) {
    highMidRatio += 0.08;
    highRatio += 0.05;
    bassRatio -= 0.08;
    lowMidRatio -= 0.05;
  }

  // Normalize ratios
  const totalRatio = bassRatio + lowMidRatio + midRatio + highMidRatio + highRatio;

  return {
    bass: Math.round((bassRatio / totalRatio) * decibel * 10) / 10,
    lowMid: Math.round((lowMidRatio / totalRatio) * decibel * 10) / 10,
    mid: Math.round((midRatio / totalRatio) * decibel * 10) / 10,
    highMid: Math.round((highMidRatio / totalRatio) * decibel * 10) / 10,
    high: Math.round((highRatio / totalRatio) * decibel * 10) / 10,
  };
};

/**
 * Check if bass frequencies dominate the measurement
 */
export const isBassDominant = (freqBands) => {
  if (!freqBands) return false;
  const totalEnergy = Object.values(freqBands).reduce((sum, val) => sum + (val || 0), 0);
  if (totalEnergy === 0) return false;
  return (freqBands.bass || 0) / totalEnergy > 0.35;
};

/**
 * AI-enhanced noise classification based on frequency profile and patterns
 * 
 * @param {number} decibel - Current decibel level
 * @param {Object} freqBands - Frequency band distribution
 * @param {number} duration - Event duration in seconds
 * @param {Array} recentMeasurements - Recent measurement history
 * @returns {Object} Classification result
 */
export const classifyNoiseAI = (decibel, freqBands, duration = 0, recentMeasurements = []) => {
  if (!freqBands || decibel <= 0) {
    return { type: 'Unknown', confidence: 0, emoji: '❓', description: 'Keine Daten' };
  }

  const totalEnergy = Object.values(freqBands).reduce((sum, val) => sum + (val || 0), 0);
  if (totalEnergy === 0) {
    return { type: 'Unknown', confidence: 0, emoji: '❓', description: 'Keine Frequenzdaten' };
  }

  const bassPercent = (freqBands.bass / totalEnergy) * 100;
  const midPercent = ((freqBands.mid + (freqBands.lowMid || 0)) / totalEnergy) * 100;
  const highPercent = (((freqBands.highMid || 0) + freqBands.high) / totalEnergy) * 100;

  // Calculate variance for pattern analysis
  let variance = 0;
  if (recentMeasurements.length >= 3) {
    const vals = recentMeasurements.slice(-10).map(m => m.decibel || m);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    variance = vals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / vals.length;
  }

  // Classification logic
  let result;

  // Music with heavy bass (subwoofer, party)
  if (bassPercent > 35 && decibel > 55) {
    if (decibel > 75) {
      result = {
        type: 'Musik (Starker Bass)',
        confidence: 85,
        emoji: '🎵',
        description: 'Laute Musik mit dominantem Bass - typisch für Subwoofer/Party',
        legalCategory: 'music_bass',
        severity: 'high'
      };
    } else {
      result = {
        type: 'Musik (Bass)',
        confidence: 75,
        emoji: '🎶',
        description: 'Musik mit wahrnehmbarem Bass durch Wände',
        legalCategory: 'music_bass',
        severity: 'medium'
      };
    }
  }
  // Voices / TV / Conversation
  else if (midPercent > 45 && variance < 8) {
    if (decibel > 70) {
      result = {
        type: 'Laute Stimmen / Streit',
        confidence: 70,
        emoji: '🗣️',
        description: 'Laute Unterhaltung oder Streitgespräch',
        legalCategory: 'voices',
        severity: 'high'
      };
    } else {
      result = {
        type: 'Gespräche / TV',
        confidence: 65,
        emoji: '📺',
        description: 'Hörbare Unterhaltung oder Fernseher',
        legalCategory: 'voices',
        severity: 'low'
      };
    }
  }
  // Construction / Impact noise
  else if (highPercent > 25 && variance > 10) {
    if (duration > 60) {
      result = {
        type: 'Bauarbeiten / Bohren',
        confidence: 80,
        emoji: '🔨',
        description: 'Anhaltende Bau- oder Renovierungsgeräusche',
        legalCategory: 'construction',
        severity: 'high'
      };
    } else {
      result = {
        type: 'Klopfen / Hämmern',
        confidence: 70,
        emoji: '🪚',
        description: 'Kurzes Hämmern oder Klopfgeräusch',
        legalCategory: 'construction',
        severity: 'medium'
      };
    }
  }
  // Constant hum / Machinery
  else if (bassPercent > 30 && variance < 3 && duration > 120) {
    result = {
      type: 'Maschinen / Brummen',
      confidence: 75,
      emoji: '⚙️',
      description: 'Konstantes Brummen - möglicherweise Heizung, Klimaanlage oder Maschinen',
      legalCategory: 'mechanical',
      severity: 'medium'
    };
  }
  // Dog barking / Pets
  else if (highPercent > 20 && variance > 12 && duration < 120) {
    result = {
      type: 'Haustiere / Bellen',
      confidence: 60,
      emoji: '🐕',
      description: 'Möglicherweise Hundebellen oder andere Tiergeräusche',
      legalCategory: 'pets',
      severity: 'medium'
    };
  }
  // Footsteps / Impact through ceiling
  else if (bassPercent > 25 && highPercent > 15 && variance > 8) {
    result = {
      type: 'Trittschall / Schritte',
      confidence: 65,
      emoji: '👣',
      description: 'Schritte oder Trittgeräusche aus oberer Wohnung',
      legalCategory: 'footsteps',
      severity: 'medium'
    };
  }
  // General loud noise
  else if (decibel > 75) {
    result = {
      type: 'Starker Lärm',
      confidence: 55,
      emoji: '📢',
      description: 'Lautes Geräusch - Quelle nicht eindeutig klassifizierbar',
      legalCategory: 'general_loud',
      severity: 'high'
    };
  }
  // Moderate noise
  else if (decibel > 55) {
    result = {
      type: 'Ruhestörung',
      confidence: 50,
      emoji: '🔊',
      description: 'Geräusch über Ruheschwelle',
      legalCategory: 'general',
      severity: 'medium'
    };
  }
  // Low noise
  else {
    result = {
      type: 'Leises Geräusch',
      confidence: 40,
      emoji: '🔉',
      description: 'Geräusch im normalen Bereich',
      legalCategory: 'minor',
      severity: 'low'
    };
  }

  return result;
};