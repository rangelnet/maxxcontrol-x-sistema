const pool = require('./config/database');
async function runPendingMigrations() {
  const tables = [
    { name: 'iptv_providers', sql: `CREATE TABLE IF NOT EXISTS iptv_providers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), slot_index INTEGER UNIQUE NOT NULL, name TEXT, url TEXT, username TEXT, password TEXT, created_at TIMESTAMP DEFAULT NOW())` },
    { name: 'iptv_curation', sql: `CREATE TABLE IF NOT EXISTS iptv_curation (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), type TEXT, title TEXT, external_id TEXT, poster_path TEXT, provider_id UUID REFERENCES iptv_providers(id), created_at TIMESTAMP DEFAULT NOW())` },
    { name: 'banner_templates', sql: `CREATE TABLE IF NOT EXISTS banner_templates (id SERIAL PRIMARY KEY, name VARCHAR(255), type VARCHAR(50), bg_url TEXT, overlay_url TEXT, config JSONB DEFAULT '{}', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)` }
  ];
  for (const t of tables) { try { await pool.query(t.sql); } catch (e) {} }
}
// ... resto do seu server.js estável
