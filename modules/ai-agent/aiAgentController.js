const pool = require('../../config/database');
const axios = require('axios');
const tmdbService = require('../../services/tmdbService');

let currentTimer = null;

// Salva um log do Agente no Banco
const logAgent = async (level, message, source = 'N/A') => {
  try {
    await pool.query(
      `INSERT INTO ai_agent_logs (log_level, message, dns_source) VALUES ($1, $2, $3)`,
      [level, message, source]
    );
  } catch (err) {
    console.error('Erro ao salvar log de AI Agent:', err);
  }
};

// ==========================================
// MÉTODOS DA API (FRONTEND)
// ==========================================
exports.getConfig = async (req, res) => {
  try {
    let result = await pool.query('SELECT * FROM ai_agent_configs LIMIT 1');
    if (result.rows.length === 0) {
      // Cria config padrão se não existir
      result = await pool.query(`INSERT INTO ai_agent_configs (dns_list, is_active) VALUES ($1, $2) RETURNING *`, ['', false]);
    }
    res.json({ success: true, config: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar configuração.' });
  }
};

exports.updateConfig = async (req, res) => {
  const { dns_list, cron_schedule, is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE ai_agent_configs SET dns_list = $1, cron_schedule = $2, is_active = $3, updated_at = NOW() WHERE id = (SELECT id FROM ai_agent_configs LIMIT 1) RETURNING *`,
      [dns_list, cron_schedule, is_active]
    );
    
    res.json({ success: true, config: result.rows[0] });

    // Atualiza o job do CRON em background
    setupCronJob();
    await logAgent('info', `Configurações de Agente alteradas. CRON: ${cron_schedule}`, 'System');
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar configuração.' });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ai_agent_logs ORDER BY created_at DESC LIMIT 150');
    res.json({ success: true, logs: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar logs.' });
  }
};

exports.clearLogs = async (req, res) => {
  try {
    await pool.query('DELETE FROM ai_agent_logs');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao limpar logs.' });
  }
};

exports.scanNow = async (req, res) => {
  // Lança scan síncrono e devolve o evento.
  res.json({ success: true, message: 'Varredura forçada iniciada em background!' });
  runAgentScan(); // Roda de forma assíncrona
};

exports.getTopVod = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ai_vod_library ORDER BY occurrences DESC LIMIT 50');
    res.json({ success: true, vods: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar ranking VOD.' });
  }
};

exports.getSearchVod = async (req, res) => {
  const { query } = req.query;
  try {
    const result = await pool.query(
      `SELECT * FROM ai_vod_library WHERE name ILIKE $1 ORDER BY occurrences DESC LIMIT 20`, 
      [`%${query}%`]
    );
    res.json({ success: true, vods: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao pesquisar VOD.' });
  }
};

// ==========================================
// NÚCLEO DO AGENTE (INTELIGÊNCIA E VARREDURA)
// ==========================================

const parseApiToExtractVod = async (url) => {
  try {
    await logAgent('info', `Tentando gerar teste ou extrair catálogo na API: ${url}`, url);
    const response = await axios.post(url, {}, { timeout: 15000 }).catch(e => e.response);
    if (!response || !response.data) {
       await logAgent('error', `Falha de conexão com a API de geração de teste.`, url);
       return;
    }
    
    // A inteligência: Analisar se o retorno do chatbot tem URL XTREAM (M3U ou username/password)
    const dataStr = typeof response.data === 'object' ? JSON.stringify(response.data) : response.data.toString();
    
    let username = '';
    let password = '';
    let baseUrl = '';

    // 1ª Tentativa de Inteligência: Extração direta de chaves JSON (Padrão Mega99)
    if (typeof response.data === 'object') {
       if (response.data.username && response.data.password && response.data.dns) {
          username = response.data.username;
          password = response.data.password;
          baseUrl = response.data.dns;
          await logAgent('info', `✅ Credenciais capturadas via Chaves JSON Diretas!`, url);
       }
    }

    // 2ª Tentativa (Fallback): Regex Bruto (Caso venha em string de texto bagunçada)
    if (!username || !password) {
       const m3uRegex = /http[s]?:\/\/[^\s"'<>]+\/get\.php\?username=([^&]+)&password=([^&]+)&type=m3u/i;
       const credRegex = /(?:usuario|username|user)[\s:*]*([A-Za-z0-9_-]+).*?(?:senha|password|pass)[\s:*]*([A-Za-z0-9_-]+)/i;
       
       let matchM3u = dataStr.match(m3uRegex);
       if (matchM3u) {
         username = matchM3u[1];
         password = matchM3u[2];
         baseUrl = matchM3u[0].split('/get.php')[0];
       } else {
         let matchCred = dataStr.match(credRegex);
         if (matchCred) {
           username = matchCred[1];
           password = matchCred[2];
         }
         // Expressão para pegar DNS puro
         let matchDns = dataStr.match(/http[s]?:\/\/[A-Za-z0-9.-]+(?::\d+)?/i);
         if (matchDns && !baseUrl) {
            baseUrl = matchDns[0];
         }
       }
    }

      if (!username || !password || !baseUrl) {
         const snippet = dataStr.substring(0, 200);
         await logAgent('error', `Falha ao extrair credenciais Xtream na resposta. Retorno parcial da API: "${snippet}"...`, url);
         return;
      }

    await logAgent('success', `Teste de VOD obtido com sucesso! Logando em ${baseUrl} (User: ${username}). Iniciando extração...`, url);

    // === PASSO 2: FILMES E CATEGORIAS ===
    let vodCatsMap = {};
    try {
      const vodCatUrl = `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_categories`;
      const catRes = await axios.get(vodCatUrl, { timeout: 15000 });
      if (Array.isArray(catRes.data)) {
         catRes.data.forEach(c => { vodCatsMap[c.category_id] = c.category_name; });
      }
    } catch(e) {}

    const vodUrl = `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_streams`;
    const vodRes = await axios.get(vodUrl, { timeout: 30000 }).catch(() => null);
    
    // === PASSO 3: SÉRIES E CATEGORIAS ===
    let seriesCatsMap = {};
    try {
      const seriesCatUrl = `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_series_categories`;
      const scatRes = await axios.get(seriesCatUrl, { timeout: 15000 });
      if (Array.isArray(scatRes.data)) {
         scatRes.data.forEach(c => { seriesCatsMap[c.category_id] = c.category_name; });
      }
    } catch(e) {}

    const seriesUrl = `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_series`;
    const seriesRes = await axios.get(seriesUrl, { timeout: 30000 }).catch(() => null);

    // === PASSO 4: PROCESSAMENTO CONJUNTO (UPSERT) ===
    let allContent = [];
    if (vodRes && Array.isArray(vodRes.data)) {
       vodRes.data.forEach(v => allContent.push({ name: v.name, type: 'movie', cat_name: vodCatsMap[v.category_id] || 'Outros' }));
    }
    if (seriesRes && Array.isArray(seriesRes.data)) {
       seriesRes.data.forEach(s => allContent.push({ name: s.name, type: 'series', cat_name: seriesCatsMap[s.category_id] || 'Outros' }));
    }

    if (allContent.length > 0) {
       await logAgent('success', `Catálogo mapeado: ${allContent.length} itens encontrados (Filmes & Séries). Processando deduplicação em background...`, baseUrl);
       setTimeout(async () => {
         try {
           for (const item of allContent) {
             if (!item.name) continue;
             await pool.query(
               `INSERT INTO ai_vod_library (name, type, category_name) 
                VALUES ($1, $2, $3) 
                ON CONFLICT (name) DO UPDATE 
                SET occurrences = ai_vod_library.occurrences + 1, updated_at = CURRENT_TIMESTAMP, category_name = COALESCE(ai_vod_library.category_name, $3)`,
               [item.name.trim(), item.type, item.cat_name.trim()]
             );
           }
           await logAgent('info', `✅ Processamento VOD/Series concluído: ${allContent.length} itens unificados.`, baseUrl);
         } catch (e) {
           console.error("Erro ao salvar VOD/Series", e);
         }
       }, 5000);
    } else {
       await logAgent('error', `A API player_api falhou ao retornar streams de Filmes e Séries.`, baseUrl);
    }

  } catch (err) {
    await logAgent('error', `Falha severa na análise de VOD: ${err.message}`, url);
  }
};

const runAgentScan = async () => {
  try {
    const configRes = await pool.query('SELECT * FROM ai_agent_configs LIMIT 1');
    if (configRes.rows.length === 0) return;
    const config = configRes.rows[0];

    if (!config.is_active) {
       console.log('[AI AGENT] Varredura pulada. Agente inativo.');
       return;
    }

    await logAgent('info', 'Iniciando varredura global em todos os provedores listados.', 'Global_Scan');
    
    const dnsArray = (config.dns_list || '').split(',').map(s => s.trim()).filter(s => s.length > 0);
    if (dnsArray.length === 0) {
       await logAgent('info', 'Varredura finalizada sem efeito: Nenhuma URL configurada.', 'Global_Scan');
       return;
    }

    for (const dns of dnsArray) {
       // Para cada DNS ou API Chatbot de gerar teste, roda a lógica do agente autônomo
       await parseApiToExtractVod(dns);
    }

    await logAgent('success', 'Varredura Global VOD finalizada com êxito em todos os Endpoints.', 'Global_Scan');

  } catch (err) {
    await logAgent('error', `Erro grave durante Global Scan: ${err.message}`, 'Global_Scan');
  }
};

// ==========================================
// CRON JOB SETUP (NATIVO SEM LIBS)
// ==========================================
const setupCronJob = async () => {
  if (currentTimer) {
    clearInterval(currentTimer);
  }
  try {
    const configRes = await pool.query('SELECT * FROM ai_agent_configs LIMIT 1');
    if (configRes.rows.length === 0) return;
    const config = configRes.rows[0];

    if (config.is_active && config.cron_schedule) {
      let intervalMs = 24 * 60 * 60 * 1000; // 24h fallback
      if (config.cron_schedule.includes('*/6')) intervalMs = 6 * 60 * 60 * 1000;
      else if (config.cron_schedule.includes('*/12')) intervalMs = 12 * 60 * 60 * 1000;
      else if (config.cron_schedule.includes('*/1')) intervalMs = 60 * 60 * 1000; // 1 hr debug
      
      currentTimer = setInterval(() => {
        runAgentScan();
      }, intervalMs);
      
      console.log(`[AI AGENT] Polling nativo configurado para cada ${intervalMs / 3600000} horas.`);
      
      // Kick-off imediato da varredura após ativação/configuração!
      setTimeout(() => {
         runAgentScan();
      }, 3000);
    }
  } catch (err) {
    console.error('[AI AGENT] Falha ao setup CRON nativo', err);
  }
};

exports.initAI = async () => {
  // Cria tabela se nao existir para não quebrar 
  try {
      await pool.query(`CREATE TABLE IF NOT EXISTS ai_agent_configs (
        id SERIAL PRIMARY KEY,
        dns_list TEXT,
        cron_schedule VARCHAR(50) DEFAULT '0 3 * * *',
        is_active BOOLEAN DEFAULT false,
        extra_settings JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      await pool.query(`CREATE TABLE IF NOT EXISTS ai_agent_logs (
        id SERIAL PRIMARY KEY,
        log_level VARCHAR(20) DEFAULT 'info',
        message TEXT,
        dns_source VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      await pool.query(`CREATE TABLE IF NOT EXISTS ai_vod_library (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        type VARCHAR(50) DEFAULT 'movie',
        occurrences INTEGER DEFAULT 1,
        tmdb_id VARCHAR(50),
        poster_url TEXT,
        backdrop_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
  } catch (e) {
      console.error(e);
  }
  
  // Fallbacks de migração: Adiciona colunas se tabela antiga já existir sem elas
  try { await pool.query("ALTER TABLE ai_vod_library ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'movie'"); } catch(e){}
  try { await pool.query("UPDATE ai_vod_library SET type = 'movie' WHERE type IS NULL"); } catch(e){}
  try { await pool.query("ALTER TABLE ai_vod_library ADD COLUMN IF NOT EXISTS category_name VARCHAR(255)"); } catch(e){}
  
  await setupCronJob();
};

exports.getTopVod = async (req, res) => {
  try {
    const type = req.query.type || 'movie';
    const category = req.query.category || 'all';
    
    let query = 'SELECT * FROM ai_vod_library WHERE type = $1';
    let params = [type];
    
    if (category !== 'all') {
       query += ' AND category_name = $2';
       params.push(category);
    }
    
    query += ' ORDER BY occurrences DESC LIMIT 40';
    const { rows } = await pool.query(query, params);
    
    const result = [];
    for (const row of rows) {
      // Se não tiver capa, consulta TMDB on the fly e salva!
      if (!row.poster_url && row.name) {
         try {
           const cleanTitle = row.name.replace(/\s*\(\d{4}\)\s*/g, ' ').replace(/\[.*?\]/g, ' ').trim();
           await new Promise(res => setTimeout(res, 250)); // Throttling: 4 reqs/sec para evitar TMDB 502/429
           const fetchRes = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=7bc56e27708a9d2069fc999d44a6be0a&language=pt-BR&query=${encodeURIComponent(cleanTitle)}`);
           const tmdbRes = await fetchRes.json();
           
           if (tmdbRes.results && tmdbRes.results.length > 0) {
             const best = tmdbRes.results.find(r => r.poster_path) || tmdbRes.results[0];
             row.poster_url = best.poster_path;
             row.backdrop_url = best.backdrop_path;
             row.tmdb_id = best.id;
             await pool.query(
               'UPDATE ai_vod_library SET poster_url=$1, backdrop_url=$2, tmdb_id=$3 WHERE id=$4',
               [best.poster_path, best.backdrop_path, best.id, row.id]
             );
           }
         } catch(e) { /* Silencia erros de TMDB burst */ }
      }
      result.push({
         id: row.tmdb_id || row.id,
         titulo: row.name,
         poster_path: row.poster_url || row.stream_icon,
         backdrop_path: row.backdrop_url,
         overview: ''
      });
    }
    res.json({ success: true, conteudos: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSearchVod = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 3) return res.json({ resultados: [] });
    
    // Pesquisa no TMDB direto (mais rápido e rico) ou na library
    const tmdbRes = await tmdbService.pesquisarConteudo(query);
    const resultados = (tmdbRes.results || []).map(r => ({
       id: r.id,
       titulo: r.title || r.name,
       poster_path: r.poster_path,
       backdrop_path: r.backdrop_path,
       overview: r.overview
    }));
    res.json({ success: true, resultados });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const type = req.query.type || 'movie';
    const { rows } = await pool.query('SELECT DISTINCT category_name FROM ai_vod_library WHERE type = $1 AND category_name IS NOT NULL ORDER BY category_name ASC', [type]);
    res.json({ success: true, categories: rows.map(r => r.category_name) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
