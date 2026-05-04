const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.SPORTSDATA_API_KEY || '69c6cf8e51114b09b5c5e8d8c3f4e3b2';
const SAMPLE_DATE = '2024-04-12'; // Data clássica de Sample Data do SportsData.io

async function testSample() {
  console.log(`--- TESTANDO DATA DE AMOSTRA (SAMPLE DATA) ---`);
  console.log(`Data: ${SAMPLE_DATE}`);
  
  const url = `https://api.sportsdata.io/v3/soccer/scores/json/SchedulesByDate/${SAMPLE_DATE}`;
  
  try {
    console.log(`Testando: ${url}`);
    const res = await axios.get(url, { params: { key: API_KEY } });
    console.log(`✅ SUCESSO! Status: ${res.status}, Jogos: ${res.data?.length || 0}`);
    if (res.data?.length > 0) {
      console.log(`Exemplo: ${res.data[0].HomeTeamName} vs ${res.data[0].AwayTeamName}`);
    }
  } catch (e) {
    console.log(`❌ FALHA: ${e.response?.status || e.message}`);
    if (e.response?.data) console.log(`   Msg: ${JSON.stringify(e.response.data)}`);
  }
}

testSample();
