const axios = require('axios');

const API_KEY = process.env.SPORTSDATA_API_KEY;
const SOCCER_BASE_URL = 'https://api.sportsdata.io/v3/soccer/scores/json';
const MMA_BASE_URL = 'https://api.sportsdata.io/v3/mma/scores/json';

const NBA_BASE_URL = 'https://api.sportsdata.io/v3/nba/scores/json';

// Cache simples em memória
const cache = {
  soccer: { data: null, lastFetch: 0 },
  mma: { data: null, lastFetch: 0 },
  basketball: { data: null, lastFetch: 0 },
  ttl: 2 * 60 * 1000 // 2 minutos
};

/**
 * Busca jogos de futebol para uma data específica
 * @param {string} date - Formato YYYY-MM-DD
 */
async function getSoccerMatches(date = new Date().toISOString().split('T')[0]) {
  const now = Date.now();
  if (cache.soccer.data && (now - cache.soccer.lastFetch < cache.ttl)) {
    console.log('⚽ Retornando placares de futebol do cache');
    return cache.soccer.data;
  }

  try {
    console.log(`⚽ Buscando placares de futebol para ${date} na SportsData.io...`);
    const response = await axios.get(`${SOCCER_BASE_URL}/SchedulesByDate/${date}`, {
      params: { key: API_KEY }
    });

    // Diagnóstico de dados obsoletos (Sample Data)
    if (response.data && response.data.length > 0) {
      const firstGame = response.data[0];
      console.log(`📡 [DIAG] Primeiro jogo recebido: ${firstGame.HomeTeamName} vs ${firstGame.AwayTeamName} - Data: ${firstGame.DateTime}`);
      if (firstGame.DateTime && firstGame.DateTime.includes('2019') || firstGame.DateTime.includes('2024-04-12')) {
        console.warn('⚠️ AVISO: A API está retornando "Sample Data" (Dados de Amostra). Verifique se seu trial está ativo e se a chave tem permissões para dados em tempo real.');
      }
    }

    // Mapear para o formato que o frontend espera
    const matches = response.data.map(game => ({
      id: game.GameId,
      campeonato: game.CompetitionName || 'Futebol',
      time_casa: game.HomeTeamName,
      time_fora: game.AwayTeamName,
      horario: game.DateTime ? new Date(game.DateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'A definir',
      data_fmt: game.DateTime ? new Date(game.DateTime).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '',
      status: String(game.Status).toUpperCase(),
      placar_casa: game.HomeTeamScore ?? 0,
      placar_fora: game.AwayTeamScore ?? 0,
      periodo: game.Period || '',
      clock: game.Clock || 0,
      canal: 'A definir' // API gratuita geralmente não fornece canal, deixamos placeholder
    }));

    // Agrupar por campeonato
    const grouped = {};
    matches.forEach(m => {
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
    console.error('❌ Erro ao buscar futebol:', error.message);
    return cache.soccer.data || []; // Fallback para cache antigo se falhar
  }
}

/**
 * Busca eventos de MMA (UFC)
 */
async function getMmaMatches() {
  const now = Date.now();
  if (cache.mma.data && (now - cache.mma.lastFetch < cache.ttl)) {
    return cache.mma.data;
  }

  try {
    const year = new Date().getFullYear();
    console.log(`🥊 Buscando eventos de MMA ${year} na SportsData.io...`);
    const response = await axios.get(`${MMA_BASE_URL}/Schedule/UFC/${year}`, {
      params: { key: API_KEY }
    });

    // Filtra apenas eventos próximos ou recentes
    const events = response.data
      .filter(event => {
        const eventDate = new Date(event.Day);
        const diff = Math.abs(eventDate - new Date());
        return diff < (30 * 24 * 60 * 60 * 1000); // eventos num raio de 30 dias
      })
      .map(event => ({
        id: event.EventId,
        campeonato: 'UFC',
        nome_evento: event.Name,
        data_fmt: new Date(event.Day).toLocaleDateString('pt-BR'),
        status: event.Status,
        jogos: [] // MMA geralmente é uma lista de lutas, aqui simplificaremos como o evento
      }));

    cache.mma.data = events;
    cache.mma.lastFetch = now;
    return events;
  } catch (error) {
    console.error('❌ Erro ao buscar MMA:', error.message);
    return [];
  }
}

/**
 * Busca jogos de basquete (NBA)
 */
async function getBasketballMatches(date = new Date().toISOString().split('T')[0]) {
  const now = Date.now();
  if (cache.basketball.data && (now - cache.basketball.lastFetch < cache.ttl)) {
    return cache.basketball.data;
  }

  try {
    console.log(`🏀 Buscando jogos da NBA para ${date}...`);
    const response = await axios.get(`${NBA_BASE_URL}/GamesByDate/${date}`, {
      params: { key: API_KEY }
    });

    console.log(`📡 [DIAG] NBA response status: ${response.status} - Encontrados: ${response.data?.length || 0}`);

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
    console.error('❌ Erro ao buscar Basquete:', error.message);
    return [];
  }
}

module.exports = {
  getSoccerMatches,
  getMmaMatches,
  getBasketballMatches
};
