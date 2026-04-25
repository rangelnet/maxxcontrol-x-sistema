const axios = require('axios');

const API_KEY = '69c6cf8e51114b09b5c5e8d8c3f4e3b2';
const DATE = new Date().toISOString().split('T')[0];
const URL_NBA = `https://api.sportsdata.io/v3/nba/scores/json/GamesByDate/${DATE}`;

async function test() {
  console.log(`Testando NBA para data: ${DATE}`);
  try {
    const response = await axios.get(URL_NBA, { params: { key: API_KEY } });
    console.log('Resultados NBA:', response.data.length);
    if (response.data.length > 0) {
      console.log('Primeiro jogo NBA:', response.data[0].HomeTeam, 'vs', response.data[0].AwayTeam);
    }
  } catch (err) {
    console.error('Erro NBA:', err.message);
  }
}

test();
