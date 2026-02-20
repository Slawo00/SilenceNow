import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, NOISE_CATEGORIES } from '../utils/constants';

export default function EventCard({ event, onPress }) {
  // Start/End time aus neuen Feldern oder Fallback
  const startTime = event.start_time || event.timestamp;
  const endTime = event.end_time;

  const startDate = new Date(startTime);
  const endDate = endTime ? new Date(endTime) : null;

  const startTimeStr = startDate.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTimeStr = endDate
    ? endDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    : null;

  const dateString = startDate.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
  });

  // Dauer berechnen
  let durationMin = 0;
  if (startDate && endDate) {
    durationMin = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
  } else if (event.duration) {
    durationMin = Math.round(event.duration / 60);
  }

  // Kategorie-Emoji (noise_category hat Vorrang)
  const noiseCategory = event.noise_category;
  const categoryObj = noiseCategory
    ? Object.values(NOISE_CATEGORIES).find(c => c.key === noiseCategory)
    : null;

  // AI classification als Fallback
  const aiEmoji = event.aiEmoji || event.ai_emoji;
  const aiType = event.aiType || event.ai_type;

  const displayEmoji = categoryObj ? categoryObj.emoji : (aiEmoji || getDefaultEmoji(event.classification));
  const displayType = categoryObj ? categoryObj.label : (aiType || translateClassification(event.classification) || 'Anderes');

  // Nachbar-Badge
  const neighborScore = event.neighbor_score || 0;
  const sourceConfirmed = event.source_confirmed || 'unconfirmed';
  const isNeighbor = sourceConfirmed === 'neighbor' || neighborScore > 60;

  // Nacht-Badge
  const hour = startDate.getHours();
  const isNighttime = hour >= 22 || hour < 6;

  // Dezibel: avg_decibel bevorzugen
  const displayDecibel = Math.round(event.avg_decibel || event.decibel || 0);

  function translateClassification(cls) {
    if (!cls) return null;
    const map = {
      'Loud': 'Anderes', 'Very Loud': 'Anderes', 'Moderate': 'Anderes',
      'Gespräche / TV': 'Anderes', 'Ruhestörung': 'Anderes',
      'Musik (Bass)': 'Musik/Bass', 'Musik (Starker Bass)': 'Musik/Bass',
      'Trittschall / Schritte': 'Trittschall/Schritte',
      'Laute Stimmen / Streit': 'Geschrei/Streit',
      'Bauarbeiten / Bohren': 'Handwerk/Bohren', 'Klopfen / Hämmern': 'Handwerk/Bohren',
      'Haustiere / Bellen': 'Hund/Tier',
      'Maschinen / Brummen': 'Anderes',
    };
    return map[cls] || cls;
  }

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

  // Zeitformat: "23:15 - 23:22 · 7 Min"
  const timeDisplay = endTimeStr
    ? `${startTimeStr} - ${endTimeStr} · ${durationMin < 1 ? '<1' : durationMin} Min`
    : `${dateString} · ${startTimeStr}`;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.leftSection}>
        <Text style={styles.emoji}>{displayEmoji}</Text>
        <View style={styles.textArea}>
          <View style={styles.titleRow}>
            <Text style={styles.classification} numberOfLines={1}>{displayType}</Text>
            {isNeighbor && (
              <Text style={styles.neighborBadge}>🏠</Text>
            )}
          </View>
          <Text style={styles.time}>{timeDisplay}</Text>
          {!endTimeStr && (
            <Text style={styles.time}>{dateString}</Text>
          )}
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={[styles.decibel, { color: getDecibelColor(displayDecibel) }]}>
          {displayDecibel} dB
        </Text>
        {event.peak_decibel > 0 && event.peak_decibel !== displayDecibel && (
          <Text style={styles.peakDb}>↑{Math.round(event.peak_decibel)}</Text>
        )}
        <View style={styles.badges}>
          {isNighttime && <Text style={styles.badge}>🌙</Text>}
          {sourceConfirmed === 'unconfirmed' && neighborScore >= 30 && (
            <Text style={styles.badge}>❓</Text>
          )}
        </View>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  classification: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
  },
  neighborBadge: {
    fontSize: 14,
  },
  time: {
    fontSize: 12,
    color: COLORS.WARM_GREY,
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
  peakDb: {
    fontSize: 11,
    color: COLORS.WARM_GREY,
    marginTop: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  badge: {
    fontSize: 14,
  },
});
