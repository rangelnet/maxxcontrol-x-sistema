const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.SPORTSDATA_API_KEY || '69c6cf8e51114b09b5c5e8d8c3f4e3b2';
const DATE = '2024-05-19';

async function testFinal() {
  console.log(`--- TESTE DEFINITIVO SOCCER ---`);
  
  const patterns = [
    `https://api.sportsdata.io/v3/soccer/scores/json/Schedule/EPL/2024`,
    `https://api.sportsdata.io/v3/soccer/scores/json/Schedules/EPL/2024`,
    `https://api.sportsdata.io/v3/soccer/scores/json/GamesByDate/EPL/2024-05-19`,
    `https://api.sportsdata.io/v3/soccer/scores/json/SchedulesByDate/2024-05-19`,
    `https://api.sportsdata.io/v3/soccer/replay/json/Schedule/EPL/2024`,
    `https://api.sportsdata.io/v3/soccer/scores/json/Areas`,
    `https://api.sportsdata.io/v3/soccer/scores/json/Competitions`
  ];

  for (const url of patterns) {
    try {
      console.log(`Testando: ${url}`);
      const res = await axios.get(url, { params: { key: API_KEY } });
      console.log(`✅ SUCESSO! Status: ${res.status}, Itens: ${res.data?.length || 0}`);
      if (res.data?.length > 0) {
        console.log(`Exemplo: ${JSON.stringify(res.data[0]).substring(0, 100)}...`);
        break;
      }
    } catch (e) {
      console.log(`❌ FALHA: ${e.response?.status || e.message}`);
      if (e.response?.data) console.log(`   Msg: ${JSON.stringify(e.response.data)}`);
    }
  }
}

testFinal();
