const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
require('dotenv').config();

const { initWebSocket } = require('./websocket/wsServer');
const pool = require('./config/database');
const sentinela = require('./modules/maintenance/sentinela');

async function runPendingMigrations() {
  const IGNORE_CODES = ['42P07', '42701', '42P11', '42710'];

  const iptvPhase1 = [
    {
      name: 'iptv_servers',
      sql: `CREATE TABLE IF NOT EXISTS iptv_servers (id SERIAL PRIMARY KEY, server_name VARCHAR(255) NOT NULL, xtream_url VARCHAR(500) NOT NULL, xtream_username VARCHAR(255), xtream_password VARCHAR(255), server_type VARCHAR(50) DEFAULT 'custom', status VARCHAR(50) DEFAULT 'active', last_tested_at TIMESTAMP, test_status VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`
    },
    {
      name: 'qpanel_panels',
      sql: `CREATE TABLE IF NOT EXISTS qpanel_panels (id SERIAL PRIMARY KEY, panel_name VARCHAR(255) NOT NULL, panel_url VARCHAR(500) NOT NULL, panel_username VARCHAR(255), panel_password VARCHAR(255), status VARCHAR(50) DEFAULT 'active', last_sync_at TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`
    },
    {
      name: 'iptv_providers',
      sql: `CREATE TABLE IF NOT EXISTS iptv_providers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), slot_index INTEGER UNIQUE NOT NULL, name TEXT, url TEXT, username TEXT, password TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW())`
    }
  ];

  const iptvPhase2 = [
    {
      name: 'iptv_curation',
      sql: `CREATE TABLE IF NOT EXISTS iptv_curation (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), type TEXT NOT NULL, title TEXT NOT NULL, external_id TEXT, tmdb_id TEXT, poster_path TEXT, backdrop_path TEXT, provider_id UUID REFERENCES iptv_providers(id) ON DELETE SET NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW())`
    }
  ];

  for (const table of iptvPhase1) {
    try { await pool.query(table.sql); console.log(`✅ Table ${table.name} OK`); } catch (err) { if (!IGNORE_CODES.includes(err.code)) console.warn(`⚠️ Error: ${err.message}`); }
  }

  for (const table of iptvPhase2) {
    try { await pool.query(table.sql); console.log(`✅ Table ${table.name} OK`); } catch (err) { if (!IGNORE_CODES.includes(err.code)) console.warn(`⚠️ Error: ${err.message}`); }
  }

  try {
    await pool.query(`INSERT INTO iptv_providers (slot_index, name) VALUES (1,'Slot 1'),(2,'Slot 2'),(3,'Slot 3'),(4,'Slot 4'),(5,'Slot 5'),(6,'Slot 6') ON CONFLICT (slot_index) DO NOTHING`);
    console.log('✅ Default slots synchronized');
  } catch (err) { console.error('⚠️ Slots error:', err.message); }
}

const app = express();
const PORT = process.env.PORT || 3000;
app.use(helmet()); app.use(cors()); 
app.use(express.json({ limit: '50mb' }));

app.use('/api/iptv-server', require('./modules/iptv-server/iptvServerRoutes'));
app.use('/api/iptv-tree', require('./modules/iptv-tree/iptvTreeRoutes'));
app.use('/api/banner-templates', require('./modules/banners/templateRoutes'));

const distPath = path.join(__dirname, 'web', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => { if (!req.path.startsWith('/api')) res.sendFile(path.join(distPath, 'index.html')); });

app.listen(PORT, async () => {
  console.log(`🚀 Server on ${PORT}`);
  await runPendingMigrations();
});
