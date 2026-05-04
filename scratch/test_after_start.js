const axios = require('axios');
require('dotenv').config();

const API_KEY = 'e7d9f269046e4a7797f5cad93929cff8';
const DATE = '2024-02-24'; // Uma data no meio da semana de simulação

async function testAfterStart() {
  console.log(`--- TESTE PÓS-ATIVAÇÃO DE SIMULAÇÃO ---`);
  
  const url = `https://api.sportsdata.io/v3/soccer/scores/json/GamesByDate/${DATE}`;
  
  try {
    console.log(`Tentando buscar jogos em: ${url}`);
    const res = await axios.get(url, { params: { key: API_KEY } });
    
    if (res.status === 200) {
      console.log(`✅ SUCESSO ABSOLUTO!`);
      console.log(`Jogos encontrados: ${res.data.length}`);
      if (res.data.length > 0) {
        console.log(`Exemplo: ${res.data[0].HomeTeamName} vs ${res.data[0].AwayTeamName}`);
        console.log(`Status atual: ${res.data[0].Status}`);
      }
    }
  } catch (e) {
    if (e.response?.status === 401) {
      console.log(`❌ AINDA BLOQUEADO (401): Certifique-se de que clicou em "Start Simulation" no portal da SportsData.io.`);
    } else {
      console.log(`❌ ERRO: ${e.response?.status || e.message}`);
    }
  }
}

testAfterStart();
