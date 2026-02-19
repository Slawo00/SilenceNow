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

export const estimateFrequencyBands = (rms) => {
  const total = rms;
  return {
    bass: Math.random() * 0.4 * total,
    lowMid: Math.random() * 0.2 * total,
    mid: Math.random() * 0.2 * total,
    highMid: Math.random() * 0.1 * total,
    high: Math.random() * 0.1 * total,
  };
};

export const isBassDominant = (freqBands) => {
  const totalEnergy = Object.values(freqBands).reduce((sum, val) => sum + val, 0);
  return freqBands.bass / totalEnergy > 0.5;
};
