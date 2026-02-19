-- SilenceNow Business Intelligence Schema V2.0
-- WELTKLASSE FEATURES: Legal scoring, rent reduction calc, user isolation

-- Extend noise_events table with business intelligence
ALTER TABLE noise_events ADD COLUMN IF NOT EXISTS legal_score INTEGER DEFAULT 0;
ALTER TABLE noise_events ADD COLUMN IF NOT EXISTS rent_reduction_potential REAL DEFAULT 0;
ALTER TABLE noise_events ADD COLUMN IF NOT EXISTS is_nighttime_violation BOOLEAN DEFAULT FALSE;
ALTER TABLE noise_events ADD COLUMN IF NOT EXISTS violation_severity TEXT DEFAULT 'minor';
ALTER TABLE noise_events ADD COLUMN IF NOT EXISTS monthly_impact_estimate INTEGER DEFAULT 0;
ALTER TABLE noise_events ADD COLUMN IF NOT EXISTS legal_evidence_strength TEXT DEFAULT 'weak';

-- Add user management for multi-tenant architecture
ALTER TABLE noise_events ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE noise_events ADD COLUMN IF NOT EXISTS building_id TEXT;
ALTER TABLE noise_events ADD COLUMN IF NOT EXISTS apartment_identifier TEXT;

-- Performance indexes for business queries
CREATE INDEX IF NOT EXISTS idx_noise_events_legal_score ON noise_events(legal_score DESC);
CREATE INDEX IF NOT EXISTS idx_noise_events_nighttime ON noise_events(is_nighttime_violation) WHERE is_nighttime_violation = true;
CREATE INDEX IF NOT EXISTS idx_noise_events_severity ON noise_events(violation_severity);
CREATE INDEX IF NOT EXISTS idx_noise_events_user_time ON noise_events(user_id, created_at DESC);

-- Create user profiles table for business data
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    apartment_address TEXT,
    building_id TEXT,
    monthly_rent REAL DEFAULT 800,
    
    -- Business preferences
    notification_threshold INTEGER DEFAULT 60,
    auto_legal_analysis BOOLEAN DEFAULT TRUE,
    preferred_language TEXT DEFAULT 'de',
    
    -- Subscription status (for freemium model)
    subscription_tier TEXT DEFAULT 'free', -- 'free', 'basic', 'premium'
    subscription_expires_at TIMESTAMP,
    reports_generated INTEGER DEFAULT 0,
    
    -- Legal context
    has_legal_insurance BOOLEAN DEFAULT FALSE,
    lawyer_contact TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buildings table for multi-tenant noise analysis
