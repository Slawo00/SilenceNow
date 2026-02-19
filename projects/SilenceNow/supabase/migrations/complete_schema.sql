-- ============================================================
-- SilenceNow - Vollständiges Supabase Schema
-- Stand: 2026-02-19
-- 
-- Führe dieses SQL im Supabase SQL Editor aus:
-- https://supabase.com/dashboard/project/aawfwtwufqenrdzqfmgw/sql
-- ============================================================

-- ============================================================
-- 1. NOISE_EVENTS TABELLE ERWEITERN
-- ============================================================

-- Bestehende Spalten hinzufügen (IF NOT EXISTS via DO block)
DO $$ 
BEGIN
  -- Detaillierte Klassifikation
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='noise_events' AND column_name='detailed_type') THEN
    ALTER TABLE noise_events ADD COLUMN detailed_type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='noise_events' AND column_name='likely_source') THEN
    ALTER TABLE noise_events ADD COLUMN likely_source TEXT;
  END IF;

  -- Rechtliche Bewertung
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='noise_events' AND column_name='legal_relevance') THEN
    ALTER TABLE noise_events ADD COLUMN legal_relevance TEXT DEFAULT 'low';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='noise_events' AND column_name='legal_score') THEN
    ALTER TABLE noise_events ADD COLUMN legal_score INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='noise_events' AND column_name='is_nighttime_violation') THEN
    ALTER TABLE noise_events ADD COLUMN is_nighttime_violation BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='noise_events' AND column_name='time_context') THEN
    ALTER TABLE noise_events ADD COLUMN time_context TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='noise_events' AND column_name='health_impact') THEN
    ALTER TABLE noise_events ADD COLUMN health_impact TEXT DEFAULT 'low';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='noise_events' AND column_name='duration_impact') THEN
    ALTER TABLE noise_events ADD COLUMN duration_impact TEXT DEFAULT 'brief';
  END IF;

  -- KI-Klassifikation
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='noise_events' AND column_name='ai_type') THEN
    ALTER TABLE noise_events ADD COLUMN ai_type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='noise_events' AND column_name='ai_confidence') THEN
    ALTER TABLE noise_events ADD COLUMN ai_confidence INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='noise_events' AND column_name='ai_emoji') THEN
    ALTER TABLE noise_events ADD COLUMN ai_emoji TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='noise_events' AND column_name='ai_description') THEN
    ALTER TABLE noise_events ADD COLUMN ai_description TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='noise_events' AND column_name='ai_legal_category') THEN
    ALTER TABLE noise_events ADD COLUMN ai_legal_category TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='noise_events' AND column_name='ai_severity') THEN
    ALTER TABLE noise_events ADD COLUMN ai_severity TEXT;
  END IF;

  -- Sync-Status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='noise_events' AND column_name='synced') THEN
    ALTER TABLE noise_events ADD COLUMN synced BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- ============================================================
-- 2. EVENT_WITNESSES - Zeugen für Events
-- ============================================================

