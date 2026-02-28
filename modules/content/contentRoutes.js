const express = require('express');
const router = express.Router();
const contentController = require('./contentController');
const authMiddleware = require('../../middlewares/auth');

// Conteúdo
router.get('/', authMiddleware, contentController.listarConteudos);
router.get('/list', contentController.listarConteudos); // Sem autenticação para galeria pública
router.get('/search', contentController.pesquisarTMDB); // Sem autenticação para busca pública
router.post('/importar-filme/:id', authMiddleware, contentController.importarFilme);
router.post('/importar-serie/:id', authMiddleware, contentController.importarSerie);
router.get('/pesquisar', authMiddleware, contentController.pesquisarTMDB);
router.get('/populares', authMiddleware, contentController.obterPopulares);
router.delete('/:id', authMiddleware, contentController.deletarConteudo);

// Banners
router.post('/:id/gerar-banners', authMiddleware, contentController.gerarBanners);

module.exports = router;
