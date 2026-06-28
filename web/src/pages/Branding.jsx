import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import api from '../services/api'

const BACKEND_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '')

const getFullUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${BACKEND_URL}${path}`
}

// ─── PALETAS RÁPIDAS ───────────────────────────────────────────────────────────
const PALETTES = [
  { name: 'MAXX Orange',  tema: 'Neon',     primary: '#FC5F16', secondary: '#FF6A00', bg: '#050505', text: '#FFFFFF', accent: '#FF8C00', btnPrimary: '#FC5F16', btnFocus: '#FFA500' },
  { name: 'Netflix Red',  tema: 'Custom',   primary: '#E50914', secondary: '#B20710', bg: '#141414', text: '#FFFFFF', accent: '#FF1E2D', btnPrimary: '#E50914', btnFocus: '#B20710' },
  { name: 'Prime Blue',   tema: 'Azul',     primary: '#00A8E1', secondary: '#0094CB', bg: '#0F171E', text: '#FFFFFF', accent: '#1EC1F0', btnPrimary: '#00A8E1', btnFocus: '#0094CB' },
  { name: 'Disney+',      tema: 'Custom',   primary: '#113CCF', secondary: '#0B2AA0', bg: '#040B2A', text: '#FFFFFF', accent: '#1A4DE0', btnPrimary: '#113CCF', btnFocus: '#1A4DE0' },
  { name: 'Paramount',    tema: 'Custom',   primary: '#006EFF', secondary: '#0055CC', bg: '#0A0A14', text: '#FFFFFF', accent: '#3385FF', btnPrimary: '#006EFF', btnFocus: '#3385FF' },
  { name: 'Neon Green',   tema: 'Custom',   primary: '#00FF87', secondary: '#00CC6E', bg: '#070F0A', text: '#FFFFFF', accent: '#00E87A', btnPrimary: '#00FF87', btnFocus: '#00E87A' },
  { name: 'Roxo Premium', tema: 'Custom',   primary: '#9B59B6', secondary: '#8E44AD', bg: '#0D0812', text: '#FFFFFF', accent: '#A975C8', btnPrimary: '#9B59B6', btnFocus: '#A975C8' },
  { name: 'Gold Line',    tema: 'Custom',   primary: '#FFD700', secondary: '#FFC107', bg: '#0A0800', text: '#FFFFFF', accent: '#FFE033', btnPrimary: '#FFD700', btnFocus: '#FFE033' },
]

// ─── TOP MENU PADRÃO ───────────────────────────────────────────────────────────
const DEFAULT_TOP_MENU = [
  { id: 'tv', label: 'TV', route: '/live_tv', ativo: true, icon_url: '', display_mode: 'text' },
  { id: 'home', label: 'HOME', route: '/home', ativo: true, icon_url: '', display_mode: 'text' },
  { id: 'sports', label: 'ESPORTES', route: '/sports', ativo: true, icon_url: '', display_mode: 'text' },
  { id: 'featured', label: 'DESTAQUES', route: '/featured', ativo: true, icon_url: '', display_mode: 'text' },
  { id: 'animes', label: 'ANIME', route: '/animes', ativo: true, icon_url: '', display_mode: 'text' },
  { id: 'kids', label: 'KIDS', route: '/kids', ativo: true, icon_url: '', display_mode: 'text' },
]

const mergeTopMenu = (savedMenu) => {
  if (!savedMenu || !Array.isArray(savedMenu)) return DEFAULT_TOP_MENU
  return DEFAULT_TOP_MENU.map(defaultItem => {
    const savedItem = savedMenu.find(i => i.id === defaultItem.id)
    return savedItem ? { ...defaultItem, ...savedItem } : defaultItem
  })
}

// ─── LAYOUT PADRÃO DAS FILEIRAS DE PLATAFORMA ──────────────────────────────────
const DEFAULT_PLATFORM_ROWS = [
  { id: 'hero_banner', name: 'Banner Principal (Hero)', active: true, limit: 5, style: 'hero' },
  { id: 'continue_watching', name: 'Continue Assistindo', active: true, limit: 10, style: 'landscape' },
  { id: 'top_ranked', name: 'Top 10 Destaques (Ranking)', active: true, limit: 10, style: 'ranked' },
  { id: 'trends', name: 'Tendências', active: true, limit: 15, style: 'landscape' },
  { id: 'highlights', name: 'Em Alta na Plataforma', active: true, limit: 20, style: 'portrait' },
  { id: 'categories', name: 'Categorias Normais', active: true, limit: 20, style: 'portrait' },
]

// ─── ABAS PADRÃO DENTRO DA PLATAFORMA ──────────────────────────────────────────
const DEFAULT_PLATFORM_TABS = [
  { id: 'all', label: 'Início', active: true },
  { id: 'series', label: 'Séries', active: true },
  { id: 'movies', label: 'Filmes', active: true },
  { id: 'mylist', label: 'Minha MAXX', active: true },
]

// ─── FILTRO TMDB PADRÃO (PALAVRAS SUJAS) ───────────────────────────────────────
const DEFAULT_TMDB_FILTER = '4k, 1080p, 720p, fhd, hd, sd, dual, dublado, legendado, leg, dub, nacional, netflix, nfx, amaz, disney, globo, hbo, apple, paramount, starz, youtube, ts, cam, lancamento'

// ─── PLATAFORMAS PADRÃO (INTELIGÊNCIA NATIVA DO APP) ───────────────────────────
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

const mergeCustomPlatforms = (savedPlatforms) => {
  if (!savedPlatforms || !Array.isArray(savedPlatforms) || savedPlatforms.length === 0) return DEFAULT_CUSTOM_PLATFORMS
  return savedPlatforms
}


// ─── CAMPO DE COR ──────────────────────────────────────────────────────────────
const ColorField = ({ label, value, onChange }) => (
  <div>
    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">{label}</label>
    <div className="flex items-center gap-2 bg-dark-900 border border-dark-600 rounded-xl px-3 py-2 focus-within:border-brand-500 transition group">
      <div className="relative shrink-0">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0.5"
          style={{ backgroundColor: value }}
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        maxLength={7}
        className="flex-1 bg-transparent text-white font-mono text-sm outline-none min-w-0"
        placeholder="#000000"
      />
      <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: value }} />
    </div>
  </div>
)

// ─── CAMPO DE INPUT ────────────────────────────────────────────────────────────
const InputField = ({ label, value, onChange, placeholder, type = 'text', hint }) => (
  <div>
    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-2.5 text-white text-sm focus:border-brand-500 outline-none transition"
    />
    {hint && <p className="text-[10px] text-zinc-600 mt-1">{hint}</p>}
  </div>
)

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
const Branding = () => {
  const [branding, setBranding] = useState(null)
  const [allBrandings, setAllBrandings] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState('identidade')

  const [formData, setFormData] = useState({
    app_name:         'TV Maxx',
    logo_url:         '/branding/ic_maxx_player.png',
    logo_dark_url:    '/branding/ic_launcher.png',
    primary_color:    '#FC5F16',
    secondary_color:  '#FF6A00',
    background_color: '#050505',
    text_color:       '#FFFFFF',
    accent_color:     '#FF8C00',
    button_primary_color: '#FC5F16',
    button_secondary_color: '#FF6A00',
    button_text_color: '#FFFFFF',
    button_focus_color: '#FFA500',
    splash_screen_url:'https://i.postimg.cc/BQwXmzTj/TVMAXX_MOVE.png',
    hero_banner_url:  '/branding/banner_apptv.png',
    tema:             'Neon',
    whatsapp:         '',
    top_menu:         DEFAULT_TOP_MENU,
    custom_platforms: DEFAULT_CUSTOM_PLATFORMS,
    tmdb_filter_words: DEFAULT_TMDB_FILTER,
  })

  useEffect(() => {
    loadAllBrandings()
    loadTemplates()
  }, [])

  const loadAllBrandings = async () => {
    try {
      const r = await api.get('/api/branding')
      setAllBrandings(r.data || [])
      
      // Tenta selecionar o ativo por padrão ou o primeiro da lista
      const active = r.data.find(b => b.ativo)
      if (active) {
        selectBranding(active)
      } else if (r.data.length > 0) {
        selectBranding(r.data[0])
      }
    } catch (e) {
      console.error('Erro ao listar brandings:', e)
    } finally {
      setLoading(false)
    }
  }

  const selectBranding = (b) => {
    setBranding(b)
    setFormData({
      app_name:          b.app_name         || 'TV Maxx',
      logo_url:          b.logo_url         || '',
      logo_dark_url:     b.logo_dark_url    || '',
      primary_color:     b.primary_color    || '#FC5F16',
      secondary_color:   b.secondary_color  || '#FF6A00',
      background_color:  b.background_color || '#050505',
      text_color:        b.text_color       || '#FFFFFF',
      accent_color:      b.accent_color     || '#FF8C00',
      button_primary_color: b.button_primary_color || b.primary_color || '#FC5F16',
      button_secondary_color: b.button_secondary_color || b.secondary_color || '#FF6A00',
      button_text_color: b.button_text_color || b.text_color || '#FFFFFF',
      button_focus_color: b.button_focus_color || b.accent_color || '#FFA500',
      splash_screen_url: b.splash_screen_url|| '',
      hero_banner_url:   b.hero_banner_url  || '',
      custom_platforms:  mergeCustomPlatforms(b.custom_platforms),
      top_menu:          mergeTopMenu(b.top_menu),
      tmdb_filter_words: b.tmdb_filter_words || DEFAULT_TMDB_FILTER,
      tema:              b.tema             || 'Neon'
    })
  }

  const loadTemplates = async () => {
    try {
      const r = await api.get('/api/branding/templates')
      setTemplates(r.data || [])
    } catch { /* ignora */ }
  }

  const set = (key) => (val) => setFormData(prev => ({ ...prev, [key]: val }))



  const updateTopMenu = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      top_menu: prev.top_menu.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }))
  }

  const handleMenuIconUpload = async (e, id) => {
    const file = e.target.files[0]
    if (!file) return
    const uploadData = new FormData()
    uploadData.append('file', file)
    setSaving(true)
    try {
      const response = await api.post('/api/branding/upload', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } })
      updateTopMenu(id, 'icon_url', response.data.url)
    } catch (err) {
      alert('Erro ao fazer upload do ícone.')
    } finally {
      setSaving(false)
    }
  }

  const handlePlatformBannerUpload = async (e, id) => {
    const file = e.target.files[0]
    if (!file) return
    const uploadData = new FormData()
    uploadData.append('file', file)
    setSaving(true)
    try {
      const response = await api.post('/api/branding/upload', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setFormData(prev => ({
        ...prev,
        platform_banners: {
          ...(prev.platform_banners || {}),
          [id]: response.data.url
        }
      }))
    } catch (err) {
      alert('Erro ao fazer upload do banner da plataforma.')
    } finally {
      setSaving(false)
    }
  }

  const PLATFORMS_LIST = [
    { id: 'nfx', label: 'Netflix', banner: '/branding/banner_ntx.png' },
    { id: 'prm', label: 'Prime Video', banner: '/branding/banner_pv.png' },
    { id: 'dis', label: 'Disney+', banner: '/branding/banner_disney.png' },
    { id: 'hbo', label: 'HBO Max', banner: '/branding/banner_hm.png' },
    { id: 'glo', label: 'Globoplay', banner: '/branding/banner_glo.png' },
    { id: 'sta', label: 'Star+', banner: '/branding/banner_star.png' },
    { id: 'par', label: 'Paramount+', banner: '/branding/banner_pt.png' },
    { id: 'ani', label: 'Crunchyroll', banner: '/branding/banner_cru.png' },
    { id: 'hul', label: 'Hulu', banner: '/branding/banner_hulu.png' },
    { id: 'app', label: 'Apple TV+', banner: '/branding/banner_apptv.png' },
    { id: 'gaming', label: 'Maxx Gaming', banner: '/branding/banner_mgaming.png' },
    { id: 'maxx', label: 'Maxx Play', banner: '/branding/banner_mplay.png' },
    { id: 'hot', label: 'Maxx Red (Adulto)', banner: '/branding/banner_mred.png' },
  ]

  const applyPalette = (p) => setFormData(prev => ({
    ...prev,
    primary_color:    p.primary,
    secondary_color:  p.secondary,
    background_color: p.bg,
    text_color:       p.text,
    accent_color:     p.accent,
    button_primary_color: p.btnPrimary || p.primary,
    button_focus_color: p.btnFocus || p.accent,
    tema:             p.tema || 'Custom'
  }))

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setSaving(true)
    try {
      if (branding?.id) {
        await api.put(`/api/branding/${branding.id}`, formData)
      } else {
        await api.post('/api/branding', formData)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      loadAllBrandings()
    } catch (err) {
      console.error('Erro ao salvar:', err)
      alert(err.response?.data?.error || 'Erro ao salvar branding')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateNew = () => {
    setBranding(null)
    setFormData({
      app_name:         'Novo Tema',
      logo_url:         '',
      logo_dark_url:    '',
      primary_color:    '#FC5F16',
      secondary_color:  '#FF6A00',
      background_color: '#050505',
      text_color:       '#FFFFFF',
      accent_color:     '#FF8C00',
      splash_screen_url:'',
      hero_banner_url:  '',
      platforms:        [],
      platform_banners: {},
      top_menu:         DEFAULT_TOP_MENU
    })
  }

  const handleActivate = async () => {
    if (!branding?.id) return
    setSaving(true)
    try {
      await api.post(`/api/branding/${branding.id}/activate`)
      alert('Tema ativado com sucesso! Este tema agora é o padrão do App.')
      loadAllBrandings()
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao ativar tema')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!branding?.id) return
    if (!window.confirm('Tem certeza que deseja excluir este tema? Esta ação é irreversível.')) return
    
    setSaving(true)
    try {
      await api.delete(`/api/branding/${branding.id}`)
      loadAllBrandings()
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao excluir tema')
    } finally {
      setSaving(false)
    }
  }

  const handleUpload = async (e, field) => {
    const file = e.target.files[0]
    if (!file) return

    const uploadData = new FormData()
    uploadData.append('file', file)

    setSaving(true)
    try {
      const response = await api.post('/api/branding/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      set(field)(response.data.url)
    } catch (err) {
      console.error('Erro no upload:', err)
      alert('Erro ao fazer upload da imagem.')
    } finally {
      setSaving(false)
    }
  }

  const SECTIONS = [
    { id: 'identidade', label: 'Identidade',  icon: '🏷️' },
    { id: 'cores',      label: 'Cores',        icon: '🎨' },
    { id: 'midias',     label: 'Imagens',      icon: '🖼️' },
    { id: 'menu-superior', label: 'Top Menu',  icon: '📍' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-zinc-500">
      <span className="animate-spin mr-2 text-xl">⏳</span> Carregando branding...
    </div>
  )

  return (
    <form onSubmit={handleSave} className="space-y-6">

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xl">
              🎨
            </div>
            Fábrica de Temas Master
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Crie e gerencie múltiplas identidades visuais para o seu ecossistema.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-zinc-800 hover:bg-zinc-700 text-white transition active:scale-95 border border-zinc-700"
          >
            ➕ Novo Tema
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition transform active:scale-95 shadow-lg shrink-0
              ${saved
                ? 'bg-green-600 text-white shadow-green-500/20'
                : 'bg-gradient-to-r from-brand-500 to-orange-500 hover:from-brand-400 hover:to-orange-400 text-white shadow-brand-500/25'
              }`}
          >
            {saving ? '⏳ Salvando...' : saved ? '✅ Salvo!' : '💾 Salvar Alterações'}
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* ── BARRA LATERAL: MEUS TEMAS ──────────────────────── */}
        <div className="xl:w-80 shrink-0 space-y-4">
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-4 shadow-xl">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Meus Temas Salvos</h3>
            <div className="space-y-2">
              {allBrandings.map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => selectBranding(b)}
                  className={`w-full group relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left
                    ${branding?.id === b.id 
                      ? 'bg-brand-500/10 border-brand-500' 
                      : 'bg-dark-900 border-transparent hover:border-zinc-700'}`}
                >
                  <div className="h-10 w-10 rounded-lg border border-white/10 shrink-0 flex items-center justify-center overflow-hidden" 
                    style={{ backgroundColor: b.background_color }}>
                    {b.logo_url ? (
                      <img src={b.logo_url} className="w-full h-full object-contain" onError={e => e.target.style.display='none'} />
                    ) : (
                      <span className="text-white text-xs font-black">{b.app_name?.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${branding?.id === b.id ? 'text-brand-400' : 'text-zinc-300'}`}>
                      {b.app_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex -space-x-1">
                        <div className="w-2 h-2 rounded-full border border-dark-900" style={{ backgroundColor: b.primary_color }} />
                        <div className="w-2 h-2 rounded-full border border-dark-900" style={{ backgroundColor: b.accent_color }} />
                      </div>
                      {b.ativo && (
                        <span className="text-[8px] font-black text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded uppercase tracking-tighter">Ativo</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              {allBrandings.length === 0 && (
                <p className="text-center py-4 text-zinc-600 text-[10px]">Nenhum tema salvo.</p>
              )}
            </div>
          </div>

          {/* Banner Ajuda */}
          <div className="bg-brand-500/5 border border-brand-500/10 rounded-2xl p-4">
            <p className="text-[10px] text-brand-400/80 leading-relaxed font-medium">
              DICA: Após criar seu tema, clique em <b>ATIVAR</b> para que seu App Android TV mude instantaneamente de cor.
            </p>
          </div>
        </div>

        {/* ── COLUNA CENTRAL: EDITOR ─────────────────────────── */}
        <div className="flex-1 space-y-5">

          {/* Abas de seção */}
          <div className="flex flex-wrap gap-1 bg-dark-800 border border-dark-700 rounded-xl p-1">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSection(s.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all
                  ${activeSection === s.id
                    ? 'bg-dark-900 text-white shadow-md border border-dark-600'
                    : 'text-zinc-500 hover:text-white'
                  }`}
              >
                <span>{s.icon}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            ))}
          </div>

          {/* ── SEÇÃO: IDENTIDADE ────────────────────────────── */}
          {activeSection === 'identidade' && (
            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 space-y-5 shadow-xl">
              <h2 className="font-bold text-white flex items-center gap-2">🏷️ Identidade do App</h2>

              <InputField
                label="Nome do App"
                value={formData.app_name}
                onChange={set('app_name')}
                placeholder="Ex: TV Maxx Pro"
                hint="Este nome aparecerá na splash screen e no launcher do Android TV."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <InputField 
                    label="Nome do App / Projeto" 
                    value={formData.app_name}
                    onChange={v => setFormData({ ...formData, app_name: v })}
                    placeholder="Ex: MAXX PLAYERS"
                  />
                  <InputField 
                    label="WhatsApp de Suporte / Vendas" 
                    value={formData.whatsapp}
                    onChange={v => setFormData({ ...formData, whatsapp: v })}
                    placeholder="Ex: 5511999999999"
                    hint="Número com DDI e DDD para o botão 'Assinar' no Web Player"
                  />
                </div>
                <div className="space-y-2">
                  <InputField
                    label="URL da Logo Principal"
                    value={formData.logo_url}
                    onChange={set('logo_url')}
                    placeholder="https://..."
                    type="url"
                    hint="Recomendado: PNG transparente 512×512px"
                  />
                  {formData.logo_url && formData.logo_url.length > 5 && (
                    <div className="rounded-xl overflow-hidden border border-dark-600 bg-dark-800 flex justify-center p-4">
                      <img 
                        src={getFullUrl(formData.logo_url)} 
                        alt="Logo Preview" 
                        className="h-16 w-auto object-contain drop-shadow-xl" 
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <InputField
                    label="URL da Logo Escura"
                    value={formData.logo_dark_url}
                    onChange={set('logo_dark_url')}
                    placeholder="https://..."
                    type="url"
                    hint="Versão para fundos claros"
                  />
                  {formData.logo_dark_url && formData.logo_dark_url.length > 5 && (
                    <div className="rounded-xl overflow-hidden border border-dark-600 bg-zinc-300 flex justify-center p-4">
                      <img 
                        src={getFullUrl(formData.logo_dark_url)} 
                        alt="Logo Dark Preview" 
                        className="h-16 w-auto object-contain drop-shadow-md" 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── SEÇÃO: CORES ─────────────────────────────────── */}
          {activeSection === 'cores' && (
            <div className="space-y-5">
              {/* Paletas rápidas */}
              <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5 shadow-xl">
                <h2 className="font-bold text-white flex items-center gap-2 mb-4">⚡ Paletas Rápidas</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PALETTES.map(p => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => applyPalette(p)}
                      className="group relative rounded-xl overflow-hidden border border-dark-600 hover:border-brand-500/50 transition-all hover:scale-[1.04] active:scale-[0.97]"
                    >
                      {/* Mini-preview */}
                      <div className="h-14 relative" style={{ backgroundColor: p.bg }}>
                        <div className="absolute inset-0 flex items-center justify-center gap-1 px-2">
                          <div className="w-4 h-4 rounded-full shadow-lg border border-white/10" style={{ backgroundColor: p.primary }} />
                          <div className="w-3 h-3 rounded-full shadow-lg border border-white/10" style={{ backgroundColor: p.secondary }} />
                          <div className="w-2.5 h-2.5 rounded-full shadow-lg border border-white/10" style={{ backgroundColor: p.accent }} />
                        </div>
                      </div>
                      <div className="bg-dark-900 px-2 py-1.5 border-t border-dark-700">
                        <p className="text-[9px] font-bold text-white text-center truncate">{p.name}</p>
                      </div>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-brand-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] font-black text-white bg-brand-500 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">APLICAR</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Campos de cor */}
              <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5 shadow-xl">
                <h2 className="font-bold text-white flex items-center gap-2 mb-4">🎨 Cores Personalizadas</h2>
                
                {/* Seletor de Tema Base */}
                <div className="mb-6 p-4 bg-dark-900 border border-dark-600 rounded-xl">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-3">Tema Base (Sincronizado com Android)</label>
                  <div className="flex gap-2">
                    {['Neon', 'Clássico', 'Azul', 'Custom'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => set('tema')(t)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                          formData.tema === t 
                            ? 'bg-brand-500 border-brand-500 text-white' 
                            : 'bg-dark-800 border-dark-700 text-zinc-500 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ColorField label="Cor Primária"    value={formData.primary_color}    onChange={set('primary_color')} />
                  <ColorField label="Cor Secundária"  value={formData.secondary_color}  onChange={set('secondary_color')} />
                  <ColorField label="Cor de Fundo"    value={formData.background_color} onChange={set('background_color')} />
                  <ColorField label="Cor do Texto"    value={formData.text_color}       onChange={set('text_color')} />
                  <ColorField label="Cor de Destaque" value={formData.accent_color}     onChange={set('accent_color')} />
                </div>

                <div className="mt-8 pt-6 border-t border-dark-700">
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-4">🕹️ Interação e Botões</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ColorField label="Botão Principal"  value={formData.button_primary_color}   onChange={set('button_primary_color')} />
                    <ColorField label="Cor de Foco (Glow)" value={formData.button_focus_color}     onChange={set('button_focus_color')} />
                    <ColorField label="Texto do Botão"   value={formData.button_text_color}      onChange={set('button_text_color')} />
                  </div>
                </div>
              </div>

              {/* Templates do backend */}
              {templates.length > 0 && (
                <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5 shadow-xl">
                  <h2 className="font-bold text-white flex items-center gap-2 mb-4">📋 Templates Salvos</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {templates.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => applyPalette({
                          primary: t.primary_color, secondary: t.secondary_color || t.primary_color,
                          bg: t.background_color, text: t.text_color, accent: t.accent_color || t.primary_color
                        })}
                        className="flex items-center gap-3 bg-dark-900 hover:bg-dark-700 border border-dark-600 hover:border-brand-500/40 rounded-xl px-4 py-3 transition text-left group"
                      >
                        <div className="w-10 h-10 rounded-lg border border-white/10 shrink-0"
                          style={{ backgroundColor: t.background_color, borderColor: t.primary_color }} />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{t.nome}</p>
                          {t.descricao && <p className="text-[10px] text-zinc-500 truncate">{t.descricao}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SEÇÃO: IMAGENS & ASSETS ───────────────────────── */}
          {activeSection === 'midias' && (
            <div className="space-y-8">

              {/* 📦 ASSETS DO PROJETO TV MAXX ANDROID */}
              <div className="bg-dark-800 border border-dark-700 rounded-3xl p-8 shadow-2xl space-y-10">
                <div className="border-b border-dark-700 pb-6">
                  <h2 className="text-2xl font-black text-white flex items-center gap-3">
                    <span className="text-brand-500">📦</span> MAXX PLAYERS
                  </h2>
                  <p className="text-zinc-500 text-sm mt-1">Clique para usar diretamente no seu branding oficial.</p>
                </div>

                {/* 🏷️ LOGOTIPOS DO CLIENTE */}
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="text-brand-400">🏷️</span> Sua Identidade Visual
                      </h3>
                      <p className="text-xs text-zinc-500">Faça o upload dos logotipos que aparecerão no App e Web Player.</p>
                    </div>
                    <div className="bg-brand-500/10 border border-brand-500/20 px-4 py-2 rounded-xl">
                      <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Recomendado: 512x512px (PNG)</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Upload Logo Principal */}
                    <div className="group relative flex flex-col bg-dark-900 border-2 border-dashed border-dark-600 rounded-3xl p-8 items-center justify-center hover:border-brand-500 transition-all cursor-pointer overflow-hidden">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                        onChange={(e) => handleUpload(e, 'logo_url')}
                      />
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🖼️</div>
                      <p className="text-sm font-bold text-white">Logo Principal (Clara)</p>
                      <p className="text-[10px] text-zinc-500 mt-1">Arraste ou clique para enviar</p>
                      {formData.logo_url && (
                        <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10 w-full flex justify-center">
                          <img src={getFullUrl(formData.logo_url)} className="max-h-20 object-contain" />
                        </div>
                      )}
                    </div>

                    {/* Upload Logo Escura */}
                    <div className="group relative flex flex-col bg-dark-900 border-2 border-dashed border-dark-600 rounded-3xl p-8 items-center justify-center hover:border-brand-500 transition-all cursor-pointer overflow-hidden">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                        onChange={(e) => handleUpload(e, 'logo_dark_url')}
                      />
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🌑</div>
                      <p className="text-sm font-bold text-white">Logo para Fundos Claros</p>
                      <p className="text-[10px] text-zinc-500 mt-1">Arraste ou clique para enviar</p>
                      {formData.logo_dark_url && (
                        <div className="mt-4 p-4 bg-zinc-900 rounded-2xl border border-dark-600 w-full flex justify-center">
                          <img src={getFullUrl(formData.logo_dark_url)} className="max-h-20 object-contain" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 🖼️ BANNERS PERSONALIZADOS */}
                <div className="space-y-6 pt-10 border-t border-dark-700">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="text-brand-400">🖼️</span> Banners e Divulgação
                      </h3>
                      <p className="text-xs text-zinc-500">Envie banners para destaque na tela inicial e telas de carregamento.</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="bg-dark-900 border border-dark-600 px-3 py-1.5 rounded-lg">
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Hero: 1920x720px</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Upload Hero Banner */}
                    <div className="group relative flex flex-col bg-dark-900 border-2 border-dashed border-dark-600 rounded-3xl p-8 items-center justify-center hover:border-brand-500 transition-all cursor-pointer overflow-hidden min-h-[200px]">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                        onChange={(e) => handleUpload(e, 'hero_banner_url')}
                      />
                      {formData.hero_banner_url ? (
                        <div className="absolute inset-0">
                          <img src={formData.hero_banner_url} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/40">
                             <p className="text-sm font-bold text-white">Alterar Hero Banner</p>
                             <p className="text-[10px] text-zinc-300">Resolução atual: 1920x720px</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎬</div>
                          <p className="text-sm font-bold text-white">Banner Principal (Hero)</p>
                          <p className="text-[10px] text-zinc-500 mt-1">Este banner aparece no topo da Home</p>
                        </>
                      )}
                    </div>

                    {/* Upload Splash Screen */}
                    <div className="group relative flex flex-col bg-dark-900 border-2 border-dashed border-dark-600 rounded-3xl p-8 items-center justify-center hover:border-brand-500 transition-all cursor-pointer overflow-hidden min-h-[200px]">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                        onChange={(e) => handleUpload(e, 'splash_screen_url')}
                      />
                      {formData.splash_screen_url ? (
                        <div className="absolute inset-0">
                          <img src={formData.splash_screen_url} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/40">
                             <p className="text-sm font-bold text-white">Alterar Splash Screen</p>
                             <p className="text-[10px] text-zinc-300">Resolução recomendada: 1920x1080px</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📺</div>
                          <p className="text-sm font-bold text-white">Splash Screen (Carregamento)</p>
                          <p className="text-[10px] text-zinc-500 mt-1">Aparece ao abrir o App</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 🌐 SPLASH SCREEN EXTERNA (LEGACY) */}
                <div className="bg-dark-900/50 border border-dark-600 border-dashed rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
                  <div className="h-12 w-12 rounded-xl bg-zinc-800 flex items-center justify-center text-xl">🌐</div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-sm font-bold text-white">Usar URL Externa (PostImg/Imgur)</h3>
                    <p className="text-[10px] text-zinc-500">Caso prefira não fazer upload e usar um link direto.</p>
                  </div>
                  <button type="button" onClick={() => set('splash_screen_url')('https://i.postimg.cc/BQwXmzTj/TVMAXX_MOVE.png')} className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-xl text-xs font-bold transition">✓ Usar Padrão</button>
                </div>
              </div>

              {/* ✏️ EDITAR MANUALMENTE */}
              <div className="bg-dark-800 border border-dark-700 rounded-3xl p-8 shadow-2xl space-y-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-zinc-700 flex items-center justify-center text-xl">✏️</div>
                  <h2 className="text-xl font-bold text-white">Editar Manualmente</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <InputField
                      label="Splash Screen (Tela de Carregamento)"
                      value={formData.splash_screen_url}
                      onChange={set('splash_screen_url')}
                      placeholder="https://... ou /branding/..."
                      hint="Resolução recomendada: 1920×1080px ou 2560×1440px"
                    />
                    {formData.splash_screen_url && (
                      <div className="relative rounded-2xl overflow-hidden border border-dark-600 h-48 bg-black">
                        <img src={formData.splash_screen_url} className="w-full h-full object-contain" />
                        <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-full text-[10px] font-bold text-white">Preview Splash</div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <InputField
                      label="Hero Banner (Banner Principal)"
                      value={formData.hero_banner_url}
                      onChange={set('hero_banner_url')}
                      placeholder="https://... ou /branding/..."
                      hint="Banner exibido na tela inicial. Resolução: 1920×720px"
                    />
                    {formData.hero_banner_url && (
                      <div className="relative rounded-2xl overflow-hidden border border-dark-600 h-48 bg-black">
                        <img src={formData.hero_banner_url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Hero Banner Preview</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}


          {/* 📍 MENU SUPERIOR */}
          {activeSection === 'menu-superior' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-dark-900/50 border border-dark-600 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-2xl">
                    📍
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Configuração do Menu Superior</h3>
                    <p className="text-zinc-500 text-xs font-medium">Controle quais itens aparecerão na navegação superior do Web Player e personalize seus nomes e ícones (.webp recomendados).</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {(formData.top_menu || DEFAULT_TOP_MENU).map((menuItem) => (
                    <div key={menuItem.id} className={`flex items-center gap-4 p-4 rounded-xl border ${menuItem.ativo ? 'bg-dark-800 border-brand-500/30' : 'bg-dark-900/50 border-dark-700 opacity-70'} transition-all`}>
                      
                      {/* Ativar/Desativar */}
                      <button
                        type="button"
                        onClick={() => updateTopMenu(menuItem.id, 'ativo', !menuItem.ativo)}
                        className={`w-12 h-6 rounded-full relative shrink-0 transition-colors ${menuItem.ativo ? 'bg-brand-500' : 'bg-dark-700'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${menuItem.ativo ? 'left-7' : 'left-1'}`} />
                      </button>

                      {/* Nome e Input */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1.5 gap-1">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Nome no Menu</label>
                          <span className="text-[8.5px] font-mono text-zinc-500 bg-dark-900 px-1.5 py-0.5 rounded border border-dark-700 w-fit">Rota Original: {menuItem.route}</span>
                        </div>
                        <input
                          type="text"
                          value={menuItem.label}
                          onChange={(e) => updateTopMenu(menuItem.id, 'label', e.target.value)}
                          className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-1.5 text-white text-sm focus:border-brand-500 outline-none transition"
                        />
                        
                        {/* Seletor de Modo de Exibição (Apenas se tiver ícone) */}
                        {menuItem.icon_url && (
                          <div className="flex bg-dark-900 border border-dark-600 rounded-lg overflow-hidden mt-3 p-0.5">
                            {['text', 'image', 'both'].map(mode => {
                              const labels = { text: 'Só Texto', image: 'Só Ícone', both: 'Ambos' }
                              // Se o usuário não definiu ainda, default é 'image' por conta do comportamento anterior
                              const isSelected = (menuItem.display_mode || 'image') === mode
                              return (
                                <button
                                  key={mode}
                                  type="button"
                                  onClick={() => updateTopMenu(menuItem.id, 'display_mode', mode)}
                                  className={`flex-1 py-1 text-[9px] font-bold uppercase transition ${isSelected ? 'bg-brand-500 text-white rounded shadow-sm' : 'text-zinc-500 hover:text-white hover:bg-dark-700/50'}`}
                                >
                                  {labels[mode]}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      {/* Upload de Ícone */}
                      <div className="shrink-0 flex flex-col items-center gap-2">
                        <div className="relative group w-12 h-12 bg-dark-900 border border-dark-600 rounded-xl overflow-hidden hover:border-brand-500 flex items-center justify-center">
                          <input
                            type="file"
                            accept="image/webp,image/png,image/svg+xml"
                            onChange={(e) => handleMenuIconUpload(e, menuItem.id)}
                            className="absolute inset-0 opacity-0 cursor-pointer z-20"
                            title="Fazer upload de Ícone (.webp, .png)"
                          />
                          {menuItem.icon_url ? (
                            <img src={getFullUrl(menuItem.icon_url)} alt="Ícone" className="w-8 h-8 object-contain" />
                          ) : (
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">IMG</span>
                          )}
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            <span className="text-[10px] font-bold text-white">⬆️ Upload</span>
                          </div>
                        </div>
                        {menuItem.icon_url && (
                           <button type="button" onClick={() => updateTopMenu(menuItem.id, 'icon_url', '')} className="text-[9px] text-red-500 hover:text-red-400 font-bold uppercase transition">Remover</button>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-4 shadow-xl">
            <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <span>📺</span> Preview — Android TV
            </h3>
            <div className="relative">
              <div className="rounded-xl overflow-hidden border-4 border-zinc-700 shadow-2xl" style={{ aspectRatio: '16/9' }}>
                <div
                  className="w-full h-full relative flex flex-col"
                  style={{ backgroundColor: formData.background_color }}
                >
                  {/* Topbar */}
                  <div className="px-4 py-2 flex items-center gap-3 border-b"
                    style={{ borderColor: formData.primary_color + '30' }}>
                    {formData.logo_url ? (
                      <img src={formData.logo_url} alt="Logo" className="h-6 object-contain" onError={e => e.target.style.display='none'} />
                    ) : (
                      <div className="h-6 px-3 rounded flex items-center font-black text-xs"
                        style={{ backgroundColor: formData.primary_color, color: formData.text_color }}>
                        {formData.app_name?.slice(0, 8)}
                      </div>
                    )}
                    <div className="flex gap-2 ml-auto">
                      {['Home', 'Séries', 'Filmes', 'AO VIVO'].map((m, i) => (
                        <div key={i} className="text-[8px] font-bold px-2 py-0.5 rounded"
                          style={{
                            color: i === 0 ? formData.background_color : formData.text_color + '80',
                            backgroundColor: i === 0 ? formData.primary_color : 'transparent',
                          }}>
                          {m}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hero area */}
                  <div className="flex-1 relative overflow-hidden">
                    {formData.hero_banner_url ? (
                      <img src={formData.hero_banner_url} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-60"
                        onError={e => e.target.style.display='none'} />
                    ) : (
                      <div className="absolute inset-0 opacity-20"
                        style={{ background: `linear-gradient(135deg, ${formData.primary_color}, ${formData.secondary_color})` }} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 space-y-1">
                      <div className="h-3 rounded text-[8px] font-black px-2 flex items-center"
                        style={{ backgroundColor: formData.primary_color, color: formData.background_color }}>
                        EM DESTAQUE
                      </div>
                      <div className="text-[10px] font-black" style={{ color: formData.text_color }}>
                        {formData.app_name || 'TV Maxx'}
                      </div>
                      <div className="text-[7px]" style={{ color: formData.text_color + '99' }}>
                        O melhor streaming IPTV
                      </div>
                      <div className="flex gap-1 mt-1">
                        <div className="text-[7px] font-bold px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: formData.primary_color, color: formData.background_color }}>
                          ▶ Assistir
                        </div>
                        <div className="text-[7px] font-bold px-1.5 py-0.5 rounded border"
                          style={{ color: formData.text_color, borderColor: formData.text_color + '40' }}>
                          + Lista
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cards de conteúdo */}
                  <div className="px-3 py-2">
                    <div className="text-[7px] font-bold mb-1.5" style={{ color: formData.text_color + '80' }}>
                      CONTINUAR ASSISTINDO
                    </div>
                    <div className="flex gap-1.5">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex-1 aspect-[16/10] rounded overflow-hidden relative"
                          style={{ backgroundColor: formData.primary_color + '20', border: `1px solid ${formData.primary_color}30` }}>
                          {i === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-3 h-3 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: formData.primary_color }}>
                                <span className="text-[5px]" style={{ color: formData.background_color }}>▶</span>
                              </div>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 h-0.5"
                            style={{ backgroundColor: formData.primary_color, width: `${30 + i * 10}%` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pé da TV (base) */}
              <div className="flex flex-col items-center mt-1">
                <div className="w-12 h-1.5 bg-zinc-700 rounded-t" />
                <div className="w-20 h-1 bg-zinc-600 rounded" />
              </div>
            </div>

            {/* Legenda de cores */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { label: 'Primária',  val: formData.primary_color },
                { label: 'Fundo',     val: formData.background_color },
                { label: 'Destaque',  val: formData.accent_color },
              ].map(c => (
                <div key={c.label} className="flex items-center gap-2 bg-dark-900 rounded-lg px-2 py-1.5 border border-dark-600">
                  <div className="w-4 h-4 rounded border border-white/10 shrink-0" style={{ backgroundColor: c.val }} />
                  <div className="min-w-0">
                    <p className="text-[8px] text-zinc-500">{c.label}</p>
                    <p className="text-[9px] font-mono text-white truncate">{c.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info do Branding Selecionado */}
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span>ℹ️</span> Editor de Tema
              </h3>
              {branding?.id && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-2 text-zinc-500 hover:text-red-500 transition"
                  title="Excluir Tema"
                >
                  🗑️
                </button>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-dark-700">
                <span className="text-zinc-500">Status no Sistema</span>
                {branding?.ativo ? (
                   <span className="text-green-400 font-bold flex items-center gap-1 uppercase text-[10px]">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Tema Ativo
                  </span>
                ) : (
                  <span className="text-zinc-600 font-bold uppercase text-[10px]">Inativo</span>
                )}
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dark-700">
                <span className="text-zinc-500">ID do Tema</span>
                <span className="text-white font-mono">{branding?.id || 'NOVO'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dark-700">
                <span className="text-zinc-500">Cor Primária</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: formData.primary_color }} />
                  <span className="font-mono text-white">{formData.primary_color}</span>
                </div>
              </div>
              {branding?.atualizado_em && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-zinc-500">Última Edição</span>
                  <span className="text-zinc-300">{new Date(branding.atualizado_em).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2 mt-2">
              {!branding?.ativo && branding?.id && (
                <button
                  type="button"
                  onClick={handleActivate}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-green-500/20 text-[11px] active:scale-95"
                >
                  🚀 ATIVAR ESTE TEMA
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-orange-500 hover:from-brand-400 hover:to-orange-400 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-brand-500/20 text-[11px] active:scale-95"
              >
                {saving ? '⏳ SALVANDO...' : saved ? '✅ SALVO!' : '💾 SALVAR AS ALTERAÇÕES'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </form>
  )
}

export default Branding
