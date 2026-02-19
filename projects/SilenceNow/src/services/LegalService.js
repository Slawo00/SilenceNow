/**
 * LegalService V1.0 - §536 BGB Integration
 * Punkt 8: Rechtliche Bewertung für Mietminderung
 * 
 * FEATURES:
 * - §536 BGB Mietminderungsberechnung
 * - Rechtliche Bewertung basierend auf Gerichtsentscheidungen
 * - Automatische Mietminderungsschätzung
 * - Deutsche Rechtsprechung-Referenzen
 * - Empfehlungen für rechtliche Schritte
 * 
 * @version 1.0
 */

import DatabaseService from './DatabaseService';

// Deutsche Rechtsprechung zu Lärmbelästigung und Mietminderung
// Basierend auf echten Gerichtsurteilen
const COURT_DECISIONS = {
  // Musik/Bass
  music_loud: {
    reference: 'AG Hamburg, 46 C 108/04',
    reduction: 20, // 20% Mietminderung
    description: 'Regelmäßige laute Musik aus Nachbarwohnung'
  },
  music_bass_night: {
    reference: 'LG Berlin, 63 S 236/09',
    reduction: 25,
    description: 'Bass-Musik in Nachtruhezeiten'
  },
  
  // Baulärm
  construction_day: {
    reference: 'AG Schöneberg, 109 C 256/07',
    reduction: 15,
    description: 'Baulärm während normaler Arbeitszeiten'
  },
  construction_extended: {
    reference: 'LG München I, 31 S 20691/09',
    reduction: 30,
    description: 'Langanhaltender Baulärm über Monate'
  },
  
  // Nachtruhestörung
  night_noise_regular: {
    reference: 'AG Köln, 222 C 169/13',
    reduction: 20,
    description: 'Regelmäßige Ruhestörungen nach 22 Uhr'
  },
  night_noise_extreme: {
    reference: 'LG Hamburg, 307 S 58/08',
    reduction: 35,
    description: 'Extreme Nachtruhestörungen (>80dB)'
  },
  
  // Allgemein
  general_noise_moderate: {
    reference: 'AG Frankfurt, 33 C 3943/13',
    reduction: 10,
    description: 'Mäßige, aber regelmäßige Lärmbelästigung'
  },
  general_noise_severe: {
    reference: 'LG Berlin, 67 S 335/12',
    reduction: 25,
    description: 'Schwere Lärmbelästigung in Mietwohnung'
  }
};

// Nachtruhe-Zeiten nach Landesrecht
const QUIET_HOURS = {
  night: { start: 22, end: 6, label: 'Nachtruhe' },
  midday: { start: 13, end: 15, label: 'Mittagsruhe (optional)' },
  sunday: { allDay: true, label: 'Sonn- und Feiertagsruhe' }
};

class LegalService {

