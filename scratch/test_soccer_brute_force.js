const axios = require('axios');
require('dotenv').config();

const API_KEY = 'e7d9f269046e4a7797f5cad93929cff8';
const DATE = '2024-02-20';

async function bruteForce() {
  console.log(`--- PENTE FINO: ENDPOINTS SOCCER ---`);
  
  const endpoints = [
    `GamesByDate/${DATE}`,
    `SchedulesByDate/${DATE}`,
    `GamesInProgress`,
    `GamesInProgress/MLS`,
    `Schedule/MLS/2024`,
    `Competitions`,
    `Members/Replays`,
    `BoxScores/${DATE}`,
    `ActiveMembers`
  ];

  for (const ep of endpoints) {
    const url = `https://api.sportsdata.io/v3/soccer/scores/json/${ep}`;
    try {
      console.log(`Testando: ${ep}...`);
      const res = await axios.get(url, { params: { key: API_KEY } });
      console.log(`✅ SUCESSO em ${ep}! Status: ${res.status}, Itens: ${res.data?.length || 0}`);
      if (res.data) {
          console.log(`Dados: ${JSON.stringify(res.data).substring(0, 100)}...`);
          break;
      }
    } catch (e) {
      console.log(`❌ FALHA em ${ep}: ${e.response?.status || e.message}`);
    }
  }
}

bruteForce();
