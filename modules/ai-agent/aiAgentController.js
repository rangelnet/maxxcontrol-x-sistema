const pool = require('../../config/database');
const axios = require('axios');
const tmdbService = require('../../services/tmdbService');
const animeManager = require('../anime-manager/animeManagerController');
const adultManager = require('../adult-manager/adultManagerController');
const { captureMiddleFrameToSupabase } = require('../../services/videoFrameCapture');

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
      result = await pool.query(`INSERT INTO ai_agent_configs (dns_list, is_active, auto_approve_words) VALUES ($1, $2, $3) RETURNING *`, ['', false, false]);
    }
    res.json({ success: true, config: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar configuração.' });
  }
};

exports.updateConfig = async (req, res) => {
  const { dns_list, cron_schedule, is_active, auto_approve_words } = req.body;
  try {
    // Adiciona a coluna auto_approve_words se não existir
    try { await pool.query("ALTER TABLE ai_agent_configs ADD COLUMN auto_approve_words BOOLEAN DEFAULT false"); } catch(e){}

    const result = await pool.query(
      `UPDATE ai_agent_configs SET dns_list = $1, cron_schedule = $2, is_active = $3, auto_approve_words = $4, updated_at = NOW() WHERE id = (SELECT id FROM ai_agent_configs LIMIT 1) RETURNING *`,
      [dns_list, cron_schedule, is_active, auto_approve_words || false]
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

const detectDirtyWords = (title) => {
  let found = [];
  
  // 1. Tags in brackets or parentheses (excluding pure years like 2024)
  const bracketRegex = /\[([^\]]+)\]|\(([a-zA-Z]+[^)]*)\)/g; 
  let match;
  while ((match = bracketRegex.exec(title)) !== null) {
     let word = (match[1] || match[2]).trim().toLowerCase();
     if (word.length > 1 && word.length < 20 && !/^\d{4}$/.test(word)) {
        found.push(word);
     }
  }

  // 2. Known technical/quality/platform patterns
  const patterns = /\b(1080p|720p|2160p|4k|8k|fhd|hd|sd|dual|dublado|legendado|leg|dub|nacional|netflix|nfx|amazon|amaz|prime|disney|globo|hbo|apple|paramount|starz|youtube|ts|cam|lancamento|web-dl|webrip|hdtv|bluray|remux|s\d+e\d+|s\d+|vol\.\d+|ch\d+)\b/gi;
  
  while ((match = patterns.exec(title)) !== null) {
     found.push(match[1].toLowerCase());
  }

  return [...new Set(found)];
};

const normalizeXtreamBaseUrl = (value) => String(value || '').trim().replace(/\/+$/, '');

const encodeXtreamPart = (value) => encodeURIComponent(String(value || '').trim());

const cleanExtension = (value) => {
  const raw = String(value || 'mp4').trim().replace(/^\./, '').split('?')[0].split('&')[0];
  return raw || 'mp4';
};

const pickIptvImage = (item) => {
  return item?.stream_icon || item?.cover || item?.movie_image || item?.cover_big || item?.backdrop_path || null;
};

const buildVodPlaybackUrl = (baseUrl, username, password, streamId, extension) => {
  if (!baseUrl || !username || !password || !streamId) return null;
  return normalizeXtreamBaseUrl(baseUrl) + '/movie/' + encodeXtreamPart(username) + '/' + encodeXtreamPart(password) + '/' + encodeURIComponent(String(streamId)) + '.' + cleanExtension(extension);
};

const applyNexusMiddleFrame = async (libraryRow, item, sourceDns) => {
  if (!libraryRow?.id || item.type !== 'movie' || !item.source_url) return;
  if (libraryRow.auto_frame_url && libraryRow.image_source === 'auto_middle_frame') return;

  try {
    await pool.query(
      `UPDATE ai_vod_library
       SET auto_frame_status = 'processing', auto_frame_error = NULL, auto_frame_updated_at = NOW()
       WHERE id = $1`,
      [libraryRow.id]
    );

    const frame = await captureMiddleFrameToSupabase(item.source_url, {
      title: item.name,
      folder: 'nexus-middle-frames'
    });

    await pool.query(
      `UPDATE ai_vod_library
       SET auto_frame_url = $1,
           poster_url = $1,
           auto_frame_status = 'ready',
           auto_frame_error = NULL,
           auto_frame_updated_at = NOW(),
           image_source = 'auto_middle_frame',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [frame.publicUrl, libraryRow.id]
    );

    await logAgent('success', 'Imagem automatica gerada do meio do video: ' + item.name + ' (' + frame.seekSeconds + 's)', sourceDns);
  } catch (error) {
    await pool.query(
      `UPDATE ai_vod_library
       SET auto_frame_status = 'failed', auto_frame_error = $1, auto_frame_updated_at = NOW()
       WHERE id = $2`,
      [String(error.message || error).slice(0, 500), libraryRow.id]
    ).catch(() => {});
    await logAgent('warning', 'Falha ao gerar imagem do meio do video para ' + item.name + ': ' + error.message, sourceDns);
  }
};

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
       vodRes.data.forEach(v => {
         const streamId = v.stream_id || v.id;
         const extension = cleanExtension(v.container_extension || v.container || v.extension || 'mp4');
         const sourceUrl = buildVodPlaybackUrl(baseUrl, username, password, streamId, extension);
         allContent.push({
           name: v.name,
           type: 'movie',
           cat_name: vodCatsMap[v.category_id] || 'Outros',
           category_id: v.category_id || null,
           stream_id: streamId || null,
           container_extension: extension,
           stream_icon: pickIptvImage(v),
           source_url: sourceUrl
         });
       });
    }
    if (seriesRes && Array.isArray(seriesRes.data)) {
       seriesRes.data.forEach(s => allContent.push({
         name: s.name,
         type: 'series',
         cat_name: seriesCatsMap[s.category_id] || 'Outros',
         category_id: s.category_id || null,
         series_id: s.series_id || s.id || null,
         stream_icon: pickIptvImage(s)
       }));
    }

    if (allContent.length > 0) {
       await logAgent('success', `Catálogo mapeado: ${allContent.length} itens encontrados (Filmes & Séries). Processando deduplicação em background...`, baseUrl);
       setTimeout(async () => {
         try {
           // Obter config para saber se auto_aprova
           let autoApprove = false;
           try {
              const cfg = await pool.query('SELECT auto_approve_words FROM ai_agent_configs LIMIT 1');
              if (cfg.rows.length > 0 && cfg.rows[0].auto_approve_words) {
                 autoApprove = true;
              }
           } catch(e) {}

           for (const item of allContent) {
             if (!item.name) continue;
             
             // Detectar e salvar palavras sujas encontradas no título
             const dirtyWords = detectDirtyWords(item.name);
             for (const word of dirtyWords) {
               const statusToSet = autoApprove ? 'approved' : 'new';
               const insertRes = await pool.query(
                 `INSERT INTO ai_tmdb_dirty_words (word, example_title, source_dns, status) 
                  VALUES ($1, $2, $3, $4) 
                  ON CONFLICT (word) DO UPDATE 
                  SET occurrences = ai_tmdb_dirty_words.occurrences + 1 RETURNING *`,
                 [word, item.name.trim(), baseUrl, statusToSet]
               );
               
               // Se foi auto_aprovado e era a primeira vez (ou se preferirmos sempre mandar para o global para garantir)
               if (autoApprove && insertRes.rows.length > 0) {
                  await _addWordToGlobalTmdb(insertRes.rows[0].word);
               }
             }

             const savedContent = await pool.query(
               `INSERT INTO ai_vod_library (
                  name, type, category_name, source_dns, source_stream_id, source_series_id,
                  source_category_id, container_extension, stream_icon, poster_url, image_source, source_url
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9, CASE WHEN $9 IS NULL THEN NULL ELSE 'iptv' END, $10)
                ON CONFLICT (name) DO UPDATE
                SET occurrences = ai_vod_library.occurrences + 1,
                    updated_at = CURRENT_TIMESTAMP,
                    type = COALESCE(EXCLUDED.type, ai_vod_library.type),
                    category_name = COALESCE(EXCLUDED.category_name, ai_vod_library.category_name),
                    source_dns = COALESCE(EXCLUDED.source_dns, ai_vod_library.source_dns),
                    source_stream_id = COALESCE(EXCLUDED.source_stream_id, ai_vod_library.source_stream_id),
                    source_series_id = COALESCE(EXCLUDED.source_series_id, ai_vod_library.source_series_id),
                    source_category_id = COALESCE(EXCLUDED.source_category_id, ai_vod_library.source_category_id),
                    container_extension = COALESCE(EXCLUDED.container_extension, ai_vod_library.container_extension),
                    stream_icon = COALESCE(EXCLUDED.stream_icon, ai_vod_library.stream_icon),
                    source_url = COALESCE(EXCLUDED.source_url, ai_vod_library.source_url),
                    poster_url = CASE
                      WHEN ai_vod_library.image_source = 'manual' THEN ai_vod_library.poster_url
                      WHEN ai_vod_library.auto_frame_url IS NOT NULL THEN ai_vod_library.auto_frame_url
                      ELSE COALESCE(ai_vod_library.poster_url, EXCLUDED.poster_url)
                    END,
                    image_source = CASE
                      WHEN ai_vod_library.image_source = 'manual' THEN 'manual'
                      WHEN ai_vod_library.auto_frame_url IS NOT NULL THEN 'auto_middle_frame'
                      ELSE COALESCE(ai_vod_library.image_source, EXCLUDED.image_source)
                    END
                RETURNING *`,
               [
                 item.name.trim(),
                 item.type,
                 item.cat_name?.trim() || null,
                 normalizeXtreamBaseUrl(baseUrl),
                 item.stream_id ? String(item.stream_id) : null,
                 item.series_id ? String(item.series_id) : null,
                 item.category_id ? String(item.category_id) : null,
                 item.container_extension || null,
                 item.stream_icon || null,
                 item.source_url || null
               ]
             );

             await applyNexusMiddleFrame(savedContent.rows[0], item, baseUrl);
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

// ==========================================
// AUDITORIA DE PLATAFORMAS (TMDB + PROVIDERS)
// ==========================================
const runPlatformAudit = async () => {
  try {
    const res = await pool.query("SELECT value FROM global_settings WHERE key = 'tmdb_filters'");
    let dirtyWordsArray = [];
    if (res.rows.length > 0) {
      const data = typeof res.rows[0].value === 'string' ? JSON.parse(res.rows[0].value) : res.rows[0].value;
      dirtyWordsArray = data.words.split(',').map(w => w.trim().toLowerCase());
    }

    const { rows: vods } = await pool.query(`
      SELECT v.* FROM ai_vod_library v 
      LEFT JOIN ai_platform_audits a ON v.id = a.vod_id
      WHERE a.id IS NULL
      ORDER BY v.updated_at DESC
      LIMIT 15
    `);

    if (vods.length === 0) return;
    await logAgent('info', `Iniciando Auditoria de Plataformas para ${vods.length} conteúdos em background...`, 'System');

    const platformKeywords = {
      'netflix': 'Netflix', 'nfx': 'Netflix',
      'prime': 'Prime Video', 'amazon': 'Prime Video',
      'disney': 'Disney+',
      'hbo': 'HBO Max', 'max': 'HBO Max',
      'globoplay': 'Globoplay', 'globo': 'Globoplay',
      'paramount': 'Paramount+',
      'star': 'Star+', 'star\\+': 'Star+',
      'apple': 'Apple TV+',
      'youtube': 'YouTube'
    };

    for (const vod of vods) {
      let cleanName = vod.name.replace(/\s*\(\d{4}\)\s*/g, ' ').replace(/\[.*?\]/g, ' ');
      for (const dw of dirtyWordsArray) {
        if (dw.length > 1) {
          const reg = new RegExp(`\\b${dw}\\b`, 'gi');
          cleanName = cleanName.replace(reg, '');
        }
      }
      cleanName = cleanName.trim().replace(/\s{2,}/g, ' ');

      let detectedNamePlatform = null;
      const lowerName = vod.name.toLowerCase();
      for (const [kw, plat] of Object.entries(platformKeywords)) {
        if (new RegExp(`\\b${kw}\\b`, 'i').test(lowerName)) {
          detectedNamePlatform = plat;
          break;
        }
      }

      await new Promise(res => setTimeout(res, 400));
      const tmdbSearch = await tmdbService.pesquisarConteudo(cleanName, vod.type === 'series' ? 'tv' : 'movie');
      let detectedTmdbPlatform = null;
      let tmdbId = null;
      let confidence = 'Baixa';

      if (tmdbSearch.results && tmdbSearch.results.length > 0) {
        const bestMatch = tmdbSearch.results[0];
        tmdbId = bestMatch.id;
        
        await new Promise(res => setTimeout(res, 400));
        let providersData;
        if (vod.type === 'series') {
          providersData = await tmdbService.buscarProvidersSerie(tmdbId);
        } else {
          providersData = await tmdbService.buscarProvidersFilme(tmdbId);
        }

        if (providersData && providersData.results && providersData.results.BR) {
          const brProviders = providersData.results.BR.flatrate || [];
          if (brProviders.length > 0) {
            detectedTmdbPlatform = brProviders[0].provider_name;
            confidence = 'Alta';
          }
        }
      }

      let shouldAudit = false;
      const currentCatLower = (vod.category_name || '').toLowerCase();
      let finalDetected = detectedTmdbPlatform || detectedNamePlatform;

      if (finalDetected) {
        const platformBaseName = finalDetected.toLowerCase().split(' ')[0].replace('+', '');
        const isMatch = currentCatLower.includes(platformBaseName);
        
        if (!isMatch) {
          shouldAudit = true;
          if (detectedNamePlatform && detectedTmdbPlatform && detectedNamePlatform.includes(detectedTmdbPlatform.split(' ')[0])) {
            confidence = 'Muito Alta';
          } else if (!detectedTmdbPlatform && detectedNamePlatform) {
            confidence = 'Média';
          }
        }
      }

      if (shouldAudit) {
        await pool.query(
          `INSERT INTO ai_platform_audits 
           (vod_id, original_name, clean_name, content_type, current_platform, detected_name_platform, detected_tmdb_platform, confidence, tmdb_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [vod.id, vod.name, cleanName, vod.type, vod.category_name || 'Desconhecida', detectedNamePlatform, detectedTmdbPlatform, confidence, tmdbId]
        );
      } else {
        await pool.query(
          `INSERT INTO ai_platform_audits 
           (vod_id, original_name, clean_name, content_type, current_platform, status)
           VALUES ($1, $2, $3, $4, $5, 'ignored')`,
          [vod.id, vod.name, cleanName, vod.type, vod.category_name || 'Desconhecida']
        );
      }
    }
    await logAgent('success', `Auditoria de Plataformas TMDB concluída para este ciclo.`, 'System');
  } catch(e) {
    console.error('Erro na auditoria de plataforma', e);
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
    
    // Roda a auditoria de plataformas no fim do ciclo
    setTimeout(runPlatformAudit, 10000);
    setTimeout(() => animeManager.runAnimeScanBackground(), 14000);
    setTimeout(() => adultManager.runAdultScanBackground(), 18000);

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
        auto_approve_words BOOLEAN DEFAULT false,
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
        source_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      await pool.query(`CREATE TABLE IF NOT EXISTS ai_tmdb_dirty_words (
        id SERIAL PRIMARY KEY,
        word VARCHAR(255) UNIQUE NOT NULL,
        occurrences INTEGER DEFAULT 1,
        example_title VARCHAR(255),
        source_dns VARCHAR(255),
        status VARCHAR(20) DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      await pool.query(`CREATE TABLE IF NOT EXISTS ai_platform_audits (
        id SERIAL PRIMARY KEY,
        vod_id INTEGER,
        original_name VARCHAR(255),
        clean_name VARCHAR(255),
        content_type VARCHAR(50),
        current_platform VARCHAR(255),
        detected_name_platform VARCHAR(100),
        detected_tmdb_platform VARCHAR(100),
        confidence VARCHAR(20),
        tmdb_id VARCHAR(50),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
  } catch (e) {
      console.error(e);
  }
  
  // Fallbacks de migração: Adiciona colunas se tabela antiga já existir sem elas
  try { await pool.query("ALTER TABLE ai_vod_library ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'movie'"); } catch(e){}
  try { await pool.query("UPDATE ai_vod_library SET type = 'movie' WHERE type IS NULL"); } catch(e){}
  try { await pool.query("ALTER TABLE ai_vod_library ADD COLUMN IF NOT EXISTS category_name VARCHAR(255)"); } catch(e){}
  try { await pool.query("ALTER TABLE ai_vod_library ADD COLUMN IF NOT EXISTS source_dns TEXT"); } catch(e){}
  try { await pool.query("ALTER TABLE ai_vod_library ADD COLUMN IF NOT EXISTS source_url TEXT"); } catch(e){}
  try { await pool.query("ALTER TABLE ai_vod_library ADD COLUMN IF NOT EXISTS source_stream_id VARCHAR(100)"); } catch(e){}
  try { await pool.query("ALTER TABLE ai_vod_library ADD COLUMN IF NOT EXISTS source_series_id VARCHAR(100)"); } catch(e){}
  try { await pool.query("ALTER TABLE ai_vod_library ADD COLUMN IF NOT EXISTS source_category_id VARCHAR(100)"); } catch(e){}
  try { await pool.query("ALTER TABLE ai_vod_library ADD COLUMN IF NOT EXISTS container_extension VARCHAR(50)"); } catch(e){}
  try { await pool.query("ALTER TABLE ai_vod_library ADD COLUMN IF NOT EXISTS stream_icon TEXT"); } catch(e){}
  try { await pool.query("ALTER TABLE ai_vod_library ADD COLUMN IF NOT EXISTS auto_frame_url TEXT"); } catch(e){}
  try { await pool.query("ALTER TABLE ai_vod_library ADD COLUMN IF NOT EXISTS auto_frame_status VARCHAR(50)"); } catch(e){}
  try { await pool.query("ALTER TABLE ai_vod_library ADD COLUMN IF NOT EXISTS auto_frame_error TEXT"); } catch(e){}
  try { await pool.query("ALTER TABLE ai_vod_library ADD COLUMN IF NOT EXISTS auto_frame_updated_at TIMESTAMP"); } catch(e){}
  try { await pool.query("ALTER TABLE ai_vod_library ADD COLUMN IF NOT EXISTS image_source VARCHAR(50)"); } catch(e){}
  
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

    const result = rows.map(row => {
      const poster = row.auto_frame_url || row.poster_url || row.stream_icon || null;
      return {
         id: row.tmdb_id || row.id,
         titulo: row.name,
         poster_path: poster,
         backdrop_path: row.backdrop_url || poster,
         overview: '',
         category_name: row.category_name || null,
         image_source: row.image_source || (row.auto_frame_url ? 'auto_middle_frame' : (row.stream_icon ? 'iptv' : null)),
         auto_frame_status: row.auto_frame_status || null
      };
    });

    res.json({ success: true, conteudos: result });
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

// ==========================================
// DIRTY WORDS (FILTRO TMDB)
// ==========================================

exports.getDirtyWords = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM ai_tmdb_dirty_words ORDER BY status = \'new\' DESC, occurrences DESC LIMIT 100');
    res.json({ success: true, words: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const _addWordToGlobalTmdb = async (word) => {
  try {
    const res = await pool.query("SELECT value FROM global_settings WHERE key = 'tmdb_filters'");
    let data = res.rows.length > 0 ? (typeof res.rows[0].value === 'string' ? JSON.parse(res.rows[0].value) : res.rows[0].value) : { words: "4k, 1080p, 720p, fhd, hd, sd, dual, dublado, legendado, leg, dub, nacional, netflix, nfx, amaz, disney, globo, hbo, apple, paramount, starz, youtube, ts, cam, lancamento" };
    
    let wordsArray = data.words.split(',').map(w => w.trim().toLowerCase());
    if (!wordsArray.includes(word.toLowerCase())) {
      wordsArray.push(word.toLowerCase());
      data.words = wordsArray.join(', ');
      
      await pool.query(
        `INSERT INTO global_settings (key, value, updated_at) 
         VALUES ($1, $2, NOW()) 
         ON CONFLICT (key) DO UPDATE 
         SET value = $2, updated_at = NOW()`,
        ['tmdb_filters', JSON.stringify(data)]
      );
    }
  } catch (e) {
    console.error('Erro ao salvar palavra global', e);
  }
};

exports.updateDirtyWordStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await pool.query('UPDATE ai_tmdb_dirty_words SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    
    if (result.rows.length > 0 && status === 'approved') {
      await _addWordToGlobalTmdb(result.rows[0].word);
    }
    
    res.json({ success: true, word: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveAllDirtyWords = async (req, res) => {
  try {
    const result = await pool.query("UPDATE ai_tmdb_dirty_words SET status = 'approved' WHERE status = 'new' RETURNING *");
    
    for (const row of result.rows) {
      await _addWordToGlobalTmdb(row.word);
    }
    
    res.json({ success: true, count: result.rows.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// AUDITORIA DE PLATAFORMAS (API FRONTEND)
// ==========================================

exports.getPlatformAudits = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM ai_platform_audits WHERE status = 'pending' ORDER BY confidence DESC, created_at DESC LIMIT 100");
    res.json({ success: true, audits: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePlatformAuditStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, new_platform } = req.body;
    
    const result = await pool.query('UPDATE ai_platform_audits SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    
    if (result.rows.length > 0 && status === 'approved' && new_platform) {
      const audit = result.rows[0];
      await pool.query('UPDATE ai_vod_library SET category_name = $1 WHERE id = $2', [new_platform, audit.vod_id]);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

