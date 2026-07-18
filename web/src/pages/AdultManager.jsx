import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  EyeOff,
  Flame,
  Folder,
  Image as ImageIcon,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Tags,
  XCircle
} from 'lucide-react';
import api from '../services/api';

const emptyConfig = {
  enabled: true,
  autoApproveHighConfidence: true,
  minConfidence: 45,
  theme: {
    title: 'MAXX HOT',
    subtitle: 'Conteudo adulto organizado pela curadoria Nexus 18+.',
    primaryColor: '#ff0f5f',
    secondaryColor: '#ff4f7a',
    backgroundColor: '#050006',
    buttonColor: '#ff0f5f',
    focusColor: '#ff2c6d',
    glowColor: 'rgba(255, 15, 95, 0.5)'
  },
  sourceKeywords: [],
  blockKeywords: []
};

function StatusPill({ status }) {
  const map = {
    approved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    pending: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    hidden: 'bg-red-500/15 text-red-300 border-red-500/30'
  };
  return (
    <span className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase ${map[status] || map.pending}`}>
      {status === 'approved' ? 'Aprovado' : status === 'hidden' ? 'Oculto' : 'Revisar'}
    </span>
  );
}

function Thumb({ src, label }) {
  if (!src) {
    return (
      <div className="flex h-24 w-36 items-center justify-center rounded-lg border border-white/10 bg-black/60 text-center text-[10px] font-bold uppercase text-white/35">
        Sem imagem da lista
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={label || 'Adulto'}
      className="h-24 w-36 rounded-lg border border-white/10 object-cover"
      loading="lazy"
    />
  );
}

export default function AdultManager() {
  const [activeView, setActiveView] = useState('catalog');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [config, setConfig] = useState(emptyConfig);
  const [itemDrafts, setItemDrafts] = useState({});
  const [categoryDrafts, setCategoryDrafts] = useState({});
  const [generatingImages, setGeneratingImages] = useState({});

  const stats = useMemo(() => ({
    total: items.length,
    approved: items.filter((item) => item.approvalStatus === 'approved' && !item.isHidden).length,
    pending: items.filter((item) => item.approvalStatus === 'pending' && !item.isHidden).length,
    featured: items.filter((item) => item.isFeatured).length,
    hidden: items.filter((item) => item.isHidden || item.approvalStatus === 'hidden').length,
    categories: categories.length
  }), [items, categories]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesStatus = status === 'all' || item.approvalStatus === status || (status === 'hidden' && item.isHidden);
      const text = `${item.cleanName || ''} ${item.originalName || ''} ${item.categoryName || ''}`.toLowerCase();
      return matchesStatus && (!q || text.includes(q));
    });
  }, [items, query, status]);

  async function loadData() {
    setLoading(true);
    setMessage('');
    try {
      const [configRes, catalogRes, categoriesRes] = await Promise.all([
        api.get('/api/adult-manager/config'),
        api.get('/api/adult-manager/catalog', { params: { status: 'all' } }),
        api.get('/api/adult-manager/categories')
      ]);
      setConfig(configRes.data.config || emptyConfig);
      setItems(catalogRes.data.items || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (error) {
      console.error('[AdultManager] loadData:', error);
      setMessage(error?.response?.data?.error || 'Falha ao carregar Gerenciar Adultos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function runScan() {
    setScanning(true);
    setMessage('');
    try {
      const { data } = await api.post('/api/adult-manager/scan');
      const result = data.result || {};
      setMessage(`Varredura concluida: ${result.imported || 0} itens adultos identificados de ${result.scanned || 0} analisados.`);
      await loadData();
    } catch (error) {
      console.error('[AdultManager] runScan:', error);
      setMessage(error?.response?.data?.error || 'Falha ao varrer catalogo adulto.');
    } finally {
      setScanning(false);
    }
  }

  async function updateStatus(item, nextStatus) {
    setSaving(true);
    try {
      await api.post(`/api/adult-manager/items/${item.id}/status`, { status: nextStatus });
      await loadData();
    } catch (error) {
      setMessage(error?.response?.data?.error || 'Falha ao atualizar status.');
    } finally {
      setSaving(false);
    }
  }

  async function saveItem(item) {
    setSaving(true);
    const draft = itemDrafts[item.id] || {};
    try {
      await api.post(`/api/adult-manager/items/${item.id}/feature`, {
        isFeatured: draft.isFeatured ?? item.isFeatured,
        manualSection: draft.manualSection ?? item.manualSection,
        manualOrder: draft.manualOrder ?? item.manualOrder,
        posterUrl: draft.posterUrl,
        backdropUrl: draft.backdropUrl,
        bannerUrl: draft.bannerUrl,
        iconUrl: draft.iconUrl,
        overview: draft.overview,
        categoryName: draft.categoryName
      });
      setItemDrafts((current) => ({ ...current, [item.id]: {} }));
      await loadData();
    } catch (error) {
      setMessage(error?.response?.data?.error || 'Falha ao salvar item adulto.');
    } finally {
      setSaving(false);
    }
  }

  async function generateItemImage(item) {
    setGeneratingImages((current) => ({ ...current, [item.id]: true }));
    setMessage('');
    try {
      const { data } = await api.post(`/api/adult-manager/items/${item.id}/generate-image`);
      if (data.item) {
        setItems((current) => current.map((entry) => (entry.id === item.id ? data.item : entry)));
      }
      setMessage('Imagem automatica gerada a partir do meio do video.');
      await loadData();
    } catch (error) {
      const responseItem = error?.response?.data?.item;
      if (responseItem) {
        setItems((current) => current.map((entry) => (entry.id === item.id ? responseItem : entry)));
      }
      setMessage(error?.response?.data?.error || 'Falha ao gerar imagem automatica do video.');
    } finally {
      setGeneratingImages((current) => ({ ...current, [item.id]: false }));
    }
  }

  async function saveCategory(category) {
    setSaving(true);
    const draft = categoryDrafts[category.id] || {};
    try {
      await api.post(`/api/adult-manager/categories/${category.id}`, {
        categoryKey: draft.categoryKey ?? category.categoryKey,
        name: draft.name ?? category.name,
        iconUrl: draft.iconUrl ?? category.iconUrl,
        coverUrl: draft.coverUrl ?? category.coverUrl,
        color: draft.color ?? category.color,
        sourceKeywords: String(draft.sourceKeywords ?? (category.sourceKeywords || []).join(', '))
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        active: draft.active ?? category.active,
        sortOrder: draft.sortOrder ?? category.sortOrder
      });
      setCategoryDrafts((current) => ({ ...current, [category.id]: {} }));
      await loadData();
    } catch (error) {
      setMessage(error?.response?.data?.error || 'Falha ao salvar categoria adulto.');
    } finally {
      setSaving(false);
    }
  }

  async function saveConfig() {
    setSaving(true);
    try {
      await api.post('/api/adult-manager/config', config);
      setMessage('Configuracao adulto salva.');
      await loadData();
    } catch (error) {
      setMessage(error?.response?.data?.error || 'Falha ao salvar configuracao adulto.');
    } finally {
      setSaving(false);
    }
  }

  function updateItemDraft(id, key, value) {
    setItemDrafts((current) => ({
      ...current,
      [id]: { ...(current[id] || {}), [key]: value }
    }));
  }

  function updateCategoryDraft(id, key, value) {
    setCategoryDrafts((current) => ({
      ...current,
      [id]: { ...(current[id] || {}), [key]: value }
    }));
  }

  if (loading) {
    return <div className="rounded-2xl border border-white/10 bg-[#171719] p-8 text-white/70">Carregando Gerenciar Adultos...</div>;
  }

  return (
    <div className="space-y-5 text-white">
      <div className="rounded-2xl border border-[#ff0f5f]/35 bg-gradient-to-br from-[#22000d] via-[#111114] to-[#060607] p-5 shadow-[0_0_35px_rgba(255,15,95,0.12)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-[#ff0f5f]/30 bg-[#ff0f5f]/15 p-3 text-[#ff0f5f]"><Flame size={22} /></div>
              <div>
                <h2 className="text-2xl font-black">Gerenciar Adultos</h2>
                <p className="text-sm text-white/55">Curadoria 18+ alimentada pelo Nexus, com capas, icones, categorias e aprovacao manual.</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={loadData} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold hover:border-[#ff0f5f]/50">
              <RefreshCw size={16} /> Atualizar
            </button>
            <button onClick={runScan} disabled={scanning} className="flex items-center gap-2 rounded-xl bg-[#ff0f5f] px-4 py-3 text-sm font-black text-white shadow-[0_0_18px_rgba(255,15,95,0.35)] disabled:opacity-60">
              <ShieldCheck size={16} /> {scanning ? 'Varrendo...' : 'Varrer Nexus'}
            </button>
          </div>
        </div>

        {message && <div className="mt-4 rounded-xl border border-[#ff0f5f]/25 bg-[#ff0f5f]/10 px-4 py-3 text-sm text-white/80">{message}</div>}

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {[
            ['Total', stats.total],
            ['Aprovados', stats.approved],
            ['Revisar', stats.pending],
            ['Destaques', stats.featured],
            ['Ocultos', stats.hidden],
            ['Categorias', stats.categories]
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-black/35 p-4">
              <div className="text-[11px] font-black uppercase tracking-widest text-white/40">{label}</div>
              <div className="mt-1 text-2xl font-black text-white">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          ['catalog', 'Catalogo', Tags],
          ['categories', 'Categorias', Folder],
          ['config', 'Configuracao', Settings]
        ].map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-black ${activeView === id ? 'border-[#ff0f5f] bg-[#ff0f5f]/20 text-[#ff5b90]' : 'border-white/10 bg-white/5 text-white/60'}`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {activeView === 'catalog' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#141416] p-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar conteudo adulto..."
                className="w-full rounded-xl border border-white/10 bg-black/35 py-3 pl-10 pr-3 text-sm outline-none focus:border-[#ff0f5f]"
              />
            </div>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-sm outline-none focus:border-[#ff0f5f]">
              <option value="all">Todos</option>
              <option value="approved">Aprovados</option>
              <option value="pending">Revisar</option>
              <option value="hidden">Ocultos</option>
            </select>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {filteredItems.map((item) => {
              const draft = itemDrafts[item.id] || {};
              const image = draft.posterUrl || item.posterUrl || item.backdropUrl || item.bannerUrl;
              const isGeneratingImage = generatingImages[item.id] || item.autoFrameStatus === 'processing';
              const canGenerateImage = Boolean(item.sourceUrl);
              return (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-[#111113] p-4 shadow-xl">
                  <div className="flex gap-4">
                    <Thumb src={image} label={item.cleanName} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="line-clamp-2 text-base font-black">{item.cleanName || item.originalName}</h3>
                          <p className="mt-1 text-xs text-white/45">{item.categoryName || 'Sem categoria'} • confianca {item.confidence || 0}%</p>
                        </div>
                        <StatusPill status={item.isHidden ? 'hidden' : item.approvalStatus} />
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs text-white/45">{item.overview || 'Sem descricao recebida da lista.'}</p>
                      <div className="mt-2 text-[11px] font-bold text-white/40">
                        {item.autoFrameStatus === 'ready' && <span className="text-emerald-300">Imagem automatica pronta.</span>}
                        {item.autoFrameStatus === 'processing' && <span className="text-[#ff0f5f]">Gerando imagem automatica...</span>}
                        {item.autoFrameStatus === 'failed' && <span className="text-red-300">{item.autoFrameError || 'Falha ao gerar imagem automatica.'}</span>}
                        {!item.autoFrameStatus && !canGenerateImage && <span>Sem URL real do video. Varra o Nexus novamente para gravar o stream.</span>}
                        {!item.autoFrameStatus && canGenerateImage && !image && <span>URL real encontrada. Gere a imagem pelo meio do video.</span>}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button onClick={() => updateStatus(item, 'approved')} className="flex items-center gap-1 rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-black text-emerald-300"><CheckCircle2 size={14} /> Aprovar</button>
                        <button onClick={() => updateStatus(item, 'pending')} className="flex items-center gap-1 rounded-lg bg-yellow-500/15 px-3 py-2 text-xs font-black text-yellow-300"><XCircle size={14} /> Revisar</button>
                        <button onClick={() => updateStatus(item, 'hidden')} className="flex items-center gap-1 rounded-lg bg-red-500/15 px-3 py-2 text-xs font-black text-red-300"><EyeOff size={14} /> Ocultar</button>
                        <button onClick={() => updateItemDraft(item.id, 'isFeatured', !(draft.isFeatured ?? item.isFeatured))} className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-black ${(draft.isFeatured ?? item.isFeatured) ? 'bg-[#ff0f5f] text-white' : 'bg-white/10 text-white/70'}`}><Star size={14} /> Destaque</button>
                        <button
                          onClick={() => generateItemImage(item)}
                          disabled={!canGenerateImage || isGeneratingImage}
                          className="flex items-center gap-1 rounded-lg bg-[#ff0f5f]/15 px-3 py-2 text-xs font-black text-[#ff78a4] disabled:cursor-not-allowed disabled:opacity-45"
                          title={canGenerateImage ? 'Capturar imagem do meio do video' : 'Sem URL real do video. Execute nova varredura Nexus.'}
                        >
                          <ImageIcon size={14} /> {isGeneratingImage ? 'Gerando...' : image ? 'Regenerar imagem' : 'Gerar imagem'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <label className="space-y-1 text-[11px] font-black uppercase text-white/45">
                      Capa / Thumb
                      <input value={draft.posterUrl ?? ''} onChange={(event) => updateItemDraft(item.id, 'posterUrl', event.target.value)} placeholder={item.posterUrl || 'URL da capa'} className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-xs normal-case text-white outline-none focus:border-[#ff0f5f]" />
                    </label>
                    <label className="space-y-1 text-[11px] font-black uppercase text-white/45">
                      Banner / Fundo
                      <input value={draft.backdropUrl ?? ''} onChange={(event) => updateItemDraft(item.id, 'backdropUrl', event.target.value)} placeholder={item.backdropUrl || 'URL do banner'} className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-xs normal-case text-white outline-none focus:border-[#ff0f5f]" />
                    </label>
                    <label className="space-y-1 text-[11px] font-black uppercase text-white/45">
                      Categoria
                      <input value={draft.categoryName ?? ''} onChange={(event) => updateItemDraft(item.id, 'categoryName', event.target.value)} placeholder={item.categoryName || 'Categoria'} className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-xs normal-case text-white outline-none focus:border-[#ff0f5f]" />
                    </label>
                    <label className="space-y-1 text-[11px] font-black uppercase text-white/45">
                      Secao manual
                      <input value={draft.manualSection ?? ''} onChange={(event) => updateItemDraft(item.id, 'manualSection', event.target.value)} placeholder={item.manualSection || 'featured / releases / onlyfans'} className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-xs normal-case text-white outline-none focus:border-[#ff0f5f]" />
                    </label>
                  </div>
                  <button onClick={() => saveItem(item)} disabled={saving} className="mt-3 flex items-center gap-2 rounded-xl bg-[#ff0f5f] px-4 py-2 text-xs font-black text-white disabled:opacity-60"><Save size={14} /> Salvar item</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeView === 'categories' && (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
            const draft = categoryDrafts[category.id] || {};
            return (
              <div key={category.id} className="rounded-2xl border border-white/10 bg-[#111113] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black">{category.name}</h3>
                    <p className="text-xs text-white/45">{category.itemCount || 0} itens aprovados</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-[#ff0f5f]"><ImageIcon size={18} /></div>
                </div>
                <div className="mt-4 space-y-3">
                  <input value={draft.name ?? ''} onChange={(event) => updateCategoryDraft(category.id, 'name', event.target.value)} placeholder={category.name || 'Nome'} className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm outline-none focus:border-[#ff0f5f]" />
                  <input value={draft.iconUrl ?? ''} onChange={(event) => updateCategoryDraft(category.id, 'iconUrl', event.target.value)} placeholder={category.iconUrl || 'URL do icone'} className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm outline-none focus:border-[#ff0f5f]" />
                  <input value={draft.coverUrl ?? ''} onChange={(event) => updateCategoryDraft(category.id, 'coverUrl', event.target.value)} placeholder={category.coverUrl || 'URL da capa da categoria'} className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm outline-none focus:border-[#ff0f5f]" />
                  <input value={draft.sourceKeywords ?? ''} onChange={(event) => updateCategoryDraft(category.id, 'sourceKeywords', event.target.value)} placeholder={(category.sourceKeywords || []).join(', ') || 'Palavras da categoria'} className="w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm outline-none focus:border-[#ff0f5f]" />
                  <button onClick={() => saveCategory(category)} disabled={saving} className="flex items-center gap-2 rounded-xl bg-[#ff0f5f] px-4 py-2 text-xs font-black text-white disabled:opacity-60"><Save size={14} /> Salvar categoria</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeView === 'config' && (
        <div className="rounded-2xl border border-white/10 bg-[#111113] p-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-1 text-xs font-black uppercase text-white/45">
              Titulo da area adulta
              <input value={config.theme?.title || ''} onChange={(event) => setConfig({ ...config, theme: { ...(config.theme || {}), title: event.target.value } })} className="w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 normal-case text-white outline-none focus:border-[#ff0f5f]" />
            </label>
            <label className="space-y-1 text-xs font-black uppercase text-white/45">
              Cor principal
              <input value={config.theme?.primaryColor || ''} onChange={(event) => setConfig({ ...config, theme: { ...(config.theme || {}), primaryColor: event.target.value } })} className="w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 normal-case text-white outline-none focus:border-[#ff0f5f]" />
            </label>
            <label className="space-y-1 text-xs font-black uppercase text-white/45 lg:col-span-2">
              Subtitulo
              <input value={config.theme?.subtitle || ''} onChange={(event) => setConfig({ ...config, theme: { ...(config.theme || {}), subtitle: event.target.value } })} className="w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 normal-case text-white outline-none focus:border-[#ff0f5f]" />
            </label>
            <label className="space-y-1 text-xs font-black uppercase text-white/45">
              Palavras que entram na area adulto
              <textarea value={(config.sourceKeywords || []).join(', ')} onChange={(event) => setConfig({ ...config, sourceKeywords: event.target.value.split(',').map((value) => value.trim()).filter(Boolean) })} rows={6} className="w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 normal-case text-white outline-none focus:border-[#ff0f5f]" />
            </label>
            <label className="space-y-1 text-xs font-black uppercase text-white/45">
              Palavras bloqueadas
              <textarea value={(config.blockKeywords || []).join(', ')} onChange={(event) => setConfig({ ...config, blockKeywords: event.target.value.split(',').map((value) => value.trim()).filter(Boolean) })} rows={6} className="w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 normal-case text-white outline-none focus:border-[#ff0f5f]" />
            </label>
          </div>
          <button onClick={saveConfig} disabled={saving} className="mt-5 flex items-center gap-2 rounded-xl bg-[#ff0f5f] px-5 py-3 text-sm font-black text-white shadow-[0_0_18px_rgba(255,15,95,0.35)] disabled:opacity-60"><Save size={16} /> Salvar configuracao</button>
        </div>
      )}
    </div>
  );
}
