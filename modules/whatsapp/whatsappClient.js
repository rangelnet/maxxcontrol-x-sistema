/**
 * WhatsApp Client — Motor Baileys (ESM dentro de CommonJS)
 * Refatorado para Multi-Tenant (Isolamento por owner_id)
 * 
 * === MaxxChat Live Chat Enterprise ===
 * - Cada revendedor tem sua própria sessão e conexão.
 * - Persiste mensagem no banco (whatsapp_messages) com owner_id
 * - Cria conversas automaticamente (whatsapp_conversations) com owner_id
 * - Emite eventos via Socket.IO para tempo real usando room "user_ID"
 */

const qrcode = require('qrcode');
const path   = require('path');
const fs     = require('fs');
const pool   = require('../../config/database');
const engine = require('./knowledgeEngine');

// Armazena as instâncias ativas por userId
const clients = new Map();
// { sock, currentStatus, currentQR }

function getClientData(userId) {
  if (!clients.has(userId)) {
    clients.set(userId, { sock: null, currentStatus: 'disconnected', currentQR: null });
  }
  return clients.get(userId);
}

function getSessionPath(userId) {
  return path.join(__dirname, `../../.wpp-session-${userId}`);
}

// ─── Getter público ──────────────────────────────────────────────────────────
function getStatus(userId) {
  const data = getClientData(userId);
  return { status: data.currentStatus, qr_code: data.currentQR };
}

// ─── Getter do socket Baileys (para enviar msg manual via controller) ────────
function getSock(userId) {
  return getClientData(userId).sock;
}

// ─── Logging em arquivo para diagnóstico ─────────────────────────────────────
function log(userId, msg) {
  const time = new Date().toLocaleString();
  const line = `[${time}] [User ${userId}] ${msg}\n`;
  console.log(line.trim());
  try {
    fs.appendFileSync(path.join(__dirname, '../../whatsapp_debug.log'), line);
  } catch (e) {}
}

// ─── Helper: Garantir conversa existe no banco ───────────────────────────────
async function ensureConversation(userId, jid, pushName) {
  try {
    let res;
    if (pool.query) {
      res = await pool.query('SELECT id, bot_active FROM whatsapp_conversations WHERE jid = $1 AND owner_id = $2', [jid, userId]);
    } else {
      res = { rows: await pool.all('SELECT id, bot_active FROM whatsapp_conversations WHERE jid = ? AND owner_id = ?', [jid, userId]) };
    }

    if (res.rows.length > 0) return res.rows[0];

    // Criar nova conversa
    const isGroup = jid.endsWith('@g.us');
    const phone = isGroup ? null : jid.replace('@s.whatsapp.net', '');
    const name = pushName || phone || jid;

    if (pool.query) {
      const insertRes = await pool.query(
        'INSERT INTO whatsapp_conversations (jid, owner_id, name, phone, is_group) VALUES ($1, $2, $3, $4, $5) RETURNING id, bot_active',
        [jid, userId, name, phone, isGroup]
      );
      return insertRes.rows[0];
    } else {
      await pool.run(
        'INSERT INTO whatsapp_conversations (jid, owner_id, name, phone, is_group) VALUES (?, ?, ?, ?, ?)',
        [jid, userId, name, phone, isGroup ? 1 : 0]
      );
      const newRes = { rows: await pool.all('SELECT id, bot_active FROM whatsapp_conversations WHERE jid = ? AND owner_id = ?', [jid, userId]) };
      return newRes.rows[0];
    }
  } catch (e) {
    log(userId, `⚠️ [MaxxChat] Erro ao garantir conversa: ${e.message}`);
    return { id: null, bot_active: true };
  }
}

