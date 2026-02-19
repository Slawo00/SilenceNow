-- SilenceNow Base Schema V1.0
-- Core table for noise events - Privacy-First Design
-- DSGVO compliant: Only numerical data, no audio stored

-- Core noise events table
CREATE TABLE IF NOT EXISTS noise_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Core measurement data (numerical only - privacy first)
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decibel REAL NOT NULL CHECK (decibel >= 0 AND decibel <= 200),
    duration INTEGER DEFAULT 0, -- seconds
    
    -- Frequency bands (mathematical estimation, no audio content)
    freq_bass REAL DEFAULT 0,
    freq_low_mid REAL DEFAULT 0,
    freq_mid REAL DEFAULT 0,
    freq_high_mid REAL DEFAULT 0,
    freq_high REAL DEFAULT 0,
    
    -- Classification
    classification TEXT DEFAULT 'Loud',
    detailed_type TEXT, -- 'bass_heavy', 'vocal_range', 'high_frequency'
    likely_source TEXT, -- 'music_system', 'human_activity', 'mechanical'
    
    -- Legal relevance (§536 BGB)
    legal_relevance TEXT DEFAULT 'low', -- 'low', 'medium', 'high', 'very_high'
    legal_score INTEGER DEFAULT 0 CHECK (legal_score >= 0 AND legal_score <= 100),
    is_nighttime_violation BOOLEAN DEFAULT FALSE,
    time_context TEXT, -- 'night_hours', 'day_hours', 'evening_hours'
    health_impact TEXT DEFAULT 'low', -- 'low', 'medium', 'high'
    duration_impact TEXT DEFAULT 'brief', -- 'brief', 'sustained', 'prolonged'
    
    -- Location context
    building_id TEXT,
    apartment_identifier TEXT,
    
    -- Sync status
    synced BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monitoring sessions table
CREATE TABLE IF NOT EXISTS monitoring_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    
    -- Session statistics
    total_measurements INTEGER DEFAULT 0,
    event_count INTEGER DEFAULT 0,
    avg_decibel REAL DEFAULT 0,
    peak_decibel REAL DEFAULT 0,
    background_noise REAL,
    
    -- Legal analysis
    legal_impact_score INTEGER DEFAULT 0,
    recommendations JSONB DEFAULT '[]'::jsonb,
    
    -- Session metadata
    device_info JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings table (privacy preferences)
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Monitoring preferences
    noise_threshold INTEGER DEFAULT 55,
    auto_start_monitoring BOOLEAN DEFAULT FALSE,
    background_monitoring BOOLEAN DEFAULT TRUE,
    
    -- Apartment info for legal reports
    apartment_address TEXT,
    monthly_rent REAL,
    landlord_name TEXT,
    landlord_address TEXT,
    
    -- Notification preferences
    notify_on_event BOOLEAN DEFAULT TRUE,
    notify_daily_summary BOOLEAN DEFAULT TRUE,
    
    -- Legal preferences
    has_legal_insurance BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily summaries for 14-day protocol
