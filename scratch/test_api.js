const axios = require('axios');
require('dotenv').config();

const API_KEY = '69c6cf8e51114b09b5c5e8d8c3f4e3b2';
const DATE = new Date().toISOString().split('T')[0];
const URL = `https://api.sportsdata.io/v3/soccer/scores/json/SchedulesByDate/${DATE}`;

async function test() {
  console.log(`Testando API para data: ${DATE}`);
  try {
    const response = await axios.get(URL, { params: { key: API_KEY } });
    console.log('Resultados encontrados:', response.data.length);
    if (response.data.length > 0) {
      console.log('Exemplo do primeiro jogo:');
      const game = response.data[0];
      console.log(`Campeonato: ${game.CompetitionName}`);
      console.log(`Times: ${game.HomeTeamName} vs ${game.AwayTeamName}`);
      console.log(`Data/Hora: ${game.DateTime}`);
    } else {
      console.log('Nenhum jogo retornado pela API para hoje.');
    }
  } catch (err) {
    console.error('Erro na API:', err.message);
  }
}

test();
