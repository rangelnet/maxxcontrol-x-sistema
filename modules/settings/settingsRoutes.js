const express = require('express');
const router = express.Router();
const settingsController = require('./settingsController');
const authMiddleware = require('../../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Garante que o diretório de uploads existe
const uploadDir = 'public/uploads/settings';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // limite de 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Formato inválido. Use JPG ou PNG.'));
    }
  }
});

router.get('/', settingsController.getSettings);
router.post('/', settingsController.bulkUpdateSettings);
router.post('/logo', authMiddleware, upload.single('logo'), settingsController.uploadLogo);
router.post('/:key', settingsController.updateSetting);

module.exports = router;

