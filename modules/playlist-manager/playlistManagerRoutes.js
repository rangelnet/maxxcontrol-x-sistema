const express = require('express');
const router = express.Router();
const controller = require('./playlistManagerController');
const { authMiddleware } = require('../../middlewares/auth');

/**
 * Rotas do Playlist Manager 4-in-1
 * Todas as rotas são protegidas com autenticação JWT
 */

// Gerenciamento de servidores
router.get('/servers', authMiddleware, controller.listServers);
router.post('/servers', authMiddleware, controller.addServer);
router.delete('/servers/:id', authMiddleware, controller.deleteServer);

// Registro em lote
router.post('/register', authMiddleware, controller.registerPlaylists);

module.exports = router;
