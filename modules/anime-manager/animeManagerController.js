const pool = require('../../config/database');


const DEFAULT_CONFIG = {
  enabled: true,
  autoApproveHighConfidence: false,
  minConfidence: 55,
  heroMode: 'auto',
  heroItemId: null,
  theme: {
    title: 'Mundo dos Animes',
    subtitle: 'Aproveite os melhores animes em alta qualidade. Novos episodios toda semana!',
    primaryColor: '#A855F7',
    secondaryColor: '#38BDF8',
    backgroundColor: '#030307',
    buttonColor: '#A855F7',
    focusColor: '#B95CFF',
    glowColor: 'rgba(168, 85, 247, 0.55)',
  },
  sourceKeywords: [
    'anime',
    'animes',
    'crunchyroll',
    'funimation',
    'animax',
    'animebox',
    'toonami',
    'tokusatsu',
    'animacao',
    'animação',
    'animation',
    'japanese animation',
    'manga',
    'ova',
    'ona',
    'shounen',
    'shonen',
    'seinen',
    'shojo',
    'shoujo',
    'isekai',
    'mecha',
    'naruto',
    'one piece',
    'dragon ball',
    'bleach',
    'demon slayer',
    'kimetsu',
    'jujutsu',
    'boruto',
    'black clover',
    'chainsaw',
    'solo leveling',
    'pokemon',
    'pokémon',
    'digimon',
    'gundam',
    'evangelion',
  ],
  sections: [
    { id: 'featured', title: 'Em Destaque', active: true, source: 'featured', limit: 12, style: 'landscape' },
    { id: 'releases', title: 'Lançamentos', active: true, source: 'recent', limit: 12, style: 'landscape' },
    { id: 'crunchyroll', title: 'Crunchyroll', active: true, source: 'keyword:crunchyroll', limit: 12, style: 'landscape' },
    { id: 'shounen', title: 'Shounen', active: true, source: 'tag:shounen', limit: 12, style: 'landscape' },
    { id: 'isekai', title: 'Isekai', active: true, source: 'tag:isekai', limit: 12, style: 'landscape' },
    { id: 'tokusatsu', title: 'Tokusatsu', active: true, source: 'keyword:tokusatsu', limit: 12, style: 'landscape' },
    { id: 'movies', title: 'Filmes de Anime', active: true, source: 'type:movie', limit: 12, style: 'landscape' },
    { id: 'series', title: 'Séries de Anime', active: true, source: 'type:series', limit: 12, style: 'landscape' },
  ],
};


function normalize(value) {
  return `${value || ''}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\[[^\]]+\]|\([^)]+\)/g, ' ')
    .replace(/\b(4k|uhd|fhd|hd|sd|dual|dublado|legendado|leg|dub|1080p|720p|2160p|h265|hevc|web-dl|webrip|bluray|remux)\b/g, ' ')
    .replace(/\b(s\d{1,2}e\d{1,2}|temporada|season|episodio|episode|ep)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function cleanDescription(value) {
  return `${value || ''}`
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\(Source:[^)]+\)/gi, '')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function safeJson(value, fallback) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function animeKeywordScore(row, config) {
  const text = normalize([
    row.name,
    row.category_name,
    row.type,
  ].join(' '));
  let score = 0;
  for (const keyword of config.sourceKeywords || []) {
    const normalized = normalize(keyword);
    if (normalized && text.includes(normalized)) score += 12;
  }
  return Math.min(score, 45);
}


function scoreAniListMatch(query, anime) {
  if (!anime) return 0;
  const normalizedQuery = normalize(query);
  const candidates = [
    anime.title?.romaji,
    anime.title?.english,
    anime.title?.native,
    ...(anime.synonyms || []),
  ].map(normalize).filter(Boolean);

  let score = 0;
  if (candidates.some((candidate) => candidate === normalizedQuery)) score += 55;
  else if (candidates.some((candidate) => candidate.includes(normalizedQuery) || normalizedQuery.includes(candidate))) score += 35;
  if (anime.format && ['TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL', 'TV_SHORT'].includes(anime.format)) score += 20;
  if (anime.averageScore) score += 8;
  if (anime.popularity && anime.popularity > 1000) score += 7;
  return Math.min(100, score);
}

async function searchAniListForNexusItem(title) {
  const response = await fetch(ANILIST_ENDPOINT, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: ANIME_QUERY, variables: { search: title } }),
  });
  if (!response.ok) return null;
  const payload = await response.json();
  return payload?.data?.Media || null;
}


async function getConfigValue() {
  const result = await pool.query("SELECT value FROM global_settings WHERE key = 'anime_screen_config' LIMIT 1");
  if (!result.rows.length) return DEFAULT_CONFIG;
  return { ...DEFAULT_CONFIG, ...safeJson(result.rows[0].value, DEFAULT_CONFIG) };
}

async function saveConfigValue(config) {
  await pool.query(
    `INSERT INTO global_settings (key, value, updated_at)
     VALUES ('anime_screen_config', $1, NOW())
     ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
    [JSON.stringify({ ...DEFAULT_CONFIG, ...config })],
  );
}

