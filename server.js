const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

// Configuração do PostgreSQL (Supabase)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'web/dist')));

// --- ROTA DE HEALTH CHECK (Monitoramento Render) ---
app.get('/health', async (req, res) => {
  try {
    const dbCheck = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      db_time: dbCheck.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Importação dos Módulos/Plugins
const iptvPluginRouter = require('./modules/iptv-servers/iptv-plugin-unified');

// Registro das Rotas da API
app.use('/api/iptv-plugin', iptvPluginRouter);

// Rota para o Frontend (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'web/dist', 'index.html'));
});

// Inicialização
app.listen(port, () => {
  console.log(`🚀 Servidor Fullstack Mxxcontrol rodando na porta ${port}`);
});
