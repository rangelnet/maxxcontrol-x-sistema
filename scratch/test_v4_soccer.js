const axios = require('axios');
require('dotenv').config();

const API_KEY = 'e7d9f269046e4a7797f5cad93929cff8';

async function discoverAuthorized() {
  console.log(`--- PENTE FINO: DESCOBRINDO O QUE FUNCIONA ---`);
  
  try {
    const compRes = await axios.get(`https://api.sportsdata.io/v4/soccer/scores/json/Competitions`, { params: { key: API_KEY } });
    const allComps = compRes.data;
    console.log(`Total de competições encontradas: ${allComps.length}`);

    const targetKeys = ['UCL', 'BRSA', 'COLI', 'SPL', 'MLS'];
    
    for (const key of targetKeys) {
        const comp = allComps.find(c => c.Key === key);
        if (!comp) {
            console.log(`\nComp não encontrada: ${key}`);
            continue;
        }

        console.log(`\nTestando: ${comp.Name} (${comp.Key})...`);
        const season = 2026;

        const urls = [
            `https://api.sportsdata.io/v4/soccer/scores/json/Schedule/${comp.Key}/${season}`
        ];

        for (const url of urls) {
            try {
                const res = await axios.get(url, { params: { key: API_KEY } });
                console.log(`  ✅ SUCESSO! URL: ${url}`);
                console.log(`  Itens: ${res.data?.length || 0}`);
            } catch (e) {
                const status = e.response?.status;
                const desc = e.response?.data?.Description || e.message;
                console.log(`  ❌ FALHA (${status}): ${desc.substring(0, 100)}...`);
            }
        }
    }
    console.log(`\nNenhuma das 30 primeiras competições funcionou nos padrões testados.`);
  } catch (e) {
    console.log(`Erro crítico: ${e.message}`);
  }
}

discoverAuthorized();