function inferAnimeFromNexusRow(row, config, anime = null) {
  const text = normalize([
    row.name,
    row.category_name,
    row.type,
  ].join(' '));
  const keywordScore = animeKeywordScore(row, config);
  const categoryScore = normalize(row.category_name).includes('anime') ? 35 : 0;
  const typeScore = row.type === 'series' && keywordScore > 0 ? 10 : 0;
  const aniListScore = scoreAniListMatch(row.name, anime);
  const confidence = Math.min(100, keywordScore + categoryScore + typeScore + aniListScore);

  if (confidence < Number(config.minConfidence || 55) && keywordScore < 24 && categoryScore < 35 && aniListScore < 35) return null;

  const keywordTags = (config.sourceKeywords || [])
    .filter((keyword) => {
      const normalized = normalize(keyword);
      return normalized && text.includes(normalized);
    })
    .slice(0, 12);
  const aniListTags = anime?.tags?.map((tag) => tag.name).filter(Boolean).slice(0, 12) || [];

  return {
    confidence,
    tags: [...new Set([...keywordTags, ...aniListTags])],
    genres: [...new Set([...(row.category_name ? [row.category_name] : []), ...(anime?.genres || [])])],
    approvalStatus: confidence >= 80 && config.autoApproveHighConfidence ? 'approved' : 'pending',
    anime,
  };
}

async function upsertAnimeFromNexusLibrary(row, config) {
  let anime = null;
  const baseScore = animeKeywordScore(row, config);
  const categoryLooksAnime = normalize(row.category_name).includes('anime');

  if (baseScore >= 12 || categoryLooksAnime || row.type === 'series') {
    try {
      anime = await searchAniListForNexusItem(row.name);
    } catch (error) {
      console.warn('[anime-manager] AniList enrichment falhou:', error.message);
    }
  }

  const detection = inferAnimeFromNexusRow(row, config, anime);
  if (!detection) return null;

  const result = await pool.query(
    `INSERT INTO ai_anime_catalog
      (vod_id, original_name, clean_name, content_type, category_name, is_anime, confidence,
       source_provider, anilist_id, mal_id, poster_url, backdrop_url, banner_url, overview,
       genres, tags, format, episodes, duration, season_year, anime_status, approval_status,
       updated_at)
     VALUES
      ($1,$2,$3,$4,$5,true,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,NOW())
     ON CONFLICT (vod_id) DO UPDATE SET
       original_name = EXCLUDED.original_name,
       clean_name = EXCLUDED.clean_name,
       content_type = EXCLUDED.content_type,
       category_name = EXCLUDED.category_name,
       confidence = GREATEST(ai_anime_catalog.confidence, EXCLUDED.confidence),
       source_provider = EXCLUDED.source_provider,
       anilist_id = COALESCE(EXCLUDED.anilist_id, ai_anime_catalog.anilist_id),
       mal_id = COALESCE(EXCLUDED.mal_id, ai_anime_catalog.mal_id),
       poster_url = COALESCE(EXCLUDED.poster_url, ai_anime_catalog.poster_url),
       backdrop_url = COALESCE(EXCLUDED.backdrop_url, ai_anime_catalog.backdrop_url),
       banner_url = COALESCE(EXCLUDED.banner_url, ai_anime_catalog.banner_url),
       overview = COALESCE(NULLIF(EXCLUDED.overview, ''), ai_anime_catalog.overview),
       genres = EXCLUDED.genres,
       tags = EXCLUDED.tags,
       format = COALESCE(EXCLUDED.format, ai_anime_catalog.format),
       episodes = COALESCE(EXCLUDED.episodes, ai_anime_catalog.episodes),
       duration = COALESCE(EXCLUDED.duration, ai_anime_catalog.duration),
       season_year = COALESCE(EXCLUDED.season_year, ai_anime_catalog.season_year),
       anime_status = COALESCE(EXCLUDED.anime_status, ai_anime_catalog.anime_status),
       updated_at = NOW()
     RETURNING *`,
    [
      row.id,
      row.name,
      normalize(row.name),
      row.type || 'series',
      row.category_name || 'Outros',
      detection.confidence,
      anime ? 'Nexus IA + AniList' : (row.category_name || 'Nexus IA'),
      anime?.id || null,
      anime?.idMal || null,
      anime?.coverImage?.extraLarge || anime?.coverImage?.large || row.poster_url || row.stream_icon || null,
      row.backdrop_url || null,
      anime?.bannerImage || row.backdrop_url || null,
      cleanDescription(anime?.description || row.overview || row.description || ''),
      JSON.stringify(detection.genres),
      JSON.stringify(detection.tags),
      anime?.format || null,
      anime?.episodes || null,
      anime?.duration || null,
      anime?.seasonYear || null,
      anime?.status || null,
      detection.approvalStatus,
    ],
  );

  return result.rows[0];
}