  /**
   * Vollständige rechtliche Bewertung erstellen
   */
  async generateLegalAssessment(options = {}) {
    const {
      days = 14,
      monthlyRent = null,
      includeRecommendations = true
    } = options;

    try {
      const legalSummary = await DatabaseService.getLegalSummary(days);
      const nightViolations = await DatabaseService.getNightViolations(days);
      const highSeverity = await DatabaseService.getHighSeverityEvents(days);
      const allEvents = await DatabaseService.getAllEvents(500);

      // Klassifiziere die Lärmarten
      const noiseClassification = this._classifyNoiseTypes(allEvents);
      
      // Finde passende Gerichtsentscheidungen
      const relevantDecisions = this._findRelevantDecisions(noiseClassification, nightViolations);
      
      // Berechne Mietminderungsanspruch
      const rentReduction = this._calculateRentReduction(
        legalSummary, nightViolations, highSeverity, noiseClassification, monthlyRent
      );
      
      // Erstelle Empfehlungen
      const recommendations = includeRecommendations ? 
        this._generateRecommendations(legalSummary, nightViolations, rentReduction) : [];
      
      // Bewerte Beweisqualität
      const evidenceQuality = this._assessEvidenceQuality(allEvents, days);

      return {
        // Zusammenfassung
        summary: {
          period: `${days} Tage`,
          totalEvents: legalSummary.totalEvents,
          nightViolations: nightViolations.length,
          highSeverityEvents: highSeverity.length,
          avgDecibel: legalSummary.avgDecibel
        },
        
        // Rechtliche Bewertung
        legalAssessment: {
          strength: this._translateStrength(legalSummary.legalStrength),
          strengthLevel: legalSummary.legalStrength,
          basisParagraph: '§536 Abs. 1 BGB',
          additionalParagraphs: this._getRelevantParagraphs(noiseClassification, nightViolations)
        },
        
        // Mietminderung
        rentReduction: {
          percent: rentReduction.percent,
          monthlyAmount: rentReduction.monthlyAmount,
          calculation: rentReduction.calculation,
          basis: rentReduction.basis,
          courtReferences: rentReduction.courtReferences
        },
        
        // Lärm-Klassifikation
        noiseClassification,
        
        // Relevante Gerichtsentscheidungen
        relevantDecisions,
        
        // Beweisqualität
        evidenceQuality,
        
        // Empfehlungen
        recommendations,
        
        // Zeitstempel
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('[Legal] Assessment error:', error);
      return {
        error: error.message,
        summary: { totalEvents: 0 },
        legalAssessment: { strength: 'Nicht verfügbar' },
        rentReduction: { percent: 0 },
        recommendations: ['Bitte starten Sie zunächst die Lärmdokumentation.']
      };
    }
  }

  /**
   * Schnelle Mietminderungsschätzung
   */
  async getQuickEstimate() {
    try {
      const legalSummary = await DatabaseService.getLegalSummary(14);
      const nightViolations = await DatabaseService.getNightViolations(14);
      
      let estimatePercent = 0;
      let confidence = 'niedrig';
      
      // Basisbewertung
      if (legalSummary.totalEvents >= 20 && nightViolations.length >= 5) {
        estimatePercent = 20;
        confidence = 'hoch';
      } else if (legalSummary.totalEvents >= 10 && nightViolations.length >= 3) {
        estimatePercent = 15;
        confidence = 'mittel';
      } else if (legalSummary.totalEvents >= 5) {
        estimatePercent = 10;
        confidence = 'mittel';
      } else if (legalSummary.totalEvents >= 2) {
        estimatePercent = 5;
        confidence = 'niedrig';
      }
      
      // Nachtruhe-Bonus
      if (nightViolations.length > 5) {
        estimatePercent += 5;
      }
      
      return {
        percent: Math.min(50, estimatePercent), // Max 50% nach Rechtsprechung
        confidence,
        events: legalSummary.totalEvents,
        nightViolations: nightViolations.length,
        needsMoreData: legalSummary.totalEvents < 5,
        message: this._getEstimateMessage(estimatePercent, confidence, legalSummary.totalEvents)
      };
    } catch (error) {
      console.error('[Legal] Quick estimate error:', error);
      return { percent: 0, confidence: 'unbekannt', message: 'Fehler bei der Berechnung.' };
    }
  }

  /**
   * Prüfe ob aktuelle Uhrzeit in Ruhezeiten fällt
   */
  isQuietTime(date = new Date()) {
    const hour = date.getHours();
    const day = date.getDay(); // 0 = Sunday
    
    const violations = [];
    
    // Nachtruhe (22:00 - 06:00)
    if (hour >= QUIET_HOURS.night.start || hour < QUIET_HOURS.night.end) {
      violations.push({
        type: 'night',
        label: QUIET_HOURS.night.label,
        legalImpact: 'high',
        paragraph: 'LImSchG'
      });
    }
    
    // Mittagsruhe (13:00 - 15:00) - optional aber relevant
    if (hour >= QUIET_HOURS.midday.start && hour < QUIET_HOURS.midday.end) {
      violations.push({
        type: 'midday',
        label: QUIET_HOURS.midday.label,
        legalImpact: 'medium',
        paragraph: 'Hausordnung'
      });
    }
    
    // Sonntags- und Feiertagsruhe
    if (day === 0) {
      violations.push({
        type: 'sunday',
        label: QUIET_HOURS.sunday.label,
        legalImpact: 'high',
        paragraph: 'FeiSchG/LImSchG'
      });
    }
    
    return {
      isQuietTime: violations.length > 0,
      violations,
      currentHour: hour,
      currentDay: day
    };
  }

  // ============================================================
  // PRIVATE METHODS
  // ============================================================

  _classifyNoiseTypes(events) {
    const classification = {
      music_bass: 0,
      music_general: 0,
      voices: 0,
      mechanical: 0,
      unknown: 0,
      total: events.length
    };

    events.forEach(event => {
      const type = event.detailed_type || event.detailedType || event.classification;
      
      if (type === 'bass_heavy' || type === 'Music (Bass)') {
        classification.music_bass++;
      } else if (type === 'vocal_range' || type === 'Music/Voices') {
        classification.voices++;
      } else if (type === 'high_frequency' || type === 'Machinery/Traffic') {
        classification.mechanical++;
      } else if (type === 'tonal') {
        classification.music_general++;
      } else {
        classification.unknown++;
      }
    });

    // Determine dominant type
    const types = [
      { name: 'Musik (Bass)', count: classification.music_bass },
      { name: 'Musik (Allgemein)', count: classification.music_general },
      { name: 'Stimmen/Gespräche', count: classification.voices },
      { name: 'Mechanisch/Bauarbeiten', count: classification.mechanical }
    ];
    
    types.sort((a, b) => b.count - a.count);
    classification.dominantType = types[0].count > 0 ? types[0].name : 'Nicht klassifiziert';
    classification.breakdown = types;

    return classification;
  }

  _findRelevantDecisions(noiseClassification, nightViolations) {
    const relevant = [];

    if (noiseClassification.music_bass > 3) {
      if (nightViolations.length > 2) {
        relevant.push(COURT_DECISIONS.music_bass_night);
      } else {
        relevant.push(COURT_DECISIONS.music_loud);
      }
    }

    if (noiseClassification.mechanical > 3) {
      relevant.push(COURT_DECISIONS.construction_day);
    }

    if (nightViolations.length > 5) {
      relevant.push(COURT_DECISIONS.night_noise_extreme);
    } else if (nightViolations.length > 2) {
      relevant.push(COURT_DECISIONS.night_noise_regular);
    }

    if (relevant.length === 0) {
      if (noiseClassification.total > 10) {
        relevant.push(COURT_DECISIONS.general_noise_severe);
      } else {
        relevant.push(COURT_DECISIONS.general_noise_moderate);
      }
    }

    return relevant;
  }

  _calculateRentReduction(legalSummary, nightViolations, highSeverity, noiseClassification, monthlyRent) {
    let basePercent = 0;
    const factors = [];
    const courtReferences = [];

    // Basis: Anzahl Events
    if (legalSummary.totalEvents >= 20) {
      basePercent = 15;
      factors.push('Hohe Anzahl dokumentierter Ereignisse (≥20)');
    } else if (legalSummary.totalEvents >= 10) {
      basePercent = 10;
      factors.push('Signifikante Anzahl dokumentierter Ereignisse (≥10)');
    } else if (legalSummary.totalEvents >= 5) {
      basePercent = 5;
      factors.push('Mehrere dokumentierte Ereignisse (≥5)');
    }

    // Nachtruhe-Zuschlag
    if (nightViolations.length >= 5) {
      basePercent += 10;
      factors.push(`${nightViolations.length} Nachtruhestörungen (22-06 Uhr)`);
      courtReferences.push(COURT_DECISIONS.night_noise_regular.reference);
    } else if (nightViolations.length >= 2) {
      basePercent += 5;
      factors.push(`${nightViolations.length} Nachtruhestörungen`);
    }

    // Schwere der Events
    if (highSeverity.length >= 5) {
      basePercent += 5;
      factors.push(`${highSeverity.length} besonders schwere Ereignisse (Score >60)`);
    }

    // Lautstärke-Zuschlag
    if (legalSummary.avgDecibel > 70) {
      basePercent += 5;
      factors.push(`Hoher Durchschnittspegel (${legalSummary.avgDecibel} dB)`);
    }

    // Bass-Zuschlag (besonders störend nach Rechtsprechung)
    if (noiseClassification.music_bass > 5) {
      basePercent += 5;
      factors.push('Wiederkehrende Bass-Belästigung');
      courtReferences.push(COURT_DECISIONS.music_bass_night.reference);
    }

    // Maximum nach Rechtsprechung: 50%
    const finalPercent = Math.min(50, basePercent);
    
    // Monatliche Berechnung
    const monthlyAmount = monthlyRent ? Math.round(monthlyRent * finalPercent / 100) : null;

    return {
      percent: finalPercent,
      monthlyAmount,
      calculation: factors,
      basis: `Basierend auf ${legalSummary.totalEvents} dokumentierten Ereignissen über ${legalSummary.period}`,
      courtReferences: [...new Set(courtReferences)] // Unique references
    };
  }

  _assessEvidenceQuality(events, days) {
    let score = 0;
    const criteria = [];

    // Anzahl der Events
    if (events.length >= 20) {
      score += 25;
      criteria.push({ name: 'Ausreichende Datenmenge', met: true, points: 25 });
    } else if (events.length >= 5) {
      score += 15;
      criteria.push({ name: 'Grundlegende Datenmenge', met: true, points: 15 });
    } else {
      criteria.push({ name: 'Ausreichende Datenmenge (≥20 Events)', met: false, points: 0 });
    }

    // Dokumentationszeitraum
    if (days >= 14) {
      score += 25;
      criteria.push({ name: '14-Tage Protokoll vollständig', met: true, points: 25 });
    } else {
      criteria.push({ name: '14-Tage Protokoll vollständig', met: false, points: 0 });
    }

    // Regelmäßigkeit (Events an verschiedenen Tagen)
    const uniqueDays = new Set(events.map(e => new Date(e.timestamp).toDateString())).size;
    if (uniqueDays >= 7) {
      score += 25;
      criteria.push({ name: 'Regelmäßige Dokumentation (≥7 Tage)', met: true, points: 25 });
    } else if (uniqueDays >= 3) {
      score += 15;
      criteria.push({ name: 'Mehrere Tage dokumentiert', met: true, points: 15 });
    } else {
      criteria.push({ name: 'Regelmäßige Dokumentation (≥7 Tage)', met: false, points: 0 });
    }

    // Nachtruhestörungen dokumentiert
    const hasNightEvents = events.some(e => {
      const hour = new Date(e.timestamp).getHours();
      return hour >= 22 || hour < 6;
    });
    if (hasNightEvents) {
      score += 25;
      criteria.push({ name: 'Nachtruhestörungen dokumentiert', met: true, points: 25 });
    } else {
      criteria.push({ name: 'Nachtruhestörungen dokumentiert', met: false, points: 0 });
    }

    let quality;
    if (score >= 80) quality = 'Sehr gut - Gerichtsverwertbar';
    else if (score >= 60) quality = 'Gut - Solide Grundlage';
    else if (score >= 40) quality = 'Ausreichend - Weitere Dokumentation empfohlen';
    else quality = 'Unzureichend - Mehr Daten erforderlich';

    return {
      score,
      maxScore: 100,
      quality,
      criteria,
      recommendation: score < 60 ? 
        'Dokumentieren Sie weiter. Ein vollständiges 14-Tage-Protokoll stärkt Ihre Position erheblich.' :
        'Ihre Dokumentation hat eine gute Qualität für eine rechtliche Auseinandersetzung.'
    };
  }

  _generateRecommendations(legalSummary, nightViolations, rentReduction) {
    const recommendations = [];

    // Sofortige Maßnahmen
    if (rentReduction.percent >= 20) {
      recommendations.push({
        priority: 'hoch',
        category: 'Rechtliche Schritte',
        action: 'Schriftliche Mängelanzeige an den Vermieter senden',
        details: 'Senden Sie eine formelle Mängelanzeige per Einschreiben. Beschreiben Sie die Lärmbelästigung und verweisen Sie auf §536 BGB.',
        template: true
      });
      recommendations.push({
        priority: 'hoch',
        category: 'Mietminderung',
        action: `Mietminderung von ${rentReduction.percent}% ankündigen`,
        details: `Basierend auf der Dokumentation ist eine Mietminderung von ${rentReduction.percent}% gerechtfertigt.`,
        template: true
      });
    } else if (rentReduction.percent >= 10) {
      recommendations.push({
        priority: 'mittel',
        category: 'Dokumentation',
        action: 'Weiter dokumentieren und Vermieter informieren',
        details: 'Ihre Beweislage entwickelt sich. Informieren Sie den Vermieter schriftlich über die Lärmprobleme.'
      });
    }

    // Nachtruhe
    if (nightViolations.length >= 3) {
      recommendations.push({
        priority: 'hoch',
        category: 'Ordnungsamt',
        action: 'Ordnungsamt einschalten bei Nachtruhestörungen',
        details: `${nightViolations.length} dokumentierte Nachtruhestörungen. Das Ordnungsamt kann Bußgelder nach dem Landesimmissionsschutzgesetz verhängen.`
      });
    }

    // Allgemein
    recommendations.push({
      priority: 'mittel',
      category: 'Dokumentation',
      action: 'Lärmprotokoll mindestens 14 Tage führen',
      details: 'Ein lückenloses 14-Tage-Protokoll ist der Standard für Mietminderungsklagen.'
    });

    if (legalSummary.totalEvents >= 10) {
      recommendations.push({
        priority: 'niedrig',
        category: 'Beratung',
        action: 'Mieterschutzbund oder Rechtsanwalt konsultieren',
        details: 'Lassen Sie Ihre Dokumentation von einem Fachmann bewerten. Erstberatungen sind oft kostenlos.'
      });
    }

    return recommendations;
  }

  _getRelevantParagraphs(noiseClassification, nightViolations) {
    const paragraphs = ['§536 Abs. 1 BGB (Mietminderung)'];
    
    if (nightViolations.length > 0) {
      paragraphs.push('Landesimmissionsschutzgesetz (Nachtruhe)');
    }
    
    paragraphs.push('§906 BGB (Zuführung unwägbarer Stoffe/Lärm)');
    
    if (noiseClassification.total > 10) {
      paragraphs.push('§543 Abs. 2 Nr. 1 BGB (Außerordentliche Kündigung bei schweren Mängeln)');
    }
    
    return paragraphs;
  }

  _translateStrength(strength) {
    const translations = {
      'very_strong': 'Sehr stark - Mietminderung empfohlen',
      'strong': 'Stark - Formelle Beschwerde empfohlen',
      'moderate': 'Mäßig - Weiter dokumentieren',
      'developing': 'Im Aufbau - Mehr Daten sammeln',
      'weak': 'Schwach - Dokumentation beginnen',
      'insufficient_data': 'Unzureichende Daten'
    };
    return translations[strength] || strength;
  }

  _getEstimateMessage(percent, confidence, eventCount) {
    if (eventCount === 0) {
      return 'Starten Sie die Aufzeichnung um eine Mietminderung zu berechnen.';
    }
    if (eventCount < 5) {
      return `Erst ${eventCount} Ereignisse dokumentiert. Mindestens 5 nötig für eine Schätzung.`;
    }
    if (confidence === 'hoch') {
      return `Geschätzte Mietminderung: ${percent}%. Starke Beweislage mit ${eventCount} Ereignissen.`;
    }
    if (confidence === 'mittel') {
      return `Vorläufige Schätzung: ${percent}%. Weiter dokumentieren für genauere Bewertung.`;
    }
    return `Erste Schätzung: ${percent}%. Mehr Daten verbessern die Genauigkeit.`;
  }
}

export default new LegalService();