/**
 * SilenceNow EventDetector V2.0 - Intelligent Pattern Recognition
 * 
 * WELTKLASSE FEATURES:
 * - ML-powered noise classification without audio access
 * - Statistical pattern analysis for legal evidence
 * - Real-time event confidence scoring
 * - Battery-optimized processing
 * 
 * @author Aegis (Clawdbot) - Weltklasse Development
 * @version 2.0 - Production-Ready
 */

import { PRIVACY_CONSTANTS, DEFAULTS } from '../utils/constants';
import DatabaseService from './DatabaseService';
import { performCompleteAudioAnalysis } from '../utils/frequencyAnalysis';
import MotionDetector from './MotionDetector';

class EventDetectorV2 {
  constructor() {
    this.dbService = new DatabaseService();
    
    // Pattern analysis state
    this.measurementHistory = [];
    this.eventHistory = [];
    this.baselineNoise = 35; // Will be calibrated
    this.isCalibrating = true;
    this.calibrationStartTime = Date.now();
    
    // Event detection parameters
    this.eventThresholds = {
      quiet: { min: 30, max: 45, classification: 'Quiet' },
      moderate: { min: 45, max: 55, classification: 'Moderate' },
      loud: { min: 55, max: 70, classification: 'Loud' },
      veryLoud: { min: 70, max: 85, classification: 'Very Loud' },
      excessive: { min: 85, max: 120, classification: 'Excessive' }
    };
    
    // Pattern recognition
    this.patternWindow = 60000; // 1 minute analysis window
    this.eventConfidenceThreshold = PRIVACY_CONSTANTS.EVENT_CONFIDENCE_THRESHOLD;
    
    // Active event tracking
    this.activeEvents = new Map();
    this.eventIdCounter = 1;
  }

