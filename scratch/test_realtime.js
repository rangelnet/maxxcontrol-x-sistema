const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.SPORTSDATA_API_KEY || '69c6cf8e51114b09b5c5e8d8c3f4e3b2';
const date = new Date().toISOString().split('T')[0];

async function test() {
  console.log(`🚀 Iniciando Diagnóstico de API Esportiva - Data: ${date}`);
  console.log(`🔑 Chave em uso: ${API_KEY.substring(0, 5)}...`);
  console.log('--------------------------------------------------');

  // 1. SOCCER
  try {
    const res = await axios.get(`https://api.sportsdata.io/v3/soccer/scores/json/SchedulesByDate/${date}?key=${API_KEY}`);
    console.log(`✅ SOCCER: Sucesso! Encontrados ${res.data.length} jogos.`);
    if (res.data.length > 0) {
      console.log(`   Exemplo: ${res.data[0].HomeTeamName} vs ${res.data[0].AwayTeamName} (${res.data[0].DateTime})`);
    }
  } catch (e) {
    console.log(`❌ SOCCER Falhou: ${e.response?.status || e.message}`);
  }

  // 2. NBA
  try {
    const res = await axios.get(`https://api.sportsdata.io/v3/nba/scores/json/GamesByDate/${date}?key=${API_KEY}`);
    console.log(`✅ NBA: Sucesso! Encontrados ${res.data.length} jogos.`);
  } catch (e) {
    console.log(`❌ NBA Falhou: ${e.response?.status || e.message}`);
    if (e.response?.status === 401) {
      console.log('   💡 Dica: Verifique se sua chave tem acesso ao trial de NBA.');
    }
  }

  // 3. MMA
  try {
    const year = new Date().getFullYear();
    const res = await axios.get(`https://api.sportsdata.io/v3/mma/scores/json/Schedule/UFC/${year}?key=${API_KEY}`);
    console.log(`✅ MMA: Sucesso! Encontrados ${res.data.length} eventos para ${year}.`);
  } catch (e) {
    console.log(`❌ MMA Falhou: ${e.response?.status || e.message}`);
  }

  console.log('--------------------------------------------------');
  console.log('💡 Fim do Diagnóstico');
}

test();
