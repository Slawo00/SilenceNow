/**
 * ReportsScreen - Legal Reports & §536 BGB Assessment
 * Punkt 7 + 8: PDF Reports + Rechtliche Bewertung
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../utils/constants';
import DatabaseService from '../services/DatabaseService';
import ReportService from '../services/ReportService';
import LegalService from '../services/LegalService';

export default function ReportsScreen({ navigation }) {
  const [legalAssessment, setLegalAssessment] = useState(null);
  const [quickEstimate, setQuickEstimate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [assessment, estimate] = await Promise.all([
        LegalService.generateLegalAssessment({ days: 14 }),
        LegalService.getQuickEstimate()
      ]);
      setLegalAssessment(assessment);
      setQuickEstimate(estimate);
    } catch (error) {
      console.error('Failed to load legal data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const result = await ReportService.generateReport({
        days: 14,
        includeDetails: true,
        language: 'de',
        userInfo: {
          // Will be filled from user settings when available
        }
      });

      if (result.success) {
        Alert.alert(
          'Bericht erstellt! 📄',
          `Dein 14-Tage Lärmprotokoll wurde generiert.\n\n` +
          `${result.summary.totalEvents} Ereignisse dokumentiert\n` +
          `${result.summary.nightViolations} Nachtruhestörungen\n` +
          `Rechtsposition: ${result.summary.legalStrength}`,
          [
            { text: 'Teilen', onPress: () => ReportService.shareReport(result.uri) },
            { text: 'OK' }
          ]
        );
      } else {
        Alert.alert('Fehler', result.error || 'Bericht konnte nicht erstellt werden.');
      }
    } catch (error) {
      Alert.alert('Fehler', 'Ein unerwarteter Fehler ist aufgetreten.');
      console.error('PDF generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.ELECTRIC_GREEN} />
        <Text style={styles.loadingText}>Rechtliche Analyse wird geladen...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Zurück</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rechtliche Bewertung</Text>
        <Text style={styles.headerSubtitle}>§536 BGB Mietminderung</Text>
      </View>

      {/* Quick Estimate Card */}
      {quickEstimate && (
        <View style={styles.estimateCard}>
          <Text style={styles.estimateTitle}>💰 Geschätzte Mietminderung</Text>
          <Text style={styles.estimatePercent}>{quickEstimate.percent}%</Text>
          <Text style={styles.estimateConfidence}>
            Konfidenz: {quickEstimate.confidence}
          </Text>
          <Text style={styles.estimateMessage}>{quickEstimate.message}</Text>
          {quickEstimate.needsMoreData && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ Mehr Daten nötig. Mindestens 14 Tage dokumentieren für belastbare Schätzung.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Legal Assessment */}
      {legalAssessment && !legalAssessment.error && (
        <>
          {/* Rechtsposition */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>⚖️ Deine Rechtsposition</Text>
            <View style={styles.assessmentRow}>
              <Text style={styles.assessmentLabel}>Bewertung:</Text>
              <Text style={[styles.assessmentValue, 
                legalAssessment.legalAssessment.strengthLevel === 'very_strong' && styles.textStrong,
                legalAssessment.legalAssessment.strengthLevel === 'strong' && styles.textGood,
                legalAssessment.legalAssessment.strengthLevel === 'moderate' && styles.textModerate,
              ]}>
                {legalAssessment.legalAssessment.strength}
              </Text>
            </View>
            <View style={styles.assessmentRow}>
              <Text style={styles.assessmentLabel}>Grundlage:</Text>
              <Text style={styles.assessmentValue}>
                {legalAssessment.legalAssessment.basisParagraph}
              </Text>
            </View>
            
            {/* Weitere Paragraphen */}
            {legalAssessment.legalAssessment.additionalParagraphs?.length > 0 && (
              <View style={styles.paragraphBox}>
                <Text style={styles.paragraphTitle}>Relevante Rechtsgrundlagen:</Text>
                {legalAssessment.legalAssessment.additionalParagraphs.map((p, i) => (
                  <Text key={i} style={styles.paragraphItem}>• {p}</Text>
                ))}
              </View>
            )}
          </View>

          {/* Statistiken */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>📊 Zusammenfassung (14 Tage)</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{legalAssessment.summary.totalEvents}</Text>
                <Text style={styles.statLabel}>Ereignisse</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{legalAssessment.summary.nightViolations}</Text>
                <Text style={styles.statLabel}>Nachts</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{legalAssessment.summary.highSeverityEvents}</Text>
                <Text style={styles.statLabel}>Schwer</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{legalAssessment.summary.avgDecibel} dB</Text>
                <Text style={styles.statLabel}>Ø Laut</Text>
              </View>
            </View>
          </View>

          {/* Mietminderung */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>💶 Mietminderungsanspruch</Text>
            <View style={styles.reductionBox}>
              <Text style={styles.reductionPercent}>
                {legalAssessment.rentReduction.percent}%
              </Text>
              <Text style={styles.reductionLabel}>Geschätzte Mietminderung</Text>
              {legalAssessment.rentReduction.monthlyAmount !== null && (
                <Text style={styles.reductionAmount}>
                  ca. {legalAssessment.rentReduction.monthlyAmount}€ / Monat
                </Text>
              )}
            </View>
            
            {/* Berechnungsfaktoren */}
            {legalAssessment.rentReduction.calculation?.length > 0 && (
              <View style={styles.factorsBox}>
                <Text style={styles.factorsTitle}>Berechnungsgrundlage:</Text>
                {legalAssessment.rentReduction.calculation.map((factor, i) => (
                  <Text key={i} style={styles.factorItem}>✓ {factor}</Text>
                ))}
              </View>
            )}

            {/* Gerichtsentscheidungen */}
            {legalAssessment.rentReduction.courtReferences?.length > 0 && (
              <View style={styles.referencesBox}>
                <Text style={styles.referencesTitle}>Relevante Urteile:</Text>
                {legalAssessment.rentReduction.courtReferences.map((ref, i) => (
                  <Text key={i} style={styles.referenceItem}>📋 {ref}</Text>
                ))}
              </View>
            )}
          </View>

          {/* Beweisqualität */}
          {legalAssessment.evidenceQuality && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>🔍 Beweisqualität</Text>
              <Text style={styles.qualityScore}>
                {legalAssessment.evidenceQuality.score}/100 - {legalAssessment.evidenceQuality.quality}
              </Text>
              
              {/* Kriterien */}
              {legalAssessment.evidenceQuality.criteria?.map((criterion, i) => (
                <View key={i} style={styles.criterionRow}>
                  <Text style={styles.criterionIcon}>{criterion.met ? '✅' : '❌'}</Text>
                  <Text style={styles.criterionText}>{criterion.name}</Text>
                  <Text style={styles.criterionPoints}>{criterion.points}P</Text>
                </View>
              ))}
              
              <Text style={styles.qualityRecommendation}>
                {legalAssessment.evidenceQuality.recommendation}
              </Text>
            </View>
          )}

          {/* Empfehlungen */}
          {legalAssessment.recommendations?.length > 0 && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>📋 Empfehlungen</Text>
              {legalAssessment.recommendations.map((rec, i) => (
                <View key={i} style={[styles.recCard, 
                  rec.priority === 'hoch' && styles.recCardHigh,
                  rec.priority === 'mittel' && styles.recCardMedium
                ]}>
                  <View style={styles.recHeader}>
                    <Text style={styles.recPriority}>
                      {rec.priority === 'hoch' ? '🔴' : rec.priority === 'mittel' ? '🟡' : '🟢'} {rec.category}
                    </Text>
                  </View>
                  <Text style={styles.recAction}>{rec.action}</Text>
                  <Text style={styles.recDetails}>{rec.details}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Relevante Gerichtsentscheidungen */}
          {legalAssessment.relevantDecisions?.length > 0 && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>⚖️ Vergleichbare Urteile</Text>
              {legalAssessment.relevantDecisions.map((decision, i) => (
                <View key={i} style={styles.decisionCard}>
                  <Text style={styles.decisionRef}>{decision.reference}</Text>
                  <Text style={styles.decisionDesc}>{decision.description}</Text>
                  <Text style={styles.decisionReduction}>
                    Zugesprochene Mietminderung: {decision.reduction}%
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      {/* Action Buttons */}
      <View style={styles.generateSection}>
        <TouchableOpacity
          style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
          onPress={generatePDF}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color={COLORS.MIDNIGHT_BLUE} />
          ) : (
            <Text style={styles.generateButtonText}>📄 PDF-Bericht erstellen</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.generateHint}>
          Erstellt ein gerichtsfestes 14-Tage Lärmprotokoll als PDF
        </Text>

        <TouchableOpacity
          style={styles.lettersButton}
          onPress={() => navigation.navigate('Letters')}
        >
          <Text style={styles.lettersButtonText}>📋 Musterbriefe generieren</Text>
        </TouchableOpacity>
        <Text style={styles.generateHint}>
          Mängelanzeige, Mietminderung, Ordnungsamt-Beschwerde
        </Text>
      </View>

      {/* Legal Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ⚠️ Hinweis: Diese App bietet keine Rechtsberatung. Die Mietminderungsschätzungen 
          basieren auf dokumentierten Gerichtsentscheidungen und dienen als Orientierung. 
          Für eine verbindliche Beurteilung konsultieren Sie einen Fachanwalt für Mietrecht.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.MIDNIGHT_BLUE,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.WARM_GREY,
    marginTop: 12,
    fontSize: 14,
  },
  
  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    color: COLORS.ELECTRIC_GREEN,
    fontSize: 16,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.SOFT_WHITE,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.WARM_GREY,
    marginTop: 4,
  },

  // Estimate Card
  estimateCard: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: COLORS.ELECTRIC_GREEN,
    alignItems: 'center',
  },
  estimateTitle: {
    fontSize: 16,
    color: COLORS.SOFT_WHITE,
    fontWeight: '600',
    marginBottom: 8,
  },
  estimatePercent: {
    fontSize: 56,
    fontWeight: 'bold',
    color: COLORS.ELECTRIC_GREEN,
  },
  estimateConfidence: {
    fontSize: 14,
    color: COLORS.WARM_GREY,
    marginTop: 4,
  },
  estimateMessage: {
    fontSize: 14,
    color: COLORS.SOFT_WHITE,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  warningBox: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  warningText: {
    fontSize: 12,
    color: '#FFC107',
    textAlign: 'center',
  },

  // Section Cards
  sectionCard: {
    backgroundColor: COLORS.SOFT_WHITE,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.MIDNIGHT_BLUE,
    marginBottom: 16,
  },

  // Assessment
  assessmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  assessmentLabel: {
    fontSize: 14,
    color: COLORS.WARM_GREY,
  },
  assessmentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
    flex: 1,
    textAlign: 'right',
  },
  textStrong: { color: '#E53935' },
  textGood: { color: COLORS.ELECTRIC_GREEN },
  textModerate: { color: '#FF9800' },

  paragraphBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  paragraphTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
    marginBottom: 8,
  },
  paragraphItem: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
    lineHeight: 18,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    padding: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.MIDNIGHT_BLUE,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.WARM_GREY,
    marginTop: 4,
  },

  // Rent Reduction
  reductionBox: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    borderRadius: 12,
    marginBottom: 16,
  },
  reductionPercent: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.ELECTRIC_GREEN,
  },
  reductionLabel: {
    fontSize: 14,
    color: COLORS.WARM_GREY,
    marginTop: 4,
  },
  reductionAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
    marginTop: 8,
  },

  factorsBox: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
  },
  factorsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
    marginBottom: 8,
  },
  factorItem: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
    lineHeight: 18,
  },

  referencesBox: {
    padding: 12,
    backgroundColor: '#f0f0ff',
    borderRadius: 8,
  },
  referencesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
    marginBottom: 8,
  },
  referenceItem: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },

  // Evidence Quality
  qualityScore: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
    marginBottom: 12,
  },
  criterionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  criterionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  criterionText: {
    fontSize: 13,
    color: '#555',
    flex: 1,
  },
  criterionPoints: {
    fontSize: 12,
    color: COLORS.WARM_GREY,
    fontWeight: '600',
  },
  qualityRecommendation: {
    fontSize: 13,
    color: COLORS.MIDNIGHT_BLUE,
    fontStyle: 'italic',
    marginTop: 12,
    lineHeight: 18,
  },

  // Recommendations
  recCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  recCardHigh: {
    borderLeftColor: '#E53935',
    backgroundColor: '#fff5f5',
  },
  recCardMedium: {
    borderLeftColor: '#FF9800',
    backgroundColor: '#fff9f0',
  },
  recHeader: {
    marginBottom: 8,
  },
  recPriority: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
  },
  recAction: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
    marginBottom: 6,
  },
  recDetails: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },

  // Court Decisions
  decisionCard: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
  },
  decisionRef: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
  },
  decisionDesc: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
  decisionReduction: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ELECTRIC_GREEN,
    marginTop: 6,
  },

  // Generate Button
  generateSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  generateButton: {
    backgroundColor: COLORS.ELECTRIC_GREEN,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.MIDNIGHT_BLUE,
  },
  generateHint: {
    fontSize: 12,
    color: COLORS.WARM_GREY,
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  lettersButton: {
    backgroundColor: 'rgba(248, 249, 250, 0.15)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.ELECTRIC_GREEN,
  },
  lettersButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.ELECTRIC_GREEN,
  },

  // Disclaimer
  disclaimer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  disclaimerText: {
    fontSize: 11,
    color: COLORS.WARM_GREY,
    textAlign: 'center',
    lineHeight: 16,
  },
});