export const COLORS = {
  MIDNIGHT_BLUE: '#1A2332',
  SOFT_WHITE: '#F8F9FA',
  ELECTRIC_GREEN: '#00E676',
  WARM_GREY: '#9E9E9E',
  ERROR_RED: '#F44336',
  WARNING_AMBER: '#FFC107',
};

export const DEFAULTS = {
  THRESHOLD_DB: 55,
  SAMPLE_INTERVAL: 2000,
  EVENT_MIN_DURATION: 30000,       // 30 Sekunden Mindestdauer
  EVENT_MIN_DURATION_LOUD: 10000,  // 10 Sekunden bei >80 dB
  EVENT_MERGE_GAP: 180000,         // 3 Minuten Zusammenführungs-Lücke
  QUIET_BASELINE: 40,
  LOUD_THRESHOLD_DB: 80,           // Schwelle für "sehr laut"
};

export const NOISE_CATEGORIES = {
  MUSIK: { key: 'musik', label: 'Musik/Bass', emoji: '🎵', description: 'Musik oder Bass durch Wände/Decke', legalCategory: 'music', severity: 'medium' },
  HUND: { key: 'hund', label: 'Hund/Tier', emoji: '🐕', description: 'Hundebellen oder Tiergeräusche', legalCategory: 'pets', severity: 'medium' },
  TRITTSCHALL: { key: 'trittschall', label: 'Trittschall/Schritte', emoji: '👣', description: 'Schritte oder Trittgeräusche aus oberer Wohnung', legalCategory: 'footsteps', severity: 'medium' },
  GESCHREI: { key: 'geschrei', label: 'Geschrei/Streit', emoji: '🗣️', description: 'Lautes Geschrei oder Streitgespräch', legalCategory: 'voices', severity: 'high' },
  HANDWERK: { key: 'handwerk', label: 'Handwerk/Bohren', emoji: '🔨', description: 'Bohren, Hämmern oder Renovierungsarbeiten', legalCategory: 'construction', severity: 'high' },
  KINDER: { key: 'kinder', label: 'Kinder', emoji: '👶', description: 'Kindergeräusche (Spielen, Schreien, Rennen)', legalCategory: 'children', severity: 'low' },
  SONSTIGES: { key: 'sonstiges', label: 'Anderes', emoji: '❓', description: 'Nicht eindeutig klassifizierbarer Lärm', legalCategory: 'general', severity: 'medium' },
};

export const NEIGHBOR_THRESHOLDS = {
  AUTO_NEIGHBOR: 60,   // Score > 60: Auto "Nachbar"
  UNCONFIRMED: 30,     // Score 30-60: "Unbestätigt"
  DISCARD: 30,         // Score < 30: Nicht loggen
};

export const PRIVACY_CONSTANTS = {
  // Battery-optimized sampling rates
  BACKGROUND_SAMPLE_RATE: 5000,  // 5 seconds in background
  ACTIVE_SAMPLE_RATE: 1000,      // 1 second when active
  
  // Privacy thresholds
  MAX_BUFFER_SIZE: 100,           // Limit memory usage
  AUTO_CLEANUP_INTERVAL: 300000,  // 5 minutes
  
  // Legal compliance
  NO_AUDIO_STORAGE: true,         // NEVER store audio
  DSGVO_COMPLIANT: true,          // GDPR compliant
  SECTION_201_COMPLIANT: true,    // §201 StGB compliant
  
  // Event detection
  BASELINE_CALIBRATION_TIME: 30000, // 30 seconds to establish baseline
  EVENT_CONFIDENCE_THRESHOLD: 70,   // Minimum confidence for events
};

export const FREQ_BANDS = {
  BASS: [20, 250],
  LOW_MID: [250, 500],
  MID: [500, 2000],
  HIGH_MID: [2000, 4000],
  HIGH: [4000, 20000],
};
