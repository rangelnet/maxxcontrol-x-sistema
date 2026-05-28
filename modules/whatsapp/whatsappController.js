const pool = require('../../config/database');
const wa   = require('./whatsappClient');

// Helper: Extrai userId do req.user (authMiddleware garante que existe)
function getUserId(req) {
  return req.user?.id || 1; // fallback para admin se não houver auth
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAXFLOW (CHATBOT) — ISOLADO POR owner_id
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/whatsapp/flows
exports.getFlows = async (req, res) => {
  try {
    const userId = getUserId(req);
    const result = pool.query 
      ? await pool.query('SELECT * FROM whatsapp_flows WHERE owner_id = $1 ORDER BY created_at DESC', [userId])
      : { rows: await pool.all('SELECT * FROM whatsapp_flows WHERE owner_id = ? ORDER BY created_at DESC', [userId]) };
    res.json({ flows: result.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /api/whatsapp/flows
exports.saveFlow = async (req, res) => {
  const userId = getUserId(req);
  const { id, name, content, is_default } = req.body;
  try {
    if (id) {
      if (pool.query) {
        await pool.query('UPDATE whatsapp_flows SET name = $1, content = $2, is_default = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND owner_id = $5', [name, content, is_default, id, userId]);
      } else {
        await pool.run('UPDATE whatsapp_flows SET name = ?, content = ?, is_default = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND owner_id = ?', [name, content, is_default, id, userId]);
      }
    } else {
      if (pool.query) {
        await pool.query('INSERT INTO whatsapp_flows (name, content, is_default, owner_id) VALUES ($1, $2, $3, $4)', [name, content, is_default, userId]);
      } else {
        await pool.run('INSERT INTO whatsapp_flows (name, content, is_default, owner_id) VALUES (?, ?, ?, ?)', [name, content, is_default, userId]);
      }
    }
    res.json({ message: 'Fluxo salvo com sucesso!' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /api/whatsapp/flows/:id/activate
exports.activateFlow = async (req, res) => {
  const userId = getUserId(req);
  const { id } = req.params;
  try {
    if (pool.query) {
      await pool.query('UPDATE whatsapp_flows SET is_active = false WHERE owner_id = $1', [userId]);
      await pool.query('UPDATE whatsapp_flows SET is_active = true WHERE id = $1 AND owner_id = $2', [id, userId]);
    } else {
      await pool.run('UPDATE whatsapp_flows SET is_active = 0 WHERE owner_id = ?', [userId]);
      await pool.run('UPDATE whatsapp_flows SET is_active = 1 WHERE id = ? AND owner_id = ?', [id, userId]);
    }
    res.json({ message: 'Fluxo ativado com sucesso!' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// DELETE /api/whatsapp/flows/:id
exports.deleteFlow = async (req, res) => {
  const userId = getUserId(req);
  const { id } = req.params;
  try {
    if (pool.query) {
      await pool.query('DELETE FROM whatsapp_flows WHERE id = $1 AND owner_id = $2', [id, userId]);
    } else {
      await pool.run('DELETE FROM whatsapp_flows WHERE id = ? AND owner_id = ?', [id, userId]);
    }
    res.json({ message: 'Fluxo removido com sucesso!' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// WHATSAPP BASE — ISOLADO POR userId
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/whatsapp/status
exports.getStatus = async (req, res) => {
  try {
    const userId = getUserId(req);
    res.json(wa.getStatus(userId));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /api/whatsapp/connect
exports.connect = async (req, res) => {
  try {
    const userId = getUserId(req);
    await wa.initClient(userId);
    res.json({ message: 'Iniciando conexão...' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /api/whatsapp/disconnect
exports.disconnect = async (req, res) => {
  try {
    const userId = getUserId(req);
    await wa.destroyClient(userId);
    res.json({ message: 'Desconectado com sucesso.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /api/whatsapp/groups
exports.getGroups = async (req, res) => {
  try {
    const userId = getUserId(req);
    const groups = await wa.getGroups(userId);
    res.json({ groups });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /api/whatsapp/send
exports.sendMessage = async (req, res) => {
  const { group_id, message } = req.body;
  if (!group_id || !message) {
    return res.status(400).json({ error: 'group_id e message são obrigatórios.' });
  }
  try {
    const userId = getUserId(req);
    await wa.sendMessage(userId, group_id, message);
    res.json({ message: 'Mensagem enviada com sucesso!' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAXXCHAT — LIVE CHAT ENTERPRISE (ISOLADO POR owner_id)
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/whatsapp/chat/profile-pic/:jid
exports.getProfilePic = async (req, res) => {
  try {
    const userId = getUserId(req);
    const sock = wa.getSock(userId);
    if (!sock) return res.status(503).json({ error: 'WhatsApp desconectado' });
    
    const url = await sock.profilePictureUrl(req.params.jid, 'image');
    res.json({ url });
  } catch (e) {
    res.json({ url: null });
  }
};

// GET /api/whatsapp/chat/conversations
exports.getConversations = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { status, label_id, search } = req.query;
    let sql = 'SELECT c.*, l.name as label_name, l.color as label_color FROM whatsapp_conversations c LEFT JOIN whatsapp_labels l ON c.label_id = l.id';
    const conditions = [];
    const params = [];
    let paramIdx = 1;

    // Filtro obrigatório por owner_id
    conditions.push(pool.query ? `c.owner_id = $${paramIdx++}` : `c.owner_id = ?`);
    params.push(userId);

    if (status && status !== 'all') {
      conditions.push(pool.query ? `c.status = $${paramIdx++}` : `c.status = ?`);
      params.push(status);
    }
    if (label_id) {
      conditions.push(pool.query ? `c.label_id = $${paramIdx++}` : `c.label_id = ?`);
      params.push(label_id);
    }
    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(pool.query 
        ? `(c.name ILIKE $${paramIdx} OR c.phone ILIKE $${paramIdx} OR c.last_message ILIKE $${paramIdx++})`
        : `(c.name LIKE ? OR c.phone LIKE ? OR c.last_message LIKE ?)`
      );
      if (pool.query) {
        params.push(searchTerm);
      } else {
        params.push(searchTerm, searchTerm, searchTerm);
      }
    }

    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC LIMIT 100';

    const result = pool.query 
      ? await pool.query(sql, params)
      : { rows: await pool.all(sql, params) };
    
    res.json({ conversations: result.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /api/whatsapp/chat/conversations/:jid/messages
exports.getMessages = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { jid } = req.params;
    const { before, limit } = req.query;
    const lim = Math.min(parseInt(limit) || 100, 300);

    let sql, params;
    if (before) {
      sql = pool.query
        ? 'SELECT * FROM whatsapp_messages WHERE jid = $1 AND owner_id = $2 AND id < $3 ORDER BY created_at DESC LIMIT $4'
        : 'SELECT * FROM whatsapp_messages WHERE jid = ? AND owner_id = ? AND id < ? ORDER BY created_at DESC LIMIT ?';
      params = [jid, userId, parseInt(before), lim];
    } else {
      sql = pool.query
        ? 'SELECT * FROM whatsapp_messages WHERE jid = $1 AND owner_id = $2 ORDER BY created_at DESC LIMIT $3'
        : 'SELECT * FROM whatsapp_messages WHERE jid = ? AND owner_id = ? ORDER BY created_at DESC LIMIT ?';
      params = [jid, userId, lim];
    }

    const result = pool.query 
      ? await pool.query(sql, params)
      : { rows: await pool.all(sql, params) };

    // Marcar como lido
    if (pool.query) {
      await pool.query('UPDATE whatsapp_conversations SET unread_count = 0 WHERE jid = $1 AND owner_id = $2', [jid, userId]);
    } else {
      await pool.run('UPDATE whatsapp_conversations SET unread_count = 0 WHERE jid = ? AND owner_id = ?', [jid, userId]);
    }

    // Emitir evento de leitura para a sala do usuário
    const io = global.__maxxchat_io;
    if (io) io.to(`user_${userId}`).emit('conversation_updated', { jid, unread_count: 0 });

    res.json({ messages: result.rows.reverse() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /api/whatsapp/chat/send — Enviar mensagem manual pelo painel
exports.chatSend = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { jid, message } = req.body;
    if (!jid || !message) return res.status(400).json({ error: 'jid e message obrigatórios' });

    const sock = wa.getSock(userId);
    if (!sock) return res.status(503).json({ error: 'WhatsApp não conectado' });

    const sent = await sock.sendMessage(jid, { text: message });
    const messageId = sent?.key?.id || `manual_${Date.now()}`;

    // Persistir no banco
    let convRes;
    if (pool.query) {
      convRes = await pool.query('SELECT id FROM whatsapp_conversations WHERE jid = $1 AND owner_id = $2', [jid, userId]);
    } else {
      convRes = { rows: await pool.all('SELECT id FROM whatsapp_conversations WHERE jid = ? AND owner_id = ?', [jid, userId]) };
    }
    const convId = convRes.rows[0]?.id;

    if (convId) {
      if (pool.query) {
        await pool.query(
          `INSERT INTO whatsapp_messages (conversation_id, owner_id, jid, message_id, from_me, sender_name, content, media_type, is_bot_reply) 
           VALUES ($1, $2, $3, $4, true, 'Atendente', $5, 'text', false) ON CONFLICT (message_id, owner_id) DO NOTHING`,
          [convId, userId, jid, messageId, message]
        );
        await pool.query(
          `UPDATE whatsapp_conversations SET last_message = $1, last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE jid = $2 AND owner_id = $3`,
          [message.substring(0, 200), jid, userId]
        );
      } else {
        await pool.run(
          `INSERT OR IGNORE INTO whatsapp_messages (conversation_id, owner_id, jid, message_id, from_me, sender_name, content, media_type, is_bot_reply) 
           VALUES (?, ?, ?, ?, 1, 'Atendente', ?, 'text', 0)`,
          [convId, userId, jid, messageId, message]
        );
        await pool.run(
          `UPDATE whatsapp_conversations SET last_message = ?, last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE jid = ? AND owner_id = ?`,
          [message.substring(0, 200), jid, userId]
        );
      }
    }

    // Broadcast para a sala do usuário
    const io = global.__maxxchat_io;
    if (io) {
      const msgData = {
        id: messageId, conversation_id: convId, jid, from_me: true,
        sender_name: 'Atendente', content: message,
        media_type: 'text', is_bot_reply: false, created_at: new Date().toISOString()
      };
      io.to(`user_${userId}`).emit('new_message', msgData);
      io.to(`user_${userId}`).emit('conversation_updated', { jid, last_message: message.substring(0, 200) });
    }

    res.json({ message: 'Enviado!', message_id: messageId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// PUT /api/whatsapp/chat/conversations/:jid/status
exports.updateConversationStatus = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { jid } = req.params;
    const { status } = req.body;
    if (pool.query) {
      await pool.query('UPDATE whatsapp_conversations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE jid = $2 AND owner_id = $3', [status, jid, userId]);
    } else {
      await pool.run('UPDATE whatsapp_conversations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE jid = ? AND owner_id = ?', [status, jid, userId]);
    }
    res.json({ message: 'Status atualizado' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// PUT /api/whatsapp/chat/conversations/:jid/label
exports.updateConversationLabel = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { jid } = req.params;
    const { label_id } = req.body;
    if (pool.query) {
      await pool.query('UPDATE whatsapp_conversations SET label_id = $1, updated_at = CURRENT_TIMESTAMP WHERE jid = $2 AND owner_id = $3', [label_id || null, jid, userId]);
    } else {
      await pool.run('UPDATE whatsapp_conversations SET label_id = ?, updated_at = CURRENT_TIMESTAMP WHERE jid = ? AND owner_id = ?', [label_id || null, jid, userId]);
    }
    res.json({ message: 'Etiqueta atualizada' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// PUT /api/whatsapp/chat/conversations/:jid/bot
exports.toggleBot = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { jid } = req.params;
    const { bot_active } = req.body;
    if (pool.query) {
      await pool.query('UPDATE whatsapp_conversations SET bot_active = $1, updated_at = CURRENT_TIMESTAMP WHERE jid = $2 AND owner_id = $3', [bot_active, jid, userId]);
    } else {
      await pool.run('UPDATE whatsapp_conversations SET bot_active = ?, updated_at = CURRENT_TIMESTAMP WHERE jid = ? AND owner_id = ?', [bot_active ? 1 : 0, jid, userId]);
    }
    res.json({ message: bot_active ? 'Bot ativado' : 'Bot desativado — atendimento humano' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// PUT /api/whatsapp/chat/conversations/:jid/notes
exports.updateNotes = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { jid } = req.params;
    const { notes } = req.body;
    if (pool.query) {
      await pool.query('UPDATE whatsapp_conversations SET notes = $1, updated_at = CURRENT_TIMESTAMP WHERE jid = $2 AND owner_id = $3', [notes, jid, userId]);
    } else {
      await pool.run('UPDATE whatsapp_conversations SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE jid = ? AND owner_id = ?', [notes, jid, userId]);
    }
    res.json({ message: 'Notas salvas' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /api/whatsapp/chat/labels
exports.getLabels = async (req, res) => {
  try {
    const userId = getUserId(req);
    const result = pool.query
      ? await pool.query('SELECT * FROM whatsapp_labels WHERE owner_id = $1 ORDER BY id', [userId])
      : { rows: await pool.all('SELECT * FROM whatsapp_labels WHERE owner_id = ? ORDER BY id', [userId]) };
    res.json({ labels: result.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /api/whatsapp/chat/labels
exports.saveLabel = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id, name, color } = req.body;
    if (id) {
      if (pool.query) {
        await pool.query('UPDATE whatsapp_labels SET name = $1, color = $2 WHERE id = $3 AND owner_id = $4', [name, color, id, userId]);
      } else {
        await pool.run('UPDATE whatsapp_labels SET name = ?, color = ? WHERE id = ? AND owner_id = ?', [name, color, id, userId]);
      }
    } else {
      if (pool.query) {
        await pool.query('INSERT INTO whatsapp_labels (name, color, owner_id) VALUES ($1, $2, $3)', [name, color, userId]);
      } else {
        await pool.run('INSERT INTO whatsapp_labels (name, color, owner_id) VALUES (?, ?, ?)', [name, color, userId]);
      }
    }
    res.json({ message: 'Etiqueta salva' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /api/whatsapp/chat/quick-replies
exports.getQuickReplies = async (req, res) => {
  try {
    const userId = getUserId(req);
    const result = pool.query
      ? await pool.query('SELECT * FROM whatsapp_quick_replies WHERE owner_id = $1 ORDER BY shortcut', [userId])
      : { rows: await pool.all('SELECT * FROM whatsapp_quick_replies WHERE owner_id = ? ORDER BY shortcut', [userId]) };
    res.json({ quickReplies: result.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /api/whatsapp/chat/quick-replies
exports.saveQuickReply = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id, shortcut, content } = req.body;
    if (id) {
      if (pool.query) {
        await pool.query('UPDATE whatsapp_quick_replies SET shortcut = $1, content = $2 WHERE id = $3 AND owner_id = $4', [shortcut, content, id, userId]);
      } else {
        await pool.run('UPDATE whatsapp_quick_replies SET shortcut = ?, content = ? WHERE id = ? AND owner_id = ?', [shortcut, content, id, userId]);
      }
    } else {
      if (pool.query) {
        await pool.query('INSERT INTO whatsapp_quick_replies (shortcut, content, owner_id) VALUES ($1, $2, $3)', [shortcut, content, userId]);
      } else {
        await pool.run('INSERT INTO whatsapp_quick_replies (shortcut, content, owner_id) VALUES (?, ?, ?)', [shortcut, content, userId]);
      }
    }
    res.json({ message: 'Resposta rápida salva' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// DELETE /api/whatsapp/chat/quick-replies/:id
exports.deleteQuickReply = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    if (pool.query) {
      await pool.query('DELETE FROM whatsapp_quick_replies WHERE id = $1 AND owner_id = $2', [id, userId]);
    } else {
      await pool.run('DELETE FROM whatsapp_quick_replies WHERE id = ? AND owner_id = ?', [id, userId]);
    }
    res.json({ message: 'Resposta rápida removida' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
