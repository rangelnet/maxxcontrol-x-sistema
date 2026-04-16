const pool = require('../../config/database');
const wa   = require('./whatsappClient');

// ═══════════════════════════════════════════════════════════════════════════════
// MAXFLOW (CHATBOT) — PRESERVADO 100%
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/whatsapp/flows
exports.getFlows = async (req, res) => {
  try {
    const result = pool.query 
      ? await pool.query('SELECT * FROM whatsapp_flows ORDER BY created_at DESC')
      : { rows: await pool.all('SELECT * FROM whatsapp_flows ORDER BY created_at DESC') };
    res.json({ flows: result.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /api/whatsapp/flows
exports.saveFlow = async (req, res) => {
  const { id, name, content, is_default } = req.body;
  try {
    if (id) {
      if (pool.query) {
        await pool.query('UPDATE whatsapp_flows SET name = $1, content = $2, is_default = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4', [name, content, is_default, id]);
      } else {
        await pool.run('UPDATE whatsapp_flows SET name = ?, content = ?, is_default = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [name, content, is_default, id]);
      }
    } else {
      if (pool.query) {
        await pool.query('INSERT INTO whatsapp_flows (name, content, is_default) VALUES ($1, $2, $3)', [name, content, is_default]);
      } else {
        await pool.run('INSERT INTO whatsapp_flows (name, content, is_default) VALUES (?, ?, ?)', [name, content, is_default]);
      }
    }
    res.json({ message: 'Fluxo salvo com sucesso!' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /api/whatsapp/flows/:id/activate
exports.activateFlow = async (req, res) => {
  const { id } = req.params;
  try {
    if (pool.query) {
      await pool.query('UPDATE whatsapp_flows SET is_active = false');
      await pool.query('UPDATE whatsapp_flows SET is_active = true WHERE id = $1', [id]);
    } else {
      await pool.run('UPDATE whatsapp_flows SET is_active = 0');
      await pool.run('UPDATE whatsapp_flows SET is_active = 1 WHERE id = ?', [id]);
    }
    res.json({ message: 'Fluxo ativado com sucesso!' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// DELETE /api/whatsapp/flows/:id
exports.deleteFlow = async (req, res) => {
  const { id } = req.params;
  try {
    if (pool.query) {
      await pool.query('DELETE FROM whatsapp_flows WHERE id = $1', [id]);
    } else {
      await pool.run('DELETE FROM whatsapp_flows WHERE id = ?', [id]);
    }
    res.json({ message: 'Fluxo removido com sucesso!' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// WHATSAPP BASE — PRESERVADO 100%
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/whatsapp/status
exports.getStatus = async (req, res) => {
  try {
    res.json(wa.getStatus());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /api/whatsapp/connect
exports.connect = async (req, res) => {
  try {
    await wa.initClient();
    res.json({ message: 'Iniciando conexão...' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /api/whatsapp/disconnect
exports.disconnect = async (req, res) => {
  try {
    await wa.destroyClient();
    res.json({ message: 'Desconectado com sucesso.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /api/whatsapp/groups
exports.getGroups = async (req, res) => {
  try {
    const groups = await wa.getGroups();
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
    await wa.sendMessage(group_id, message);
    res.json({ message: 'Mensagem enviada com sucesso!' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAXXCHAT — LIVE CHAT ENTERPRISE (NOVO)
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/whatsapp/chat/profile-pic/:jid
exports.getProfilePic = async (req, res) => {
  try {
    const sock = wa.getSock();
    if (!sock) return res.status(503).json({ error: 'WhatsApp desconectado' });
    
    // Forçamos preview e type image
    const url = await sock.profilePictureUrl(req.params.jid, 'image');
    res.json({ url });
  } catch (e) {
    // É normal contatos não terem foto (privacidade ou ausência)
    res.json({ url: null });
  }
};

// GET /api/whatsapp/chat/conversations
exports.getConversations = async (req, res) => {
  try {
    const { status, label_id, search } = req.query;
    let sql = 'SELECT c.*, l.name as label_name, l.color as label_color FROM whatsapp_conversations c LEFT JOIN whatsapp_labels l ON c.label_id = l.id';
    const conditions = [];
    const params = [];
    let paramIdx = 1;

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
    const { jid } = req.params;
    const { before, limit } = req.query;
    const lim = Math.min(parseInt(limit) || 100, 300);

    let sql, params;
    if (before) {
      sql = pool.query
        ? 'SELECT * FROM whatsapp_messages WHERE jid = $1 AND id < $2 ORDER BY created_at DESC LIMIT $3'
        : 'SELECT * FROM whatsapp_messages WHERE jid = ? AND id < ? ORDER BY created_at DESC LIMIT ?';
      params = [jid, parseInt(before), lim];
    } else {
      sql = pool.query
        ? 'SELECT * FROM whatsapp_messages WHERE jid = $1 ORDER BY created_at DESC LIMIT $2'
        : 'SELECT * FROM whatsapp_messages WHERE jid = ? ORDER BY created_at DESC LIMIT ?';
      params = [jid, lim];
    }

    const result = pool.query 
      ? await pool.query(sql, params)
      : { rows: await pool.all(sql, params) };

    // Marcar como lido
    if (pool.query) {
      await pool.query('UPDATE whatsapp_conversations SET unread_count = 0 WHERE jid = $1', [jid]);
    } else {
      await pool.run('UPDATE whatsapp_conversations SET unread_count = 0 WHERE jid = ?', [jid]);
    }

    // Emitir evento de leitura
    const io = global.__maxxchat_io;
    if (io) io.emit('conversation_updated', { jid, unread_count: 0 });

    res.json({ messages: result.rows.reverse() }); // mais antigas primeiro
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /api/whatsapp/chat/send — Enviar mensagem manual pelo painel
exports.chatSend = async (req, res) => {
  try {
    const { jid, message } = req.body;
    if (!jid || !message) return res.status(400).json({ error: 'jid e message obrigatórios' });

    const sock = wa.getSock();
    if (!sock) return res.status(503).json({ error: 'WhatsApp não conectado' });

    const sent = await sock.sendMessage(jid, { text: message });
    const messageId = sent?.key?.id || `manual_${Date.now()}`;

    // Persistir no banco
    let convRes;
    if (pool.query) {
      convRes = await pool.query('SELECT id FROM whatsapp_conversations WHERE jid = $1', [jid]);
    } else {
      convRes = { rows: await pool.all('SELECT id FROM whatsapp_conversations WHERE jid = ?', [jid]) };
    }
    const convId = convRes.rows[0]?.id;

    if (convId) {
      if (pool.query) {
        await pool.query(
          `INSERT INTO whatsapp_messages (conversation_id, jid, message_id, from_me, sender_name, content, media_type, is_bot_reply) 
           VALUES ($1, $2, $3, true, 'Atendente', $4, 'text', false) ON CONFLICT (message_id) DO NOTHING`,
          [convId, jid, messageId, message]
        );
        await pool.query(
          `UPDATE whatsapp_conversations SET last_message = $1, last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE jid = $2`,
          [message.substring(0, 200), jid]
        );
      } else {
        await pool.run(
          `INSERT OR IGNORE INTO whatsapp_messages (conversation_id, jid, message_id, from_me, sender_name, content, media_type, is_bot_reply) 
           VALUES (?, ?, ?, 1, 'Atendente', ?, 'text', 0)`,
          [convId, jid, messageId, message]
        );
        await pool.run(
          `UPDATE whatsapp_conversations SET last_message = ?, last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE jid = ?`,
          [message.substring(0, 200), jid]
        );
      }
    }

    // Broadcast
    const io = global.__maxxchat_io;
    if (io) {
      const msgData = {
        id: messageId, conversation_id: convId, jid, from_me: true,
        sender_name: 'Atendente', content: message,
        media_type: 'text', is_bot_reply: false, created_at: new Date().toISOString()
      };
      io.to(`chat_${jid}`).emit('new_message', msgData);
      io.emit('conversation_updated', { jid, last_message: message.substring(0, 200) });
    }

    res.json({ message: 'Enviado!', message_id: messageId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// PUT /api/whatsapp/chat/conversations/:jid/status
exports.updateConversationStatus = async (req, res) => {
  try {
    const { jid } = req.params;
    const { status } = req.body; // open | resolved | pending
    if (pool.query) {
      await pool.query('UPDATE whatsapp_conversations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE jid = $2', [status, jid]);
    } else {
      await pool.run('UPDATE whatsapp_conversations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE jid = ?', [status, jid]);
    }
    res.json({ message: 'Status atualizado' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// PUT /api/whatsapp/chat/conversations/:jid/label
exports.updateConversationLabel = async (req, res) => {
  try {
    const { jid } = req.params;
    const { label_id } = req.body;
    if (pool.query) {
      await pool.query('UPDATE whatsapp_conversations SET label_id = $1, updated_at = CURRENT_TIMESTAMP WHERE jid = $2', [label_id || null, jid]);
    } else {
      await pool.run('UPDATE whatsapp_conversations SET label_id = ?, updated_at = CURRENT_TIMESTAMP WHERE jid = ?', [label_id || null, jid]);
    }
    res.json({ message: 'Etiqueta atualizada' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// PUT /api/whatsapp/chat/conversations/:jid/bot
exports.toggleBot = async (req, res) => {
  try {
    const { jid } = req.params;
    const { bot_active } = req.body;
    if (pool.query) {
      await pool.query('UPDATE whatsapp_conversations SET bot_active = $1, updated_at = CURRENT_TIMESTAMP WHERE jid = $2', [bot_active, jid]);
    } else {
      await pool.run('UPDATE whatsapp_conversations SET bot_active = ?, updated_at = CURRENT_TIMESTAMP WHERE jid = ?', [bot_active ? 1 : 0, jid]);
    }
    res.json({ message: bot_active ? 'Bot ativado' : 'Bot desativado — atendimento humano' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// PUT /api/whatsapp/chat/conversations/:jid/notes
exports.updateNotes = async (req, res) => {
  try {
    const { jid } = req.params;
    const { notes } = req.body;
    if (pool.query) {
      await pool.query('UPDATE whatsapp_conversations SET notes = $1, updated_at = CURRENT_TIMESTAMP WHERE jid = $2', [notes, jid]);
    } else {
      await pool.run('UPDATE whatsapp_conversations SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE jid = ?', [notes, jid]);
    }
    res.json({ message: 'Notas salvas' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// GET /api/whatsapp/chat/labels
exports.getLabels = async (req, res) => {
  try {
    const result = pool.query
      ? await pool.query('SELECT * FROM whatsapp_labels ORDER BY id')
      : { rows: await pool.all('SELECT * FROM whatsapp_labels ORDER BY id') };
    res.json({ labels: result.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /api/whatsapp/chat/labels
exports.saveLabel = async (req, res) => {
  try {
    const { id, name, color } = req.body;
    if (id) {
      if (pool.query) {
        await pool.query('UPDATE whatsapp_labels SET name = $1, color = $2 WHERE id = $3', [name, color, id]);
      } else {
        await pool.run('UPDATE whatsapp_labels SET name = ?, color = ? WHERE id = ?', [name, color, id]);
      }
    } else {
      if (pool.query) {
        await pool.query('INSERT INTO whatsapp_labels (name, color) VALUES ($1, $2)', [name, color]);
      } else {
        await pool.run('INSERT INTO whatsapp_labels (name, color) VALUES (?, ?)', [name, color]);
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
    const result = pool.query
      ? await pool.query('SELECT * FROM whatsapp_quick_replies ORDER BY shortcut')
      : { rows: await pool.all('SELECT * FROM whatsapp_quick_replies ORDER BY shortcut') };
    res.json({ quickReplies: result.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /api/whatsapp/chat/quick-replies
exports.saveQuickReply = async (req, res) => {
  try {
    const { id, shortcut, content } = req.body;
    if (id) {
      if (pool.query) {
        await pool.query('UPDATE whatsapp_quick_replies SET shortcut = $1, content = $2 WHERE id = $3', [shortcut, content, id]);
      } else {
        await pool.run('UPDATE whatsapp_quick_replies SET shortcut = ?, content = ? WHERE id = ?', [shortcut, content, id]);
      }
    } else {
      if (pool.query) {
        await pool.query('INSERT INTO whatsapp_quick_replies (shortcut, content) VALUES ($1, $2)', [shortcut, content]);
      } else {
        await pool.run('INSERT INTO whatsapp_quick_replies (shortcut, content) VALUES (?, ?)', [shortcut, content]);
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
    const { id } = req.params;
    if (pool.query) {
      await pool.query('DELETE FROM whatsapp_quick_replies WHERE id = $1', [id]);
    } else {
      await pool.run('DELETE FROM whatsapp_quick_replies WHERE id = ?', [id]);
    }
    res.json({ message: 'Resposta rápida removida' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
