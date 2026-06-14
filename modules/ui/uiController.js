const pool = require('../../config/database');

const getDefaultHomeConfig = () => ({
  heroBanner: {
    active: true,
    title: "",
    imageUrl: "",
    actionType: "dynamic_focus",
    actionId: ""
  },
  rows: [
    { id: 'platforms_entry', name: 'Explorar por Plataforma', type: 'platforms_entry', active: true },
    { id: 'top_10_movies', name: 'Filmes em alta esta semana', type: 'top_10_movies', active: true },
    { id: 'top_10_series', name: 'Séries em alta esta semana', type: 'top_10_series', active: true },
    { id: 'vod_releases', name: 'Últimos Filmes', type: 'vod_releases', active: true },
    { id: 'series_releases', name: 'Últimas Séries', type: 'series_releases', active: true }
  ]
});

const getDefaultVodConfig = () => ({
  featuredCategories: [
    { id: 'oscar', name: 'Especial Oscar', type: 'custom', items: [], active: true },
    { id: 'action', name: 'Ação Explosiva', type: 'iptv_category', categoryId: '10', active: true }
  ]
});

const getDefaultSeriesConfig = () => ({
  featuredCategories: [
    { id: 'netflix', name: 'Originais Netflix', type: 'iptv_category', categoryId: '20', active: true },
    { id: 'hbo', name: 'HBO Max', type: 'iptv_category', categoryId: '21', active: true }
  ]
});

async function getConfig(key, defaultFn) {
  try {
    const result = await pool.query("SELECT value FROM global_settings WHERE key = $1", [key]);
    if (result.rows.length > 0) {
      return result.rows[0].value;
    }
    return defaultFn();
  } catch (error) {
    console.error(`Erro ao buscar config ${key}:`, error);
    return defaultFn();
  }
}

async function updateConfig(key, data) {
  await pool.query(
    `INSERT INTO global_settings (key, value, updated_at) 
     VALUES ($1, $2, NOW()) 
     ON CONFLICT (key) DO UPDATE 
     SET value = $2, updated_at = NOW()`,
    [key, JSON.stringify(data)]
  );
}

exports.getHomeConfig = async (req, res) => {
  const data = await getConfig('ui_home_config', getDefaultHomeConfig);
  res.json({ success: true, data });
};

exports.updateHomeConfig = async (req, res) => {
  try {
    await updateConfig('ui_home_config', req.body);
    res.json({ success: true, message: 'Home Config atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao atualizar Home Config' });
  }
};

exports.getVodConfig = async (req, res) => {
  const data = await getConfig('ui_vod_config', getDefaultVodConfig);
  res.json({ success: true, data });
};

exports.updateVodConfig = async (req, res) => {
  try {
    await updateConfig('ui_vod_config', req.body);
    res.json({ success: true, message: 'VOD Config atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao atualizar VOD Config' });
  }
};

exports.getSeriesConfig = async (req, res) => {
  const data = await getConfig('ui_series_config', getDefaultSeriesConfig);
  res.json({ success: true, data });
};

exports.updateSeriesConfig = async (req, res) => {
  try {
    await updateConfig('ui_series_config', req.body);
    res.json({ success: true, message: 'Series Config atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao atualizar Series Config' });
  }
};
