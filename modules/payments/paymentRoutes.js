const express = require('express');
const router = express.Router();
const paymentController = require('./paymentController');
const authMiddleware = require('../../middlewares/auth');

// Criação de PIX a partir da tela "Loja de Créditos"
router.post('/pix', authMiddleware, paymentController.createPixPayment);

// Pagamento com Cartão
router.post('/card', authMiddleware, paymentController.createCardPayment);

// --- Rotas Públicas para o Web Player (Cliente Final) ---
router.post('/public/pix', paymentController.createPublicPixPayment);
router.post('/public/card', paymentController.createPublicCardPayment);

// Validar Access Token do Mercado Pago (chama API real do MP)
router.post('/validate-token', paymentController.validateToken);

// Validar PayPal (chama API real do PayPal)
router.post('/validate-paypal', paymentController.validatePaypal);

// Checar o status da compra a cada X segundos
router.get('/status/:payment_id', paymentController.checkPaymentStatus); // Removido auth para o cliente final poder checar

// Obter histórico de transações
router.get('/history', authMiddleware, paymentController.getPaymentHistory);

module.exports = router;