CREATE TABLE IF NOT EXISTS daily_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    summary_date DATE NOT NULL,
    
    -- Daily statistics
    total_events INTEGER DEFAULT 0,
    total_monitoring_minutes INTEGER DEFAULT 0,
    avg_decibel REAL DEFAULT 0,
    peak_decibel REAL DEFAULT 0,
    
    -- Night violations (22:00 - 06:00)
    night_events INTEGER DEFAULT 0,
    night_avg_decibel REAL DEFAULT 0,
    
    -- Day violations (06:00 - 22:00)
    day_events INTEGER DEFAULT 0,
    day_avg_decibel REAL DEFAULT 0,
    
    -- Legal daily score
    daily_legal_score INTEGER DEFAULT 0,
    
    -- Hourly breakdown (JSON: {hour: {events, avgDb, peakDb}})
    hourly_breakdown JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, summary_date)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_noise_events_user_time ON noise_events(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_noise_events_legal ON noise_events(legal_score DESC) WHERE legal_score > 0;
CREATE INDEX IF NOT EXISTS idx_noise_events_nighttime ON noise_events(is_nighttime_violation) WHERE is_nighttime_violation = TRUE;
CREATE INDEX IF NOT EXISTS idx_noise_events_timestamp ON noise_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_monitoring_sessions_user ON monitoring_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_date ON daily_summaries(user_id, summary_date DESC);

-- Row Level Security (DSGVO compliance - users only see own data)
ALTER TABLE noise_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "users_own_events" ON noise_events
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_own_sessions" ON monitoring_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_own_settings" ON user_settings
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "users_own_summaries" ON daily_summaries
    FOR ALL USING (auth.uid() = user_id);

-- Function: Auto-update daily summary after event insert
CREATE OR REPLACE FUNCTION update_daily_summary()
RETURNS TRIGGER AS $$
DECLARE
    event_date DATE;
    event_hour INTEGER;
    is_night BOOLEAN;
BEGIN
    event_date := DATE(NEW.timestamp AT TIME ZONE 'Europe/Berlin');
    event_hour := EXTRACT(HOUR FROM NEW.timestamp AT TIME ZONE 'Europe/Berlin');
    is_night := (event_hour >= 22 OR event_hour < 6);
    
    INSERT INTO daily_summaries (user_id, summary_date, total_events, avg_decibel, peak_decibel,
        night_events, night_avg_decibel, day_events, day_avg_decibel, daily_legal_score)
    VALUES (
        NEW.user_id, event_date, 1, NEW.decibel, NEW.decibel,
        CASE WHEN is_night THEN 1 ELSE 0 END,
        CASE WHEN is_night THEN NEW.decibel ELSE 0 END,
        CASE WHEN NOT is_night THEN 1 ELSE 0 END,
        CASE WHEN NOT is_night THEN NEW.decibel ELSE 0 END,
        NEW.legal_score
    )
    ON CONFLICT (user_id, summary_date) DO UPDATE SET
        total_events = daily_summaries.total_events + 1,
        avg_decibel = (daily_summaries.avg_decibel * daily_summaries.total_events + NEW.decibel) / (daily_summaries.total_events + 1),
        peak_decibel = GREATEST(daily_summaries.peak_decibel, NEW.decibel),
        night_events = daily_summaries.night_events + CASE WHEN is_night THEN 1 ELSE 0 END,
        night_avg_decibel = CASE 
            WHEN is_night AND daily_summaries.night_events > 0 
            THEN (daily_summaries.night_avg_decibel * daily_summaries.night_events + NEW.decibel) / (daily_summaries.night_events + 1)
            WHEN is_night THEN NEW.decibel
            ELSE daily_summaries.night_avg_decibel END,
        day_events = daily_summaries.day_events + CASE WHEN NOT is_night THEN 1 ELSE 0 END,
        day_avg_decibel = CASE 
            WHEN NOT is_night AND daily_summaries.day_events > 0 
            THEN (daily_summaries.day_avg_decibel * daily_summaries.day_events + NEW.decibel) / (daily_summaries.day_events + 1)
            WHEN NOT is_night THEN NEW.decibel
            ELSE daily_summaries.day_avg_decibel END,
        daily_legal_score = GREATEST(daily_summaries.daily_legal_score, NEW.legal_score);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto daily summary
CREATE TRIGGER trigger_update_daily_summary
    AFTER INSERT ON noise_events
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_summary();

-- Function: Get 14-day protocol for legal reports
CREATE OR REPLACE FUNCTION get_14_day_protocol(target_user_id UUID)
RETURNS JSONB AS $$
BEGIN
    RETURN (
        SELECT jsonb_agg(
            jsonb_build_object(
                'date', summary_date,
                'total_events', total_events,
                'avg_decibel', ROUND(avg_decibel::numeric, 1),
                'peak_decibel', ROUND(peak_decibel::numeric, 1),
                'night_events', night_events,
                'night_avg_db', ROUND(night_avg_decibel::numeric, 1),
                'day_events', day_events,
                'day_avg_db', ROUND(day_avg_decibel::numeric, 1),
                'legal_score', daily_legal_score
            ) ORDER BY summary_date DESC
        )
        FROM daily_summaries
        WHERE user_id = target_user_id
        AND summary_date >= CURRENT_DATE - INTERVAL '14 days'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE noise_events IS 'Core: Privacy-first noise measurements (no audio stored)';
COMMENT ON TABLE monitoring_sessions IS 'Recording sessions with aggregate statistics';
COMMENT ON TABLE user_settings IS 'User preferences and apartment info for legal reports';
COMMENT ON TABLE daily_summaries IS '14-day protocol data for §536 BGB legal evidence';