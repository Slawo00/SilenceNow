import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import DatabaseService from '../services/DatabaseService';

const DebugScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Local stats
      const localEvents = await DatabaseService.getAllEvents(10);
      const totalCount = await DatabaseService.getEventsCount(30);
      
      // Unsynced events (only on mobile)
      let unsyncedCount = 0;
      if (DatabaseService.useLocalDB && DatabaseService.db) {
        const unsynced = await DatabaseService.db.getAllAsync(
          'SELECT COUNT(*) as count FROM noise_events WHERE synced = 0'
        );
        unsyncedCount = unsynced[0]?.count || 0;
      }

      // Supabase status
      const supabaseConnected = DatabaseService.isSupabaseConnected();
      const client = DatabaseService.getSupabaseClient();
      
      setStats({
        platform: DatabaseService.useLocalDB ? 'Mobile (SQLite)' : 'Web (Memory)',
        localEventsCount: localEvents.length,
        totalEventsCount: totalCount,
        unsyncedCount,
        supabaseConnected,
        lastEvents: localEvents.slice(0, 5),
        envVars: {
          hasUrl: !!process.env.EXPO_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
        }
      });
    } catch (error) {
      Alert.alert('Debug Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const forceSync = async () => {
    setLoading(true);
    try {
      await DatabaseService.forceSyncNow();
      Alert.alert('Sync', 'Force sync completed! Check logs.');
      loadStats(); // Refresh stats
    } catch (error) {
      Alert.alert('Sync Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const insertTestEvent = async () => {
    setLoading(true);
    try {
      await DatabaseService.insertEvent({
        timestamp: new Date().toISOString(),
        decibel: 88.8,
        duration: 10,
        classification: 'DEBUG_TEST',
        freqBands: { bass: 20, lowMid: 15, mid: 10, highMid: 8, high: 5 },
      });
      Alert.alert('Test Event', 'Debug event inserted!');
      loadStats();
    } catch (error) {
      Alert.alert('Insert Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading debug info...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔧 Debug Panel</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Platform</Text>
        <Text style={styles.value}>{stats.platform}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Events</Text>
        <Text style={styles.value}>Recent Events: {stats.localEventsCount}</Text>
        <Text style={styles.value}>Total Events (30d): {stats.totalEventsCount}</Text>
        <Text style={[styles.value, stats.unsyncedCount > 0 ? styles.warning : styles.success]}>
          Unsynced: {stats.unsyncedCount}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌐 Supabase</Text>
        <Text style={[styles.value, stats.supabaseConnected ? styles.success : styles.error]}>
          Connected: {stats.supabaseConnected ? '✅' : '❌'}
        </Text>
        <Text style={[styles.value, stats.envVars.hasUrl ? styles.success : styles.error]}>
          Has URL: {stats.envVars.hasUrl ? '✅' : '❌'}
        </Text>
        <Text style={[styles.value, stats.envVars.hasKey ? styles.success : styles.error]}>
          Has Key: {stats.envVars.hasKey ? '✅' : '❌'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Recent Events</Text>
        {stats.lastEvents.map((event, index) => (
          <Text key={index} style={styles.eventItem}>
            {event.timestamp} | {event.decibel}dB | {event.classification} | Synced: {event.synced ? '✅' : '❌'}
          </Text>
        ))}
        {stats.lastEvents.length === 0 && (
          <Text style={styles.value}>No events found</Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={loadStats} disabled={loading}>
          <Text style={styles.buttonText}>🔄 Refresh</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={forceSync} disabled={loading}>
          <Text style={styles.buttonText}>⚡ Force Sync</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={insertTestEvent} disabled={loading}>
          <Text style={styles.buttonText}>🧪 Test Event</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  loading: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 50,
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  value: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  success: {
    color: '#4CAF50',
  },
  warning: {
    color: '#FF9800',
  },
  error: {
    color: '#F44336',
  },
  eventItem: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 3,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default DebugScreen;