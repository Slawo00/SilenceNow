import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../utils/constants';

export default function EventDetailScreen({ route, navigation }) {
  const { event } = route.params;

  const date = new Date(event.timestamp);
  const timeString = date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const dateString = date.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Determine hour for quiet time check
  const hour = date.getHours();
  const isNighttime = hour >= 22 || hour < 6;
  const isEvening = hour >= 19 || hour < 7;

  // Get AI classification data
  const aiEmoji = event.aiEmoji || event.ai_emoji || getDefaultEmoji(event.classification);
  const aiType = event.aiType || event.ai_type || event.classification || 'Unbekannt';
  const aiConfidence = event.aiConfidence || event.ai_confidence || 0;
  const aiDescription = event.aiDescription || event.ai_description || '';
  const aiLegalCategory = event.aiLegalCategory || event.ai_legal_category || '';
  const aiSeverity = event.aiSeverity || event.ai_severity || 'medium';

  // Frequency data
  const freqBass = event.freq_bass || event.freqBands?.bass || 0;
  const freqLowMid = event.freq_low_mid || event.freqBands?.lowMid || 0;
  const freqMid = event.freq_mid || event.freqBands?.mid || 0;
  const freqHighMid = event.freq_high_mid || event.freqBands?.highMid || 0;
  const freqHigh = event.freq_high || event.freqBands?.high || 0;
  const maxFreq = Math.max(freqBass, freqLowMid, freqMid, freqHighMid, freqHigh, 1);

  // Legal score
  const legalScore = event.legal_score || event.legalScore || 0;

  function getDefaultEmoji(classification) {
    if (!classification) return '🔊';
    if (classification.includes('Music') || classification.includes('Musik')) return '🎵';
    if (classification.includes('Very Loud') || classification.includes('Stark')) return '📢';
    if (classification.includes('Stimmen') || classification.includes('Voice')) return '🗣️';
    if (classification.includes('Bau') || classification.includes('Hammer')) return '🔨';
    if (classification.includes('Maschine') || classification.includes('Brumm')) return '⚙️';
    return '🔊';
  }

  function getSeverityColor(severity) {
    switch (severity) {
      case 'high': return '#E53935';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return COLORS.WARM_GREY;
    }
  }

  function getSeverityLabel(severity) {
    switch (severity) {
      case 'high': return 'Hoch';
      case 'medium': return 'Mittel';
      case 'low': return 'Gering';
      default: return 'Unbekannt';
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Zurück</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Event Details</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Main Classification Card */}
      <View style={styles.card}>
        <Text style={styles.emoji}>{aiEmoji}</Text>
        <Text style={styles.classification}>{aiType}</Text>
        {aiConfidence > 0 && (
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>
              KI-Konfidenz: {aiConfidence}%
            </Text>
          </View>
        )}
        <Text style={styles.datetime}>{dateString}</Text>
        <Text style={styles.time}>{timeString}</Text>
        {isNighttime && (
          <View style={styles.nightBadge}>
            <Text style={styles.nightBadgeText}>🌙 Nachtruhe (22-06 Uhr)</Text>
          </View>
        )}
      </View>

      {/* AI Analysis Card */}
      {aiDescription ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 KI-Analyse</Text>
          <Text style={styles.aiDescription}>{aiDescription}</Text>
          <View style={styles.aiGrid}>
            <View style={styles.aiGridItem}>
              <Text style={styles.aiGridLabel}>Kategorie</Text>
              <Text style={styles.aiGridValue}>
                {aiLegalCategory ? aiLegalCategory.replace(/_/g, ' ') : '-'}
              </Text>
            </View>
            <View style={styles.aiGridItem}>
              <Text style={styles.aiGridLabel}>Schwere</Text>
              <Text style={[styles.aiGridValue, { color: getSeverityColor(aiSeverity) }]}>
                {getSeverityLabel(aiSeverity)}
              </Text>
            </View>
            <View style={styles.aiGridItem}>
              <Text style={styles.aiGridLabel}>Konfidenz</Text>
              <Text style={styles.aiGridValue}>{aiConfidence}%</Text>
            </View>
          </View>
        </View>
      ) : null}

      {/* Measurement Data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Messdaten</Text>
        <DataRow label="Dezibel" value={`${event.decibel} dB`} highlight={event.decibel > 75} />
        <DataRow
          label="Dauer"
          value={event.duration ? `${Math.floor(event.duration / 60)}m ${event.duration % 60}s` : 'N/A'}
        />
        <DataRow
          label="Intensität"
          value={event.decibel >= 85 ? 'Extrem' : event.decibel >= 75 ? 'Sehr hoch' : event.decibel >= 60 ? 'Hoch' : 'Mäßig'}
          highlight={event.decibel >= 75}
        />
        <DataRow
          label="Tageszeit"
          value={isNighttime ? '🌙 Nachtruhe' : isEvening ? '🌆 Abend' : '☀️ Tag'}
        />
        {legalScore > 0 && (
          <DataRow
            label="Legal Score"
            value={`${legalScore}/100`}
            highlight={legalScore > 60}
          />
        )}
      </View>

      {/* Frequency Profile */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎛️ Frequenz-Profil</Text>
        {maxFreq > 0 ? (
          <>
            <FrequencyBar label="Bass" value={freqBass} max={maxFreq} color="#E53935" />
            <FrequencyBar label="Low-Mid" value={freqLowMid} max={maxFreq} color="#FF9800" />
            <FrequencyBar label="Mid" value={freqMid} max={maxFreq} color="#4CAF50" />
            <FrequencyBar label="High-Mid" value={freqHighMid} max={maxFreq} color="#2196F3" />
            <FrequencyBar label="High" value={freqHigh} max={maxFreq} color="#9C27B0" />
            
            {/* Frequency interpretation */}
            <View style={styles.freqInterpretation}>
              <Text style={styles.freqInterpretationText}>
                {freqBass > freqMid && freqBass > freqHigh
                  ? '🎵 Bass-dominantes Geräusch - typisch für Musik, Subwoofer'
                  : freqMid > freqBass && freqMid > freqHigh
                  ? '🗣️ Mittenbetontes Geräusch - typisch für Stimmen, TV'
                  : freqHigh > freqMid
                  ? '🔧 Höhenbetontes Geräusch - typisch für Werkzeuge, Alarme'
                  : '📊 Gleichmäßige Verteilung - Breitbandgeräusch'}
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.noDataText}>Keine Frequenzdaten verfügbar</Text>
        )}
      </View>

      {/* Legal Reference */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚖️ Rechtliche Einordnung</Text>
        <View style={[styles.legalBox, isNighttime && styles.legalBoxNight]}>
          <Text style={styles.legalText}>
            {isNighttime
              ? `🔴 Nachtruhestörung (${timeString}): Dieses Ereignis fand während der gesetzlichen Nachtruhe (22:00-06:00) statt und wiegt rechtlich besonders schwer.`
              : `Dieses Ereignis wurde um ${timeString} Uhr aufgezeichnet.`}
          </Text>
          <Text style={[styles.legalText, { marginTop: 8 }]}>
            {event.decibel >= 55
              ? `✅ ${event.decibel} dB liegt ÜBER dem Schwellenwert von 55 dB. Eine Mietminderung nach §536 BGB kann begründet sein.`
              : `Messwert von ${event.decibel} dB liegt unter dem Schwellenwert. Für eine Mietminderung werden i.d.R. >55 dB benötigt.`}
          </Text>
          {event.decibel >= 80 && (
            <Text style={[styles.legalText, styles.legalHighlight, { marginTop: 8 }]}>
              ⚠️ {event.decibel} dB kann gesundheitsschädigend sein! Dies stärkt die Rechtsposition erheblich (BGH VIII ZR 155/11).
            </Text>
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Coming Soon', 'Zeugen-Funktion kommt in Phase 2')}
        >
          <Text style={styles.actionButtonText}>👤 Zeuge hinzufügen</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Coming Soon', 'Notiz-Funktion kommt in Phase 2')}
        >
          <Text style={styles.actionButtonText}>📝 Notiz hinzufügen</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const DataRow = ({ label, value, highlight = false }) => (
  <View style={styles.dataRow}>
    <Text style={styles.dataLabel}>{label}</Text>
    <Text style={[styles.dataValue, highlight && styles.dataValueHighlight]}>{value}</Text>
  </View>
);

const FrequencyBar = ({ label, value, max, color }) => {
  const percentage = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <View style={styles.freqRow}>
      <Text style={styles.freqLabel}>{label}</Text>
      <View style={styles.freqBarContainer}>
        <View style={[styles.freqBar, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.freqValue}>{Math.round(value * 10) / 10}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.MIDNIGHT_BLUE,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    fontSize: 18,
    color: COLORS.ELECTRIC_GREEN,
    width: 60,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.SOFT_WHITE,
  },
  card: {
    backgroundColor: COLORS.SOFT_WHITE,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  classification: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.MIDNIGHT_BLUE,
    marginBottom: 4,
    textAlign: 'center',
  },
  confidenceBadge: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  confidenceText: {
    fontSize: 12,
    color: COLORS.ELECTRIC_GREEN,
    fontWeight: '600',
  },
  datetime: {
    fontSize: 14,
    color: COLORS.WARM_GREY,
    marginBottom: 4,
  },
  time: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
  },
  nightBadge: {
    backgroundColor: '#E53935',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 12,
  },
  nightBadgeText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },

  // AI Section
  section: {
    backgroundColor: COLORS.SOFT_WHITE,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
    marginBottom: 16,
  },
  aiDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 16,
  },
  aiGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
  },
  aiGridItem: {
    alignItems: 'center',
  },
  aiGridLabel: {
    fontSize: 11,
    color: COLORS.WARM_GREY,
    marginBottom: 4,
  },
  aiGridValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
    textTransform: 'capitalize',
  },

  // Data Rows
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dataLabel: {
    fontSize: 14,
    color: COLORS.WARM_GREY,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
  },
  dataValueHighlight: {
    color: '#E53935',
  },

  // Frequency
  freqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  freqLabel: {
    fontSize: 13,
    color: COLORS.WARM_GREY,
    width: 65,
  },
  freqBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  freqBar: {
    height: '100%',
    borderRadius: 6,
  },
  freqValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
    width: 45,
    textAlign: 'right',
  },
  freqInterpretation: {
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  freqInterpretationText: {
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
  },
  noDataText: {
    fontSize: 14,
    color: COLORS.WARM_GREY,
    fontStyle: 'italic',
  },

  // Legal
  legalBox: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.ELECTRIC_GREEN,
  },
  legalBoxNight: {
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    borderColor: '#E53935',
  },
  legalText: {
    fontSize: 13,
    color: COLORS.MIDNIGHT_BLUE,
    lineHeight: 20,
  },
  legalHighlight: {
    fontWeight: '600',
    color: '#E53935',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(248, 249, 250, 0.1)',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(248, 249, 250, 0.2)',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.SOFT_WHITE,
  },
});