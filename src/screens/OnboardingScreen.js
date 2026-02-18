import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { COLORS } from '../utils/constants';

export default function OnboardingScreen({ navigation }) {
  const [step, setStep] = useState(1);

  const handleNext = async () => {
    if (step === 2) {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'SilenceNow needs microphone access to measure noise levels. No audio is recorded.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      navigation.replace('Home');
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.emoji}>🔇</Text>
      <Text style={styles.title}>Welcome to SilenceNow</Text>
      <Text style={styles.subtitle}>
        Document noise disturbances automatically.{'\n'}
        Build evidence for rent reduction claims.
      </Text>
      <View style={styles.features}>
        <Feature icon="📊" text="Automatic noise level measurement" />
        <Feature icon="📋" text="14-day documentation protocol" />
        <Feature icon="⚖️" text="Court-proof evidence (§ 536 BGB)" />
        <Feature icon="💰" text="Rent reduction estimation" />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.emoji}>🎤</Text>
      <Text style={styles.title}>Microphone Access</Text>
      <Text style={styles.subtitle}>
        SilenceNow needs access to your microphone to measure noise levels.
      </Text>
      <View style={styles.privacyBox}>
        <Text style={styles.privacyTitle}>🔒 Privacy First</Text>
        <Text style={styles.privacyText}>
          We NEVER record audio.{'\n'}
          Only decibel values (numbers) are stored.{'\n'}
          No voices. No conversations. No audio files.{'\n'}
          Everything stays on your device.
        </Text>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.emoji}>✅</Text>
      <Text style={styles.title}>Ready!</Text>
      <Text style={styles.subtitle}>
        SilenceNow will monitor noise levels in the background.{'\n'}
        You don't need to do anything.
      </Text>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>What happens next:</Text>
        <Text style={styles.infoText}>
          1. Monitoring starts automatically{'\n'}
          2. Events detected above 55 dB{'\n'}
          3. After 14 days: Report ready{'\n'}
          4. You can generate court-proof evidence
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

      <View style={styles.footer}>
        <View style={styles.dots}>
          <Dot active={step === 1} />
          <Dot active={step === 2} />
          <Dot active={step === 3} />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {step === 3 ? 'Start Monitoring' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const Feature = ({ icon, text }) => (
  <View style={styles.feature}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const Dot = ({ active }) => (
  <View style={[styles.dot, active && styles.dotActive]} />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.MIDNIGHT_BLUE,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.SOFT_WHITE,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.WARM_GREY,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  features: {
    alignSelf: 'stretch',
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    fontSize: 20,
    color: COLORS.ELECTRIC_GREEN,
  },
  featureText: {
    fontSize: 16,
    color: COLORS.SOFT_WHITE,
  },
  privacyBox: {
    backgroundColor: 'rgba(248, 249, 250, 0.1)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.ELECTRIC_GREEN,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.SOFT_WHITE,
    marginBottom: 12,
  },
  privacyText: {
    fontSize: 14,
    color: COLORS.WARM_GREY,
    lineHeight: 22,
  },
  infoBox: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.ELECTRIC_GREEN,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.SOFT_WHITE,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.SOFT_WHITE,
    lineHeight: 22,
  },
  footer: {
    paddingBottom: 40,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.WARM_GREY,
  },
  dotActive: {
    backgroundColor: COLORS.ELECTRIC_GREEN,
    width: 24,
  },
  button: {
    backgroundColor: COLORS.ELECTRIC_GREEN,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
  },
});
