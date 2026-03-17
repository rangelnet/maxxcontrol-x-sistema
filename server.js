const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { initWebSocket } = require('./websocket/wsServer');
const pool = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (necessário para Render e outros proxies reversos)
app.set('trust proxy', 1);

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de requisições
});
app.use('/api/', limiter);

// Servir arquivos estáticos do frontend (build do Vite)
app.use(express.static(path.join(__dirname, 'web/dist')));

// Rotas da API
app.use('/api/auth', require('./modules/auth/authRoutes'));
app.use('/api/device', require('./modules/mac/macRoutes'));
app.use('/api/mac', require('./modules/mac/macRoutes')); // Alias para compatibilidade com app Android
app.use('/api/apps', require('./modules/apps/appsRoutes'));
app.use('/api/log', require('./modules/logs/logsRoutes'));
app.use('/api/logs', require('./modules/logs/logsRoutes')); // Alias para compatibilidade com painel web
app.use('/api/bug', require('./modules/bugs/bugsRoutes'));
app.use('/api/app', require('./modules/updates/updatesRoutes'));
app.use('/api/monitor', require('./modules/monitoring/monitoringRoutes'));
app.use('/api/api-monitor', require('./modules/api-monitor/apiMonitorRoutes'));
app.use('/api/api-config', require('./modules/api-config/apiConfigRoutes'));
app.use('/api/content', require('./modules/content/contentRoutes'));
app.use('/api/branding', require('./modules/branding/brandingRoutes'));
app.use('/api/iptv-server', require('./modules/iptv-server/iptvServerRoutes'));
app.use('/api/iptv-tree', require('./modules/iptv-tree/iptvTreeRoutes'));
app.use('/api/banners', require('./modules/banners/bannerRoutes'));

// Rotas do sistema multi-servidor IPTV
app.use('/api/iptv', require('./modules/iptv-credentials/iptvCredentialsRoutes'));
app.use('/api/iptv', require('./modules/iptv-servers/iptvServersRoutes'));
app.use('/api/iptv', require('./modules/iptv-monitoring/iptvMonitoringRoutes'));

// Rotas do Playlist Manager 4-in-1
app.use('/api/playlist-manager', require('./modules/playlist-manager/playlistManagerRoutes'));

// Rotas do Plugin IPTV Unificado (integração com MaxxControl)
app.use('/api/iptv-plugin', require('./modules/iptv-servers/iptv-plugin-unified'));

// Servir arquivos estáticos (banners gerados)
app.use('/banners', express.static('public/banners'));

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    service: 'MaxxControl X API'
  });
});

// Rota raiz da API
app.get('/api', (req, res) => {
  res.json({ 
    message: '🚀 MaxxControl X API',
    version: '1.0.0',
    status: 'running'
  });
});

// Servir index.html para todas as outras rotas (SPA)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/banners')) {
    res.sendFile(path.join(__dirname, 'web/dist/index.html'));
  }
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 MaxxControl X API rodando na porta ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
});

// Iniciar WebSocket
initWebSocket(server);

// Testar conexão com banco
if (process.env.USE_SQLITE === 'true') {
  pool.query('SELECT datetime("now") as now').then(res => {
    console.log('✅ Banco de dados SQLite conectado:', res.rows[0].now);
  }).catch(err => {
    console.error('❌ Erro ao conectar no banco de dados:', err.message);
  });
} else {
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('❌ Erro ao conectar no banco de dados:', err);
    } else {
      console.log('✅ Banco de dados PostgreSQL conectado:', res.rows[0].now);
    }
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recebido, encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado');
    pool.end();
    process.exit(0);
  });
});
