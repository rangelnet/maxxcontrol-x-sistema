const express = require('express');
const router  = express.Router();
const ctrl    = require('./whatsappController');

// ═══ Rotas do WhatsApp Base (PRESERVADO) ═════════════════════════════════════
router.get ('/status',     ctrl.getStatus);
router.post('/connect',    ctrl.connect);
router.post('/disconnect', ctrl.disconnect);
router.get ('/groups',     ctrl.getGroups);
router.post('/send',       ctrl.sendMessage);

// ═══ Rotas do MaxxFlow / Chatbot (PRESERVADO) ═══════════════════════════════
router.get ('/flows',             ctrl.getFlows);
router.post('/flows',             ctrl.saveFlow);
router.post('/flows/:id/activate', ctrl.activateFlow);
router.delete('/flows/:id',        ctrl.deleteFlow);

// ═══ Rotas do MaxxChat — Live Chat Enterprise (NOVO) ════════════════════════
router.get ('/chat/conversations',                  ctrl.getConversations);
router.get ('/chat/profile-pic/:jid',               ctrl.getProfilePic);
router.get ('/chat/conversations/:jid/messages',    ctrl.getMessages);
router.post('/chat/send',                           ctrl.chatSend);
router.put ('/chat/conversations/:jid/status',      ctrl.updateConversationStatus);
router.put ('/chat/conversations/:jid/label',       ctrl.updateConversationLabel);
router.put ('/chat/conversations/:jid/bot',         ctrl.toggleBot);
router.put ('/chat/conversations/:jid/notes',       ctrl.updateNotes);
router.get ('/chat/labels',                         ctrl.getLabels);
router.post('/chat/labels',                         ctrl.saveLabel);
router.get ('/chat/quick-replies',                  ctrl.getQuickReplies);
router.post('/chat/quick-replies',                  ctrl.saveQuickReply);
router.delete('/chat/quick-replies/:id',            ctrl.deleteQuickReply);

module.exports = router;
