import { useEffect, useMemo, useState } from 'react'
import {
  Bot,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Play,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Star,
  Wand2,
  XCircle,
} from 'lucide-react'
import api from '../services/api'

const DEFAULT_THEME = {
  title: 'Mundo dos Animes',
  subtitle: 'Aproveite os melhores animes em alta qualidade. Novos episodios toda semana!',
  primaryColor: '#A855F7',
  secondaryColor: '#38BDF8',
  backgroundColor: '#030307',
  buttonColor: '#A855F7',
  focusColor: '#B95CFF',
  glowColor: 'rgba(168, 85, 247, 0.55)',
}

const DEFAULT_SECTIONS = [
  { id: 'featured', title: 'Em Destaque', active: true, source: 'featured', limit: 12, style: 'landscape' },
  { id: 'releases', title: 'Lançamentos', active: true, source: 'recent', limit: 12, style: 'landscape' },
  { id: 'crunchyroll', title: 'Crunchyroll', active: true, source: 'keyword:crunchyroll', limit: 12, style: 'landscape' },
  { id: 'shounen', title: 'Shounen', active: true, source: 'tag:shounen', limit: 12, style: 'landscape' },
  { id: 'isekai', title: 'Isekai', active: true, source: 'tag:isekai', limit: 12, style: 'landscape' },
  { id: 'tokusatsu', title: 'Tokusatsu', active: true, source: 'keyword:tokusatsu', limit: 12, style: 'landscape' },
  { id: 'movies', title: 'Filmes de Anime', active: true, source: 'type:movie', limit: 12, style: 'landscape' },
  { id: 'series', title: 'Séries de Anime', active: true, source: 'type:series', limit: 12, style: 'landscape' },
]

