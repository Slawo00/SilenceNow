/**
 * SilenceNow Schema Service - Client-Side Intelligence
 * 
 * AUTONOMOUS SOLUTION: When server-side schema can't be updated,
 * we implement business logic client-side with graceful fallbacks
 */

class SchemaService {
  constructor() {
    this.hasExtendedSchema = false;
    this.businessLogicMode = 'CLIENT_SIDE'; // SERVER_SIDE when schema updated
  }

  /**
   * AUTONOMOUS SOLUTION: Calculate legal metrics client-side
   */
  enhanceNoiseEvent(baseEvent) {
    // Calculate what would normally be server-side columns
    const enhanced = {
      ...baseEvent,
      // Client-side business intelligence
      legal_score: this.calculateLegalScore(baseEvent),
      rent_reduction_potential: this.calculateRentReduction(baseEvent),
      is_nighttime_violation: this.isNighttimeViolation(baseEvent),
      violation_severity: this.getViolationSeverity(baseEvent),
      monthly_impact_estimate: this.estimateMonthlyImpact(baseEvent),
      legal_evidence_strength: this.assessEvidenceStrength(baseEvent)
    };

    return enhanced;
  }

  calculateLegalScore(event) {
    const { decibel, timestamp, duration = 60, classification } = event;
    const eventDate = new Date(timestamp);
    const hour = eventDate.getHours();
    
    let score = 0;
    
    // Base score from decibel level
    if (decibel >= 85) score += 40; // Excessive noise
    else if (decibel >= 70) score += 25; // Very loud
    else if (decibel >= 55) score += 15; // Loud
    else if (decibel >= 45) score += 10; // Moderate
    
    // Duration multiplier
    if (duration > 3600) score += 20; // >1 hour
    else if (duration > 1800) score += 15; // >30 min
    else if (duration > 600) score += 10; // >10 min
    else if (duration > 180) score += 5; // >3 min
    
    // Nighttime violations (22:00-06:00)
    if (hour >= 22 || hour <= 6) {
      score += 15;
    }
    
    // Weekend violations
    const dayOfWeek = eventDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      score += 5;
    }
    
    // Classification-based scoring
    if (classification?.includes('Music')) score += 5;
    if (classification?.includes('Machinery')) score += 10;
    if (classification?.includes('Excessive')) score += 15;
    
