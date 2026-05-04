const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.SPORTSDATA_API_KEY;
const SOCCER_BASE_URL = 'https://api.sportsdata.io/v3/soccer/scores/json';
const DATE = new Date().toISOString().split('T')[0];

async function testApi() {
  console.log(`--- TESTANDO API SPORTSDATA.IO ---`);
  console.log(`Chave: ${API_KEY ? API_KEY.substring(0, 5) + '...' : 'NÃO DEFINIDA'}`);
  console.log(`Data: ${DATE}`);
  
  try {
    const url = `${SOCCER_BASE_URL}/SchedulesByDate/${DATE}`;
    console.log(`URL: ${url}`);
    
    const response = await axios.get(url, {
      params: { key: API_KEY }
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Quantidade de jogos: ${response.data ? response.data.length : 0}`);
    
    if (response.data && response.data.length > 0) {
      const first = response.data[0];
      console.log('Primeiro jogo:', {
        Competition: first.CompetitionName,
        Home: first.HomeTeamName,
        Away: first.AwayTeamName,
        DateTime: first.DateTime,
        Status: first.Status
      });
      
      if (first.DateTime && (first.DateTime.includes('2019') || first.DateTime.includes('2024-04-12'))) {
        console.warn('⚠️ AVISO: A API está retornando DADOS DE AMOSTRA (Sample Data).');
      }
    } else {
      console.log('Resposta vazia. Tentando data de ontem para ver se há dados...');
      const ontem = new Date();
      ontem.setDate(ontem.getDate() - 1);
      const dataOntem = ontem.toISOString().split('T')[0];
      
      const resOntem = await axios.get(`${SOCCER_BASE_URL}/SchedulesByDate/${dataOntem}`, {
        params: { key: API_KEY }
      });
      console.log(`Jogos de ontem: ${resOntem.data ? resOntem.data.length : 0}`);
    }
    
  } catch (error) {
    console.error('Erro na requisição:', error.response ? error.response.data : error.message);
  }
}

testApi();
