import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const HOURS = ['00', '06', '12', '18', '23'];

export default function Heatmap({ events = [] }) {
  const grid = Array(7).fill(null).map(() => Array(24).fill(0));

  events.forEach(event => {
    const date = new Date(event.timestamp);
    const day = (date.getDay() + 6) % 7;
    const hour = date.getHours();
    grid[day][hour] = Math.max(grid[day][hour], event.decibel || 0);
  });

  const getColor = (value) => {
    if (value === 0) return 'rgba(248, 249, 250, 0.1)';
    if (value >= 80) return COLORS.ERROR_RED;
    if (value >= 60) return COLORS.WARNING_AMBER;
    if (value >= 45) return COLORS.ELECTRIC_GREEN;
    return 'rgba(0, 230, 118, 0.3)';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Week Heatmap</Text>
      <View style={styles.hoursRow}>
        <View style={styles.dayLabel} />
        {HOURS.map(h => (
          <Text key={h} style={styles.hourLabel}>{h}</Text>
        ))}
      </View>
      {DAYS.map((day, dayIndex) => (
        <View key={day} style={styles.row}>
          <Text style={styles.dayLabel}>{day}</Text>
          <View style={styles.cells}>
            {grid[dayIndex].map((value, hourIndex) => (
              <View
                key={hourIndex}
                style={[styles.cell, { backgroundColor: getColor(value) }]}
              />
            ))}
          </View>
        </View>
      ))}
      <View style={styles.legend}>
        <Text style={styles.legendText}>Quiet</Text>
        <View style={[styles.legendDot, { backgroundColor: 'rgba(248, 249, 250, 0.1)' }]} />
        <View style={[styles.legendDot, { backgroundColor: 'rgba(0, 230, 118, 0.3)' }]} />
        <View style={[styles.legendDot, { backgroundColor: COLORS.ELECTRIC_GREEN }]} />
        <View style={[styles.legendDot, { backgroundColor: COLORS.WARNING_AMBER }]} />
        <View style={[styles.legendDot, { backgroundColor: COLORS.ERROR_RED }]} />
        <Text style={styles.legendText}>Loud</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(248, 249, 250, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.SOFT_WHITE,
    marginBottom: 12,
  },
  hoursRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  hourLabel: {
    flex: 1,
    fontSize: 10,
    color: COLORS.WARM_GREY,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  dayLabel: {
    width: 24,
    fontSize: 10,
    color: COLORS.WARM_GREY,
  },
  cells: {
    flex: 1,
    flexDirection: 'row',
    gap: 2,
  },
  cell: {
    flex: 1,
    height: 14,
    borderRadius: 2,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 10,
    color: COLORS.WARM_GREY,
    marginHorizontal: 4,
  },
});
