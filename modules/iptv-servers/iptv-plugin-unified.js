/**
 * IPTV Plugin Unificado
 * Integra Plugin 2, 3 e 4 em um único plugin
 * Conecta com MaxxControl para gerenciar IPTV automaticamente
 * Sem SmartOne - Apenas para seu app TV MAXX PRO
 */

const express = require('express');
const router = express.Router();
const pool = require('../../config/database');
const axios = require('axios');

// ============================================
// GERENCIAR SERVIDORES IPTV
// ============================================

/**
 * POST /api/iptv-plugin/add-server
 * Adiciona novo servidor IPTV
 * Integração com Plugin 2 (SmartOne Manager)
 */
router.post('/add-server', async (req, res) => {
  try {
    const { 
      server_name, 
      xtream_url, 
      xtream_username, 
      xtream_password,
      server_type // 'ibopro', 'ibocast', 'vuplayer', 'custom'
    } = req.body;

    // Validar dados
    if (!server_name || !xtream_url) {
      return res.status(400).json({ error: 'Nome e URL do servidor são obrigatórios' });
    }

    // Inserir no banco
    const query = `
      INSERT INTO iptv_servers (
        server_name, 
        xtream_url, 
        xtream_username, 
        xtream_password,
        server_type,
        status,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, 'active', NOW())
      RETURNING *
    `;

    const result = await pool.query(query, [
      server_name,
      xtream_url,
      xtream_username,
      xtream_password,
      server_type || 'custom'
    ]);

    res.json({
      success: true,
      message: 'Servidor IPTV adicionado com sucesso',
      server: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Erro ao adicionar servidor:', error);
    res.status(500).json({ error: 'Erro ao adicionar servidor' });
  }
});

/**
 * GET /api/iptv-plugin/servers
 * Lista todos os servidores IPTV
 */
router.get('/servers', async (req, res) => {
  try {
    const query = `
      SELECT * FROM iptv_servers 
      WHERE status = 'active'
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      servers: result.rows
    });

  } catch (error) {
    console.error('❌ Erro ao listar servidores:', error);
    res.status(500).json({ error: 'Erro ao listar servidores' });
  }
});

/**
 * DELETE /api/iptv-plugin/server/:id
 * Deleta servidor IPTV
 * Integração com Plugin 2 (deletar por MAC)
 */
router.delete('/server/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE iptv_servers 
      SET status = 'deleted', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }

    res.json({
      success: true,
      message: 'Servidor deletado com sucesso',
      server: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Erro ao deletar servidor:', error);
    res.status(500).json({ error: 'Erro ao deletar servidor' });
  }
});

// ============================================
// GERENCIAR PLAYLISTS
// ============================================

/**
 * POST /api/iptv-plugin/add-playlist
 * Adiciona playlist a um servidor
 * Integração com Plugin 4 (Playlist Manager)
 */
router.post('/add-playlist', async (req, res) => {
  try {
    const {
      server_id,
      playlist_name,
      playlist_url,
      playlist_type // 'm3u', 'xtream', 'custom'
    } = req.body;

    if (!server_id || !playlist_name || !playlist_url) {
      return res.status(400).json({ error: 'Dados obrigatórios faltando' });
    }

    // Verificar se servidor existe
    const serverCheck = await pool.query(
      'SELECT * FROM iptv_servers WHERE id = $1 AND status = $2',
      [server_id, 'active']
    );

    if (serverCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }

    // Inserir playlist
    const query = `
      INSERT INTO iptv_playlists (
        server_id,
        playlist_name,
        playlist_url,
        playlist_type,
        status,
        created_at
      ) VALUES ($1, $2, $3, $4, 'active', NOW())
      RETURNING *
    `;

    const result = await pool.query(query, [
      server_id,
      playlist_name,
      playlist_url,
      playlist_type || 'custom'
    ]);

    res.json({
      success: true,
      message: 'Playlist adicionada com sucesso',
      playlist: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Erro ao adicionar playlist:', error);
    res.status(500).json({ error: 'Erro ao adicionar playlist' });
  }
});

/**
 * GET /api/iptv-plugin/playlists/:server_id
 * Lista playlists de um servidor
 */
router.get('/playlists/:server_id', async (req, res) => {
  try {
    const { server_id } = req.params;

    const query = `
      SELECT * FROM iptv_playlists 
      WHERE server_id = $1 AND status = 'active'
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [server_id]);

    res.json({
      success: true,
      playlists: result.rows
    });

  } catch (error) {
    console.error('❌ Erro ao listar playlists:', error);
    res.status(500).json({ error: 'Erro ao listar playlists' });
  }
});

/**
 * DELETE /api/iptv-plugin/playlist/:id
 * Deleta playlist
 */
router.delete('/playlist/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE iptv_playlists 
      SET status = 'deleted', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Playlist não encontrada' });
    }

    res.json({
      success: true,
      message: 'Playlist deletada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar playlist:', error);
    res.status(500).json({ error: 'Erro ao deletar playlist' });
  }
});

