const pool = require('../../config/database');

let schemaReady = false;

async function ensureVersionColumns() {
  if (schemaReady) return;
  await pool.query("ALTER TABLE app_versions ADD COLUMN IF NOT EXISTS previous_version VARCHAR(20)");
  await pool.query("ALTER TABLE app_versions ADD COLUMN IF NOT EXISTS title VARCHAR(160)");
  await pool.query("ALTER TABLE app_versions ADD COLUMN IF NOT EXISTS description TEXT");
  await pool.query("ALTER TABLE app_versions ADD COLUMN IF NOT EXISTS release_date DATE");
  await pool.query("ALTER TABLE app_versions ADD COLUMN IF NOT EXISTS size VARCHAR(40)");
  await pool.query("ALTER TABLE app_versions ADD COLUMN IF NOT EXISTS update_type VARCHAR(30) DEFAULT 'optional'");
  await pool.query("ALTER TABLE app_versions ADD COLUMN IF NOT EXISTS min_supported_version VARCHAR(20)");
  await pool.query("ALTER TABLE app_versions ADD COLUMN IF NOT EXISTS platform VARCHAR(40) DEFAULT 'web'");
  await pool.query("ALTER TABLE app_versions ADD COLUMN IF NOT EXISTS channel VARCHAR(30) DEFAULT 'production'");
  await pool.query("ALTER TABLE app_versions ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'published'");
  await pool.query("ALTER TABLE app_versions ADD COLUMN IF NOT EXISTS message TEXT");
  await pool.query("ALTER TABLE app_versions ADD COLUMN IF NOT EXISTS added JSONB DEFAULT '[]'::jsonb");
  await pool.query("ALTER TABLE app_versions ADD COLUMN IF NOT EXISTS bug_fixes JSONB DEFAULT '[]'::jsonb");
  await pool.query("ALTER TABLE app_versions ADD COLUMN IF NOT EXISTS improvements JSONB DEFAULT '[]'::jsonb");
  await pool.query("ALTER TABLE app_versions ADD COLUMN IF NOT EXISTS cards JSONB DEFAULT '[]'::jsonb");
  await pool.query("CREATE INDEX IF NOT EXISTS idx_app_versions_target ON app_versions(platform, channel, status, ativa, criado_em DESC)");
  schemaReady = true;
}

function compareVersions(left = '0.0.0', right = '0.0.0') {
  const a = String(left).replace(/^v/i, '').split('.').map((part) => parseInt(part, 10) || 0);
  const b = String(right).replace(/^v/i, '').split('.').map((part) => parseInt(part, 10) || 0);
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    if ((a[i] || 0) > (b[i] || 0)) return 1;
    if ((a[i] || 0) < (b[i] || 0)) return -1;
  }
  return 0;
}

function parseList(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === 'string') return { title: item.trim() };
      return {
        icon: item.icon || undefined,
        title: item.title || item.titulo || '',
        description: item.description || item.descricao || '',
      };
    }).filter((item) => item.title);
  }
  if (typeof value === 'string') {
    return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
      const [title, description = ''] = line.split('|').map((part) => part.trim());
      return { title, description };
    });
  }
  return [];
}

function parseCards(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => ({
      icon: item.icon || undefined,
      label: item.label || item.titulo || '',
      value: item.value || item.valor || '',
    })).filter((item) => item.label && item.value);
  }
  if (typeof value === 'string') {
    return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
      const [label, valueText = '', icon = 'star'] = line.split('|').map((part) => part.trim());
      return { icon, label, value: valueText };
    }).filter((item) => item.label && item.value);
  }
  return [];
}

function normalizeVersion(row, currentVersion = '') {
  if (!row) return null;
  const latestVersion = row.versao || row.version || '';
  const forceUpdate = Boolean(row.obrigatoria);
  const minSupported = row.min_supported_version || '';
  return {
    hasUpdate: currentVersion ? compareVersions(latestVersion, currentVersion) > 0 : true,
    latestVersion,
    currentVersion,
    previousVersion: row.previous_version || currentVersion || '',
    title: row.title || 'Novidades da atualizacao',
    description: row.description || row.mensagem || row.message || 'Veja o que foi melhorado, adicionado e corrigido nesta versao.',
    releaseDate: row.release_date || row.criado_em,
    size: row.size || '',
    downloadUrl: row.link_download || '',
    forceUpdate: forceUpdate || (minSupported ? compareVersions(currentVersion, minSupported) < 0 : false),
    updateType: row.update_type || (forceUpdate ? 'mandatory' : 'optional'),
    minSupportedVersion: minSupported,
    platform: row.platform || 'web',
    channel: row.channel || 'production',
    status: row.status || 'published',
    message: row.message || row.mensagem || '',
    added: Array.isArray(row.added) ? row.added : [],
    bugFixes: Array.isArray(row.bug_fixes) ? row.bug_fixes : [],
    improvements: Array.isArray(row.improvements) ? row.improvements : [],
    cards: Array.isArray(row.cards) ? row.cards : [],
    raw: row,
  };
}

