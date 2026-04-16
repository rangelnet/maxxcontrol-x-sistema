const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/**
 * Módulo Unificado de Gerenciamento IPTV (MaxxControl X)
 * Suporte a: Xtream UI, qPanel, REST API e Plugin Chrome
 */

// ─── PLUGIN RELAY (COMUNICADOR COM O NAVEGADOR) ───────────────────────────────

/**
 * POST /api/iptv-plugin/relay-fetch-qpanel
 * Envia um comando para ser executado pela extensão do Chrome do usuário.
 * Útil para bypass de Cloudflare e Captchas.
 */
router.post('/relay-fetch-qpanel', async (req, res) => {
  try {
    const { username, method = 'search' } = req.body;
    
    // Registrar o comando na fila para a extensão ler via WebSocket ou Polling
    const result = await pool.query(`
      INSERT INTO plugin_relay_commands (command_type, payload, status, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id
    `, ['qpanel_fetch', JSON.stringify({ username, method }), 'pending']);

    res.json({
      success: true,
      message: 'Comando enviado para o plugin do navegador. Aguardando execução...',
      command_id: result.rows[0].id
    });
  } catch (error) {
    console.error('❌ Erro no Relay:', error);
    res.status(500).json({ error: 'Falha ao enfileirar comando de relay' });
  }
});

/**
 * GET /api/iptv-plugin/relay-result/:id
 * Consulta se o plugin já retornou os dados solicitados.
 */
router.get('/relay-result/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM plugin_relay_commands WHERE id = $1', [id]);
    
    if (result.rows.length === 0) return res.status(404).json({ error: 'Comando não encontrado' });
    
    const row = result.rows[0];
    let parsedResult = null;
    try { parsedResult = JSON.parse(row.result_data); } catch (e) {}

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

// ─── GERENCIAMENTO DIRETO DE PAINÉIS (API SERVER-SIDE) ───────────────────────

/**
 * POST /api/iptv-plugin/fetch-qpanel-direct
 * Tenta buscar dados diretamente do servidor qPanel (sem relay).
 */
router.post('/fetch-qpanel-direct', async (req, res) => {
  try {
    const { username, panel_id } = req.body;
    
    // Buscar configurações do painel
    const panelResult = await pool.query('SELECT * FROM qpanel_panels WHERE status = $1', ['active']);
    if (panelResult.rows.length === 0) {
      return res.status(404).json({ error: 'Nenhum servidor qPanel configurado ou ativo' });
    }

    const finalServers = [];
    let methodUsed = 'direct_api';

    for (const panel of panelResult.rows) {
      try {
        const baseUrl = panel.panel_url.replace(/\/$/, '');
        const adminUser = panel.panel_username;
        const adminPass = panel.panel_password;

        // Tentar buscar via endpoint padrão do qPanel
        const response = await axios.get(`${baseUrl}/panel_api.php`, {
          params: {
            username: adminUser,
            password: adminPass,
            action: 'get_user_info',
            target_username: username
          },
          timeout: 8000
        });

        if (response.data && response.data.servers) {
          finalServers.push(...response.data.servers.map(s => ({
            ...s,
            panel_id: panel.id,
            panel_name: panel.panel_name
          })));
        }
      } catch (err) {
        console.warn(`⚠️ Painel ${panel.panel_name} falhou:`, err.message);
      }
    }

    // Sincronizar com banco local para cache
    const seenDns = new Set();
    for (const server of finalServers) {
      const serverName = server.server_name;
      const serverDns = server.server_dns;
      const panel_id = server.panel_id;

      await pool.query(`
        INSERT INTO qpanel_servers (panel_id, server_name, server_dns, server_data, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (panel_id, server_name)
        DO UPDATE SET server_dns = $3, server_data = $4, updated_at = NOW()
      `, [panel_id, serverName, serverDns, JSON.stringify(server)]);

      if (serverDns && !seenDns.has(serverDns)) {
        seenDns.add(serverDns);
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
