/**
 * SilenceNow Brand Identity - "Quiet Justice"
 * Basierend auf Marketing Dokument: Ruhig • Bestimmt • Präzise • Vertrauenswürdig • Empowernd
 */

export const BRAND_COLORS = {
  // Primary Brand Colors - "Quiet Justice"
  SILENCE_BLUE: '#1B2951',        // Deep, trustworthy blue - main brand
  JUSTICE_GREEN: '#00C853',       // Empowering green - success, action
  QUIET_SILVER: '#F5F7FA',       // Calm, clean background
  
  // Supporting Colors
  EVIDENCE_GOLD: '#FFB300',       // Legal evidence, important alerts
  VIOLATION_RED: '#D32F2F',       // Violations, urgent issues
  PEACE_WHITE: '#FFFFFF',         // Pure, clean, peaceful
  
  // Greys for hierarchy
  TEXT_PRIMARY: '#1B2951',        // Same as Silence Blue
  TEXT_SECONDARY: '#5A6C7D',      // Muted, professional
  TEXT_DISABLED: '#9E9E9E',       // Subtle, background info
  
  // Functional Colors
  BACKGROUND_PRIMARY: '#F5F7FA',   // Main app background
  BACKGROUND_CARD: '#FFFFFF',      // Card backgrounds
  BORDER_LIGHT: '#E1E8ED',        // Subtle borders
  BORDER_MEDIUM: '#C1CBD6',       // More defined borders
  
  // Status Colors (Legal Context)
  LEGAL_STRONG: '#00C853',        // Strong legal position
  LEGAL_MODERATE: '#FF9800',      // Moderate legal position  
  LEGAL_WEAK: '#757575',          // Weak legal position
  LEGAL_URGENT: '#D32F2F',        // Urgent legal action needed
  
  // App States
  ACTIVE_STATE: '#00C853',        // When monitoring/recording
  INACTIVE_STATE: '#9E9E9E',      // When paused/stopped
  WARNING_STATE: '#FFB300',       // Attention needed
  DANGER_STATE: '#D32F2F',        // Critical issues
};

export const BRAND_TYPOGRAPHY = {
  // Font Family (using system fonts for performance)
  PRIMARY_FONT: 'System',
  SECONDARY_FONT: 'System',
  
  // Font Sizes - Based on "Quiet Justice" personality
  HERO_SIZE: 32,          // Big statements, legal power
  TITLE_SIZE: 24,         // Section titles
  SUBTITLE_SIZE: 18,      // Important secondary info
  BODY_SIZE: 16,          // Main content
  CAPTION_SIZE: 14,       // Supporting text
  SMALL_SIZE: 12,         // Fine print, legal disclaimers
  
  // Font Weights
  BOLD: 'bold',           // Strong statements, legal terms
  SEMIBOLD: '600',        // Important information
  REGULAR: 'normal',      // Body text
  LIGHT: '300',           // Subtle information
};

export const BRAND_SPACING = {
  // Consistent spacing system
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
  
  // Specific use cases
  CARD_PADDING: 16,
  SCREEN_PADDING: 20,
  BUTTON_PADDING_V: 14,
  BUTTON_PADDING_H: 24,
};

export const BRAND_RADIUS = {
  SMALL: 8,     // Buttons, small cards
  MEDIUM: 12,   // Main cards, inputs
  LARGE: 16,    // Hero cards, important sections
  FULL: 9999,   // Circular elements
};

export const BRAND_SHADOWS = {
  LIGHT: {
    shadowColor: BRAND_COLORS.TEXT_PRIMARY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  MEDIUM: {
    shadowColor: BRAND_COLORS.TEXT_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  STRONG: {
    shadowColor: BRAND_COLORS.TEXT_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
};

// Brand Messaging - Key phrases for UI
export const BRAND_MESSAGES = {
  HERO_MESSAGE: "Dein Recht besteht bereits.\nDu brauchst nur den Beweis.",
  EMPOWERMENT: "Endlich schlafen • Kontrolle zurück • Nicht mehr hilflos",
  LEGAL_CONFIDENCE: "Gerichtsfeste Beweise • Automatisch • Rechtssicher",
  PRIVACY_FIRST: "Kein Audio gespeichert • DSGVO-konform • §201-StGB-sicher",
  
  // Action-oriented messages
  START_MONITORING: "Beginne jetzt deine Beweissammlung",
  EVIDENCE_BUILDING: "Sammle automatisch gerichtsfeste Beweise",
  LEGAL_READY: "Bereit für Mietminderung",
  JUSTICE_SERVED: "Dein Recht durchgesetzt",
};

// Brand Personality Traits for UI Behavior
export const BRAND_PERSONALITY = {
  TONE: 'confident_calm',        // Confident but not aggressive
  VOICE: 'empowering_expert',    // Expert knowledge, empowering user
  APPROACH: 'solution_focused',   // Always focus on solutions, not just problems
  COMPLEXITY: 'simple_powerful',  // Simple interface, powerful results
};

export default {
  COLORS: BRAND_COLORS,
  TYPOGRAPHY: BRAND_TYPOGRAPHY,
  SPACING: BRAND_SPACING,
  RADIUS: BRAND_RADIUS,
  SHADOWS: BRAND_SHADOWS,
  MESSAGES: BRAND_MESSAGES,
  PERSONALITY: BRAND_PERSONALITY,
};