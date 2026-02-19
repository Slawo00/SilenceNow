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
  EVENT_MIN_DURATION: 10000,
  EVENT_MERGE_GAP: 30000,
  QUIET_BASELINE: 40,
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
