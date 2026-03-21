const pool = require('../../config/database');
const cache = require('./cache');

/**
 * Obtém configuração Xtream (global ou de dispositivo específico)
 * @param {string|number} source - 'global' ou deviceId
 * @returns {Promise<object|null>} Configuração com xtream_url, xtream_username, xtream_password
 */
const getXtreamConfig = async (source) => {
  try {
    if (source === 'global') {
      // Buscar configuração global com nome do servidor (se existir)
      const result = await pool.query(`
        SELECT 
          isc.*,
          s.name as server_name
        FROM iptv_server_config isc
        LEFT JOIN servers s ON s.url = isc.xtream_url
        LIMIT 1
      `);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } else {
      // Buscar configuração de dispositivo específico
      const deviceId = parseInt(source);
      
      if (isNaN(deviceId)) {
        return null;
      }
      
      // Primeiro tenta configuração específica do dispositivo
      const deviceResult = await pool.query(`
        SELECT 
          dic.*,
          s.name as server_name
        FROM device_iptv_config dic
        LEFT JOIN servers s ON s.url = dic.xtream_url
        WHERE dic.device_id = $1
      `, [deviceId]);
      
      if (deviceResult.rows.length > 0) {
        return deviceResult.rows[0];
      }
      
      // Fallback para configuração global
      const globalResult = await pool.query(`
        SELECT 
          isc.*,
          s.name as server_name
        FROM iptv_server_config isc
        LEFT JOIN servers s ON s.url = isc.xtream_url
        LIMIT 1
      `);
      
      if (globalResult.rows.length === 0) {
        return null;
      }
      
      return globalResult.rows[0];
    }
  } catch (error) {
    console.error('❌ Erro ao buscar configuração Xtream:', error);
    return null;
  }
};

/**
 * Constrói URL da API Xtream
 * @param {object} config - Configuração com xtream_url, xtream_username, xtream_password
 * @param {string} action - Ação da API (ex: get_live_categories)
 * @param {object} params - Parâmetros adicionais (opcional)
 * @returns {string} URL completa
 */
const buildXtreamUrl = (config, action, params = {}) => {
  const { xtream_url, xtream_username, xtream_password } = config;
  
  const url = new URL(`${xtream_url}/player_api.php`);
  url.searchParams.append('username', xtream_username);
  url.searchParams.append('password', xtream_password);
  url.searchParams.append('action', action);
  
  // Adicionar parâmetros adicionais
  Object.keys(params).forEach(key => {
    url.searchParams.append(key, params[key]);
  });
  
  return url.toString();
};

/**
 * Faz requisição para API Xtream com timeout
 * @param {string} url - URL completa da API
 * @returns {Promise<any>} Dados JSON da resposta
 */
const fetchFromXtream = async (url) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 min timeout para listas grandes
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'MaxxControl/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('INVALID_CREDENTIALS');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('TIMEOUT');
    }
    throw error;
  }
};

/**
 * GET /api/iptv-tree/categories/:type
 * Busca categorias do servidor Xtream
 */
