/**
 * MOTION DETECTOR SERVICE
 * 
 * Implementiert deine Lösung 5: BEWEGUNGS-SENSOR-KORRELATION
 * Clever Hack: Korreliert Audio-Events mit Handy-Bewegung
 * 
 * LOGIK:
 * - Audio + Motion = Trittschall von oben (Nachbar geht)
 * - Audio ohne Motion = Musik/TV/Stimmen
 * - Motion ohne Audio = Handy bewegt, Audio irrelevant
 */

import { DeviceMotion } from 'expo-sensors';

class MotionDetector {
  constructor() {
    this.isMonitoring = false;
    this.motionHistory = [];
    this.motionThreshold = 0.1; // m/s² Schwellwert
    this.historyDuration = 30000; // 30 Sekunden History
    
    this.subscription = null;
  }
  
  /**
   * Startet Motion Monitoring
   */
  async startMonitoring() {
    if (this.isMonitoring) return;
    
    // DeviceMotion Verfügbarkeit prüfen
    const isAvailable = await DeviceMotion.isAvailableAsync();
    if (!isAvailable) {
      console.warn('⚠️ DeviceMotion not available');
      return false;
    }
    
    // Update Rate setzen (100ms = 10 Hz)
    DeviceMotion.setUpdateInterval(100);
    
    // Motion Listener starten
    this.subscription = DeviceMotion.addListener((motionData) => {
      this.processMotionData(motionData);
    });
    
    this.isMonitoring = true;
    console.log('📱 Motion monitoring started');
    return true;
  }
  
  /**
   * Stoppt Motion Monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    
    this.isMonitoring = false;
    this.motionHistory = [];
    console.log('📱 Motion monitoring stopped');
  }
  
  /**
   * Verarbeitet Motion Data vom Sensor
   */
  processMotionData(motionData) {
    const now = Date.now();
    const { acceleration } = motionData;
    
    if (!acceleration) return;
    
    // Total Acceleration berechnen (Vektor-Magnitude)
    const totalAccel = Math.sqrt(
      acceleration.x * acceleration.x +
      acceleration.y * acceleration.y +
      acceleration.z * acceleration.z
    );
    
    // Motion Event erstellen
    const motionEvent = {
      timestamp: now,
      acceleration: {
        x: Math.round(acceleration.x * 1000) / 1000,
        y: Math.round(acceleration.y * 1000) / 1000,
        z: Math.round(acceleration.z * 1000) / 1000,
        total: Math.round(totalAccel * 1000) / 1000
      },
      isSignificant: totalAccel > this.motionThreshold
    };
    
    // Zur History hinzufügen
    this.motionHistory.push(motionEvent);
    
    // Alte Events entfernen (nur letzten 30 Sekunden behalten)
    this.cleanupHistory(now);
  }
  
  /**
   * Entfernt alte Motion Events aus History
   */
  cleanupHistory(currentTime) {
    const cutoffTime = currentTime - this.historyDuration;
    this.motionHistory = this.motionHistory.filter(
      event => event.timestamp > cutoffTime
    );
  }
  
  /**
   * KERN-FUNKTION: Motion-Audio Korrelation
   * Analysiert ob Audio-Event mit Handy-Bewegung korreliert
   */
  analyzeMotionCorrelation(audioEventTimestamp, windowMs = 5000) {
    const startTime = audioEventTimestamp - windowMs;
    const endTime = audioEventTimestamp + windowMs;
    
    // Motion Events im Zeitfenster finden
    const relevantMotions = this.motionHistory.filter(
      motion => motion.timestamp >= startTime && motion.timestamp <= endTime
    );
    
    if (relevantMotions.length === 0) {
      return {
        hasMotion: false,
        motionIntensity: 0,
        motionCount: 0,
        correlation: 'AUDIO_ONLY',
        confidence: 0.8,
        reason: 'No phone movement detected - likely external noise or own voices'
      };
    }
    
    // Signifikante Motion Events zählen
    const significantMotions = relevantMotions.filter(m => m.isSignificant);
    const maxAcceleration = Math.max(...relevantMotions.map(m => m.acceleration.total));
    const avgAcceleration = relevantMotions.reduce((sum, m) => sum + m.acceleration.total, 0) / relevantMotions.length;
    
    // Korrelations-Analyse
    let correlation, confidence, reason;
    
    if (significantMotions.length >= 3 && maxAcceleration > 0.5) {
      // Starke Bewegung + Audio = wahrscheinlich Trittschall
      correlation = 'FOOTSTEPS_ABOVE';
      confidence = 0.9;
      reason = `Strong motion detected (${significantMotions.length} events, max: ${Math.round(maxAcceleration*1000)/1000} m/s²) - likely footsteps from upstairs neighbor`;
      
    } else if (significantMotions.length >= 1 && maxAcceleration > 0.2) {
      // Moderate Bewegung + Audio = möglicherweise Möbelrücken
      correlation = 'FURNITURE_MOVING';
      confidence = 0.75;
      reason = `Moderate motion detected (${significantMotions.length} events, max: ${Math.round(maxAcceleration*1000)/1000} m/s²) - possibly furniture being moved`;
      
    } else {
      // Schwache Bewegung + Audio = wahrscheinlich nicht korreliert
      correlation = 'AUDIO_MOTION_WEAK';
      confidence = 0.6;
      reason = `Weak motion detected (avg: ${Math.round(avgAcceleration*1000)/1000} m/s²) - audio and motion likely unrelated`;
    }
    
    return {
      hasMotion: true,
      motionIntensity: Math.round(maxAcceleration * 1000) / 1000,
      motionCount: significantMotions.length,
      correlation,
      confidence,
      reason,
      details: {
        totalEvents: relevantMotions.length,
        significantEvents: significantMotions.length,
        maxAcceleration: Math.round(maxAcceleration * 1000) / 1000,
        avgAcceleration: Math.round(avgAcceleration * 1000) / 1000,
        timeWindow: windowMs
      }
    };
  }
  
  /**
   * Gibt aktuelle Motion Statistics zurück
   */
  getMotionStatistics() {
    const now = Date.now();
    const recentMotions = this.motionHistory.filter(
      motion => motion.timestamp > (now - 60000) // Letzten 60 Sekunden
    );
    
    if (recentMotions.length === 0) {
      return {
        isActive: false,
        recentEvents: 0,
        avgAcceleration: 0,
        maxAcceleration: 0
      };
    }
    
    const significantMotions = recentMotions.filter(m => m.isSignificant);
    const avgAcceleration = recentMotions.reduce((sum, m) => sum + m.acceleration.total, 0) / recentMotions.length;
    const maxAcceleration = Math.max(...recentMotions.map(m => m.acceleration.total));
    
    return {
      isActive: this.isMonitoring,
      recentEvents: recentMotions.length,
      significantEvents: significantMotions.length,
      avgAcceleration: Math.round(avgAcceleration * 1000) / 1000,
      maxAcceleration: Math.round(maxAcceleration * 1000) / 1000,
      historySize: this.motionHistory.length
    };
  }
  
  /**
   * Setzt Motion Threshold (Sensitivität)
   */
  setMotionThreshold(threshold) {
    this.motionThreshold = Math.max(0.05, Math.min(1.0, threshold));
    console.log(`📱 Motion threshold set to ${this.motionThreshold} m/s²`);
  }
}

// Singleton Instance
export default new MotionDetector();