const supabase = require('../../config/supabase');

exports.getProviders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('iptv_providers')
      .select('*')
      .order('slot_index', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, username, password } = req.body;

    const { data, error } = await supabase
      .from('iptv_providers')
      .update({ name, url, username, password, updated_at: new Date() })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCuration = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('iptv_curation')
      .select('*, iptv_providers(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addToCuration = async (req, res) => {
  try {
    const item = req.body;
    const { data, error } = await supabase
      .from('iptv_curation')
      .insert([item])
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCurationItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('iptv_curation')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
