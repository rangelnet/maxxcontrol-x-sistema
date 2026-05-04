require('dotenv').config();
const sportsService = require('../services/sportsService');

async function validate() {
  console.log('--- VALIDANDO sportsService.js ATUALIZADO ---');
  
  console.log('\n⚽ Testando getSoccerMatches()...');
  const soccer = await sportsService.getSoccerMatches();
  console.log(`Resultado Soccer: ${soccer.length} ligas encontradas.`);
  if (soccer.length > 0) {
      soccer.forEach(s => console.log(` - ${s.campeonato}: ${s.jogos.length} jogos`));
  }

  console.log('\n🥊 Testando getMmaMatches()...');
  const mma = await sportsService.getMmaMatches();
  console.log(`Resultado MMA: ${mma.length} eventos.`);

  console.log('\n🏀 Testando getBasketballMatches()...');
  const nba = await sportsService.getBasketballMatches();
  console.log(`Resultado NBA: ${nba.length} jogos.`);
}

validate();
