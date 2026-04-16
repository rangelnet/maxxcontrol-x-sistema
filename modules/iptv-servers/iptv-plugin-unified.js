/**
 * Rotas e Lógicas Unificadas para Gerenciamento de IPTV
 * Este arquivo consolida funcionalidades de múltiplos plugins IPTV
 * em um único controlador backend.
 */

const express = require('express');
const router = express.Router();
const pool = require('../../config/database');
const axios = require('axios');

// ============================================
// GERENCIAMENTO BÁSICO DE SERVIDORES IPTV
// ============================================

/**
 * GET /api/iptv-plugin/servers
 * Lista todos os servidores IPTV cadastrados
 */
router.get('/servers', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, server_name, xtream_url, server_type, status, last_tested_at, test_status, created_at FROM iptv_servers ORDER BY created_at DESC'
    );
    res.json({ success: true, servers: result.rows });
  } catch (error) {
    console.error('❌ Erro ao listar servidores IPTV:', error);
    res.status(500).json({ error: 'Erro ao listar servidores' });
  }
});

/**
 * POST /api/iptv-plugin/add-server
 * Adiciona um novo servidor IPTV
 */
router.post('/add-server', async (req, res) => {
  try {
    const { 
      server_name, 
      xtream_url, 
      xtream_username, 
      xtream_password, 
      server_type = 'custom' 
    } = req.body;

    if (!server_name || !xtream_url) {
      return res.status(400).json({ error: 'Nome e URL do servidor são obrigatórios' });
    }

    const query = `
      INSERT INTO iptv_servers (
        server_name, xtream_url, xtream_username, xtream_password, server_type, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, 'active', NOW())
      RETURNING id, server_name, xtream_url, server_type, status
    `;

    const result = await pool.query(query, [
      server_name, xtream_url, xtream_username, xtream_password, server_type
    ]);

    res.json({
      success: true,
      message: 'Servidor IPTV adicionado com sucesso',
      server: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Erro ao adicionar servidor IPTV:', error);
    res.status(500).json({ error: 'Erro ao adicionar servidor' });
  }
});

/**
 * DELETE /api/iptv-plugin/server/:id
 * Deleta um servidor IPTV
 */
router.delete('/server/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Deleta os playlists associados primeiro (via CASCADE no banco, mas garantimos aqui se necessário)
    const result = await pool.query(
      'DELETE FROM iptv_servers WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }

    res.json({ success: true, message: 'Servidor IPTV apagado com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao apagar servidor IPTV:', error);
    res.status(500).json({ error: 'Erro ao apagar servidor' });
  }
});

// ============================================
// ATRIBUIÇÃO A DISPOSITIVOS
// ============================================

/**
 * POST /api/iptv-plugin/assign-server
 * Atribui um servidor IPTV específico a um dispositivo
 */
router.post('/assign-server', async (req, res) => {
  try {
    const { device_id, server_id } = req.body;

    if (!device_id || !server_id) {
      return res.status(400).json({ error: 'device_id e server_id são obrigatórios' });
    }

    // Buscar configurações do servidor
    const serverResult = await pool.query(
      'SELECT * FROM iptv_servers WHERE id = $1',
      [server_id]
    );

    if (serverResult.rows.length === 0) {
      return res.status(404).json({ error: 'Servidor IPTV não encontrado' });
    }

    const server = serverResult.rows[0];

    // Atualizar dispositivo (TV MAXX PRO)
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
// AUTENTICAÇÃO QPANEL E SIGMA (usuário + senha)
// ============================================

/**
 * Autentica no qPanel/Xtream/Sigma usando usuário + senha.
 * Tenta 4 métodos automaticamente, sem necessidade de API key.
 * Retorna objeto: { type, headers }
 */
async function authenticateQpanel(panelUrl, username, password) {
  const baseUrl = panelUrl.replace(/\/$/, '');

  const defaultHeaders = {
    'Accept': 'application/json, text/plain, */*',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
    'origin': baseUrl,
    'referer': `${baseUrl}/`
  };

  // Método 1: Sigma (Vue.js SPA) -> /api/auth/login
  try {
    const res = await axios.post(`${baseUrl}/api/auth/login`,
      { username, password },
      { timeout: 8000, headers: { ...defaultHeaders, 'Content-Type': 'application/json' } }
    );
    const token = res.data?.token || res.data?.access_token || res.data?.data?.token;
    if (token) {
      return { type: 'bearer (Sigma)', headers: { ...defaultHeaders, 'Authorization': `Bearer ${token}` } };
    }
  } catch (e) { /* continua */ }

  // Método 2: Qpanel REST -> /api/login
  try {
    const res = await axios.post(`${baseUrl}/api/login`,
      { username, password },
      { timeout: 8000, headers: { ...defaultHeaders, 'Content-Type': 'application/json' } }
    );
    const token = res.data?.token || res.data?.access_token;
    if (token) {
      return { type: 'bearer (REST)', headers: { ...defaultHeaders, 'Authorization': `Bearer ${token}` } };
    }
  } catch (e) { /* continua */ }

  // Método 2: Formulário HTML → Cookie de sessão
  try {
    const params = new URLSearchParams({ username, password });
    const res = await axios.post(`${baseUrl}/login`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      maxRedirects: 5,
      timeout: 8000,
      validateStatus: s => s >= 200 && s < 400
    });
    const cookies = res.headers['set-cookie'];
    if (cookies) {
      const cookieStr = cookies.map(c => c.split(';')[0]).join('; ');
      return { type: 'cookie', headers: { 'Cookie': cookieStr, 'Accept': 'application/json' } };
    }
  } catch (e) { /* continua */ }

  // Método 3: Fallback — username como Bearer
  return { type: 'fallback', headers: { 'Authorization': `Bearer ${username}`, 'Accept': 'application/json' } };
}

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
 * Lista todos os painéis qPanel com seus servidores carregados
 */
router.get('/qpanels', async (req, res) => {
  try {
    const panelsResult = await Promise.race([
      pool.query(`SELECT * FROM qpanel_panels WHERE status = 'active' ORDER BY created_at DESC`),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
    ]);

    const panels = panelsResult.rows;

    // Para cada painel, buscar os servidores salvos
    for (const panel of panels) {
      try {
        const serversResult = await pool.query(
          `SELECT id, server_name, server_dns, server_data, created_at
           FROM qpanel_servers WHERE panel_id = $1 ORDER BY created_at DESC`,
          [panel.id]
        );
        panel.servers = serversResult.rows.map(r => {
          const rawData = r.server_data
            ? (typeof r.server_data === 'string' ? JSON.parse(r.server_data) : r.server_data)
            : {};
          const packages = rawData.packages || [];
          return {
            id: r.id,
            name: r.server_name,
            dns: r.server_dns,
            packages,
            server_data: rawData,
            ...rawData,
            // garantir que packages não seja sobrescrito pelo spread
            packages,
          };
        });
      } catch (e) {
        panel.servers = [];
      }
    }

    res.json({ success: true, panels });
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
    const seenDns = new Set();
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

      // Sincronizar DNS na tabela servers (Gerenciamento de Servidores IPTV)
      if (serverDns && !seenDns.has(serverDns)) {
        seenDns.add(serverDns);
        const serverUrl = `http://${serverDns}`;
        try {
          await pool.query(`
            INSERT INTO servers (name, url, region, priority, status)
            VALUES ($1, $2, 'Brasil', 100, 'ativo')
            ON CONFLICT (url) DO UPDATE SET name = $1, updated_at = NOW()
          `, [serverName, serverUrl]);
        } catch (syncErr) {
          // Ignorar silenciosamente se a tabela não tiver a constraint
          console.warn(`⚠️ Não foi possível sincronizar DNS ${serverDns} em servers:`, syncErr.message);
        }
      }
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
 * POST /api/iptv-plugin/qpanel-fetch-direct-servers
 * Busca servidores e pacotes do qPanel usando USUÁRIO + SENHA (sem API key).
 * Tenta 3 estratégias automaticamente:
 *   1. panel_api.php (Xtream UI — padrão no Brasil)
 *   2. player_api.php (Xtream Codes — fallback)
 *   3. REST /api/servers com Bearer/Cookie
 */
router.post('/qpanel-fetch-direct-servers', async (req, res) => {
  try {
    const { panel_id } = req.body;

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

    const panel = panelResult.rows[0];
    const baseUrl = panel.panel_url.replace(/\/$/, '');
    const { panel_username: username, panel_password: password } = panel;

    let finalServers = [];
    let rawPackages = [];
    let methodUsed = '';

    // ── Estratégia 1: panel_api.php (Xtream UI — mais comum no Brasil) ──
    try {
      const [srvRes, pkgRes] = await Promise.allSettled([
        axios.get(`${baseUrl}/panel_api.php`, {
          params: { username, password, action: 'get_servers' },
          timeout: 10000
        }),
        axios.get(`${baseUrl}/panel_api.php`, {
          params: { username, password, action: 'get_packages' },
          timeout: 10000
        })
      ]);

      const rawSrv = srvRes.status === 'fulfilled'
        ? (Array.isArray(srvRes.value.data) ? srvRes.value.data : srvRes.value.data?.data || [])
        : [];
      rawPackages = pkgRes.status === 'fulfilled'
        ? (Array.isArray(pkgRes.value.data) ? pkgRes.value.data : pkgRes.value.data?.data || [])
        : [];

      if (Array.isArray(rawSrv) && rawSrv.length > 0) {
        methodUsed = 'panel_api.php (Xtream UI)';
        finalServers = rawSrv.map(s => ({
          id: s.id || s.server_id,
          name: s.server_name || s.name || `Servidor ${s.id || s.server_id}`,
          dns: s.server_dns || s.dns || s.url || '',
          packages: rawPackages.filter(p => !p.server_id || Number(p.server_id) === Number(s.id || s.server_id))
        }));
      }
    } catch (e) {
      console.warn('⚠️ Estratégia 1 (panel_api.php) falhou:', e.message);
    }

    // ── Estratégia 2: player_api.php (Xtream Codes — fallback) ──
    if (finalServers.length === 0) {
      try {
        const res = await axios.get(`${baseUrl}/player_api.php`, {
          params: { username, password },
          timeout: 10000
        });
        if (res.data?.user_info?.auth === 1 || res.data?.server_info) {
          methodUsed = 'player_api.php (Xtream Codes)';
          const srv = res.data.server_info || {};
          const srvHost = srv.url || baseUrl.replace(/^https?:\/\//, '');
          finalServers = [{
            id: 1,
            name: `Servidor ${srvHost}`,
            dns: srvHost,
            packages: []
          }];
        }
      } catch (e) {
        console.warn('⚠️ Estratégia 2 (player_api.php) falhou:', e.message);
      }
    }

    // ── Estratégia 3: REST /api/servers com Bearer/Cookie ──
    if (finalServers.length === 0) {
      try {
        const auth = await authenticateQpanel(baseUrl, username, password);
        const [srvRes2, pkgRes2] = await Promise.allSettled([
          axios.get(`${baseUrl}/api/servers`, { headers: auth.headers, timeout: 10000 }),
          axios.get(`${baseUrl}/api/packages`, { headers: auth.headers, timeout: 10000 })
        ]);
        const rawSrv2 = srvRes2.status === 'fulfilled'
          ? (srvRes2.value.data?.data || srvRes2.value.data?.servers || srvRes2.value.data || [])
          : [];
        rawPackages = pkgRes2.status === 'fulfilled'
          ? (pkgRes2.value.data?.data || pkgRes2.value.data?.packages || pkgRes2.value.data || [])
          : [];

        if (Array.isArray(rawSrv2) && rawSrv2.length > 0) {
          methodUsed = `REST API (${auth.type})`;
          finalServers = rawSrv2.map(s => ({
            id: s.id || s.server_id,
            name: s.server_name || s.name || `Servidor ${s.id}`,
            dns: s.server_dns || s.dns || s.url || '',
            packages: rawPackages.filter(p => !p.server_id || Number(p.server_id) === Number(s.id))
          }));
        }
      } catch (e) {
        console.warn('⚠️ Estratégia 3 (REST API) falhou:', e.message);
      }
    }

    // Nenhuma estratégia funcionou
    if (finalServers.length === 0) {
      return res.json({
        success: false,
        message: '❌ Não foi possível conectar ao painel. Verifique a URL, usuário e senha.',
        servers: [],
        total: 0,
        methods_tried: ['panel_api.php', 'player_api.php', 'REST /api/servers']
      });
    }

    // Persistir no banco
    const seenDns = new Set();
    for (const server of finalServers) {
      const serverName = server.name || `Servidor ${server.id}`;
      const serverDns = server.dns || '';
      await pool.query(`
        INSERT INTO qpanel_servers (panel_id, server_name, server_dns, server_data, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (panel_id, server_name)
        DO UPDATE SET server_dns = $3, server_data = $4, updated_at = NOW()
      `, [panel_id, serverName, serverDns, JSON.stringify(server)]);

      if (serverDns && !seenDns.has(serverDns)) {
        seenDns.add(serverDns);
        try {
          await pool.query(`
            INSERT INTO servers (name, url, region, priority, status)
            VALUES ($1, $2, 'Brasil', 100, 'ativo')
            ON CONFLICT (url) DO UPDATE SET name = $1, updated_at = NOW()
          `, [serverName, `http://${serverDns}`]);
        } catch (e) {}
      }
    }

    res.json({
      success: true,
      message: `✅ ${finalServers.length} servidor(es) carregado(s) via ${methodUsed}`,
      servers: finalServers,
      total: finalServers.length,
      method: methodUsed
    });

  } catch (error) {
    console.error('❌ Erro no fetch direto do qPanel:', error.message);
    res.status(500).json({ error: 'Erro de conexão com o painel', detail: error.message });
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
    let errors = [];

    for (const pkg of selected_packages) {
      try {
        const panelResult = await pool.query(
          'SELECT * FROM qpanel_panels WHERE id = $1 AND status = $2',
          [pkg.panel_id, 'active']
        );
        if (panelResult.rows.length === 0) continue;

        const panel = panelResult.rows[0];
        const baseUrl = panel.panel_url.replace(/\/$/, '');
        const adminUser = panel.panel_username;
        const adminPass = panel.panel_password;

        let created = false;
        let m3uUrl = null;

        // ── Estratégia 1: panel_api.php (Xtream UI padrão) ──
        try {
          const createRes = await axios.get(`${baseUrl}/panel_api.php`, {
            params: {
              username: adminUser, password: adminPass,
              action: 'create_user',
              new_username: username,
              new_password: password,
              server_id: pkg.server_id,
              package_id: pkg.package_id,
              max_connections: 2
            },
            timeout: 12000
          });
          if (createRes.data?.user_created || createRes.data?.success) {
            created = true;
            m3uUrl = createRes.data?.url || createRes.data?.m3u_url || null;
          }
        } catch (e1) {
          // ── Estratégia 2: REST /api/customers com Bearer/Cookie ──
          try {
            const auth = await authenticateQpanel(baseUrl, adminUser, adminPass);
            const createRes2 = await axios.post(`${baseUrl}/api/customers`, {
              server_id: pkg.server_id,
              package_id: pkg.package_id,
              username, password,
              connections: 2,
              parent_can_edit_personal_data: 'YES'
            }, {
              headers: { ...auth.headers, 'Content-Type': 'application/json' },
              timeout: 12000
            });
            if (createRes2.status === 200 || createRes2.status === 201) {
              created = true;
              const rd = createRes2.data?.data || createRes2.data;
              m3uUrl = rd?.m3u_url || rd?.m3u_url_short || null;
            }
          } catch (e2) {
            errors.push(`${panel.panel_name}: ${e2.message}`);
          }
        }

        if (created) {
          totalCreated++;

          // Extrair DNS
          if (m3uUrl) {
            try {
              const dns = new URL(m3uUrl).hostname;
              if (!extractedDNS.find(d => d.dns === dns)) {
                extractedDNS.push({ server_name: pkg.server_name || `Servidor ${pkg.server_id}`, dns, m3u_url: m3uUrl });
              }
            } catch (e) {}
          } else if (pkg.server_dns) {
            // Usa o DNS do servidor carregado como fallback
            const dns = pkg.server_dns;
            m3uUrl = `http://${dns}/get.php?username=${username}&password=${password}&type=m3u_plus&output=mpegts`;
            if (!extractedDNS.find(d => d.dns === dns))
              extractedDNS.push({ server_name: pkg.server_name, dns, m3u_url: m3uUrl });
          }

          // Persistir conta no banco
          try {
            await pool.query(`
              INSERT INTO qpanel_accounts (panel_id, server_id, package_id, username, password, device_mac, m3u_url, created_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            `, [pkg.panel_id, pkg.server_id, pkg.package_id, username, password, device_mac, m3uUrl]);
          } catch (dbErr) {}

          createdAccounts.push({ panel_id: pkg.panel_id, server_id: pkg.server_id, package_id: pkg.package_id, m3u_url: m3uUrl });
        }

        await new Promise(r => setTimeout(r, 400));

      } catch (err) {
        errors.push(`Erro pkg ${pkg.package_id}: ${err.message}`);
      }
    }

    res.json({
      success: true,
      message: `${totalCreated} conta(s) criada(s) com sucesso`,
      total_created: totalCreated,
      created_accounts: createdAccounts,
      extracted_dns: extractedDNS,
      errors: errors.length > 0 ? errors : undefined
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
        const authHeaders = await authenticateQpanel(baseUrl, panel.panel_username, panel.panel_password);
        const response = await axios.get(`${baseUrl}/api/customers`, {
          params: { search: username.trim() },
          headers: authHeaders,
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

    const authHeaders = await authenticateQpanel(baseUrl, panel.panel_username, panel.panel_password);
    const response = await axios.delete(`${baseUrl}/api/customers/${customer_id}`, {
      headers: authHeaders,
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

    const validTypes = ['search_user', 'delete_user', 'get_servers'];
    if (!validTypes.includes(command_type)) {
      return res.status(400).json({ error: `command_type inválido. Use: ${validTypes.join(', ')}` });
    }

    const query = `
      INSERT INTO plugin_relay_commands (
        panel_id, command_type, payload, status
      ) VALUES ($1, $2, $3, 'pending')
      RETURNING id
    `;

    const result = await pool.query(query, [panel_id || null, command_type, payload]);

    res.json({
      success: true,
      message: 'Comando enfileirado para o plugin Chrome',
      command_id: result.rows[0].id
    });

  } catch (error) {
    console.error('❌ Erro no relay-command:', error);
    res.status(500).json({ error: 'Erro ao processar comando de relay' });
  }
});

/**
 * POST /api/iptv-plugin/relay-sync-customers
 * Usado pelo Plugin do Chrome para derramar de volta TODOS os clientes lidos da tela "Usuários/Customers" do painel.
 * (Espelhamento do Sigma/qPanel).
 */
router.post('/relay-sync-customers', async (req, res) => {
  try {
    const { panel_id, customers } = req.body;
    if (!panel_id || !Array.isArray(customers)) {
      return res.status(400).json({ error: 'panel_id e array de customers são obrigatórios' });
    }

    // Auto-criar o painel caso ele ainda não exista para não bugar a foreign key!
    const panelCheck = await pool.query('SELECT id FROM qpanel_panels WHERE id = $1', [panel_id]);
    if (panelCheck.rows.length === 0) {
      await pool.query(`
        INSERT INTO qpanel_panels (id, panel_name, panel_url, status)
        VALUES ($1, 'Painel Importado (Relay)', 'http://desconhecido', 'active')
      `, [panel_id]);
    }

    let inserted = 0;
    
    // Insere ou atualiza os usuários pegos do painel. A chave é o username no painel.
    for (const c of customers) {
      if (!c.username) continue;
      
      const server_id = c.server_id || 1; // Fallback server 1
      const package_id = c.package_id || 0;
      const device_mac = c.device_mac || `IMPORT-${c.username.substring(0,8)}`;
      const m3u_url = c.m3u_url || c.m3u_url_short || '';
      
      try {
        const exist = await pool.query(`SELECT id FROM qpanel_accounts WHERE panel_id = $1 AND username = $2 LIMIT 1`, [panel_id, c.username]);

        if (exist.rows.length > 0) {
          await pool.query(`
            UPDATE qpanel_accounts 
            SET password = $1, m3u_url = $2, status = 'active', updated_at = NOW(), 
                expire_date = $4, remote_id = $5, panel_url = $6, 
                package_name = $7, server_name = $8, max_connections = $9
            WHERE id = $3
          `, [
            c.password || '******', 
            m3u_url, 
            exist.rows[0].id, 
            c.expire_date,
            c.remote_id,
            c.panel_url,
            c.package_name,
            c.server_name,
            c.max_connections || 1
          ]);
        } else {
          await pool.query(`
            INSERT INTO qpanel_accounts (
              panel_id, server_id, package_id, username, password, 
              device_mac, m3u_url, status, created_at, updated_at, 
              expire_date, remote_id, panel_url, package_name, server_name, max_connections
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', NOW(), NOW(), $8, $9, $10, $11, $12, $13)
          `, [
            panel_id, 
            server_id, 
            package_id, 
            c.username, 
            c.password || '******', 
            device_mac, 
            m3u_url, 
            c.expire_date,
            c.remote_id,
            c.panel_url,
            c.package_name,
            c.server_name,
            c.max_connections || 1
          ]);
        }
        
        inserted++;
      } catch (err) {
        // Ignorar conflitos únicos pesados que não forem username (ex: MAC repetido pode bugar no futuro se tiver constraint de MAC único, mas vamos tentar)
        console.warn(`Erro no sync do customer ${c.username}:`, err.message);
      }
    }

    res.json({ 
      success: true, 
      message: `${inserted} clientes sincronizados com sucesso no painel via Chrome Relay!`,
      total_synced: inserted
    });

  } catch (error) {
    console.error('❌ Erro no relay-sync-customers:', error.message);
    res.status(500).json({ error: 'Erro interno ao sincronizar clientes do relay' });
  }
});

/**
 * GET /api/iptv-plugin/relay-poll
 * Plugin Chrome faz polling a cada 2s para ver se há comandos 'pending'
 */
router.get('/relay-poll', async (req, res) => {
  try {
    // Buscar comandos pendentes
    const query = `
      SELECT id, panel_id, command_type, payload 
      FROM plugin_relay_commands 
      WHERE status = 'pending' 
      ORDER BY created_at ASC 
      LIMIT 5
    `;

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return res.json({ commands: [] });
    }

    const ids = result.rows.map(r => r.id);

    // Marcar como 'processing'
    await pool.query(`
      UPDATE plugin_relay_commands 
      SET status = 'processing', updated_at = NOW() 
      WHERE id = ANY($1)
    `, [ids]);

    res.json({ commands: result.rows });

  } catch (error) {
    console.error('❌ Erro no relay-poll:', error);
    res.status(500).json({ error: 'Erro interno no polling do relay' });
  }
});

/**
 * POST /api/iptv-plugin/relay-result
 * Plugin Chrome envia o resultado da execução de volta pro painel
 */
router.post('/relay-result', async (req, res) => {
  try {
    const { command_id, status, result, error_message } = req.body;

    if (!command_id || !status) {
      return res.status(400).json({ error: 'command_id e status são obrigatórios' });
    }

    const query = `
      UPDATE plugin_relay_commands 
      SET 
        status = $1, 
        result = $2, 
        error_message = $3, 
        updated_at = NOW()
      WHERE id = $4
      RETURNING id
    `;

    const dbResult = await pool.query(query, [
      status, 
      result ? JSON.stringify(result) : null, 
      error_message, 
      command_id
    ]);

    if (dbResult.rows.length === 0) {
      return res.status(404).json({ error: 'Comando não encontrado' });
    }

    res.json({ success: true, message: 'Resultado processado' });

  } catch (error) {
    console.error('❌ Erro no relay-result:', error);
    res.status(500).json({ error: 'Erro interno ao salvar resultado do relay' });
  }
});

/**
 * GET /api/iptv-plugin/relay-result/:command_id
 * Painel faz polling consultando se o comando já terminou ('done' ou 'error')
 */
router.get('/relay-result/:command_id', async (req, res) => {
  try {
    const { command_id } = req.params;

    const query = `
      SELECT status, result, error_message 
      FROM plugin_relay_commands 
      WHERE id = $1
    `;

    const result = await pool.query(query, [command_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comando não encontrado' });
    }

    const row = result.rows[0];

    // Se estiver done e tiver result, parsear JSON se precisar
    let parsedResult = row.result;
    if (parsedResult && typeof parsedResult === 'string') {
      try { parsedResult = JSON.parse(parsedResult); } catch (e) {}
    }

    res.json({
      status: row.status, // 'pending', 'processing', 'done', 'error'
      result: parsedResult,
      error_message: row.error_message
    });

  } catch (error) {
    console.error('❌ Erro ao consultar relay-result:', error);
    res.status(500).json({ error: 'Erro interno ao consultar resultado' });
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

/**
 * GET /api/iptv-plugin/qpanel-grouped-accounts
 * Agrupa contas criadas/sincronizadas por username e password.
 * Retorna os clientes e todos os servidores que eles possuem.
 */
router.get('/qpanel-grouped-accounts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.username,
        a.password,
        json_agg(
          json_build_object(
            'id', a.id,
            'panel_id', a.panel_id,
            'server_id', a.server_id,
            'panel_name', p.panel_name,
            'expire_date', a.expire_date,
            'server_name', COALESCE(s.server_name, 'Servidor ' || a.server_id),
            'm3u_url', a.m3u_url,
            'device_mac', a.device_mac,
            'status', a.status,
            'created_at', a.created_at
          )
        ) as accounts
      FROM qpanel_accounts a
      LEFT JOIN qpanel_panels p ON a.panel_id = p.id
      LEFT JOIN qpanel_servers s ON a.panel_id = s.panel_id AND a.server_id::text = s.server_name -- O qPanel as vezes salva server_name como ID ou nome
      GROUP BY a.username, a.password
      ORDER BY MIN(a.created_at) DESC
    `);
    
    res.json({
      success: true,
      data: result.rows || []
    });
  } catch (error) {
    console.error('❌ Erro no qpanel-grouped-accounts:', error.message);
    res.status(500).json({ error: 'Erro ao agrupar clientes', detail: error.message });
  }
});

module.exports = router;
