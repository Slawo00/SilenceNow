import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// SQLite nur für native Plattformen laden
let SQLite = null;
if (Platform.OS !== 'web') {
  SQLite = require('expo-sqlite');
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

class DatabaseService {
  constructor() {
    this.db = null;
    this.useLocalDB = Platform.OS !== 'web' && SQLite !== null;
    this.memoryCache = []; // Web fallback
    this._initPromise = this.initializeLocalDB();
  }

  async initializeLocalDB() {
    if (this.useLocalDB) {
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

      console.log('Local SQLite database initialized');
    } else {
      console.log('Web platform detected - using memory cache + Supabase only');
    }
  }

  async _ensureReady() {
    await this._initPromise;
  }

  async insertEvent(event) {
    await this._ensureReady();
    
    if (this.useLocalDB) {
      // Native: SQLite
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

        console.log('Event inserted to SQLite:', result.lastInsertRowId);
        return result.lastInsertRowId;
      } catch (error) {
        console.error('Error inserting to SQLite:', error);
        return null;
      }
    } else {
      // Web: Memory cache + direct Supabase
      const eventWithId = {
        id: Date.now(),
        ...event,
        synced: 0,
        created_at: new Date().toISOString()
      };
      
      this.memoryCache.push(eventWithId);
      console.log('Event cached for web:', eventWithId.id);
      
      // Direkt zu Supabase syncen
      await this.syncToSupabase();
      return eventWithId.id;
    }
  }

  async getAllEvents() {
    await this._ensureReady();
    
    if (this.useLocalDB) {
      try {
        const result = await this.db.getAllAsync(
          'SELECT * FROM noise_events ORDER BY timestamp DESC'
        );
        return result;
      } catch (error) {
        console.error('Error fetching from SQLite:', error);
        return [];
      }
    } else {
      // Web: Return memory cache + fetch from Supabase
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('noise_events')
            .select('*')
            .order('timestamp', { ascending: false });
          
          if (error) throw error;
          return data || [];
        } catch (error) {
          console.error('Error fetching from Supabase:', error);
        }
      }
      
      return this.memoryCache.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
  }

  async getEventsCount(days = 14) {
    await this._ensureReady();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoff = cutoffDate.toISOString();

    if (this.useLocalDB) {
      try {
        const result = await this.db.getFirstAsync(
          'SELECT COUNT(*) as count FROM noise_events WHERE timestamp > ?',
          [cutoff]
        );
        return result?.count || 0;
      } catch (error) {
        console.error('Error counting SQLite events:', error);
        return 0;
      }
    } else {
      const events = await this.getAllEvents();
      return events.filter(e => e.timestamp > cutoff).length;
    }
  }

  async getAverageDecibel(days = 14) {
    await this._ensureReady();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoff = cutoffDate.toISOString();

    if (this.useLocalDB) {
      try {
        const result = await this.db.getFirstAsync(
          'SELECT AVG(decibel) as avg FROM noise_events WHERE timestamp > ?',
          [cutoff]
        );
        return result?.avg || 0;
      } catch (error) {
        console.error('Error calculating SQLite average:', error);
        return 0;
      }
    } else {
      const events = await this.getAllEvents();
      const recentEvents = events.filter(e => e.timestamp > cutoff);
      if (recentEvents.length === 0) return 0;
      
      const sum = recentEvents.reduce((acc, e) => acc + e.decibel, 0);
      return sum / recentEvents.length;
    }
  }

  async syncToSupabase() {
    if (!supabase) {
      console.log('Supabase not configured, skipping sync');
      return;
    }

    try {
      await this._ensureReady();
      let unsyncedEvents = [];

      if (this.useLocalDB) {
        unsyncedEvents = await this.db.getAllAsync(
          'SELECT * FROM noise_events WHERE synced = 0'
        );
      } else {
        unsyncedEvents = this.memoryCache.filter(e => e.synced === 0);
      }

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
            bass: event.freq_bass || event.freqBands?.bass,
            lowMid: event.freq_low_mid || event.freqBands?.lowMid,
            mid: event.freq_mid || event.freqBands?.mid,
            highMid: event.freq_high_mid || event.freqBands?.highMid,
            high: event.freq_high || event.freqBands?.high,
          },
          classification: event.classification,
        })));

      if (error) throw error;

      // Mark as synced
      if (this.useLocalDB) {
        await this.db.runAsync(
          'UPDATE noise_events SET synced = 1 WHERE synced = 0'
        );
      } else {
        this.memoryCache.forEach(e => e.synced = 1);
      }

      console.log(`Synced ${unsyncedEvents.length} events to Supabase`);
    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  async deleteAllEvents() {
    await this._ensureReady();
    
    if (this.useLocalDB) {
      try {
        await this.db.runAsync('DELETE FROM noise_events');
        console.log('All SQLite events deleted');
      } catch (error) {
        console.error('Error deleting SQLite events:', error);
      }
    } else {
      this.memoryCache = [];
      console.log('Memory cache cleared');
    }
  }
}

export default new DatabaseService();