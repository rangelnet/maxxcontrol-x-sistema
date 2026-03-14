const express = require('express');
const router = express.Router();
const controller = require('./iptvServersController');
const { authMiddleware } = require('../../middlewares/auth');

/**
 * Rotas para gerenciamento de servidores IPTV
 * Rotas públicas para app, rotas protegidas para painel
 */

// GET /api/iptv/servers
// Lista servidores ativos (público - para app)
router.get('/servers', controller.listServers);

// GET /api/iptv/servers/all
// Lista todos os servidores (protegido - para painel)
router.get('/servers/all', authMiddleware, controller.listAllServers);

// POST /api/iptv/servers
// Criar novo servidor (protegido)
router.post('/servers', authMiddleware, controller.createServer);

// PUT /api/iptv/servers/:id
// Atualizar servidor (protegido)
router.put('/servers/:id', authMiddleware, controller.updateServer);

// DELETE /api/iptv/servers/:id
// Deletar servidor (protegido)
router.delete('/servers/:id', authMiddleware, controller.deleteServer);

// POST /api/iptv/servers/:id/maintenance
// Colocar servidor em manutenção (protegido)
router.post('/servers/:id/maintenance', authMiddleware, controller.setMaintenance);

// POST /api/iptv/servers/:id/activate
// Ativar servidor (protegido)
router.post('/servers/:id/activate', authMiddleware, controller.activateServer);

// GET /api/iptv/servers/:id/users
// Obter contagem de usuários do servidor (protegido)
router.get('/servers/:id/users', authMiddleware, controller.getServerUsers);

module.exports = router;
