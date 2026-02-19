import * as SQLite from 'expo-sqlite';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

class DatabaseService {
  constructor() {
    this.db = null;
    this._initPromise = this.initializeLocalDB();
  }

  async initializeLocalDB() {
    this.db = await SQLite.openDatabaseAsync('silencenow.db');

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS noise_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        decibel REAL NOT NULL,
        duration INTEGER,
        freq_bass REAL,
        freq_low_mid REAL,
        freq_mid REAL,
        freq_high_mid REAL,
        freq_high REAL,
        classification TEXT DEFAULT 'Loud',
        synced INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Local database initialized');
  }

  async _ensureReady() {
    await this._initPromise;
  }

  async insertEvent(event) {
    await this._ensureReady();
    try {
      const result = await this.db.runAsync(
        `INSERT INTO noise_events 
        (timestamp, decibel, duration, freq_bass, freq_low_mid, freq_mid, freq_high_mid, freq_high, classification) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          event.timestamp,
          event.decibel,
          event.duration || 0,
          event.freqBands.bass,
          event.freqBands.lowMid,
          event.freqBands.mid,
          event.freqBands.highMid,
          event.freqBands.high,
          event.classification,
        ]
      );

      console.log('Event inserted:', result.lastInsertRowId);
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error inserting event:', error);
      return null;
    }
  }

  async getAllEvents() {
    await this._ensureReady();
    try {
      const result = await this.db.getAllAsync(
        'SELECT * FROM noise_events ORDER BY timestamp DESC'
      );
      return result;
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  async getEventsCount(days = 14) {
    await this._ensureReady();
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoff = cutoffDate.toISOString();

      const result = await this.db.getFirstAsync(
        'SELECT COUNT(*) as count FROM noise_events WHERE timestamp > ?',
        [cutoff]
      );

      return result?.count || 0;
    } catch (error) {
      console.error('Error counting events:', error);
      return 0;
    }
  }

  async getAverageDecibel(days = 14) {
    await this._ensureReady();
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoff = cutoffDate.toISOString();

      const result = await this.db.getFirstAsync(
        'SELECT AVG(decibel) as avg FROM noise_events WHERE timestamp > ?',
        [cutoff]
      );

      return result?.avg || 0;
    } catch (error) {
      console.error('Error calculating average:', error);
      return 0;
    }
  }

  async syncToSupabase() {
    if (!supabase) {
      console.log('Supabase not configured, skipping sync');
      return;
    }

    try {
      await this._ensureReady();
      const unsyncedEvents = await this.db.getAllAsync(
        'SELECT * FROM noise_events WHERE synced = 0'
      );

      if (unsyncedEvents.length === 0) {
        console.log('No events to sync');
        return;
      }

      const { data, error } = await supabase
        .from('noise_events')
        .insert(unsyncedEvents.map(event => ({
          timestamp: event.timestamp,
          decibel: event.decibel,
          duration: event.duration,
          freq_bands: {
            bass: event.freq_bass,
            lowMid: event.freq_low_mid,
            mid: event.freq_mid,
            highMid: event.freq_high_mid,
            high: event.freq_high,
          },
          classification: event.classification,
        })));

      if (error) throw error;

      await this.db.runAsync(
        'UPDATE noise_events SET synced = 1 WHERE synced = 0'
      );

      console.log(`Synced ${unsyncedEvents.length} events to Supabase`);
    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  async deleteAllEvents() {
    await this._ensureReady();
    try {
      await this.db.runAsync('DELETE FROM noise_events');
      console.log('All events deleted');
    } catch (error) {
      console.error('Error deleting events:', error);
    }
  }
}

export default new DatabaseService();
