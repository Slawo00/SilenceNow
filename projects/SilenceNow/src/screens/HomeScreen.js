import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import NoiseRecordingService from '../services/NoiseRecordingService';
import DatabaseService from '../services/DatabaseService';
import LiveMeter from '../components/LiveMeter';
import EventCard from '../components/EventCard';

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

  useEffect(() => {
    loadData();

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

      const count = await DatabaseService.getEventsCount(14);
      const avg = await DatabaseService.getAverageDecibel(14);

      setStats({
        totalEvents: count,
        avgDecibel: Math.round(avg),
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
      // Use enhanced NoiseRecordingService
      const success = await NoiseRecordingService.startRecording({
        onStatusUpdate: (status) => {
          if (status.data && status.data.decibel) {
            setCurrentDecibel(status.data.decibel);
          }
        },
        onEventDetected: (event) => {
          console.log('Enhanced event detected:', event);
          loadData(); // Refresh event list
        },
        onError: (error) => {
          Alert.alert('Recording Error', error.message);
        }
      });
      
      if (success) {
        setIsMonitoring(true);
        Alert.alert('Enhanced Monitoring', 'Started advanced noise analysis with legal impact assessment');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start enhanced monitoring: ' + error.message);
    }
  };

  const stopMonitoring = async () => {
    try {
      const sessionSummary = await NoiseRecordingService.stopRecording();
      setIsMonitoring(false);
      setCurrentDecibel(0);
      await loadData();
      
      // Show session summary
      if (sessionSummary && sessionSummary.eventCount > 0) {
        Alert.alert(
          'Session Complete', 
          `Recorded ${sessionSummary.eventCount} events. Legal Impact Score: ${sessionSummary.legalImpactScore}/100`
        );
      }
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
    if (eventsPerWeek >= 10) return '180\u20AC/month';
    if (eventsPerWeek >= 5) return '90-180\u20AC/month';
    if (eventsPerWeek >= 2) return '45-90\u20AC/month';
    return 'Insufficient data';
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
            Monitoring: {isMonitoring ? '● Active' : '○ Paused'}
          </Text>
          <TouchableOpacity
            style={[styles.toggleButton, isMonitoring && styles.toggleButtonActive]}
            onPress={toggleMonitoring}
          >
            <Text style={styles.toggleButtonText}>
              {isMonitoring ? 'Pause' : 'Start'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.statusSubtext}>
          {isMonitoring
            ? 'Monitoring since: Just now'
            : 'Tap Start to begin monitoring'}
        </Text>
      </View>

      {isMonitoring && <LiveMeter decibel={currentDecibel} />}

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>14-Day Summary</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalEvents}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.avgDecibel} dB</Text>
            <Text style={styles.statLabel}>Avg Level</Text>
          </View>
        </View>

        <View style={styles.estimateBox}>
          <Text style={styles.estimateLabel}>Estimated Rent Reduction:</Text>
          <Text style={styles.estimateValue}>{estimateRentReduction()}</Text>
        </View>

        {stats.totalEvents >= 10 && (
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => Alert.alert('Coming Soon', 'Report generation will be available in next version')}
          >
            <Text style={styles.reportButtonText}>Generate Report</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.eventsSection}>
        <Text style={styles.sectionTitle}>Recent Events</Text>
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔇</Text>
            <Text style={styles.emptyText}>No events yet</Text>
            <Text style={styles.emptySubtext}>
              {isMonitoring
                ? 'Monitoring is active. Events will appear here.'
                : 'Start monitoring to detect noise events.'}
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
