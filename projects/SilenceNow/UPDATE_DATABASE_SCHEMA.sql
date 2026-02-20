-- 🔥 DATABASE SCHEMA UPDATE - NOISE SOURCE DETECTION
-- Erweitert die noise_events Tabelle für erweiterte Analysedaten

-- Migration: Neue Spalten hinzufügen für Source Detection
ALTER TABLE noise_events ADD COLUMN IF NOT EXISTS source_detection TEXT;
ALTER TABLE noise_events ADD COLUMN IF NOT EXISTS octave_bands TEXT;  
ALTER TABLE noise_events ADD COLUMN IF NOT EXISTS dba_dbc_data TEXT;
ALTER TABLE noise_events ADD COLUMN IF NOT EXISTS motion_data TEXT;
ALTER TABLE noise_events ADD COLUMN IF NOT EXISTS confidence_score INTEGER;
ALTER TABLE noise_events ADD COLUMN IF NOT EXISTS legal_relevance TEXT DEFAULT 'medium';

-- Index für bessere Performance bei Abfragen
CREATE INDEX IF NOT EXISTS idx_noise_events_confidence ON noise_events(confidence_score);
CREATE INDEX IF NOT EXISTS idx_noise_events_legal_relevance ON noise_events(legal_relevance);
CREATE INDEX IF NOT EXISTS idx_noise_events_source ON noise_events(source_detection);

-- Optional: View für erweiterte Event-Analyse
CREATE VIEW IF NOT EXISTS enhanced_noise_events AS
SELECT 
  id,
  timestamp,
  decibel,
  duration,
  classification,
  confidence_score,
  legal_relevance,
  -- JSON-Extract für Source Detection (falls als JSON gespeichert)
  json_extract(source_detection, '$.source') as detected_source,
  json_extract(source_detection, '$.confidence') as source_confidence,
  -- JSON-Extract für dBA/dBC Daten
  json_extract(dba_dbc_data, '$.dBA') as dba_value,
  json_extract(dba_dbc_data, '$.dBC') as dbc_value, 
  json_extract(dba_dbc_data, '$.difference') as db_difference,
  -- JSON-Extract für Motion Data
  json_extract(motion_data, '$.correlation') as motion_correlation,
  json_extract(motion_data, '$.confidence') as motion_confidence
FROM noise_events
WHERE source_detection IS NOT NULL;

-- Statistik-View für Reporting
CREATE VIEW IF NOT EXISTS noise_source_statistics AS
SELECT 
  DATE(timestamp) as event_date,
  json_extract(source_detection, '$.source') as source_type,
  COUNT(*) as event_count,
  AVG(decibel) as avg_decibel,
  MAX(decibel) as max_decibel,
  AVG(confidence_score) as avg_confidence,
  SUM(CASE WHEN legal_relevance IN ('high', 'very_high') THEN 1 ELSE 0 END) as high_relevance_events
FROM noise_events 
WHERE source_detection IS NOT NULL
GROUP BY DATE(timestamp), json_extract(source_detection, '$.source')
ORDER BY event_date DESC;

-- Test-Daten für Development (Optional - nur für Testing)
/*
INSERT INTO noise_events (
  timestamp, decibel, duration, classification, 
  source_detection, octave_bands, dba_dbc_data, motion_data,
  confidence_score, legal_relevance
) VALUES (
  datetime('now'), 
  73, 
  120,
  'Loud - Neighbor Music (Bass-dominant)',
  '{"source":"NEIGHBOR","confidence":0.85,"reason":"Bass-dominant (70%), high-freq damped (5%) - typical wall/ceiling damping"}',
  '{"bass_63":{"energy":0.8},"mid_1k":{"energy":0.15},"high_8k":{"energy":0.05}}',
  '{"dBA":71.2,"dBC":75.8,"difference":4.6}',
  '{"correlation":"AUDIO_ONLY","confidence":0.8,"reason":"No phone movement detected"}',
  85,
  'high'
);
*/

-- Verify Schema Update
SELECT sql FROM sqlite_master WHERE type='table' AND name='noise_events';