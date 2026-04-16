/**
 * WhatsApp Client — Motor Baileys (ESM dentro de CommonJS)
 * Usa import() dinâmico para compatibilidade com o servidor Node.js padrão.
 * 
 * === MaxxChat Live Chat Enterprise ===
 * - Persiste TODA mensagem no banco (whatsapp_messages)
 * - Cria conversas automaticamente (whatsapp_conversations)
 * - Emite eventos via Socket.IO para tempo real
 * - Suporta Bot Takeover (bot_active flag por conversa)
 */

const qrcode = require('qrcode');
const path   = require('path');
const fs     = require('fs');

const SESSION_PATH = path.join(__dirname, '../../.wpp-session');

const pool      = require('../../config/database');
const engine    = require('./knowledgeEngine');

let sock          = null;
let currentStatus = 'disconnected'; // 'loading' | 'disconnected' | 'connected'
let currentQR     = null;           // base64 PNG

// ─── Getter público ──────────────────────────────────────────────────────────
function getStatus() {
  return { status: currentStatus, qr_code: currentQR };
}

// ─── Getter do socket Baileys (para enviar msg manual via controller) ────────
function getSock() {
  return sock;
}

// ─── Logging em arquivo para diagnóstico ─────────────────────────────────────
function log(msg) {
  const time = new Date().toLocaleString();
  const line = `[${time}] ${msg}\n`;
  console.log(msg);
  try {
    fs.appendFileSync(path.join(__dirname, '../../whatsapp_debug.log'), line);
  } catch (e) {}
}

// ─── Helper: Garantir conversa existe no banco ───────────────────────────────
async function ensureConversation(jid, pushName) {
  try {
    let res;
    if (pool.query) {
      res = await pool.query('SELECT id, bot_active FROM whatsapp_conversations WHERE jid = $1', [jid]);
    } else {
      res = { rows: await pool.all('SELECT id, bot_active FROM whatsapp_conversations WHERE jid = ?', [jid]) };
    }

    if (res.rows.length > 0) return res.rows[0];

    // Criar nova conversa
    const isGroup = jid.endsWith('@g.us');
    const phone = isGroup ? null : jid.replace('@s.whatsapp.net', '');
    const name = pushName || phone || jid;

    if (pool.query) {
      const insertRes = await pool.query(
        'INSERT INTO whatsapp_conversations (jid, name, phone, is_group) VALUES ($1, $2, $3, $4) RETURNING id, bot_active',
        [jid, name, phone, isGroup]
      );
      return insertRes.rows[0];
    } else {
      await pool.run(
        'INSERT INTO whatsapp_conversations (jid, name, phone, is_group) VALUES (?, ?, ?, ?)',
        [jid, name, phone, isGroup ? 1 : 0]
      );
      const newRes = { rows: await pool.all('SELECT id, bot_active FROM whatsapp_conversations WHERE jid = ?', [jid]) };
      return newRes.rows[0];
    }
  } catch (e) {
    log(`⚠️ [MaxxChat] Erro ao garantir conversa: ${e.message}`);
    return { id: null, bot_active: true };
  }
}

