import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { COLORS, DEFAULTS } from '../utils/constants';
import DatabaseService from '../services/DatabaseService';

export default function SettingsScreen({ navigation }) {
  const [threshold, setThreshold] = useState(DEFAULTS.THRESHOLD_DB);
  const [notifications, setNotifications] = useState(true);
  const [nightMode, setNightMode] = useState(false);

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all recorded events. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await DatabaseService.deleteAllEvents();
            Alert.alert('Success', 'All data deleted');
          }
        }
      ]
    );
  };

  const handleSync = async () => {
    Alert.alert('Syncing...', 'This may take a moment');
    await DatabaseService.syncToSupabase();
    Alert.alert('Success', 'Data synced to cloud');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monitoring</Text>

        <SettingRow
          label="Detection Threshold"
          value={`${threshold} dB`}
          onPress={() => Alert.alert('Coming Soon', 'Threshold adjustment will be available in next version')}
        />

        <SettingSwitch
          label="Push Notifications"
          value={notifications}
          onValueChange={setNotifications}
        />

        <SettingSwitch
          label="Night Mode Only (22:00-06:00)"
          value={nightMode}
          onValueChange={setNightMode}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>

        <SettingRow
          label="Sync to Cloud"
          value="Now"
          onPress={handleSync}
        />

        <SettingRow
          label="Export Data"
          value="CSV"
          onPress={() => Alert.alert('Coming Soon', 'Data export will be available in next version')}
        />

        <SettingRow
          label="Delete All Data"
          value=""
          destructive
          onPress={handleDeleteAllData}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>

        <View style={styles.privacyBox}>
          <Text style={styles.privacyTitle}>🔒 Privacy Guarantee</Text>
          <Text style={styles.privacyText}>
            SilenceNow never records audio. We only store:
            {'\n'}{'\u2022'} Decibel values (numbers)
            {'\n'}{'\u2022'} Frequency bands (numbers)
            {'\n'}{'\u2022'} Timestamps
            {'\n'}{'\n'}
            No audio files. No voices. No conversations.
            {'\n'}{'\n'}
            Your data is stored locally on your device. Cloud sync is optional.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <SettingRow label="Version" value="1.0.0 (MVP)" />
        <SettingRow label="Privacy Policy" value="" onPress={() => Alert.alert('Coming Soon')} />
        <SettingRow label="Terms of Service" value="" onPress={() => Alert.alert('Coming Soon')} />
        <SettingRow label="Contact Support" value="support@silencenow.app" />
        <SettingRow 
          label="🌙 Nachtmodus (24/7)" 
          value="›" 
          onPress={() => navigation.navigate('NightMode')} 
        />
        <SettingRow 
          label="🔧 Debug Panel" 
          value="›" 
          onPress={() => navigation.navigate('Debug')} 
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made with care for tenants' rights 🔇
        </Text>
      </View>
    </ScrollView>
  );
}

const SettingRow = ({ label, value, onPress, destructive }) => (
  <TouchableOpacity
    style={styles.settingRow}
    onPress={onPress}
    disabled={!onPress}
  >
    <Text style={[styles.settingLabel, destructive && styles.destructiveText]}>
      {label}
    </Text>
    {value !== '' && (
      <Text style={[styles.settingValue, destructive && styles.destructiveText]}>
        {value} {onPress && '›'}
      </Text>
    )}
  </TouchableOpacity>
);

const SettingSwitch = ({ label, value, onValueChange }) => (
  <View style={styles.settingRow}>
    <Text style={styles.settingLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: COLORS.WARM_GREY, true: COLORS.ELECTRIC_GREEN }}
      thumbColor={COLORS.SOFT_WHITE}
    />
  </View>
);

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
  section: {
    backgroundColor: COLORS.SOFT_WHITE,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.WARM_GREY,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingLabel: {
    fontSize: 16,
    color: COLORS.MIDNIGHT_BLUE,
  },
  settingValue: {
    fontSize: 16,
    color: COLORS.WARM_GREY,
  },
  destructiveText: {
    color: COLORS.ERROR_RED,
  },
  privacyBox: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.ELECTRIC_GREEN,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.MIDNIGHT_BLUE,
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    color: COLORS.MIDNIGHT_BLUE,
    lineHeight: 20,
  },
  footer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: COLORS.WARM_GREY,
  },
});
