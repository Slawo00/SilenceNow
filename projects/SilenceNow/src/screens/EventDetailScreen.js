import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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

  const getEmoji = (classification) => {
    if (classification && classification.includes('Music')) return '🎵';
    if (classification && classification.includes('Very Loud')) return '📢';
    return '🔊';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Event Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.emoji}>{getEmoji(event.classification)}</Text>
        <Text style={styles.classification}>{event.classification}</Text>
        <Text style={styles.datetime}>{dateString}</Text>
        <Text style={styles.time}>{timeString}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Measurement Data</Text>

        <DataRow label="Decibel Level" value={`${event.decibel} dB`} />
        <DataRow
          label="Duration"
          value={event.duration ? `${Math.floor(event.duration / 60)}m ${event.duration % 60}s` : 'N/A'}
        />
        <DataRow
          label="Intensity"
          value={event.decibel >= 80 ? 'Very High' : event.decibel >= 60 ? 'High' : 'Moderate'}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequency Profile</Text>
        <FrequencyBar label="Bass" value={event.freq_bass || 0} max={100} />
        <FrequencyBar label="Low-Mid" value={event.freq_low_mid || 0} max={100} />
        <FrequencyBar label="Mid" value={event.freq_mid || 0} max={100} />
        <FrequencyBar label="High-Mid" value={event.freq_high_mid || 0} max={100} />
        <FrequencyBar label="High" value={event.freq_high || 0} max={100} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal Reference</Text>
        <View style={styles.legalBox}>
          <Text style={styles.legalText}>
            Events above 55 dB during quiet hours (22:00-06:00) may justify rent reduction
            according to § 536 BGB.
          </Text>
          <Text style={styles.legalText}>
            This event was {event.decibel >= 55 ? 'ABOVE' : 'BELOW'} the threshold.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Coming Soon', 'Witness feature coming in Phase 2')}
        >
          <Text style={styles.actionButtonText}>+ Add Witness</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Coming Soon', 'Manual note feature coming in Phase 2')}
        >
          <Text style={styles.actionButtonText}>+ Add Note</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const DataRow = ({ label, value }) => (
  <View style={styles.dataRow}>
    <Text style={styles.dataLabel}>{label}</Text>
    <Text style={styles.dataValue}>{value}</Text>
  </View>
);

const FrequencyBar = ({ label, value, max }) => {
  const percentage = Math.min(100, (value / max) * 100);

  return (
    <View style={styles.freqRow}>
      <Text style={styles.freqLabel}>{label}</Text>
      <View style={styles.freqBarContainer}>
        <View style={[styles.freqBar, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.freqValue}>{Math.round(value)}</Text>
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
    marginBottom: 16,
  },
  classification: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.MIDNIGHT_BLUE,
    marginBottom: 8,
  },
  datetime: {
    fontSize: 16,
    color: COLORS.WARM_GREY,
    marginBottom: 4,
  },
  time: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
  },
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
  freqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  freqLabel: {
    fontSize: 14,
    color: COLORS.WARM_GREY,
    width: 70,
  },
  freqBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  freqBar: {
    height: '100%',
    backgroundColor: COLORS.ELECTRIC_GREEN,
  },
  freqValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
    width: 40,
    textAlign: 'right',
  },
  legalBox: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.ELECTRIC_GREEN,
  },
  legalText: {
    fontSize: 14,
    color: COLORS.MIDNIGHT_BLUE,
    lineHeight: 20,
    marginBottom: 8,
  },
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
