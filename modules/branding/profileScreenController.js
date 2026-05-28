const pool = require('../../config/database');
const { uploadToSupabase } = require('../../services/supabaseStorage');
const path = require('path');
const fs = require('fs');

// ============================================================
// Profile Screen Controller — CRUD de Backgrounds + Config
// Segue: Backend_Rules.md (CommonJS, parameterized queries)
// ============================================================

const MAX_BACKGROUNDS = 20;

// GET /api/branding/profile-screen
// Retorna config + lista de imagens ativas
exports.getConfig = async (req, res) => {
  try {
    const configResult = await pool.query(
      'SELECT * FROM profile_screen_config WHERE id = 1'
    );
    const bgResult = await pool.query(
      'SELECT * FROM profile_backgrounds ORDER BY ordem ASC, id ASC'
    );

    const config = configResult.rows[0] || {
      slide_interval_ms: 5000,
      use_tmdb: true,
      tmdb_position: 'mixed',
      max_backgrounds: MAX_BACKGROUNDS
    };

    // Buscar URL do App dinamicamente das configurações globais
    try {
      const globalRes = await pool.query("SELECT value FROM global_settings WHERE key = 'player_app_url'");
      if (globalRes.rows.length > 0) {
        let appUrl = globalRes.rows[0].value;
        // O valor é armazenado como JSONB. Se for uma string simples, removemos as aspas
        config.app_url = typeof appUrl === 'string' ? appUrl.replace(/^"(.*)"$/, '$1') : appUrl;
      }
    } catch (e) {
      console.warn('⚠️ Erro ao buscar player_app_url global:', e.message);
    }

    res.json({
      config,
      backgrounds: bgResult.rows
    });
  } catch (error) {
    console.error('Erro ao obter profile-screen config:', error);
    res.status(500).json({ error: 'Erro ao obter configuração da tela de perfis' });
  }
};

// PUT /api/branding/profile-screen/config
// Atualiza configuração do slideshow
exports.updateConfig = async (req, res) => {
  const { slide_interval_ms, use_tmdb, tmdb_position } = req.body;

  try {
    await pool.query(
      `INSERT INTO profile_screen_config (id, slide_interval_ms, use_tmdb, tmdb_position, atualizado_em)
       VALUES (1, $1, $2, $3, NOW())
       ON CONFLICT (id) DO UPDATE SET
         slide_interval_ms = COALESCE($1, profile_screen_config.slide_interval_ms),
         use_tmdb = COALESCE($2, profile_screen_config.use_tmdb),
         tmdb_position = COALESCE($3, profile_screen_config.tmdb_position),
         atualizado_em = NOW()`,
      [slide_interval_ms, use_tmdb, tmdb_position]
    );

    res.json({ message: 'Configuração atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar profile-screen config:', error);
    res.status(500).json({ error: 'Erro ao atualizar configuração' });
  }
};

// POST /api/branding/profile-screen/upload
// Adiciona nova imagem de fundo (multer envia o arquivo)
exports.addBackground = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    // Verificar limite de 20 imagens
    const countResult = await pool.query('SELECT COUNT(*) FROM profile_backgrounds');
    const count = parseInt(countResult.rows[0].count);

    if (count >= MAX_BACKGROUNDS) {
      return res.status(400).json({ 
        error: `Limite de ${MAX_BACKGROUNDS} imagens atingido. Remova uma antes de adicionar.` 
      });
    }

    const title = req.body.title || '';
    const imageUrl = await uploadToSupabase(req.file, 'profile-backgrounds');

    // Pegar a próxima ordem
    const orderResult = await pool.query('SELECT COALESCE(MAX(ordem), 0) + 1 as next_order FROM profile_backgrounds');
    const nextOrder = orderResult.rows[0].next_order;

    const result = await pool.query(
      `INSERT INTO profile_backgrounds (image_url, title, ordem, ativo)
       VALUES ($1, $2, $3, TRUE) RETURNING *`,
      [imageUrl, title, nextOrder]
    );

    res.status(201).json({
      message: 'Imagem adicionada com sucesso!',
      background: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao adicionar background:', error);
    res.status(500).json({ error: 'Erro ao adicionar imagem de fundo' });
  }
};

// DELETE /api/branding/profile-screen/:id
// Remove imagem por ID
exports.removeBackground = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar a URL para deletar o arquivo
    const bgResult = await pool.query('SELECT image_url FROM profile_backgrounds WHERE id = $1', [id]);
    
    if (bgResult.rows.length === 0) {
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }

    // (Opcional) Poderíamos deletar a imagem do Supabase aqui, mas manteremos no bucket por precaução
    // ou implementar a exclusão via API do Supabase futuramente.

    await pool.query('DELETE FROM profile_backgrounds WHERE id = $1', [id]);

    res.json({ message: 'Imagem removida com sucesso!' });
  } catch (error) {
    console.error('Erro ao remover background:', error);
    res.status(500).json({ error: 'Erro ao remover imagem de fundo' });
  }
};

// PATCH /api/branding/profile-screen/:id/toggle
// Ativa/desativa imagem
exports.toggleBackground = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE profile_backgrounds SET ativo = NOT ativo WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }

    res.json({ 
      message: result.rows[0].ativo ? 'Imagem ativada!' : 'Imagem desativada!',
      background: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao toggle background:', error);
    res.status(500).json({ error: 'Erro ao alternar status da imagem' });
  }
};

// PUT /api/branding/profile-screen/reorder
// Reordena as imagens (recebe array de { id, ordem })
exports.reorderBackgrounds = async (req, res) => {
  const { items } = req.body; // [{ id: 1, ordem: 0 }, { id: 3, ordem: 1 }, ...]

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Campo "items" deve ser um array' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const item of items) {
      await client.query(
        'UPDATE profile_backgrounds SET ordem = $1 WHERE id = $2',
        [item.ordem, item.id]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Ordem atualizada com sucesso!' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao reordenar backgrounds:', error);
    res.status(500).json({ error: 'Erro ao reordenar imagens' });
  } finally {
    client.release();
  }
};
