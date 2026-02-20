/**
 * NightReport Component
 * 
 * Zeigt morgens eine Zusammenfassung der Nacht-Events (22-6 Uhr).
 * "Alle bestätigen" Button und einzeln prüfen.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS, NOISE_CATEGORIES } from '../utils/constants';
import DatabaseService from '../services/DatabaseService';

export default function NightReport({ onDismiss, onEventPress }) {
  const [nightEvents, setNightEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    checkForNightEvents();
  }, []);

  const checkForNightEvents = async () => {
    try {
      const now = new Date();
      const hour = now.getHours();

      // Nur morgens anzeigen (6-12 Uhr)
      if (hour < 6 || hour > 12) {
        setLoading(false);
        return;
      }

      const today = now.toISOString().split('T')[0];
      const events = await DatabaseService.getNightEvents(today);

      // Nur unbestätigte Events anzeigen
      const unconfirmedEvents = events.filter(
        e => (e.source_confirmed || 'unconfirmed') === 'unconfirmed'
      );

      if (unconfirmedEvents.length > 0) {
        setNightEvents(unconfirmedEvents);
        setVisible(true);
      }
    } catch (error) {
      console.error('[NightReport] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAll = async () => {
    try {
      const eventIds = nightEvents.map(e => e.id).filter(Boolean);
      if (eventIds.length > 0) {
        await DatabaseService.confirmNeighborBatch(eventIds, true);
        Alert.alert(
          '✅ Bestätigt',
          `${eventIds.length} Nacht-Events als Nachbar-Lärm bestätigt.`
        );
      }
      setVisible(false);
      if (onDismiss) onDismiss();
    } catch (error) {
      console.error('[NightReport] Confirm error:', error);
      Alert.alert('Fehler', 'Events konnten nicht bestätigt werden.');
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };

  const getCategoryEmoji = (categoryKey) => {
    const cat = Object.values(NOISE_CATEGORIES).find(c => c.key === categoryKey);
    return cat ? cat.emoji : '🔊';
  };

  const getCategoryLabel = (categoryKey) => {
    const cat = Object.values(NOISE_CATEGORIES).find(c => c.key === categoryKey);
    return cat ? cat.label : 'Lärm';
  };

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    const d = new Date(isoString);
    return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (startStr, endStr) => {
    if (!startStr || !endStr) return '';
    const startMs = new Date(startStr).getTime();
    const endMs = new Date(endStr).getTime();
    const diffMin = Math.round((endMs - startMs) / 60000);
    if (diffMin < 1) return '<1 Min';
    return `${diffMin} Min`;
  };

  if (loading || !visible || nightEvents.length === 0) return null;

  // Zusammenfassung berechnen
  const totalDurationMin = nightEvents.reduce((sum, e) => {
    const s = new Date(e.start_time || e.timestamp).getTime();
    const end = e.end_time ? new Date(e.end_time).getTime() : s + (e.duration || 0) * 1000;
    return sum + (end - s) / 60000;
  }, 0);

  const avgDb = nightEvents.reduce((sum, e) => sum + (e.avg_decibel || e.decibel || 0), 0) / nightEvents.length;
  const peakDb = Math.max(...nightEvents.map(e => e.peak_decibel || e.decibel || 0));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌙 Nacht-Report</Text>
        <TouchableOpacity onPress={handleDismiss}>
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Zusammenfassung */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {nightEvents.length} Lärm-Event{nightEvents.length !== 1 ? 's' : ''} letzte Nacht (22-06 Uhr)
        </Text>
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round(totalDurationMin)} Min</Text>
            <Text style={styles.statLabel}>Gesamt</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round(avgDb)} dB</Text>
            <Text style={styles.statLabel}>Ø Pegel</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round(peakDb)} dB</Text>
            <Text style={styles.statLabel}>Spitze</Text>
          </View>
        </View>
      </View>

      {/* Event Liste */}
      {nightEvents.slice(0, 5).map((event, index) => (
        <TouchableOpacity
          key={event.id || index}
          style={styles.eventRow}
          onPress={() => onEventPress && onEventPress(event)}
        >
          <Text style={styles.eventEmoji}>
            {getCategoryEmoji(event.noise_category)}
          </Text>
          <View style={styles.eventInfo}>
            <Text style={styles.eventCategory}>
              {getCategoryLabel(event.noise_category)}
            </Text>
            <Text style={styles.eventTime}>
              {formatTime(event.start_time || event.timestamp)}
              {event.end_time ? ` - ${formatTime(event.end_time)}` : ''}
              {event.start_time && event.end_time
                ? ` · ${formatDuration(event.start_time, event.end_time)}`
                : ''}
            </Text>
          </View>
          <Text style={styles.eventDb}>
            {event.avg_decibel || event.decibel || 0} dB
          </Text>
        </TouchableOpacity>
      ))}

      {nightEvents.length > 5 && (
        <Text style={styles.moreText}>
          + {nightEvents.length - 5} weitere Events
        </Text>
      )}

      {/* Aktionen */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.confirmAllBtn} onPress={handleConfirmAll}>
          <Text style={styles.confirmAllText}>
            🏠 Alle als Nachbar bestätigen ({nightEvents.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.laterBtn} onPress={handleDismiss}>
          <Text style={styles.laterText}>Später prüfen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.SOFT_WHITE,
  },
  dismissText: {
    fontSize: 20,
    color: COLORS.WARM_GREY,
    padding: 4,
  },
  summary: {
    backgroundColor: 'rgba(229, 57, 53, 0.15)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.SOFT_WHITE,
    fontWeight: '600',
    marginBottom: 8,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.SOFT_WHITE,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.WARM_GREY,
    marginTop: 2,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  eventEmoji: {
    fontSize: 22,
    marginRight: 10,
  },
  eventInfo: {
    flex: 1,
  },
  eventCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.SOFT_WHITE,
  },
  eventTime: {
    fontSize: 12,
    color: COLORS.WARM_GREY,
    marginTop: 2,
  },
  eventDb: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  moreText: {
    fontSize: 12,
    color: COLORS.WARM_GREY,
    textAlign: 'center',
    paddingVertical: 6,
  },
  actions: {
    marginTop: 12,
    gap: 8,
  },
  confirmAllBtn: {
    backgroundColor: COLORS.ELECTRIC_GREEN,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.MIDNIGHT_BLUE,
  },
  laterBtn: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  laterText: {
    fontSize: 13,
    color: COLORS.WARM_GREY,
  },
});
