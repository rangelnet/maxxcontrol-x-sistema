const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.SPORTSDATA_API_KEY || 'e7d9f269046e4a7797f5cad93929cff8';
const DATE = '2024-05-19'; // Data com jogos reais gravados no Replay

async function testReplay() {
  console.log(`--- TESTANDO REPLAY COM CHAVE NOVA ---`);
  console.log(`Chave: ${API_KEY.substring(0, 5)}...`);
  
  const patterns = [
    `https://api.sportsdata.io/v3/soccer/replay/json/SchedulesByDate/${DATE}`,
    `https://api.sportsdata.io/v3/soccer/replay/json/Schedule/EPL/2024`,
    `https://api.sportsdata.io/v3/soccer/scores/json/Competitions`
  ];

  for (const url of patterns) {
    try {
      console.log(`Testando: ${url}`);
      const res = await axios.get(url, { params: { key: API_KEY } });
      console.log(`✅ SUCESSO! Status: ${res.status}, Itens: ${res.data?.length || 0}`);
      if (res.data?.length > 0) {
        console.log(`Exemplo: ${res.data[0].HomeTeamName || res.data[0].Name} vs ${res.data[0].AwayTeamName || ''}`);
        break;
      }
    } catch (e) {
      console.log(`❌ FALHA: ${e.response?.status || e.message}`);
      if (e.response?.data) console.log(`   Msg: ${JSON.stringify(e.response.data)}`);
    }
  }
}

testReplay();