exports.getCategories = async (req, res) => {
  try {
    const { type } = req.params;
    const { source = 'global' } = req.query;
    
    // Validar tipo
    if (!['live', 'vod', 'series'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_TYPE',
        message: 'Tipo deve ser: live, vod ou series'
      });
    }
    
    // Obter configuração
    const config = await getXtreamConfig(source);
    if (!config || !config.xtream_url || !config.xtream_username || !config.xtream_password) {
      return res.status(400).json({
        success: false,
        error: 'CONFIG_NOT_FOUND',
        message: 'Configuração IPTV não encontrada ou incompleta'
      });
    }
    
    // Verificar cache
    const cacheKey = `${source}-categories-${type}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }
    
    // Buscar da API Xtream
    const action = `get_${type}_categories`;
    const url = buildXtreamUrl(config, action);
    
    try {
      const data = await fetchFromXtream(url);
      
      // Armazenar em cache (5 minutos)
      cache.set(cacheKey, data, 300);
      
      res.json({
        success: true,
        data: data,
        cached: false,
        timestamp: new Date().toISOString()
      });
      
    } catch (xtreamError) {
      if (xtreamError.message === 'INVALID_CREDENTIALS') {
        return res.status(401).json({
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Credenciais inválidas'
        });
      }
      if (xtreamError.message === 'TIMEOUT') {
        return res.status(504).json({
          success: false,
          error: 'TIMEOUT',
          message: 'Timeout na conexão com servidor IPTV'
        });
      }
      throw xtreamError;
    }
    
  } catch (error) {
    console.error('❌ Erro ao buscar categorias:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * GET /api/iptv-tree/streams/:type/:categoryId
 * Busca streams de uma categoria específica
 */
exports.getStreams = async (req, res) => {
  try {
    const { type, categoryId } = req.params;
    const { source = 'global' } = req.query;
    
    // Validar tipo
    if (!['live', 'vod'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_TYPE',
        message: 'Tipo deve ser: live ou vod'
      });
    }
    
    // Obter configuração
    const config = await getXtreamConfig(source);
    if (!config || !config.xtream_url || !config.xtream_username || !config.xtream_password) {
      return res.status(400).json({
        success: false,
        error: 'CONFIG_NOT_FOUND',
        message: 'Configuração IPTV não encontrada ou incompleta'
      });
    }
    
    // Verificar cache
    const cacheKey = `${source}-streams-${type}-${categoryId}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }
    
    // Buscar da API Xtream
    const action = `get_${type}_streams`;
    const url = buildXtreamUrl(config, action);
    
    try {
      const allStreams = await fetchFromXtream(url);
      
      // Filtrar por category_id
      const filtered = allStreams.filter(stream => 
        stream.category_id === categoryId || stream.category_id === parseInt(categoryId)
      );
      
      // Ordenar por num (para live TV)
      if (type === 'live') {
        filtered.sort((a, b) => {
          const numA = parseInt(a.num) || 0;
          const numB = parseInt(b.num) || 0;
          return numA - numB;
        });
      }
      
      // Armazenar em cache (10 minutos)
      cache.set(cacheKey, filtered, 600);
      
      res.json({
        success: true,
        data: filtered,
        cached: false,
        timestamp: new Date().toISOString()
      });
      
    } catch (xtreamError) {
      if (xtreamError.message === 'INVALID_CREDENTIALS') {
        return res.status(401).json({
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Credenciais inválidas'
        });
      }
      if (xtreamError.message === 'TIMEOUT') {
        return res.status(504).json({
          success: false,
          error: 'TIMEOUT',
          message: 'Timeout na conexão com servidor IPTV'
        });
      }
      throw xtreamError;
    }
    
  } catch (error) {
    console.error('❌ Erro ao buscar streams:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * GET /api/iptv-tree/series/:categoryId
 * Busca séries de uma categoria
 */
exports.getSeries = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { source = 'global' } = req.query;
    
    // Obter configuração
    const config = await getXtreamConfig(source);
    if (!config || !config.xtream_url || !config.xtream_username || !config.xtream_password) {
      return res.status(400).json({
        success: false,
        error: 'CONFIG_NOT_FOUND',
        message: 'Configuração IPTV não encontrada ou incompleta'
      });
    }
    
    // Verificar cache
    const cacheKey = `${source}-series-${categoryId}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }
    
    // Buscar da API Xtream
    const url = buildXtreamUrl(config, 'get_series');
    
    try {
      const allSeries = await fetchFromXtream(url);
      
      // Filtrar por category_id
      const filtered = allSeries.filter(series => 
        series.category_id === categoryId || series.category_id === parseInt(categoryId)
      );
      
      // Armazenar em cache (10 minutos)
      cache.set(cacheKey, filtered, 600);
      
      res.json({
        success: true,
        data: filtered,
        cached: false,
        timestamp: new Date().toISOString()
      });
      
    } catch (xtreamError) {
      if (xtreamError.message === 'INVALID_CREDENTIALS') {
        return res.status(401).json({
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Credenciais inválidas'
        });
      }
      if (xtreamError.message === 'TIMEOUT') {
        return res.status(504).json({
          success: false,
          error: 'TIMEOUT',
          message: 'Timeout na conexão com servidor IPTV'
        });
      }
      throw xtreamError;
    }
    
  } catch (error) {
    console.error('❌ Erro ao buscar séries:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * GET /api/iptv-tree/series-info/:seriesId
 * Busca detalhes de uma série (temporadas e episódios)
 */
exports.getSeriesInfo = async (req, res) => {
  try {
    const { seriesId } = req.params;
    const { source = 'global' } = req.query;
    
    // Obter configuração
    const config = await getXtreamConfig(source);
    if (!config || !config.xtream_url || !config.xtream_username || !config.xtream_password) {
      return res.status(400).json({
        success: false,
        error: 'CONFIG_NOT_FOUND',
        message: 'Configuração IPTV não encontrada ou incompleta'
      });
    }
    
    // Verificar cache
    const cacheKey = `${source}-series-info-${seriesId}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }
    
    // Buscar da API Xtream
    const url = buildXtreamUrl(config, 'get_series_info', { series_id: seriesId });
    
    try {
      const data = await fetchFromXtream(url);
      
      // Armazenar em cache (15 minutos)
      cache.set(cacheKey, data, 900);
      
      res.json({
        success: true,
        data: data,
        cached: false,
        timestamp: new Date().toISOString()
      });
      
    } catch (xtreamError) {
      if (xtreamError.message === 'INVALID_CREDENTIALS') {
        return res.status(401).json({
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Credenciais inválidas'
        });
      }
      if (xtreamError.message === 'TIMEOUT') {
        return res.status(504).json({
          success: false,
          error: 'TIMEOUT',
          message: 'Timeout na conexão com servidor IPTV'
        });
      }
      throw xtreamError;
    }
    
  } catch (error) {
    console.error('❌ Erro ao buscar informações da série:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * POST /api/iptv-tree/clear-cache
 * Limpa cache para uma fonte específica
 */
exports.clearCache = async (req, res) => {
  try {
    const { source } = req.body;
    
    if (!source) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_SOURCE',
        message: 'Parâmetro source é obrigatório'
      });
    }
    
    // Limpar todas as chaves que começam com o source
    const cleared = cache.clearByPrefix(`${source}-`);
    
    res.json({
      success: true,
      message: 'Cache limpo com sucesso',
      keysCleared: cleared
    });
    
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor'
    });
  }
};

// exports já está configurado corretamente via exports.xxx = ...