async function findLatestVersion({ platform = 'web', channel = 'production' }) {
  await ensureVersionColumns();
  const result = await pool.query(
    "SELECT * FROM app_versions WHERE ativa = TRUE AND status = 'published' AND (platform = $1 OR platform = 'all') AND (channel = $2 OR channel = 'production') ORDER BY criado_em DESC LIMIT 1",
    [platform, channel]
  );
  return result.rows[0] || null;
}

exports.getVersion = async (req, res) => {
  try {
    const row = await findLatestVersion({
      platform: req.query.platform || 'web',
      channel: req.query.channel || 'production',
    });
    if (!row) return res.status(404).json({ error: 'Nenhuma versao ativa encontrada' });
    res.json({ version: normalizeVersion(row, req.query.currentVersion || '') });
  } catch (error) {
    console.error('[updates] getVersion:', error);
    res.status(500).json({ error: 'Erro ao buscar versao' });
  }
};

exports.checkVersion = async (req, res) => {
  try {
    const currentVersion = req.query.currentVersion || req.body?.currentVersion || '';
    const platform = req.query.platform || req.body?.platform || 'web';
    const channel = req.query.channel || req.body?.channel || 'production';
    const row = await findLatestVersion({ platform, channel });
    if (!row) {
      return res.json({
        hasUpdate: false,
        latestVersion: currentVersion,
        currentVersion,
        added: [],
        bugFixes: [],
        improvements: [],
        cards: [],
      });
    }
    res.json(normalizeVersion(row, currentVersion));
  } catch (error) {
    console.error('[updates] checkVersion:', error);
    res.status(500).json({ error: 'Erro ao verificar atualizacao' });
  }
};

exports.createVersion = async (req, res) => {
  await ensureVersionColumns();
  const body = req.body || {};
  const versao = body.versao || body.latestVersion || body.version;
  if (!versao) return res.status(400).json({ error: 'Campo versao e obrigatorio' });

  const payload = {
    versao,
    obrigatoria: Boolean(body.obrigatoria ?? body.forceUpdate),
    link_download: body.link_download || body.downloadUrl || '',
    mensagem: body.mensagem || body.message || body.description || '',
    previous_version: body.previous_version || body.previousVersion || '',
    title: body.title || 'Novidades da atualizacao',
    description: body.description || body.mensagem || '',
    release_date: body.release_date || body.releaseDate || null,
    size: body.size || body.tamanho || '',
    update_type: body.update_type || body.updateType || (body.obrigatoria || body.forceUpdate ? 'mandatory' : 'optional'),
    min_supported_version: body.min_supported_version || body.minSupportedVersion || '',
    platform: body.platform || 'web',
    channel: body.channel || 'production',
    status: body.status || 'published',
    message: body.message || body.mensagem || '',
    added: JSON.stringify(parseList(body.added || body.adicionados || body.addedText)),
    bug_fixes: JSON.stringify(parseList(body.bug_fixes || body.bugFixes || body.correcoes || body.bugFixesText)),
    improvements: JSON.stringify(parseList(body.improvements || body.melhorias || body.improvementsText)),
    cards: JSON.stringify(parseCards(body.cards || body.cardsText)),
  };

  try {
    const result = await pool.query(
      "INSERT INTO app_versions (versao, obrigatoria, link_download, mensagem, previous_version, title, description, release_date, size, update_type, min_supported_version, platform, channel, status, message, added, bug_fixes, improvements, cards) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16::jsonb,$17::jsonb,$18::jsonb,$19::jsonb) RETURNING *",
      [
        payload.versao,
        payload.obrigatoria,
        payload.link_download,
        payload.mensagem,
        payload.previous_version,
        payload.title,
        payload.description,
        payload.release_date,
        payload.size,
        payload.update_type,
        payload.min_supported_version,
        payload.platform,
        payload.channel,
        payload.status,
        payload.message,
        payload.added,
        payload.bug_fixes,
        payload.improvements,
        payload.cards,
      ]
    );
    res.status(201).json({ version: normalizeVersion(result.rows[0]), message: 'Versao criada' });
  } catch (error) {
    console.error('[updates] createVersion:', error);
    res.status(500).json({ error: 'Erro ao criar versao' });
  }
};

exports.listVersions = async (req, res) => {
  try {
    await ensureVersionColumns();
    const result = await pool.query('SELECT * FROM app_versions ORDER BY criado_em DESC');
    res.json({ versions: result.rows.map((row) => normalizeVersion(row)) });
  } catch (error) {
    console.error('[updates] listVersions:', error);
    res.status(500).json({ error: 'Erro ao listar versoes' });
  }
};
