import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../utils/constants';
import DatabaseService from '../services/DatabaseService';

const STRENGTH_CONFIG = {
  very_strong: { label: 'Sehr stark', color: '#00E676', emoji: '💪' },
  strong: { label: 'Stark', color: '#66BB6A', emoji: '✅' },
  moderate: { label: 'Mäßig', color: '#FFC107', emoji: '⚠️' },
  developing: { label: 'Im Aufbau', color: '#FF9800', emoji: '📈' },
  weak: { label: 'Schwach', color: '#F44336', emoji: '⚡' },
  insufficient_data: { label: 'Zu wenig Daten', color: '#9E9E9E', emoji: '📊' },
};

export default function ReportsScreen({ navigation }) {
  const [legalSummary, setLegalSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(14);

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    setLoading(true);
    try {
      const summary = await DatabaseService.getLegalSummary(selectedPeriod);
      setLegalSummary(summary);
    } catch (error) {
      console.error('[Reports] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const strengthConfig = STRENGTH_CONFIG[legalSummary?.legalStrength] || STRENGTH_CONFIG.insufficient_data;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>‹ Zurück</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rechtliche Bewertung</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.ELECTRIC_GREEN} />
          <Text style={styles.loadingText}>Daten werden analysiert...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Zurück</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rechtliche Bewertung</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {[7, 14, 30].map((days) => (
            <TouchableOpacity
              key={days}
              style={[styles.periodButton, selectedPeriod === days && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod(days)}
            >
              <Text style={[styles.periodButtonText, selectedPeriod === days && styles.periodButtonTextActive]}>
                {days} Tage
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Legal Strength Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚖️ Rechtsposition</Text>
          <View style={[styles.strengthCard, { borderLeftColor: strengthConfig.color }]}>
            <Text style={styles.strengthEmoji}>{strengthConfig.emoji}</Text>
            <Text style={[styles.strengthLabel, { color: strengthConfig.color }]}>
              {strengthConfig.label}
            </Text>
            <Text style={styles.strengthDescription}>
              {legalSummary?.recommendation || 'Weiter dokumentieren.'}
            </Text>
          </View>
        </View>

        {/* Statistics Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Übersicht ({selectedPeriod} Tage)</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{legalSummary?.totalEvents || 0}</Text>
              <Text style={styles.statLabel}>Ereignisse</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{legalSummary?.avgDecibel || 0} dB</Text>
              <Text style={styles.statLabel}>Ø Pegel</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: COLORS.ERROR_RED }]}>
                {legalSummary?.nightViolations || 0}
              </Text>
              <Text style={styles.statLabel}>Nachtruhestörungen</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: COLORS.WARNING_AMBER }]}>
                {legalSummary?.highSeverityEvents || 0}
              </Text>
              <Text style={styles.statLabel}>Schwere Vorfälle</Text>
            </View>
          </View>
        </View>

        {/* Rent Reduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏠 Mietminderung nach §536 BGB</Text>
          <View style={styles.rentCard}>
            <Text style={styles.rentPercent}>
              {legalSummary?.rentReductionPercent || 0}%
            </Text>
            <Text style={styles.rentLabel}>Geschätzte Mietminderung</Text>
            <View style={styles.rentBar}>
              <View
                style={[
                  styles.rentBarFill,
                  { width: `${Math.min(legalSummary?.rentReductionPercent || 0, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.rentNote}>
              Basierend auf {legalSummary?.totalEvents || 0} dokumentierten Ereignissen
              {legalSummary?.nightViolations > 0 ? ` und ${legalSummary.nightViolations} Nachtruhestörungen` : ''}.
            </Text>
          </View>
        </View>

        {/* Legal Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Rechtliche Grundlagen</Text>
          
          <View style={styles.legalInfoCard}>
            <Text style={styles.legalInfoTitle}>§536 BGB — Mietminderung</Text>
            <Text style={styles.legalInfoText}>
              Bei erheblicher Lärmbelästigung kann die Miete gemindert werden. 
              Voraussetzung: Die Beeinträchtigung muss über das ortsübliche Maß hinausgehen 
              und regelmäßig auftreten.
            </Text>
          </View>

          <View style={styles.legalInfoCard}>
            <Text style={styles.legalInfoTitle}>Nachtruhe (22:00 - 06:00)</Text>
            <Text style={styles.legalInfoText}>
              Während der gesetzlichen Nachtruhe gilt ein strengerer Maßstab. 
              Richtwert: 30 dB innerhalb der Wohnung. Verstöße wiegen rechtlich besonders schwer.
            </Text>
          </View>

          <View style={styles.legalInfoCard}>
            <Text style={styles.legalInfoTitle}>Beweissicherung</Text>
            <Text style={styles.legalInfoText}>
              Führen Sie ein lückenloses Lärmprotokoll über mindestens 14 Tage. 
              Dokumentieren Sie Uhrzeit, Dauer, Art und Lautstärke. 
              Zeugenaussagen stärken Ihre Position erheblich.
            </Text>
          </View>
        </View>

        {/* Daily Summaries */}
        {legalSummary?.dailySummaries && legalSummary.dailySummaries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Tagesübersicht</Text>
            {legalSummary.dailySummaries.slice(0, 14).map((day, index) => (
              <View key={index} style={styles.dayRow}>
                <Text style={styles.dayDate}>
                  {new Date(day.date || day.day).toLocaleDateString('de-DE', {
                    weekday: 'short',
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </Text>
                <View style={styles.dayStats}>
                  <Text style={styles.dayEvents}>{day.event_count || day.events || 0} Events</Text>
                  <Text style={styles.dayDecibel}>{Math.round(day.avg_decibel || day.avgDb || 0)} dB</Text>
                  {(day.night_events > 0) && (
                    <Text style={styles.dayNight}>🌙 {day.night_events}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📤 Aktionen</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📄 PDF-Report erstellen</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]}>
            <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
              ✉️ An Vermieter senden
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.MIDNIGHT_BLUE,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    color: COLORS.ELECTRIC_GREEN,
    fontSize: 18,
    fontWeight: '600',
  },
  headerTitle: {
    color: COLORS.SOFT_WHITE,
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.WARM_GREY,
    marginTop: 12,
    fontSize: 14,
  },

  // Period Selector
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#243447',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: COLORS.ELECTRIC_GREEN,
  },
  periodButtonText: {
    color: COLORS.WARM_GREY,
    fontSize: 14,
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: COLORS.MIDNIGHT_BLUE,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.SOFT_WHITE,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  // Strength Card
  strengthCard: {
    backgroundColor: '#243447',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  strengthEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  strengthLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  strengthDescription: {
    color: COLORS.WARM_GREY,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#243447',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.SOFT_WHITE,
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.WARM_GREY,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },

  // Rent Card
  rentCard: {
    backgroundColor: '#243447',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  rentPercent: {
    color: COLORS.ELECTRIC_GREEN,
    fontSize: 48,
    fontWeight: 'bold',
  },
  rentLabel: {
    color: COLORS.SOFT_WHITE,
    fontSize: 16,
    marginTop: 4,
    marginBottom: 16,
  },
  rentBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#1A2332',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  rentBarFill: {
    height: '100%',
    backgroundColor: COLORS.ELECTRIC_GREEN,
    borderRadius: 4,
  },
  rentNote: {
    color: COLORS.WARM_GREY,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Legal Info
  legalInfoCard: {
    backgroundColor: '#243447',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  legalInfoTitle: {
    color: COLORS.SOFT_WHITE,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  legalInfoText: {
    color: COLORS.WARM_GREY,
    fontSize: 13,
    lineHeight: 20,
  },

  // Daily Summaries
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#243447',
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
  },
  dayDate: {
    color: COLORS.SOFT_WHITE,
    fontSize: 14,
    fontWeight: '600',
    width: 80,
  },
  dayStats: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  dayEvents: {
    color: COLORS.WARM_GREY,
    fontSize: 13,
  },
  dayDecibel: {
    color: COLORS.ELECTRIC_GREEN,
    fontSize: 13,
    fontWeight: '600',
  },
  dayNight: {
    color: COLORS.ERROR_RED,
    fontSize: 13,
  },

  // Actions
  actionButton: {
    backgroundColor: COLORS.ELECTRIC_GREEN,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    color: COLORS.MIDNIGHT_BLUE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.ELECTRIC_GREEN,
  },
  actionButtonTextSecondary: {
    color: COLORS.ELECTRIC_GREEN,
  },
});
