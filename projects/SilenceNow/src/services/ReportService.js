/**
 * ReportService V1.0 - Court-Proof PDF Report Generation
 * Punkt 7: PDF Reports - Gerichtsfeste Dokumentation
 * 
 * FEATURES:
 * - 14-day noise protocol generation
 * - Legal-grade documentation format
 * - §536 BGB compliant evidence reports
 * - Shareable via email/print
 * - German legal language
 * 
 * @version 1.0
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import DatabaseService from './DatabaseService';

class ReportService {

  /**
   * Generate complete 14-day noise protocol report
   * Returns HTML for PDF generation
   */
  async generateReport(options = {}) {
    const {
      days = 14,
      includeDetails = true,
      language = 'de',
      userInfo = {}
    } = options;

    try {
      console.log('[Report] Generating report...');
      
      // Gather all data
      const legalSummary = await DatabaseService.getLegalSummary(days);
      const allEvents = await DatabaseService.getAllEvents(500);
      const nightViolations = await DatabaseService.getNightViolations(days);
      const highSeverity = await DatabaseService.getHighSeverityEvents(days);
      
      // Generate HTML
      const html = this._generateHTML({
        legalSummary,
        allEvents,
        nightViolations,
        highSeverity,
        days,
        includeDetails,
        userInfo
      });

      console.log('[Report] HTML generated, creating PDF...');
      
      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
        width: 595, // A4
        height: 842
      });

      // Rename with proper filename
      const filename = `SilenceNow_Laermprotokoll_${new Date().toISOString().split('T')[0]}.pdf`;
      const newUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.moveAsync({ from: uri, to: newUri });

      console.log('[Report] PDF generated:', newUri);
      
      return {
        success: true,
        uri: newUri,
        filename,
        summary: legalSummary
      };
    } catch (error) {
      console.error('[Report] Generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Share generated report via system share dialog
   */
  async shareReport(uri) {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Sharing is not available on this device');
      }
      
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Lärmprotokoll teilen',
        UTI: 'com.adobe.pdf'
      });
      
      return true;
    } catch (error) {
      console.error('[Report] Share error:', error);
      return false;
    }
  }

  /**
   * Generate court-proof HTML report
   */
  _generateHTML({ legalSummary, allEvents, nightViolations, highSeverity, days, includeDetails, userInfo }) {
    const reportDate = new Date().toLocaleDateString('de-DE', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - days);
    const periodStartStr = periodStart.toLocaleDateString('de-DE', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Lärmprotokoll - SilenceNow</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Times New Roman', serif; 
            font-size: 11pt; 
            line-height: 1.6;
            color: #1a1a1a;
            padding: 20mm;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #1a1a1a;
            padding-bottom: 15px;
        }
        .header h1 {
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .header h2 {
            font-size: 14pt;
            font-weight: normal;
            color: #444;
        }
        .header .subtitle {
            font-size: 10pt;
            color: #666;
            margin-top: 5px;
        }
        
        .legal-notice {
            background: #f5f5f5;
            border: 1px solid #ddd;
            border-left: 4px solid #c00;
            padding: 12px;
            margin: 20px 0;
            font-size: 9pt;
        }
        
        .section {
            margin: 25px 0;
        }
        .section h3 {
            font-size: 13pt;
            font-weight: bold;
            border-bottom: 1px solid #999;
            padding-bottom: 5px;
            margin-bottom: 12px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin: 10px 0;
        }
        .info-item {
            font-size: 10pt;
        }
        .info-item .label {
            font-weight: bold;
            display: inline-block;
            width: 160px;
        }
        
        .summary-box {
            border: 2px solid #1a1a1a;
            padding: 15px;
            margin: 15px 0;
        }
        .summary-box h4 {
            font-size: 12pt;
            margin-bottom: 10px;
        }
        .stat-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            text-align: center;
        }
        .stat-value {
            font-size: 24pt;
            font-weight: bold;
            color: #c00;
        }
        .stat-label {
            font-size: 9pt;
            color: #666;
        }
        
        .legal-assessment {
            background: #fff3f3;
            border: 2px solid #c00;
            padding: 15px;
            margin: 15px 0;
        }
        .legal-assessment h4 {
            color: #c00;
            margin-bottom: 8px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9pt;
            margin: 10px 0;
        }
        th {
            background: #1a1a1a;
            color: white;
            padding: 6px 8px;
            text-align: left;
            font-weight: bold;
        }
        td {
            padding: 5px 8px;
            border-bottom: 1px solid #ddd;
        }
        tr:nth-child(even) { background: #f9f9f9; }
        tr.night-violation { background: #fff0f0; }
        tr.high-severity { background: #ffe0e0; font-weight: bold; }
        
        .severity-high { color: #c00; font-weight: bold; }
        .severity-medium { color: #e60; }
        .severity-low { color: #090; }
        
        .footer {
            margin-top: 40px;
            border-top: 1px solid #999;
            padding-top: 15px;
            font-size: 8pt;
            color: #666;
        }
        
        .signature-area {
            margin-top: 50px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
        }
        .signature-line {
            border-top: 1px solid #1a1a1a;
            padding-top: 5px;
            font-size: 9pt;
            text-align: center;
        }
        
        .page-break { page-break-before: always; }
        
        @media print {
            body { padding: 15mm; }
        }
    </style>
</head>
<body>

    <div class="header">
        <h1>LÄRMPROTOKOLL</h1>
        <h2>Dokumentation von Lärmbelästigungen</h2>
        <div class="subtitle">
            Erstellt am ${reportDate} | Zeitraum: ${periodStartStr} bis ${reportDate}
        </div>
        <div class="subtitle">
            Erstellt mit SilenceNow - Automatische Lärmdokumentation
        </div>
    </div>

    <div class="legal-notice">
        <strong>Rechtlicher Hinweis:</strong> Dieses Protokoll dient als Beweismittel gemäß §536 BGB 
        (Mietminderung bei Mängeln der Mietsache). Die Messungen wurden automatisch und manipulationssicher 
        durch die SilenceNow-App erfasst. Es wurden ausschließlich numerische Messwerte (Dezibel) gespeichert - 
        keine Audioaufnahmen gemäß §201 StGB und DSGVO.
    </div>

    ${userInfo.address ? `
    <div class="section">
        <h3>1. Angaben zur Wohnung</h3>
        <div class="info-grid">
            ${userInfo.address ? `<div class="info-item"><span class="label">Adresse:</span> ${userInfo.address}</div>` : ''}
            ${userInfo.rent ? `<div class="info-item"><span class="label">Monatliche Miete:</span> ${userInfo.rent} €</div>` : ''}
            ${userInfo.landlord ? `<div class="info-item"><span class="label">Vermieter:</span> ${userInfo.landlord}</div>` : ''}
            ${userInfo.tenant ? `<div class="info-item"><span class="label">Mieter:</span> ${userInfo.tenant}</div>` : ''}
        </div>
    </div>
    ` : ''}

    <div class="section">
        <h3>${userInfo.address ? '2' : '1'}. Zusammenfassung (${days} Tage)</h3>
        
        <div class="summary-box">
            <div class="stat-grid">
                <div>
                    <div class="stat-value">${legalSummary.totalEvents}</div>
                    <div class="stat-label">Lärmereignisse gesamt</div>
                </div>
                <div>
                    <div class="stat-value">${legalSummary.nightViolations}</div>
                    <div class="stat-label">Nachtruhestörungen<br>(22:00-06:00)</div>
                </div>
                <div>
                    <div class="stat-value">${legalSummary.avgDecibel} dB</div>
                    <div class="stat-label">Durchschnittliche<br>Lautstärke</div>
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <h3>${userInfo.address ? '3' : '2'}. Rechtliche Bewertung</h3>
        
        <div class="legal-assessment">
            <h4>Bewertung der Rechtsposition: ${this._translateLegalStrength(legalSummary.legalStrength)}</h4>
            <p><strong>Geschätzte Mietminderung:</strong> ${legalSummary.rentReductionPercent}% 
            ${userInfo.rent ? `(ca. ${Math.round(userInfo.rent * legalSummary.rentReductionPercent / 100)} € monatlich)` : ''}</p>
            <p style="margin-top: 8px;">${legalSummary.recommendation}</p>
        </div>
        
        <p style="margin-top: 10px; font-size: 10pt;">
            <strong>Rechtliche Grundlage:</strong> Nach §536 Abs. 1 BGB ist der Mieter berechtigt, die Miete zu mindern, 
            wenn die Mietsache einen Mangel aufweist, der ihre Tauglichkeit zum vertragsgemäßen Gebrauch aufhebt oder mindert. 
            Erhebliche Lärmbelästigungen stellen einen solchen Mangel dar (BGH, Urteil vom 29.02.2012, Az. VIII ZR 155/11).
        </p>
    </div>

    ${nightViolations.length > 0 ? `
    <div class="section">
        <h3>${userInfo.address ? '4' : '3'}. Nachtruhestörungen (22:00-06:00)</h3>
        <p style="font-size: 10pt; margin-bottom: 10px;">
            Die folgenden Ereignisse fanden während der gesetzlichen Nachtruhe statt und sind 
            nach dem Landesimmissionsschutzgesetz besonders relevant.
        </p>
        <table>
            <thead>
                <tr>
                    <th>Datum & Uhrzeit</th>
                    <th>Lautstärke (dB)</th>
                    <th>Dauer</th>
                    <th>Klassifikation</th>
                    <th>Bewertung</th>
                </tr>
            </thead>
            <tbody>
                ${nightViolations.slice(0, 50).map(event => `
                <tr class="night-violation">
                    <td>${this._formatTimestamp(event.timestamp)}</td>
                    <td><strong>${event.decibel} dB</strong></td>
                    <td>${this._formatDuration(event.duration)}</td>
                    <td>${event.classification || 'Laut'}</td>
                    <td class="${event.legal_score > 60 ? 'severity-high' : event.legal_score > 30 ? 'severity-medium' : 'severity-low'}">
                        ${event.legal_score || 0}/100
                    </td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    ${includeDetails && allEvents.length > 0 ? `
    <div class="section ${nightViolations.length > 0 ? 'page-break' : ''}">
        <h3>${userInfo.address ? '5' : '4'}. Vollständiges Lärmprotokoll</h3>
        <p style="font-size: 10pt; margin-bottom: 10px;">
            Chronologische Auflistung aller erfassten Lärmereignisse im Dokumentationszeitraum.
        </p>
        <table>
            <thead>
                <tr>
                    <th>Nr.</th>
                    <th>Datum & Uhrzeit</th>
                    <th>dB</th>
                    <th>Dauer</th>
                    <th>Art</th>
                    <th>Tageszeit</th>
                    <th>Score</th>
                </tr>
            </thead>
            <tbody>
                ${allEvents.slice(0, 100).map((event, index) => `
                <tr class="${event.is_nighttime_violation || event.isNighttimeViolation ? 'night-violation' : ''} ${(event.legal_score || event.legalScore || 0) > 60 ? 'high-severity' : ''}">
                    <td>${index + 1}</td>
                    <td>${this._formatTimestamp(event.timestamp)}</td>
                    <td><strong>${event.decibel} dB</strong></td>
                    <td>${this._formatDuration(event.duration)}</td>
                    <td>${event.classification || 'Laut'}</td>
                    <td>${this._translateTimeContext(event.time_context || event.timeContext)}</td>
                    <td>${event.legal_score || event.legalScore || 0}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ${allEvents.length > 100 ? `<p style="font-size: 9pt; color: #666; margin-top: 5px;">Weitere ${allEvents.length - 100} Ereignisse nicht dargestellt.</p>` : ''}
    </div>
    ` : ''}

    <div class="section page-break">
        <h3>Technische Angaben zur Messung</h3>
        <div class="info-grid">
            <div class="info-item"><span class="label">Messgerät:</span> Smartphone-Mikrofon</div>
            <div class="info-item"><span class="label">Software:</span> SilenceNow App</div>
            <div class="info-item"><span class="label">Messintervall:</span> 1 Sekunde (aktiv) / 5 Sekunden (Hintergrund)</div>
            <div class="info-item"><span class="label">Schwellenwert:</span> 55 dB (Ereigniserkennung)</div>
            <div class="info-item"><span class="label">Datenschutz:</span> Keine Audioaufnahmen (nur Dezibel-Werte)</div>
            <div class="info-item"><span class="label">Zeitsynchronisation:</span> Automatisch (Geräteuhr)</div>
        </div>
        <p style="font-size: 9pt; margin-top: 10px; color: #666;">
            Hinweis: Smartphone-Mikrofone sind nicht geeichte Messgeräte. Die Dezibel-Werte dienen als Richtwerte 
            und Dokumentation der zeitlichen Muster. Für eine exakte Messung wird ein kalibriertes Schallpegelmessgerät empfohlen.
        </p>
    </div>

    <div class="section">
        <h3>Erklärung</h3>
        <p>
            Ich versichere, dass die in diesem Protokoll aufgeführten Lärmereignisse automatisch und ohne Manipulation 
            durch die SilenceNow-App erfasst wurden. Die App zeichnet ausschließlich numerische Messwerte auf und 
            speichert keine Audiodaten.
        </p>
    </div>

    <div class="signature-area">
        <div>
            <br><br><br>
            <div class="signature-line">Ort, Datum</div>
        </div>
        <div>
            <br><br><br>
            <div class="signature-line">Unterschrift ${userInfo.tenant || 'Mieter/in'}</div>
        </div>
    </div>

    <div class="footer">
        <p>Erstellt am ${reportDate} mit SilenceNow - Automatische Lärmdokumentation für Mieter</p>
        <p>Dieses Dokument wurde elektronisch erstellt und ist auch ohne Unterschrift als Beweisstück verwendbar.</p>
        <p>Referenz: §536 BGB, §906 BGB, Landesimmissionsschutzgesetz</p>
    </div>

</body>
</html>`;
  }

  // ============================================================
  // HELPER METHODS
  // ============================================================

  _formatTimestamp(timestamp) {
    if (!timestamp) return '-';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return String(timestamp);
    }
  }

  _formatDuration(seconds) {
    if (!seconds || seconds === 0) return '-';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  }

  _translateLegalStrength(strength) {
    const translations = {
      'very_strong': 'SEHR STARK',
      'strong': 'STARK',
      'moderate': 'MÄSSIG',
      'developing': 'IM AUFBAU',
      'weak': 'SCHWACH',
      'insufficient_data': 'UNZUREICHENDE DATEN'
    };
    return translations[strength] || strength;
  }

  _translateTimeContext(context) {
    const translations = {
      'night_hours': 'Nacht',
      'evening_hours': 'Abend',
      'day_hours': 'Tag'
    };
    return translations[context] || context || '-';
  }
}

export default new ReportService();