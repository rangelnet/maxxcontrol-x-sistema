const axios = require('axios');
const pool = require('../config/database');

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Obter a API Key dinamicamente
async function getApiKey() {
  try {
    const res = await pool.query("SELECT value FROM global_settings WHERE key = 'tmdb_filters'");
    if (res.rows.length > 0 && res.rows[0].value.apiKey) {
      return res.rows[0].value.apiKey;
    }
  } catch (e) {
    console.error('Erro ao buscar TMDB API Key do banco:', e.message);
  }
  return process.env.TMDB_API_KEY || '7bc56e27708a9d2069fc999d44a6be0a';
}

// Buscar filme por ID
async function buscarFilmePorId(id) {
  try {
    const apiKey = await getApiKey();
    const response = await axios.get(`${BASE_URL}/movie/${id}`, {
      params: {
        api_key: apiKey,
        language: 'pt-BR',
        append_to_response: 'credits,videos,images'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar filme:', error.message);
    throw error;
  }
}

// Buscar série por ID
async function buscarSeriePorId(id) {
  try {
    const apiKey = await getApiKey();
    const response = await axios.get(`${BASE_URL}/tv/${id}`, {
      params: {
        api_key: apiKey,
        language: 'pt-BR',
        append_to_response: 'credits,videos,images'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar série:', error.message);
    throw error;
  }
}

// Buscar filmes populares
async function buscarFilmesPopulares(page = 1) {
  try {
    const apiKey = await getApiKey();
    const response = await axios.get(`${BASE_URL}/movie/popular`, {
      params: {
        api_key: apiKey,
        language: 'pt-BR',
        page
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar filmes populares:', error.message);
    throw error;
  }
}

// Buscar séries populares
async function buscarSeriesPopulares(page = 1) {
  try {
    const apiKey = await getApiKey();
    const response = await axios.get(`${BASE_URL}/tv/popular`, {
      params: {
        api_key: apiKey,
        language: 'pt-BR',
        page
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar séries populares:', error.message);
    throw error;
  }
}

// Pesquisar conteúdo
async function pesquisarConteudo(query, tipo = 'multi') {
  try {
    const apiKey = await getApiKey();
    const endpoint = tipo === 'multi' ? 'search/multi' : `search/${tipo}`;
    const response = await axios.get(`${BASE_URL}/${endpoint}`, {
      params: {
        api_key: apiKey,
        language: 'pt-BR',
        query
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao pesquisar:', error.message);
    throw error;
  }
}

// Obter URL de imagem
function getImageUrl(path, size = 'original') {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

module.exports = {
  buscarFilmePorId,
  buscarSeriePorId,
  buscarFilmesPopulares,
  buscarSeriesPopulares,
  pesquisarConteudo,
  getImageUrl
};
