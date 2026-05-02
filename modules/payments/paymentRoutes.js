const express = require('express');
const router = express.Router();
const paymentController = require('./paymentController');
const authMiddleware = require('../../middlewares/auth');

// Criação de PIX a partir da tela "Loja de Créditos"
router.post('/pix', authMiddleware, paymentController.createPixPayment);

// Pagamento com Cartão
router.post('/card', authMiddleware, paymentController.createCardPayment);

// Validar Access Token do Mercado Pago (chama API real do MP)
router.post('/validate-token', paymentController.validateToken);

// Validar PayPal (chama API real do PayPal)
router.post('/validate-paypal', paymentController.validatePaypal);

// Checar o status da compra a cada X segundos
router.get('/status/:payment_id', authMiddleware, paymentController.checkPaymentStatus);

// Obter histórico de transações
router.get('/history', authMiddleware, paymentController.getPaymentHistory);

module.exports = router;