const STATUS_STYLES = {
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const statusLabel = {
  approved: 'Aprovado',
  pending: 'Revisar',
  rejected: 'Rejeitado',
}

function mergeConfig(config) {
  return {
    enabled: config?.enabled ?? true,
    autoApproveHighConfidence: config?.autoApproveHighConfidence ?? false,
    minConfidence: config?.minConfidence ?? 55,
    heroMode: config?.heroMode || 'auto',
    heroItemId: config?.heroItemId || null,
    theme: { ...DEFAULT_THEME, ...(config?.theme || {}) },
    sourceKeywords: Array.isArray(config?.sourceKeywords) ? config.sourceKeywords : [],
    sections: Array.isArray(config?.sections) && config.sections.length ? config.sections : DEFAULT_SECTIONS,
  }
}

const AnimeManager = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [message, setMessage] = useState(null)
  const [activeView, setActiveView] = useState('catalog')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [config, setConfig] = useState(mergeConfig(null))
  const [items, setItems] = useState([])

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3500)
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [configRes, catalogRes] = await Promise.all([
        api.get('/api/anime-manager/config'),
        api.get('/api/anime-manager/catalog?status=all'),
      ])
      setConfig(mergeConfig(configRes.data?.data))
      setItems(catalogRes.data?.data || [])
    } catch (error) {
      showMessage('Erro ao carregar Gerenciar Animes.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const stats = useMemo(() => {
    const approved = items.filter((item) => item.approvalStatus === 'approved').length
    const pending = items.filter((item) => item.approvalStatus === 'pending').length
    const featured = items.filter((item) => item.isFeatured).length
    const hidden = items.filter((item) => item.isHidden).length
    return { total: items.length, approved, pending, featured, hidden }
  }, [items])

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return items.filter((item) => {
      if (statusFilter !== 'all' && item.approvalStatus !== statusFilter) return false
      if (!normalized) return true
      return [
        item.title,
        item.categoryName,
        item.type,
        ...(item.genres || []),
        ...(item.tags || []),
      ].join(' ').toLowerCase().includes(normalized)
    })
  }, [items, query, statusFilter])

  const heroItem = useMemo(() => {
    if (config.heroItemId) {
      const selected = items.find((item) => `${item.id}` === `${config.heroItemId}`)
      if (selected) return selected
    }
    return items.find((item) => item.isFeatured) || items[0] || null
  }, [items, config.heroItemId])

  const saveConfig = async () => {
    setSaving(true)
    try {
      const { data } = await api.post('/api/anime-manager/config', config)
      setConfig(mergeConfig(data?.data))
      showMessage('Configuração de animes salva e pronta para o app.')
    } catch (error) {
      showMessage('Erro ao salvar configuração de animes.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const runScan = async () => {
    if (!window.confirm('Sincronizar agora os animes encontrados pela IA/Nexus?')) return
    setScanning(true)
    try {
      const { data } = await api.post('/api/anime-manager/scan')
      showMessage(`Sincronização concluída: ${data.detected || 0} animes classificados com Nexus + AniList.`)
      await loadData()
    } catch (error) {
      showMessage('Erro ao sincronizar animes com Nexus + AniList.', 'error')
    } finally {
      setScanning(false)
    }
  }

  const updateItemStatus = async (item, status) => {
    try {
      const { data } = await api.post(`/api/anime-manager/items/${item.id}/status`, { status })
      setItems((prev) => prev.map((current) => current.id === item.id ? data.data : current))
    } catch {
      showMessage('Erro ao atualizar status do anime.', 'error')
    }
  }

  const updateItemFeature = async (item, payload) => {
    try {
      const { data } = await api.post(`/api/anime-manager/items/${item.id}/feature`, payload)
      setItems((prev) => prev.map((current) => current.id === item.id ? data.data : current))
    } catch {
      showMessage('Erro ao atualizar curadoria do anime.', 'error')
    }
  }

  const updateTheme = (field, value) => {
    setConfig((prev) => ({ ...prev, theme: { ...prev.theme, [field]: value } }))
  }

  const updateSection = (index, field, value) => {
    setConfig((prev) => {
      const sections = [...prev.sections]
      sections[index] = { ...sections[index], [field]: value }
      return { ...prev, sections }
    })
  }

  const addSection = () => {
    setConfig((prev) => {
      const nextIndex = prev.sections.length + 1
      return {
        ...prev,
        sections: [
          ...prev.sections,
          {
            id: `custom-${Date.now()}`,
            title: `Nova Categoria ${nextIndex}`,
            active: true,
            source: 'keyword:anime',
            limit: 12,
            style: 'landscape',
          },
        ],
      }
    })
  }

  const removeSection = (index) => {
    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, currentIndex) => currentIndex !== index),
    }))
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-brand-500" />
        <p>Carregando Gerenciar Animes...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl border shadow-2xl backdrop-blur-md ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
          <p className="text-sm font-bold">{message.text}</p>
        </div>
      )}

      <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-zinc-950 via-purple-950/25 to-zinc-950 p-6 shadow-2xl shadow-purple-950/20">
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="relative z-10 flex flex-col xl:flex-row gap-6 justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-200 text-[10px] font-black uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Nexus + AniList Intelligence
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">Gerenciar Animes</h1>
            <p className="text-zinc-300 max-w-2xl mt-3 text-sm leading-relaxed">
              Curadoria da tela /animes usando a biblioteca que a IA/Nexus já varre, com AniList ajudando a identificar anime, gênero, tags, banner e descrição. Aqui você organiza categorias, aprova itens, escolhe destaque, ajusta hero premium e publica para o Web Player.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <button onClick={runScan} disabled={scanning} className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-black transition flex items-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50">
                {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                {scanning ? 'Enriquecendo...' : 'Sincronizar Nexus + AniList'}
              </button>
              <button onClick={saveConfig} disabled={saving} className="px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-sm font-black transition flex items-center gap-2 shadow-lg shadow-brand-500/20 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar e Publicar
              </button>
              <button onClick={loadData} className="px-5 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Atualizar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 xl:grid-cols-2 gap-3 xl:w-[360px]">
            {[
              ['Total', stats.total, 'text-white'],
              ['Aprovados', stats.approved, 'text-emerald-400'],
              ['Revisar', stats.pending, 'text-yellow-400'],
              ['Destaques', stats.featured, 'text-purple-300'],
              ['Ocultos', stats.hidden, 'text-red-400'],
            ].map(([label, value, color]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-black">{label}</p>
                <p className={`text-2xl font-black ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          ['catalog', 'Catálogo Inteligente'],
          ['theme', 'Hero & Visual'],
          ['sections', 'Categorias'],
          ['preview', 'Preview App'],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-wider transition ${activeView === id ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/20' : 'bg-dark-800 border-dark-600 text-zinc-400 hover:text-white'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeView === 'catalog' && (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar anime, categoria Nexus, tag ou gênero..."
                className="w-full bg-dark-900 border border-dark-600 rounded-xl py-3 pl-10 pr-4 text-white text-sm outline-none focus:border-purple-500"
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-white text-sm outline-none">
              <option value="all">Todos</option>
              <option value="pending">Revisar</option>
              <option value="approved">Aprovados</option>
              <option value="rejected">Rejeitados</option>
            </select>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="rounded-2xl border border-dark-600 bg-dark-800 overflow-hidden hover:border-purple-500/40 transition">
                <div className="flex gap-4 p-4">
                  <div className="w-32 h-20 rounded-xl overflow-hidden bg-dark-900 shrink-0 border border-white/10">
                    {item.bannerUrl || item.backdropUrl || item.posterUrl ? (
                      <img src={item.bannerUrl || item.backdropUrl || item.posterUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <Bot className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-white font-black truncate">{item.title}</h3>
                        <p className="text-xs text-zinc-500 truncate">{item.categoryName || 'Sem categoria'} • {item.type}</p>
                      </div>
                      <span className={`shrink-0 px-2 py-1 rounded-full border text-[10px] font-black uppercase ${STATUS_STYLES[item.approvalStatus] || STATUS_STYLES.pending}`}>
                        {statusLabel[item.approvalStatus] || item.approvalStatus}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-300 text-[10px] font-bold border border-purple-500/20">
                        {item.confidence}% confiança
                      </span>
                      {(item.genres || []).slice(0, 3).map((genre) => (
                        <span key={genre} className="px-2 py-1 rounded-lg bg-dark-900 text-zinc-400 text-[10px] border border-dark-600">{genre}</span>
                      ))}
                    </div>
                    <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{item.overview || 'Sem descrição Nexus/TMDB ainda.'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 px-4 pb-4">
                  <button onClick={() => updateItemStatus(item, 'approved')} className="px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                  </button>
                  <button onClick={() => updateItemStatus(item, 'rejected')} className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Rejeitar
                  </button>
                  <button onClick={() => updateItemFeature(item, { isFeatured: !item.isFeatured })} className={`px-3 py-2 rounded-lg border text-xs font-bold flex items-center gap-1 ${item.isFeatured ? 'bg-purple-500/20 text-purple-200 border-purple-500/40' : 'bg-dark-900 text-zinc-400 border-dark-600'}`}>
                    <Star className="w-3.5 h-3.5" /> {item.isFeatured ? 'Destaque' : 'Destacar'}
                  </button>
                  <button onClick={() => updateItemFeature(item, { isHidden: !item.isHidden })} className="px-3 py-2 rounded-lg bg-dark-900 text-zinc-400 border border-dark-600 text-xs font-bold flex items-center gap-1">
                    {item.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {item.isHidden ? 'Mostrar' : 'Ocultar'}
                  </button>
                  <button onClick={() => setConfig((prev) => ({ ...prev, heroItemId: item.id, heroMode: 'manual' }))} className="px-3 py-2 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-bold flex items-center gap-1">
                    <Play className="w-3.5 h-3.5" /> Usar no Hero
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'theme' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-dark-600 bg-dark-800 p-5 space-y-4">
            <h2 className="text-white font-black text-xl">Hero e Identidade Anime</h2>
            {[
              ['title', 'Título da tela'],
              ['subtitle', 'Subtítulo'],
              ['primaryColor', 'Cor primária'],
              ['secondaryColor', 'Cor secundária'],
              ['backgroundColor', 'Fundo'],
              ['buttonColor', 'Botão'],
              ['focusColor', 'Foco'],
              ['glowColor', 'Glow'],
            ].map(([field, label]) => (
              <div key={field}>
                <label className="text-[10px] text-zinc-500 uppercase font-black">{label}</label>
                <input
                  type={field.toLowerCase().includes('color') && !field.includes('glow') ? 'color' : 'text'}
                  value={config.theme[field] || ''}
                  onChange={(e) => updateTheme(field, e.target.value)}
                  className="w-full mt-1 bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500"
                />
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-purple-500/20 bg-zinc-950 overflow-hidden">
            <div className="relative h-96 p-8 flex flex-col justify-end" style={{ backgroundColor: config.theme.backgroundColor }}>
              {(heroItem?.bannerUrl || heroItem?.backdropUrl || heroItem?.posterUrl) && (
                <img src={heroItem.bannerUrl || heroItem.backdropUrl || heroItem.posterUrl} className="absolute inset-0 w-full h-full object-cover opacity-50" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
              <div className="relative z-10 max-w-xl">
                <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: config.theme.primaryColor }}>Preview Hero</p>
                <h2 className="text-4xl font-black text-white">{config.theme.title}</h2>
                <p className="text-zinc-300 mt-2">{config.theme.subtitle}</p>
                <button className="mt-5 px-6 py-3 rounded-xl text-white font-black shadow-lg" style={{ backgroundColor: config.theme.buttonColor, boxShadow: `0 0 35px ${config.theme.glowColor}` }}>
                  ▶ Assistir Agora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'sections' && (
        <div className="rounded-2xl border border-dark-600 bg-dark-800 p-5 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
            <div>
              <h2 className="text-white font-black text-xl">Categorias e Fileiras da Tela Animes</h2>
              <p className="text-xs text-zinc-500 mt-1">
                Organize o que a IA/Nexus já encontrou. Use fontes como <b>category:Crunchyroll</b>, <b>keyword:naruto</b>, <b>tag:shounen</b>, <b>type:series</b> ou <b>manual:destaques</b>.
              </p>
            </div>
            <button onClick={addSection} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider">
              + Adicionar Categoria
            </button>
          </div>
          {config.sections.map((section, index) => (
            <div key={section.id} className={`grid grid-cols-1 lg:grid-cols-[auto_1fr_1fr_120px_120px_auto] gap-3 items-center p-3 rounded-xl border ${section.active ? 'bg-dark-900 border-purple-500/20' : 'bg-dark-900/40 border-dark-700 opacity-60'}`}>
              <button onClick={() => updateSection(index, 'active', !section.active)} className={`w-11 h-6 rounded-full relative transition ${section.active ? 'bg-purple-600' : 'bg-dark-700'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${section.active ? 'left-6' : 'left-1'}`} />
              </button>
              <input value={section.title} onChange={(e) => updateSection(index, 'title', e.target.value)} className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500" />
              <input value={section.source} onChange={(e) => updateSection(index, 'source', e.target.value)} className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-zinc-300 text-sm font-mono outline-none focus:border-purple-500" />
              <select value={section.style} onChange={(e) => updateSection(index, 'style', e.target.value)} className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm outline-none">
                <option value="landscape">Horizontal</option>
                <option value="portrait">Poster</option>
                <option value="ranked">Ranking</option>
              </select>
              <input type="number" min="1" max="50" value={section.limit} onChange={(e) => updateSection(index, 'limit', Number(e.target.value) || 12)} className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm outline-none text-center" />
              <button onClick={() => removeSection(index)} className="px-3 py-2 rounded-lg border border-red-500/20 bg-red-500/10 text-red-300 text-xs font-black">
                Remover
              </button>
            </div>
          ))}
        </div>
      )}

      {activeView === 'preview' && (
        <div className="rounded-3xl border border-purple-500/20 bg-black overflow-hidden shadow-2xl">
          <div className="relative min-h-[520px] p-8" style={{ backgroundColor: config.theme.backgroundColor }}>
            {(heroItem?.bannerUrl || heroItem?.backdropUrl || heroItem?.posterUrl) && (
              <img src={heroItem.bannerUrl || heroItem.backdropUrl || heroItem.posterUrl} className="absolute inset-0 w-full h-full object-cover opacity-45" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />
            <div className="relative z-10">
              <h2 className="text-5xl font-black text-white">{config.theme.title}</h2>
              <p className="text-zinc-300 mt-2 max-w-xl">{config.theme.subtitle}</p>
              <div className="flex gap-3 mt-5">
                <button className="px-6 py-3 rounded-xl text-white font-black" style={{ backgroundColor: config.theme.buttonColor }}>▶ Assistir Agora</button>
                <button className="px-6 py-3 rounded-xl text-white font-black border border-white/20 bg-white/5">⌖ Explorar</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
                {items.slice(0, 4).map((item) => (
                  <div key={item.id} className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                    <div className="aspect-video bg-dark-900">
                      {(item.bannerUrl || item.backdropUrl || item.posterUrl) && <img src={item.bannerUrl || item.backdropUrl || item.posterUrl} className="w-full h-full object-cover" />}
                    </div>
                    <div className="p-3">
                      <h3 className="text-white font-black text-sm truncate">{item.title}</h3>
                      <p className="text-xs text-zinc-500">{item.confidence}% • Anime</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnimeManager
