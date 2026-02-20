import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  AppState,
} from 'react-native';
import { COLORS, DEFAULTS } from '../utils/constants';
import AudioMonitor from '../services/AudioMonitorV2';
import EventDetector from '../services/EventDetector';
// NoiseRecordingService removed - using AudioMonitor + EventDetector v1 directly
import DatabaseService from '../services/DatabaseService';
import NotificationService from '../services/NotificationService';
import LiveMeter from '../components/LiveMeter';
import EventCard from '../components/EventCard';
import NightReport from '../components/NightReport';

export default function HomeScreen({ navigation }) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentDecibel, setCurrentDecibel] = useState(0);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    avgDecibel: 0,
    daysMonitored: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const appState = useRef(AppState.currentState);

  // Reload events when screen comes back into focus (e.g. after editing)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    loadData();

    // Initialize notifications
    NotificationService.initialize().catch(err => 
      console.warn('Notifications init failed:', err.message)
    );

    EventDetector.setOnEventSaved(() => {
      loadData();
    });

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/background/) && nextAppState === 'active') {
        loadData();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const loadData = async () => {
    try {
      const allEvents = await DatabaseService.getAllEvents();
      setEvents(allEvents.slice(0, 20));

      // Nur rechtlich relevante Events zählen:
      // über Schwellenwert + nicht als "Kein Nachbar" markiert
      const relevant = await DatabaseService.getRelevantStats(14);

      setStats({
        totalEvents: relevant.count,
        avgDecibel: relevant.avgDecibel,
        daysMonitored: 14,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const startMonitoring = async () => {
    try {
      // Use AudioMonitorV2 directly with EventDetector v1 (has NeighborScoring)
      const success = await AudioMonitor.startMonitoring(
        (measurement) => {
          setCurrentDecibel(measurement.decibel);
          // Feed measurement to EventDetector v1 (with Nachbar-Scoring)
          EventDetector.processMeasurement(measurement);
        },
        (event) => {
          console.log('Event from AudioMonitor:', event);
          loadData();
        },
        (error) => {
          console.error('AudioMonitor error:', error);
          Alert.alert('Recording Error', error.message || String(error));
        }
      );
      
      if (success) {
        setIsMonitoring(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start monitoring: ' + error.message);
    }
  };

  const stopMonitoring = async () => {
    try {
      // Force-end any active event in EventDetector
      await EventDetector.forceEndEvent();
      await AudioMonitor.stopMonitoring();
      setIsMonitoring(false);
      setCurrentDecibel(0);
      await loadData();
    } catch (error) {
      Alert.alert('Stop Error', error.message);
    }
  };

  const toggleMonitoring = () => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  };

  const estimateRentReduction = () => {
    const eventsPerWeek = stats.totalEvents / 2;
    if (eventsPerWeek >= 10) return '180€/Monat';
    if (eventsPerWeek >= 5) return '90-180€/Monat';
    if (eventsPerWeek >= 2) return '45-90€/Monat';
    return 'Noch nicht genug Daten';
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.logo}>SilenceNow</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>
            Monitoring: {isMonitoring ? '● Aktiv' : '○ Pausiert'}
          </Text>
          <TouchableOpacity
            style={[styles.toggleButton, isMonitoring && styles.toggleButtonActive]}
            onPress={toggleMonitoring}
          >
            <Text style={styles.toggleButtonText}>
              {isMonitoring ? 'Stopp' : 'Start'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.statusSubtext}>
          {isMonitoring
            ? 'Überwachung läuft – Lärmereignisse werden automatisch erkannt'
            : 'Tippe Start um die Lärmüberwachung zu beginnen'}
        </Text>
      </View>

      {isMonitoring && <LiveMeter decibel={currentDecibel} />}

      <NightReport
        onDismiss={() => loadData()}
        onEventPress={(event) => navigation.navigate('EventDetail', { event })}
      />

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>14-Tage Zusammenfassung</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalEvents}</Text>
            <Text style={styles.statLabel}>Ereignisse</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.avgDecibel} dB</Text>
            <Text style={styles.statLabel}>Ø Pegel</Text>
          </View>
        </View>

        <View style={styles.estimateBox}>
          <Text style={styles.estimateLabel}>Geschätzte Mietminderung:</Text>
          <Text style={styles.estimateValue}>{estimateRentReduction()}</Text>
        </View>

        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => navigation.navigate('Reports')}
        >
          <Text style={styles.reportButtonText}>⚖️ Rechtliche Bewertung & Reports</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.eventsSection}>
        <Text style={styles.sectionTitle}>Letzte Ereignisse</Text>
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔇</Text>
            <Text style={styles.emptyText}>Noch keine Ereignisse</Text>
            <Text style={styles.emptySubtext}>
              {isMonitoring
                ? 'Überwachung aktiv. Ereignisse erscheinen hier automatisch.'
                : 'Starte die Überwachung um Lärmereignisse zu erkennen.'}
            </Text>
          </View>
        ) : (
          events.map((event, index) => (
            <EventCard
              key={event.id || index}
              event={event}
              onPress={() => navigation.navigate('EventDetail', { event })}
            />
          ))
        )}
      </View>

    </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.SOFT_WHITE,
  },
  settingsIcon: {
    fontSize: 24,
  },
  statusCard: {
    backgroundColor: 'rgba(248, 249, 250, 0.1)',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(248, 249, 250, 0.2)',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: COLORS.SOFT_WHITE,
    fontWeight: '600',
  },
  toggleButton: {
    backgroundColor: COLORS.ELECTRIC_GREEN,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.ERROR_RED,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
  },
  statusSubtext: {
    fontSize: 14,
    color: COLORS.WARM_GREY,
  },
  statsCard: {
    backgroundColor: COLORS.SOFT_WHITE,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.MIDNIGHT_BLUE,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.MIDNIGHT_BLUE,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.WARM_GREY,
    marginTop: 4,
  },
  estimateBox: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  estimateLabel: {
    fontSize: 14,
    color: COLORS.WARM_GREY,
    marginBottom: 4,
  },
  estimateValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.ELECTRIC_GREEN,
  },
  reportButton: {
    backgroundColor: COLORS.ELECTRIC_GREEN,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  reportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
  },
  eventsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.SOFT_WHITE,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.SOFT_WHITE,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.WARM_GREY,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
