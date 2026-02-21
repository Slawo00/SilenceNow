/**
 * Supabase Migration Script
 * Run from Replit Shell: node scripts/migrate_supabase.js
 * 
 * Adds missing V4 + Scoring V2 columns to noise_events
 */
const { Pool } = require('pg');

const DB_URL = process.env.DATABASE_URL || 
  'postgresql://postgres:Ilm!2022!e6g8%23O%23g2@db.aawfwtwufqenrdzqfmgw.supabase.co:5432/postgres';

async function migrate() {
  console.log('🔄 Connecting to Supabase...');
  
  const pool = new Pool({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  const client = await pool.connect();
  
  try {
    // Ensure search_path
    await client.query("SET search_path TO public");

    // Check existing columns
    const { rows } = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'noise_events' ORDER BY ordinal_position"
    );
    const existing = rows.map(r => r.column_name);
    console.log('📋 Existing columns:', existing.length);

    // Migrations
    const migrations = [
      { col: 'start_time', sql: "ALTER TABLE public.noise_events ADD COLUMN IF NOT EXISTS start_time TEXT" },
      { col: 'end_time', sql: "ALTER TABLE public.noise_events ADD COLUMN IF NOT EXISTS end_time TEXT" },
      { col: 'neighbor_score', sql: "ALTER TABLE public.noise_events ADD COLUMN IF NOT EXISTS neighbor_score INTEGER DEFAULT 0" },
      { col: 'source_confirmed', sql: "ALTER TABLE public.noise_events ADD COLUMN IF NOT EXISTS source_confirmed TEXT DEFAULT 'unconfirmed'" },
      { col: 'noise_category', sql: "ALTER TABLE public.noise_events ADD COLUMN IF NOT EXISTS noise_category TEXT" },
      { col: 'category_auto', sql: "ALTER TABLE public.noise_events ADD COLUMN IF NOT EXISTS category_auto BOOLEAN DEFAULT true" },
      { col: 'avg_decibel', sql: "ALTER TABLE public.noise_events ADD COLUMN IF NOT EXISTS avg_decibel REAL DEFAULT 0" },
      { col: 'peak_decibel', sql: "ALTER TABLE public.noise_events ADD COLUMN IF NOT EXISTS peak_decibel REAL DEFAULT 0" },
      { col: 'scoring_factors', sql: "ALTER TABLE public.noise_events ADD COLUMN IF NOT EXISTS scoring_factors TEXT" },
    ];

    let added = 0;
    for (const m of migrations) {
      if (existing.includes(m.col)) {
        console.log(`  ⏭️  ${m.col} — already exists`);
        continue;
      }
      try {
        await client.query(m.sql);
        console.log(`  ✅ ${m.col} — added`);
        added++;
      } catch(e) {
        console.log(`  ❌ ${m.col} — ${e.message}`);
      }
    }

    // Verify
    const { rows: after } = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'noise_events' ORDER BY ordinal_position"
    );
    console.log(`\n✅ Done! ${added} columns added. Total: ${after.length} columns`);
    console.log('Columns:', after.map(r => r.column_name).join(', '));
    
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
