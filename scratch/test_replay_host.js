const axios = require('axios');
require('dotenv').config();

const API_KEY = 'e7d9f269046e4a7797f5cad93929cff8';
const DATE = '2024-02-20';

async function testReplayHost() {
  console.log(`--- TESTANDO HOST DE REPLAY ---`);
  
  // O subagente descobriu que o host correto para replay é replay.sportsdata.io
  const url = `https://replay.sportsdata.io/v3/soccer/scores/json/GamesByDate/${DATE}`;
  
  try {
    console.log(`Tentando buscar jogos no host REPLAY: ${url}`);
    const res = await axios.get(url, { 
      headers: { 'Ocp-Apim-Subscription-Key': API_KEY } 
    });
    
    if (res.status === 200) {
      console.log(`✅ SUCESSO NO HOST REPLAY!`);
      console.log(`Jogos encontrados: ${res.data?.length || 0}`);
      if (res.data?.length > 0) {
        console.log(`Exemplo: ${res.data[0].HomeTeamName} vs ${res.data[0].AwayTeamName}`);
      }
    }
  } catch (e) {
    console.log(`❌ FALHA no host REPLAY: ${e.response?.status || e.message}`);
    if (e.response?.data) console.log(`   Msg: ${JSON.stringify(e.response.data)}`);
    
    console.log(`\nTentando com parâmetro 'key' em vez de header...`);
    try {
        const res2 = await axios.get(url, { params: { key: API_KEY } });
        console.log(`✅ SUCESSO com parâmetro 'key'!`);
    } catch (e2) {
        console.log(`❌ FALHA também com parâmetro 'key': ${e2.response?.status || e2.message}`);
    }
  }
}

testReplayHost();
