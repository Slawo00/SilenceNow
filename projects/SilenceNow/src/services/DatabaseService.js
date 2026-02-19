/**
 * DatabaseService V3.0 - Full Supabase Integration
 * Punkt 6: Datenbank Integration - Supabase für Lärm-Logs
 * 
 * FEATURES:
 * - Platform-aware: SQLite (native offline) + Supabase (cloud sync)
 * - Auto-sync when online
 * - Daily summaries for 14-day protocol
 * - Legal scoring integration
 * - DSGVO compliant with RLS
 * 
 * @version 3.0
 */

import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// SQLite nur für native Plattformen laden
let SQLite = null;
if (Platform.OS !== 'web') {
  SQLite = require('expo-sqlite');
}

// Supabase Client initialisieren
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
    this.sessionCache = []; // Monitoring sessions
    this.syncQueue = []; // Offline sync queue
    this.isSyncing = false;
    this._initPromise = this.initializeLocalDB();
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================

  async initializeLocalDB() {
    if (this.useLocalDB) {
      this.db = await SQLite.openDatabaseAsync('silencenow.db');

      // Base schema (compatible with existing DB)
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS noise_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp TEXT NOT NULL,
          decibel REAL NOT NULL,
          duration INTEGER DEFAULT 0,
          freq_bass REAL DEFAULT 0,
          freq_low_mid REAL DEFAULT 0,
          freq_mid REAL DEFAULT 0,
          freq_high_mid REAL DEFAULT 0,
          freq_high REAL DEFAULT 0,
          classification TEXT DEFAULT 'Loud',
          synced INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Migrate: Add new columns to existing table (safe - ignores if exists)
      const migrations = [
        'ALTER TABLE noise_events ADD COLUMN detailed_type TEXT',
        'ALTER TABLE noise_events ADD COLUMN likely_source TEXT',
        'ALTER TABLE noise_events ADD COLUMN legal_relevance TEXT DEFAULT "low"',
        'ALTER TABLE noise_events ADD COLUMN legal_score INTEGER DEFAULT 0',
        'ALTER TABLE noise_events ADD COLUMN is_nighttime_violation INTEGER DEFAULT 0',
        'ALTER TABLE noise_events ADD COLUMN time_context TEXT',
        'ALTER TABLE noise_events ADD COLUMN health_impact TEXT DEFAULT "low"',
        'ALTER TABLE noise_events ADD COLUMN duration_impact TEXT DEFAULT "brief"',
        'ALTER TABLE noise_events ADD COLUMN ai_type TEXT',
        'ALTER TABLE noise_events ADD COLUMN ai_confidence INTEGER DEFAULT 0',
        'ALTER TABLE noise_events ADD COLUMN ai_emoji TEXT',
        'ALTER TABLE noise_events ADD COLUMN ai_description TEXT',
        'ALTER TABLE noise_events ADD COLUMN ai_legal_category TEXT',
        'ALTER TABLE noise_events ADD COLUMN ai_severity TEXT',
      ];

      for (const migration of migrations) {
        try {
          await this.db.execAsync(migration);
        } catch (e) {
          // Column already exists - ignore
        }
      }

      await this.db.execAsync(`

        CREATE TABLE IF NOT EXISTS event_witnesses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_id INTEGER NOT NULL,
          witness_name TEXT NOT NULL,
          witness_contact TEXT,
          witness_relationship TEXT,
          statement TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (event_id) REFERENCES noise_events(id)
        );

        CREATE TABLE IF NOT EXISTS event_notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_id INTEGER NOT NULL,
          note_text TEXT NOT NULL,
          note_type TEXT DEFAULT 'general',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (event_id) REFERENCES noise_events(id)
        );

        CREATE TABLE IF NOT EXISTS monitoring_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          started_at TEXT NOT NULL,
          ended_at TEXT,
          total_measurements INTEGER DEFAULT 0,
          event_count INTEGER DEFAULT 0,
          avg_decibel REAL DEFAULT 0,
          peak_decibel REAL DEFAULT 0,
          background_noise REAL,
          legal_impact_score INTEGER DEFAULT 0,
          recommendations TEXT DEFAULT '[]',
          synced INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS daily_summaries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          summary_date TEXT NOT NULL UNIQUE,
          total_events INTEGER DEFAULT 0,
          total_monitoring_minutes INTEGER DEFAULT 0,
          avg_decibel REAL DEFAULT 0,
          peak_decibel REAL DEFAULT 0,
          night_events INTEGER DEFAULT 0,
          night_avg_decibel REAL DEFAULT 0,
          day_events INTEGER DEFAULT 0,
          day_avg_decibel REAL DEFAULT 0,
          daily_legal_score INTEGER DEFAULT 0,
          hourly_breakdown TEXT DEFAULT '{}',
          synced INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log('[DB] Local SQLite database initialized with extended schema');
    } else {
      console.log('[DB] Web platform - using memory cache + Supabase');
    }
  }

  async _ensureReady() {
    await this._initPromise;
  }

  // ============================================================
  // NOISE EVENTS - INSERT
  // ============================================================

  async insertEvent(event) {
    await this._ensureReady();
    
    // Compute legal fields
    const legalData = this._computeLegalFields(event);
    const enrichedEvent = { ...event, ...legalData };
    
    if (this.useLocalDB) {
      return this._insertEventSQLite(enrichedEvent);
    } else {
      return this._insertEventWeb(enrichedEvent);
    }
  }

  async _insertEventSQLite(event) {
    try {
      const result = await this.db.runAsync(
        `INSERT INTO noise_events 
        (timestamp, decibel, duration, freq_bass, freq_low_mid, freq_mid, freq_high_mid, freq_high,
         classification, detailed_type, likely_source, legal_relevance, legal_score,
         is_nighttime_violation, time_context, health_impact, duration_impact,
         ai_type, ai_confidence, ai_emoji, ai_description, ai_legal_category, ai_severity) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          event.timestamp,
          event.decibel,
          event.duration || 0,
          event.freqBands?.bass || 0,
          event.freqBands?.lowMid || 0,
          event.freqBands?.mid || 0,
          event.freqBands?.highMid || 0,
          event.freqBands?.high || 0,
          event.classification || 'Loud',
          event.detailedType || event.aiType || null,
          event.likelySource || null,
          event.legalRelevance || 'low',
          event.legalScore || 0,
          event.isNighttimeViolation ? 1 : 0,
          event.timeContext || null,
          event.healthImpact || 'low',
          event.durationImpact || 'brief',
          event.aiType || null,
          event.aiConfidence || 0,
          event.aiEmoji || null,
          event.aiDescription || null,
          event.aiLegalCategory || null,
          event.aiSeverity || null
        ]
      );

      console.log('[DB] Event inserted to SQLite:', result.lastInsertRowId);
      
      // Update local daily summary
      await this._updateLocalDailySummary(event);
      
      // Queue for Supabase sync
      this.syncQueue.push({ type: 'event', data: event });
      this._trySync();
      
      return result.lastInsertRowId;
    } catch (error) {
      console.error('[DB] SQLite insert error:', error);
      return null;
    }
  }

  async _insertEventWeb(event) {
    const eventWithId = {
      id: Date.now(),
      ...event,
      synced: 0,
      created_at: new Date().toISOString()
    };
    
    this.memoryCache.push(eventWithId);
    
    // Direct Supabase insert for web
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('noise_events')
          .insert({
            timestamp: event.timestamp,
            decibel: event.decibel,
            duration: event.duration || 0,
            freq_bass: event.freqBands?.bass || 0,
            freq_low_mid: event.freqBands?.lowMid || 0,
            freq_mid: event.freqBands?.mid || 0,
            freq_high_mid: event.freqBands?.highMid || 0,
            freq_high: event.freqBands?.high || 0,
            classification: event.classification || 'Loud',
            detailed_type: event.detailedType,
            likely_source: event.likelySource,
            legal_relevance: event.legalRelevance || 'low',
            legal_score: event.legalScore || 0,
            is_nighttime_violation: event.isNighttimeViolation || false,
            time_context: event.timeContext,
            health_impact: event.healthImpact || 'low',
            duration_impact: event.durationImpact || 'brief'
          })
          .select()
          .single();
        
        if (error) throw error;
        eventWithId.synced = 1;
        console.log('[DB] Event inserted to Supabase:', data?.id);
      } catch (error) {
        console.error('[DB] Supabase insert error:', error);
      }
    }
    
    return eventWithId.id;
  }

  // ============================================================
  // NOISE EVENTS - QUERY
  // ============================================================

  async getAllEvents(limit = 50) {
    await this._ensureReady();
    
    if (this.useLocalDB) {
      try {
        return await this.db.getAllAsync(
          'SELECT * FROM noise_events ORDER BY timestamp DESC LIMIT ?',
          [limit]
        );
      } catch (error) {
        console.error('[DB] SQLite getAllEvents error:', error);
        return [];
      }
    } else {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('noise_events')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(limit);
          
          if (error) throw error;
          return data || [];
        } catch (error) {
          console.error('[DB] Supabase getAllEvents error:', error);
        }
      }
      return this.memoryCache
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    }
  }

  async getEventsCount(days = 14) {
    await this._ensureReady();
    const cutoff = this._getCutoffDate(days);

    if (this.useLocalDB) {
      try {
        const result = await this.db.getFirstAsync(
          'SELECT COUNT(*) as count FROM noise_events WHERE timestamp > ?',
          [cutoff]
        );
        return result?.count || 0;
      } catch (error) {
        console.error('[DB] SQLite count error:', error);
        return 0;
      }
    } else {
      if (supabase) {
        try {
          const { count, error } = await supabase
            .from('noise_events')
            .select('*', { count: 'exact', head: true })
            .gte('timestamp', cutoff);
          if (error) throw error;
          return count || 0;
        } catch (error) {
          console.error('[DB] Supabase count error:', error);
        }
      }
      return this.memoryCache.filter(e => e.timestamp > cutoff).length;
    }
  }

  async getAverageDecibel(days = 14) {
    await this._ensureReady();
    const cutoff = this._getCutoffDate(days);

    if (this.useLocalDB) {
      try {
        const result = await this.db.getFirstAsync(
          'SELECT AVG(decibel) as avg FROM noise_events WHERE timestamp > ?',
          [cutoff]
        );
        return result?.avg || 0;
      } catch (error) {
        console.error('[DB] SQLite avg error:', error);
        return 0;
      }
    } else {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('noise_events')
            .select('decibel')
            .gte('timestamp', cutoff);
          if (error) throw error;
          if (!data || data.length === 0) return 0;
          return data.reduce((sum, e) => sum + e.decibel, 0) / data.length;
        } catch (error) {
          console.error('[DB] Supabase avg error:', error);
        }
      }
      const events = this.memoryCache.filter(e => e.timestamp > cutoff);
      if (events.length === 0) return 0;
      return events.reduce((sum, e) => sum + e.decibel, 0) / events.length;
    }
  }

  async getEventsByTimeRange(startDate, endDate) {
    await this._ensureReady();
    
    if (this.useLocalDB) {
      try {
        return await this.db.getAllAsync(
          'SELECT * FROM noise_events WHERE timestamp >= ? AND timestamp <= ? ORDER BY timestamp DESC',
          [startDate, endDate]
        );
      } catch (error) {
        console.error('[DB] SQLite time range error:', error);
        return [];
      }
    } else {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('noise_events')
            .select('*')
            .gte('timestamp', startDate)
            .lte('timestamp', endDate)
            .order('timestamp', { ascending: false });
          if (error) throw error;
          return data || [];
        } catch (error) {
          console.error('[DB] Supabase time range error:', error);
        }
      }
      return this.memoryCache.filter(e => e.timestamp >= startDate && e.timestamp <= endDate);
    }
  }

  async getNightViolations(days = 14) {
    await this._ensureReady();
    const cutoff = this._getCutoffDate(days);

    if (this.useLocalDB) {
      try {
        return await this.db.getAllAsync(
          'SELECT * FROM noise_events WHERE is_nighttime_violation = 1 AND timestamp > ? ORDER BY timestamp DESC',
          [cutoff]
        );
      } catch (error) {
        console.error('[DB] SQLite night violations error:', error);
        return [];
      }
    } else {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('noise_events')
            .select('*')
            .eq('is_nighttime_violation', true)
            .gte('timestamp', cutoff)
            .order('timestamp', { ascending: false });
          if (error) throw error;
          return data || [];
        } catch (error) {
          console.error('[DB] Supabase night violations error:', error);
        }
      }
      return this.memoryCache.filter(e => e.isNighttimeViolation && e.timestamp > cutoff);
    }
  }

  async getHighSeverityEvents(days = 14, minScore = 60) {
    await this._ensureReady();
    const cutoff = this._getCutoffDate(days);

    if (this.useLocalDB) {
      try {
        return await this.db.getAllAsync(
          'SELECT * FROM noise_events WHERE legal_score >= ? AND timestamp > ? ORDER BY legal_score DESC',
          [minScore, cutoff]
        );
      } catch (error) {
        console.error('[DB] SQLite high severity error:', error);
        return [];
      }
    } else {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('noise_events')
            .select('*')
            .gte('legal_score', minScore)
            .gte('timestamp', cutoff)
            .order('legal_score', { ascending: false });
          if (error) throw error;
          return data || [];
        } catch (error) {
          console.error('[DB] Supabase high severity error:', error);
        }
      }
      return this.memoryCache.filter(e => (e.legalScore || 0) >= minScore && e.timestamp > cutoff);
    }
  }

  // ============================================================
  // WITNESSES
  // ============================================================

  async addWitness(eventId, witness) {
    await this._ensureReady();
    
    if (this.useLocalDB) {
      try {
        const result = await this.db.runAsync(
          `INSERT INTO event_witnesses (event_id, witness_name, witness_contact, witness_relationship, statement)
           VALUES (?, ?, ?, ?, ?)`,
          [eventId, witness.name, witness.contact || null, witness.relationship || null, witness.statement || null]
        );
        console.log('[DB] Witness added:', result.lastInsertRowId);
        return result.lastInsertRowId;
      } catch (error) {
        console.error('[DB] Add witness error:', error);
        return null;
      }
    } else {
      // Web/Supabase fallback
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('event_witnesses')
            .insert({
              event_id: eventId,
              witness_name: witness.name,
              witness_contact: witness.contact || null,
              witness_relationship: witness.relationship || null,
              statement: witness.statement || null,
            })
            .select()
            .single();
          if (error) throw error;
          return data?.id;
        } catch (error) {
          console.error('[DB] Supabase add witness error:', error);
        }
      }
      return null;
    }
  }

  async getWitnesses(eventId) {
    await this._ensureReady();
    
    if (this.useLocalDB) {
      try {
        return await this.db.getAllAsync(
          'SELECT * FROM event_witnesses WHERE event_id = ? ORDER BY created_at DESC',
          [eventId]
        );
      } catch (error) {
        console.error('[DB] Get witnesses error:', error);
        return [];
      }
    } else {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('event_witnesses')
            .select('*')
            .eq('event_id', eventId)
            .order('created_at', { ascending: false });
          if (error) throw error;
          return data || [];
        } catch (error) {
          console.error('[DB] Supabase get witnesses error:', error);
        }
      }
      return [];
    }
  }

  async deleteWitness(witnessId) {
    await this._ensureReady();
    if (this.useLocalDB) {
      try {
        await this.db.runAsync('DELETE FROM event_witnesses WHERE id = ?', [witnessId]);
      } catch (error) {
        console.error('[DB] Delete witness error:', error);
      }
    }
  }

  // ============================================================
  // NOTES
  // ============================================================

  async addNote(eventId, note) {
    await this._ensureReady();
    
    if (this.useLocalDB) {
      try {
        const result = await this.db.runAsync(
          `INSERT INTO event_notes (event_id, note_text, note_type)
           VALUES (?, ?, ?)`,
          [eventId, note.text, note.type || 'general']
        );
        console.log('[DB] Note added:', result.lastInsertRowId);
        return result.lastInsertRowId;
      } catch (error) {
        console.error('[DB] Add note error:', error);
        return null;
      }
    } else {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('event_notes')
            .insert({
              event_id: eventId,
              note_text: note.text,
              note_type: note.type || 'general',
            })
            .select()
            .single();
          if (error) throw error;
          return data?.id;
        } catch (error) {
          console.error('[DB] Supabase add note error:', error);
        }
      }
      return null;
    }
  }

  async getNotes(eventId) {
    await this._ensureReady();
    
    if (this.useLocalDB) {
      try {
        return await this.db.getAllAsync(
          'SELECT * FROM event_notes WHERE event_id = ? ORDER BY created_at DESC',
          [eventId]
        );
      } catch (error) {
        console.error('[DB] Get notes error:', error);
        return [];
      }
    } else {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('event_notes')
            .select('*')
            .eq('event_id', eventId)
            .order('created_at', { ascending: false });
          if (error) throw error;
          return data || [];
        } catch (error) {
          console.error('[DB] Supabase get notes error:', error);
        }
      }
      return [];
    }
  }

  async deleteNote(noteId) {
    await this._ensureReady();
    if (this.useLocalDB) {
      try {
        await this.db.runAsync('DELETE FROM event_notes WHERE id = ?', [noteId]);
      } catch (error) {
        console.error('[DB] Delete note error:', error);
      }
    }
  }

  // ============================================================
  // MONITORING SESSIONS
  // ============================================================

  async saveSession(sessionData) {
    await this._ensureReady();
    
    if (this.useLocalDB) {
      try {
        const result = await this.db.runAsync(
          `INSERT INTO monitoring_sessions 
          (started_at, ended_at, total_measurements, event_count, avg_decibel, peak_decibel,
           background_noise, legal_impact_score, recommendations) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            sessionData.startedAt,
            sessionData.endedAt || new Date().toISOString(),
            sessionData.totalMeasurements || 0,
            sessionData.eventCount || 0,
            sessionData.avgDecibel || 0,
            sessionData.peakDecibel || 0,
            sessionData.backgroundNoise || null,
            sessionData.legalImpactScore || 0,
            JSON.stringify(sessionData.recommendations || [])
          ]
        );
        console.log('[DB] Session saved to SQLite:', result.lastInsertRowId);
        return result.lastInsertRowId;
      } catch (error) {
        console.error('[DB] SQLite session save error:', error);
        return null;
      }
    } else {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('monitoring_sessions')
            .insert({
              started_at: sessionData.startedAt,
              ended_at: sessionData.endedAt || new Date().toISOString(),
              total_measurements: sessionData.totalMeasurements || 0,
              event_count: sessionData.eventCount || 0,
              avg_decibel: sessionData.avgDecibel || 0,
              peak_decibel: sessionData.peakDecibel || 0,
              background_noise: sessionData.backgroundNoise,
              legal_impact_score: sessionData.legalImpactScore || 0,
              recommendations: sessionData.recommendations || []
            })
            .select()
            .single();
          if (error) throw error;
          console.log('[DB] Session saved to Supabase:', data?.id);
          return data?.id;
        } catch (error) {
          console.error('[DB] Supabase session save error:', error);
        }
      }
      this.sessionCache.push({ id: Date.now(), ...sessionData });
      return Date.now();
    }
  }

  async getSessions(limit = 20) {
    await this._ensureReady();
    
    if (this.useLocalDB) {
      try {
        return await this.db.getAllAsync(
          'SELECT * FROM monitoring_sessions ORDER BY started_at DESC LIMIT ?',
          [limit]
        );
      } catch (error) {
        console.error('[DB] SQLite sessions error:', error);
        return [];
      }
    } else {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('monitoring_sessions')
            .select('*')
            .order('started_at', { ascending: false })
            .limit(limit);
          if (error) throw error;
          return data || [];
        } catch (error) {
          console.error('[DB] Supabase sessions error:', error);
        }
      }
      return this.sessionCache.slice(-limit);
    }
  }

  // ============================================================
  // DAILY SUMMARIES - 14-DAY PROTOCOL
  // ============================================================

  async getDailySummaries(days = 14) {
    await this._ensureReady();
    const cutoff = this._getCutoffDate(days);

    if (this.useLocalDB) {
      try {
        return await this.db.getAllAsync(
          'SELECT * FROM daily_summaries WHERE summary_date >= ? ORDER BY summary_date DESC',
          [cutoff.split('T')[0]]
        );
      } catch (error) {
        console.error('[DB] SQLite daily summaries error:', error);
        return [];
      }
    } else {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('daily_summaries')
            .select('*')
            .gte('summary_date', cutoff.split('T')[0])
            .order('summary_date', { ascending: false });
          if (error) throw error;
          return data || [];
        } catch (error) {
          console.error('[DB] Supabase daily summaries error:', error);
        }
      }
      return [];
    }
  }

  async _updateLocalDailySummary(event) {
    if (!this.useLocalDB) return;
    
    try {
      const eventDate = new Date(event.timestamp).toISOString().split('T')[0];
      const hour = new Date(event.timestamp).getHours();
      const isNight = hour >= 22 || hour < 6;
      
      // Check if summary exists
      const existing = await this.db.getFirstAsync(
        'SELECT * FROM daily_summaries WHERE summary_date = ?',
        [eventDate]
      );
      
      if (existing) {
        await this.db.runAsync(
          `UPDATE daily_summaries SET
            total_events = total_events + 1,
            avg_decibel = (avg_decibel * total_events + ?) / (total_events + 1),
            peak_decibel = MAX(peak_decibel, ?),
            night_events = night_events + ?,
            day_events = day_events + ?,
            daily_legal_score = MAX(daily_legal_score, ?)
          WHERE summary_date = ?`,
          [
            event.decibel,
            event.decibel,
            isNight ? 1 : 0,
            isNight ? 0 : 1,
            event.legalScore || 0,
            eventDate
          ]
        );
      } else {
        await this.db.runAsync(
          `INSERT INTO daily_summaries (summary_date, total_events, avg_decibel, peak_decibel,
            night_events, day_events, daily_legal_score)
          VALUES (?, 1, ?, ?, ?, ?, ?)`,
          [
            eventDate,
            event.decibel,
            event.decibel,
            isNight ? 1 : 0,
            isNight ? 0 : 1,
            event.legalScore || 0
          ]
        );
      }
    } catch (error) {
      console.error('[DB] Local daily summary update error:', error);
    }
  }

  // ============================================================
  // LEGAL ANALYSIS QUERIES
  // ============================================================

  async getLegalSummary(days = 14) {
    await this._ensureReady();
    const cutoff = this._getCutoffDate(days);

    try {
      const totalEvents = await this.getEventsCount(days);
      const avgDecibel = await this.getAverageDecibel(days);
      const nightViolations = await this.getNightViolations(days);
      const highSeverity = await this.getHighSeverityEvents(days);
      
      // Calculate overall legal position
      let legalStrength = 'weak';
      let rentReductionEstimate = 0;
      
      if (nightViolations.length > 5 && highSeverity.length > 3) {
        legalStrength = 'very_strong';
        rentReductionEstimate = 25; // 25% Mietminderung
      } else if (nightViolations.length > 3 || highSeverity.length > 5) {
        legalStrength = 'strong';
        rentReductionEstimate = 15;
      } else if (totalEvents > 10) {
        legalStrength = 'moderate';
        rentReductionEstimate = 10;
      } else if (totalEvents > 3) {
        legalStrength = 'developing';
        rentReductionEstimate = 5;
      }
      
      return {
        period: `${days} days`,
        totalEvents,
        avgDecibel: Math.round(avgDecibel * 10) / 10,
        nightViolations: nightViolations.length,
        highSeverityEvents: highSeverity.length,
        legalStrength,
        rentReductionPercent: rentReductionEstimate,
        recommendation: this._getLegalRecommendation(legalStrength, nightViolations.length),
        dailySummaries: await this.getDailySummaries(days)
      };
    } catch (error) {
      console.error('[DB] Legal summary error:', error);
      return {
        period: `${days} days`,
        totalEvents: 0,
        avgDecibel: 0,
        nightViolations: 0,
        highSeverityEvents: 0,
        legalStrength: 'insufficient_data',
        rentReductionPercent: 0,
        recommendation: 'Continue monitoring to build evidence.',
        dailySummaries: []
      };
    }
  }

  // ============================================================
  // SUPABASE SYNC
  // ============================================================

  async syncToSupabase() {
    if (!supabase || this.isSyncing) return;
    this.isSyncing = true;

    try {
      await this._ensureReady();
      let unsyncedEvents = [];

      if (this.useLocalDB) {
        unsyncedEvents = await this.db.getAllAsync(
          'SELECT * FROM noise_events WHERE synced = 0 LIMIT 100'
        );
      } else {
        unsyncedEvents = this.memoryCache.filter(e => e.synced === 0);
      }

      if (unsyncedEvents.length === 0) {
        this.isSyncing = false;
        return;
      }

      const { error } = await supabase
        .from('noise_events')
        .insert(unsyncedEvents.map(event => ({
          timestamp: event.timestamp,
          decibel: event.decibel,
          duration: event.duration,
          freq_bass: event.freq_bass || event.freqBands?.bass || 0,
          freq_low_mid: event.freq_low_mid || event.freqBands?.lowMid || 0,
          freq_mid: event.freq_mid || event.freqBands?.mid || 0,
          freq_high_mid: event.freq_high_mid || event.freqBands?.highMid || 0,
          freq_high: event.freq_high || event.freqBands?.high || 0,
          classification: event.classification,
          detailed_type: event.detailed_type || event.detailedType,
          likely_source: event.likely_source || event.likelySource,
          legal_relevance: event.legal_relevance || event.legalRelevance || 'low',
          legal_score: event.legal_score || event.legalScore || 0,
          is_nighttime_violation: Boolean(event.is_nighttime_violation || event.isNighttimeViolation),
          time_context: event.time_context || event.timeContext,
          health_impact: event.health_impact || event.healthImpact || 'low',
          duration_impact: event.duration_impact || event.durationImpact || 'brief'
        })));

      if (error) throw error;

      // Mark as synced
      if (this.useLocalDB) {
        await this.db.runAsync('UPDATE noise_events SET synced = 1 WHERE synced = 0');
      } else {
        this.memoryCache.forEach(e => e.synced = 1);
      }

      console.log(`[DB] Synced ${unsyncedEvents.length} events to Supabase`);
    } catch (error) {
      console.error('[DB] Sync error:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  _trySync() {
    // Debounced sync - wait 10 seconds after last event
    if (this._syncTimeout) clearTimeout(this._syncTimeout);
    this._syncTimeout = setTimeout(() => this.syncToSupabase(), 10000);
  }

  // ============================================================
  // USER SETTINGS
  // ============================================================

  async getUserSettings() {
    if (!supabase) return this._getDefaultSettings();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return this._getDefaultSettings();
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data || this._getDefaultSettings();
    } catch (error) {
      console.error('[DB] Get settings error:', error);
      return this._getDefaultSettings();
    }
  }

  async saveUserSettings(settings) {
    if (!supabase) return false;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      console.log('[DB] Settings saved');
      return true;
    } catch (error) {
      console.error('[DB] Save settings error:', error);
      return false;
    }
  }

  // ============================================================
  // DELETE / CLEANUP
  // ============================================================

  async deleteAllEvents() {
    await this._ensureReady();
    
    if (this.useLocalDB) {
      try {
        await this.db.runAsync('DELETE FROM noise_events');
        await this.db.runAsync('DELETE FROM daily_summaries');
        console.log('[DB] All local data deleted');
      } catch (error) {
        console.error('[DB] Delete error:', error);
      }
    } else {
      this.memoryCache = [];
    }
    
    // Also delete from Supabase
    if (supabase) {
      try {
        await supabase.from('noise_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('daily_summaries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        console.log('[DB] Supabase data deleted');
      } catch (error) {
        console.error('[DB] Supabase delete error:', error);
      }
    }
  }

  // ============================================================
  // HELPER METHODS
  // ============================================================

  _computeLegalFields(event) {
    const hour = new Date(event.timestamp).getHours();
    const isNight = hour >= 22 || hour < 6;
    const isEvening = hour >= 19 || hour < 7;
    
    let legalScore = 0;
    
    // Decibel scoring
    if (event.decibel > 85) legalScore += 40;
    else if (event.decibel > 70) legalScore += 30;
    else if (event.decibel > 60) legalScore += 20;
    else if (event.decibel > 50) legalScore += 10;
    
    // Time scoring
    if (isNight) legalScore += 30;
    else if (isEvening) legalScore += 20;
    else legalScore += 10;
    
    // Duration scoring
    const duration = event.duration || 0;
    if (duration > 300) legalScore += 20;
    else if (duration > 60) legalScore += 15;
    else if (duration > 30) legalScore += 10;
    else legalScore += 5;
    
    return {
      legalScore: Math.min(100, legalScore),
      isNighttimeViolation: isNight,
      timeContext: isNight ? 'night_hours' : (isEvening ? 'evening_hours' : 'day_hours'),
      legalRelevance: legalScore > 70 ? 'very_high' : legalScore > 50 ? 'high' : legalScore > 30 ? 'medium' : 'low',
      healthImpact: event.decibel > 85 ? 'high' : event.decibel > 70 ? 'medium' : 'low',
      durationImpact: duration > 300 ? 'prolonged' : duration > 60 ? 'sustained' : 'brief'
    };
  }

  _getLegalRecommendation(strength, nightViolations) {
    switch (strength) {
      case 'very_strong':
        return `Starke Rechtsposition! ${nightViolations} Nachtruhestörungen dokumentiert. Mietminderung nach §536 BGB empfohlen. Kontaktieren Sie einen Anwalt.`;
      case 'strong':
        return `Gute Beweislage mit ${nightViolations} Nachtruhestörungen. Formelle Beschwerde beim Vermieter empfohlen.`;
      case 'moderate':
        return 'Mäßige Beweislage. Weiter dokumentieren für stärkere Position.';
      case 'developing':
        return 'Beweissammlung beginnt. Mindestens 14 Tage durchgehend dokumentieren.';
      default:
        return 'Monitoring starten um Beweise zu sammeln. §536 BGB erfordert nachweisbare Lärmbelästigung.';
    }
  }

  _getDefaultSettings() {
    return {
      noise_threshold: 55,
      auto_start_monitoring: false,
      background_monitoring: true,
      notify_on_event: true,
      notify_daily_summary: true,
      monthly_rent: null,
      apartment_address: null
    };
  }

  _getCutoffDate(days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return cutoff.toISOString();
  }

  /**
   * Get Supabase client for direct access
   */
  getSupabaseClient() {
    return supabase;
  }

  /**
   * Check if Supabase is connected
   */
  isSupabaseConnected() {
    return supabase !== null;
  }
}

export default new DatabaseService();