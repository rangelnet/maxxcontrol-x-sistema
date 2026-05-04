const axios = require('axios');
require('dotenv').config();

const API_KEY = 'e7d9f269046e4a7797f5cad93929cff8';
const DATE = '2024-05-19';

async function testAll() {
  console.log(`--- TESTANDO NOVA CHAVE EM TODOS OS ESPORTES ---`);
  
  const tests = [
    { name: 'Soccer Scores', url: `https://api.sportsdata.io/v3/soccer/scores/json/Competitions` },
    { name: 'MMA Scores', url: `https://api.sportsdata.io/v3/mma/scores/json/Competitions` },
    { name: 'NBA Scores', url: `https://api.sportsdata.io/v3/nba/scores/json/GamesByDate/${DATE}` },
    { name: 'Global Soccer', url: `https://api.sportsdata.io/v3/soccer/scores/json/SchedulesByDate/EPL/${DATE}` },
    { name: 'Soccer Replay', url: `https://api.sportsdata.io/v3/soccer/replay/json/SchedulesByDate/${DATE}` }
  ];

  for (const t of tests) {
    try {
      console.log(`Testando ${t.name}...`);
      const res = await axios.get(t.url, { params: { key: API_KEY } });
      console.log(`✅ SUCESSO em ${t.name}! Itens: ${res.data?.length || 0}`);
      if (res.data) break;
    } catch (e) {
      console.log(`❌ FALHA em ${t.name}: ${e.response?.status || e.message}`);
    }
  }
}

testAll();
