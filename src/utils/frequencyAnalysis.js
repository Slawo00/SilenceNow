/**
 * FREQUENCY ANALYSIS & NOISE SOURCE DETECTION
 * 
 * Implementiert deine Lösung 1: FREQUENZ-PROFIL + DÄMPFUNGS-MUSTER
 * Basis: Physik der Schalldämpfung durch Wände/Decken
 * 
 * PHYSIK:
 * - Hohe Frequenzen (>2000 Hz): -20-40 dB durch Wände
 * - Tiefe Frequenzen (20-250 Hz): -5-15 dB durch Wände
 * → Nachbar-Lärm = BASS-DOMINANT, Eigener Lärm = BALANCED
 */

/**
 * A-Weighting Filter für dBA Berechnung
 * Basiert auf ISO 61672-1 Standard
 */
export const calculateAWeighting = (frequency) => {
  const f = frequency;
  const f2 = f * f;
  const f4 = f2 * f2;
  
  const numerator = 12194 * 12194 * f4;
  const denominator = (f2 + 20.6 * 20.6) * 
                     Math.sqrt((f2 + 107.7 * 107.7) * (f2 + 737.9 * 737.9)) * 
                     (f2 + 12194 * 12194);
  
  const response = numerator / denominator;
  return 20 * Math.log10(response) + 2.0; // +2.0 für Normierung
};

/**
 * C-Weighting Filter für dBC Berechnung
 * Weniger Dämpfung bei tiefen Frequenzen als A-Weighting
 */
export const calculateCWeighting = (frequency) => {
  const f = frequency;
  const f2 = f * f;
  const f4 = f2 * f2;
  
  const numerator = 12194 * 12194 * f2;
  const denominator = (f2 + 20.6 * 20.6) * (f2 + 12194 * 12194);
  
  const response = numerator / denominator;
  return 20 * Math.log10(response) + 0.06; // +0.06 für Normierung
};

/**
 * FFT-basierte Frequenzanalyse mit Octave Bands
 * Teilt Audio in standardisierte Frequenzbänder auf
 */
export const analyzeFrequencySpectrum = (audioBuffer, sampleRate = 44100) => {
  // Einfache FFT-Implementierung für React Native
  const fftSize = Math.min(audioBuffer.length, 2048);
  const fftData = new Float32Array(fftSize);
  
  // Copy audio data (windowing würde hier helfen, aber MVP first)
  for (let i = 0; i < fftSize; i++) {
    fftData[i] = audioBuffer[i] || 0;
  }
  
  // Simplified DFT (für echte FFT würde man eine Library nutzen)
  const spectrum = [];
  for (let k = 0; k < fftSize / 2; k++) {
    const freq = (k * sampleRate) / fftSize;
    
    let real = 0;
    let imag = 0;
    for (let n = 0; n < fftSize; n++) {
      const angle = -2 * Math.PI * k * n / fftSize;
      real += fftData[n] * Math.cos(angle);
      imag += fftData[n] * Math.sin(angle);
    }
    
    const magnitude = Math.sqrt(real * real + imag * imag);
    spectrum.push({ frequency: freq, magnitude });
  }
  
  return spectrum;
};

/**
 * KERN-ALGORITHMUS: Octave Band Analysis
 * Teilt Spektrum in standardisierte Frequenzbänder
 */
export const calculateOctaveBands = (spectrum) => {
  const bands = {
    // Tiefe Frequenzen (Bass) - durchdringen Wände gut
    bass_31: { min: 22, max: 44, energy: 0 },      // 31.5 Hz Octave
    bass_63: { min: 44, max: 88, energy: 0 },      // 63 Hz Octave
    bass_125: { min: 88, max: 177, energy: 0 },    // 125 Hz Octave
    bass_250: { min: 177, max: 354, energy: 0 },   // 250 Hz Octave
    
    // Mittlere Frequenzen - teilweise gedämpft
    mid_500: { min: 354, max: 707, energy: 0 },    // 500 Hz Octave
    mid_1k: { min: 707, max: 1414, energy: 0 },    // 1 kHz Octave
    mid_2k: { min: 1414, max: 2828, energy: 0 },   // 2 kHz Octave
    
    // Hohe Frequenzen - stark gedämpft durch Wände
    high_4k: { min: 2828, max: 5656, energy: 0 },  // 4 kHz Octave
    high_8k: { min: 5656, max: 11314, energy: 0 }, // 8 kHz Octave
    high_16k: { min: 11314, max: 22000, energy: 0 } // 16 kHz Octave
  };
  
  // Energie pro Band berechnen
  spectrum.forEach(({ frequency, magnitude }) => {
    Object.keys(bands).forEach(bandName => {
      const band = bands[bandName];
      if (frequency >= band.min && frequency < band.max) {
        band.energy += magnitude * magnitude; // Power = magnitude²
      }
    });
  });
  
  return bands;
};

/**
 * dBA vs dBC Differenz-Analyse
 * BREAKTHROUGH aus NIOSH SLM & Decibel X Apps!
 */
