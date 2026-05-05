const axios = require('axios');

console.log('🚀 [SportsService] Motor API-Football V3 Ativado! Versão 1.0.1');

// Configurações API-Football (v3)
const FOOTBALL_BASE_URL = 'https://v3.football.api-sports.io';
const SPORTSDB_BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3'; // Fallback para outros esportes

function getFootballKey() {
  return process.env.API_FOOTBALL_KEY || '7d356863a8b06bca1d7bfd9c2c87ce05';
}

// Cache inteligente em memória
const cache = {};

function getCache(key, ttl) {
  const now = Date.now();
  if (cache[key] && (now - cache[key].lastFetch < ttl)) {
    return cache[key].data;
  }
  return null;
}

function setCache(key, data) {
  cache[key] = {
    data,
    lastFetch: Date.now()
  };
}

// Mapeamento de Status: API-Football -> Frontend
function parseFootballStatus(status) {
    if (!status) return 'SCHEDULED';
    const s = status.toUpperCase();
    
    // Encerrados
    if (['FT', 'AET', 'PEN'].includes(s)) return 'FINAL';
    
    // Ao Vivo
    if (['1H', 'HT', '2H', 'ET', 'P', 'LIVE'].includes(s)) return 'INPROGRESS';
    
    // Adiados / Cancelados
    if (['PST', 'CANC', 'ABD'].includes(s)) return 'POSTPONED';
    
    // Programados
    return 'SCHEDULED';
}

/**
 * Busca jogos de futebol na API-Football v3
 */
async function getSoccerMatches(targetDate) {
  if (!targetDate) targetDate = new Date().toISOString().split('T')[0];
  
  const isToday = targetDate === new Date().toISOString().split('T')[0];
  const ttl = isToday ? 60 * 1000 : 60 * 60 * 1000; 
  
  const cacheKey = `soccer_v3_${targetDate}`;
  const cachedData = getCache(cacheKey, ttl);
  if (cachedData) {
    console.log(`⚽ [API-Football] Cache hit: ${targetDate}`);
    return cachedData;
  }

  try {
    console.log(`⚽ [API-Football] Buscando jogos para ${targetDate}...`);
    
    const response = await axios.get(`${FOOTBALL_BASE_URL}/fixtures`, {
      params: { date: targetDate },
      headers: {
        'x-apisports-key': getFootballKey()
      }
    });

    let allMatches = [];
    if (response.data && response.data.response) {
      console.log(`✅ [API-Football] Recebidos ${response.data.response.length} jogos.`);
      
      allMatches = response.data.response.map(item => {
        const fixture = item.fixture;
        const league = item.league;
        const teams = item.teams;
        const goals = item.goals;

        return {
          id: fixture.id,
          campeonato: league.name || 'Futebol',
          nome_liga: league.name,
          pais: league.country,
          flag: league.flag, // URL da bandeira
          time_casa: teams.home.name || 'TBA',
          logo_casa: teams.home.logo,
          time_fora: teams.away.name || 'TBA',
          logo_fora: teams.away.logo,
          horario: fixture.date ? new Date(fixture.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'A definir',
          data_fmt: fixture.date ? new Date(fixture.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '',
          status: parseFootballStatus(fixture.status.short),
          placar_casa: goals.home ?? 0,
          placar_fora: goals.away ?? 0,
          periodo: fixture.status.elapsed ? `${fixture.status.elapsed}'` : '',
          clock: fixture.status.elapsed || 0,
          canal: 'Ao Vivo'
        };
      });
    }

    // Agrupar por país
    const grouped = {};
    allMatches.forEach(m => {
      const pais = m.pais || 'Internacional';
      if (!grouped[pais]) {
        grouped[pais] = {
          id: pais,
          campeonato: pais.toUpperCase(),
          emoji: m.flag || '⚽',
          jogos: []
        };
      }
      grouped[pais].jogos.push(m);
    });

    // Ordenar: Brasil primeiro, depois Live, depois Alfabético
    const result = Object.values(grouped).sort((a, b) => {
      const aBrasil = a.campeonato === 'BRAZIL';
      const bBrasil = b.campeonato === 'BRAZIL';
      if (aBrasil !== bBrasil) return aBrasil ? -1 : 1;

      const aLive = a.jogos.some(j => j.status === 'INPROGRESS');
      const bLive = b.jogos.some(j => j.status === 'INPROGRESS');
      if (aLive !== bLive) return aLive ? -1 : 1;

      return a.campeonato.localeCompare(b.campeonato);
    });

    setCache(cacheKey, result);
    return result;

  } catch (error) {
    console.error(`❌ [API-Football] Erro:`, error.message);
    return cache[cacheKey]?.data || [];
  }
}

/**
 * Busca eventos de Lutas/MMA (Mantendo TheSportsDB por enquanto)
 */
async function getMmaMatches(targetDate) {
  if (!targetDate) targetDate = new Date().toISOString().split('T')[0];
  const cacheKey = `mma_${targetDate}`;
  const ttl = 60 * 60 * 1000; 
  const cachedData = getCache(cacheKey, ttl);
  if (cachedData) return cachedData;

  try {
    const url = `${SPORTSDB_BASE_URL}/eventsday.php?d=${targetDate}&s=Fighting`;
    const response = await axios.get(url);
    let events = [];
    if (response.data && response.data.events) {
      events = response.data.events.map(event => ({
        id: event.idEvent,
        campeonato: event.strLeague || 'Lutas / UFC',
        nome_evento: event.strEvent,
        data_fmt: event.dateEvent ? new Date(event.dateEvent).toLocaleDateString('pt-BR') : '',
        status: event.strStatus === 'Match Finished' ? 'FINAL' : 'SCHEDULED',
        jogos: []
      }));
    }
    const result = [{ campeonato: 'Eventos de Luta', emoji: '🥊', jogos: events }];
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    return [];
  }
}

/**
 * Busca jogos de basquete (NBA, etc) (Pode usar API-Basketball se quiser, por hora TheSportsDB)
 */
async function getBasketballMatches(targetDate) {
  if (!targetDate) targetDate = new Date().toISOString().split('T')[0];
  const cacheKey = `basket_${targetDate}`;
  const ttl = 60 * 1000; 
  const cachedData = getCache(cacheKey, ttl);
  if (cachedData) return cachedData;

  try {
    const url = `${SPORTSDB_BASE_URL}/eventsday.php?d=${targetDate}&s=Basketball`;
    const response = await axios.get(url);
    let games = [];
    if (response.data && response.data.events) {
      games = response.data.events.map(game => ({
        id: game.idEvent,
        campeonato: game.strLeague || 'Basquete',
        time_casa: game.strHomeTeam || 'TBA',
        time_fora: game.strAwayTeam || 'TBA',
        horario: game.strTime ? game.strTime.substring(0, 5) : 'A definir',
        data_fmt: game.dateEvent ? new Date(game.dateEvent).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '',
        status: game.strStatus === 'Match Finished' ? 'FINAL' : 'SCHEDULED',
        placar_casa: game.intHomeScore ?? 0,
        placar_fora: game.intAwayScore ?? 0
      }));
    }
    const grouped = {};
    games.forEach(m => {
      if (!grouped[m.campeonato]) {
        grouped[m.campeonato] = { id: m.campeonato, campeonato: m.campeonato, emoji: '🏀', jogos: [] };
      }
      grouped[m.campeonato].jogos.push(m);
    });
    const result = Object.values(grouped);
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    return [];
  }
}

module.exports = {
  getSoccerMatches,
  getMmaMatches,
  getBasketballMatches
};
