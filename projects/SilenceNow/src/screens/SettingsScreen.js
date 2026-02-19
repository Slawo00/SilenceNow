import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { COLORS, DEFAULTS } from '../utils/constants';
import DatabaseService from '../services/DatabaseService';

export default function SettingsScreen({ navigation }) {
  const [threshold, setThreshold] = useState(DEFAULTS.THRESHOLD_DB);
  const [noiseAlerts, setNoiseAlerts] = useState(true);
  const [dailySummary, setDailySummary] = useState(true);
  const [nightModeOnly, setNightModeOnly] = useState(false);
  const [backgroundMonitoring, setBackgroundMonitoring] = useState(true);

  const handleDeleteAllData = () => {
    Alert.alert(
      'Alle Daten löschen',
      'Dies löscht alle aufgezeichneten Events unwiderruflich. Diese Aktion kann nicht rückgängig gemacht werden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            await DatabaseService.deleteAllEvents();
            Alert.alert('Erledigt', 'Alle Daten wurden gelöscht.');
          }
        }
      ]
    );
  };

  const handleSync = async () => {
    Alert.alert('Synchronisierung', 'Daten werden zur Cloud synchronisiert...');
    await DatabaseService.syncToSupabase();
    Alert.alert('Erledigt', 'Daten wurden synchronisiert.');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Zurück</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Einstellungen</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monitoring</Text>

        <SettingRow
          label="Erkennungsschwelle"
          value={`${threshold} dB`}
          onPress={() => Alert.alert('Schwellenwert', 'Die Erkennungsschwelle beträgt aktuell 55 dB. Werte darüber werden als Störung erfasst.')}
        />

        <SettingSwitch
          label="Hintergrund-Monitoring"
          value={backgroundMonitoring}
          onValueChange={setBackgroundMonitoring}
        />

        <SettingSwitch
          label="Nur Nachtmodus (22:00-06:00)"
          value={nightModeOnly}
          onValueChange={setNightModeOnly}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Benachrichtigungen</Text>

        <SettingSwitch
          label="Lärm-Benachrichtigungen"
          value={noiseAlerts}
          onValueChange={setNoiseAlerts}
        />

        <SettingSwitch
          label="Tägliche Zusammenfassung"
          value={dailySummary}
          onValueChange={setDailySummary}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daten</Text>

        <SettingRow
          label="Zur Cloud synchronisieren"
          value="Jetzt"
          onPress={handleSync}
        />

        <SettingRow
          label="Daten exportieren"
          value="CSV"
          onPress={() => Alert.alert('Export', 'CSV-Export wird in der nächsten Version verfügbar sein.')}
        />

        <SettingRow
          label="Alle Daten löschen"
          value=""
          destructive
          onPress={handleDeleteAllData}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datenschutz</Text>

        <View style={styles.privacyBox}>
          <Text style={styles.privacyTitle}>🔒 Datenschutz-Garantie</Text>
          <Text style={styles.privacyText}>
            SilenceNow nimmt niemals Audio auf. Wir speichern nur:
            {'\n'}{'\u2022'} Dezibel-Werte (Zahlen)
            {'\n'}{'\u2022'} Frequenzbänder (Zahlen)
            {'\n'}{'\u2022'} Zeitstempel
            {'\n'}{'\n'}
            Keine Audiodateien. Keine Stimmen. Keine Gespräche.
            {'\n'}§201 StGB und DSGVO konform.
            {'\n'}{'\n'}
            Deine Daten werden lokal auf deinem Gerät gespeichert. 
            Cloud-Sync ist optional.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Info</Text>

        <SettingRow label="Version" value="1.1.0 (MVP)" />
        <SettingRow label="Datenschutzerklärung" value="" onPress={() => Alert.alert('Datenschutz', 'Datenschutzerklärung wird ergänzt.')} />
        <SettingRow label="Nutzungsbedingungen" value="" onPress={() => Alert.alert('AGB', 'Nutzungsbedingungen werden ergänzt.')} />
        <SettingRow label="Support" value="support@silencenow.app" />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Für Mieterrechte entwickelt 🔇
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
    flex: 1,
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