export const calculateDbADbCDifference = (octaveBands) => {
  let totalEnergyA = 0;
  let totalEnergyC = 0;
  
  Object.entries(octaveBands).forEach(([bandName, band]) => {
    // Center frequency für jedes Band
    const centerFreq = Math.sqrt(band.min * band.max);
    
    // A- und C-Weighting anwenden
    const aWeight = Math.pow(10, calculateAWeighting(centerFreq) / 20);
    const cWeight = Math.pow(10, calculateCWeighting(centerFreq) / 20);
    
    totalEnergyA += band.energy * aWeight * aWeight;
    totalEnergyC += band.energy * cWeight * cWeight;
  });
  
  const dBA = 20 * Math.log10(Math.sqrt(totalEnergyA));
  const dBC = 20 * Math.log10(Math.sqrt(totalEnergyC));
  
  return {
    dBA: Math.round(dBA * 10) / 10,
    dBC: Math.round(dBC * 10) / 10,
    difference: Math.round((dBC - dBA) * 10) / 10
  };
};

/**
 * HAUPT-ALGORITHMUS: Noise Source Detection
 * 
 * KRITERIEN:
 * 1. Bass-Dominanz (>60% Energie in 31-250 Hz)
 * 2. High-Frequency Absence (<10% Energie >2 kHz)
 * 3. dBC-dBA Differenz (>10 dB = Bass-dominant)
 * 4. "Muffled" Signature (Bass >> Mid >> High)
 */
export const detectNoiseSource = (octaveBands, dbAnalysis = null) => {
  // Gesamt-Energie berechnen
  const totalEnergy = Object.values(octaveBands)
    .reduce((sum, band) => sum + band.energy, 0);
  
  if (totalEnergy === 0) {
    return {
      source: 'SILENCE',
      confidence: 0.0,
      reason: 'No audio energy detected'
    };
  }
  
  // Bass-Energie (31-250 Hz)
  const bassEnergy = octaveBands.bass_31.energy + 
                     octaveBands.bass_63.energy + 
                     octaveBands.bass_125.energy + 
                     octaveBands.bass_250.energy;
  
  // Mid-Energie (500 Hz - 2 kHz)  
  const midEnergy = octaveBands.mid_500.energy + 
                    octaveBands.mid_1k.energy + 
                    octaveBands.mid_2k.energy;
  
  // High-Energie (4-16 kHz)
  const highEnergy = octaveBands.high_4k.energy + 
                     octaveBands.high_8k.energy + 
                     octaveBands.high_16k.energy;
  
  // Relative Energieverteilung
  const bassRatio = bassEnergy / totalEnergy;
  const midRatio = midEnergy / totalEnergy;
  const highRatio = highEnergy / totalEnergy;
  
  // PATTERN-ERKENNUNG
  const isBassDominant = bassRatio > 0.6;           // >60% Bass
  const hasNoHighFreq = highRatio < 0.1;           // <10% High
  const isMuffled = (bassRatio > midRatio * 2) && 
                   (midRatio > highRatio * 2);     // Bass >> Mid >> High
  
  // dBC-dBA Analyse (wenn verfügbar)
  const hasHighDbDifference = dbAnalysis && (dbAnalysis.difference > 8);
  
  // DECISION LOGIC
  let source, confidence, reason;
  
  if (isBassDominant && hasNoHighFreq && isMuffled) {
    source = 'NEIGHBOR';
    confidence = 0.85;
    reason = `Bass-dominant (${Math.round(bassRatio*100)}%), high-freq damped (${Math.round(highRatio*100)}%) - typical wall/ceiling damping`;
    
    // Bonus confidence bei dBC-dBA Differenz
    if (hasHighDbDifference) {
      confidence = Math.min(0.95, confidence + 0.1);
      reason += `, dBC-dBA: ${dbAnalysis.difference} dB`;
    }
    
  } else if (bassRatio < 0.5 && highRatio > 0.15) {
    source = 'OWN_APARTMENT';
    confidence = 0.75;
    reason = `Balanced frequency profile (B:${Math.round(bassRatio*100)}%, H:${Math.round(highRatio*100)}%) - no wall damping`;
    
  } else {
    source = 'UNCERTAIN';
    confidence = 0.5;
    reason = `Ambiguous profile (B:${Math.round(bassRatio*100)}%, M:${Math.round(midRatio*100)}%, H:${Math.round(highRatio*100)}%)`;
  }
  
  return {
    source,
    confidence,
    reason,
    analysis: {
      bassRatio: Math.round(bassRatio * 1000) / 1000,
      midRatio: Math.round(midRatio * 1000) / 1000,
      highRatio: Math.round(highRatio * 1000) / 1000,
      isBassDominant,
      hasNoHighFreq,
      isMuffled,
      dbAnalysis
    }
  };
};

/**
 * COMPLETE AUDIO ANALYSIS PIPELINE
 * Kombiniert alle Analyseschritte
 */
export const performCompleteAudioAnalysis = (audioBuffer, sampleRate = 44100) => {
  // 1. FFT Spektrum
  const spectrum = analyzeFrequencySpectrum(audioBuffer, sampleRate);
  
  // 2. Octave Bands
  const octaveBands = calculateOctaveBands(spectrum);
  
  // 3. dBA/dBC Analysis
  const dbAnalysis = calculateDbADbCDifference(octaveBands);
  
  // 4. Source Detection
  const sourceDetection = detectNoiseSource(octaveBands, dbAnalysis);
  
  return {
    spectrum,
    octaveBands,
    dbAnalysis,
    sourceDetection,
    timestamp: Date.now()
  };
};