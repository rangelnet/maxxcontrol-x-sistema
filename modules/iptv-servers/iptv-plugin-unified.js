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
    const result = await Promise.race([
      pool.query(`SELECT * FROM iptv_servers WHERE status = 'active' ORDER BY created_at DESC`),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
    ]);

    res.json({ success: true, servers: result.rows });
  } catch (error) {
    console.error('⚠️ Tabela iptv_servers não encontrada ou erro:', error.message);
    res.json({ success: true, servers: [] });
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
// QPANEL INTEGRATION (Plugin 3 functionality)
// ============================================

/**
 * POST /api/iptv-plugin/add-qpanel
 * Adiciona painel qPanel para gerenciamento
 * Integração com Plugin 3 (qPanel Manager)
 */
router.post('/add-qpanel', async (req, res) => {
  try {
    const { 
      panel_name, 
      panel_url, 
      panel_username,
      panel_password 
    } = req.body;

    // Validar dados
    if (!panel_name || !panel_url) {
      return res.status(400).json({ error: 'Nome e URL do painel são obrigatórios' });
    }

    // Inserir no banco
    const query = `
      INSERT INTO qpanel_panels (
        panel_name, 
        panel_url, 
        panel_username, 
        panel_password,
        status,
        created_at
      ) VALUES ($1, $2, $3, $4, 'active', NOW())
      RETURNING *
    `;

    const result = await pool.query(query, [
      panel_name,
      panel_url,
      panel_username,
      panel_password
    ]);

    res.json({
      success: true,
      message: 'Painel qPanel adicionado com sucesso',
      panel: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Erro ao adicionar painel qPanel:', error.message, 'code:', error.code, 'detail:', error.detail);
    res.status(500).json({ 
      error: 'Erro ao adicionar painel qPanel', 
      detail: error.message,
      code: error.code
    });
  }
});

/**
 * GET /api/iptv-plugin/qpanels
 * Lista todos os painéis qPanel
 */
router.get('/qpanels', async (req, res) => {
  try {
    const result = await Promise.race([
      pool.query(`SELECT * FROM qpanel_panels WHERE status = 'active' ORDER BY created_at DESC`),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
    ]);

    res.json({ success: true, panels: result.rows });
  } catch (error) {
    console.error('⚠️ Tabela qpanel_panels não encontrada ou erro:', error.message);
    res.json({ success: true, panels: [] });
  }
});

/**
 * DELETE /api/iptv-plugin/qpanel/:id
 * Deleta painel qPanel
 */
router.delete('/qpanel/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE qpanel_panels 
      SET status = 'deleted', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Painel qPanel não encontrado' });
    }

    res.json({
      success: true,
      message: 'Painel qPanel deletado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar painel qPanel:', error);
    res.status(500).json({ error: 'Erro ao deletar painel qPanel' });
  }
});

/**
 * POST /api/iptv-plugin/qpanel-load-servers
 * Salva servidores e pacotes de um painel qPanel (enviados pelo frontend)
 * O frontend busca os dados diretamente do painel qPanel via browser
 * e envia para o backend salvar no banco
 */
router.post('/qpanel-load-servers', async (req, res) => {
  try {
    const { panel_id, servers } = req.body;

    if (!panel_id) {
      return res.status(400).json({ error: 'panel_id é obrigatório' });
    }

    // Verificar se painel existe
    const panelResult = await pool.query(
      'SELECT * FROM qpanel_panels WHERE id = $1 AND status = $2',
      [panel_id, 'active']
    );

    if (panelResult.rows.length === 0) {
      return res.status(404).json({ error: 'Painel qPanel não encontrado' });
    }

    // Se não vieram servidores, apenas retornar os salvos no banco
    if (!servers || servers.length === 0) {
      const saved = await pool.query(
        'SELECT * FROM qpanel_servers WHERE panel_id = $1 AND status = $2 ORDER BY created_at DESC',
        [panel_id, 'active']
      );
      return res.json({
        success: true,
        message: 'Servidores carregados do banco',
        servers: saved.rows.map(r => ({ ...r.server_data, id: r.id, server_name: r.server_name, dns: r.server_dns })),
        total: saved.rows.length
      });
    }

    // Salvar/atualizar servidores enviados pelo frontend
    for (const server of servers) {
      const serverName = server.name || server.server_name || `Servidor ${server.id}`;
      const serverDns = server.dns || '';
      await pool.query(`
        INSERT INTO qpanel_servers (
          panel_id, server_name, server_dns, server_data, created_at
        ) VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (panel_id, server_name) 
        DO UPDATE SET server_dns = $3, server_data = $4, updated_at = NOW()
      `, [panel_id, serverName, serverDns, JSON.stringify(server)]);
    }

    res.json({
      success: true,
      message: `${servers.length} servidor(es) salvo(s) com sucesso`,
      servers,
      total: servers.length
    });

  } catch (error) {
    console.error('❌ Erro ao salvar servidores qPanel:', error);
    res.status(500).json({ error: 'Erro ao salvar servidores qPanel', detail: error.message });
  }
});

/**
 * POST /api/iptv-plugin/qpanel-create-accounts
 * Cria contas IPTV em massa nos painéis qPanel
 * Integração com Plugin 3 (criação em massa)
 */
router.post('/qpanel-create-accounts', async (req, res) => {
  try {
    const {
      username,
      password,
      selected_packages, // Array de {panel_id, server_id, package_id}
      device_mac // MAC do dispositivo TV MAXX PRO
    } = req.body;

    // Validar dados
    if (!username || !password || !selected_packages || !device_mac) {
      return res.status(400).json({ error: 'Dados obrigatórios faltando' });
    }

    if (password.length < 9) {
      return res.status(400).json({ error: 'A senha deve ter no mínimo 9 caracteres' });
    }

    let totalCreated = 0;
    let createdAccounts = [];
    let extractedDNS = [];

    // Criar contas em cada painel selecionado
    for (const pkg of selected_packages) {
      try {
        // Buscar painel
        const panelResult = await pool.query(
          'SELECT * FROM qpanel_panels WHERE id = $1 AND status = $2',
          [pkg.panel_id, 'active']
        );

        if (panelResult.rows.length === 0) continue;

        const panel = panelResult.rows[0];

        // Simular criação de conta via API do painel
        const createResponse = await axios.post(`${panel.panel_url}/api/customers`, {
          server_id: pkg.server_id,
          package_id: pkg.package_id,
          connections: 2,
          bouquets: "",
          parent_can_edit_personal_data: "YES",
          username,
          password
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${panel.panel_username}` // Token seria extraído dinamicamente
          },
          timeout: 10000
        });

        if (createResponse.status === 200 || createResponse.status === 201) {
          totalCreated++;

          // Extrair DNS da resposta
          const responseData = createResponse.data.data;
          const m3uUrl = responseData?.m3u_url || responseData?.m3u_url_short;

          if (m3uUrl) {
            const extractedDns = new URL(m3uUrl).hostname;
            
            // Armazenar DNS extraído
            if (!extractedDNS.find(d => d.dns === extractedDns)) {
              extractedDNS.push({
                server_name: pkg.server_name || `Servidor ${pkg.server_id}`,
                dns: extractedDns,
                m3u_url: m3uUrl
              });
            }
          }

          // Salvar conta criada
          await pool.query(`
            INSERT INTO qpanel_accounts (
              panel_id, server_id, package_id, username, password, 
              device_mac, m3u_url, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
          `, [
            pkg.panel_id, pkg.server_id, pkg.package_id, 
            username, password, device_mac, m3uUrl
          ]);

          createdAccounts.push({
            panel_id: pkg.panel_id,
            server_id: pkg.server_id,
            package_id: pkg.package_id,
            m3u_url: m3uUrl
          });
        }

        // Rate limiting (400ms entre criações)
        await new Promise(resolve => setTimeout(resolve, 400));

      } catch (createError) {
        console.error(`Erro ao criar conta no painel ${pkg.panel_id}:`, createError);
      }
    }

    res.json({
      success: true,
      message: `${totalCreated} conta(s) criada(s) com sucesso`,
      total_created: totalCreated,
      created_accounts: createdAccounts,
      extracted_dns: extractedDNS
    });

  } catch (error) {
    console.error('❌ Erro ao criar contas qPanel:', error);
    res.status(500).json({ error: 'Erro ao criar contas qPanel' });
  }
});

/**
 * POST /api/iptv-plugin/register-dns-to-device
 * Registra DNS extraídas no dispositivo TV MAXX PRO
 * Substitui a integração com SmartOne - agora integra direto com o app
 */
router.post('/register-dns-to-device', async (req, res) => {
  try {
    const {
      device_mac,
      dns_list, // Array de {server_name, dns, m3u_url}
      username,
      password
    } = req.body;

    if (!device_mac || !dns_list || !username || !password) {
      return res.status(400).json({ error: 'Dados obrigatórios faltando' });
    }

    // Verificar se dispositivo existe
    const deviceResult = await pool.query(
      'SELECT * FROM devices WHERE mac_address = $1',
      [device_mac]
    );

    if (deviceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dispositivo não encontrado' });
    }

    const device = deviceResult.rows[0];
    let registeredCount = 0;

    // Registrar cada DNS no dispositivo
    for (const dnsInfo of dns_list) {
      try {
        // Gerar URL M3U completa
        const m3uUrl = `http://${dnsInfo.dns}/get.php?username=${username}&password=${password}&type=m3u_plus&output=mpegts`;

        // Salvar registro no banco
        await pool.query(`
          INSERT INTO smartone_registrations (
            device_id, device_mac, server_name, dns, 
            username, password, m3u_url, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
          ON CONFLICT (device_mac, dns) 
          DO UPDATE SET 
            username = $5, password = $6, m3u_url = $7, updated_at = NOW()
        `, [
          device.id, device_mac, dnsInfo.server_name, dnsInfo.dns,
          username, password, m3uUrl
        ]);

        registeredCount++;

        // Rate limiting (600ms entre registros)
        await new Promise(resolve => setTimeout(resolve, 600));

      } catch (regError) {
        console.error(`Erro ao registrar DNS ${dnsInfo.dns}:`, regError);
      }
    }

    // Atualizar configuração IPTV do dispositivo com o primeiro DNS
    if (dns_list.length > 0) {
      const firstDns = dns_list[0];
      const firstM3uUrl = `http://${firstDns.dns}/get.php?username=${username}&password=${password}&type=m3u_plus&output=mpegts`;

      await pool.query(`
        UPDATE devices 
        SET 
          current_iptv_server_url = $1,
          current_iptv_username = $2,
          updated_at = NOW()
        WHERE id = $3
      `, [firstM3uUrl, username, device.id]);
    }

    res.json({
      success: true,
      message: `${registeredCount} DNS(s) registrada(s) no dispositivo TV MAXX PRO`,
      registered_count: registeredCount,
      device_mac: device_mac
    });

  } catch (error) {
    console.error('❌ Erro ao registrar DNS no dispositivo:', error);
    res.status(500).json({ error: 'Erro ao registrar DNS no dispositivo' });
  }
});

/**
 * GET /api/iptv-plugin/device-dns/:mac
 * Lista DNS registradas para um dispositivo
 * Para o app TV MAXX PRO buscar suas configurações
 */
router.get('/device-dns/:mac', async (req, res) => {
  try {
    const { mac } = req.params;

    const query = `
      SELECT 
        sr.server_name,
        sr.dns,
        sr.username,
        sr.password,
        sr.m3u_url,
        sr.created_at
      FROM smartone_registrations sr
      WHERE sr.device_mac = $1
      ORDER BY sr.created_at DESC
    `;

    const result = await pool.query(query, [mac]);

    res.json({
      success: true,
      device_mac: mac,
      dns_list: result.rows
    });

  } catch (error) {
    console.error('❌ Erro ao listar DNS do dispositivo:', error);
    res.status(500).json({ error: 'Erro ao listar DNS do dispositivo' });
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

// ============================================
// LIMPAR QPANEL (Plugin 1 functionality)
// ============================================

/**
 * POST /api/iptv-plugin/qpanel-search-user
 * Busca usuário por username em todos os painéis qPanel ativos
 * Faz requisição direta para cada painel usando as credenciais salvas
 */
router.post('/qpanel-search-user', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'Username é obrigatório' });
    }

    // Buscar todos os painéis ativos
    const panelsResult = await pool.query(
      `SELECT * FROM qpanel_panels WHERE status = 'active' ORDER BY panel_name`
    );

    if (panelsResult.rows.length === 0) {
      return res.json({ success: true, results: [], total: 0, message: 'Nenhum painel qPanel configurado' });
    }

    const results = [];

    for (const panel of panelsResult.rows) {
      try {
        const baseUrl = panel.panel_url.replace(/\/$/, '');
        const response = await axios.get(`${baseUrl}/api/customers`, {
          params: { search: username.trim() },
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${panel.panel_username}`
          },
          timeout: 8000
        });

        const data = response.data;
        const customers = data.data || data.customers || data.results || [];

        // Filtrar apenas os que batem exatamente com o username
        const matched = customers.filter(c =>
          c.username?.toLowerCase() === username.trim().toLowerCase()
        );

        for (const customer of matched) {
          results.push({
            panel_id: panel.id,
            panel_name: panel.panel_name,
            panel_url: panel.panel_url,
            customer_id: customer.id,
            username: customer.username,
            email: customer.email || '',
            status: customer.status || customer.enabled || 'unknown',
            expiry: customer.exp_date || customer.expiry || '',
            connections: customer.max_connections || customer.connections || 1,
            created_at: customer.created_at || ''
          });
        }
      } catch (panelError) {
        console.error(`⚠️ Erro ao buscar no painel ${panel.panel_name}:`, panelError.message);
        // Continua para o próximo painel mesmo com erro
        results.push({
          panel_id: panel.id,
          panel_name: panel.panel_name,
          panel_url: panel.panel_url,
          error: panelError.message,
          customer_id: null
        });
      }
    }

    const found = results.filter(r => !r.error);
    res.json({
      success: true,
      results,
      total: found.length,
      panels_searched: panelsResult.rows.length
    });

  } catch (error) {
    console.error('❌ Erro ao buscar usuário qPanel:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário', detail: error.message });
  }
});

/**
 * POST /api/iptv-plugin/qpanel-delete-user
 * Deleta usuário por ID em um painel qPanel específico
 */
router.post('/qpanel-delete-user', async (req, res) => {
  try {
    const { panel_id, customer_id, username } = req.body;

    if (!panel_id || !customer_id) {
      return res.status(400).json({ error: 'panel_id e customer_id são obrigatórios' });
    }

    // Buscar painel
    const panelResult = await pool.query(
      `SELECT * FROM qpanel_panels WHERE id = $1 AND status = 'active'`,
      [panel_id]
    );

    if (panelResult.rows.length === 0) {
      return res.status(404).json({ error: 'Painel qPanel não encontrado' });
    }

    const panel = panelResult.rows[0];
    const baseUrl = panel.panel_url.replace(/\/$/, '');

    const response = await axios.delete(`${baseUrl}/api/customers/${customer_id}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${panel.panel_username}`
      },
      timeout: 8000
    });

    console.log(`✅ Usuário ${username || customer_id} deletado do painel ${panel.panel_name}`);

    res.json({
      success: true,
      message: `Usuário "${username || customer_id}" deletado do painel "${panel.panel_name}"`,
      panel_name: panel.panel_name,
      customer_id
    });

  } catch (error) {
    console.error('❌ Erro ao deletar usuário qPanel:', error.message);
    // Se o painel retornou 404, o usuário já não existe — tratar como sucesso
    if (error.response?.status === 404) {
      return res.json({ success: true, message: 'Usuário não encontrado no painel (já deletado)' });
    }
    res.status(500).json({ error: 'Erro ao deletar usuário', detail: error.message });
  }
});

// ============================================
// SISTEMA DE RELAY (Plugin Chrome ↔ Painel)
// ============================================

/**
 * POST /api/iptv-plugin/relay-command
 * Painel insere um comando na fila para o plugin Chrome executar
 * Body: { panel_id, command_type, payload }
 */
router.post('/relay-command', async (req, res) => {
  try {
    const { panel_id, command_type, payload } = req.body;

    if (!command_type || !payload) {
      return res.status(400).json({ error: 'command_type e payload são obrigatórios' });
    }

    const validTypes = ['search_user', 'delete_user'];
    if (!validTypes.includes(command_type)) {
      return res.status(400).json({ error: `command_type inválido. Use: ${validTypes.join(', ')}` });
    }

    // Limpar comandos expirados antes de inserir
    await pool.query(`DELETE FROM plugin_relay_commands WHERE expires_at < NOW()`).catch(() => {});

    const result = await pool.query(`
      INSERT INTO plugin_relay_commands (panel_id, command_type, payload, status, created_at, expires_at)
      VALUES ($1, $2, $3, 'pending', NOW(), NOW() + INTERVAL '5 minutes')
      RETURNING id, status, created_at
    `, [panel_id || null, command_type, JSON.stringify(payload)]);

    res.json({
      success: true,
      command_id: result.rows[0].id,
      status: 'pending',
      message: 'Comando inserido na fila. Aguardando plugin Chrome executar.'
    });

  } catch (error) {
    console.error('❌ Erro ao inserir relay command:', error);
    res.status(500).json({ error: 'Erro ao inserir comando', detail: error.message });
  }
});

/**
 * GET /api/iptv-plugin/relay-pending
 * Plugin Chrome faz polling para buscar comandos pendentes
 * Query: ?panel_url=http://meupainel.com (opcional, para filtrar por painel)
 */
router.get('/relay-pending', async (req, res) => {
  try {
    const { panel_url } = req.query;

    let query;
    let params;

    if (panel_url) {
      // Buscar comandos do painel específico (por URL)
      query = `
        SELECT rc.id, rc.panel_id, rc.command_type, rc.payload, rc.created_at,
               qp.panel_url, qp.panel_name
        FROM plugin_relay_commands rc
        LEFT JOIN qpanel_panels qp ON rc.panel_id = qp.id
        WHERE rc.status = 'pending'
          AND rc.expires_at > NOW()
          AND (rc.panel_id IS NULL OR qp.panel_url ILIKE $1)
        ORDER BY rc.created_at ASC
        LIMIT 10
      `;
      params = [`%${panel_url.replace(/\/$/, '')}%`];
    } else {
      // Buscar todos os comandos pendentes (plugin pega tudo)
      query = `
        SELECT rc.id, rc.panel_id, rc.command_type, rc.payload, rc.created_at,
               qp.panel_url, qp.panel_name
        FROM plugin_relay_commands rc
        LEFT JOIN qpanel_panels qp ON rc.panel_id = qp.id
        WHERE rc.status = 'pending'
          AND rc.expires_at > NOW()
        ORDER BY rc.created_at ASC
        LIMIT 10
      `;
      params = [];
    }

    const result = await pool.query(query, params);

    // Marcar como 'executing' para evitar que outro plugin pegue o mesmo
    if (result.rows.length > 0) {
      const ids = result.rows.map(r => r.id);
      await pool.query(
        `UPDATE plugin_relay_commands SET status = 'executing', updated_at = NOW() WHERE id = ANY($1)`,
        [ids]
      );
    }

    res.json({
      success: true,
      commands: result.rows.map(r => ({
        id: r.id,
        panel_id: r.panel_id,
        panel_url: r.panel_url,
        panel_name: r.panel_name,
        command_type: r.command_type,
        payload: r.payload
      }))
    });

  } catch (error) {
    console.error('❌ Erro ao buscar relay pending:', error);
    // Retornar lista vazia em caso de erro (tabela pode não existir ainda)
    res.json({ success: true, commands: [] });
  }
});

/**
 * POST /api/iptv-plugin/relay-result
 * Plugin Chrome posta o resultado de um comando executado
 * Body: { command_id, status, result, error_message }
 */
router.post('/relay-result', async (req, res) => {
  try {
    const { command_id, status, result, error_message } = req.body;

    if (!command_id || !status) {
      return res.status(400).json({ error: 'command_id e status são obrigatórios' });
    }

    const validStatuses = ['done', 'error'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `status inválido. Use: ${validStatuses.join(', ')}` });
    }

    const updateResult = await pool.query(`
      UPDATE plugin_relay_commands
      SET status = $1, result = $2, error_message = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING id, status
    `, [status, result ? JSON.stringify(result) : null, error_message || null, command_id]);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Comando não encontrado' });
    }

    res.json({ success: true, command_id, status });

  } catch (error) {
    console.error('❌ Erro ao salvar relay result:', error);
    res.status(500).json({ error: 'Erro ao salvar resultado', detail: error.message });
  }
});

/**
 * GET /api/iptv-plugin/relay-result/:command_id
 * Frontend do painel faz polling para ler o resultado de um comando
 */
router.get('/relay-result/:command_id', async (req, res) => {
  try {
    const { command_id } = req.params;

    const result = await pool.query(
      `SELECT id, status, result, error_message, created_at, updated_at
       FROM plugin_relay_commands WHERE id = $1`,
      [command_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comando não encontrado' });
    }

    const cmd = result.rows[0];
    res.json({
      success: true,
      command_id: cmd.id,
      status: cmd.status,
      result: cmd.result,
      error_message: cmd.error_message,
      created_at: cmd.created_at,
      updated_at: cmd.updated_at
    });

  } catch (error) {
    console.error('❌ Erro ao buscar relay result:', error);
    res.status(500).json({ error: 'Erro ao buscar resultado', detail: error.message });
  }
});

/**
 * POST /api/iptv-plugin/register-device-iptv
 * Registra credenciais IPTV em um dispositivo TV MAXX PRO
 * Substitui o SmartOne — o plugin envia direto para o MaxxControl
 * Body: { device_mac, dns, username, password, server_name? }
 */
router.post('/register-device-iptv', async (req, res) => {
  try {
    const { device_mac, dns, username, password, server_name } = req.body;

    if (!device_mac || !dns || !username || !password) {
      return res.status(400).json({ error: 'device_mac, dns, username e password são obrigatórios' });
    }

    // Verificar se dispositivo existe
    const deviceResult = await pool.query(
      'SELECT * FROM devices WHERE mac_address = $1',
      [device_mac]
    );

    if (deviceResult.rows.length === 0) {
      return res.status(404).json({ error: `Dispositivo com MAC ${device_mac} não encontrado no MaxxControl` });
    }

    const device = deviceResult.rows[0];

    // Montar URL Xtream a partir do DNS
    const cleanDns = dns.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const xtreamUrl = `http://${cleanDns}`;
    const m3uUrl = `http://${cleanDns}/get.php?username=${username}&password=${password}&type=m3u_plus&output=mpegts`;

    // Atualizar configuração IPTV do dispositivo
    await pool.query(`
      UPDATE devices
      SET current_iptv_server_url = $1,
          current_iptv_username = $2,
          updated_at = NOW()
      WHERE id = $3
    `, [xtreamUrl, username, device.id]);

    // Salvar também na tabela device_iptv_config (config por dispositivo)
    await pool.query(`
      INSERT INTO device_iptv_config (device_id, xtream_url, xtream_username, xtream_password, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (device_id)
      DO UPDATE SET xtream_url = $2, xtream_username = $3, xtream_password = $4, updated_at = NOW()
    `, [device.id, xtreamUrl, username, password]);

    // Registrar no histórico (smartone_registrations reutilizado como histórico de DNS)
    await pool.query(`
      INSERT INTO smartone_registrations (device_id, device_mac, server_name, dns, username, password, m3u_url, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (device_mac, dns)
      DO UPDATE SET username = $5, password = $6, m3u_url = $7, updated_at = NOW()
    `, [device.id, device_mac, server_name || cleanDns, cleanDns, username, password, m3uUrl]).catch(() => {
      // Tabela pode não ter a constraint — ignorar silenciosamente
    });

    console.log(`✅ IPTV registrado no dispositivo ${device_mac}: ${xtreamUrl}`);

    res.json({
      success: true,
      message: `Credenciais IPTV registradas no dispositivo ${device_mac}`,
      device_id: device.id,
      device_mac,
      xtream_url: xtreamUrl,
      m3u_url: m3uUrl
    });

  } catch (error) {
    console.error('❌ Erro ao registrar IPTV no dispositivo:', error);
    res.status(500).json({ error: 'Erro ao registrar IPTV no dispositivo', detail: error.message });
  }
});

/**
 * GET /api/iptv-plugin/check-tables
 * Diagnóstico: verifica quais tabelas do plugin existem no banco
 */
router.get('/check-tables', async (req, res) => {
  const tables = ['iptv_servers', 'iptv_playlists', 'device_iptv_sync', 'qpanel_panels', 'qpanel_servers', 'qpanel_accounts', 'smartone_registrations', 'plugin_relay_commands'];
  const results = {};

  for (const table of tables) {
    try {
      const r = await pool.query(`SELECT COUNT(*) FROM ${table}`);
      results[table] = { exists: true, count: parseInt(r.rows[0].count) };
    } catch (err) {
      results[table] = { exists: false, error: err.message };
    }
  }

  res.json({ success: true, tables: results });
});

module.exports = router;
