const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.SPORTSDATA_API_KEY || '69c6cf8e51114b09b5c5e8d8c3f4e3b2';
const DATE = '2024-05-19'; // Data de exemplo (final da Premier League 2024) que costuma ter dados no Trial

async function testLeague() {
  console.log(`--- TESTANDO ACESSO POR LIGA (EPL) ---`);
  
  // No Soccer v3, o formato costuma ser Schedules/{competition}/{season} ou similar
  // Mas para o Trial, eles costumam liberar a EPL.
  
  const urls = [
    `https://api.sportsdata.io/v3/soccer/scores/json/SchedulesByDate/EPL/2024-05-19`,
    `https://api.sportsdata.io/v3/soccer/scores/json/GamesByDate/EPL/2024-05-19`,
    `https://api.sportsdata.io/v3/soccer/scores/json/SchedulesBySeason/EPL/2024`
  ];

  for (const url of urls) {
    try {
      console.log(`Testando: ${url}`);
      const res = await axios.get(url, { params: { key: API_KEY } });
      console.log(`✅ SUCESSO! Encontrados ${res.data?.length || 0} jogos.`);
      if (res.data?.length > 0) {
        console.log(`Primeiro jogo: ${res.data[0].HomeTeamName} vs ${res.data[0].AwayTeamName}`);
        break;
      }
    } catch (e) {
      console.log(`❌ FALHA: ${e.response?.status || e.message}`);
    }
  }
}

testLeague();
