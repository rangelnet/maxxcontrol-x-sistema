const pool = require('../../config/database');
const axios = require('axios');

/**
 * Controller para Playlist Manager 4-in-1
 * Gerencia servidores IPTV e cadastro em 4 plataformas
 */

/**
 * GET /api/playlist-manager/servers
 * Listar todos os servidores cadastrados
 */
exports.listServers = async (req, res) => {
  try {
    const query = `
      SELECT id, name, dns, created_at, updated_at
      FROM playlist_servers
      ORDER BY name ASC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
    
  } catch (error) {
    console.error('❌ Erro ao listar servidores:', error);
    res.status(500).json({ error: 'Erro ao listar servidores' });
  }
};

/**
 * POST /api/playlist-manager/servers
 * Adicionar novo servidor
 */
exports.addServer = async (req, res) => {
  try {
    const { name, dns } = req.body;
    
    // Validação
    if (!name || !dns) {
      return res.status(400).json({ error: 'Nome e DNS são obrigatórios' });
    }
    
    // Remover protocolo do DNS se existir
    const cleanDns = dns.replace(/^https?:\/\//, '');
    
    const query = `
      INSERT INTO playlist_servers (name, dns)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    const result = await pool.query(query, [name, cleanDns]);
    
    console.log(`✅ Servidor adicionado: ${name} (${cleanDns})`);
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('❌ Erro ao adicionar servidor:', error);
    res.status(500).json({ error: 'Erro ao adicionar servidor' });
  }
};

/**
 * DELETE /api/playlist-manager/servers/:id
 * Deletar servidor
 */
exports.deleteServer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM playlist_servers WHERE id = $1 RETURNING name';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }
    
    console.log(`🗑️ Servidor deletado: ${result.rows[0].name} (ID: ${id})`);
    res.json({ success: true, message: 'Servidor deletado com sucesso' });
    
  } catch (error) {
    console.error('❌ Erro ao deletar servidor:', error);
    res.status(500).json({ error: 'Erro ao deletar servidor' });
  }
};

/**
 * POST /api/playlist-manager/register
 * Registrar playlists em múltiplos servidores
 */
exports.registerPlaylists = async (req, res) => {
  try {
    const { platform, serverIds, mac, username, password } = req.body;
    
    // Validação
    if (!platform || !serverIds || !Array.isArray(serverIds) || serverIds.length === 0) {
      return res.status(400).json({ error: 'Plataforma e servidores são obrigatórios' });
    }
    
    if (!mac || !username || !password) {
      return res.status(400).json({ error: 'MAC, usuário e senha são obrigatórios' });
    }
    
    // Validar formato MAC
    const macRegex = /^[0-9A-Fa-f:]{17}$/;
    if (!macRegex.test(mac)) {
      return res.status(400).json({ error: 'Formato de MAC inválido' });
    }
    
    // Buscar servidores
    const serversQuery = `
      SELECT id, name, dns
      FROM playlist_servers
      WHERE id = ANY($1)
    `;
    const serversResult = await pool.query(serversQuery, [serverIds]);
    
    if (serversResult.rows.length === 0) {
      return res.status(404).json({ error: 'Nenhum servidor encontrado' });
    }
    
    const results = [];
    
    // Registrar em cada servidor
    for (const server of serversResult.rows) {
      try {
        const playlistUrl = buildPlaylistUrl(server.dns, username, password);
        
        let result;
        switch (platform) {
          case 'smartone':
            result = await registerSmartOne({ mac, username, password, server, playlistUrl });
            break;
          case 'ibocast':
            result = await registerIBOCast({ mac, username, password, server, playlistUrl });
            break;
          case 'ibopro':
            result = await registerIBOPro({ mac, username, password, server, playlistUrl });
            break;
          case 'vuplayer':
            result = await registerVUPlayer({ mac, username, password, server, playlistUrl });
            break;
          default:
            throw new Error('Plataforma não suportada');
        }
        
        results.push({
          server: server.name,
          success: true,
          message: result.message
        });
        
      } catch (error) {
        results.push({
          server: server.name,
          success: false,
          error: error.message
        });
      }
    }
    
    // Contar sucessos e erros
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;
    
    console.log(`📊 Registro em lote: ${successCount} sucesso(s), ${errorCount} erro(s)`);
    
    res.json({
      success: true,
      results,
      summary: {
        total: results.length,
        success: successCount,
        error: errorCount
      }
    });
    
  } catch (error) {
    console.error('❌ Erro no registro em lote:', error);
    res.status(500).json({ error: 'Erro no registro em lote' });
  }
};