// ============================================
// GERENCIAR DISPOSITIVOS COM IPTV
// ============================================

/**
 * POST /api/iptv-plugin/assign-server-to-device
 * Atribui servidor IPTV a um dispositivo
 * Integração com Plugin 3 (qPanel Manager)
 */
router.post('/assign-server-to-device', async (req, res) => {
  try {
    const {
      device_id,
      server_id
    } = req.body;

    if (!device_id || !server_id) {
      return res.status(400).json({ error: 'device_id e server_id são obrigatórios' });
    }

    // Verificar se dispositivo existe
    const deviceCheck = await pool.query(
      'SELECT * FROM devices WHERE id = $1',
      [device_id]
    );

    if (deviceCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Dispositivo não encontrado' });
    }

    // Verificar se servidor existe
    const serverCheck = await pool.query(
      'SELECT * FROM iptv_servers WHERE id = $1 AND status = $2',
      [server_id, 'active']
    );

    if (serverCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }

    // Atualizar dispositivo com novo servidor
    const server = serverCheck.rows[0];
    const query = `
      UPDATE devices 
      SET 
        current_iptv_server_url = $1,
        current_iptv_username = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;

    const result = await pool.query(query, [
      server.xtream_url,
      server.xtream_username,
      device_id
    ]);

    res.json({
      success: true,
      message: 'Servidor IPTV atribuído ao dispositivo',
      device: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Erro ao atribuir servidor:', error);
    res.status(500).json({ error: 'Erro ao atribuir servidor' });
  }
});

/**
 * GET /api/iptv-plugin/device-servers/:device_id
 * Lista servidores IPTV de um dispositivo
 */
router.get('/device-servers/:device_id', async (req, res) => {
  try {
    const { device_id } = req.params;

    const query = `
      SELECT 
        d.id,
        d.mac_address,
        d.current_iptv_server_url,
        d.current_iptv_username,
        s.id as server_id,
        s.server_name,
        s.server_type
      FROM devices d
      LEFT JOIN iptv_servers s ON d.current_iptv_server_url = s.xtream_url
      WHERE d.id = $1
    `;

    const result = await pool.query(query, [device_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dispositivo não encontrado' });
    }

    res.json({
      success: true,
      device: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Erro ao listar servidores do dispositivo:', error);
    res.status(500).json({ error: 'Erro ao listar servidores' });
  }
});

// ============================================
// TESTAR CONEXÃO COM SERVIDOR IPTV
// ============================================

/**
 * POST /api/iptv-plugin/test-server
 * Testa conexão com servidor IPTV
 */
router.post('/test-server', async (req, res) => {
  try {
    const { server_id } = req.body;

    if (!server_id) {
      return res.status(400).json({ error: 'server_id é obrigatório' });
    }

    // Buscar servidor
    const serverResult = await pool.query(
      'SELECT * FROM iptv_servers WHERE id = $1',
      [server_id]
    );

    if (serverResult.rows.length === 0) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }

    const server = serverResult.rows[0];

    // Testar conexão (simples - apenas verificar se URL responde)
    try {
      await axios.get(server.xtream_url, { timeout: 5000 });
      
      res.json({
        success: true,
        message: 'Conexão com servidor bem-sucedida',
        status: 'online',
        server: {
          id: server.id,
          name: server.server_name,
          url: server.xtream_url
        }
      });
    } catch (error) {
      res.json({
        success: false,
        message: 'Servidor não respondeu',
        status: 'offline',
        error: error.message
      });
    }

  } catch (error) {
    console.error('❌ Erro ao testar servidor:', error);
    res.status(500).json({ error: 'Erro ao testar servidor' });
  }
});

// ============================================
// SINCRONIZAR AUTOMATICAMENTE
// ============================================

/**
 * POST /api/iptv-plugin/sync-all
 * Sincroniza todos os dispositivos com seus servidores IPTV
 * Executa automaticamente a cada 30 minutos
 */
router.post('/sync-all', async (req, res) => {
  try {
    const query = `
      SELECT 
        d.id,
        d.mac_address,
        d.current_iptv_server_url,
        s.id as server_id,
        s.server_name
      FROM devices d
      LEFT JOIN iptv_servers s ON d.current_iptv_server_url = s.xtream_url
      WHERE d.status = 'ativo'
    `;

    const result = await pool.query(query);
    const devices = result.rows;

    let synced = 0;
    let failed = 0;

    for (const device of devices) {
      try {
        // Aqui você pode adicionar lógica de sincronização
        // Por exemplo: enviar comando para o app via WebSocket
        synced++;
      } catch (error) {
        console.error(`Erro ao sincronizar dispositivo ${device.mac_address}:`, error);
        failed++;
      }
    }

    res.json({
      success: true,
      message: 'Sincronização concluída',
      synced,
      failed,
      total: devices.length
    });

  } catch (error) {
    console.error('❌ Erro ao sincronizar:', error);
    res.status(500).json({ error: 'Erro ao sincronizar' });
  }
});

module.exports = router;
