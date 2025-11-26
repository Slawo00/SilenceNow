export interface AITool {
  name: string;
  description: string;
  category: string;
  link?: string;
}

export interface Lever {
  id: string;
  title: string;
  shortDescription: string;
  implementationGuide: string[];
  benefits: string[];
  aiTools: AITool[];
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  levers: Lever[];
}

export const goals: Goal[] = [
  {
    id: 'speed',
    title: 'Schnelligkeit',
    description: 'Beschleunigung des Monatsabschlusses von Wochen auf Tage',
    icon: 'bolt.fill',
    color: '#3B82F6',
    levers: [
      {
        id: 'speed-1',
        title: 'Automatisierte Kontenabstimmung',
        shortDescription: 'Eliminierung manueller Abstimmungsprozesse durch KI-gestützte Automatisierung',
        implementationGuide: [
          'Analysieren Sie aktuelle manuelle Abstimmungsprozesse',
          'Identifizieren Sie wiederkehrende Muster und Regeln',
          'Implementieren Sie regelbasierte Automatisierung für Standardfälle',
          'Konfigurieren Sie KI für Ausnahmeerkennung',
          'Etablieren Sie Eskalationsprozesse für Sonderfälle',
        ],
        benefits: ['60% Zeitersparnis', 'Reduzierte Fehlerquote', 'Schnellere Abschlusszyklen'],
        aiTools: [
          { name: 'BlackLine', description: 'Automatisierte Kontenabstimmung', category: 'Reconciliation' },
          { name: 'ReconArt', description: 'KI-gestützte Matching-Engine', category: 'Reconciliation' },
        ],
        effort: 'medium',
        impact: 'high',
      },
      {
        id: 'speed-2',
        title: 'Parallele Abschlussprozesse',
        shortDescription: 'Umstellung von sequenziellen auf parallele Workflows',
        implementationGuide: [
          'Mapping aller Abhängigkeiten im Abschlussprozess',
          'Identifizierung parallelisierbarer Aktivitäten',
          'Redesign der Prozessabfolge',
          'Implementierung von Workflow-Management-Tools',
          'Schulung der Teams für paralleles Arbeiten',
        ],
        benefits: ['40% kürzere Durchlaufzeit', 'Bessere Ressourcenauslastung', 'Flexiblere Planung'],
        aiTools: [
          { name: 'Workiva', description: 'Workflow-Orchestrierung', category: 'Workflow' },
          { name: 'FloQast', description: 'Close-Management-Plattform', category: 'Close Management' },
        ],
        effort: 'high',
        impact: 'high',
      },
      {
        id: 'speed-3',
        title: 'Echtzeit-Datenintegration',
        shortDescription: 'Kontinuierliche Datenaktualisierung statt Batch-Verarbeitung',
        implementationGuide: [
          'Bestandsaufnahme aller Datenquellen',
          'Evaluierung von Echtzeit-Integrationstechnologien',
          'Implementierung von API-basierten Verbindungen',
          'Einrichtung von Datenqualitäts-Monitoring',
          'Schulung für Echtzeit-Analysen',
        ],
        benefits: ['Aktuelle Datenbasis', 'Schnellere Entscheidungen', 'Reduzierte manuelle Dateneingabe'],
        aiTools: [
          { name: 'Fivetran', description: 'Automatisierte Daten-Pipelines', category: 'Integration' },
          { name: 'Airbyte', description: 'Open-Source ETL', category: 'Integration' },
        ],
        effort: 'high',
        impact: 'high',
      },
      {
        id: 'speed-4',
        title: 'Automatisierte Journalbuchungen',
        shortDescription: 'KI-basierte Erstellung wiederkehrender Buchungen',
        implementationGuide: [
          'Katalogisierung wiederkehrender Buchungsmuster',
          'Definition von Buchungsregeln und Vorlagen',
          'Implementierung automatischer Buchungserstellung',
          'Einrichtung von Genehmigungsworkflows',
          'Monitoring und Ausnahmereporting',
        ],
        benefits: ['80% weniger manuelle Buchungen', 'Konsistente Buchungsqualität', 'Zeitnahe Erfassung'],
        aiTools: [
          { name: 'SAP S/4HANA', description: 'Integrierte Buchungsautomation', category: 'ERP' },
          { name: 'Oracle Financials', description: 'Automatisierte Journal-Entries', category: 'ERP' },
        ],
        effort: 'medium',
        impact: 'high',
      },
      {
        id: 'speed-5',
        title: 'Schnellere Intercompany-Abstimmung',
        shortDescription: 'Automatisierte konzernweite Transaktionsabstimmung',
        implementationGuide: [
          'Standardisierung von IC-Prozessen',
          'Implementierung eines IC-Matching-Systems',
          'Automatische Differenzenerkennung',
          'Workflow für Differenzklärung',
          'Real-time IC-Reporting',
        ],
        benefits: ['70% schnellere IC-Abstimmung', 'Weniger Konsolidierungsfehler', 'Transparente Prozesse'],
        aiTools: [
          { name: 'OneStream', description: 'Unified Finance Platform', category: 'CPM' },
          { name: 'BlackLine IC', description: 'Intercompany Hub', category: 'IC Management' },
        ],
        effort: 'high',
        impact: 'high',
      },
      {
        id: 'speed-6',
        title: 'Beschleunigte Rückstellungsberechnung',
        shortDescription: 'Automatische Berechnung und Buchung von Rückstellungen',
        implementationGuide: [
          'Dokumentation aller Rückstellungsarten',
          'Entwicklung von Berechnungsalgorithmen',
          'Automatisierung der Datenextraktion',
          'Implementierung automatischer Buchungen',
          'Review- und Freigabeprozess',
        ],
        benefits: ['90% schnellere Berechnung', 'Konsistente Methodik', 'Revisionssichere Dokumentation'],
        aiTools: [
          { name: 'Trintech Cadency', description: 'Accrual Management', category: 'Close Management' },
          { name: 'Prophix', description: 'Automatisierte Berechnungen', category: 'FP&A' },
        ],
        effort: 'medium',
        impact: 'medium',
      },
      {
        id: 'speed-7',
        title: 'Vorkontierung mit KI',
        shortDescription: 'Machine Learning für automatische Kontenzuordnung',
        implementationGuide: [
          'Sammlung historischer Kontierungsdaten',
          'Training des ML-Modells',
          'Integration in den Buchungsprozess',
          'Konfidenz-basierte Freigaberegeln',
          'Kontinuierliches Modell-Training',
        ],
        benefits: ['95% Trefferquote', 'Massive Zeitersparnis', 'Lernende Systeme'],
        aiTools: [
          { name: 'Vic.ai', description: 'KI-gestützte Vorkontierung', category: 'AP Automation' },
          { name: 'AppZen', description: 'Intelligente Buchungszuordnung', category: 'AI Finance' },
        ],
        effort: 'medium',
        impact: 'high',
      },
      {
        id: 'speed-8',
        title: 'Optimierter Konsolidierungsprozess',
        shortDescription: 'Automatisierung der Konzernkonsolidierung',
        implementationGuide: [
          'Standardisierung des Kontenrahmens',
          'Automatische Währungsumrechnung',
          'Regelbasierte Eliminierungen',
          'Automatisierte Minderheitenberechnung',
          'Integriertes Reporting',
        ],
        benefits: ['50% schnellere Konsolidierung', 'Weniger manuelle Eingriffe', 'Revisionssicherheit'],
        aiTools: [
          { name: 'SAP BPC', description: 'Business Planning & Consolidation', category: 'CPM' },
          { name: 'CCH Tagetik', description: 'Unified Performance Management', category: 'CPM' },
        ],
        effort: 'high',
        impact: 'high',
      },
      {
        id: 'speed-9',
        title: 'Automatisiertes Reporting',
        shortDescription: 'Sofortige Berichtserstellung nach Abschluss',
        implementationGuide: [
          'Definition von Standard-Reports',
          'Erstellung automatisierter Report-Templates',
          'Integration mit Abschlusssystem',
          'Automatische Verteilung',
          'Self-Service für Ad-hoc-Analysen',
        ],
        benefits: ['Berichte in Minuten', 'Konsistente Formatierung', 'Weniger Nacharbeit'],
        aiTools: [
          { name: 'Power BI', description: 'Business Intelligence', category: 'BI' },
          { name: 'Tableau', description: 'Datenvisualisierung', category: 'BI' },
        ],
        effort: 'low',
        impact: 'medium',
      },
      {
        id: 'speed-10',
        title: 'Continuous Close',
        shortDescription: 'Übergang zu kontinuierlichen Abschlussprozessen',
        implementationGuide: [
          'Identifizierung von Soft-Close-Aktivitäten',
          'Verlagerung von Tätigkeiten in den Monat',
          'Implementierung von Echtzeit-Kontrollen',
          'Automatisierung wiederkehrender Aufgaben',
          'Kulturwandel im Team',
        ],
        benefits: ['Entspannter Monatsabschluss', 'Frühere Erkenntnisse', 'Bessere Work-Life-Balance'],
        aiTools: [
          { name: 'FloQast', description: 'Continuous Accounting', category: 'Close Management' },
          { name: 'Trintech', description: 'Financial Process Automation', category: 'Automation' },
        ],
        effort: 'high',
        impact: 'high',
      },
    ],
  },
  {
    id: 'quality',
    title: 'Qualität',
    description: 'Erhöhung der Abschlussqualität und Reduzierung von Fehlern',
    icon: 'checkmark.shield.fill',
    color: '#10B981',
    levers: [
      {
        id: 'quality-1',
        title: 'Automatisierte Plausibilitätsprüfungen',
        shortDescription: 'KI-basierte Erkennung von Anomalien und Abweichungen',
        implementationGuide: [
          'Definition kritischer Plausibilitätsregeln',
          'Implementierung automatischer Prüfroutinen',
          'Konfiguration von Schwellenwerten',
          'Einrichtung von Alarmierungssystemen',
          'Eskalationsprozesse definieren',
        ],
        benefits: ['Frühe Fehlererkennung', '99% weniger übersehene Fehler', 'Revisionssicherheit'],
        aiTools: [
          { name: 'MindBridge', description: 'KI-Audit-Plattform', category: 'Audit' },
          { name: 'HighRadius', description: 'Anomalie-Erkennung', category: 'AI Finance' },
        ],
        effort: 'medium',
        impact: 'high',
      },
      {
        id: 'quality-2',
        title: 'Vier-Augen-Prinzip digital',
        shortDescription: 'Digitalisierte Freigabe- und Kontrollprozesse',
        implementationGuide: [
          'Mapping aller genehmigungspflichtigen Prozesse',
          'Definition von Kompetenzregeln',
          'Implementierung digitaler Workflows',
          'Audit-Trail-Konfiguration',
          'Stellvertreterregelungen',
        ],
        benefits: ['Lückenlose Dokumentation', 'Compliance-Sicherheit', 'Effiziente Freigaben'],
        aiTools: [
          { name: 'SAP Workflow', description: 'Integrierte Genehmigungen', category: 'Workflow' },
          { name: 'ServiceNow', description: 'Workflow-Automatisierung', category: 'Workflow' },
        ],
        effort: 'low',
        impact: 'medium',
      },
      {
        id: 'quality-3',
        title: 'Standardisierte Checklisten',
        shortDescription: 'Digitale Abschluss-Checklisten mit Abhängigkeiten',
        implementationGuide: [
          'Erstellung umfassender Checklisten',
          'Definition von Abhängigkeiten',
          'Digitalisierung und Automatisierung',
          'Integration in Close-Tool',
          'Regelmäßige Überprüfung und Anpassung',
        ],
        benefits: ['Vollständige Prozesse', 'Klare Verantwortlichkeiten', 'Transparenter Status'],
        aiTools: [
          { name: 'FloQast', description: 'Close Checklisten', category: 'Close Management' },
          { name: 'Blackline', description: 'Task Management', category: 'Close Management' },
        ],
        effort: 'low',
        impact: 'medium',
      },
      {
        id: 'quality-4',
        title: 'Automatische Dokumentation',
        shortDescription: 'Lückenlose Protokollierung aller Abschlussaktivitäten',
        implementationGuide: [
          'Identifizierung dokumentationspflichtiger Aktivitäten',
          'Automatische Logfile-Erstellung',
          'Versionierung aller Änderungen',
          'Zentrale Dokumentenablage',
          'Automatische Archivierung',
        ],
        benefits: ['Revisionssicherheit', 'Nachvollziehbarkeit', 'Zeiteinsparung bei Audits'],
        aiTools: [
          { name: 'Workiva', description: 'Dokumentenmanagement', category: 'Compliance' },
          { name: 'Audit Board', description: 'Audit-Management', category: 'Audit' },
        ],
        effort: 'medium',
        impact: 'medium',
      },
      {
        id: 'quality-5',
        title: 'Datenqualitäts-Monitoring',
        shortDescription: 'Kontinuierliche Überwachung der Datenqualität',
        implementationGuide: [
          'Definition von Datenqualitätsmetriken',
          'Implementierung von Datenvalidierungen',
          'Einrichtung von Dashboards',
          'Automatische Alarmierung',
          'Datenbereinigungsprozesse',
        ],
        benefits: ['Hohe Datenqualität', 'Frühe Problemerkennung', 'Vertrauen in Daten'],
        aiTools: [
          { name: 'Talend', description: 'Data Quality', category: 'Data Management' },
          { name: 'Informatica', description: 'Data Governance', category: 'Data Management' },
        ],
        effort: 'medium',
        impact: 'high',
      },
      {
        id: 'quality-6',
        title: 'Integrierte Kontrollen',
        shortDescription: 'Einbettung von Kontrollen in operative Prozesse',
        implementationGuide: [
          'Mapping aller Kontrollpunkte',
          'Design präventiver Kontrollen',
          'Automatisierung von Kontrollen',
          'Echtzeit-Kontrollmonitoring',
          'Kontinuierliche Kontrollverbesserung',
        ],
        benefits: ['Weniger nachträgliche Korrekturen', 'Höhere Prozesssicherheit', 'Reduziertes Risiko'],
        aiTools: [
          { name: 'SAP GRC', description: 'Governance Risk Compliance', category: 'GRC' },
          { name: 'Workiva', description: 'Internal Controls', category: 'Compliance' },
        ],
        effort: 'high',
        impact: 'high',
      },
      {
        id: 'quality-7',
        title: 'Varianzanalyse mit KI',
        shortDescription: 'Intelligente Analyse von Plan-Ist-Abweichungen',
        implementationGuide: [
          'Definition relevanter Vergleichsgrößen',
          'Implementierung automatischer Vergleiche',
          'KI-basierte Ursachenanalyse',
          'Automatische Kommentierung',
          'Drill-Down-Funktionalität',
        ],
        benefits: ['Tiefere Einblicke', 'Schnellere Erklärungen', 'Proaktive Steuerung'],
        aiTools: [
          { name: 'Jedox', description: 'KI-Varianzanalyse', category: 'FP&A' },
          { name: 'Anaplan', description: 'Connected Planning', category: 'FP&A' },
        ],
        effort: 'medium',
        impact: 'medium',
      },
      {
        id: 'quality-8',
        title: 'Segregation of Duties',
        shortDescription: 'Automatisierte Funktionstrennung und Konfliktprüfung',
        implementationGuide: [
          'SoD-Matrix erstellen',
          'Automatische Konfliktprüfung',
          'Rollen- und Berechtigungsmanagement',
          'Regelmäßige Reviews',
          'Ausnahmegenehmigungsprozess',
        ],
        benefits: ['Compliance-Sicherheit', 'Fraud-Prävention', 'Klare Verantwortlichkeiten'],
        aiTools: [
          { name: 'SAP Access Control', description: 'SoD Management', category: 'GRC' },
          { name: 'SailPoint', description: 'Identity Governance', category: 'Security' },
        ],
        effort: 'medium',
        impact: 'high',
      },
      {
        id: 'quality-9',
        title: 'Fehlerursachen-Analyse',
        shortDescription: 'Systematische Analyse und Vermeidung von Wiederholungsfehlern',
        implementationGuide: [
          'Kategorisierung von Fehlertypen',
          'Root-Cause-Analyse implementieren',
          'Lessons-Learned-Prozess',
          'Präventivmaßnahmen ableiten',
          'Erfolgsmessung der Maßnahmen',
        ],
        benefits: ['Kontinuierliche Verbesserung', 'Weniger Wiederholungsfehler', 'Lernende Organisation'],
        aiTools: [
          { name: 'Celonis', description: 'Process Mining', category: 'Process Intelligence' },
          { name: 'UiPath Process Mining', description: 'Prozessanalyse', category: 'Process Intelligence' },
        ],
        effort: 'low',
        impact: 'medium',
      },
      {
        id: 'quality-10',
        title: 'Qualitäts-KPIs',
        shortDescription: 'Messung und Steuerung der Abschlussqualität',
        implementationGuide: [
          'Definition von Qualitäts-KPIs',
          'Automatische Messung',
          'Dashboard-Erstellung',
          'Trend-Analysen',
          'Zielvereinbarungen',
        ],
        benefits: ['Messbare Qualität', 'Verbesserungstrends', 'Benchmarking-Fähigkeit'],
        aiTools: [
          { name: 'Power BI', description: 'KPI-Dashboards', category: 'BI' },
          { name: 'Tableau', description: 'Qualitätsmetriken', category: 'BI' },
        ],
        effort: 'low',
        impact: 'medium',
      },
    ],
  },
  {
    id: 'automation',
    title: 'Automatisierung',
    description: 'Maximale Automatisierung manueller Tätigkeiten',
    icon: 'gearshape.2.fill',
    color: '#8B5CF6',
    levers: [
      {
        id: 'automation-1',
        title: 'RPA für Routineaufgaben',
        shortDescription: 'Roboter für wiederkehrende manuelle Tätigkeiten',
        implementationGuide: [
          'Identifizierung RPA-geeigneter Prozesse',
          'Prozessdokumentation und -optimierung',
          'Bot-Entwicklung und Testing',
          'Produktiv-Setzung und Monitoring',
          'Kontinuierliche Optimierung',
        ],
        benefits: ['24/7 Verfügbarkeit', 'Keine menschlichen Fehler', 'Skalierbarkeit'],
        aiTools: [
          { name: 'UiPath', description: 'Enterprise RPA Platform', category: 'RPA' },
          { name: 'Automation Anywhere', description: 'Intelligent Automation', category: 'RPA' },
        ],
        effort: 'medium',
        impact: 'high',
      },
      {
        id: 'automation-2',
        title: 'Intelligente Dokumentenverarbeitung',
        shortDescription: 'KI-basierte Extraktion aus Rechnungen und Belegen',
        implementationGuide: [
          'Analyse der Dokumententypen',
          'Training des OCR/ICR-Systems',
          'Integration in Workflows',
          'Qualitätskontrolle einrichten',
          'Kontinuierliches Training',
        ],
        benefits: ['95% automatische Erfassung', 'Schnellere Verarbeitung', 'Weniger Dateneingabe'],
        aiTools: [
          { name: 'ABBYY', description: 'Intelligente Dokumentenerfassung', category: 'IDP' },
          { name: 'Kofax', description: 'Document Intelligence', category: 'IDP' },
        ],
        effort: 'medium',
        impact: 'high',
      },
      {
        id: 'automation-3',
        title: 'Automatische Bankabstimmung',
        shortDescription: 'Vollautomatischer Abgleich von Banktransaktionen',
        implementationGuide: [
          'Analyse der Bankkontenstruktur',
          'Einrichtung automatischer Bankfeeds',
          'Konfiguration von Matching-Regeln',
          'Automatische Buchungserstellung',
          'Ausnahmenmanagement',
        ],
        benefits: ['99% automatisches Matching', 'Tägliche Aktualität', 'Frühe Fehlererkennung'],
        aiTools: [
          { name: 'BlackLine Cash Application', description: 'Cash Matching', category: 'Reconciliation' },
          { name: 'HighRadius Cash Application', description: 'AI Cash Matching', category: 'Treasury' },
        ],
        effort: 'low',
        impact: 'high',
      },
      {
        id: 'automation-4',
        title: 'Automatisiertes Mahnwesen',
        shortDescription: 'KI-gesteuerte Forderungsmanagement-Prozesse',
        implementationGuide: [
          'Segmentierung der Kunden',
          'Definition von Eskalationsstufen',
          'Automatische Mahngenerierung',
          'Intelligentes Timing',
          'Erfolgsmessung',
        ],
        benefits: ['Schnellerer Geldeingang', 'Konsistente Kommunikation', 'Reduzierte Ausfälle'],
        aiTools: [
          { name: 'HighRadius Collections', description: 'KI-Mahnwesen', category: 'AR' },
          { name: 'Esker', description: 'AR Automation', category: 'AR' },
        ],
        effort: 'medium',
        impact: 'medium',
      },
      {
        id: 'automation-5',
        title: 'Kreditorenprozess-Automatisierung',
        shortDescription: 'End-to-End-Automatisierung von der Rechnung zur Zahlung',
        implementationGuide: [
          'Prozessanalyse Purchase-to-Pay',
          'Digitaler Rechnungseingang',
          'Automatische Prüfung und Kontierung',
          'Workflow-basierte Freigabe',
          'Automatische Zahlung',
        ],
        benefits: ['70% weniger Aufwand', 'Skonto-Optimierung', 'Lieferantenzufriedenheit'],
        aiTools: [
          { name: 'SAP Ariba', description: 'Procurement Automation', category: 'P2P' },
          { name: 'Coupa', description: 'BSM Platform', category: 'P2P' },
        ],
        effort: 'high',
        impact: 'high',
      },
      {
        id: 'automation-6',
        title: 'Automatische Abgrenzungen',
        shortDescription: 'Systematische Berechnung und Buchung von Abgrenzungen',
        implementationGuide: [
          'Katalogisierung aller Abgrenzungsarten',
          'Regelbasierte Berechnungslogik',
          'Automatische Gegenbuchungen',
          'Dokumentation und Nachweise',
          'Regelmäßige Überprüfung',
        ],
        benefits: ['Keine vergessenen Abgrenzungen', 'Konsistente Methodik', 'Zeitersparnis'],
        aiTools: [
          { name: 'Blackline', description: 'Accrual Management', category: 'Close Management' },
          { name: 'Trintech', description: 'Financial Close', category: 'Close Management' },
        ],
        effort: 'medium',
        impact: 'medium',
      },
      {
        id: 'automation-7',
        title: 'Workflow-Automatisierung',
        shortDescription: 'Digitalisierung aller Freigabe- und Genehmigungsprozesse',
        implementationGuide: [
          'Mapping aller Workflows',
          'Standardisierung der Prozesse',
          'Implementierung der Workflows',
          'Mobile Freigaben ermöglichen',
          'Performance-Monitoring',
        ],
        benefits: ['Schnellere Durchlaufzeiten', 'Transparenz', 'Audit-Trail'],
        aiTools: [
          { name: 'Microsoft Power Automate', description: 'Low-Code Workflows', category: 'Workflow' },
          { name: 'Nintex', description: 'Process Automation', category: 'Workflow' },
        ],
        effort: 'low',
        impact: 'medium',
      },
      {
        id: 'automation-8',
        title: 'Anlagenbuchhaltung-Automatisierung',
        shortDescription: 'Automatisierte Abschreibungen und Anlagenverwaltung',
        implementationGuide: [
          'Bereinigung des Anlagenbestands',
          'Automatische AfA-Berechnung',
          'Integration mit Einkauf',
          'Automatische Zugänge/Abgänge',
          'Inventurunterstützung',
        ],
        benefits: ['Fehlerfreie Abschreibungen', 'Aktuelle Anlagenwerte', 'Weniger manuelle Pflege'],
        aiTools: [
          { name: 'SAP Asset Management', description: 'Anlagenbuchhaltung', category: 'ERP' },
          { name: 'Oracle Fixed Assets', description: 'Asset Lifecycle', category: 'ERP' },
        ],
        effort: 'medium',
        impact: 'medium',
      },
      {
        id: 'automation-9',
        title: 'Steuerautomatisierung',
        shortDescription: 'Automatische Steuerberechnung und -meldung',
        implementationGuide: [
          'Mapping der Steueranforderungen',
          'Automatische Steuerermittlung',
          'Systemintegration',
          'Automatische Meldungen',
          'Audit-Unterstützung',
        ],
        benefits: ['Compliance-Sicherheit', 'Weniger Steuerrisiken', 'Effiziente Meldeprozesse'],
        aiTools: [
          { name: 'Vertex', description: 'Tax Technology', category: 'Tax' },
          { name: 'Thomson Reuters ONESOURCE', description: 'Tax Compliance', category: 'Tax' },
        ],
        effort: 'high',
        impact: 'high',
      },
      {
        id: 'automation-10',
        title: 'Berichtsautomatisierung',
        shortDescription: 'Automatische Erstellung und Verteilung von Reports',
        implementationGuide: [
          'Standardisierung der Berichte',
          'Template-Erstellung',
          'Automatische Datenbefüllung',
          'Geplante Verteilung',
          'Self-Service-Optionen',
        ],
        benefits: ['Sofortige Berichte', 'Konsistenz', 'Entlastung des Teams'],
        aiTools: [
          { name: 'Workiva', description: 'Reporting Automation', category: 'Reporting' },
          { name: 'Narrative Science', description: 'Automated Narratives', category: 'AI Reporting' },
        ],
        effort: 'low',
        impact: 'medium',
      },
    ],
  },
  {
    id: 'insights',
    title: 'Erkenntnisse',
    description: 'Gewinnung wertvoller Insights aus Finanzdaten',
    icon: 'lightbulb.fill',
    color: '#F59E0B',
    levers: [
      {
        id: 'insights-1',
        title: 'Predictive Analytics',
        shortDescription: 'KI-basierte Vorhersagen für Cashflow und Ergebnis',
        implementationGuide: [
          'Identifizierung relevanter Vorhersagefälle',
          'Datenaufbereitung und -qualität',
          'Modellentwicklung und Training',
          'Integration in Planungsprozesse',
          'Kontinuierliche Modellverbesserung',
        ],
        benefits: ['Bessere Planungsgenauigkeit', 'Frühere Warnungen', 'Proaktive Steuerung'],
        aiTools: [
          { name: 'IBM Planning Analytics', description: 'KI-Forecasting', category: 'FP&A' },
          { name: 'Anaplan', description: 'Predictive Planning', category: 'FP&A' },
        ],
        effort: 'high',
        impact: 'high',
      },
      {
        id: 'insights-2',
        title: 'Automatische Anomalie-Erkennung',
        shortDescription: 'KI-gestützte Identifikation ungewöhnlicher Transaktionen',
        implementationGuide: [
          'Definition von Normalverhalten',
          'ML-Modell für Anomalieerkennung',
          'Integration in Tagesgeschäft',
          'Alerting und Eskalation',
          'Feedback-Loop für Training',
        ],
        benefits: ['Frühe Fraud-Erkennung', 'Risikominimierung', 'Proaktive Kontrolle'],
        aiTools: [
          { name: 'MindBridge', description: 'AI Auditor', category: 'Audit' },
          { name: 'DataRobot', description: 'AutoML Platform', category: 'AI/ML' },
        ],
        effort: 'medium',
        impact: 'high',
      },
      {
        id: 'insights-3',
        title: 'Natural Language Queries',
        shortDescription: 'Datenabfrage in natürlicher Sprache',
        implementationGuide: [
          'Auswahl geeigneter Tools',
          'Verbindung mit Datenquellen',
          'Training für Fachterminologie',
          'Nutzerakzeptanz fördern',
          'Erweiterung der Fähigkeiten',
        ],
        benefits: ['Demokratisierung von Daten', 'Schnellere Antworten', 'Entlastung BI-Team'],
        aiTools: [
          { name: 'ThoughtSpot', description: 'Search & AI Analytics', category: 'BI' },
          { name: 'Power BI Copilot', description: 'Natural Language BI', category: 'BI' },
        ],
        effort: 'medium',
        impact: 'medium',
      },
      {
        id: 'insights-4',
        title: 'Automatische Kommentierung',
        shortDescription: 'KI-generierte Erläuterungen zu Abweichungen',
        implementationGuide: [
          'Training mit historischen Kommentaren',
          'Integration in Berichtssystem',
          'Qualitätssicherung der Texte',
          'Nutzeranpassung ermöglichen',
          'Kontinuierliches Training',
        ],
        benefits: ['Zeitersparnis', 'Konsistente Erklärungen', 'Schnellere Berichte'],
        aiTools: [
          { name: 'Narrative Science Quill', description: 'Automated Narratives', category: 'NLG' },
          { name: 'Arria NLG', description: 'Natural Language Generation', category: 'NLG' },
        ],
        effort: 'medium',
        impact: 'medium',
      },
      {
        id: 'insights-5',
        title: 'Treiberbaum-Analysen',
        shortDescription: 'Automatische Zerlegung von KPIs in Treiber',
        implementationGuide: [
          'Definition der KPI-Hierarchien',
          'Automatische Berechnung der Beiträge',
          'Visualisierung in Treiberbbäumen',
          'Drill-Down-Funktionalität',
          'What-If-Szenarien',
        ],
        benefits: ['Tiefes Verständnis', 'Schnelle Root-Cause-Analyse', 'Fundierte Entscheidungen'],
        aiTools: [
          { name: 'Jedox', description: 'Driver-Based Planning', category: 'FP&A' },
          { name: 'Board', description: 'Decision Making Platform', category: 'FP&A' },
        ],
        effort: 'medium',
        impact: 'high',
      },
      {
        id: 'insights-6',
        title: 'Benchmark-Analysen',
        shortDescription: 'Automatischer Vergleich mit Wettbewerbern und Branchen',
        implementationGuide: [
          'Identifizierung relevanter Benchmarks',
          'Datenquellen einbinden',
          'Automatische Vergleichsberechnungen',
          'Visualisierung der Positionierung',
          'Handlungsempfehlungen ableiten',
        ],
        benefits: ['Marktperspektive', 'Identifikation von Gaps', 'Strategische Insights'],
        aiTools: [
          { name: 'Bloomberg Terminal', description: 'Financial Data', category: 'Data Provider' },
          { name: 'S&P Capital IQ', description: 'Market Intelligence', category: 'Data Provider' },
        ],
        effort: 'low',
        impact: 'medium',
      },
      {
        id: 'insights-7',
        title: 'Szenario-Modellierung',
        shortDescription: 'KI-unterstützte Simulation von Zukunftsszenarien',
        implementationGuide: [
          'Definition relevanter Szenarien',
          'Modellierung der Wirkungszusammenhänge',
          'Automatische Berechnung der Auswirkungen',
          'Visualisierung der Ergebnisse',
          'Integration in Planung',
        ],
        benefits: ['Bessere Vorbereitung', 'Schnellere Reaktion', 'Fundierte Strategien'],
        aiTools: [
          { name: 'Anaplan', description: 'Scenario Planning', category: 'FP&A' },
          { name: 'Workday Adaptive', description: 'Enterprise Planning', category: 'FP&A' },
        ],
        effort: 'high',
        impact: 'high',
      },
      {
        id: 'insights-8',
        title: 'Cash-Flow-Prognose',
        shortDescription: 'KI-basierte tägliche Liquiditätsvorhersage',
        implementationGuide: [
          'Integration aller Cash-Quellen',
          'ML-Modell für Prognosen',
          'Tägliche Aktualisierung',
          'Alarmierung bei Engpässen',
          'Optimierungsempfehlungen',
        ],
        benefits: ['Optimierte Liquidität', 'Weniger Überraschungen', 'Bessere Rendite'],
        aiTools: [
          { name: 'Kyriba', description: 'Treasury Management', category: 'Treasury' },
          { name: 'GTreasury', description: 'Cash Forecasting', category: 'Treasury' },
        ],
        effort: 'high',
        impact: 'high',
      },
      {
        id: 'insights-9',
        title: 'Risiko-Scoring',
        shortDescription: 'Automatische Bewertung finanzieller Risiken',
        implementationGuide: [
          'Definition von Risikokategorien',
          'Scoring-Modell entwickeln',
          'Automatische Datenaggregation',
          'Dashboard für Risikomanager',
          'Frühwarnsystem',
        ],
        benefits: ['Proaktives Risikomanagement', 'Priorisierung', 'Bessere Entscheidungen'],
        aiTools: [
          { name: 'SAS Risk Management', description: 'Enterprise Risk', category: 'Risk' },
          { name: 'Moody\'s Analytics', description: 'Credit Risk', category: 'Risk' },
        ],
        effort: 'high',
        impact: 'high',
      },
      {
        id: 'insights-10',
        title: 'Performance-Attribution',
        shortDescription: 'Automatische Zerlegung der Ergebnisveränderung',
        implementationGuide: [
          'Definition der Attributionsfaktoren',
          'Berechungslogik implementieren',
          'Automatische Monatliche Analyse',
          'Visualisierung der Treiber',
          'Management-Reporting',
        ],
        benefits: ['Klare Erfolgszuordnung', 'Transparente Kommunikation', 'Fokussierte Steuerung'],
        aiTools: [
          { name: 'SAP Analytics Cloud', description: 'Variance Analysis', category: 'Analytics' },
          { name: 'Oracle EPM', description: 'Performance Management', category: 'CPM' },
        ],
        effort: 'medium',
        impact: 'medium',
      },
    ],
  },
];

export const getAllAITools = (): AITool[] => {
  const toolsMap = new Map<string, AITool>();
  
  goals.forEach(goal => {
    goal.levers.forEach(lever => {
      lever.aiTools.forEach(tool => {
        if (!toolsMap.has(tool.name)) {
          toolsMap.set(tool.name, tool);
        }
      });
    });
  });
  
  return Array.from(toolsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};

export const getToolCategories = (): string[] => {
  const categories = new Set<string>();
  
  goals.forEach(goal => {
    goal.levers.forEach(lever => {
      lever.aiTools.forEach(tool => {
        categories.add(tool.category);
      });
    });
  });
  
  return Array.from(categories).sort();
};
