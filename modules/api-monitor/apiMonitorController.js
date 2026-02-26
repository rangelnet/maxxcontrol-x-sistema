const axios = require('axios');
const pool = require('../../config/database');

// Verificar status de uma API
async function checkAPIStatus(api) {
  const startTime = Date.now();
  
  try {
    const config = {
      method: api.metodo || 'GET',
      url: api.url,
      timeout: api.timeout || 5000,
      validateStatus: () => true
    };

    if (api.headers) {
      config.headers = typeof api.headers === 'string' ? JSON.parse(api.headers) : api.headers;
    }

    const response = await axios(config);
    const latency = Date.now() - startTime;
    const isOnline = response.status < 500;
    
    // Salvar no histórico
    if (api.id) {
      await pool.query(
        'INSERT INTO api_status_history (api_config_id, status, status_code, latencia) VALUES ($1, $2, $3, $4)',
        [api.id, isOnline ? 'online' : 'offline', response.status, latency]
      );
    }
    
    return {
      id: api.id,
      nome: api.nome,
      descricao: api.descricao,
      url: api.url,
      categoria: api.categoria,
      status: isOnline ? 'online' : 'offline',
      statusCode: response.status,
      latency,
      critica: api.critica,
      timestamp: new Date()
    };
  } catch (error) {
    // Salvar erro no histórico
    if (api.id) {
      await pool.query(
        'INSERT INTO api_status_history (api_config_id, status, status_code, latencia, erro) VALUES ($1, $2, $3, $4, $5)',
        [api.id, 'offline', 0, Date.now() - startTime, error.message]
      );
    }

    return {
      id: api.id,
      nome: api.nome,
      descricao: api.descricao,
      url: api.url,
      categoria: api.categoria,
      status: 'offline',
      statusCode: 0,
      latency: Date.now() - startTime,
      critica: api.critica,
      error: error.message,
      timestamp: new Date()
    };
  }
}

// Monitorar todas as APIs
exports.checkAllAPIs = async (req, res) => {
  try {
    // Buscar APIs ativas do banco
    const result = await pool.query('SELECT * FROM api_configs WHERE ativa = true ORDER BY critica DESC, nome ASC');
    const apis = result.rows;

    if (apis.length === 0) {
      return res.json({ 
        summary: { total: 0, online: 0, offline: 0, critical_offline: 0, avg_latency: 0 },
        apis: [] 
      });
    }

    const results = await Promise.all(apis.map(api => checkAPIStatus(api)));
    
    const onlineAPIs = results.filter(r => r.status === 'online');
    const summary = {
      total: results.length,
      online: onlineAPIs.length,
      offline: results.filter(r => r.status === 'offline').length,
      critical_offline: results.filter(r => r.status === 'offline' && r.critica).length,
      avg_latency: onlineAPIs.length > 0 
        ? Math.round(onlineAPIs.reduce((sum, r) => sum + r.latency, 0) / onlineAPIs.length)
        : 0
    };
    
    res.json({ summary, apis: results });
  } catch (error) {
    console.error('Erro ao monitorar APIs:', error);
    res.status(500).json({ error: 'Erro ao monitorar APIs' });
  }
};

// Obter histórico de uma API específica
exports.getAPIHistory = async (req, res) => {
  const { api_name } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT h.*, a.nome, a.url 
       FROM api_status_history h
       JOIN api_configs a ON h.api_config_id = a.id
       WHERE a.nome = $1
       ORDER BY h.verificado_em DESC
       LIMIT 100`,
      [api_name]
    );

    res.json({ history: result.rows });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
};

// Testar endpoint específico
exports.testEndpoint = async (req, res) => {
  const { url, method = 'GET', headers = {}, body = null } = req.body;
  
  try {
    const startTime = Date.now();
    const response = await axios({
      method,
      url,
      headers,
      data: body,
      timeout: 10000,
      validateStatus: () => true
    });
    
    const latency = Date.now() - startTime;
    
    res.json({
      success: true,
      status: response.status,
      latency,
      headers: response.headers,
      data: response.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