    return Math.min(100, Math.max(0, score));
  }

  calculateRentReduction(event) {
    const legalScore = this.calculateLegalScore(event);
    const isNighttime = this.isNighttimeViolation(event);
    
    let percentage = 0;
    
    // Base percentage from legal score
    if (legalScore > 80) percentage = 25;
    else if (legalScore > 70) percentage = 20;
    else if (legalScore > 60) percentage = 15;
    else if (legalScore > 50) percentage = 10;
    else if (legalScore > 30) percentage = 5;
    
    // Nighttime boost
    if (isNighttime) {
      percentage *= 1.3;
    }
    
    // Cap at reasonable maximum
    return Math.min(30, Math.round(percentage * 10) / 10);
  }

  isNighttimeViolation(event) {
    const hour = new Date(event.timestamp).getHours();
    return hour >= 22 || hour <= 6;
  }

  getViolationSeverity(event) {
    const legalScore = this.calculateLegalScore(event);
    
    if (legalScore > 80) return 'extreme';
    if (legalScore > 60) return 'severe';
    if (legalScore > 40) return 'moderate';
    return 'minor';
  }

  estimateMonthlyImpact(event) {
    const rentReduction = this.calculateRentReduction(event);
    const averageRent = 800; // Assumption
    return Math.round((rentReduction / 100) * averageRent);
  }

  assessEvidenceStrength(event) {
    const legalScore = this.calculateLegalScore(event);
    const duration = event.duration || 60;
    
    if (legalScore > 70 && duration > 600) return 'very_strong';
    if (legalScore > 50 && duration > 300) return 'strong';
    if (legalScore > 30) return 'moderate';
    return 'weak';
  }

  /**
   * Simulate server-side legal summary calculation
   */
  calculateLegalSummary(events, timeframe = '30d') {
    if (!events || events.length === 0) {
      return this.getEmptyLegalSummary();
    }

    // Enhance all events with business logic
    const enhancedEvents = events.map(event => this.enhanceNoiseEvent(event));
    
    const totalEvents = enhancedEvents.length;
    const nighttimeViolations = enhancedEvents.filter(e => e.is_nighttime_violation).length;
    const highSeverityEvents = enhancedEvents.filter(e => e.legal_score > 60).length;
    
    const averageScore = enhancedEvents.reduce((sum, e) => sum + e.legal_score, 0) / totalEvents;
    const maxRentReduction = Math.max(...enhancedEvents.map(e => e.rent_reduction_potential));
    const avgRentReduction = enhancedEvents.reduce((sum, e) => sum + e.rent_reduction_potential, 0) / totalEvents;
    
    const avgDecibel = enhancedEvents.reduce((sum, e) => sum + e.decibel, 0) / totalEvents;
    const maxDecibel = Math.max(...enhancedEvents.map(e => e.decibel));
    
    const monthlyRentReduction = Math.round(avgRentReduction * 8); // Assume 800€ rent
    
    return {
      timeframe,
      totalEvents,
      nighttimeViolations,
      highSeverityEvents,
      
      // Legal strength indicators
      averageLegalScore: Math.round(averageScore),
      strongEvidenceEvents: enhancedEvents.filter(e => 
        e.legal_evidence_strength === 'strong' || 
        e.legal_evidence_strength === 'very_strong'
      ).length,
      
      // Financial impact
      maxRentReduction: Math.round(maxRentReduction * 10) / 10,
      avgRentReduction: Math.round(avgRentReduction * 10) / 10,
      estimatedMonthlyReduction: monthlyRentReduction,
      
      // Technical data
      avgDecibel: Math.round(avgDecibel * 10) / 10,
      maxDecibel: Math.round(maxDecibel * 10) / 10,
      totalDisturbanceHours: enhancedEvents.reduce((sum, e) => sum + (e.duration || 60), 0) / 3600,
      
      // Legal recommendation
      legalRecommendation: this.getLegalRecommendation(averageScore, highSeverityEvents, totalEvents, nighttimeViolations),
      
      // Business value
      estimatedAnnualSavings: monthlyRentReduction * 12
    };
  }

  getLegalRecommendation(avgScore, highSeverityEvents, totalEvents, nighttimeViolations) {
    if (avgScore > 70 && highSeverityEvents > 3) {
      return {
        action: 'immediate_legal_action',
        confidence: 'high',
        description: 'Starke Beweislage für Mietminderung. Anwaltliche Beratung empfohlen.',
        estimatedSuccess: 85
      };
    } else if (avgScore > 50 && totalEvents > 10) {
      return {
        action: 'formal_complaint',
        confidence: 'good',
        description: 'Ausreichende Dokumentation für formelle Beschwerde beim Vermieter.',
        estimatedSuccess: 70
      };
    } else if (totalEvents > 5) {
      return {
        action: 'continue_monitoring',
        confidence: 'building',
        description: 'Weiter dokumentieren. Noch mehr Beweise für stärkere Position sammeln.',
        estimatedSuccess: 40
      };
    } else {
      return {
        action: 'initial_documentation',
        confidence: 'low',
        description: 'Erste Störungen dokumentiert. Weiter sammeln für vollständige Beweislage.',
        estimatedSuccess: 20
      };
    }
  }

  getEmptyLegalSummary() {
    return {
      totalEvents: 0,
      nighttimeViolations: 0,
      highSeverityEvents: 0,
      averageLegalScore: 0,
      maxRentReduction: 0,
      avgRentReduction: 0,
      estimatedMonthlyReduction: 0,
      avgDecibel: 0,
      maxDecibel: 0,
      totalDisturbanceHours: 0,
      legalRecommendation: {
        action: 'start_monitoring',
        confidence: 'none',
        description: 'Beginnen Sie mit der Dokumentation von Lärmstörungen.',
        estimatedSuccess: 0
      },
      estimatedAnnualSavings: 0
    };
  }

  /**
   * Simulate premium report generation
   */
  generateLegalReport(events, timeframe = '30d') {
    const summary = this.calculateLegalSummary(events, timeframe);
    const enhancedEvents = events.map(event => this.enhanceNoiseEvent(event));
    
    return {
      generatedAt: new Date().toISOString(),
      timeframe,
      summary,
      
      // Executive summary for lawyers
      executiveSummary: {
        totalDisturbances: summary.totalEvents,
        legalStrength: summary.averageLegalScore > 60 ? 'STRONG' : 'MODERATE',
        recommendedAction: summary.legalRecommendation.action,
        financialImpact: `${summary.estimatedMonthlyReduction}€/month potential reduction`
      },
      
      // Detailed evidence
      evidenceDetails: enhancedEvents.map(event => ({
        date: new Date(event.timestamp).toLocaleDateString('de-DE'),
        time: new Date(event.timestamp).toLocaleTimeString('de-DE'),
        decibel: event.decibel,
        duration: `${Math.round((event.duration || 60) / 60)} min`,
        classification: event.classification,
        legalScore: event.legal_score,
        rentReductionPotential: `${event.rent_reduction_potential}%`,
        nighttime: event.is_nighttime_violation ? 'Ja' : 'Nein',
        severity: event.violation_severity
      })),
      
      // Legal basis
      legalBasis: {
        lawReferences: [
          'BGB § 536 - Mietminderung bei Mangel der Mietsache',
          'BGB § 537 - Schadensersatz wegen eines Mangels',
          'TA Lärm - Technische Anleitung zum Schutz gegen Lärm'
        ],
        courtPrecedents: [
          'BGH VIII ZR 104/17 - Mietminderung bei Lärmbelästigung',
          'LG Berlin 67 S 81/19 - Nachbarschaftslärm als Mangel'
        ]
      }
    };
  }

  /**
   * Test if server-side schema is available
   */
  async detectSchemaCapabilities() {
    try {
      const response = await fetch('https://aawfwtwufqenrdzqfmgw.supabase.co/rest/v1/noise_events?select=legal_score&limit=1', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhd2Z3dHd1ZnFlbnJkenFmbWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NTUzMTMsImV4cCI6MjA4NzAzMTMxM30.OYAKNTOHdq1UD1HyOk5SZK7bJa1G_8WPEQv9ors8dU0'
        }
      });

      if (response.ok) {
        this.hasExtendedSchema = true;
        this.businessLogicMode = 'SERVER_SIDE';
        console.log('[Schema] Extended schema detected - using server-side business logic');
        return true;
      } else {
        this.hasExtendedSchema = false;
        this.businessLogicMode = 'CLIENT_SIDE';
        console.log('[Schema] Basic schema detected - using client-side business logic');
        return false;
      }
    } catch (error) {
      console.warn('[Schema] Schema detection failed, defaulting to client-side logic');
      this.hasExtendedSchema = false;
      this.businessLogicMode = 'CLIENT_SIDE';
      return false;
    }
  }
}

export default new SchemaService();