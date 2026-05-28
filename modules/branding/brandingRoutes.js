const express = require('express');
const router = express.Router();
const brandingController = require('./brandingController');
const authMiddleware = require('../../middlewares/auth');

// Branding
router.get('/', brandingController.obterBranding);
router.get('/current', brandingController.obterBrandingAtivo);
router.post('/', authMiddleware, brandingController.criarBranding);
router.put('/:id', authMiddleware, brandingController.atualizarBranding);
router.post('/:id/activate', authMiddleware, brandingController.ativarBranding);
router.delete('/:id', authMiddleware, brandingController.excluirBranding);

// Upload de Branding
const multer = require('multer');
const path = require('path');
const storage = multer.memoryStorage();
const upload = multer({ storage });
router.post('/upload', authMiddleware, upload.single('file'), brandingController.uploadFile);

// Templates
router.get('/templates', authMiddleware, brandingController.listarTemplates);

// Logos do App Android
router.get('/app-logos/:type', brandingController.getAppLogo);

// ── Profile Screen (Controle de Backgrounds da Tela de Perfis) ──
const profileScreenController = require('./profileScreenController');
const fs = require('fs');

// Garantir que a pasta de uploads existe
const profileBgDir = path.join('public', 'uploads', 'profile-backgrounds');
if (!fs.existsSync(profileBgDir)) {
  fs.mkdirSync(profileBgDir, { recursive: true });
}

const profileBgStorage = multer.memoryStorage();
const profileBgUpload = multer({ 
  storage: profileBgStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Formato inválido. Use JPG, PNG ou WebP.'));
  }
});

router.get('/profile-screen', profileScreenController.getConfig);
router.put('/profile-screen/config', authMiddleware, profileScreenController.updateConfig);
router.post('/profile-screen/upload', authMiddleware, profileBgUpload.single('file'), profileScreenController.addBackground);
router.delete('/profile-screen/:id', authMiddleware, profileScreenController.removeBackground);
router.patch('/profile-screen/:id/toggle', authMiddleware, profileScreenController.toggleBackground);
router.put('/profile-screen/reorder', authMiddleware, profileScreenController.reorderBackgrounds);

module.exports = router;
