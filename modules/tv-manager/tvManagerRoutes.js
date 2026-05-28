const express = require('express');
const router = express.Router();
const controller = require('./tvManagerController');
const authMiddleware = require('../../middlewares/auth');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do Multer para as imagens das categorias em memória (Supabase Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Rotas de Importação
router.post('/import', authMiddleware, controller.importPlaylist);

// Rotas de Categorias
router.get('/categories', authMiddleware, controller.getCategories);
router.post('/categories', authMiddleware, upload.single('image'), controller.createCategory);
router.put('/categories/reorder', authMiddleware, controller.reorderCategories);
router.put('/categories/:id', authMiddleware, upload.single('image'), controller.updateCategory);
router.delete('/categories/:id', authMiddleware, controller.deleteCategory);

// Rotas de Canais
router.get('/categories/:categoryId/channels', authMiddleware, controller.getChannelsByCategory);
router.post('/channels/move', authMiddleware, controller.moveChannels);
router.post('/channels/audit-category', authMiddleware, controller.auditCategoryChannels);
router.post('/channels/audit-staging', authMiddleware, controller.auditStagingChannels);
router.delete('/channels/:id', authMiddleware, controller.removeChannel);
router.get('/staging', authMiddleware, controller.getStagingChannels);

// Ferramentas Rápidas (Qualidade e Lote)
router.post('/channels/clean-names', authMiddleware, controller.cleanNames);
router.post('/channels/bulk-delete', authMiddleware, controller.bulkDeleteQualities);
router.post('/channels/delete-multiple', authMiddleware, controller.deleteMultipleChannels);
router.post('/channels/detect-duplicates', authMiddleware, controller.detectDuplicateChannels);
router.put('/channels/:id/name', authMiddleware, controller.updateChannelName);

// Rota de Sincronização (WebSocket)
router.post('/sync', authMiddleware, controller.syncDevices);

// Rota Pública (para consumo do App Android/Web)
router.get('/config/:mac_address', controller.getConfigForDevice);

module.exports = router;
