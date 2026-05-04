const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.SPORTSDATA_API_KEY || '69c6cf8e51114b09b5c5e8d8c3f4e3b2';
const DATE = new Date().toISOString().split('T')[0];

async function tryEndpoints() {
  const endpoints = [
    `https://api.sportsdata.io/v3/soccer/scores/json/SchedulesByDate/${DATE}`,
    `https://api.sportsdata.io/v3/soccer/scores/json/GamesByDate/${DATE}`,
    `https://api.sportsdata.io/v3/soccer/scores/json/ScheduleByDate/${DATE}`,
    `https://api.sportsdata.io/v3/soccer/stats/json/SchedulesByDate/${DATE}`
  ];

  console.log(`--- TESTANDO ENDPOINTS SOCCER ---`);
  
  for (const url of endpoints) {
    try {
      console.log(`Testando: ${url}`);
      const res = await axios.get(url, { params: { key: API_KEY } });
      console.log(`✅ SUCESSO! Status: ${res.status}, Jogos: ${res.data?.length || 0}`);
      if (res.data?.length > 0) break;
    } catch (e) {
      console.log(`❌ FALHA: ${e.response?.status || e.message}`);
    }
  }
}

tryEndpoints();
