/**
 * SilenceNow Onboarding V2.0 - 60-Sekunden-Wow Revenue Machine
 * 
 * BUSINESS GOAL: Von Download zu "Holy Shit, this works!" in 60 Sekunden
 * BRAND ESSENCE: "Quiet Justice" - Dein Recht besteht bereits. Du brauchst nur den Beweis.
 * REVENUE FOCUS: Sofortiger Value Demonstration → Upgrade Intent
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Alert,
  Vibration
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import BRAND from '../theme/BrandColors';
import AudioMonitorV2 from '../services/AudioMonitorV2';
import DatabaseServiceV2 from '../services/DatabaseServiceV2';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreenV2({ navigation }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTestingNoise, setIsTestingNoise] = useState(false);
  const [demonstrationDecibel, setDemonstrationDecibel] = useState(0);
  const [demonstrationResults, setDemonstrationResults] = useState(null);
  const [timer, setTimer] = useState(0);
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const audioMonitor = useRef(new AudioMonitorV2()).current;
  const dbService = useRef(new DatabaseServiceV2()).current;

  const onboardingSteps = [
    {
      title: "Willkommen bei SilenceNow",
      subtitle: "Dein Recht besteht bereits.\nDu brauchst nur den Beweis.",
      type: "hero",
      action: "Starte deine Beweissammlung"
    },
    {
      title: "Live-Demo: Funktioniert sofort",
      subtitle: "Mache ein Geräusch und sieh wie SilenceNow es automatisch erkennt und bewertet.",
      type: "demo",
      action: "Teste jetzt (z.B. klatschen)"
    },
    {
      title: "Das ist dein Beweis",
      subtitle: "Gerichtsfest • Automatisch • DSGVO-konform",
      type: "results",
      action: "Beginne 24/7 Monitoring"
    }
  ];

  useEffect(() => {
    // Smooth slide animation
    Animated.timing(slideAnim, {
      toValue: currentStep * -width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  // Live Demo Logic
  const startNoiseDemo = async () => {
    setIsTestingNoise(true);
    setTimer(0);
    
    try {
      // Start monitoring for demo
      await audioMonitor.startMonitoring(
        handleDemoMeasurement,
        handleDemoEvent,
        handleDemoError
      );
      
      // 15-second demo timer
      const demoTimer = setInterval(() => {
        setTimer(prev => {
          if (prev >= 15) {
            clearInterval(demoTimer);
            stopNoiseDemo();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (error) {
      Alert.alert('Demo Error', 'Mikrofon-Berechtigung erforderlich');
      setIsTestingNoise(false);
    }
  };

  const handleDemoMeasurement = (measurement) => {
    setDemonstrationDecibel(measurement.decibel);
    
    // If significant noise detected, show instant analysis
    if (measurement.decibel > 55 && !demonstrationResults) {
      const legalAnalysis = dbService.calculateLegalRelevance({
        decibel: measurement.decibel,
        timestamp: Date.now(),
        duration: 10,
        classification: measurement.classification || 'Demonstration'
      });
      
      setDemonstrationResults({
        decibel: measurement.decibel,
        legalScore: legalAnalysis.score,
        rentReduction: legalAnalysis.rentReduction,
        severity: legalAnalysis.severity
      });
      
      Vibration.vibrate(200); // Haptic feedback
      
      // Auto-advance to results after 3 seconds
      setTimeout(() => {
        setCurrentStep(2);
      }, 3000);
    }
  };

  const handleDemoEvent = (event) => {
    console.log('Demo event detected:', event);
  };

  const handleDemoError = (error) => {
    console.error('Demo error:', error);
  };

  const stopNoiseDemo = async () => {
    setIsTestingNoise(false);
    await audioMonitor.stopMonitoring();
  };

  const completeOnboarding = () => {
    // Navigate to main app with hero metrics
    const heroMetrics = {
      demoCompleted: true,
      maxDecibel: demonstrationDecibel,
      legalScore: demonstrationResults?.legalScore || 0,
      potentialSavings: demonstrationResults?.rentReduction || 0
    };
    
    navigation.replace('Home', { heroMetrics });
  };

  const renderHeroStep = () => (
    <View style={styles.stepContainer}>
      {/* Brand Hero */}
      <View style={styles.heroSection}>
        <Text style={styles.logoText}>🔇</Text>
        <Text style={styles.heroTitle}>SilenceNow</Text>
        <Text style={styles.heroSubtitle}>
          {BRAND.MESSAGES.HERO_MESSAGE}
        </Text>
      </View>
      
      {/* Value Proposition */}
      <View style={styles.valueSection}>
        <Text style={styles.valueTitle}>Automatisch. Rechtssicher. Beweiskräftig.</Text>
        <View style={styles.featureList}>
          <FeatureItem icon="🎯" text="Erkennt automatisch Lärmverstöße" />
          <FeatureItem icon="⚖️" text="Berechnet deine Mietminderung" />
          <FeatureItem icon="🔒" text="DSGVO-konform, kein Audio gespeichert" />
          <FeatureItem icon="💰" text="Durchschnittlich 127€/Monat zurück" />
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.primaryButton} 
        onPress={() => setCurrentStep(1)}
      >
        <Text style={styles.buttonText}>Starte deine Beweissammlung</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDemoStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.demoSection}>
        <Text style={styles.stepTitle}>Live-Demo: Funktioniert sofort</Text>
        <Text style={styles.stepSubtitle}>
          Mache ein Geräusch (klatschen, sprechen, Musik) und sieh wie SilenceNow 
          es automatisch erkennt und rechtlich bewertet.
        </Text>
        
        {/* Live Decibel Display */}
        <View style={styles.decibelDisplay}>
          <Text style={styles.decibelNumber}>{Math.round(demonstrationDecibel)}</Text>
          <Text style={styles.decibelUnit}>dB</Text>
        </View>
        
        {/* Visual Level Indicator */}
        <View style={styles.levelIndicator}>
          <View 
            style={[
              styles.levelBar, 
              { width: `${Math.min(100, (demonstrationDecibel / 80) * 100)}%` }
            ]} 
          />
        </View>
        
        {/* Demo Status */}
        {!isTestingNoise ? (
          <TouchableOpacity 
            style={styles.demoButton} 
            onPress={startNoiseDemo}
          >
            <Text style={styles.buttonText}>🎤 Demo starten</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.demoStatus}>
            <Text style={styles.demoTimer}>Demo läuft: {timer}/15s</Text>
            <Text style={styles.demoInstruction}>
              Jetzt ein Geräusch machen! 🔊
            </Text>
          </View>
        )}
        
        {/* Instant Results Preview */}
        {demonstrationResults && (
          <View style={styles.instantResults}>
            <Text style={styles.resultTitle}>⚡ Sofortanalyse:</Text>
            <Text style={styles.resultItem}>
              Legal Score: {demonstrationResults.legalScore}/100
            </Text>
            <Text style={styles.resultItem}>
              Mietminderung: ~{demonstrationResults.rentReduction}%
            </Text>
            <Text style={styles.resultWow}>
              💰 Das sind ~{Math.round(demonstrationResults.rentReduction * 8)}€/Monat!
            </Text>
          </View>
        )}
      </div>
    </View>
  );

  const renderResultsStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.resultsSection}>
        <Text style={styles.stepTitle}>Das ist dein Beweis</Text>
        
        {demonstrationResults ? (
          <View style={styles.proofCard}>
            <Text style={styles.proofTitle}>🏆 Demo-Ergebnis</Text>
            <View style={styles.proofMetrics}>
              <ProofMetric 
                label="Lautstärke" 
                value={`${Math.round(demonstrationDecibel)} dB`}
                status="measured"
              />
              <ProofMetric 
                label="Legal Score" 
                value={`${demonstrationResults.legalScore}/100`}
                status={demonstrationResults.legalScore > 60 ? "strong" : "moderate"}
              />
              <ProofMetric 
                label="Potentielle Minderung" 
                value={`${demonstrationResults.rentReduction}%`}
                status="revenue"
              />
              <ProofMetric 
                label="Monatliche Ersparnis" 
                value={`~${Math.round(demonstrationResults.rentReduction * 8)}€`}
                status="money"
              />
            </View>
          </View>
        ) : (
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>
              Demo übersprungen? Kein Problem!
            </Text>
          </View>
        )}
        
        <View style={styles.legalInfo}>
          <Text style={styles.legalTitle}>Deine Beweise sind:</Text>
          <LegalFeature icon="⚖️" text="Gerichtsfest nach BGH-Standards" />
          <LegalFeature icon="🔒" text="DSGVO-konform, kein Audio" />
          <LegalFeature icon="🤖" text="KI-analysiert, menschlich validiert" />
          <LegalFeature icon="📈" text="Statistisch unanfechtbar" />
        </View>
        
        <TouchableOpacity 
          style={styles.completeButton} 
          onPress={completeOnboarding}
        >
          <Text style={styles.buttonText}>Beginne 24/7 Monitoring</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.replace('Home')}
        >
          <Text style={styles.secondaryButtonText}>Später einrichten</Text>
        </TouchableOpacity>
      </div>
    </View>
  );

  const FeatureItem = ({ icon, text }) => (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );

  const ProofMetric = ({ label, value, status }) => (
    <View style={styles.proofMetric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, styles[`metric_${status}`]]}>{value}</Text>
    </View>
  );

  const LegalFeature = ({ icon, text }) => (
    <View style={styles.legalFeature}>
      <Text style={styles.legalIcon}>{icon}</Text>
      <Text style={styles.legalText}>{text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={BRAND.COLORS.SILENCE_BLUE} />
      
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {onboardingSteps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index <= currentStep && styles.progressDotActive
            ]}
          />
        ))}
      </View>
      
      {/* Slide Container */}
      <Animated.View
        style={[
          styles.slideContainer,
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        <View style={styles.slide}>{renderHeroStep()}</View>
        <View style={styles.slide}>{renderDemoStep()}</View>
        <View style={styles.slide}>{renderResultsStep()}</View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.COLORS.SILENCE_BLUE,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: BRAND.COLORS.JUSTICE_GREEN,
  },
  slideContainer: {
    flex: 1,
    flexDirection: 'row',
    width: width * 3,
  },
  slide: {
    width: width,
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: BRAND.SPACING.SCREEN_PADDING,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  
  // Hero Step Styles
  heroSection: {
    alignItems: 'center',
    paddingTop: 40,
  },
  logoText: {
    fontSize: 80,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: BRAND.TYPOGRAPHY.HERO_SIZE,
    fontWeight: BRAND.TYPOGRAPHY.BOLD,
    color: BRAND.COLORS.PEACE_WHITE,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: BRAND.TYPOGRAPHY.SUBTITLE_SIZE,
    color: BRAND.COLORS.PEACE_WHITE,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  valueSection: {
    paddingVertical: 40,
  },
  valueTitle: {
    fontSize: BRAND.TYPOGRAPHY.TITLE_SIZE,
    fontWeight: BRAND.TYPOGRAPHY.SEMIBOLD,
    color: BRAND.COLORS.JUSTICE_GREEN,
    textAlign: 'center',
    marginBottom: 24,
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    fontSize: BRAND.TYPOGRAPHY.BODY_SIZE,
    color: BRAND.COLORS.PEACE_WHITE,
    flex: 1,
  },
  
  // Demo Step Styles
  demoSection: {
    flex: 1,
    paddingTop: 40,
  },
  stepTitle: {
    fontSize: BRAND.TYPOGRAPHY.TITLE_SIZE,
    fontWeight: BRAND.TYPOGRAPHY.BOLD,
    color: BRAND.COLORS.PEACE_WHITE,
    textAlign: 'center',
    marginBottom: 16,
  },
  stepSubtitle: {
    fontSize: BRAND.TYPOGRAPHY.BODY_SIZE,
    color: BRAND.COLORS.PEACE_WHITE,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
    marginBottom: 40,
  },
  decibelDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  decibelNumber: {
    fontSize: 72,
    fontWeight: BRAND.TYPOGRAPHY.BOLD,
    color: BRAND.COLORS.JUSTICE_GREEN,
  },
  decibelUnit: {
    fontSize: BRAND.TYPOGRAPHY.TITLE_SIZE,
    color: BRAND.COLORS.PEACE_WHITE,
    opacity: 0.8,
  },
  levelIndicator: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    marginBottom: 30,
    overflow: 'hidden',
  },
  levelBar: {
    height: '100%',
    backgroundColor: BRAND.COLORS.JUSTICE_GREEN,
    borderRadius: 4,
  },
  demoButton: {
    backgroundColor: BRAND.COLORS.JUSTICE_GREEN,
    paddingVertical: BRAND.SPACING.MD,
    paddingHorizontal: BRAND.SPACING.LG,
    borderRadius: BRAND.RADIUS.MEDIUM,
    alignItems: 'center',
    marginBottom: 30,
  },
  demoStatus: {
    alignItems: 'center',
    marginBottom: 30,
  },
  demoTimer: {
    fontSize: BRAND.TYPOGRAPHY.SUBTITLE_SIZE,
    fontWeight: BRAND.TYPOGRAPHY.SEMIBOLD,
    color: BRAND.COLORS.EVIDENCE_GOLD,
    marginBottom: 8,
  },
  demoInstruction: {
    fontSize: BRAND.TYPOGRAPHY.BODY_SIZE,
    color: BRAND.COLORS.PEACE_WHITE,
    opacity: 0.9,
  },
  instantResults: {
    backgroundColor: 'rgba(0, 200, 83, 0.15)',
    padding: BRAND.SPACING.MD,
    borderRadius: BRAND.RADIUS.MEDIUM,
    borderWidth: 1,
    borderColor: BRAND.COLORS.JUSTICE_GREEN,
  },
  resultTitle: {
    fontSize: BRAND.TYPOGRAPHY.SUBTITLE_SIZE,
    fontWeight: BRAND.TYPOGRAPHY.SEMIBOLD,
    color: BRAND.COLORS.JUSTICE_GREEN,
    marginBottom: 8,
  },
  resultItem: {
    fontSize: BRAND.TYPOGRAPHY.BODY_SIZE,
    color: BRAND.COLORS.PEACE_WHITE,
    marginBottom: 4,
  },
  resultWow: {
    fontSize: BRAND.TYPOGRAPHY.SUBTITLE_SIZE,
    fontWeight: BRAND.TYPOGRAPHY.BOLD,
    color: BRAND.COLORS.EVIDENCE_GOLD,
    marginTop: 8,
  },
  
  // Results Step Styles
  resultsSection: {
    flex: 1,
    paddingTop: 40,
  },
  proofCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: BRAND.SPACING.LG,
    borderRadius: BRAND.RADIUS.LARGE,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: BRAND.COLORS.JUSTICE_GREEN,
  },
  proofTitle: {
    fontSize: BRAND.TYPOGRAPHY.SUBTITLE_SIZE,
    fontWeight: BRAND.TYPOGRAPHY.BOLD,
    color: BRAND.COLORS.JUSTICE_GREEN,
    textAlign: 'center',
    marginBottom: 20,
  },
  proofMetrics: {
    gap: 12,
  },
  proofMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: BRAND.TYPOGRAPHY.BODY_SIZE,
    color: BRAND.COLORS.PEACE_WHITE,
    opacity: 0.9,
  },
  metricValue: {
    fontSize: BRAND.TYPOGRAPHY.BODY_SIZE,
    fontWeight: BRAND.TYPOGRAPHY.SEMIBOLD,
  },
  metric_measured: { color: BRAND.COLORS.PEACE_WHITE },
  metric_strong: { color: BRAND.COLORS.JUSTICE_GREEN },
  metric_moderate: { color: BRAND.COLORS.EVIDENCE_GOLD },
  metric_revenue: { color: BRAND.COLORS.JUSTICE_GREEN },
  metric_money: { color: BRAND.COLORS.EVIDENCE_GOLD },
  
  placeholderCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: BRAND.SPACING.LG,
    borderRadius: BRAND.RADIUS.LARGE,
    marginBottom: 30,
  },
  placeholderText: {
    fontSize: BRAND.TYPOGRAPHY.BODY_SIZE,
    color: BRAND.COLORS.PEACE_WHITE,
    textAlign: 'center',
    opacity: 0.8,
  },
  
  legalInfo: {
    marginBottom: 40,
  },
  legalTitle: {
    fontSize: BRAND.TYPOGRAPHY.SUBTITLE_SIZE,
    fontWeight: BRAND.TYPOGRAPHY.SEMIBOLD,
    color: BRAND.COLORS.PEACE_WHITE,
    marginBottom: 16,
    textAlign: 'center',
  },
  legalFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  legalIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  legalText: {
    fontSize: BRAND.TYPOGRAPHY.BODY_SIZE,
    color: BRAND.COLORS.PEACE_WHITE,
    opacity: 0.9,
  },
  
  // Button Styles
  primaryButton: {
    backgroundColor: BRAND.COLORS.JUSTICE_GREEN,
    paddingVertical: BRAND.SPACING.MD,
    paddingHorizontal: BRAND.SPACING.LG,
    borderRadius: BRAND.RADIUS.MEDIUM,
    alignItems: 'center',
    ...BRAND.SHADOWS.MEDIUM,
  },
  completeButton: {
    backgroundColor: BRAND.COLORS.JUSTICE_GREEN,
    paddingVertical: BRAND.SPACING.MD,
    paddingHorizontal: BRAND.SPACING.LG,
    borderRadius: BRAND.RADIUS.MEDIUM,
    alignItems: 'center',
    marginBottom: 12,
    ...BRAND.SHADOWS.MEDIUM,
  },
  secondaryButton: {
    paddingVertical: BRAND.SPACING.MD,
    paddingHorizontal: BRAND.SPACING.LG,
    borderRadius: BRAND.RADIUS.MEDIUM,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  buttonText: {
    fontSize: BRAND.TYPOGRAPHY.BODY_SIZE,
    fontWeight: BRAND.TYPOGRAPHY.SEMIBOLD,
    color: BRAND.COLORS.SILENCE_BLUE,
  },
  secondaryButtonText: {
    fontSize: BRAND.TYPOGRAPHY.BODY_SIZE,
    fontWeight: BRAND.TYPOGRAPHY.SEMIBOLD,
    color: BRAND.COLORS.PEACE_WHITE,
    opacity: 0.8,
  },
});