CREATE TABLE IF NOT EXISTS event_witnesses (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES noise_events(id) ON DELETE CASCADE,
  witness_name TEXT NOT NULL,
  witness_contact TEXT,
  witness_relationship TEXT,
  statement TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index für schnelle Abfragen
CREATE INDEX IF NOT EXISTS idx_witnesses_event_id ON event_witnesses(event_id);

-- ============================================================
-- 3. EVENT_NOTES - Notizen zu Events
-- ============================================================

CREATE TABLE IF NOT EXISTS event_notes (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES noise_events(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'observation', 'impact', 'action')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_event_id ON event_notes(event_id);

-- ============================================================
-- 4. MONITORING_SESSIONS - Aufnahme-Sessions
-- ============================================================

CREATE TABLE IF NOT EXISTS monitoring_sessions (
  id BIGSERIAL PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  total_measurements INTEGER DEFAULT 0,
  event_count INTEGER DEFAULT 0,
  avg_decibel REAL DEFAULT 0,
  peak_decibel REAL DEFAULT 0,
  background_noise REAL,
  legal_impact_score INTEGER DEFAULT 0,
  recommendations JSONB DEFAULT '[]'::jsonb,
  synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_started ON monitoring_sessions(started_at DESC);

-- ============================================================
-- 5. DAILY_SUMMARIES - Tägliche Zusammenfassungen (14-Tage-Protokoll)
-- ============================================================

CREATE TABLE IF NOT EXISTS daily_summaries (
  id BIGSERIAL PRIMARY KEY,
  summary_date DATE NOT NULL UNIQUE,
  total_events INTEGER DEFAULT 0,
  total_monitoring_minutes INTEGER DEFAULT 0,
  avg_decibel REAL DEFAULT 0,
  peak_decibel REAL DEFAULT 0,
  night_events INTEGER DEFAULT 0,
  night_avg_decibel REAL DEFAULT 0,
  day_events INTEGER DEFAULT 0,
  day_avg_decibel REAL DEFAULT 0,
  daily_legal_score INTEGER DEFAULT 0,
  hourly_breakdown JSONB DEFAULT '{}'::jsonb,
  synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_summaries_date ON daily_summaries(summary_date DESC);

-- ============================================================
-- 6. USER_SETTINGS - Benutzer-Einstellungen
-- ============================================================

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  noise_threshold INTEGER DEFAULT 55,
  auto_start_monitoring BOOLEAN DEFAULT FALSE,
  background_monitoring BOOLEAN DEFAULT TRUE,
  notify_on_event BOOLEAN DEFAULT TRUE,
  notify_daily_summary BOOLEAN DEFAULT TRUE,
  monthly_rent REAL,
  apartment_address TEXT,
  landlord_name TEXT,
  landlord_address TEXT,
  push_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. LETTER_TEMPLATES_LOG - Generierte Musterbriefe (Tracking)
-- ============================================================

CREATE TABLE IF NOT EXISTS letter_logs (
  id BIGSERIAL PRIMARY KEY,
  template_type TEXT NOT NULL CHECK (template_type IN ('maengelanzeige', 'mietminderung', 'ordnungsamt', 'abmahnung_nachbar')),
  events_count INTEGER DEFAULT 0,
  night_violations INTEGER DEFAULT 0,
  legal_score INTEGER DEFAULT 0,
  rent_reduction_percent REAL DEFAULT 0,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. PERFORMANCE INDEXES für noise_events
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_events_timestamp ON noise_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_events_legal_score ON noise_events(legal_score DESC);
CREATE INDEX IF NOT EXISTS idx_events_nighttime ON noise_events(is_nighttime_violation) WHERE is_nighttime_violation = TRUE;
CREATE INDEX IF NOT EXISTS idx_events_ai_type ON noise_events(ai_type);
CREATE INDEX IF NOT EXISTS idx_events_synced ON noise_events(synced) WHERE synced = FALSE;

-- ============================================================
-- 9. RLS (Row Level Security) - DSGVO
-- ============================================================

-- Deaktiviere RLS erstmal für einfaches Testing
-- Kann später mit Auth aktiviert werden
ALTER TABLE noise_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_witnesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE letter_logs ENABLE ROW LEVEL SECURITY;

-- Erlaube anonymen Zugriff (für MVP ohne Auth)
-- DROP + CREATE um Konflikte zu vermeiden
DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow all for anon" ON noise_events;
  CREATE POLICY "Allow all for anon" ON noise_events FOR ALL USING (true) WITH CHECK (true);
  
  DROP POLICY IF EXISTS "Allow all for anon" ON event_witnesses;
  CREATE POLICY "Allow all for anon" ON event_witnesses FOR ALL USING (true) WITH CHECK (true);
  
  DROP POLICY IF EXISTS "Allow all for anon" ON event_notes;
  CREATE POLICY "Allow all for anon" ON event_notes FOR ALL USING (true) WITH CHECK (true);
  
  DROP POLICY IF EXISTS "Allow all for anon" ON monitoring_sessions;
  CREATE POLICY "Allow all for anon" ON monitoring_sessions FOR ALL USING (true) WITH CHECK (true);
  
  DROP POLICY IF EXISTS "Allow all for anon" ON daily_summaries;
  CREATE POLICY "Allow all for anon" ON daily_summaries FOR ALL USING (true) WITH CHECK (true);
  
  DROP POLICY IF EXISTS "Allow all for anon" ON user_settings;
  CREATE POLICY "Allow all for anon" ON user_settings FOR ALL USING (true) WITH CHECK (true);
  
  DROP POLICY IF EXISTS "Allow all for anon" ON letter_logs;
  CREATE POLICY "Allow all for anon" ON letter_logs FOR ALL USING (true) WITH CHECK (true);
END $$;

-- ============================================================
-- FERTIG! 🎉
-- ============================================================
-- Tabellen erstellt:
-- ✅ noise_events (erweitert mit AI + Legal Spalten)
-- ✅ event_witnesses (Zeugen)
-- ✅ event_notes (Notizen)
-- ✅ monitoring_sessions (Aufnahme-Sessions)
-- ✅ daily_summaries (14-Tage-Protokoll)
-- ✅ user_settings (Einstellungen)
-- ✅ letter_logs (Musterbrief-Tracking)
-- ✅ Performance Indexes
-- ✅ RLS Policies (anon access für MVP)
