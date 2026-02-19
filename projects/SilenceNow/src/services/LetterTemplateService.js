/**
 * LetterTemplateService V1.0 - Musterbriefe für Mieter
 * 
 * Generiert rechtssichere Musterbriefe für:
 * - Mängelanzeige an Vermieter
 * - Mietminderungsankündigung
 * - Beschwerde beim Ordnungsamt
 * - Abmahnung an störenden Nachbarn
 * 
 * Alle Texte basieren auf deutscher Rechtsprechung.
 * 
 * @version 1.0
 */

import DatabaseService from './DatabaseService';
import LegalService from './LegalService';

class LetterTemplateService {
  
  /**
   * Alle verfügbaren Brieftypen
   */
  getTemplateTypes() {
    return [
      {
        id: 'maengelanzeige',
        title: 'Mängelanzeige',
        subtitle: 'Erste Beschwerde an den Vermieter',
        icon: '📋',
        description: 'Formelle Anzeige der Lärmbelästigung beim Vermieter. Wichtig: Mietminderung ist erst NACH Mängelanzeige möglich.',
        priority: 'Erster Schritt',
        free: true,
      },
      {
        id: 'mietminderung',
        title: 'Mietminderungsankündigung',
        subtitle: 'Mietminderung nach §536 BGB',
        icon: '💰',
        description: 'Ankündigung einer Mietminderung mit Verweis auf dokumentierte Beweislage und §536 BGB.',
        priority: 'Nach Mängelanzeige',
        free: true,
      },
      {
        id: 'ordnungsamt',
        title: 'Beschwerde beim Ordnungsamt',
        subtitle: 'Bei Nachtruhestörungen',
        icon: '🏛️',
        description: 'Formelle Beschwerde wegen Verstoß gegen Nachtruhe/Lärmschutz. Das Ordnungsamt kann Bußgelder verhängen.',
        priority: 'Bei Nachtruhestörungen',
        free: true,
      },
      {
        id: 'abmahnung_nachbar',
        title: 'Abmahnung an Nachbar',
        subtitle: 'Direkte Ansprache des Störers',
        icon: '⚠️',
        description: 'Schriftliche Abmahnung an den lärmverursachenden Nachbarn. Dokumentiert Ihren Versuch der gütlichen Einigung.',
        priority: 'Optional',
        free: true,
      },
    ];
  }

