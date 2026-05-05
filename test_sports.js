require('dotenv').config();
const axios = require('axios');

async function testApi() {
    const key = process.env.SPORTSDATA_API_KEY;
    console.log("Usando API KEY:", key ? "Existe (escondida)" : "NÃO ENCONTRADA");
    
    const date = new Date().toISOString().split('T')[0];
    const url = `https://api.sportsdata.io/v4/soccer/scores/json/GamesByDate/${date}`;
    
    console.log("Testando URL:", url);
    try {
        const response = await axios.get(url, { params: { key } });
        console.log("✅ SUCESSO! Jogos encontrados:", response.data.length);
        if (response.data.length > 0) {
            console.log("Primeiro jogo:", response.data[0].HomeTeamName, "x", response.data[0].AwayTeamName);
        }
    } catch (error) {
        console.log("❌ ERRO na API:");
        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Data:", error.response.data);
        } else {
            console.log("Message:", error.message);
        }
    }
}

testApi();
