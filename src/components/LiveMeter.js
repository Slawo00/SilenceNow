import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, DEFAULTS } from '../utils/constants';

export default function LiveMeter({ decibel }) {
  const percentage = Math.min(100, Math.max(0, ((decibel - 30) / 90) * 100));

  let barColor = COLORS.ELECTRIC_GREEN;
  if (decibel >= DEFAULTS.THRESHOLD_DB) {
    barColor = COLORS.ERROR_RED;
  } else if (decibel >= DEFAULTS.QUIET_BASELINE) {
    barColor = COLORS.WARNING_AMBER;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Live Measurement</Text>
      <View style={styles.meterContainer}>
        <View style={styles.meterBackground}>
          <View
            style={[
              styles.meterBar,
              { height: `${percentage}%`, backgroundColor: barColor }
            ]}
          />
        </View>
        <Text style={styles.value}>{decibel} dB</Text>
      </View>
      <Text style={styles.status}>
        {decibel >= DEFAULTS.THRESHOLD_DB ? '🔴 Event Detected' : '✅ Quiet'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.SOFT_WHITE,
    borderRadius: 12,
    marginVertical: 10,
    marginHorizontal: 20,
  },
  label: {
    fontSize: 14,
    color: COLORS.WARM_GREY,
    marginBottom: 10,
    fontWeight: '600',
  },
  meterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  meterBackground: {
    width: 60,
    height: 200,
    backgroundColor: '#E0E0E0',
    borderRadius: 30,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  meterBar: {
    width: '100%',
    borderRadius: 30,
  },
  value: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.MIDNIGHT_BLUE,
    flex: 1,
    textAlign: 'center',
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
    textAlign: 'center',
    marginTop: 12,
  },
});