  /**
   * Brief generieren mit echten Daten aus der App
   */
  async generateLetter(templateId, userInfo = {}) {
    // Hole aktuelle Daten
    const [legalSummary, nightViolations, allEvents, assessment] = await Promise.all([
      DatabaseService.getLegalSummary(14),
      DatabaseService.getNightViolations(14),
      DatabaseService.getAllEvents(100),
      LegalService.generateLegalAssessment({ days: 14 }),
    ]);

    const data = {
      ...userInfo,
      legalSummary,
      nightViolations,
      allEvents,
      assessment,
      date: new Date().toLocaleDateString('de-DE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    };

    switch (templateId) {
      case 'maengelanzeige':
        return this._generateMaengelanzeige(data);
      case 'mietminderung':
        return this._generateMietminderung(data);
      case 'ordnungsamt':
        return this._generateOrdnungsamt(data);
      case 'abmahnung_nachbar':
        return this._generateAbmahnung(data);
      default:
        throw new Error(`Unbekannter Brieftyp: ${templateId}`);
    }
  }

  // ============================================================
  // MÄNGELANZEIGE
  // ============================================================

  _generateMaengelanzeige(data) {
    const { legalSummary, nightViolations, assessment } = data;
    const name = data.name || '[IHR NAME]';
    const address = data.address || '[IHRE ADRESSE]';
    const landlordName = data.landlordName || '[NAME DES VERMIETERS]';
    const landlordAddress = data.landlordAddress || '[ADRESSE DES VERMIETERS]';
    const apartmentAddress = data.apartmentAddress || '[ADRESSE DER MIETWOHNUNG]';
    const reductionPercent = assessment?.rentReduction?.percent || legalSummary.rentReductionPercent || 10;

    // Finde stärkstes Event für konkrete Beschreibung
    const worstEvent = data.allEvents.reduce((worst, e) => 
      (!worst || e.decibel > worst.decibel) ? e : worst, null);

    const worstTime = worstEvent ? new Date(worstEvent.timestamp).toLocaleString('de-DE') : '[DATUM/UHRZEIT]';
    const worstDb = worstEvent ? Math.round(worstEvent.decibel) : '[XX]';

    return {
      title: 'Mängelanzeige wegen Lärmbelästigung',
      type: 'maengelanzeige',
      text: `${name}
${address}

An:
${landlordName}
${landlordAddress}

${data.date}

Betreff: Mängelanzeige gemäß §536c BGB – Erhebliche Lärmbelästigung
Mietobjekt: ${apartmentAddress}

Sehr geehrte/r ${landlordName},

hiermit zeige ich Ihnen einen erheblichen Mangel der Mietsache gemäß §536c Abs. 1 BGB an.

Seit geraumer Zeit bin ich in meiner Wohnung einer erheblichen und wiederkehrenden Lärmbelästigung ausgesetzt. Die Störungen beeinträchtigen den vertragsgemäßen Gebrauch der Mietsache in unzumutbarer Weise.

**Dokumentierte Fakten (letzte 14 Tage):**
• ${legalSummary.totalEvents} dokumentierte Lärmstörungen
• Durchschnittlicher Lärmpegel: ${legalSummary.avgDecibel} dB (Schwellenwert: 55 dB)
• ${nightViolations.length} Störungen während der Nachtruhe (22:00 – 06:00 Uhr)
• ${legalSummary.highSeverityEvents} besonders schwere Störungen (Legal Score >60/100)
• Stärkste gemessene Störung: ${worstDb} dB am ${worstTime}

Die Lärmbelästigung überschreitet regelmäßig die in der Rechtsprechung als Grenzwert anerkannten 55 dB (vgl. AG Hamburg, 46 C 108/04). Bei den nächtlichen Störungen handelt es sich um Verstöße gegen die gesetzliche Nachtruhe gemäß den landesrechtlichen Immissionsschutzvorschriften.

Ich habe die Lärmstörungen lückenlos mit der App „SilenceNow" dokumentiert. Die Aufzeichnungen umfassen Zeitpunkt, Lärmpegel (Dezibel), Dauer, Frequenzanalyse sowie eine KI-gestützte Klassifikation der Geräuschquelle. Diese digitale Dokumentation kann als Beweismittel vorgelegt werden.

Ich fordere Sie auf, den Mangel **unverzüglich, spätestens jedoch innerhalb von 14 Tagen** nach Zugang dieses Schreibens zu beseitigen. Insbesondere bitte ich Sie:

1. Den lärmverursachenden Mieter auf die Einhaltung der Hausordnung und der gesetzlichen Ruhezeiten hinzuweisen
2. Gegebenenfalls eine Abmahnung auszusprechen
3. Bauliche Maßnahmen zur Schalldämmung zu prüfen

Ich weise Sie darauf hin, dass ich mir für den Fall der nicht fristgerechten Mängelbeseitigung folgende Rechte vorbehalte:
• Mietminderung gemäß §536 Abs. 1 BGB (geschätzt: ${reductionPercent}%)
• Schadensersatz gemäß §536a BGB
• Außerordentliche Kündigung gemäß §543 Abs. 2 Nr. 1 BGB bei fortgesetzter Beeinträchtigung

Die vollständige Lärmdokumentation kann ich Ihnen auf Anfrage als PDF-Bericht zur Verfügung stellen.

Bitte bestätigen Sie den Eingang dieses Schreibens und teilen Sie mir die geplanten Maßnahmen mit.

Mit freundlichen Grüßen

${name}

---
Anlage: Lärmprotokoll der letzten 14 Tage (auf Anfrage als PDF)`,
      
      placeholders: [
        { key: 'name', label: 'Ihr Name', current: data.name },
        { key: 'address', label: 'Ihre Adresse', current: data.address },
        { key: 'landlordName', label: 'Name des Vermieters', current: data.landlordName },
        { key: 'landlordAddress', label: 'Adresse des Vermieters', current: data.landlordAddress },
        { key: 'apartmentAddress', label: 'Adresse der Mietwohnung', current: data.apartmentAddress },
      ],
      legalBasis: ['§536c Abs. 1 BGB', '§536 Abs. 1 BGB', '§536a BGB'],
      sendMethod: 'Per Einschreiben mit Rückschein senden!',
    };
  }

  // ============================================================
  // MIETMINDERUNGSANKÜNDIGUNG
  // ============================================================

  _generateMietminderung(data) {
    const { legalSummary, nightViolations, assessment } = data;
    const name = data.name || '[IHR NAME]';
    const address = data.address || '[IHRE ADRESSE]';
    const landlordName = data.landlordName || '[NAME DES VERMIETERS]';
    const landlordAddress = data.landlordAddress || '[ADRESSE DES VERMIETERS]';
    const apartmentAddress = data.apartmentAddress || '[ADRESSE DER MIETWOHNUNG]';
    const monthlyRent = data.monthlyRent || '[MONATLICHE MIETE]';
    const reductionPercent = assessment?.rentReduction?.percent || legalSummary.rentReductionPercent || 10;
    
    const courtRefs = assessment?.relevantDecisions?.map(d => d.reference).join(', ') || 'AG Hamburg 46 C 108/04';

    return {
      title: 'Mietminderungsankündigung',
      type: 'mietminderung',
      text: `${name}
${address}

An:
${landlordName}
${landlordAddress}

${data.date}

Betreff: Ankündigung der Mietminderung gemäß §536 Abs. 1 BGB
Mietobjekt: ${apartmentAddress}

Sehr geehrte/r ${landlordName},

ich nehme Bezug auf meine Mängelanzeige bezüglich der anhaltenden Lärmbelästigung in meiner Mietwohnung.

Da der angezeigte Mangel trotz Fristsetzung nicht beseitigt wurde und die Lärmbelästigung weiterhin andauert, mache ich hiermit von meinem Recht auf Mietminderung gemäß §536 Abs. 1 BGB Gebrauch.

**Aktueller Stand der Dokumentation:**
• ${legalSummary.totalEvents} dokumentierte Lärmstörungen in den letzten 14 Tagen
• ${nightViolations.length} Verstöße gegen die Nachtruhe
• Durchschnittlicher Lärmpegel: ${legalSummary.avgDecibel} dB
• Beweisqualität: ${assessment?.evidenceQuality?.quality || 'Gut'}

**Mietminderung:**
Auf Grundlage der dokumentierten Beeinträchtigungen und vergleichbarer Rechtsprechung (${courtRefs}) mindere ich die Miete ab dem ${data.date} um ${reductionPercent}%.

Bisherige Kaltmiete: ${monthlyRent}€
Geminderte Miete: ${typeof monthlyRent === 'number' ? Math.round(monthlyRent * (1 - reductionPercent / 100)) : '[GEMINDERTE MIETE]'}€
Minderungsbetrag: ${typeof monthlyRent === 'number' ? Math.round(monthlyRent * reductionPercent / 100) : '[MINDERUNGSBETRAG]'}€

Die Mietminderung gilt, bis der Mangel vollständig beseitigt ist. Ich behalte mir eine Erhöhung der Minderungsquote vor, sollte sich die Situation verschlechtern.

Die vollständige digitale Lärmdokumentation mit Zeitstempeln, Dezibelwerten und KI-gestützter Lärmklassifikation steht als Beweismittel zur Verfügung.

Mit freundlichen Grüßen

${name}`,
      
      placeholders: [
        { key: 'name', label: 'Ihr Name', current: data.name },
        { key: 'address', label: 'Ihre Adresse', current: data.address },
        { key: 'landlordName', label: 'Name des Vermieters', current: data.landlordName },
        { key: 'landlordAddress', label: 'Adresse des Vermieters', current: data.landlordAddress },
        { key: 'apartmentAddress', label: 'Adresse der Mietwohnung', current: data.apartmentAddress },
        { key: 'monthlyRent', label: 'Monatliche Kaltmiete (€)', current: data.monthlyRent },
      ],
      legalBasis: ['§536 Abs. 1 BGB'],
      sendMethod: 'Per Einschreiben mit Rückschein senden!',
      prerequisite: 'Mängelanzeige muss vorher erfolgt sein!',
    };
  }

  // ============================================================
  // ORDNUNGSAMT BESCHWERDE
  // ============================================================

  _generateOrdnungsamt(data) {
    const { legalSummary, nightViolations } = data;
    const name = data.name || '[IHR NAME]';
    const address = data.address || '[IHRE ADRESSE]';
    const apartmentAddress = data.apartmentAddress || '[ADRESSE DER MIETWOHNUNG]';
    const disturbanceSource = data.disturbanceSource || '[WOHNUNG/ADRESSE DES LÄRMVERURSACHERS]';

    // Erstelle eine Liste der schlimmsten Nacht-Events
    const nightEventList = nightViolations.slice(0, 5).map(e => {
      const d = new Date(e.timestamp);
      return `• ${d.toLocaleDateString('de-DE')} um ${d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr – ${Math.round(e.decibel)} dB (${e.ai_type || e.classification || 'Lärm'})`;
    }).join('\n');

    return {
      title: 'Beschwerde beim Ordnungsamt',
      type: 'ordnungsamt',
      text: `${name}
${address}

An das Ordnungsamt
[ZUSTÄNDIGES ORDNUNGSAMT]
[ADRESSE DES ORDNUNGSAMTES]

${data.date}

Betreff: Beschwerde wegen fortgesetzter Ruhestörung / Verstoß gegen das Landesimmissionsschutzgesetz

Sehr geehrte Damen und Herren,

hiermit erstatte ich Beschwerde wegen fortgesetzter und erheblicher Ruhestörungen an meinem Wohnort.

**Sachverhalt:**
Seit geraumer Zeit werde ich in meiner Wohnung (${apartmentAddress}) einer regelmäßigen und erheblichen Lärmbelästigung ausgesetzt, die von ${disturbanceSource} ausgeht.

**Dokumentierte Verstöße gegen die Nachtruhe (22:00 – 06:00 Uhr):**
${nightViolations.length > 0 ? nightEventList : '• [NACHT-STÖRUNGEN EINTRAGEN]'}

**Gesamtstatistik (letzte 14 Tage):**
• ${legalSummary.totalEvents} dokumentierte Lärmstörungen insgesamt
• ${nightViolations.length} Verstöße gegen die Nachtruhe
• Durchschnittlicher Lärmpegel: ${legalSummary.avgDecibel} dB
• Lärmpegel weit über dem zumutbaren Maß von 55 dB

Die Störungen wurden mittels einer geprüften Lärm-Dokumentations-App (SilenceNow) aufgezeichnet und umfassen exakte Zeitstempel, kalibrierte Dezibelwerte sowie eine automatische Geräuschklassifikation.

Die Lärmbelästigung stellt einen Verstoß gegen die gesetzlichen Ruhezeiten gemäß dem Landesimmissionsschutzgesetz dar und ist als Ordnungswidrigkeit nach §117 OWiG zu bewerten.

Ich bitte Sie, die Angelegenheit zu prüfen und geeignete Maßnahmen zu ergreifen, insbesondere:
1. Den Lärmverursacher auf die Einhaltung der Ruhezeiten hinzuweisen
2. Bei fortgesetztem Verstoß ein Bußgeldverfahren einzuleiten

Eine lückenlose digitale Dokumentation der Störungen kann ich Ihnen als PDF-Bericht zur Verfügung stellen.

Für Rückfragen stehe ich Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen

${name}
Tel.: [IHRE TELEFONNUMMER]`,
      
      placeholders: [
        { key: 'name', label: 'Ihr Name', current: data.name },
        { key: 'address', label: 'Ihre Adresse', current: data.address },
        { key: 'apartmentAddress', label: 'Adresse der Mietwohnung', current: data.apartmentAddress },
        { key: 'disturbanceSource', label: 'Herkunft des Lärms', current: data.disturbanceSource },
      ],
      legalBasis: ['LImSchG', '§117 OWiG'],
      sendMethod: 'Per Post oder E-Mail an das zuständige Ordnungsamt senden.',
    };
  }

  // ============================================================
  // ABMAHNUNG AN NACHBAR
  // ============================================================

  _generateAbmahnung(data) {
    const { legalSummary, nightViolations } = data;
    const name = data.name || '[IHR NAME]';
    const address = data.address || '[IHRE ADRESSE]';
    const neighborName = data.neighborName || '[NAME DES NACHBARN]';
    const neighborAddress = data.neighborAddress || '[ADRESSE DES NACHBARN]';

    return {
      title: 'Abmahnung an Nachbar',
      type: 'abmahnung_nachbar',
      text: `${name}
${address}

An:
${neighborName}
${neighborAddress}

${data.date}

Betreff: Aufforderung zur Unterlassung der Lärmbelästigung

Sehr geehrte/r ${neighborName},

ich wende mich an Sie, da ich seit geraumer Zeit einer erheblichen Lärmbelästigung ausgesetzt bin, die von Ihrer Wohnung ausgeht.

In den letzten 14 Tagen habe ich insgesamt ${legalSummary.totalEvents} Lärmstörungen dokumentiert, davon ${nightViolations.length} während der gesetzlichen Nachtruhe (22:00 – 06:00 Uhr). Der gemessene Lärmpegel lag durchschnittlich bei ${legalSummary.avgDecibel} dB und damit deutlich über dem zumutbaren Maß.

Ich bin sicher, dass Ihnen die Beeinträchtigung nicht bewusst ist, und möchte dieses Problem auf freundlichem Wege lösen.

Ich bitte Sie daher höflich, aber bestimmt:
1. Die gesetzlichen Ruhezeiten einzuhalten (Nachtruhe: 22:00 – 06:00 Uhr)
2. Die Lautstärke auf ein zimmerlautstärke-konformes Maß zu reduzieren
3. Insbesondere auf Bass-intensive Musik/Geräusche in den Abend- und Nachtstunden zu achten

Sollte sich die Situation nicht innerhalb von 7 Tagen verbessern, sehe ich mich gezwungen:
• Den Vermieter formal zu informieren
• Das Ordnungsamt einzuschalten
• Rechtliche Schritte einzuleiten

Ich dokumentiere die Lärmbelästigung digital und verfüge über eine lückenlose Beweislage.

Ich hoffe auf eine gütliche Einigung und stehe für ein persönliches Gespräch gerne zur Verfügung.

Mit freundlichen Grüßen

${name}`,
      
      placeholders: [
        { key: 'name', label: 'Ihr Name', current: data.name },
        { key: 'address', label: 'Ihre Adresse', current: data.address },
        { key: 'neighborName', label: 'Name des Nachbarn', current: data.neighborName },
        { key: 'neighborAddress', label: 'Adresse des Nachbarn', current: data.neighborAddress },
      ],
      legalBasis: ['§906 BGB', 'Hausordnung'],
      sendMethod: 'Persönlich übergeben oder in den Briefkasten einwerfen. Kopie aufbewahren!',
    };
  }
}

export default new LetterTemplateService();
