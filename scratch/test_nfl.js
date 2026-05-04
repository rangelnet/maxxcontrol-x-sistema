const axios = require('axios');
require('dotenv').config();

const API_KEY = 'e7d9f269046e4a7797f5cad93929cff8';

async function testNFL() {
  console.log(`--- TESTANDO API NFL ---`);
  
  // Endpoint de Schedules para a temporada de 2024
  const url = `https://api.sportsdata.io/v3/nfl/scores/json/Schedules/2024`;
  
  try {
    console.log(`Testando: ${url}`);
    const res = await axios.get(url, { params: { key: API_KEY } });
    console.log(`✅ SUCESSO na NFL! Itens: ${res.data?.length || 0}`);
    if (res.data?.length > 0) {
      console.log(`Exemplo: ${res.data[0].HomeTeam} vs ${res.data[0].AwayTeam}`);
    }
  } catch (e) {
    console.log(`❌ FALHA na NFL: ${e.response?.status || e.message}`);
    if (e.response?.data) console.log(`   Msg: ${JSON.stringify(e.response.data)}`);
  }
}

testNFL();