// ─── Helper: Salvar mensagem no banco ────────────────────────────────────────
async function persistMessage(conversationId, jid, messageId, fromMe, senderName, content, mediaType, isBotReply) {
  try {
    if (pool.query) {
      await pool.query(
        `INSERT INTO whatsapp_messages (conversation_id, jid, message_id, from_me, sender_name, content, media_type, is_bot_reply) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (message_id) DO NOTHING`,
        [conversationId, jid, messageId, fromMe, senderName, content, mediaType || 'text', isBotReply || false]
      );
    } else {
      await pool.run(
        `INSERT OR IGNORE INTO whatsapp_messages (conversation_id, jid, message_id, from_me, sender_name, content, media_type, is_bot_reply) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [conversationId, jid, messageId, fromMe ? 1 : 0, senderName, content, mediaType || 'text', isBotReply ? 1 : 0]
      );
    }

    // Atualizar last_message na conversa
    if (pool.query) {
      await pool.query(
        `UPDATE whatsapp_conversations SET last_message = $1, last_message_at = CURRENT_TIMESTAMP, 
         unread_count = CASE WHEN $2 THEN unread_count ELSE unread_count + 1 END,
         updated_at = CURRENT_TIMESTAMP WHERE jid = $3`,
        [content?.substring(0, 200), fromMe, jid]
      );
    } else {
      await pool.run(
        `UPDATE whatsapp_conversations SET last_message = ?, last_message_at = CURRENT_TIMESTAMP, 
         unread_count = CASE WHEN ? THEN unread_count ELSE unread_count + 1 END,
         updated_at = CURRENT_TIMESTAMP WHERE jid = ?`,
        [content?.substring(0, 200), fromMe ? 1 : 0, jid]
      );
    }
  } catch (e) {
    log(`⚠️ [MaxxChat] Erro ao persistir mensagem: ${e.message}`);
  }
}

// ─── Helper: Broadcast via Socket.IO ─────────────────────────────────────────
function broadcastMessage(jid, messageData) {
  const io = global.__maxxchat_io;
  if (io) {
    io.to(`chat_${jid}`).emit('new_message', messageData);
    io.emit('conversation_updated', { jid, ...messageData });
  }
}

// ─── Iniciar cliente ─────────────────────────────────────────────────────────
async function initClient() {
  if (sock && currentStatus === 'connected') return;

  currentStatus = 'loading';
  currentQR     = null;
  log('🤖 [Baileys] Iniciando conexão WhatsApp...');

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

    const { state, saveCreds } = await useMultiFileAuthState(SESSION_PATH);
    const { version }          = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys : makeCacheableSignalKeyStore(state.keys, logger)
      },
      printQRInTerminal: false,
      browser          : Browsers.macOS('Chrome'),
      logger
    });

    sock.ev.on('creds.update', saveCreds);

    // ─── MaxxChat: Intercepção Universal de Mensagens ─────────────────────────
    sock.ev.on('messages.upsert', async (m) => {
      const msg = m.messages[0];
      if (!msg.message) return;

      const remoteJid = msg.key.remoteJid;
      const fromMe = msg.key.fromMe;
      const pushName = msg.pushName || '';
      const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
      const messageId = msg.key.id;

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
              { logger: sock.logger, reuploadRequest: sock.updateMediaMessage }
            );
            
            const mediaDir = path.join(__dirname, '../../public/media');
            if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true });
            
            const ext = mediaType === 'image' ? 'jpg' : mediaType === 'video' ? 'mp4' : 'ogg';
            const fileName = `whatsapp_${messageId}.${ext}`;
            const filePath = path.join(mediaDir, fileName);
            fs.writeFileSync(filePath, buffer);
            
            contentUrl = `/media/${fileName}`;
          }
        }
      } catch (err) {
        log(`Erro ao baixar mídia: ${err.message}`);
      }

      const content = text || contentUrl || (mediaType !== 'text' ? `[${mediaType.toUpperCase()}]` : '');
      if (!content) return;

      // 1. Garantir conversa existe
      const conversation = await ensureConversation(remoteJid, pushName);
      if (!conversation.id) return;

      // 2. Persistir mensagem no banco
      await persistMessage(conversation.id, remoteJid, messageId, fromMe, pushName, content, mediaType, false);

      // 3. Broadcast via Socket.IO para o frontend
      broadcastMessage(remoteJid, {
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

      log(`📩 [MaxxChat] Msg de ${pushName || remoteJid}: "${content}"`);

      // 5. Verificar se o bot está ativo para esta conversa
      if (!conversation.bot_active) {
        log(`🚫 [MaxxChat] Bot desativado para ${remoteJid} — atendimento humano`);
        return;
      }

      // ─── Chatbot Logic (MaxxFlow) — PRESERVADO 100% ─────────────────────
      try {
        // A. Buscar sessão ativa para este contato
        let sessionRes;
        if (pool.query) {
           sessionRes = await pool.query('SELECT * FROM whatsapp_chatbot_sessions WHERE contact_id = $1', [remoteJid]);
        } else {
           sessionRes = { rows: await pool.all('SELECT * FROM whatsapp_chatbot_sessions WHERE contact_id = ?', [remoteJid]) };
        }
        
        let session = sessionRes.rows[0];
        let flowId = session?.flow_id;
        let currentNodeId = session?.current_node_id;

        // B. Se não houver sessão ativa, buscar o fluxo padrão
        if (!session) {
          let flowRes;
          if (pool.query) {
            flowRes = await pool.query('SELECT * FROM whatsapp_flows WHERE is_active = true ORDER BY is_default DESC LIMIT 1');
          } else {
            flowRes = { rows: await pool.all('SELECT * FROM whatsapp_flows WHERE is_active = true ORDER BY is_default DESC LIMIT 1') };
          }
          
          if (flowRes.rows.length === 0) return; // Nenhum fluxo ativo
          
          const flow = flowRes.rows[0];
          flowId = flow.id;
          const flowContent = typeof flow.content === 'string' ? JSON.parse(flow.content) : flow.content;
          const firstNode = flowContent.nodes[0];
          
          if (!firstNode) return;

          // Iniciar sessão
          if (pool.query) {
            await pool.query('INSERT INTO whatsapp_chatbot_sessions (contact_id, flow_id, current_node_id) VALUES ($1, $2, $3)', [remoteJid, flowId, firstNode.id]);
          } else {
            await pool.run('INSERT INTO whatsapp_chatbot_sessions (contact_id, flow_id, current_node_id) VALUES (?, ?, ?)', [remoteJid, flowId, firstNode.id]);
          }
          
          // Enviar primeira mensagem e persistir como bot
          await sock.sendMessage(remoteJid, { text: firstNode.content });
          await persistMessage(conversation.id, remoteJid, `bot_${Date.now()}`, true, 'Maxx Bot', firstNode.content, 'text', true);
          broadcastMessage(remoteJid, {
            id: `bot_${Date.now()}`, conversation_id: conversation.id, jid: remoteJid,
            from_me: true, sender_name: 'Maxx Bot', content: firstNode.content,
            media_type: 'text', is_bot_reply: true, created_at: new Date().toISOString()
          });

          log(`🤖 [Chatbot] Iniciando fluxo "${flow.name}" para ${remoteJid}`);
          return;
        }

        // C. Processar nó atual se houver sessão
        const flowRes = pool.query 
          ? await pool.query('SELECT * FROM whatsapp_flows WHERE id = $1', [flowId])
          : { rows: await pool.all('SELECT * FROM whatsapp_flows WHERE id = ?', [flowId]) };
          
        if (flowRes.rows.length === 0) return;
        const flow = flowRes.rows[0];
        const flowContent = typeof flow.content === 'string' ? JSON.parse(flow.content) : flow.content;
        const nodes = flowContent.nodes;
        const currentNode = nodes.find(n => n.id === currentNodeId);
        
        if (!currentNode) return;

        // Lógica de desvio baseada no tipo do nó
        const sendBotReply = async (replyText, nextNodeId) => {
          await sock.sendMessage(remoteJid, { text: replyText });
          const botMsgId = `bot_${Date.now()}`;
          await persistMessage(conversation.id, remoteJid, botMsgId, true, 'Maxx Bot', replyText, 'text', true);
          broadcastMessage(remoteJid, {
            id: botMsgId, conversation_id: conversation.id, jid: remoteJid,
            from_me: true, sender_name: 'Maxx Bot', content: replyText,
            media_type: 'text', is_bot_reply: true, created_at: new Date().toISOString()
          });
          if (nextNodeId) {
            if (pool.query) {
              await pool.query('UPDATE whatsapp_chatbot_sessions SET current_node_id = $1, updated_at = CURRENT_TIMESTAMP WHERE contact_id = $2', [nextNodeId, remoteJid]);
            } else {
              await pool.run('UPDATE whatsapp_chatbot_sessions SET current_node_id = ?, updated_at = CURRENT_TIMESTAMP WHERE contact_id = ?', [nextNodeId, remoteJid]);
            }
          }
        };

        if (currentNode.type === 'choice') {
          const match = engine.findBestMatch(text, currentNode.options);
          if (match) {
            const nextNodeId = currentNode.options[match.index].next_node_id;
            const nextNode = nodes.find(n => n.id === nextNodeId);
            if (nextNode) {
              await sendBotReply(nextNode.content, nextNodeId);
            }
          } else {
            await sendBotReply(`Desculpe, não entendi. Escolha uma das opções:\n${currentNode.options.map((o,i) => `${i+1}. ${o.text}`).join('\n')}`, null);
          }
        } else {
           // Se for apenas uma sequência de mensagens, pula para o próximo se houver
           if (currentNode.next_node_id) {
              const nextNode = nodes.find(n => n.id === currentNode.next_node_id);
              if (nextNode) {
                await sendBotReply(nextNode.content, nextNode.id);
              }
           }
        }
      } catch (e) {
        log(`❌ [Chatbot] Erro ao processar: ${e.message}`);
      }
    });

    // ─── MaxxChat: Sincronização de Histórico (Contatos antigos) ────────────────
    sock.ev.on('messaging-history.set', async ({ chats, contacts, messages, isLatest }) => {
      log(`📦 [MaxxChat] Sincronizando histórico do aparelho: ${chats.length} conversas, ${messages.length} mensagens`);
      try {
        // Restaurar conversas primeiro
        for (const chat of chats) {
          await ensureConversation(chat.id, chat.name || chat.verifiedName || '');
        }

        // Restaurar histórico de mensagens recente
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
          if (!content && mediaType !== 'text') content = `[${mediaType.toUpperCase()}]`; // Mensagens históricas não vamos baixar tudo para não sobrecarregar
          if (!content) continue;

          const conversation = await ensureConversation(remoteJid, pushName);
          await persistMessage(conversation.id, remoteJid, m.key.id, fromMe, pushName, content, mediaType, false);
        }
        log(`✅ [MaxxChat] Histórico sincronizado com sucesso!`);
      } catch (err) {
        log(`❌ [MaxxChat] Erro na sincronização de histórico: ${err.message}`);
      }
    });

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        log('📱 [Baileys] QR Code gerado.');
        currentStatus = 'disconnected';
        currentQR     = await qrcode.toDataURL(qr)
          .then(url => url.replace('data:image/png;base64,', ''));
      }

      if (connection === 'open') {
        log('✅ [Baileys] WhatsApp conectado!');
        currentStatus = 'connected';
        currentQR     = null;
      }

      if (connection === 'close') {
        const boom = lastDisconnect?.error;
        const statusCode = boom?.output?.statusCode || boom?.statusCode;
        const shouldReconnect = statusCode !== 401;

        log(`❌ [Baileys] Desconectado. Código: ${statusCode}`);
        currentStatus = 'disconnected';
        sock = null;

        if (statusCode === 515) {
          log('🔄 [Baileys] Reinício solicitado (515). Conectando...');
          initClient();
        } else if (shouldReconnect) {
          log('🔄 [Baileys] Reconectando em 5s...');
          setTimeout(() => initClient(), 5000);
        } else {
          log('🛑 [Baileys] Logout detectado.');
          destroyClient();
        }
      }
    });

  } catch (err) {
    log(`❌ [Baileys] Erro no init: ${err.message}`);
    currentStatus = 'disconnected';
    sock          = null;
  }
}

// ─── Desconectar e apagar sessão ─────────────────────────────────────────────
async function destroyClient() {
  try {
    if (sock) await sock.logout();
  } catch (_) {}

  sock          = null;
  currentStatus = 'disconnected';
  currentQR     = null;

  // Remove sessão salva para forçar novo QR Code
  if (fs.existsSync(SESSION_PATH)) {
    fs.rmSync(SESSION_PATH, { recursive: true, force: true });
    console.log('🗑️ [Baileys] Sessão apagada do disco.');
  }
  console.log('🛑 [Baileys] Desconectado.');
}

// ─── Listar grupos ────────────────────────────────────────────────────────────
async function getGroups() {
  if (!sock || currentStatus !== 'connected') return [];
  try {
    const groups = await sock.groupFetchAllParticipating();
    return Object.values(groups).map(g => ({
      id  : g.id,
      name: g.subject
    }));
  } catch (e) {
    console.error('[Baileys] Erro ao buscar grupos:', e.message);
    return [];
  }
}

// ─── Enviar mensagem ──────────────────────────────────────────────────────────
async function sendMessage(groupId, message) {
  if (!sock || currentStatus !== 'connected') {
    throw new Error('WhatsApp não conectado');
  }
  const jid = groupId.includes('@g.us') ? groupId : `${groupId}@g.us`;
  await sock.sendMessage(jid, { text: message });
}

// ─── Auto-inicialização ao carregar o módulo ─────────────────────────────────
// Se já existir uma sessão salva, tenta conectar automaticamente no boot.
(async () => {
  if (fs.existsSync(path.join(SESSION_PATH, 'creds.json'))) {
    console.log('📦 [Baileys] Sessão encontrada. Restaurando conexão automaticamente...');
    await initClient();
  }
})();

module.exports = { initClient, destroyClient, getGroups, sendMessage, getStatus, getSock };
