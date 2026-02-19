import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../utils/constants';

export default function EventCard({ event, onPress }) {
  const date = new Date(event.timestamp);
  const timeString = date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateString = date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
  });

  // Use AI classification if available
  const aiEmoji = event.aiEmoji || event.ai_emoji;
  const aiType = event.aiType || event.ai_type;
  const aiConfidence = event.aiConfidence || event.ai_confidence || 0;
  const aiSeverity = event.aiSeverity || event.ai_severity;

  const displayEmoji = aiEmoji || getDefaultEmoji(event.classification);
  const displayType = aiType || event.classification || 'Laut';

  // Night violation badge
  const hour = date.getHours();
  const isNighttime = hour >= 22 || hour < 6;

  function getDefaultEmoji(classification) {
    if (!classification) return '🔊';
    if (classification.includes('Music') || classification.includes('Musik')) return '🎵';
    if (classification.includes('Very Loud') || classification.includes('Stark')) return '📢';
    if (classification.includes('Stimmen') || classification.includes('Voice')) return '🗣️';
    if (classification.includes('Bau') || classification.includes('Hammer')) return '🔨';
    if (classification.includes('Maschine') || classification.includes('Brumm')) return '⚙️';
    if (classification.includes('Hund') || classification.includes('Bell')) return '🐕';
    if (classification.includes('Tritt') || classification.includes('Schritt')) return '👣';
    return '🔊';
  }

  const getDecibelColor = (decibel) => {
    if (decibel >= 80) return '#E53935';
    if (decibel >= 65) return '#FF9800';
    if (decibel >= 55) return '#FFC107';
    return COLORS.ELECTRIC_GREEN;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.leftSection}>
        <Text style={styles.emoji}>{displayEmoji}</Text>
        <View style={styles.textArea}>
          <Text style={styles.classification} numberOfLines={1}>{displayType}</Text>
          <Text style={styles.time}>{dateString} · {timeString}</Text>
          {aiConfidence > 0 && (
            <Text style={styles.confidence}>KI: {aiConfidence}%</Text>
          )}
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={[styles.decibel, { color: getDecibelColor(event.decibel) }]}>
          {event.decibel} dB
        </Text>
        {event.duration > 0 && (
          <Text style={styles.duration}>
            {event.duration >= 60
              ? `${Math.floor(event.duration / 60)}m ${event.duration % 60}s`
              : `${event.duration}s`}
          </Text>
        )}
        {isNighttime && (
          <Text style={styles.nightBadge}>🌙</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.SOFT_WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  emoji: {
    fontSize: 28,
  },
  textArea: {
    flex: 1,
  },
  classification: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
  },
  time: {
    fontSize: 12,
    color: COLORS.WARM_GREY,
    marginTop: 2,
  },
  confidence: {
    fontSize: 11,
    color: COLORS.ELECTRIC_GREEN,
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  decibel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  duration: {
    fontSize: 12,
    color: COLORS.WARM_GREY,
    marginTop: 2,
  },
  nightBadge: {
    fontSize: 14,
    marginTop: 2,
  },
});