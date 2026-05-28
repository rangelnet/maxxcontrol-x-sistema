const express = require('express');
const router  = express.Router();
const ctrl    = require('./whatsappController');
const authMiddleware = require('../../middlewares/auth');

// ═══ Rotas do WhatsApp Base (PROTEGIDO POR AUTH) ═════════════════════════════
router.get ('/status',     authMiddleware, ctrl.getStatus);
router.post('/connect',    authMiddleware, ctrl.connect);
router.post('/disconnect', authMiddleware, ctrl.disconnect);
router.get ('/groups',     authMiddleware, ctrl.getGroups);
router.post('/send',       authMiddleware, ctrl.sendMessage);

// ═══ Rotas do MaxxFlow / Chatbot (PROTEGIDO POR AUTH) ════════════════════════
router.get ('/flows',              authMiddleware, ctrl.getFlows);
router.post('/flows',              authMiddleware, ctrl.saveFlow);
router.post('/flows/:id/activate', authMiddleware, ctrl.activateFlow);
router.delete('/flows/:id',        authMiddleware, ctrl.deleteFlow);

// ═══ Rotas do MaxxChat — Live Chat Enterprise (PROTEGIDO POR AUTH) ═══════════
router.get ('/chat/conversations',                  authMiddleware, ctrl.getConversations);
router.get ('/chat/profile-pic/:jid',               authMiddleware, ctrl.getProfilePic);
router.get ('/chat/conversations/:jid/messages',    authMiddleware, ctrl.getMessages);
router.post('/chat/send',                           authMiddleware, ctrl.chatSend);
router.put ('/chat/conversations/:jid/status',      authMiddleware, ctrl.updateConversationStatus);
router.put ('/chat/conversations/:jid/label',       authMiddleware, ctrl.updateConversationLabel);
router.put ('/chat/conversations/:jid/bot',         authMiddleware, ctrl.toggleBot);
router.put ('/chat/conversations/:jid/notes',       authMiddleware, ctrl.updateNotes);
router.get ('/chat/labels',                         authMiddleware, ctrl.getLabels);
router.post('/chat/labels',                         authMiddleware, ctrl.saveLabel);
router.get ('/chat/quick-replies',                  authMiddleware, ctrl.getQuickReplies);
router.post('/chat/quick-replies',                  authMiddleware, ctrl.saveQuickReply);
router.delete('/chat/quick-replies/:id',            authMiddleware, ctrl.deleteQuickReply);

module.exports = router;
