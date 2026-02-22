import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { COLORS } from '../utils/constants';
import AudioMonitor from '../services/AudioMonitor';
import BackgroundKeepAlive from '../services/BackgroundKeepAlive';

const NightModeScreen = ({ navigation }) => {
  const [isNightModeActive, setIsNightModeActive] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const startNightMode = async () => {
    try {
      Alert.alert(
        '🌙 Nachtmodus',
        'Dies aktiviert 24/7 Überwachung. Die App bleibt die ganze Nacht aktiv und verbraucht mehr Akku.\n\nStelle sicher dass:\n• Gerät am Ladekabel\n• Nicht-Stören Modus aus\n• Battery-Optimierung für SilenceNow deaktiviert',
        [
          { text: 'Abbrechen', style: 'cancel' },
          {
            text: '24/7 Starten',
            style: 'default',
            onPress: async () => {
              // 1. Background Keep-Alive aktivieren
              await BackgroundKeepAlive.enableNightMode();
              
              // 2. Audio Monitoring starten
              await AudioMonitor.startMonitoring((data) => {
                console.log('[NightMode] Measurement:', data.decibel, 'dB');
              });

              setIsNightModeActive(true);
              setIsMonitoring(true);
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Fehler', 'Nachtmodus konnte nicht gestartet werden: ' + error.message);
    }
  };

  const stopNightMode = async () => {
    try {
      await BackgroundKeepAlive.disableNightMode();
      await AudioMonitor.stopMonitoring();
      
      setIsNightModeActive(false);
      setIsMonitoring(false);
      
      Alert.alert('✅ Nachtmodus beendet', 'Die App läuft wieder im normalen Modus.');
    } catch (error) {
      Alert.alert('Fehler', 'Nachtmodus konnte nicht gestoppt werden: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Zurück</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nachtmodus</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>
            {isNightModeActive ? '🌙 Nachtmodus Aktiv' : '☀️ Normal Modus'}
          </Text>
          <Text style={styles.statusSubtitle}>
            {isNightModeActive 
              ? 'App überwacht 24/7 im Hintergrund'
              : 'Für Nacht-Überwachung aktivieren'
            }
          </Text>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Background Monitoring:</Text>
            <Text style={[styles.statusValue, isNightModeActive ? styles.active : styles.inactive]}>
              {isNightModeActive ? '✅ Aktiv' : '❌ Aus'}
            </Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Audio Recording:</Text>
            <Text style={[styles.statusValue, isMonitoring ? styles.active : styles.inactive]}>
              {isMonitoring ? '🎤 Läuft' : '⏸️ Gestoppt'}
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🔋 Nachtmodus Features:</Text>
          <Text style={styles.infoText}>
            • Persistent Background Monitoring{'\n'}
            • Silent Audio Keep-Alive{'\n'}
            • Background Task Ping (alle 30s){'\n'}
            • Wake Timer (alle 20min){'\n'}
            • Persistent Notification{'\n'}
            • Optimiert für 8+ Stunden Laufzeit
          </Text>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ Wichtige Hinweise:</Text>
          <Text style={styles.warningText}>
            • Gerät MUSS am Ladekabel bleiben{'\n'}
            • Battery-Optimierung deaktivieren:{'\n'}
            &nbsp;&nbsp;iOS: Einstellungen → Batterie → Battery Health{'\n'}
            &nbsp;&nbsp;Android: Einstellungen → Apps → SilenceNow → Akku{'\n'}
            • Nicht-Stören Modus deaktivieren{'\n'}
            • App NICHT schließen während Nachtmodus
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, isNightModeActive ? styles.stopButton : styles.startButton]}
          onPress={isNightModeActive ? stopNightMode : startNightMode}
        >
          <Text style={styles.buttonText}>
            {isNightModeActive ? '⏹️ Nachtmodus Beenden' : '🌙 Nachtmodus Starten'}
          </Text>
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusCard: {
    backgroundColor: COLORS.SOFT_WHITE,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.MIDNIGHT_BLUE,
    textAlign: 'center',
    marginBottom: 8,
  },
  statusSubtitle: {
    fontSize: 14,
    color: COLORS.WARM_GREY,
    textAlign: 'center',
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statusLabel: {
    fontSize: 16,
    color: COLORS.MIDNIGHT_BLUE,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  active: {
    color: COLORS.ELECTRIC_GREEN,
  },
  inactive: {
    color: COLORS.WARM_GREY,
  },
  infoCard: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.ELECTRIC_GREEN,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.MIDNIGHT_BLUE,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.MIDNIGHT_BLUE,
    lineHeight: 20,
  },
  warningCard: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: COLORS.WARNING_AMBER,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.WARNING_AMBER,
    marginBottom: 10,
  },
  warningText: {
    fontSize: 14,
    color: COLORS.MIDNIGHT_BLUE,
    lineHeight: 20,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: COLORS.ELECTRIC_GREEN,
  },
  stopButton: {
    backgroundColor: COLORS.ERROR_RED,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.SOFT_WHITE,
  },
});

export default NightModeScreen;