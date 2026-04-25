const express = require('express');
const router = express.Router();
const iptvProviderController = require('./iptvProviderController');
const supabase = require('../../config/supabase');

// Rotas de Provedores (Slots)
router.get('/providers', iptvProviderController.getProviders);
router.put('/providers/:id', iptvProviderController.updateProvider);

// Rotas de Curadoria (Marketing)
router.get('/curation', iptvProviderController.getCuration);
router.post('/curation', iptvProviderController.addToCuration);
router.delete('/curation/:id', iptvProviderController.deleteCurationItem);

// Rota legada/compatibilidade
router.get('/config', async (req, res) => {
  try {
    const { data, error } = await supabase.from('settings').select('*').eq('key', 'iptv_server').single();
    res.json(data?.value || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/config', async (req, res) => {
  try {
    const { error } = await supabase.from('settings').upsert({ key: 'iptv_server', value: req.body });
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/test', async (req, res) => {
    // Simulação de teste de conexão Xtream
    res.json({ success: true, message: 'Conexão estabelecida com sucesso!' });
});

module.exports = router;
