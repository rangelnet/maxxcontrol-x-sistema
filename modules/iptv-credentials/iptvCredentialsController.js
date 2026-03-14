const axios = require('axios');
const pool = require('../../config/database');

/**
 * Controller para gerenciamento de credenciais IPTV
 * Integra com API IPTV externa para criar e resetar credenciais
 */

/**
 * POST /api/iptv/create-credentials
 * Cria credenciais IPTV únicas para um dispositivo
 */
exports.createCredentials = async (req, res) => {
  try {
    const { mac_address } = req.body;
    
    // Validar MAC address
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(mac_address)) {
      return res.status(400).json({ error: 'MAC address inválido' });
    }
    
    // Verificar se dispositivo existe
    const deviceQuery = 'SELECT id FROM devices WHERE mac_address = $1';
    const deviceResult = await pool.query(deviceQuery, [mac_address]);
    
    if (deviceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dispositivo não encontrado' });
    }
    
    // Chamar API IPTV externa para criar credenciais
    const iptvApiUrl = process.env.IPTV_API_URL;
    const iptvApiKey = process.env.IPTV_API_KEY;
    
    if (!iptvApiUrl || !iptvApiKey) {
      console.error('❌ Variáveis de ambiente IPTV_API_URL ou IPTV_API_KEY não configuradas');
      return res.status(500).json({ 
        error: 'Configuração da API IPTV não encontrada' 
      });
    }
    
    console.log(`📡 Chamando API IPTV para criar credenciais: ${mac_address}`);
    
    const response = await axios.post(`${iptvApiUrl}/create-user`, {
      mac_address: mac_address,
      api_key: iptvApiKey
    }, {
      timeout: 10000
    });
    
    const { username, password, server_url, expires_at } = response.data;
    
    if (!username || !password || !server_url) {
      throw new Error('Resposta da API IPTV incompleta');
    }
    
    // Salvar credenciais no banco
    const updateQuery = `
      UPDATE devices 
      SET username = $1, password = $2, server = $3, updated_at = NOW()
      WHERE mac_address = $4
      RETURNING id, username, server
    `;
    
    const updateResult = await pool.query(updateQuery, [
      username, password, server_url, mac_address
    ]);
    
    console.log(`✅ Credenciais criadas para dispositivo ${mac_address}`);
    
    res.json({
      success: true,
      username,
      password,
      server_url,
      expires_at: expires_at || null
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar credenciais:', error.message);
    
    if (error.response) {
      return res.status(500).json({ 
        error: 'Erro na API IPTV: ' + (error.response.data?.message || error.response.statusText)
      });
    }
    
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Timeout ao conectar com API IPTV' });
    }
    
    res.status(500).json({ error: 'Erro ao criar credenciais' });
  }
};

/**
 * POST /api/iptv/reset-credentials
 * Reseta credenciais IPTV de um dispositivo (deleta antigas e cria novas)
 */
exports.resetCredentials = async (req, res) => {
  try {
    const { mac_address } = req.body;
    
    // Validar MAC address
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(mac_address)) {
      return res.status(400).json({ error: 'MAC address inválido' });
    }
    
    // Buscar credenciais antigas
    const oldCredsQuery = 'SELECT username FROM devices WHERE mac_address = $1';
    const oldCredsResult = await pool.query(oldCredsQuery, [mac_address]);
    
    if (oldCredsResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dispositivo não encontrado' });
    }
    
    const oldUsername = oldCredsResult.rows[0].username;
    
    // Deletar credenciais antigas na API IPTV (se existirem)
    if (oldUsername) {
      const iptvApiUrl = process.env.IPTV_API_URL;
      const iptvApiKey = process.env.IPTV_API_KEY;
      
      if (iptvApiUrl && iptvApiKey) {
        try {
          console.log(`🗑️  Deletando credenciais antigas: ${oldUsername}`);
          
          await axios.delete(`${iptvApiUrl}/delete-user/${oldUsername}`, {
            headers: { 'X-API-Key': iptvApiKey },
            timeout: 10000
          });
          
          console.log(`✅ Credenciais antigas deletadas`);
        } catch (deleteError) {
          console.warn('⚠️  Erro ao deletar credenciais antigas (continuando):', deleteError.message);
          // Continuar mesmo se falhar ao deletar
        }
      }
    }
    
    // Criar novas credenciais (reutilizar função createCredentials)
    return exports.createCredentials(req, res);
    
  } catch (error) {
    console.error('❌ Erro ao resetar credenciais:', error.message);
    res.status(500).json({ error: 'Erro ao resetar credenciais' });
  }
};
