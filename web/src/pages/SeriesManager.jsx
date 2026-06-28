import React, { useState, useEffect } from 'react';
import PreviewContainer from '../components/previews/PreviewContainer';
import VodSeriesPreview from '../components/previews/VodSeriesPreview';

const SeriesManager = () => {
  const [config, setConfig] = useState({ featuredCategories: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchConfig(); }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ui/series');
      const data = await res.json();
      if (data.success) setConfig(data.data);
    } catch (err) {
      showToast('Erro ao carregar configurações', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/ui/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) showToast('Salvo com sucesso!', 'success');
      else showToast(data.error || 'Erro ao salvar', 'error');
    } catch (err) {
      showToast('Erro ao salvar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateCategory = (index, field, value) => {
    const newCats = [...config.featuredCategories];
    newCats[index] = { ...newCats[index], [field]: value };
    setConfig({ ...config, featuredCategories: newCats });
  };

  const addCategory = () => {
    setConfig({
      ...config,
      featuredCategories: [...config.featuredCategories, { id: Date.now().toString(), name: 'Nova Categoria de Séries', type: 'iptv_category', categoryId: '', active: true }]
    });
  };

  const removeCategory = (index) => {
    const newCats = config.featuredCategories.filter((_, i) => i !== index);
    setConfig({ ...config, featuredCategories: newCats });
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div></div>;

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg font-bold text-white z-50 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Layout de Séries (TV Shows)</h2>
          <p className="text-sm text-zinc-400">Gerencie as categorias em destaque na tela de séries.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all">
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-dark-600 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">📺 Séries em Destaque</h3>
          <button onClick={addCategory} className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white text-sm font-bold rounded-lg transition-colors">
            + Adicionar
          </button>
        </div>

        <div className="space-y-3">
          {config.featuredCategories.map((cat, index) => (
            <div key={cat.id || index} className="flex flex-col md:flex-row gap-3 bg-dark-900 p-4 rounded-xl border border-dark-600 items-start md:items-end">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Nome Exibido</label>
                <input type="text" value={cat.name} onChange={(e) => updateCategory(index, 'name', e.target.value)} className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-white" />
              </div>
              <div className="w-full md:w-48">
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Origem (Tipo)</label>
                <select value={cat.type} onChange={(e) => updateCategory(index, 'type', e.target.value)} className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-white">
                  <option value="iptv_category">Categoria IPTV</option>
                  <option value="custom">Lista Manual (Custom)</option>
                  <option value="tmdb_popular">Populares TMDB</option>
                </select>
              </div>
              {cat.type === 'iptv_category' && (
                <div className="w-full md:w-32">
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">ID Categoria IPTV</label>
                  <input type="text" value={cat.categoryId || ''} onChange={(e) => updateCategory(index, 'categoryId', e.target.value)} className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-white" />
                </div>
              )}
              <div className="flex items-center gap-3 w-full md:w-auto h-10">
                <button onClick={() => updateCategory(index, 'active', !cat.active)} className={`px-3 py-1 text-xs font-bold rounded ${cat.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {cat.active ? 'Ativo' : 'Oculto'}
                </button>
                <button onClick={() => removeCategory(index)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition-colors">Remover</button>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>

        {/* Lado Direito: Preview */}
        <div className="xl:col-span-1 space-y-6">
          <PreviewContainer title="Séries (TV Shows)">
            <VodSeriesPreview featuredCategories={config.featuredCategories} type="series" />
          </PreviewContainer>
        </div>
      </div>
    </div>
  );
};

export default SeriesManager;
