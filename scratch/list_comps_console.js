const axios = require('axios');
require('dotenv').config();

const API_KEY = 'e7d9f269046e4a7797f5cad93929cff8';

async function listComps() {
  try {
    const res = await axios.get(`https://api.sportsdata.io/v4/soccer/scores/json/Competitions`, { params: { key: API_KEY } });
    console.log(`--- LISTA DE COMPETIÇÕES (PRIMEIRAS 50) ---`);
    res.data.slice(0, 50).forEach((c, i) => {
        console.log(`${i}. ${c.Name} - Key: ${c.Key} - Area: ${c.AreaName}`);
    });
  } catch (e) {
    console.log(`Erro: ${e.message}`);
  }
}

listComps();