/**
 * Construir URL da playlist Xtream
 */
function buildPlaylistUrl(dns, username, password) {
  // Remove protocolo se existir
  dns = dns.replace(/^https?:\/\//, '');
  
  return `http://${dns}/get.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&type=m3u_plus&output=mpegts`;
}

/**
 * Registrar no SmartOne
 */
async function registerSmartOne(data) {
  const { mac, server, playlistUrl } = data;
  
  console.log(`📝 Registrando no SmartOne: ${server.name}`);
  
  try {
    // Fazer requisição para SmartOne
    const response = await axios.post(
      'https://smartone-iptv.com/client/plugin/smart_one/client_main/add_playlist/',
      new URLSearchParams({
        'form_action': 'generate_xtream_playlist',
        'mac': mac,
        'xtream_name': server.name,
        'xtream_playlist': playlistUrl,
        'note': playlistUrl
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        maxRedirects: 0,
        validateStatus: (status) => status < 400
      }
    );
    
    console.log(`✅ SmartOne: ${server.name} - Sucesso`);
    return { success: true, message: 'Cadastrado com sucesso' };
    
  } catch (error) {
    console.error(`❌ SmartOne: ${server.name} - Erro:`, error.message);
    throw new Error(`Erro no SmartOne: ${error.message}`);
  }
}

/**
 * Registrar no IBOCast
 */
async function registerIBOCast(data) {
  const { mac, server, playlistUrl } = data;
  
  console.log(`📝 Registrando no IBOCast: ${server.name}`);
  
  try {
    const response = await axios.post(
      'https://ibocast.com/client/plugin/application/client_playlists/add/',
      new URLSearchParams({
        'form_action': 'generate_m3u_playlist',
        'mac': mac,
        'm3u_name': server.name,
        'm3u_playlist': playlistUrl,
        'epg_url': '',
        'note': playlistUrl
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        maxRedirects: 0,
        validateStatus: (status) => status < 400
      }
    );
    
    console.log(`✅ IBOCast: ${server.name} - Sucesso`);
    return { success: true, message: 'Cadastrado com sucesso' };
    
  } catch (error) {
    console.error(`❌ IBOCast: ${server.name} - Erro:`, error.message);
    throw new Error(`Erro no IBOCast: ${error.message}`);
  }
}

/**
 * Registrar no IBOPro
 */
async function registerIBOPro(data) {
  const { mac, server, playlistUrl } = data;
  
  console.log(`📝 Registrando no IBOPro: ${server.name}`);
  
  try {
    const response = await axios.post(
      'https://api.iboproapp.com/playlistw',
      {
        mac_address: mac,
        playlist_name: server.name,
        playlist_url: playlistUrl,
        playlist_type: 'URL',
        playlist_username: '',
        playlist_password: '',
        is_protected: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    console.log(`✅ IBOPro: ${server.name} - Sucesso`);
    return { success: true, message: 'Cadastrado com sucesso' };
    
  } catch (error) {
    console.error(`❌ IBOPro: ${server.name} - Erro:`, error.message);
    
    if (error.response?.status === 401) {
      throw new Error('IBOPro: Autenticação necessária. Faça login no IBOPro primeiro.');
    }
    
    throw new Error(`Erro no IBOPro: ${error.message}`);
  }
}

/**
 * Registrar no VU Player
 */
async function registerVUPlayer(data) {
  const { mac, server, playlistUrl } = data;
  
  console.log(`📝 Registrando no VU Player: ${server.name}`);
  
  try {
    const response = await axios.post(
      'https://vuplayer.com/client/plugin/application/client_playlists/add/',
      new URLSearchParams({
        'mac': mac,
        'device_id': mac,
        'playlist_name': server.name,
        'playlist_url': playlistUrl
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        maxRedirects: 0,
        validateStatus: (status) => status < 400
      }
    );
    
    console.log(`✅ VU Player: ${server.name} - Sucesso`);
    return { success: true, message: 'Cadastrado com sucesso' };
    
  } catch (error) {
    console.error(`❌ VU Player: ${server.name} - Erro:`, error.message);
    throw new Error(`Erro no VU Player: ${error.message}`);
  }
}

// exports já está configurado corretamente via exports.xxx = ...
