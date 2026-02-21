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
  console.log('🔗 Host:', DB_URL.replace(/:[^:@]+@/, ':***@'));
  
  const pool = new Pool({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  const client = await pool.connect();
  
  try {
    // Step 1: Debug - what database and role are we using?
    const dbInfo = await client.query("SELECT current_database(), current_user, current_schema()");
    console.log('📊 Database:', dbInfo.rows[0].current_database);
    console.log('👤 User:', dbInfo.rows[0].current_user);
    console.log('📂 Schema:', dbInfo.rows[0].current_schema);

    // Step 2: List ALL tables visible to us
    const allTables = await client.query(
      "SELECT table_schema, table_name FROM information_schema.tables WHERE table_type = 'BASE TABLE' AND table_schema NOT IN ('pg_catalog', 'information_schema') ORDER BY table_schema, table_name"
    );
    console.log('\n📋 All visible tables:');
    allTables.rows.forEach(r => console.log(`  ${r.table_schema}.${r.table_name}`));

    // Step 3: Try to find noise_events specifically
    const ne = await client.query(
      "SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = 'noise_events'"
    );
    if (ne.rows.length === 0) {
      console.log('\n⚠️  noise_events NOT found in information_schema!');
      
      // Try pg_tables as fallback
      const pg = await client.query(
        "SELECT schemaname, tablename FROM pg_tables WHERE tablename = 'noise_events'"
      );
      if (pg.rows.length > 0) {
        console.log('✅ But found in pg_tables:', pg.rows.map(r => `${r.schemaname}.${r.tablename}`).join(', '));
      } else {
        console.log('❌ Not in pg_tables either.');
        console.log('\n🔨 Creating noise_events table from scratch...');
        await client.query(`
          CREATE TABLE IF NOT EXISTS public.noise_events (
            id BIGSERIAL PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id),
            timestamp TEXT,
            decibel REAL,
            duration INTEGER,
            freq_bands TEXT,
            start_time TEXT,
            end_time TEXT,
            neighbor_score INTEGER DEFAULT 0,
            source_confirmed TEXT DEFAULT 'unconfirmed',
            noise_category TEXT,
            category_auto BOOLEAN DEFAULT true,
            avg_decibel REAL DEFAULT 0,
            peak_decibel REAL DEFAULT 0,
            scoring_factors TEXT,
            created_at TIMESTAMPTZ DEFAULT now()
          );
        `);
        console.log('✅ Table created with all columns!');
        await pool.end();
        return;
      }
    } else {
      console.log(`\n✅ noise_events found in schema: ${ne.rows[0].table_schema}`);
    }

    const targetSchema = ne.rows.length > 0 ? ne.rows[0].table_schema : 'public';
    
    // Step 4: Set search path and get existing columns
    await client.query(`SET search_path TO ${targetSchema}, public`);
    
    const { rows } = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = '${targetSchema}' AND table_name = 'noise_events' ORDER BY ordinal_position`
    );
    const existing = rows.map(r => r.column_name);
    console.log(`\n📋 Existing columns (${existing.length}):`, existing.join(', '));

    // Step 5: Add missing columns
    const migrations = [
      { col: 'start_time', sql: `ALTER TABLE ${targetSchema}.noise_events ADD COLUMN IF NOT EXISTS start_time TEXT` },
      { col: 'end_time', sql: `ALTER TABLE ${targetSchema}.noise_events ADD COLUMN IF NOT EXISTS end_time TEXT` },
      { col: 'neighbor_score', sql: `ALTER TABLE ${targetSchema}.noise_events ADD COLUMN IF NOT EXISTS neighbor_score INTEGER DEFAULT 0` },
      { col: 'source_confirmed', sql: `ALTER TABLE ${targetSchema}.noise_events ADD COLUMN IF NOT EXISTS source_confirmed TEXT DEFAULT 'unconfirmed'` },
      { col: 'noise_category', sql: `ALTER TABLE ${targetSchema}.noise_events ADD COLUMN IF NOT EXISTS noise_category TEXT` },
      { col: 'category_auto', sql: `ALTER TABLE ${targetSchema}.noise_events ADD COLUMN IF NOT EXISTS category_auto BOOLEAN DEFAULT true` },
      { col: 'avg_decibel', sql: `ALTER TABLE ${targetSchema}.noise_events ADD COLUMN IF NOT EXISTS avg_decibel REAL DEFAULT 0` },
      { col: 'peak_decibel', sql: `ALTER TABLE ${targetSchema}.noise_events ADD COLUMN IF NOT EXISTS peak_decibel REAL DEFAULT 0` },
      { col: 'scoring_factors', sql: `ALTER TABLE ${targetSchema}.noise_events ADD COLUMN IF NOT EXISTS scoring_factors TEXT` },
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

    // Step 6: Verify
    const { rows: after } = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = '${targetSchema}' AND table_name = 'noise_events' ORDER BY ordinal_position`
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
