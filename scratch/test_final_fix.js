const axios = require('axios');
require('dotenv').config();

const API_KEY = 'e7d9f269046e4a7797f5cad93929cff8';
const DATE = '2024-02-20'; // Data do Replay MLS 2024

async function testFinalFix() {
  console.log(`--- TESTE FINAL: REPLAY MLS 2024 ---`);
  
  const url = `https://api.sportsdata.io/v3/soccer/scores/json/GamesByDate/${DATE}`;
  
  try {
    console.log(`Testando: ${url}`);
    const res = await axios.get(url, { params: { key: API_KEY } });
    console.log(`✅ SUCESSO! Status: ${res.status}, Jogos: ${res.data?.length || 0}`);
    if (res.data?.length > 0) {
      const g = res.data[0];
      console.log(`Exemplo: ${g.HomeTeamName} vs ${g.AwayTeamName} - Status: ${g.Status}`);
    }
  } catch (e) {
    console.log(`❌ FALHA: ${e.response?.status || e.message}`);
    if (e.response?.data) console.log(`   Msg: ${JSON.stringify(e.response.data)}`);
  }
}

testFinalFix();