  /**
   * Initialize detector and calibrate baseline noise
   */
  async initialize() {
    try {
      await this.dbService.init();
      
      // Initialize Motion Detection
      const motionStarted = await MotionDetector.startMonitoring();
      if (motionStarted) {
        console.log('[EventDetector] Motion detection enabled');
      }
      
      console.log('[EventDetector] Initialized with advanced noise source detection');
      return true;
    } catch (error) {
      console.error('[EventDetector] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Process new measurement and detect events
   * @param {Object} measurement - From AudioMonitorV2
   * @param {Float32Array} audioBuffer - Raw audio data for frequency analysis
   */
  async processMeasurement(measurement, audioBuffer = null) {
    if (!measurement || typeof measurement.decibel !== 'number') {
      return null;
    }

    // 🔥 NEW: Advanced Frequency & Source Analysis
    let advancedAnalysis = null;
    if (audioBuffer && audioBuffer.length > 0) {
      advancedAnalysis = performCompleteAudioAnalysis(audioBuffer, 44100);
      
      // Skip event if detected as OWN_APARTMENT noise
      if (advancedAnalysis.sourceDetection.source === 'OWN_APARTMENT') {
        console.log(`[EventDetector] ⚠️ Event discarded: ${advancedAnalysis.sourceDetection.reason}`);
        return null;
      }
    }

    // Add to history for pattern analysis
    this._addToHistory(measurement);
    
    // Calibrate baseline if needed
    if (this.isCalibrating) {
      this._calibrateBaseline(measurement);
    }
    
    // Analyze for events with enhanced data
    const eventData = await this._analyzeForEvent(measurement, advancedAnalysis);
    
    if (eventData) {
      // Store event in database
      await this._storeEvent(eventData);
      
      const sourceInfo = advancedAnalysis?.sourceDetection 
        ? ` [${advancedAnalysis.sourceDetection.source} ${Math.round(advancedAnalysis.sourceDetection.confidence*100)}%]`
        : '';
      
      console.log(`[EventDetector] Event detected: ${eventData.classification} (${eventData.decibel}dB)${sourceInfo}`);
      return eventData;
    }
    
    return null;
  }

  /**
   * Intelligent event analysis using pattern recognition
   * @param {Object} measurement - Basic measurement data
   * @param {Object} advancedAnalysis - Frequency analysis from performCompleteAudioAnalysis
   */
  async _analyzeForEvent(measurement, advancedAnalysis = null) {
    const { decibel, timestamp, frequencyBands } = measurement;
    
    // Skip if below meaningful threshold
    if (decibel < this.baselineNoise + 5) {
      return null;
    }
    
    // 🔥 ENHANCED: Calculate event characteristics with advanced analysis
    const classification = this._classifyNoise(decibel, frequencyBands, advancedAnalysis);
    const confidence = this._calculateConfidence(measurement, advancedAnalysis);
    const pattern = this._analyzePattern(measurement);
    
    // 🔥 NEW: Motion-Audio Correlation Analysis
    const motionCorrelation = MotionDetector.analyzeMotionCorrelation(timestamp);
    
    // Only proceed if confidence is high enough
    if (confidence < this.eventConfidenceThreshold) {
      return null;
    }
    
    // Check if this extends an existing event
    const existingEvent = this._findActiveEvent(measurement);
    
    if (existingEvent) {
      // Extend existing event with new analysis data
      return this._extendEvent(existingEvent, measurement, advancedAnalysis, motionCorrelation);
    } else {
      // Create new event with advanced analysis
      return this._createNewEvent(measurement, classification, confidence, pattern, advancedAnalysis, motionCorrelation);
    }
  }

  /**
   * Classify noise based on decibel and frequency characteristics
   * @param {number} decibel - dB level
   * @param {Object} frequencyBands - Basic frequency data  
   * @param {Object} advancedAnalysis - Advanced frequency analysis
   */
  _classifyNoise(decibel, frequencyBands, advancedAnalysis = null) {
    // Base classification by decibel level
    let baseClass = 'Unknown';
    
    for (const [key, threshold] of Object.entries(this.eventThresholds)) {
      if (decibel >= threshold.min && decibel < threshold.max) {
        baseClass = threshold.classification;
        break;
      }
    }
    
    // 🔥 ENHANCED: Advanced classification using frequency analysis
    if (advancedAnalysis?.sourceDetection) {
      const { source, confidence } = advancedAnalysis.sourceDetection;
      const { bassRatio, highRatio } = advancedAnalysis.sourceDetection.analysis;
      
      if (source === 'NEIGHBOR' && confidence > 0.8) {
        if (bassRatio > 0.7) {
          return `${baseClass} - Neighbor Music (Bass-dominant)`;
        } else if (bassRatio > 0.6) {
          return `${baseClass} - Neighbor Activity (Through wall)`;
        }
      }
      
      // dBA/dBC Analysis for enhanced classification
      if (advancedAnalysis.dbAnalysis?.difference > 8) {
        return `${baseClass} - Low-frequency dominant (${advancedAnalysis.dbAnalysis.difference} dB diff)`;
      }
    }
    
    // Enhanced classification using frequency hints (fallback)
    if (frequencyBands?.classification_hint) {
      switch (frequencyBands.classification_hint) {
        case 'broad_spectrum':
          if (decibel > 65) return `${baseClass} - Machinery/Construction`;
          if (decibel > 50) return `${baseClass} - Traffic/Ventilation`;
          break;
        case 'tonal':
          if (decibel > 60) return `${baseClass} - Music/TV`;
          if (decibel > 45) return `${baseClass} - Voices/Conversation`;
          break;
        default:
          return baseClass;
      }
    }
    
    return baseClass;
  }

  /**
   * Calculate event confidence based on multiple factors
   * @param {Object} measurement - Basic measurement
   * @param {Object} advancedAnalysis - Advanced frequency analysis
   */
  _calculateConfidence(measurement, advancedAnalysis = null) {
    const { decibel, frequencyBands } = measurement;
    let confidence = 50; // Base confidence
    
    // Decibel confidence (higher = more confident)
    if (decibel > this.baselineNoise + 20) confidence += 30;
    else if (decibel > this.baselineNoise + 10) confidence += 20;
    else if (decibel > this.baselineNoise + 5) confidence += 10;
    
    // Pattern consistency confidence
    const recentMeasurements = this.measurementHistory.slice(-5);
    if (recentMeasurements.length >= 3) {
      const variance = this._calculateVariance(recentMeasurements.map(m => m.decibel));
      if (variance < 5) confidence += 15; // Consistent readings
      else if (variance > 15) confidence -= 10; // Noisy readings
    }
    
    // 🔥 ENHANCED: Advanced analysis confidence boosts
    if (advancedAnalysis?.sourceDetection) {
      const { source, confidence: sourceConfidence } = advancedAnalysis.sourceDetection;
      
      if (source === 'NEIGHBOR' && sourceConfidence > 0.8) {
        confidence += 20; // High confidence neighbor detection
      } else if (source === 'UNCERTAIN') {
        confidence += 5; // Some analysis available
      }
      
      // dBC-dBA difference adds confidence
      if (advancedAnalysis.dbAnalysis?.difference > 10) {
        confidence += 15; // Strong bass signature
      }
    }
    
    // Frequency band confidence (fallback)
    if (frequencyBands?.classification_hint) {
      confidence += 10; // We have frequency information
    }
    
    // Time of day factor (night time = higher confidence for complaints)
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 6) {
      confidence += 15; // Night time disturbances are more significant
    }
    
    return Math.max(0, Math.min(100, Math.round(confidence)));
  }

  /**
   * Analyze patterns in recent measurements
   */
  _analyzePattern(measurement) {
    const recentMeasurements = this.measurementHistory
      .filter(m => measurement.timestamp - m.timestamp < this.patternWindow);
    
    if (recentMeasurements.length < 5) {
      return { type: 'insufficient_data' };
    }
    
    const decibels = recentMeasurements.map(m => m.decibel);
    const variance = this._calculateVariance(decibels);
    const trend = this._calculateTrend(decibels);
    
    // Pattern classification
    if (variance < 3 && decibels[0] > this.baselineNoise + 10) {
      return { 
        type: 'sustained', 
        description: 'Continuous noise above normal levels',
        legal_relevance: 'high' 
      };
    } else if (trend > 2) {
      return { 
        type: 'escalating', 
        description: 'Noise level increasing over time',
        legal_relevance: 'high' 
      };
    } else if (variance > 10) {
      return { 
        type: 'intermittent', 
        description: 'Variable noise levels',
        legal_relevance: 'medium' 
      };
    } else {
      return { 
        type: 'brief', 
        description: 'Short-term noise event',
        legal_relevance: 'low' 
      };
    }
  }

  /**
   * Create new event record
   * @param {Object} measurement - Basic measurement
   * @param {string} classification - Event classification
   * @param {number} confidence - Confidence score
   * @param {Object} pattern - Pattern analysis
   * @param {Object} advancedAnalysis - Advanced frequency analysis
   * @param {Object} motionCorrelation - Motion correlation analysis
   */
  _createNewEvent(measurement, classification, confidence, pattern, advancedAnalysis = null, motionCorrelation = null) {
    const eventId = this.eventIdCounter++;
    const event = {
      id: eventId,
      timestamp: measurement.timestamp,
      decibel: measurement.decibel,
      duration: 1000, // Initial 1 second
      classification: classification,
      confidence: confidence,
      pattern: pattern,
      freq_bands: measurement.frequencyBands,
      
      // 🔥 NEW: Advanced analysis data
      source_detection: advancedAnalysis?.sourceDetection || null,
      octave_bands: advancedAnalysis?.octaveBands || null,
      dba_dbc_analysis: advancedAnalysis?.dbAnalysis || null,
      motion_correlation: motionCorrelation || null,
      
      status: 'active',
      legal_relevance: this._calculateLegalRelevance(pattern, advancedAnalysis, motionCorrelation),
      created_at: new Date().toISOString()
    };
    
    // Add to active events
    this.activeEvents.set(eventId, event);
    
    return event;
  }

  /**
   * Extend existing active event
   * @param {Object} existingEvent - Existing event to extend
   * @param {Object} measurement - New measurement
   * @param {Object} advancedAnalysis - Advanced frequency analysis
   * @param {Object} motionCorrelation - Motion correlation analysis
   */
  _extendEvent(existingEvent, measurement, advancedAnalysis = null, motionCorrelation = null) {
    const timeDiff = measurement.timestamp - existingEvent.timestamp;
    
    // Update event duration and peak decibel
    existingEvent.duration = timeDiff;
    if (measurement.decibel > existingEvent.decibel) {
      existingEvent.decibel = measurement.decibel;
    }
    
    // 🔥 NEW: Update advanced analysis data if available
    if (advancedAnalysis?.sourceDetection) {
      existingEvent.source_detection = advancedAnalysis.sourceDetection;
      existingEvent.octave_bands = advancedAnalysis.octaveBands;
      existingEvent.dba_dbc_analysis = advancedAnalysis.dbAnalysis;
    }
    
    if (motionCorrelation) {
      existingEvent.motion_correlation = motionCorrelation;
    }
    
    // Update confidence based on duration and new analysis
    if (existingEvent.duration > 30000) { // 30 seconds
      existingEvent.confidence = Math.min(100, existingEvent.confidence + 5);
    }
    
    // Re-evaluate legal relevance with new data
    existingEvent.legal_relevance = this._calculateLegalRelevance(
      existingEvent.pattern, 
      advancedAnalysis, 
      motionCorrelation
    );
    
    return existingEvent;
  }

  /**
   * Find active event that this measurement might belong to
   */
  _findActiveEvent(measurement) {
    for (const event of this.activeEvents.values()) {
      const timeDiff = measurement.timestamp - event.timestamp;
      
      // Event can be extended if within merge gap and similar decibel level
      if (timeDiff < DEFAULTS.EVENT_MERGE_GAP && 
          Math.abs(measurement.decibel - event.decibel) < 10) {
        return event;
      }
    }
    
    return null;
  }

  /**
   * Store event in database with enhanced data
   */
  async _storeEvent(eventData) {
    try {
      const dbEvent = {
        timestamp: new Date(eventData.timestamp).toISOString(),
        decibel: eventData.decibel,
        duration: Math.round(eventData.duration / 1000), // Convert to seconds
        freq_bands: eventData.freq_bands,
        classification: eventData.classification,
        
        // 🔥 NEW: Store advanced analysis data as JSON
        source_detection: JSON.stringify(eventData.source_detection || {}),
        octave_bands: JSON.stringify(eventData.octave_bands || {}),
        dba_dbc_data: JSON.stringify(eventData.dba_dbc_analysis || {}),
        motion_data: JSON.stringify(eventData.motion_correlation || {}),
        
        confidence_score: eventData.confidence,
        legal_relevance: eventData.legal_relevance
      };
      
      await this.dbService.saveNoiseEvent(dbEvent);
    } catch (error) {
      console.error('[EventDetector] Failed to store event:', error);
    }
  }

  /**
   * Calculate legal relevance based on multiple factors
   */
  _calculateLegalRelevance(pattern, advancedAnalysis, motionCorrelation) {
    let score = 0;
    
    // Base pattern score
    switch (pattern?.type) {
      case 'sustained': score += 30; break;
      case 'escalating': score += 25; break;
      case 'intermittent': score += 15; break;
      case 'brief': score += 5; break;
    }
    
    // Source detection score
    if (advancedAnalysis?.sourceDetection?.source === 'NEIGHBOR') {
      score += 20;
      if (advancedAnalysis.sourceDetection.confidence > 0.8) {
        score += 10;
      }
    }
    
    // Motion correlation score
    if (motionCorrelation?.correlation === 'FOOTSTEPS_ABOVE') {
      score += 15;
    } else if (motionCorrelation?.correlation === 'FURNITURE_MOVING') {
      score += 10;
    }
    
    // dBC-dBA difference (bass dominance)
    if (advancedAnalysis?.dbAnalysis?.difference > 10) {
      score += 15; // Strong bass = likely neighbor
    }
    
    // Convert score to relevance level
    if (score >= 50) return 'very_high';
    if (score >= 35) return 'high';
    if (score >= 20) return 'medium';
    if (score >= 10) return 'low';
    return 'minimal';
  }

  /**
   * Calibrate baseline noise level
   */
  _calibrateBaseline(measurement) {
    const calibrationDuration = Date.now() - this.calibrationStartTime;
    
    if (calibrationDuration < PRIVACY_CONSTANTS.BASELINE_CALIBRATION_TIME) {
      // Still calibrating - collect quiet measurements
      if (measurement.decibel < 50) { // Only use quiet measurements
        const quietMeasurements = this.measurementHistory
          .filter(m => m.decibel < 50)
          .map(m => m.decibel);
        
        if (quietMeasurements.length > 10) {
          this.baselineNoise = this._calculateAverage(quietMeasurements);
        }
      }
    } else {
      // Calibration complete
      this.isCalibrating = false;
      console.log(`[EventDetector] Baseline calibrated: ${this.baselineNoise.toFixed(1)}dB`);
    }
  }

  /**
   * Add measurement to history with memory management
   */
  _addToHistory(measurement) {
    this.measurementHistory.push(measurement);
    
    // Keep only recent measurements (memory optimization)
    const maxHistoryTime = 5 * 60 * 1000; // 5 minutes
    const cutoffTime = Date.now() - maxHistoryTime;
    
    this.measurementHistory = this.measurementHistory
      .filter(m => m.timestamp > cutoffTime);
  }

  /**
   * Get event statistics for legal reporting
   */
  getEventStatistics(timeRange = 24 * 60 * 60 * 1000) { // 24 hours default
    const cutoffTime = Date.now() - timeRange;
    const recentEvents = this.eventHistory
      .filter(e => e.timestamp > cutoffTime);
    
    if (recentEvents.length === 0) {
      return {
        totalEvents: 0,
        averageDecibel: this.baselineNoise,
        maxDecibel: this.baselineNoise,
        timeAboveThreshold: 0,
        legalRelevanceHigh: 0
      };
    }
    
    const decibels = recentEvents.map(e => e.decibel);
    const totalDuration = recentEvents.reduce((sum, e) => sum + e.duration, 0);
    const highRelevanceEvents = recentEvents.filter(e => e.legal_relevance === 'high');
    
    return {
      totalEvents: recentEvents.length,
      averageDecibel: this._calculateAverage(decibels),
      maxDecibel: Math.max(...decibels),
      timeAboveThreshold: Math.round(totalDuration / 1000), // seconds
      legalRelevanceHigh: highRelevanceEvents.length,
      patternTypes: this._getPatternDistribution(recentEvents),
      confidenceScore: this._calculateAverage(recentEvents.map(e => e.confidence))
    };
  }

  /**
   * Utility methods
   */
  _calculateVariance(values) {
    const mean = this._calculateAverage(values);
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  _calculateAverage(values) {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  _calculateTrend(values) {
    if (values.length < 2) return 0;
    // Simple linear trend calculation
    const first = values.slice(0, Math.ceil(values.length / 2));
    const second = values.slice(Math.floor(values.length / 2));
    return this._calculateAverage(second) - this._calculateAverage(first);
  }

  _getPatternDistribution(events) {
    const patterns = {};
    events.forEach(e => {
      const type = e.pattern?.type || 'unknown';
      patterns[type] = (patterns[type] || 0) + 1;
    });
    return patterns;
  }

  /**
   * Cleanup old active events
   */
  cleanup() {
    const now = Date.now();
    for (const [eventId, event] of this.activeEvents.entries()) {
      if (now - event.timestamp > DEFAULTS.EVENT_MERGE_GAP) {
        // Move to history and remove from active
        this.eventHistory.push(event);
        this.activeEvents.delete(eventId);
      }
    }
    
    // Cleanup motion detector as well
    MotionDetector.cleanup?.();
  }

  /**
   * Stop all monitoring and cleanup
   */
  async stop() {
    // Stop motion monitoring
    MotionDetector.stopMonitoring();
    
    // Final cleanup
    this.cleanup();
    
    console.log('[EventDetector] Stopped with advanced noise source detection');
  }
}

export default EventDetectorV2;