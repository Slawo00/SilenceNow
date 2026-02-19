/**
 * SilenceNow Reports Screen - Revenue Generation Hub
 * 
 * BUSINESS GOAL: Convert users to paying customers through compelling legal reports
 * REVENUE MODEL: Freemium → Basic (€19.99) → Premium (€49.99)
 * VALUE PROP: "Gerichtsfeste Beweise für deine Mietminderung"
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Linking
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import BRAND from '../theme/BrandColors';
import DatabaseServiceV2 from '../services/DatabaseServiceV2';

export default function ReportsScreen({ navigation }) {
  const [legalSummary, setLegalSummary] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userTier, setUserTier] = useState('free'); // free, basic, premium
  const [reportsGenerated, setReportsGenerated] = useState(0);

  const dbService = new DatabaseServiceV2();

  useEffect(() => {
    loadLegalSummary();
    // TODO: Load user subscription status
  }, []);

  const loadLegalSummary = async () => {
    try {
      const summary = await dbService.getLegalSummary(null, '30d');
      setLegalSummary(summary);
    } catch (error) {
      console.error('Failed to load legal summary:', error);
    }
  };

  const generateReport = async (reportType) => {
    if (!canGenerateReport(reportType)) {
      showUpgradeDialog(reportType);
      return;
    }

    setIsGenerating(true);
    try {
      const report = await dbService.generateLegalReport(null, '30d');
      
      // TODO: Generate actual PDF
      Alert.alert(
        "Bericht generiert!",
        `Dein ${reportType} Lärmprotokoll ist bereit. Potentielle Mietminderung: ${report.summary.avgRentReduction}%`,
        [
          { text: "Teilen", onPress: () => shareReport(report) },
          { text: "Anzeigen", onPress: () => viewReport(report) }
        ]
      );
    } catch (error) {
      Alert.alert("Fehler", "Bericht konnte nicht generiert werden.");
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerateReport = (reportType) => {
    if (userTier === 'premium') return true;
    if (userTier === 'basic' && reportsGenerated < 5) return true;
    if (userTier === 'free' && reportsGenerated < 1 && reportType === 'basic') return true;
    return false;
  };

  const showUpgradeDialog = (reportType) => {
    const upgradeMessage = userTier === 'free' 
      ? "Für weitere Berichte benötigst du SilenceNow Basic (€19.99)"
      : "Für Premium-Features benötigst du SilenceNow Premium (€49.99)";
    
    Alert.alert(
      "Upgrade erforderlich",
      upgradeMessage,
      [
        { text: "Später", style: "cancel" },
        { text: "Upgrade", onPress: () => navigation.navigate('Upgrade') }
      ]
    );
  };

  const shareReport = async (report) => {
    try {
      await Share.share({
        message: `Mein SilenceNow Lärmprotokoll:\n${report.summary.totalEvents} Störungen dokumentiert\nPotentielle Mietminderung: ${report.summary.avgRentReduction}%\n\nGeneriert mit SilenceNow - Dein Recht automatisch durchgesetzt.`,
        title: "SilenceNow Lärmprotokoll"
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const viewReport = (report) => {
    navigation.navigate('ReportViewer', { report });
  };

  const renderLegalSummaryCard = () => {
    if (!legalSummary) return null;

    const recommendation = legalSummary.legalRecommendation;
    const isStrong = legalSummary.averageLegalScore > 70;
    const hasSignificantEvents = legalSummary.totalEvents > 5;

    return (
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Deine Rechtslage (30 Tage)</Text>
          <View style={[
            styles.strengthBadge, 
            isStrong ? styles.strengthStrong : styles.strengthModerate
          ]}>
            <Text style={styles.strengthText}>
              {isStrong ? 'STARK' : 'AUFBAUEND'}
            </Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard 
            icon="📊"
            value={legalSummary.totalEvents}
            label="Störungen"
            subtext="dokumentiert"
          />
          <MetricCard 
            icon="⚖️"
            value={`${legalSummary.averageLegalScore}/100`}
            label="Legal Score"
            subtext="Beweiskraft"
          />
          <MetricCard 
            icon="🌙"
            value={legalSummary.nighttimeViolations}
            label="Nachts"
            subtext="schwerer wiegend"
          />
          <MetricCard 
            icon="💰"
            value={`${legalSummary.avgRentReduction}%`}
            label="Minderung"
            subtext="möglich"
          />
        </View>

        <View style={styles.potentialSavings}>
          <Text style={styles.savingsTitle}>💰 Geschätztes Sparpotential</Text>
          <Text style={styles.savingsAmount}>
            {legalSummary.estimatedMonthlyReduction}€/Monat
          </Text>
          <Text style={styles.savingsAnnual}>
            ({legalSummary.estimatedAnnualSavings}€/Jahr)
          </Text>
        </View>

        <View style={styles.recommendationBox}>
          <Text style={styles.recommendationTitle}>
            🎯 Handlungsempfehlung
          </Text>
          <Text style={styles.recommendationText}>
            {getRecommendationText(recommendation)}
          </Text>
          <View style={styles.confidenceBar}>
            <View 
              style={[
                styles.confidenceFill, 
                { width: `${recommendation.estimatedSuccess}%` }
              ]} 
            />
          </View>
          <Text style={styles.confidenceText}>
            {recommendation.estimatedSuccess}% Erfolgschance
          </Text>
        </View>
      </View>
    );
  };

  const getRecommendationText = (recommendation) => {
    switch (recommendation.action) {
      case 'immediate_legal_action':
        return 'Deine Beweislage ist stark! Zeit für professionelle Hilfe.';
      case 'formal_complaint':
        return 'Bereit für formelle Beschwerde beim Vermieter.';
      case 'continue_monitoring':
        return 'Sammle weiter Beweise für stärkere Position.';
      default:
        return 'Dokumentiere kontinuierlich deine Störungen.';
    }
  };

  const renderReportOptions = () => (
    <View style={styles.reportsSection}>
      <Text style={styles.sectionTitle}>Gerichtsfeste Berichte</Text>
      
      {/* Basic Report */}
      <ReportOption
        title="Basis-Lärmprotokoll"
        subtitle="Grundlegendes Beweisprotokoll für Vermieter"
        price={userTier === 'free' ? '€19,99' : 'INKLUSIVE'}
        features={[
          'Chronologisches Lärmprotokoll',
          'Dezibel-Statistiken',
          'Rechtliche Einordnung',
          'Muster-Beschwerde Brief'
        ]}
        onPress={() => generateReport('basic')}
        disabled={isGenerating}
        isPremium={userTier === 'free'}
        badge={userTier === 'free' && reportsGenerated === 0 ? 'GRATIS-TEST' : null}
      />

      {/* Premium Report */}
      <ReportOption
        title="Premium-Beweisdossier"
        subtitle="Vollständige Dokumentation für Anwälte"
        price={userTier === 'premium' ? 'INKLUSIVE' : '€49,99'}
        features={[
          'Detailliertes Lärmprotokoll',
          'Juristische Analyse',
          'BGH-konforme Aufbereitung',
          'Mietminderungs-Berechnung',
          'Anwalts-Musterbriefe',
          '24/7 Chat Support'
        ]}
        onPress={() => generateReport('premium')}
        disabled={isGenerating}
        isPremium={userTier !== 'premium'}
        badge="ANWALTS-QUALITÄT"
      />

      {/* Legal Action Package */}
      <ReportOption
        title="Sofort-Durchsetzungs-Paket"
        subtitle="Komplette Mietminderung sofort durchsetzen"
        price="€99,99"
        features={[
          'Alle Premium-Features',
          'Anwalts-Vermittlung',
          'Erfolgs-Garantie*',
          'Express-Bearbeitung (24h)',
          'Telefonische Beratung'
        ]}
        onPress={() => generateReport('legal_action')}
        disabled={isGenerating}
        isPremium={true}
        badge="NEU"
        highlight={true}
      />
    </View>
  );

  const MetricCard = ({ icon, value, label, subtext }) => (
    <View style={styles.metricCard}>
      <Text style={styles.metricIcon}>{icon}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricSubtext}>{subtext}</Text>
    </View>
  );

  const ReportOption = ({ 
    title, 
    subtitle, 
    price, 
    features, 
    onPress, 
    disabled, 
    isPremium, 
    badge, 
    highlight 
  }) => (
    <View style={[styles.reportCard, highlight && styles.reportCardHighlight]}>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      
      <View style={styles.reportHeader}>
        <View style={styles.reportTitleArea}>
          <Text style={styles.reportTitle}>{title}</Text>
          <Text style={styles.reportSubtitle}>{subtitle}</Text>
        </View>
        <Text style={[
          styles.reportPrice,
          !isPremium && styles.reportPriceIncluded
        ]}>
          {price}
        </Text>
      </View>

      <View style={styles.featuresList}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Text style={styles.featureCheck}>✅</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.reportButton,
          highlight ? styles.reportButtonHighlight : styles.reportButtonDefault,
          disabled && styles.reportButtonDisabled
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={[
          styles.reportButtonText,
          highlight && styles.reportButtonTextHighlight
        ]}>
          {disabled ? 'Generiere...' : 'Bericht erstellen'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor={BRAND.COLORS.QUIET_SILVER} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Deine Beweise</Text>
          <Text style={styles.headerSubtitle}>
            {BRAND.MESSAGES.LEGAL_CONFIDENCE}
          </Text>
        </View>

        {renderLegalSummaryCard()}
        {renderReportOptions()}

        <View style={styles.legalNote}>
          <Text style={styles.legalNoteText}>
            * Alle Berichte entsprechen BGH-Standards und sind gerichtsverwertbar. 
            Keine Rechtsberatung. Bei Fragen wende dich an einen Anwalt.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.COLORS.QUIET_SILVER,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: BRAND.SPACING.SCREEN_PADDING,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: BRAND.TYPOGRAPHY.HERO_SIZE,
    fontWeight: BRAND.TYPOGRAPHY.BOLD,
    color: BRAND.COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: BRAND.TYPOGRAPHY.BODY_SIZE,
    color: BRAND.COLORS.TEXT_SECONDARY,
    opacity: 0.8,
  },
  
  // Legal Summary Card
  summaryCard: {
    backgroundColor: BRAND.COLORS.BACKGROUND_CARD,
    margin: BRAND.SPACING.SCREEN_PADDING,
    padding: BRAND.SPACING.LG,
    borderRadius: BRAND.RADIUS.LARGE,
    ...BRAND.SHADOWS.MEDIUM,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: BRAND.TYPOGRAPHY.TITLE_SIZE,
    fontWeight: BRAND.TYPOGRAPHY.BOLD,
    color: BRAND.COLORS.TEXT_PRIMARY,
  },
  strengthBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  strengthStrong: {
    backgroundColor: BRAND.COLORS.LEGAL_STRONG,
  },
  strengthModerate: {
    backgroundColor: BRAND.COLORS.LEGAL_MODERATE,
  },
  strengthText: {
    fontSize: BRAND.TYPOGRAPHY.SMALL_SIZE,
    fontWeight: BRAND.TYPOGRAPHY.BOLD,
    color: BRAND.COLORS.PEACE_WHITE,
  },
  
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    alignItems: 'center',
    padding: BRAND.SPACING.MD,
    backgroundColor: BRAND.COLORS.QUIET_SILVER,
    borderRadius: BRAND.RADIUS.MEDIUM,
    marginBottom: BRAND.SPACING.SM,
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: BRAND.TYPOGRAPHY.TITLE_SIZE,
    fontWeight: BRAND.TYPOGRAPHY.BOLD,
    color: BRAND.COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: BRAND.TYPOGRAPHY.CAPTION_SIZE,
    fontWeight: BRAND.TYPOGRAPHY.SEMIBOLD,
    color: BRAND.COLORS.TEXT_SECONDARY,
  },
  metricSubtext: {
    fontSize: BRAND.TYPOGRAPHY.SMALL_SIZE,
    color: BRAND.COLORS.TEXT_DISABLED,
  },
  
  potentialSavings: {
    alignItems: 'center',
    padding: BRAND.SPACING.LG,
    backgroundColor: 'rgba(0, 200, 83, 0.1)',
    borderRadius: BRAND.RADIUS.MEDIUM,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BRAND.COLORS.JUSTICE_GREEN,
  },
  savingsTitle: {
    fontSize: BRAND.TYPOGRAPHY.BODY_SIZE,
    fontWeight: BRAND.TYPOGRAPHY.SEMIBOLD,
    color: BRAND.COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  savingsAmount: {
    fontSize: BRAND.TYPOGRAPHY.HERO_SIZE,
    fontWeight: BRAND.TYPOGRAPHY.BOLD,
    color: BRAND.COLORS.JUSTICE_GREEN,
  },
  savingsAnnual: {
    fontSize: BRAND.TYPOGRAPHY.BODY_SIZE,
    color: BRAND.COLORS.TEXT_SECONDARY,
  },
  
  recommendationBox: {
    padding: BRAND.SPACING.MD,
    backgroundColor: BRAND.COLORS.QUIET_SILVER,
    borderRadius: BRAND.RADIUS.MEDIUM,
    borderLeftWidth: 4,
    borderLeftColor: BRAND.COLORS.EVIDENCE_GOLD,
  },
  recommendationTitle: {
    fontSize: BRAND.TYPOGRAPHY.SUBTITLE_SIZE,
    fontWeight: BRAND.TYPOGRAPHY.SEMIBOLD,
    color: BRAND.COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: BRAND.TYPOGRAPHY.BODY_SIZE,
    color: BRAND.COLORS.TEXT_SECONDARY,
    marginBottom: 12,
    lineHeight: 22,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: BRAND.COLORS.JUSTICE_GREEN,
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: BRAND.TYPOGRAPHY.CAPTION_SIZE,
    fontWeight: BRAND.TYPOGRAPHY.SEMIBOLD,
    color: BRAND.COLORS.TEXT_SECONDARY,
  },
  
  // Reports Section
  reportsSection: {
    padding: BRAND.SPACING.SCREEN_PADDING,
  },
  sectionTitle: {
    fontSize: BRAND.TYPOGRAPHY.TITLE_SIZE,
    fontWeight: BRAND.TYPOGRAPHY.BOLD,
    color: BRAND.COLORS.TEXT_PRIMARY,
    marginBottom: 20,
  },
  
  reportCard: {
    backgroundColor: BRAND.COLORS.BACKGROUND_CARD,
    padding: BRAND.SPACING.LG,
    borderRadius: BRAND.RADIUS.LARGE,
    marginBottom: BRAND.SPACING.LG,
    ...BRAND.SHADOWS.LIGHT,
    position: 'relative',
  },
  reportCardHighlight: {
    borderWidth: 2,
    borderColor: BRAND.COLORS.EVIDENCE_GOLD,
    ...BRAND.SHADOWS.STRONG,
  },
  
  badge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: BRAND.COLORS.EVIDENCE_GOLD,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  badgeText: {
    fontSize: BRAND.TYPOGRAPHY.SMALL_SIZE,
    fontWeight: BRAND.TYPOGRAPHY.BOLD,
    color: BRAND.COLORS.SILENCE_BLUE,
  },
  
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  reportTitleArea: {
    flex: 1,
    marginRight: 16,
  },
  reportTitle: {
    fontSize: BRAND.TYPOGRAPHY.SUBTITLE_SIZE,
    fontWeight: BRAND.TYPOGRAPHY.BOLD,
    color: BRAND.COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  reportSubtitle: {
    fontSize: BRAND.TYPOGRAPHY.BODY_SIZE,
    color: BRAND.COLORS.TEXT_SECONDARY,
  },
  reportPrice: {
    fontSize: BRAND.TYPOGRAPHY.SUBTITLE_SIZE,
    fontWeight: BRAND.TYPOGRAPHY.BOLD,
    color: BRAND.COLORS.EVIDENCE_GOLD,
  },
  reportPriceIncluded: {
    color: BRAND.COLORS.JUSTICE_GREEN,
  },
  
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureCheck: {
    fontSize: 16,
    marginRight: 12,
  },
  featureText: {
    fontSize: BRAND.TYPOGRAPHY.BODY_SIZE,
    color: BRAND.COLORS.TEXT_SECONDARY,
    flex: 1,
  },
  
  reportButton: {
    paddingVertical: BRAND.SPACING.MD,
    paddingHorizontal: BRAND.SPACING.LG,
    borderRadius: BRAND.RADIUS.MEDIUM,
    alignItems: 'center',
  },
  reportButtonDefault: {
    backgroundColor: BRAND.COLORS.SILENCE_BLUE,
  },
  reportButtonHighlight: {
    backgroundColor: BRAND.COLORS.EVIDENCE_GOLD,
  },
  reportButtonDisabled: {
    opacity: 0.6,
  },
  reportButtonText: {
    fontSize: BRAND.TYPOGRAPHY.BODY_SIZE,
    fontWeight: BRAND.TYPOGRAPHY.SEMIBOLD,
    color: BRAND.COLORS.PEACE_WHITE,
  },
  reportButtonTextHighlight: {
    color: BRAND.COLORS.SILENCE_BLUE,
  },
  
  legalNote: {
    padding: BRAND.SPACING.SCREEN_PADDING,
    paddingTop: 0,
  },
  legalNoteText: {
    fontSize: BRAND.TYPOGRAPHY.SMALL_SIZE,
    color: BRAND.COLORS.TEXT_DISABLED,
    textAlign: 'center',
    lineHeight: 18,
  },
});