CREATE TABLE IF NOT EXISTS buildings (
    id TEXT PRIMARY KEY,
    address TEXT NOT NULL,
    postal_code TEXT,
    city TEXT,
    
    -- Building characteristics affecting noise
    building_type TEXT, -- 'apartment', 'house', 'mixed_use'
    construction_year INTEGER,
    soundproofing_quality TEXT DEFAULT 'unknown', -- 'poor', 'average', 'good', 'excellent'
    
    -- Aggregate noise statistics
    total_complaints INTEGER DEFAULT 0,
    average_noise_score REAL DEFAULT 0,
    most_problematic_hours JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Legal reports table for business monetization
CREATE TABLE IF NOT EXISTS legal_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Report metadata
    report_type TEXT NOT NULL, -- 'basic', 'detailed', 'legal_grade'
    timeframe TEXT NOT NULL, -- '7d', '30d', '90d'
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Business data
    total_events INTEGER NOT NULL,
    legal_strength_score INTEGER NOT NULL,
    recommended_rent_reduction REAL NOT NULL,
    estimated_monthly_savings REAL NOT NULL,
    
    -- Report content (JSON for flexibility)
    report_data JSONB NOT NULL,
    
    -- Business tracking
    is_paid BOOLEAN DEFAULT FALSE,
    price_paid REAL DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (DSGVO compliance)
ALTER TABLE noise_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can only access their own noise events"
    ON noise_events FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own profile"
    ON user_profiles FOR ALL
    USING (auth.uid() = id);

CREATE POLICY "Users can only access their own reports"
    ON legal_reports FOR ALL
    USING (auth.uid() = user_id);

-- Business Intelligence Functions

-- Calculate user's legal position
CREATE OR REPLACE FUNCTION calculate_user_legal_position(user_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    total_events INTEGER;
    avg_legal_score REAL;
    nighttime_violations INTEGER;
    high_severity_events INTEGER;
    max_rent_reduction REAL;
BEGIN
    SELECT 
        COUNT(*),
        AVG(legal_score),
        COUNT(*) FILTER (WHERE is_nighttime_violation = true),
        COUNT(*) FILTER (WHERE legal_score > 60),
        MAX(rent_reduction_potential)
    INTO 
        total_events,
        avg_legal_score,
        nighttime_violations,
        high_severity_events,
        max_rent_reduction
    FROM noise_events 
    WHERE user_id = user_uuid 
    AND created_at > NOW() - INTERVAL '1 day' * days_back;
    
    result := jsonb_build_object(
        'total_events', COALESCE(total_events, 0),
        'average_legal_score', ROUND(COALESCE(avg_legal_score, 0)::numeric, 1),
        'nighttime_violations', COALESCE(nighttime_violations, 0),
        'high_severity_events', COALESCE(high_severity_events, 0),
        'max_rent_reduction', ROUND(COALESCE(max_rent_reduction, 0)::numeric, 2),
        'legal_strength', 
            CASE 
                WHEN COALESCE(avg_legal_score, 0) > 70 THEN 'very_strong'
                WHEN COALESCE(avg_legal_score, 0) > 50 THEN 'strong'
                WHEN COALESCE(avg_legal_score, 0) > 30 THEN 'moderate'
                ELSE 'weak'
            END,
        'recommendation',
            CASE 
                WHEN COALESCE(avg_legal_score, 0) > 70 AND COALESCE(high_severity_events, 0) > 3 THEN 'immediate_legal_action'
                WHEN COALESCE(avg_legal_score, 0) > 50 AND COALESCE(total_events, 0) > 10 THEN 'formal_complaint'
                WHEN COALESCE(total_events, 0) > 5 THEN 'continue_monitoring'
                ELSE 'start_monitoring'
            END
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate building noise statistics
CREATE OR REPLACE FUNCTION get_building_noise_stats(building_identifier TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_complaints', COUNT(*),
        'average_decibel', ROUND(AVG(decibel)::numeric, 1),
        'peak_hours', (
            SELECT jsonb_agg(hour)
            FROM (
                SELECT EXTRACT(hour FROM timestamp::timestamp) as hour, COUNT(*) as count
                FROM noise_events 
                WHERE building_id = building_identifier
                GROUP BY hour
                ORDER BY count DESC
                LIMIT 3
            ) peak_hours
        ),
        'most_problematic_apartments', (
            SELECT jsonb_agg(jsonb_build_object('apartment', apartment_identifier, 'complaints', complaint_count))
            FROM (
                SELECT apartment_identifier, COUNT(*) as complaint_count
                FROM noise_events 
                WHERE building_id = building_identifier
                AND apartment_identifier IS NOT NULL
                GROUP BY apartment_identifier
                ORDER BY complaint_count DESC
                LIMIT 5
            ) apartments
        )
    ) INTO result
    FROM noise_events 
    WHERE building_id = building_identifier;
    
    RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Freemium business logic: Check if user can generate report
CREATE OR REPLACE FUNCTION can_user_generate_report(user_uuid UUID, report_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_tier TEXT;
    reports_this_month INTEGER;
BEGIN
    SELECT subscription_tier INTO user_tier
    FROM user_profiles 
    WHERE id = user_uuid;
    
    -- Count reports generated this month
    SELECT COUNT(*) INTO reports_this_month
    FROM legal_reports 
    WHERE user_id = user_uuid 
    AND generated_at > date_trunc('month', CURRENT_DATE);
    
    -- Business rules
    CASE 
        WHEN user_tier = 'premium' THEN RETURN TRUE;
        WHEN user_tier = 'basic' AND reports_this_month < 5 THEN RETURN TRUE;
        WHEN user_tier = 'free' AND reports_this_month < 1 AND report_type = 'basic' THEN RETURN TRUE;
        ELSE RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update building stats when new events are inserted
CREATE OR REPLACE FUNCTION update_building_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO buildings (id, address, total_complaints, average_noise_score)
    VALUES (
        NEW.building_id, 
        'Address for ' || NEW.building_id,
        1, 
        NEW.legal_score
    )
    ON CONFLICT (id) DO UPDATE SET
        total_complaints = buildings.total_complaints + 1,
        average_noise_score = (buildings.average_noise_score * buildings.total_complaints + NEW.legal_score) / (buildings.total_complaints + 1);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic building stats updates
DROP TRIGGER IF EXISTS trigger_update_building_stats ON noise_events;
CREATE TRIGGER trigger_update_building_stats
    AFTER INSERT ON noise_events
    FOR EACH ROW
    WHEN (NEW.building_id IS NOT NULL)
    EXECUTE FUNCTION update_building_stats();

-- Comment documentation for business understanding
COMMENT ON TABLE noise_events IS 'Core business table: All noise measurements with legal scoring';
COMMENT ON TABLE user_profiles IS 'User management with subscription tiers for freemium model';
COMMENT ON TABLE legal_reports IS 'Monetization table: Generated reports for users';
COMMENT ON TABLE buildings IS 'Multi-tenant building statistics for B2B features';

COMMENT ON FUNCTION calculate_user_legal_position IS 'Core business logic: Calculate users legal position for UI';
COMMENT ON FUNCTION get_building_noise_stats IS 'B2B feature: Building-wide noise statistics';
COMMENT ON FUNCTION can_user_generate_report IS 'Freemium business logic: Report generation limits';

-- Create initial admin user profile (for testing)
INSERT INTO auth.users (id, email) VALUES 
('00000000-0000-0000-0000-000000000001', 'test@silencenow.app')
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_profiles (id, email, apartment_address, monthly_rent, subscription_tier) VALUES
('00000000-0000-0000-0000-000000000001', 'test@silencenow.app', 'Teststraße 123, 12345 Berlin', 850.0, 'premium')
ON CONFLICT (id) DO NOTHING;