// ─── Helper: Salvar mensagem no banco ────────────────────────────────────────
async function persistMessage(userId, conversationId, jid, messageId, fromMe, senderName, content, mediaType, isBotReply) {
  try {
    if (pool.query) {
      await pool.query(
        `INSERT INTO whatsapp_messages (conversation_id, owner_id, jid, message_id, from_me, sender_name, content, media_type, is_bot_reply) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (message_id, owner_id) DO NOTHING`,
        [conversationId, userId, jid, messageId, fromMe, senderName, content, mediaType || 'text', isBotReply || false]
      );
    } else {
      await pool.run(
        `INSERT OR IGNORE INTO whatsapp_messages (conversation_id, owner_id, jid, message_id, from_me, sender_name, content, media_type, is_bot_reply) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [conversationId, userId, jid, messageId, fromMe ? 1 : 0, senderName, content, mediaType || 'text', isBotReply ? 1 : 0]
      );
    }

    // Atualizar last_message na conversa
    if (pool.query) {
      await pool.query(
        `UPDATE whatsapp_conversations SET last_message = $1, last_message_at = CURRENT_TIMESTAMP, 
         unread_count = CASE WHEN $2 THEN unread_count ELSE unread_count + 1 END,
         updated_at = CURRENT_TIMESTAMP WHERE jid = $3 AND owner_id = $4`,
        [content?.substring(0, 200), fromMe, jid, userId]
      );
    } else {
      await pool.run(
        `UPDATE whatsapp_conversations SET last_message = ?, last_message_at = CURRENT_TIMESTAMP, 
         unread_count = CASE WHEN ? THEN unread_count ELSE unread_count + 1 END,
         updated_at = CURRENT_TIMESTAMP WHERE jid = ? AND owner_id = ?`,
        [content?.substring(0, 200), fromMe ? 1 : 0, jid, userId]
      );
    }
  } catch (e) {
    log(userId, `⚠️ [MaxxChat] Erro ao persistir mensagem: ${e.message}`);
  }
}

// ─── Helper: Broadcast via Socket.IO ─────────────────────────────────────────
function broadcastMessage(userId, jid, messageData) {
  const io = global.__maxxchat_io;
  if (io) {
    // Usar uma sala específica para o usuário para isolar notificações
    io.to(`user_${userId}`).emit('new_message', messageData);
    io.to(`user_${userId}`).emit('conversation_updated', { jid, ...messageData });
  }
}

// ─── Iniciar cliente ─────────────────────────────────────────────────────────
async function initClient(userId) {
  const data = getClientData(userId);
  if (data.sock && data.currentStatus === 'connected') return;

  data.currentStatus = 'loading';
  data.currentQR     = null;
  log(userId, '🤖 [Baileys] Iniciando conexão WhatsApp...');

  try {
    const baileys = await import('@whiskeysockets/baileys');
    const {
      default: makeWASocket,
      useMultiFileAuthState,
      DisconnectReason,
      fetchLatestBaileysVersion,
      makeCacheableSignalKeyStore,
      Browsers,
      downloadMediaMessage
    } = baileys;

    const pino   = (await import('pino')).default;
    const logger = pino({ level: 'silent' });

    const sessionPath = getSessionPath(userId);
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version }          = await fetchLatestBaileysVersion();

    data.sock = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys : makeCacheableSignalKeyStore(state.keys, logger)
      },
      printQRInTerminal: false,
      browser          : Browsers.macOS('Chrome'),
      logger,
      keepAliveIntervalMs: 30000,
      syncFullHistory: false,
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: false
    });

    data.sock.ev.on('creds.update', saveCreds);

    // ─── MaxxChat: Intercepção Universal de Mensagens ─────────────────────────
    data.sock.ev.on('messages.upsert', async (m) => {
      const msg = m.messages[0];
      if (!msg.message) return;

      const remoteJid = msg.key.remoteJid;
      const fromMe = msg.key.fromMe;
      const pushName = msg.pushName || '';
      const messageId = msg.key.id;
      
      // Extração de Texto e Cliques de Botão
      let text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
      
      if (msg.message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson) {
        try {
          const params = JSON.parse(msg.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson);
          text = params.id || text;
        } catch (e) {}
      } else if (msg.message.buttonsResponseMessage?.selectedButtonId) {
        text = msg.message.buttonsResponseMessage.selectedButtonId;
      } else if (msg.message.templateButtonReplyMessage?.selectedId) {
        text = msg.message.templateButtonReplyMessage.selectedId;
      }

      // Determinar tipo de mídia e baixar caso exista
      let mediaType = 'text';
      let contentUrl = '';

      try {
        if (msg.message.imageMessage || msg.message.videoMessage || msg.message.audioMessage || msg.message.documentMessage || msg.message.stickerMessage) {
          mediaType = msg.message.imageMessage ? 'image' : msg.message.videoMessage ? 'video' : msg.message.audioMessage ? 'audio' : msg.message.documentMessage ? 'document' : 'sticker';
          
          if (mediaType === 'image' || mediaType === 'video' || mediaType === 'audio') {
            const buffer = await downloadMediaMessage(
              msg,
              'buffer',
              { },
              { logger: data.sock.logger, reuploadRequest: data.sock.updateMediaMessage }
            );
            
            const mediaDir = path.join(__dirname, '../../public/media');
            if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true });
            
            const ext = mediaType === 'image' ? 'jpg' : mediaType === 'video' ? 'mp4' : 'ogg';
            const fileName = `whatsapp_${userId}_${messageId}.${ext}`;
            const filePath = path.join(mediaDir, fileName);
            fs.writeFileSync(filePath, buffer);
            
            contentUrl = `/media/${fileName}`;
          }
        }
      } catch (err) {
        log(userId, `Erro ao baixar mídia: ${err.message}`);
      }

      const content = text || contentUrl || (mediaType !== 'text' ? `[${mediaType.toUpperCase()}]` : '');
      if (!content) return;

      // 1. Garantir conversa existe
      const conversation = await ensureConversation(userId, remoteJid, pushName);
      if (!conversation.id) return;

      // 2. Persistir mensagem no banco
      await persistMessage(userId, conversation.id, remoteJid, messageId, fromMe, pushName, content, mediaType, false);

      // 3. Broadcast via Socket.IO para o frontend
      broadcastMessage(userId, remoteJid, {
        id: messageId,
        conversation_id: conversation.id,
        jid: remoteJid,
        from_me: fromMe,
        sender_name: pushName,
        content,
        media_type: mediaType,
        is_bot_reply: false,
        created_at: new Date().toISOString()
      });

      // 4. Se for mensagem do próprio bot, parar aqui
      if (fromMe) return;

      log(userId, `📩 [MaxxChat] Msg de ${pushName || remoteJid}: "${content}"`);

      // 5. Verificar se o bot está ativo para esta conversa
      if (!conversation.bot_active) {
        log(userId, `🚫 [MaxxChat] Bot desativado para ${remoteJid} — atendimento humano`);
        return;
      }

      // ─── Chatbot Logic (MaxxFlow) ─────────────────────
      try {
        let sessionRes;
        if (pool.query) {
           sessionRes = await pool.query('SELECT * FROM whatsapp_chatbot_sessions WHERE contact_id = $1 AND owner_id = $2', [remoteJid, userId]);
        } else {
           sessionRes = { rows: await pool.all('SELECT * FROM whatsapp_chatbot_sessions WHERE contact_id = ? AND owner_id = ?', [remoteJid, userId]) };
        }
        
        let session = sessionRes.rows[0];
        let flowId = session?.flow_id;
        let currentNodeId = session?.current_node_id;

        // B. Se não houver sessão ativa, buscar o fluxo padrão
        if (!session) {
          let flowRes;
          if (pool.query) {
            flowRes = await pool.query('SELECT * FROM whatsapp_flows WHERE is_active = true AND owner_id = $1 ORDER BY is_default DESC LIMIT 1', [userId]);
          } else {
            flowRes = { rows: await pool.all('SELECT * FROM whatsapp_flows WHERE is_active = true AND owner_id = ? ORDER BY is_default DESC LIMIT 1', [userId]) };
          }
          
          if (flowRes.rows.length === 0) return; // Nenhum fluxo ativo
          
          const flow = flowRes.rows[0];
          flowId = flow.id;
          const flowContent = typeof flow.content === 'string' ? JSON.parse(flow.content) : flow.content;
          const firstNode = flowContent.nodes[0];
          
          if (!firstNode) return;

          // Iniciar sessão
          if (pool.query) {
            await pool.query('INSERT INTO whatsapp_chatbot_sessions (contact_id, owner_id, flow_id, current_node_id) VALUES ($1, $2, $3, $4)', [remoteJid, userId, flowId, firstNode.id]);
          } else {
            await pool.run('INSERT INTO whatsapp_chatbot_sessions (contact_id, owner_id, flow_id, current_node_id) VALUES (?, ?, ?, ?)', [remoteJid, userId, flowId, firstNode.id]);
          }
          
          // Enviar primeira mensagem
          const isChoice = firstNode.type === 'choice' && firstNode.options?.length > 0;
          let botMsgId = `bot_${Date.now()}`;
          
          if (isChoice) {
            const buttons = firstNode.options.map(opt => ({ id: opt.text, text: opt.text.substring(0, 20) }));
            botMsgId = await sendInteractiveMessage(userId, remoteJid, firstNode.content, "Selecione uma opção:", buttons) || botMsgId;
          } else {
            await data.sock.sendMessage(remoteJid, { text: firstNode.content });
          }
          
          await persistMessage(userId, conversation.id, remoteJid, botMsgId, true, 'Maxx Bot', firstNode.content, 'text', true);
          broadcastMessage(userId, remoteJid, {
            id: botMsgId, conversation_id: conversation.id, jid: remoteJid,
            from_me: true, sender_name: 'Maxx Bot', content: firstNode.content,
            media_type: 'text', is_bot_reply: true, created_at: new Date().toISOString()
          });

          log(userId, `🤖 [Chatbot] Iniciando fluxo "${flow.name}" para ${remoteJid}`);
          return;
        }

        // C. Processar nó atual se houver sessão
        const flowRes = pool.query 
          ? await pool.query('SELECT * FROM whatsapp_flows WHERE id = $1 AND owner_id = $2', [flowId, userId])
          : { rows: await pool.all('SELECT * FROM whatsapp_flows WHERE id = ? AND owner_id = ?', [flowId, userId]) };
          
        if (flowRes.rows.length === 0) return;
        const flow = flowRes.rows[0];
        const flowContent = typeof flow.content === 'string' ? JSON.parse(flow.content) : flow.content;
        const nodes = flowContent.nodes;
        const currentNode = nodes.find(n => n.id === currentNodeId);
        
        if (!currentNode) return;

        // Lógica de desvio baseada no tipo do nó
        const sendBotReply = async (replyText, nextNodeId, options = null) => {
          let botMsgId = `bot_${Date.now()}`;
          if (options && options.length > 0) {
            const buttons = options.map(opt => ({ id: opt.text, text: opt.text.substring(0, 20) }));
            botMsgId = await sendInteractiveMessage(userId, remoteJid, replyText, "Selecione uma opção:", buttons) || botMsgId;
          } else {
            await data.sock.sendMessage(remoteJid, { text: replyText });
          }
          
          await persistMessage(userId, conversation.id, remoteJid, botMsgId, true, 'Maxx Bot', replyText, 'text', true);
          broadcastMessage(userId, remoteJid, {
            id: botMsgId, conversation_id: conversation.id, jid: remoteJid,
            from_me: true, sender_name: 'Maxx Bot', content: replyText,
            media_type: 'text', is_bot_reply: true, created_at: new Date().toISOString()
          });
          if (nextNodeId) {
            if (pool.query) {
              await pool.query('UPDATE whatsapp_chatbot_sessions SET current_node_id = $1, updated_at = CURRENT_TIMESTAMP WHERE contact_id = $2 AND owner_id = $3', [nextNodeId, remoteJid, userId]);
            } else {
              await pool.run('UPDATE whatsapp_chatbot_sessions SET current_node_id = ?, updated_at = CURRENT_TIMESTAMP WHERE contact_id = ? AND owner_id = ?', [nextNodeId, remoteJid, userId]);
            }
          }
        };

        if (currentNode.type === 'choice') {
          const match = engine.findBestMatch(text, currentNode.options);
          if (match) {
            const nextNodeId = currentNode.options[match.index].next_node_id;
            const nextNode = nodes.find(n => n.id === nextNodeId);
            if (nextNode) {
              const isNextChoice = nextNode.type === 'choice';
              await sendBotReply(nextNode.content, nextNodeId, isNextChoice ? nextNode.options : null);
            }
          } else {
            await sendBotReply(`Desculpe, não entendi.\n\n${currentNode.content}`, null, currentNode.options);
          }
        } else {
           if (currentNode.next_node_id) {
              const nextNode = nodes.find(n => n.id === currentNode.next_node_id);
              if (nextNode) {
                const isNextChoice = nextNode.type === 'choice';
                await sendBotReply(nextNode.content, nextNode.id, isNextChoice ? nextNode.options : null);
              }
           }
        }
      } catch (e) {
        log(userId, `❌ [Chatbot] Erro ao processar: ${e.message}`);
      }
    });

    // ─── MaxxChat: Sincronização de Histórico ────────────────
    data.sock.ev.on('messaging-history.set', async ({ chats, contacts, messages, isLatest }) => {
      log(userId, `📦 [MaxxChat] Sincronizando histórico do aparelho: ${chats.length} conversas, ${messages.length} mensagens`);
      try {
        for (const chat of chats) {
          await ensureConversation(userId, chat.id, chat.name || chat.verifiedName || '');
        }

        Promise.resolve().then(async () => {
          for (const m of messages) {
            if (!m.message) continue;
            const remoteJid = m.key.remoteJid;
            const fromMe = m.key.fromMe;
            const pushName = m.pushName || '';
            
            const text = m.message.conversation || m.message.extendedTextMessage?.text || '';
            let mediaType = 'text';
            if (m.message.imageMessage) mediaType = 'image';
            else if (m.message.videoMessage) mediaType = 'video';
            
            let content = text;
            if (!content && mediaType !== 'text') content = `[${mediaType.toUpperCase()}]`; 
            if (!content) continue;

            const conversation = await ensureConversation(userId, remoteJid, pushName);
            await persistMessage(userId, conversation.id, remoteJid, m.key.id, fromMe, pushName, content, mediaType, false);
          }
          log(userId, `✅ [MaxxChat] Histórico sincronizado no background com sucesso!`);
        }).catch(err => log(userId, `❌ Erro no histórico de background: ${err.message}`));
      } catch (err) {
        log(userId, `❌ [MaxxChat] Erro na sincronização de histórico: ${err.message}`);
      }
    });

    data.sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        log(userId, '📱 [Baileys] QR Code gerado.');
        data.currentStatus = 'disconnected';
        data.currentQR     = await qrcode.toDataURL(qr)
          .then(url => url.replace('data:image/png;base64,', ''));
      }

      if (connection === 'open') {
        log(userId, '✅ [Baileys] WhatsApp conectado!');
        data.currentStatus = 'connected';
        data.currentQR     = null;
      }

      if (connection === 'close') {
        const boom = lastDisconnect?.error;
        const statusCode = boom?.output?.statusCode || boom?.statusCode;
        const shouldReconnect = statusCode !== 401;

        log(userId, `❌ [Baileys] Desconectado. Código: ${statusCode}`);
        data.currentStatus = 'disconnected';
        data.sock = null;

        if (statusCode === 515) {
          log(userId, '🔄 [Baileys] Reinício solicitado (515). Conectando...');
          initClient(userId);
        } else if (shouldReconnect) {
          log(userId, '🔄 [Baileys] Reconectando em 5s...');
          setTimeout(() => initClient(userId), 5000);
        } else {
          log(userId, '🛑 [Baileys] Logout detectado.');
          destroyClient(userId);
        }
      }
    });

  } catch (err) {
    log(userId, `❌ [Baileys] Erro no init: ${err.message}`);
    data.currentStatus = 'disconnected';
    data.sock          = null;
  }
}

// ─── Desconectar e apagar sessão ─────────────────────────────────────────────
async function destroyClient(userId) {
  const data = getClientData(userId);
  try {
    if (data.sock) await data.sock.logout();
  } catch (_) {}

  data.sock          = null;
  data.currentStatus = 'disconnected';
  data.currentQR     = null;

  const sessionPath = getSessionPath(userId);
  if (fs.existsSync(sessionPath)) {
    fs.rmSync(sessionPath, { recursive: true, force: true });
    log(userId, '🗑️ [Baileys] Sessão apagada do disco.');
  }
  log(userId, '🛑 [Baileys] Desconectado.');
}

// ─── Listar grupos ────────────────────────────────────────────────────────────
async function getGroups(userId) {
  const data = getClientData(userId);
  if (!data.sock || data.currentStatus !== 'connected') return [];
  try {
    const groups = await data.sock.groupFetchAllParticipating();
    return Object.values(groups).map(g => ({
      id  : g.id,
      name: g.subject
    }));
  } catch (e) {
    console.error(`[User ${userId}] Erro ao buscar grupos:`, e.message);
    return [];
  }
}

// ─── Enviar mensagem ──────────────────────────────────────────────────────────
async function sendMessage(userId, groupId, message, options = {}) {
  const data = getClientData(userId);
  if (!data.sock || data.currentStatus !== 'connected') {
    throw new Error('WhatsApp não conectado');
  }
  const jid = groupId.includes('@g.us') ? groupId : `${groupId}@g.us`;
  
  if (options && options.buttons && options.buttons.length > 0) {
     return await sendInteractiveMessage(userId, jid, message, "MaxxControl", options.buttons);
  }
  
  await data.sock.sendMessage(jid, { text: message });
}

// ─── Enviar Mensagem Interativa (Botões Hack) ─────────────────────────────────
async function sendInteractiveMessage(userId, groupId, text, footer, buttons) {
  const data = getClientData(userId);
  if (!data.sock || data.currentStatus !== 'connected') {
    throw new Error('WhatsApp não conectado');
  }
  const jid = groupId.includes('@g.us') ? groupId : `${groupId}@g.us`;
  
  const baileys = await import('@whiskeysockets/baileys');
  const { generateWAMessageFromContent } = baileys;

  const dynamicButtons = buttons.map(btn => ({
    name: "quick_reply",
    buttonParamsJson: JSON.stringify({
      display_text: btn.text,
      id: btn.id
    })
  }));

  const msgContent = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          header: { hasMediaAttachment: false },
          body: { text: text },
          footer: { text: footer || "MaxxControl" },
          nativeFlowMessage: {
            buttons: dynamicButtons
          }
        }
      }
    }
  };

  const msg = generateWAMessageFromContent(jid, msgContent, { userJid: data.sock?.user?.id });
  await data.sock.relayMessage(jid, msg.message, { messageId: msg.key.id });
  
  return msg.key.id;
}

// ─── Auto-inicialização ao carregar o módulo ─────────────────────────────────
// Auto-conectar sessões que já existem na pasta (opcional para multi-tenant, podemos iniciar on-demand)
setTimeout(() => {
  const baseDir = path.join(__dirname, '../../');
  fs.readdir(baseDir, (err, files) => {
    if (err) return;
    files.forEach(file => {
      if (file.startsWith('.wpp-session-')) {
        const userIdStr = file.replace('.wpp-session-', '');
        const userId = parseInt(userIdStr, 10);
        if (!isNaN(userId)) {
          console.log(`📦 [Baileys] Sessão encontrada para User ${userId}. Restaurando conexão automaticamente...`);
          initClient(userId);
        }
      }
    });
  });
}, 2000);

module.exports = { initClient, destroyClient, getGroups, sendMessage, getStatus, getSock, sendInteractiveMessage };