async function ensureSchema() {
  await pool.query(`CREATE TABLE IF NOT EXISTS ai_anime_catalog (
    id SERIAL PRIMARY KEY,
    vod_id INTEGER UNIQUE,
    original_name VARCHAR(255),
    clean_name VARCHAR(255),
    content_type VARCHAR(50),
    category_name VARCHAR(255),
    is_anime BOOLEAN DEFAULT true,
    confidence INTEGER DEFAULT 0,
    source_provider VARCHAR(255),
    tmdb_id VARCHAR(50),
    anilist_id VARCHAR(50),
    mal_id VARCHAR(50),
    poster_url TEXT,
    backdrop_url TEXT,
    banner_url TEXT,
    logo_url TEXT,
    overview TEXT,
    genres JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    format VARCHAR(50),
    episodes INTEGER,
    duration INTEGER,
    season_year INTEGER,
    anime_status VARCHAR(50),
    manual_section VARCHAR(100),
    manual_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    approval_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
}

function mapAnime(row) {
  return {
    id: row.id,
    vodId: row.vod_id,
    title: row.original_name,
    cleanName: row.clean_name,
    type: row.content_type,
    categoryName: row.category_name,
    confidence: row.confidence,
    posterUrl: row.poster_url,
    backdropUrl: row.backdrop_url,
    bannerUrl: row.banner_url,
    logoUrl: row.logo_url,
    overview: row.overview,
    genres: safeJson(row.genres, []),
    tags: safeJson(row.tags, []),
    format: row.format,
    episodes: row.episodes,
    duration: row.duration,
    seasonYear: row.season_year,
    status: row.anime_status,
    approvalStatus: row.approval_status,
    isFeatured: row.is_featured,
    isHidden: row.is_hidden,
    manualSection: row.manual_section,
    manualOrder: row.manual_order || 0,
  };
}

function itemMatchesSource(item, source) {
  if (!source || source === 'featured') return item.isFeatured || item.approvalStatus === 'approved';
  if (source === 'recent') return item.approvalStatus !== 'rejected';
  if (source.startsWith('keyword:')) {
    const keyword = normalize(source.replace('keyword:', ''));
    return normalize([item.title, item.categoryName, ...(item.tags || []), ...(item.genres || [])].join(' ')).includes(keyword);
  }
  if (source.startsWith('tag:')) {
    const tag = normalize(source.replace('tag:', ''));
    return [...(item.tags || []), ...(item.genres || [])].some((value) => normalize(value).includes(tag));
  }
  if (source.startsWith('type:')) return item.type === source.replace('type:', '');
  if (source.startsWith('category:')) {
    const category = normalize(source.replace('category:', ''));
    return normalize(item.categoryName).includes(category);
  }
  if (source.startsWith('manual:')) {
    const section = normalize(source.replace('manual:', ''));
    return normalize(item.manualSection).includes(section);
  }

  const custom = normalize(source);
  if (custom) {
    return normalize([item.title, item.categoryName, ...(item.tags || []), ...(item.genres || [])].join(' ')).includes(custom);
  }
  return false;
}

exports.getConfig = async (req, res) => {
  try {
    await ensureSchema();
    res.json({ success: true, data: await getConfigValue() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    await ensureSchema();
    await saveConfigValue(req.body || {});
    res.json({ success: true, data: await getConfigValue() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.scanCatalog = async (req, res) => {
  try {
    const result = await syncFromNexusCatalog();
    res.json({ success: true, mode: 'nexus-sync', ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCatalog = async (req, res) => {
  try {
    await ensureSchema();
    const status = req.query.status || 'all';
    const params = [];
    let where = 'WHERE is_hidden = false';
    if (status !== 'all') {
      params.push(status);
      where += ` AND approval_status = $${params.length}`;
    }
    const { rows } = await pool.query(`
      SELECT * FROM ai_anime_catalog
      ${where}
      ORDER BY is_featured DESC, confidence DESC, updated_at DESC
      LIMIT 500
    `, params);

    res.json({ success: true, data: rows.map(mapAnime) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPublicCatalog = async (req, res) => {
  try {
    await ensureSchema();
    const config = await getConfigValue();
    const { rows } = await pool.query(`
      SELECT * FROM ai_anime_catalog
      WHERE is_hidden = false AND approval_status IN ('approved', 'pending')
      ORDER BY is_featured DESC, confidence DESC, manual_order ASC, updated_at DESC
      LIMIT 500
    `);
    const items = rows.map(mapAnime);
    const hero = config.heroItemId
      ? items.find((item) => `${item.id}` === `${config.heroItemId}`) || items[0] || null
      : items.find((item) => item.isFeatured) || items[0] || null;

    const sections = (config.sections || DEFAULT_CONFIG.sections)
      .filter((section) => section.active !== false)
      .map((section) => ({
        ...section,
        items: items
          .filter((item) => itemMatchesSource(item, section.source))
          .slice(0, Number(section.limit || 12)),
      }))
      .filter((section) => section.items.length > 0);

    res.json({
      success: true,
      data: {
        source: 'maxxcontrol-anime-manager',
        theme: config.theme || DEFAULT_CONFIG.theme,
        hero,
        sections,
        items,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateItemStatus = async (req, res) => {
  try {
    await ensureSchema();
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['pending', 'approved', 'rejected'];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, error: 'Status inválido' });
    const { rows } = await pool.query('UPDATE ai_anime_catalog SET approval_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [status, id]);
    res.json({ success: true, data: rows[0] ? mapAnime(rows[0]) : null });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateItemFeature = async (req, res) => {
  try {
    await ensureSchema();
    const { id } = req.params;
    const { isFeatured, isHidden, manualSection, manualOrder } = req.body;
    const { rows } = await pool.query(
      `UPDATE ai_anime_catalog
       SET is_featured = COALESCE($1, is_featured),
           is_hidden = COALESCE($2, is_hidden),
           manual_section = COALESCE($3, manual_section),
           manual_order = COALESCE($4, manual_order),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [isFeatured, isHidden, manualSection, manualOrder, id],
    );
    res.json({ success: true, data: rows[0] ? mapAnime(rows[0]) : null });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

async function syncFromNexusCatalog(limit = 500) {
  await ensureSchema();
  const config = await getConfigValue();
  const { rows } = await pool.query(`
    SELECT * FROM ai_vod_library
    WHERE name IS NOT NULL
    ORDER BY updated_at DESC
    LIMIT $1
  `, [limit]);

  let detected = 0;
  for (const row of rows) {
    const saved = await upsertAnimeFromNexusLibrary(row, config);
    if (saved) detected += 1;
    await new Promise((resolve) => setTimeout(resolve, 220));
  }

  return { scanned: rows.length, detected, source: 'ai_vod_library' };
}

exports.runAnimeScanBackground = async () => {
  try {
    const result = await syncFromNexusCatalog(500);
    console.log(`[anime-manager] Sincronizacao Nexus concluida: ${result.detected}/${result.scanned} itens classificados.`);
    return result;
  } catch (error) {
    console.error('[anime-manager] Falha na sincronizacao Nexus:', error.message);
    return { scanned: 0, detected: 0, source: 'ai_vod_library', error: error.message };
  }
};

exports.initAnimeManager = ensureSchema;
