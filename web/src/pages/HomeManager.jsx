import React, { useState, useEffect } from 'react';

const HomeManager = () => {
  const [config, setConfig] = useState({
    heroBanner: { active: true, title: '', imageUrl: '', actionType: 'movie', actionId: '' },
    rows: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ui/home');
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
      }
    } catch (err) {
      console.error('Erro ao buscar config da Home:', err);
      showToast('Erro ao carregar configurações', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/ui/home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Configurações da Home salvas com sucesso!', 'success');
      } else {
        showToast(data.error || 'Erro ao salvar', 'error');
      }
    } catch (err) {
      console.error('Erro ao salvar config da Home:', err);
      showToast('Erro ao salvar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateHero = (field, value) => {
    setConfig({ ...config, heroBanner: { ...config.heroBanner, [field]: value } });
  };

  const updateRow = (index, field, value) => {
    const newRows = [...config.rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setConfig({ ...config, rows: newRows });
  };

  const addRow = () => {
    setConfig({
      ...config,
      rows: [...config.rows, { id: Date.now().toString(), name: 'Nova Fileira', type: 'iptv_category', categoryId: '', active: true }]
    });
  };

  const removeRow = (index) => {
    const newRows = config.rows.filter((_, i) => i !== index);
    setConfig({ ...config, rows: newRows });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg font-bold text-white z-50 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Layout da Tela Inicial (Home)</h2>
          <p className="text-sm text-zinc-400">Controle o banner de destaque e as fileiras que aparecem no aplicativo.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all">
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-dark-600 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">📸 Banner Destaque (Hero)</h3>
          <button onClick={() => updateHero('active', !config.heroBanner.active)} className={`w-11 h-6 rounded-full transition-colors ${config.heroBanner.active ? 'bg-brand-500' : 'bg-dark-600'} relative`}>
            <span className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${config.heroBanner.active ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
        
        {config.heroBanner.active && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Título do Destaque</label>
              <input type="text" value={config.heroBanner.title} onChange={(e) => updateHero('title', e.target.value)} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">URL da Imagem de Fundo</label>
              <input type="text" value={config.heroBanner.imageUrl} onChange={(e) => updateHero('imageUrl', e.target.value)} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Ação ao Clicar (Ex: movie, series, channel)</label>
              <input type="text" value={config.heroBanner.actionType} onChange={(e) => updateHero('actionType', e.target.value)} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">ID do Conteúdo</label>
              <input type="text" value={config.heroBanner.actionId} onChange={(e) => updateHero('actionId', e.target.value)} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-white" />
            </div>
          </div>
        )}
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-dark-600 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">📑 Fileiras de Conteúdo (Rows)</h3>
          <button onClick={addRow} className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white text-sm font-bold rounded-lg transition-colors">
            + Nova Fileira
          </button>
        </div>

        <div className="space-y-3">
          {config.rows.map((row, index) => (
            <div key={row.id || index} className="flex flex-col md:flex-row gap-3 bg-dark-900 p-4 rounded-xl border border-dark-600 items-start md:items-end">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Nome da Fileira</label>
                <input type="text" value={row.name} onChange={(e) => updateRow(index, 'name', e.target.value)} className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-white" />
              </div>
              <div className="w-full md:w-48">
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Tipo de Conteúdo</label>
                <select value={row.type} onChange={(e) => updateRow(index, 'type', e.target.value)} className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-white">
                  <option value="platforms_entry">Explorar por Plataforma</option>
                  <option value="top_10_movies">Top 10 Filmes (TMDB/Trending)</option>
                  <option value="top_10_series">Top 10 Séries (TMDB/Trending)</option>
                  <option value="vod_releases">Lançamentos VOD (Automático)</option>
                  <option value="series_releases">Lançamentos Séries (Automático)</option>
                  <option value="iptv_category">Categoria IPTV Específica</option>
                </select>
              </div>
              {row.type === 'iptv_category' && (
                <div className="w-full md:w-32">
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">ID da Categoria</label>
                  <input type="text" value={row.categoryId || ''} onChange={(e) => updateRow(index, 'categoryId', e.target.value)} className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-white" />
                </div>
              )}
              <div className="flex items-center gap-3 w-full md:w-auto h-10">
                <button onClick={() => updateRow(index, 'active', !row.active)} className={`px-3 py-1 text-xs font-bold rounded ${row.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {row.active ? 'Ativo' : 'Oculto'}
                </button>
                <button onClick={() => removeRow(index)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition-colors">Remover</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeManager;
