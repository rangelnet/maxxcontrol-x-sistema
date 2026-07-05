const express = require('express');
const router = express.Router();
const macController = require('./macController');
const deviceController = require('./deviceController');
const authMiddleware = require('../../middlewares/auth');
const deviceAuthMiddleware = require('../../middlewares/deviceAuth');

// Rota com autenticação de dispositivo (token fixo) para registro
router.post('/register-device', deviceAuthMiddleware, macController.registerDevicePublic);

// Rota para atualizar status de conexão (online/offline)
router.post('/connection-status', deviceAuthMiddleware, macController.updateConnectionStatus);

// Rota pública para registro inicial de dispositivo (sem autenticação) - DEPRECATED
router.post('/register-public', macController.registerDevicePublic);

router.post('/register', authMiddleware, macController.registerDevice);
router.post('/check', macController.checkDevice);
router.post('/block', authMiddleware, macController.blockDevice);
router.post('/unblock', authMiddleware, macController.unblockDevice);
router.get('/list', authMiddleware, macController.listDevices);
router.get('/list-all', authMiddleware, macController.listAllDevices); // Lista TODOS (admin)

// Configurar URL da API de teste grátis
router.post('/test-api-url', authMiddleware, macController.setTestApiUrl);
router.post('/:id/test-config', authMiddleware, macController.updateTestConfig);

// Buscar URL da API de teste grátis (público - para o app)
router.get('/test-api-url/:mac_address', macController.getTestApiUrl);

// Consultar o estado comercial do MAC para o fluxo Xtream + painel (público)
router.get('/entitlement/:mac_address', deviceController.getActivationEntitlementByMac);

// Salvar credenciais de teste grátis (público - para o app)
router.post('/test-credentials', macController.saveTestCredentials);

// ========== ROTAS ALTERNATIVAS QUE ACEITAM MAC ADDRESS ==========

// Verificar status por MAC (para o app Android)
router.get('/status/:mac_address', authMiddleware, macController.checkDeviceStatusByMac);

// Bloquear por MAC (para o app Android)
router.post('/block-by-mac', authMiddleware, macController.blockDeviceByMac);

// Desbloquear por MAC (para o app Android)
router.post('/unblock-by-mac', authMiddleware, macController.unblockDeviceByMac);

// Strategic Device Services (Vizzion Style)
router.post('/device-login', deviceController.deviceLogin);
router.get('/playlists/:mac', deviceController.getPlaylists);
router.post('/playlists/save', deviceController.savePlaylist);
router.post('/migrate-license', deviceController.migrateLicense);
router.post('/update-dns', deviceController.updateDNS);
router.get('/generate-code/:mac_address', deviceController.generateCode);
router.post('/login-by-code', deviceController.loginByCode);

// Rota para Bulk Import de Devices
router.post('/bulk-import', authMiddleware, macController.bulkImport);

module.exports = router;
