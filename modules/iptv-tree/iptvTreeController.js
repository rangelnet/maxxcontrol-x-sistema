const pool = require('../../config/database');
const cache = require('./cache');

const getXtreamConfig = async (source, providerId = null) => {
  try {
    if (providerId) {
      const result = await pool.query('SELECT * FROM iptv_providers WHERE id = $1', [providerId]);
      if (result.rows.length > 0) {
        const p = result.rows[0];
        return { xtream_url: p.url, xtream_username: p.username, xtream_password: p.password, server_name: p.name };
      }
    }
    const result = await pool.query(`SELECT isc.*, s.name as server_name FROM iptv_server_config isc LEFT JOIN servers s ON s.url = isc.xtream_url LIMIT 1`);
    if (result.rows.length > 0) return result.rows[0];
    const firstSlot = await pool.query('SELECT * FROM iptv_providers ORDER BY slot_index ASC LIMIT 1');
    if (firstSlot.rows.length > 0) {
      const p = firstSlot.rows[0];
      return { xtream_url:p.url, xtream_username:p.username, xtream_password:p.password, server_name:p.name };
    }
    return null;
  } catch (error) { console.error('Error fetching config:', error); return null; }
};

const buildXtreamUrl = (config, action, params = {}) => {
  const { xtream_url, xtream_username, xtream_password } = config;
  const url = new URL(`${xtream_url}/player_api.php`);
  url.searchParams.append('username', xtream_username);
  url.searchParams.append('password', xtream_password);
  url.searchParams.append('action', action);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  return url.toString();
};

const fetchFromXtream = async (url) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'MaxxControl/1.0' } });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) { clearTimeout(timeoutId); throw err; }
};

exports.getCategories = async (req, res) => {
  try {
    const { type } = req.params;
    const { source = 'global', provider_id = null } = req.query;
    const config = await getXtreamConfig(source, provider_id);
    if (!config) return res.status(400).json({ error: 'CONFIG_NOT_FOUND' });
    const cacheKey = `${provider_id || source}-categories-${type}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached });
    const data = await fetchFromXtream(buildXtreamUrl(config, `get_${type}_categories`));
    cache.set(cacheKey, data, 300);
    res.json({ success: true, data });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getStreams = async (req, res) => {
  try {
    const { type, categoryId } = req.params;
    const { source = 'global', provider_id = null } = req.query;
    const config = await getXtreamConfig(source, provider_id);
    if (!config) return res.status(400).json({ error: 'CONFIG_NOT_FOUND' });
    const cacheKey = `${provider_id || source}-streams-${type}-${categoryId}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached });
    const allStreams = await fetchFromXtream(buildXtreamUrl(config, `get_${type}_streams`));
    const filtered = allStreams.filter(s => s.category_id == categoryId);
    cache.set(cacheKey, filtered, 600);
    res.json({ success: true, data: filtered });
  } catch (error) { res.status(500).json({ error: error.message }); }
};
