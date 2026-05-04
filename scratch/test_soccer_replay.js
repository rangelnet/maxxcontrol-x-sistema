const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.SPORTSDATA_API_KEY || '69c6cf8e51114b09b5c5e8d8c3f4e3b2';
const DATE = '2024-05-19'; // Data com muitos jogos

async function testReplay() {
  console.log(`--- TESTANDO API REPLAY ---`);
  
  const urls = [
    `https://api.sportsdata.io/v3/soccer/replay/json/SchedulesByDate/${DATE}`,
    `https://api.sportsdata.io/v3/soccer/replay/json/GamesByDate/${DATE}`,
    `https://api.sportsdata.io/v3/soccer/scores/json/SchedulesByDate/${DATE}`
  ];

  for (const url of urls) {
    try {
      console.log(`Testando: ${url}`);
      const res = await axios.get(url, { params: { key: API_KEY } });
      console.log(`✅ SUCESSO! Encontrados ${res.data?.length || 0} jogos.`);
      if (res.data?.length > 0) {
        console.log(`Exemplo: ${res.data[0].HomeTeamName} vs ${res.data[0].AwayTeamName}`);
        break;
      }
    } catch (e) {
      console.log(`❌ FALHA: ${e.response?.status || e.message}`);
    }
  }
}

testReplay();
