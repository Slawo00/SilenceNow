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

  const getEmoji = (classification) => {
    if (classification && classification.includes('Music')) return '🎵';
    if (classification && classification.includes('Very Loud')) return '📢';
    return '🔊';
  };

  const getColor = (decibel) => {
    if (decibel >= 80) return COLORS.ERROR_RED;
    if (decibel >= 60) return COLORS.WARNING_AMBER;
    return COLORS.ELECTRIC_GREEN;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.leftSection}>
        <Text style={styles.emoji}>{getEmoji(event.classification)}</Text>
        <View>
          <Text style={styles.classification}>{event.classification || 'Loud'}</Text>
          <Text style={styles.time}>{dateString} · {timeString}</Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={[styles.decibel, { color: getColor(event.decibel) }]}>
          {event.decibel} dB
        </Text>
        {event.duration > 0 && (
          <Text style={styles.duration}>
            {event.duration >= 60
              ? `${Math.floor(event.duration / 60)}m ${event.duration % 60}s`
              : `${event.duration}s`}
          </Text>
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
  },
  emoji: {
    fontSize: 28,
  },
  classification: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
  },
  time: {
    fontSize: 13,
    color: COLORS.WARM_GREY,
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  decibel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  duration: {
    fontSize: 13,
    color: COLORS.WARM_GREY,
    marginTop: 2,
  },
});
