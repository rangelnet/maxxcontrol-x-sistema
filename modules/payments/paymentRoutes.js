const express = require('express');
const router = express.Router();
const paymentController = require('./paymentController');
const authMiddleware = require('../../middlewares/auth');

// Criação de PIX a partir da tela "Loja de Créditos"
router.post('/pix', authMiddleware, paymentController.createPixPayment);

// Checar o status da compra a cada X segundos
router.get('/status/:payment_id', authMiddleware, paymentController.checkPaymentStatus);

// Obter histórico de transações
router.get('/history', authMiddleware, paymentController.getPaymentHistory);

module.exports = router;
