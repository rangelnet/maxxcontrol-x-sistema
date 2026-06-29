import { useState, useEffect } from 'react'
import api from '../services/api'
import { Loader2, CheckCircle, Save, SlidersHorizontal, Filter, Settings2, Trash2 } from 'lucide-react'
import PreviewContainer from '../components/previews/PreviewContainer'
import PlatformPreview from '../components/previews/PlatformPreview'

const BACKEND_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '')

const getFullUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${BACKEND_URL}${path}`
}

const DEFAULT_PLATFORM_ROWS = [
  { id: 'hero_banner', name: 'Banner Principal (Hero)', active: true, limit: 5, style: 'hero' },
  { id: 'continue_watching', name: 'Continue Assistindo', active: true, limit: 10, style: 'landscape' },
  { id: 'top_ranked', name: 'Top 10 Destaques (Ranking)', active: true, limit: 10, style: 'ranked' },
  { id: 'trends', name: 'Tendências', active: true, limit: 15, style: 'landscape' },
  { id: 'highlights', name: 'Em Alta na Plataforma', active: true, limit: 20, style: 'portrait' },
  { id: 'categories', name: 'Categorias Normais', active: true, limit: 20, style: 'portrait' },
]

const DEFAULT_PLATFORM_TABS = [
  { id: 'all', label: 'Início', active: true },
  { id: 'series', label: 'Séries', active: true },
  { id: 'movies', label: 'Filmes', active: true },
  { id: 'mylist', label: 'Minha MAXX', active: true },
]

const DEFAULT_CUSTOM_PLATFORMS = [
  { id: 'nfx', label: 'Netflix', active: true, banner: '/branding/banner_ntx.png', logo: '/branding/logos/nfx.png', keywords: 'netflix, ntx', bgColor: '#000000', primaryColor: '#E50914', highlightTag: 'Em Alta na Netflix', billboard: true, rows: DEFAULT_PLATFORM_ROWS, tabs: DEFAULT_PLATFORM_TABS },
  { id: 'prm', label: 'Prime Video', active: true, banner: '/branding/banner_pv.png', logo: '/branding/logos/prm.png', keywords: 'prime, amazon', bgColor: '#0F171E', primaryColor: '#00A8E1', highlightTag: 'Popular no Prime Video', billboard: true, rows: DEFAULT_PLATFORM_ROWS, tabs: DEFAULT_PLATFORM_TABS },
  { id: 'dis', label: 'Disney+', active: true, banner: '/branding/banner_disney.png', logo: '/branding/logos/dis.png', keywords: 'disney', bgColor: '#0C1B3A', primaryColor: '#006E99', highlightTag: 'Populares na Disney+', billboard: true, rows: DEFAULT_PLATFORM_ROWS, tabs: DEFAULT_PLATFORM_TABS },
  { id: 'hbo', label: 'HBO Max', active: true, banner: '/branding/banner_hm.png', logo: '/branding/logos/hbo.png', keywords: 'hbo, max', bgColor: '#0A0014', primaryColor: '#991BFA', highlightTag: 'Em Alta na HBO', billboard: true, rows: DEFAULT_PLATFORM_ROWS, tabs: DEFAULT_PLATFORM_TABS },
  { id: 'glo', label: 'Globoplay', active: true, banner: '/branding/banner_glo.png', logo: '/branding/logos/glo.png', keywords: 'globoplay, globo', bgColor: '#0A0A0A', primaryColor: '#FF3501', highlightTag: 'Em Alta no Globoplay', billboard: true, rows: DEFAULT_PLATFORM_ROWS, tabs: DEFAULT_PLATFORM_TABS },
  { id: 'sta', label: 'Star+', active: true, banner: '/branding/banner_star.png', logo: '/branding/logos/sta.png', keywords: 'star, starz', bgColor: '#121926', primaryColor: '#FF6600', highlightTag: 'Em Alta no Star+', billboard: true, rows: DEFAULT_PLATFORM_ROWS, tabs: DEFAULT_PLATFORM_TABS },
  { id: 'par', label: 'Paramount+', active: true, banner: '/branding/banner_pt.png', logo: '/branding/logos/par.png', keywords: 'paramount', bgColor: '#0A0F1E', primaryColor: '#0066FF', highlightTag: 'Em Alta no Paramount+', billboard: true, rows: DEFAULT_PLATFORM_ROWS, tabs: DEFAULT_PLATFORM_TABS },
  { id: 'ani', label: 'Crunchyroll', active: true, banner: '/branding/banner_cru.png', logo: '/branding/logos/ani.png', keywords: 'crunchyroll, anime, animes, tokusatsu, animacao, animation', bgColor: '#141414', primaryColor: '#F47521', highlightTag: 'Popular no Crunchyroll', billboard: true, rows: DEFAULT_PLATFORM_ROWS, tabs: DEFAULT_PLATFORM_TABS },
  { id: 'hul', label: 'Hulu', active: true, banner: '/branding/banner_hulu.png', logo: '/branding/logos/hul.png', keywords: 'hulu', bgColor: '#0B1410', primaryColor: '#3DBB3D', highlightTag: 'Popular no Hulu', billboard: true, rows: DEFAULT_PLATFORM_ROWS, tabs: DEFAULT_PLATFORM_TABS },
  { id: 'app', label: 'Apple TV+', active: true, banner: '/branding/banner_apptv.png', logo: '/branding/logos/app.png', keywords: 'apple', bgColor: '#000000', primaryColor: '#FFFFFF', highlightTag: 'Originais Apple TV+', billboard: true, rows: DEFAULT_PLATFORM_ROWS, tabs: DEFAULT_PLATFORM_TABS },
  { id: 'gaming', label: 'Maxx Gaming', active: true, banner: '/branding/banner_mgaming.png', logo: '/branding/logos/gaming.png', keywords: 'gaming, games', bgColor: '#050505', primaryColor: '#FC5F16', highlightTag: 'Top Games', billboard: true, rows: DEFAULT_PLATFORM_ROWS, tabs: DEFAULT_PLATFORM_TABS },
  { id: 'hot', label: 'Maxx Red (Adulto)', active: true, banner: '/branding/banner_mred.png', logo: '/branding/logos/hot.png', keywords: 'adulto, sexo, xxx', bgColor: '#050505', primaryColor: '#FF0055', highlightTag: 'Populares Adultos', billboard: true, rows: DEFAULT_PLATFORM_ROWS, tabs: DEFAULT_PLATFORM_TABS }
]

export default function PlatformUiManager() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const [fullBrandingData, setFullBrandingData] = useState(null)
  const [customPlatforms, setCustomPlatforms] = useState([])
  const [tmdbWords, setTmdbWords] = useState('')
  const [tmdbApiKey, setTmdbApiKey] = useState('')
  const [selectedPlatId, setSelectedPlatId] = useState('')

  const showFeedback = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // 1. Puxa as plataformas criadas no Branding atual
      const { data: brandingData } = await api.get('/api/branding/current')
      setFullBrandingData(brandingData)
      
      const cps = brandingData?.custom_platforms || []
      if (cps.length === 0) {
        setCustomPlatforms(DEFAULT_CUSTOM_PLATFORMS)
        if (DEFAULT_CUSTOM_PLATFORMS.length > 0) setSelectedPlatId(DEFAULT_CUSTOM_PLATFORMS[0].id)
      } else {
        setCustomPlatforms(cps)
        setSelectedPlatId(cps[0].id)
      }

      // 2. Puxa Filtros TMDB e API Key
      const { data: tmdbData } = await api.get('/api/ui/tmdb-filters')
      
      // Mescla o Dicionário TMDB (se o brandingData tiver um dicionário mais recente, usa ele, senão usa do ui-config)
      const brandingWords = brandingData?.tmdb_filter_words
      setTmdbWords(brandingWords || tmdbData?.data?.words || '')
      setTmdbApiKey(tmdbData?.data?.apiKey || '')
    } catch (err) {
      console.error(err)
      showFeedback('Erro ao carregar configurações', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // 1. Salvar Dicionário e TMDB Global
      await api.post('/api/ui/tmdb-filters', { words: tmdbWords, apiKey: tmdbApiKey }).catch(e => console.warn(e))

      // 2. Salvar Dados Base no Banco de Branding
      if (fullBrandingData?.id) {
        const newBranding = { 
          ...fullBrandingData, 
          custom_platforms: customPlatforms,
          platforms: customPlatforms,
          tmdb_filter_words: tmdbWords 
        }
        await api.put(`/api/branding/${fullBrandingData.id}`, newBranding).catch(e => console.warn(e))
        setFullBrandingData(newBranding)
      }

      // 3. Salvar as Configurações Estruturais em /api/ui/platforms para garantir compatibilidade
      const platformsConfig = {}
      customPlatforms.forEach(p => {
        platformsConfig[p.id] = { tabs: p.tabs, rows: p.rows }
      })
      await api.post('/api/ui/platforms', { platforms: platformsConfig }).catch(e => console.warn(e))

      showFeedback('Configurações salvas e unificadas com sucesso!')
    } catch (err) {
      console.error('Erro ao salvar', err)
      showFeedback('Erro ao salvar configurações', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Lógica CRUD de Plataformas
  const addPlatform = () => {
    const newId = `plat_${Date.now()}`
    const newPlat = {
      id: newId,
      label: 'Nova Plataforma',
      active: true,
      banner: '',
      logo: '',
      keywords: '',
      bgColor: '#000000',
      primaryColor: '#FC5F16',
      highlightTag: 'Em Alta',
      billboard: true,
      rows: DEFAULT_PLATFORM_ROWS,
      tabs: DEFAULT_PLATFORM_TABS,
    }
    setCustomPlatforms(prev => [...prev, newPlat])
    setSelectedPlatId(newId)
  }

  const updatePlatform = (id, field, value) => {
    setCustomPlatforms(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const deletePlatform = (id) => {
    if(!window.confirm('Excluir plataforma?')) return
    setCustomPlatforms(prev => {
      const filtered = prev.filter(p => p.id !== id)
      if (filtered.length > 0 && selectedPlatId === id) setSelectedPlatId(filtered[0].id)
      else if (filtered.length === 0) setSelectedPlatId('')
      return filtered
    })
  }

  const handleUpload = async (e, id, field) => {
    const file = e.target.files[0]
    if (!file) return
    const uploadData = new FormData()
    uploadData.append('file', file)
    try {
      const response = await api.post('/api/branding/upload', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } })
      updatePlatform(id, field, response.data.url)
    } catch (err) {
      console.error(err)
      alert('Erro ao fazer upload da imagem.')
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
      <Loader2 className="h-8 w-8 animate-spin mb-4" />
      <p>Carregando Inteligência das Plataformas...</p>
    </div>
  )

  const selectedPlat = customPlatforms.find(p => p.id === selectedPlatId) || null

  return (
    <div className="space-y-6 animate-fadeIn">
      {message && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl border ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        } backdrop-blur-md`}>
          <CheckCircle className="h-5 w-5" />
          <p className="font-medium text-sm">{message.text}</p>
        </div>
      )}

      {/* 1. Dicionário TMDB e Inteligência */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden shadow-lg shadow-black/20">
        <div className="p-5 border-b border-dark-600 bg-dark-800/80 flex items-center gap-3">
          <Filter className="h-5 w-5 text-brand-500" />
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">Inteligência Global TMDB</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Gerencie a API Key do TMDB e as palavras filtradas para capas.</p>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-400 mb-2 block uppercase tracking-wider">Sua TMDB API Key</label>
            <input
              type="text"
              value={tmdbApiKey}
              onChange={e => setTmdbApiKey(e.target.value)}
              placeholder="7bc56e27708a9d2069fc999d..."
              className="w-full bg-dark-900 border border-dark-600 rounded-lg p-3 text-white outline-none focus:border-brand-500 transition text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-400 mb-2 block uppercase tracking-wider">Filtro TMDB (Palavras Sujas)</label>
            <textarea
              value={tmdbWords}
              onChange={e => setTmdbWords(e.target.value)}
              placeholder="Ex: 4k, 1080p, dublado, legendado..."
              className="w-full h-24 bg-dark-900 border border-dark-600 rounded-lg p-4 text-white resize-none outline-none focus:border-brand-500 font-mono transition"
            />
          </div>
        </div>
      </div>

      {/* 2. Gerenciador de Plataformas Unificado */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden shadow-lg shadow-black/20">
        <div className="p-5 border-b border-dark-600 bg-dark-800/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="h-5 w-5 text-brand-500" />
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Gerenciador de Plataformas & UI</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Controle dados e layout (Server-Driven UI) das plataformas do App.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={addPlatform}
              className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg text-sm font-bold transition flex items-center gap-2"
            >
              + Adicionar Plataforma
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition flex items-center gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Salvando...' : 'Salvar Todas as Configurações'}
            </button>
          </div>
        </div>

        {customPlatforms.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <p className="mb-4">Nenhuma plataforma criada ainda.</p>
            <button onClick={addPlatform} className="px-6 py-2.5 bg-brand-500 hover:bg-brand-400 text-white rounded-lg font-bold">Criar Primeira Plataforma</button>
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row">
            
            {/* Menu Lateral de Plataformas */}
            <div className="w-full xl:w-72 border-b xl:border-b-0 xl:border-r border-dark-600 bg-dark-850 p-3 space-y-1 overflow-x-auto xl:overflow-x-hidden flex xl:flex-col items-center xl:items-stretch">
              {customPlatforms.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlatId(p.id)}
                  className={`shrink-0 xl:shrink w-40 xl:w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedPlatId === p.id 
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' 
                      : 'text-zinc-400 hover:bg-dark-700 hover:text-white border border-transparent'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${p.active ? 'bg-green-500' : 'bg-red-500'} shrink-0`} />
                  <img src={getFullUrl(p.logo)} alt="" className="w-6 h-6 object-contain rounded" onError={e => e.target.style.display='none'} />
                  <span className="truncate">{p.label}</span>
                </button>
              ))}
            </div>

            {/* Painel Central de Edição */}
            <div className="flex-1 p-5 space-y-6 bg-dark-900/50 overflow-y-auto max-h-[800px]">
              
              {selectedPlat ? (
                <>
                  {/* Header e Dados Base */}
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 border-b border-dark-700 pb-4">
                      <button type="button" onClick={() => updatePlatform(selectedPlat.id, 'active', !selectedPlat.active)} className={`w-12 h-6 rounded-full relative shrink-0 transition-colors ${selectedPlat.active ? 'bg-brand-500' : 'bg-dark-700'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${selectedPlat.active ? 'left-7' : 'left-1'}`} />
                      </button>
                      <input 
                        type="text" 
                        value={selectedPlat.label} 
                        onChange={e => updatePlatform(selectedPlat.id, 'label', e.target.value)} 
                        className="bg-transparent border-b border-dark-600 focus:border-brand-500 text-white font-bold text-xl outline-none px-1 py-0.5 flex-1 max-w-sm" 
                        placeholder="Nome da Plataforma" 
                      />
                      <button onClick={() => deletePlatform(selectedPlat.id)} className="ml-auto text-red-500 hover:text-red-400 p-2 shrink-0 transition" title="Excluir Plataforma">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase">Palavras-chave de Busca</label>
                          <input type="text" value={selectedPlat.keywords} onChange={e => updatePlatform(selectedPlat.id, 'keywords', e.target.value)} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-500 outline-none" placeholder="ex: netflix, ntx" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase">Tag de Destaque</label>
                          <input type="text" value={selectedPlat.highlightTag} onChange={e => updatePlatform(selectedPlat.id, 'highlightTag', e.target.value)} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-500 outline-none" placeholder="ex: Em Alta" />
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Fundo</label>
                            <input type="color" value={selectedPlat.bgColor || '#000000'} onChange={e => updatePlatform(selectedPlat.id, 'bgColor', e.target.value)} className="w-full h-10 rounded bg-transparent cursor-pointer" />
                          </div>
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Destaque</label>
                            <input type="color" value={selectedPlat.primaryColor || '#FC5F16'} onChange={e => updatePlatform(selectedPlat.id, 'primaryColor', e.target.value)} className="w-full h-10 rounded bg-transparent cursor-pointer" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 border-l border-dark-700 pl-6">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase flex justify-between">
                            Banner Home (800x450)
                            {selectedPlat.banner && <button type="button" onClick={() => updatePlatform(selectedPlat.id, 'banner', '')} className="text-red-500 hover:text-red-400">Remover</button>}
                          </label>
                          <div className="relative group w-full h-24 bg-dark-900 border border-dark-600 rounded-lg overflow-hidden mt-1 hover:border-brand-500">
                            <input type="file" accept="image/*" onChange={(e) => handleUpload(e, selectedPlat.id, 'banner')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                            {selectedPlat.banner ? <img src={getFullUrl(selectedPlat.banner)} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-500">Upload Banner</div>}
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase flex justify-between">
                            Logo Transparente
                            {selectedPlat.logo && <button type="button" onClick={() => updatePlatform(selectedPlat.id, 'logo', '')} className="text-red-500 hover:text-red-400">Remover</button>}
                          </label>
                          <div className="relative group w-full h-14 bg-dark-900 border border-dark-600 rounded-lg overflow-hidden mt-1 hover:border-brand-500 flex items-center justify-center">
                            <input type="file" accept="image/*" onChange={(e) => handleUpload(e, selectedPlat.id, 'logo')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                            {selectedPlat.logo ? <img src={getFullUrl(selectedPlat.logo)} className="h-10 object-contain p-1" /> : <div className="text-xs text-zinc-500">Upload Logo</div>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-900 border border-dark-600">
                          <button type="button" onClick={() => updatePlatform(selectedPlat.id, 'billboard', !selectedPlat.billboard)} className={`w-10 h-5 rounded-full relative shrink-0 transition-colors ${selectedPlat.billboard !== false ? 'bg-brand-500' : 'bg-dark-700'}`}>
                            <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-all ${selectedPlat.billboard !== false ? 'left-[22px]' : 'left-[3px]'}`} />
                          </button>
                          <div>
                            <span className="text-xs font-bold text-white">Ativar Efeito Billboard (Banner expandido no foco)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* UI Server-Driven (Abas e Linhas) */}
                  <div className="grid grid-cols-1 gap-6 pt-4 border-t border-dark-700">
                    
                    {/* Abas */}
                    <div className="bg-dark-800 border border-dark-600 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Settings2 className="w-4 h-4 text-zinc-400" />
                        <h4 className="text-sm font-bold text-white uppercase">Abas de Navegação</h4>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {(selectedPlat.tabs || DEFAULT_PLATFORM_TABS).map((tab, tabIdx) => (
                          <div key={tab.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${tab.active ? 'bg-dark-800 border-brand-500/30' : 'bg-dark-900/50 border-dark-700 opacity-50'}`}>
                            <button type="button" onClick={() => {
                              const newTabs = [...(selectedPlat.tabs || DEFAULT_PLATFORM_TABS)];
                              newTabs[tabIdx] = { ...newTabs[tabIdx], active: !newTabs[tabIdx].active };
                              updatePlatform(selectedPlat.id, 'tabs', newTabs);
                            }} className={`w-8 h-4 rounded-full relative shrink-0 transition-colors ${tab.active ? 'bg-brand-500' : 'bg-dark-700'}`}>
                              <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all ${tab.active ? 'left-[18px]' : 'left-[2px]'}`} />
                            </button>
                            <input type="text" value={tab.label} onChange={e => {
                              const newTabs = [...(selectedPlat.tabs || DEFAULT_PLATFORM_TABS)];
                              newTabs[tabIdx] = { ...newTabs[tabIdx], label: e.target.value };
                              updatePlatform(selectedPlat.id, 'tabs', newTabs);
                            }} className="bg-transparent text-white text-xs font-bold outline-none border-b border-transparent focus:border-brand-500 w-24 px-1" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Linhas */}
                    <div className="bg-dark-800 border border-dark-600 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
                        <h4 className="text-sm font-bold text-white uppercase">Layout das Fileiras</h4>
                        <span className="text-[9px] text-zinc-500 ml-auto hidden sm:block">Ordem, estilos e limites de exibição</span>
                      </div>
                      <div className="space-y-2">
                        {(selectedPlat.rows || DEFAULT_PLATFORM_ROWS).map((row, rowIdx) => (
                          <div key={row.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all ${row.active ? 'bg-dark-850 border-dark-600' : 'bg-dark-900/50 border-dark-700 opacity-50'}`}>
                            {/* Reordenar */}
                            <div className="flex flex-col gap-0.5 shrink-0">
                              <button type="button" disabled={rowIdx === 0} onClick={() => {
                                const newRows = [...(selectedPlat.rows || DEFAULT_PLATFORM_ROWS)];
                                [newRows[rowIdx - 1], newRows[rowIdx]] = [newRows[rowIdx], newRows[rowIdx - 1]];
                                updatePlatform(selectedPlat.id, 'rows', newRows);
                              }} className="text-[10px] text-zinc-500 hover:text-white disabled:opacity-20">▲</button>
                              <button type="button" disabled={rowIdx === (selectedPlat.rows || DEFAULT_PLATFORM_ROWS).length - 1} onClick={() => {
                                const newRows = [...(selectedPlat.rows || DEFAULT_PLATFORM_ROWS)];
                                [newRows[rowIdx], newRows[rowIdx + 1]] = [newRows[rowIdx + 1], newRows[rowIdx]];
                                updatePlatform(selectedPlat.id, 'rows', newRows);
                              }} className="text-[10px] text-zinc-500 hover:text-white disabled:opacity-20">▼</button>
                            </div>

                            {/* Ativar/Desativar */}
                            <button type="button" onClick={() => {
                              const newRows = [...(selectedPlat.rows || DEFAULT_PLATFORM_ROWS)];
                              newRows[rowIdx] = { ...newRows[rowIdx], active: !newRows[rowIdx].active };
                              updatePlatform(selectedPlat.id, 'rows', newRows);
                            }} className={`w-8 h-4 rounded-full relative shrink-0 transition-colors ${row.active ? 'bg-brand-500' : 'bg-dark-700'}`}>
                              <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all ${row.active ? 'left-[18px]' : 'left-[2px]'}`} />
                            </button>

                            {/* Nome */}
                            <input type="text" value={row.name} onChange={e => {
                              const newRows = [...(selectedPlat.rows || DEFAULT_PLATFORM_ROWS)];
                              newRows[rowIdx] = { ...newRows[rowIdx], name: e.target.value };
                              updatePlatform(selectedPlat.id, 'rows', newRows);
                            }} className="bg-transparent text-white text-xs font-medium flex-1 min-w-0 outline-none border-b border-transparent focus:border-brand-500 px-1" />

                            {/* Estilo */}
                            <select value={row.style} onChange={e => {
                              const newRows = [...(selectedPlat.rows || DEFAULT_PLATFORM_ROWS)];
                              newRows[rowIdx] = { ...newRows[rowIdx], style: e.target.value };
                              updatePlatform(selectedPlat.id, 'rows', newRows);
                            }} className="bg-dark-900 text-[10px] text-zinc-400 border border-dark-600 rounded px-2 py-1 outline-none hidden sm:block">
                              <option value="hero">🖼️ Hero Banner</option>
                              <option value="ranked">🏆 Ranking (1-10)</option>
                              <option value="landscape">📺 Paisagem (Deitado)</option>
                              <option value="portrait">📱 Retrato (Em pé)</option>
                            </select>

                            {/* Limite */}
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[9px] text-zinc-500 hidden sm:inline">Qtd:</span>
                              <input type="number" min="1" max="50" value={row.limit} onChange={e => {
                                const newRows = [...(selectedPlat.rows || DEFAULT_PLATFORM_ROWS)];
                                newRows[rowIdx] = { ...newRows[rowIdx], limit: parseInt(e.target.value) || 5 };
                                updatePlatform(selectedPlat.id, 'rows', newRows);
                              }} className="w-10 sm:w-12 bg-dark-900 border border-dark-600 rounded px-1.5 py-0.5 text-white text-[11px] text-center outline-none focus:border-brand-500" />
                            </div>

                            {/* Excluir Fileira */}
                            <button type="button" onClick={() => {
                              const newRows = [...(selectedPlat.rows || DEFAULT_PLATFORM_ROWS)];
                              newRows.splice(rowIdx, 1);
                              updatePlatform(selectedPlat.id, 'rows', newRows);
                            }} className="text-red-500 hover:text-red-400 shrink-0 ml-1" title="Remover Fileira">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Botão Adicionar Fileira */}
                      <div className="mt-4 flex justify-center">
                        <button type="button" onClick={() => {
                          const newRows = [...(selectedPlat.rows || DEFAULT_PLATFORM_ROWS)];
                          newRows.push({
                            id: `row_${Date.now()}`,
                            name: 'Nova Fileira',
                            active: true,
                            limit: 15,
                            style: 'landscape'
                          });
                          updatePlatform(selectedPlat.id, 'rows', newRows);
                        }} className="px-4 py-2 bg-dark-900 hover:bg-dark-700 border border-dark-600 text-zinc-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-2">
                          + Adicionar Fileira Personalizada
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-500">Selecione uma plataforma ao lado</div>
              )}
            </div>

            {/* Lado Direito: Preview (Oculto em telas pequenas) */}
            <div className="hidden 2xl:flex w-[400px] border-l border-dark-600 bg-dark-900/30 p-5 flex-col space-y-4 overflow-y-auto max-h-[800px]">
              {selectedPlat && (
                <PreviewContainer title={`Preview: ${selectedPlat.label}`}>
                  <PlatformPreview 
                    platform={selectedPlat} 
                    config={{ tabs: selectedPlat.tabs, rows: selectedPlat.rows }} 
                  />
                </PreviewContainer>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
