const axios = require('axios');

const SOCCER_BASE_URL = 'https://api.sportsdata.io/v4/soccer/scores/json';
const MMA_BASE_URL = 'https://api.sportsdata.io/v3/mma/scores/json';
const NBA_BASE_URL = 'https://api.sportsdata.io/v3/nba/scores/json';

function getApiKey() {
  return process.env.SPORTSDATA_API_KEY;
}

// Cache simples em memória
const cache = {
  soccer: { data: null, lastFetch: 0 },
  mma: { data: null, lastFetch: 0 },
  basketball: { data: null, lastFetch: 0 },
  ttl: 5 * 60 * 1000 // Aumentado para 5 minutos para economizar API Quota
};

/**
 * Busca jogos de futebol usando a API v4
 * Prioriza competições autorizadas (como UCL)
 */
async function getSoccerMatches() {
  const now = Date.now();
  if (cache.soccer.data && (now - cache.soccer.lastFetch < cache.ttl)) {
    console.log('⚽ Retornando placares de futebol do cache (v4)');
    return cache.soccer.data;
  }

  // Lista de competições para tentar buscar
  // UCL é a única confirmada como autorizada para esta chave no momento
  const competitions = ['UCL', 'BRSA', 'COLI', 'MLS']; 
  const season = 2026; // Temporada atual identificada nos testes
  
  let allMatches = [];

  try {
    for (const comp of competitions) {
      try {
        console.log(`⚽ Buscando agenda v4 para ${comp} (${season})...`);
        const url = `${SOCCER_BASE_URL}/Schedule/${comp}/${season}`;
        const response = await axios.get(url, { params: { key: getApiKey() } });

        if (response.data && response.data.length > 0) {
          console.log(`✅ Sucesso: ${comp} retornou ${response.data.length} jogos.`);
          
          const mapped = response.data.map(game => ({
            id: game.GameId,
            campeonato: comp === 'UCL' ? 'Champions League' : (game.CompetitionName || comp),
            time_casa: game.HomeTeamName,
            time_fora: game.AwayTeamName,
            horario: game.DateTime ? new Date(game.DateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'A definir',
            data_fmt: game.DateTime ? new Date(game.DateTime).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '',
            status: String(game.Status).toUpperCase(),
            placar_casa: game.HomeTeamScore ?? 0,
            placar_fora: game.AwayTeamScore ?? 0,
            periodo: game.Period || '',
            clock: game.Clock || 0,
            canal: 'Ao Vivo'
          }));
          
          allMatches = [...allMatches, ...mapped];
        }
      } catch (e) {
        if (e.response?.status === 401) {
          console.warn(`⚠️ Competição ${comp} não autorizada para esta chave.`);
        } else {
          console.error(`❌ Erro em ${comp}:`, e.message);
        }
      }
    }

    // Agrupar por campeonato para o frontend
    const grouped = {};
    allMatches.forEach(m => {
      if (!grouped[m.campeonato]) {
        grouped[m.campeonato] = {
          id: m.id,
          campeonato: m.campeonato,
          emoji: '⚽',
          jogos: []
        };
      }
      grouped[m.campeonato].jogos.push(m);
    });

    const result = Object.values(grouped);
    cache.soccer.data = result;
    cache.soccer.lastFetch = now;

    return result;
  } catch (error) {
    console.error('❌ Erro crítico no serviço de futebol:', error.message);
    return cache.soccer.data || [];
  }
}

/**
 * Busca eventos de MMA (UFC)
 * Mantido em v3 pois v4 de MMA ainda não foi validada
 */
async function getMmaMatches() {
  const now = Date.now();
  if (cache.mma.data && (now - cache.mma.lastFetch < cache.ttl)) {
    return cache.mma.data;
  }

  try {
    const year = 2026; // Sincronizado com o ano do sistema
    console.log(`🥊 Buscando eventos de MMA ${year} (v3)...`);
    const response = await axios.get(`${MMA_BASE_URL}/Schedule/UFC/${year}`, {
      params: { key: getApiKey() }
    });

    const events = response.data
      .filter(event => {
        const eventDate = new Date(event.Day);
        const today = new Date('2026-05-03'); // Data base do sistema
        const diff = Math.abs(eventDate - today);
        return diff < (60 * 24 * 60 * 60 * 1000); // eventos num raio de 60 dias
      })
      .map(event => ({
        id: event.EventId,
        campeonato: 'UFC',
        nome_evento: event.Name,
        data_fmt: new Date(event.Day).toLocaleDateString('pt-BR'),
        status: event.Status,
        jogos: []
      }));

    cache.mma.data = events;
    cache.mma.lastFetch = now;
    return events;
  } catch (error) {
    console.warn('🥊 MMA: Chave pode não ter acesso ou endpoint mudou.', error.message);
    return [];
  }
}

/**
 * Busca jogos de basquete (NBA)
 */
async function getBasketballMatches() {
  const now = Date.now();
  if (cache.basketball.data && (now - cache.basketball.lastFetch < cache.ttl)) {
    return cache.basketball.data;
  }

  try {
    const date = '2026-05-03'; // Data base do sistema
    console.log(`🏀 Buscando jogos da NBA para ${date} (v3)...`);
    const response = await axios.get(`${NBA_BASE_URL}/GamesByDate/${date}`, {
      params: { key: getApiKey() }
    });

    const games = response.data.map(game => ({
      id: game.GameID,
      campeonato: 'NBA',
      time_casa: game.HomeTeam,
      time_fora: game.AwayTeam,
      horario: game.DateTime ? new Date(game.DateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'A definir',
      status: String(game.Status).toUpperCase(),
      placar_casa: game.HomeTeamScore ?? 0,
      placar_fora: game.AwayTeamScore ?? 0
    }));

    cache.basketball.data = games;
    cache.basketball.lastFetch = now;
    return games;
  } catch (error) {
    console.warn('🏀 NBA: Chave pode não ter acesso.', error.message);
    return [];
  }
}

module.exports = {
  getSoccerMatches,
  getMmaMatches,
  getBasketballMatches
};
