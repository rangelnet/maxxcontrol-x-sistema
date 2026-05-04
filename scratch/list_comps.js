const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const API_KEY = 'e7d9f269046e4a7797f5cad93929cff8';

async function listComps() {
  try {
    const res = await axios.get(`https://api.sportsdata.io/v4/soccer/scores/json/Competitions`, { params: { key: API_KEY } });
    const comps = res.data.map(c => ({ Name: c.Name, Key: c.Key, AreaName: c.AreaName }));
    fs.writeFileSync('scratch/competitions_list.json', JSON.stringify(comps, null, 2));
    console.log(`Salvas ${comps.length} competições em scratch/competitions_list.json`);
  } catch (e) {
    console.log(`Erro: ${e.message}`);
  }
}

listComps();
