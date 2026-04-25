import { useState, useEffect, useRef } from 'react'
import api from '../services/api'
import html2canvas from 'html2canvas'
import MovieBannerElite from '../components/MovieBannerElite'
import { useAuth } from '../context/AuthContext'
import { 
  Plus, Trash2, Save, Settings, Layers, Type, Layout as LayoutIcon, 
  ImageIcon, X, ChevronRight, Info, AlertTriangle, Monitor, Phone,
  Tv2, Trophy, Image, Download, Search, Loader2, RefreshCcw, Swords,
  Sparkles, Palette, Shield
} from 'lucide-react'

// ─── DADOS DOS TEMAS POR CATEGORIA ────────────────────────────────────────────
const THEMES = {
  futebol: [
    {
      id: 'destaque-pro',
      name: 'Destaque Pro',
      badge: 'NOVO',
      images: [
        '/previews/previatemadestaque2futebol.png',
        '/previews/previatemadestaque6futebol.png',
        '/previews/previatemadestaque5futebol.png',
        '/previews/previatemadestaque4futebol.png',
      ],
      isGroup: true,
      variants: [
        { id: 'destaque-vermelho', name: 'Vermelho', colorHex: '#D60000' },
        { id: 'destaque-roxo',    name: 'Roxo',     colorHex: '#ab2def' },
        { id: 'destaque-laranja', name: 'Laranja',  colorHex: '#fa8c2b' },
        { id: 'destaque-azul',   name: 'Azul',     colorHex: '#032cf4' },
        { id: 'destaque-verde',  name: 'Verde',    colorHex: '#3ed823' },
      ],
    },
    {
      id: 'pilulas',
      name: 'Estilo Pílulas',
      badge: null,
      images: [
        '/previews/tema15preview.jpg',
        '/previews/previacapatema15.jpg',
        '/previews/tema16preview.jpg',
        '/previews/previacapatema16.jpg',
        '/previews/tema17preview.jpg',
        '/previews/tema18preview.jpg',
        '/previews/tema19preview.jpg',
        '/previews/tema20preview.jpg',
      ],
      isGroup: true,
      variants: [
        { id: 'pilulas-vermelho', name: 'Vermelho', colorHex: '#ef4444' },
        { id: 'pilulas-laranja',  name: 'Laranja',  colorHex: '#f97316' },
        { id: 'pilulas-amarelo',  name: 'Amarelo',  colorHex: '#eab308' },
        { id: 'pilulas-verde',    name: 'Verde',    colorHex: '#22c55e' },
        { id: 'pilulas-roxo',     name: 'Roxo',     colorHex: '#a855f7' },
        { id: 'pilulas-azul',     name: 'Azul',     colorHex: '#3b82f6' },
      ],
    },
    {
      id: 'neon-gold',
      name: 'Neon & Gold HD',
      badge: 'HD',
      images: [
        '/previews/previatema10.jpg',
        '/previews/previacapatema10.jpg',
        '/previews/previatema12.jpg',
        '/previews/previacapatema12.jpg',
      ],
      isGroup: true,
      variants: [
        { id: 'neon-gold',   name: 'Gold',   colorHex: '#eab308' },
        { id: 'neon-red',    name: 'Red',    colorHex: '#ef4444' },
        { id: 'neon-cyan',   name: 'Cyan',   colorHex: '#06b6d4' },
        { id: 'neon-green',  name: 'Green',  colorHex: '#22c55e' },
        { id: 'neon-purple', name: 'Purple', colorHex: '#a855f7' },
      ],
    },
    {
      id: 'hero-dark',
      name: 'Hero Dark',
      badge: 'MAIS USADO',
      images: [
        '/previews/tema2apresentacao.jpg',
        '/previews/previacapatema2.jpg',
        '/previews/temanow8_preview.jpg',
        '/previews/temanow9_preview.jpg',
        '/previews/tema2universalverde_previa.jpg',
        '/previews/tema2universallaranja_previa.jpg',
        '/previews/tema2universalamarelo_previa.jpg',
      ],
      isGroup: true,
      variants: [
        { id: 'hero-blue',   name: 'Blue',   colorHex: '#3b82f6' },
        { id: 'hero-red',    name: 'Red V2', colorHex: '#ef4444' },
        { id: 'hero-purple', name: 'Purple', colorHex: '#a855f7' },
        { id: 'hero-green',  name: 'Green',  colorHex: '#10e606' },
        { id: 'hero-orange', name: 'Orange', colorHex: '#f79b2e' },
        { id: 'hero-yellow', name: 'Yellow', colorHex: '#FFE600' },
      ],
    },
    {
      id: 'pro-series',
      name: 'Pro Series',
      badge: 'NOVO',
      images: [
        '/previews/tema5_preview.jpg',
        '/previews/previacapatema5.jpg',
      ],
      isGroup: true,
      variants: [
        { id: 'pro-laranja', name: 'Laranja', colorHex: '#FF7E00' },
        { id: 'pro-azul',    name: 'Azul',    colorHex: '#0d1df1' },
        { id: 'pro-roxo',    name: 'Roxo',    colorHex: '#bb2ef7' },
        { id: 'pro-amarelo', name: 'Amarelo', colorHex: '#FFE600' },
      ],
    },
    {
      id: 'classico',
      name: 'Clássico',
      badge: null,
      images: [
        '/previews/tema1apresentacao.jpg',
        '/previews/previacapatema1.jpg',
        '/previews/tema3previa.jpg',
        '/previews/previacapatema3.jpg',
        '/previews/tema4preview.jpg',
        '/previews/previacapatema4.jpg',
      ],
      isGroup: false,
      variants: [],
    },
    {
      id: 'novela-vermelho',
      name: 'Novela Vermelho',
      badge: 'NOVO',
      images: ['/previews/previa_futebolounovel_temavermelho.png'],
      isGroup: false,
      variants: [],
    },
  ],

  filmes: [
    {
      id: 'filme-t1',
      name: 'Cinema Dark',
      badge: 'NOVO',
      images: ['/previews/previa_filme_t1.jpg'],
      isGroup: false,
      variants: [],
    },
    {
      id: 'filme-t2',
      name: 'Streamers',
      badge: null,
      images: ['/previews/previa_filme_t2.jpg'],
      isGroup: false,
      variants: [],
    },
    {
      id: 'filme-t3',
      name: 'Master Series',
      badge: null,
      images: ['/previews/previafilmetema3.jpg', '/previews/previacapatema7.jpg'],
      isGroup: false,
      variants: [],
    },
    {
      id: 'video-v1',
      name: 'Video Teaser V1',
      badge: 'VÍDEO',
      images: ['/previews/preview_video_v1.jpg'],
      isGroup: false,
      variants: [],
    },
    {
      id: 'video-v2',
      name: 'Video Teaser V2',
      badge: 'VÍDEO',
      images: ['/previews/preview_video_v2.jpg'],
      isGroup: false,
      variants: [],
    },
    {
      id: 'fire-series',
      name: 'Fire Series Master',
      badge: 'ELITE',
      images: ['/previews/fire_series_sample.jpg'], 
      isGroup: false,
      variants: [],
    },
  ],

  basquete: [
    {
      id: 'basquete-t1',
      name: 'NBA Pro',
      badge: 'NOVO',
      images: ['/previews/previabasquetetema1.jpg', '/previews/previacapabasquetetema1.jpg'],
      isGroup: false,
      variants: [],
    },
    {
      id: 'basquete-t2',
      name: 'Court Master',
      badge: null,
      images: ['/previews/previatema2basquete.jpg', '/previews/previacapabasquetetema2.jpg'],
      isGroup: false,
      variants: [],
    },
    {
      id: 'basquete-t3',
      name: 'Arena Fire',
      badge: null,
      images: ['/previews/previatema3basquete.jpg', '/previews/previacapabasquetetema3.jpg'],
      isGroup: false,
      variants: [],
    },
    {
      id: 'basquete-t4',
      name: 'Slam Dunk',
      badge: null,
      images: ['/previews/previabasquetetema4.jpg', '/previews/previacapabasquetetema4.jpg'],
      isGroup: false,
      variants: [],
    },
    {
      id: 'basquete-t5',
      name: 'All-Star',
      badge: null,
      images: ['/previews/previatetema5basquete.jpg', '/previews/previacapabasquetetema5.jpg'],
      isGroup: false,
      variants: [],
    },
    {
      id: 'basquete-t6',
      name: 'Playoff Night',
      badge: 'HD',
      images: ['/previews/previatetema6basquete.jpg', '/previews/previacapabasquetetema6.jpg'],
      isGroup: false,
      variants: [],
    },
    {
      id: 'basquete-t7',
      name: 'Championship',
      badge: null,
      images: ['/previews/previatema7basquete.jpg', '/previews/previacapabasquetetema7.jpg'],
      isGroup: false,
      variants: [],
    },
    {
      id: 'basquete-t8',
      name: 'Dynasty',
      badge: null,
      images: ['/previews/previatema8basquete.jpg', '/previews/previacapabasquetetema8.jpg'],
      isGroup: false,
      variants: [],
    },
    {
      id: 'basquete-t9',
      name: 'Finals Edition',
      badge: 'NOVO',
      images: ['/previews/previatetema9basquete.jpg', '/previews/previacapabasquetetema9.jpg'],
      isGroup: false,
      variants: [],
    },
  ],

  ufc: [
    {
      id: 'ufc-t1',
      name: 'Fight Night',
      badge: 'BETA',
      images: ['/previews/previatema1ufc.jpg'],
      isGroup: false,
      variants: [],
    },
  ],

  divulgacao: [
    {
      id: 'div-azul',
      name: 'Divulgação Azul',
      badge: 'NOVO',
      images: ['/previews/previa_tema_azul_divulgacao.jpg'],
      isGroup: false,
      variants: [],
    },
    {
      id: 'div-amarelo',
      name: 'Indique & Ganhe',
      badge: 'NOVO',
      images: ['/previews/previa_tema_amarelo_indiqueeganhe1amigos.png'],
      isGroup: false,
      variants: [],
    },
    {
      id: 'div-preto',
      name: 'Teste Grátis',
      badge: null,
      images: ['/previews/previa_tema_preto_testegratisomelhorapp.png'],
      isGroup: false,
      variants: [],
    },
  ],

  admin: [
    // Preenchido dinamicamente pelo useEffect
  ],
}

// ─── CATEGORIAS ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'futebol',    label: 'Banner Futebol',   icon: '⚽', color: 'from-green-600 to-emerald-700',  border: 'border-green-500/40',   glow: 'shadow-green-500/20' },
  { id: 'filmes',     label: 'Banner Filmes',    icon: '🎬', color: 'from-purple-600 to-violet-700',  border: 'border-purple-500/40',  glow: 'shadow-purple-500/20' },
  { id: 'admin',      label: 'Temas Master',     icon: '💎', color: 'from-yellow-500 to-amber-700',  border: 'border-yellow-500/40',  glow: 'shadow-yellow-500/20' },
  { id: 'basquete',   label: 'Banner Basquete',  icon: '🏀', color: 'from-orange-500 to-amber-600',  border: 'border-orange-500/40',  glow: 'shadow-orange-500/20' },
  { id: 'ufc',        label: 'Banner UFC',       icon: '🥊', color: 'from-red-600 to-rose-700',      border: 'border-red-500/40',     glow: 'shadow-red-500/20' },
  { id: 'divulgacao', label: 'Divulgação',       icon: '📣', color: 'from-pink-500 to-fuchsia-600',  border: 'border-pink-500/40',    glow: 'shadow-pink-500/20' },
]


// ─── COMPONENTE CARD DE TEMA ───────────────────────────────────────────────────
const ThemeCard = ({ theme, selected, onSelect, tick }) => {
  const [showVariants, setShowVariants] = useState(false)
  const imgIdx = theme.images.length > 0 ? tick % theme.images.length : 0

  const handleClick = () => {
    if (theme.isGroup && theme.variants.length > 0) {
      setShowVariants(v => !v)
    } else {
      onSelect(theme.id)
    }
  }

  const isSelected = selected === theme.id || 
    (theme.isGroup && theme.variants.some(v => v.id === selected))

  return (
    <div className="flex flex-col gap-2">
      {/* Card Principal */}
      <div
        onClick={handleClick}
        className={`cursor-pointer group relative rounded-xl overflow-hidden aspect-[4/5] border-2 transition-all duration-300 active:scale-[0.97]
          ${isSelected
            ? 'border-brand-500 ring-2 ring-brand-500/50 shadow-lg shadow-brand-500/30 scale-[1.02]'
            : 'border-dark-700 hover:border-zinc-500'
          }`}
      >
        {/* Imagem com carrossel */}
        <div className="absolute inset-0 bg-dark-900 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl opacity-20">🖼️</span>
          </div>
          {theme.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={theme.name}
              className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-700
                ${imgIdx === idx ? 'opacity-90 group-hover:opacity-100' : 'opacity-0'}`}
            />
          ))}
          {/* Overlay glow no hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Badge */}
        {theme.badge && (
          <div className="absolute top-2 right-2 z-30">
            <span className={`text-[9px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-wider
              ${theme.badge === 'NOVO' ? 'bg-red-600 text-white' :
                theme.badge === 'BETA' ? 'bg-yellow-500 text-black' :
                theme.badge === 'VÍDEO' ? 'bg-purple-600 text-white' :
                theme.badge === 'HD' ? 'bg-brand-500 text-white' :
                'bg-brand-500 text-white'}`}
            >
              {theme.badge}
            </span>
          </div>
        )}

        {/* Check de selecionado */}
        {isSelected && !theme.isGroup && (
          <div className="absolute top-2 left-2 z-30">
            <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-xs">✓</span>
            </div>
          </div>
        )}

        {/* Nome + botão ver cores */}
        <div className="absolute bottom-0 left-0 right-0 bg-dark-900/95 border-t border-dark-700 py-2 px-2 z-20 backdrop-blur-md">
          <span className={`text-[10px] font-bold uppercase tracking-wide text-center block truncate
            ${isSelected ? 'text-brand-400' : 'text-zinc-300 group-hover:text-white'}`}>
            {theme.name}
          </span>
          {theme.isGroup && (
            <div className="text-[8px] text-zinc-400 mt-1 flex items-center justify-center gap-1 font-bold">
              <span>{showVariants ? 'FECHAR' : 'VER CORES'}</span>
              <span className={`transition-transform ${showVariants ? 'rotate-180' : ''}`}>▾</span>
            </div>
          )}
        </div>
      </div>

      {/* Gaveta de variantes */}
      {theme.isGroup && showVariants && (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-2 grid grid-cols-3 gap-2 shadow-inner animate-in slide-in-from-top-2 duration-200">
          {theme.variants.map(v => (
            <button
              key={v.id}
              onClick={() => { onSelect(v.id); setShowVariants(false) }}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all hover:bg-dark-700
                ${selected === v.id ? 'bg-dark-700 ring-1 ring-brand-500 shadow-md' : ''}`}
            >
              <div
                className="w-6 h-6 rounded-full border-2 border-white/20 shadow-md flex items-center justify-center"
                style={{ backgroundColor: v.colorHex }}
              >
                {selected === v.id && <span className="text-white text-[10px] drop-shadow">✓</span>}
              </div>
              <span className="text-[8px] text-zinc-300 font-bold uppercase truncate w-full text-center">
                {v.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
const BannerGenerator = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('generator') // 'generator' | 'themes'
  const [activeCategory, setActiveCategory] = useState('futebol')
  const [selectedTheme, setSelectedTheme] = useState(null)
  const [mode, setMode] = useState(null) // 'manual' | 'auto'
  const [tick, setTick] = useState(0)
  const [contents, setContents] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatingBatch, setGeneratingBatch] = useState(false)
  const [batchResult, setBatchResult] = useState(null)
  const [autoSelectedThemes, setAutoSelectedThemes] = useState([])
  
  // ─── ESTADO DA FÁBRICA DE TEMAS ──────────────────────────────────────────────
  const [adminTemplates, setAdminTemplates] = useState([])
  const [showThemeModal, setShowThemeModal] = useState(false)
  const [editingTheme, setEditingTheme] = useState(null)
  const [previewActive, setPreviewActive] = useState('feed')
  const [themeFormData, setThemeFormData] = useState({
    name: '', type: 'movie', bg_url: '', overlay_url: '',
    config: { 
      poster_x: 50, poster_y: 50, poster_scale: 1, 
      text_color: '#FFA500', font_family: 'Inter', show_synopsis: true,
      brand_name: 'TV MAXX', brand_logo_url: ''
    }
  })
  const [useRealContentInPreview, setUseRealContentInPreview] = useState(false)
  const sampleMovie = contents[0] || { titulo: 'The Batman', poster_path: '/5P8InoNmzq0oXoo3aMbbp9FbDSb.jpg', backdrop_path: '/b0PljB9Zbe0STqja9zGo0tSNEt6.jpg', release_date: '2022-03-01', vote_average: 7.7, overview: 'Batman ventures into Gotham City\'s underworld when a sadistic killer leaves behind a trail of cryptic clues.' }

  // ─── DADOS ADICIONAIS ───────────────────────────────────────────────────────
  const [tmdbSearchResults, setTmdbSearchResults] = useState([])
  const [searchingTMDB, setSearchingTMDB] = useState(false)
  const [curationItems, setCurationItems] = useState([])
  const [loadingCuration, setLoadingCuration] = useState(false)
  const [loadingSports, setLoadingSports] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [trendingMovies, setTrendingMovies] = useState([])
  const [trendingSeries, setTrendingSeries] = useState([])
  const [bannerContact, setBannerContact] = useState('')
  const [sportsData, setSportsData] = useState({})
  const bannerRef = useRef(null)

  // Carrega templates personalizados do Admin e Curadoria
  useEffect(() => {
    fetchAdminTemplates()
    fetchCuration()
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings')
      setBannerContact(data.whatsapp || '')
    } catch (err) {
      console.error('Erro ao buscar contato do banner:', err)
    }
  }

  const fetchCuration = async () => {
    setLoadingCuration(true)
    try {
      const res = await api.get('/api/iptv-server/curation')
      setCurationItems(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Erro ao buscar curadoria:', err)
    } finally {
      setLoadingCuration(false)
    }
  }

  const fetchAdminTemplates = async () => {
    try {
      const res = await api.get('/api/banner-templates')
      if (res.data.templates) setAdminTemplates(res.data.templates)
    } catch (err) {
      console.error('Erro ao buscar templates:', err)
    }
  }

  // ─── LÓGICA DA FÁBRICA (MIGRADA) ─────────────────────────────────────────────
  const handleSaveTheme = async (e) => {
    e.preventDefault()
    const method = editingTheme ? 'put' : 'post'
    const url = editingTheme ? `/api/banner-templates/${editingTheme.id}` : '/api/banner-templates'
    try {
      const res = await api[method](url, themeFormData)
      if (res.status === 200 || res.status === 201) {
        setShowThemeModal(false)
        fetchAdminTemplates()
        setEditingTheme(null)
        setThemeFormData({ 
          name: '', type: 'movie', bg_url: '', overlay_url: '', 
          config: { ...themeFormData.config } 
        })
      }
    } catch (err) { console.error('Erro ao salvar template:', err) }
  }

  const handleEditTheme = (temp) => {
    setEditingTheme(temp)
    setThemeFormData({
      name: temp.name, type: temp.type, bg_url: temp.bg_url,
      overlay_url: temp.overlay_url, config: temp.config || themeFormData.config
    })
    setShowThemeModal(true)
  }

  const handleDeleteTheme = async (id) => {
    if (!confirm('Deseja realmente excluir este template?')) return
    try {
      const res = await api.delete(`/api/banner-templates/${id}`)
      if (res.status === 200) fetchAdminTemplates()
    } catch (err) { console.error('Erro ao deletar:', err) }
  }

  // Permissões Master/Admin
  const isMaster = user && (user.role === 'admin' || user.plano === 'premium' || user.plano === 'master' || user.plano === 'ILIMITADO')

  const fetchSportsData = async (type) => {
    setLoadingSports(true)
    try {
      const res = await api.get(`/api/sports/matches?type=${type}`)
      setSportsData(prev => ({ ...prev, [type]: res.data.data || [] }))
    } catch (err) {
      console.error(`Erro ao buscar esportes (${type}):`, err)
    } finally {
      setLoadingSports(false)
    }
  }

  // Busca no TMDB em tempo real
  const handleTmdbSearch = async (query) => {
    if (!query || query.length < 3) {
      setTmdbSearchResults([])
      return
    }
    setSearchingTMDB(true)
    try {
      const res = await api.get(`/api/content/search?query=${encodeURIComponent(query)}`)
      setTmdbSearchResults(res.data.resultados || [])
    } catch (err) {
      console.error('Erro na pesquisa TMDB:', err)
    } finally {
      setSearchingTMDB(false)
    }
  }

  const handleExportBanner = async () => {
    if (!bannerRef.current || !selectedMovie) return;
    
    try {
      const canvas = await html2canvas(bannerRef.current, {
        useCORS: true,
        scale: 2, // Melhor qualidade (Digital Print Ready)
        backgroundColor: '#000000'
      });
      
      const link = document.createElement('a');
      const fileName = `banner-${selectedMovie.titulo.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Erro ao exportar banner:', err);
    }
  }

  // Carrossel automático
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 2500)
    return () => clearInterval(interval)
  }, [])

  // Carrega conteúdos para filmes e esportes
  useEffect(() => {
    if (activeCategory === 'filmes') {
      loadContents()
      fetchTrendingContent()
    }
    if (activeCategory === 'futebol') fetchSportsData('soccer')
    if (activeCategory === 'ufc') fetchSportsData('mma')
    if (activeCategory === 'basquete') fetchSportsData('basketball')
  }, [activeCategory])

  const fetchTrendingContent = async () => {
    try {
      const { data: movies } = await api.get('/api/content/populares?tipo=movie')
      const { data: tv } = await api.get('/api/content/populares?tipo=tv')
      setTrendingMovies(movies.resultados?.slice(0, 10) || [])
      setTrendingSeries(tv.resultados?.slice(0, 10) || [])
    } catch (err) {
      console.error('Erro ao buscar tendências:', err)
    }
  }

  const loadContents = async () => {
    setLoading(true)
    try {
      const r = await api.get('/api/content/list?limit=50')
      setContents(r.data.conteudos || [])
    } catch { setContents([]) }
    finally { setLoading(false) }
  }

  const themes = THEMES[activeCategory] || []
  const cat = CATEGORIES.find(c => c.id === activeCategory)

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId)
    setSelectedTheme(null)
    setMode(null)
    setBatchResult(null)
    setAutoSelectedThemes([])
  }

  const handleThemeSelect = (themeId) => {
    if (activeCategory === 'futebol') {
      setSelectedTheme(themeId)
      if (!mode) setMode('manual') // auto-seleciona modo se ainda não escolheu
    } else {
      setSelectedTheme(themeId)
    }
  }

  const toggleAutoTheme = (themeId) => {
    setAutoSelectedThemes(prev =>
      prev.includes(themeId) ? prev.filter(t => t !== themeId) : [...prev, themeId]
    )
  }

  const handleGerarLote = () => {
    if (autoSelectedThemes.length === 0) return
    setGeneratingBatch(true)
    setTimeout(() => {
      setGeneratingBatch(false)
      setBatchResult({
        count: autoSelectedThemes.length * 3,
        themes: autoSelectedThemes,
      })
    }, 2000)
  }

  const filteredContents = contents.filter(c =>
    c.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.titulo_original?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* ── HEADER & TABS (Marketing Hub Style) ────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-dark-800/50 p-6 rounded-[2rem] border border-white/5 shadow-2xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xl">
               🚀
            </div>
            Marketing <span className="text-brand-500">Hub</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Sua central de criação de artes e identidade visual.</p>
        </div>

        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10 self-start md:self-center">
          <button 
            onClick={() => setActiveTab('generator')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'generator' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-zinc-500 hover:text-white'}`}
          >
            <ImageIcon size={16} /> Gerar Banner
          </button>
          {isMaster && (
            <button 
              onClick={() => setActiveTab('themes')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'themes' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-zinc-500 hover:text-white'}`}
            >
              <Sparkles size={16} className={activeTab === 'themes' ? 'animate-pulse' : ''} /> Fábrica de Temas
            </button>
          )}
        </div>
      </div>

      {activeTab === 'generator' ? (
        <>
          {/* ── SEÇÃO DE CURADORIA ───────────────────────────────────── */}
          {curationItems.length > 0 && (
            <div className="bg-dark-800/80 backdrop-blur-md border border-brand-500/20 rounded-[2rem] p-6 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-widest">
                  <span className="text-lg">🎬</span> Sua Seleção (Criação Direta)
                </h2>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] text-zinc-500 font-bold uppercase">Itens da Árvore</span>
                   <button onClick={fetchCuration} className="text-brand-500 hover:text-brand-400 transition-colors"><RefreshCcw size={14} /></button>
                </div>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-brand-500/20">
                {curationItems.map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => {
                      setSearchQuery(item.title);
                      handleTmdbSearch(item.title);
                    }}
                    className="flex-shrink-0 group relative w-28 transition-transform hover:scale-105 active:scale-95"
                  >
                    <div className="aspect-[2/3] rounded-xl overflow-hidden border-2 border-white/5 group-hover:border-brand-500/50 shadow-lg">
                      <img src={item.poster_path || '/placeholder-poster.jpg'} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black p-2">
                        <p className="text-[8px] font-black text-white truncate text-left uppercase">{item.title}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

      {/* ── ABAS DE CATEGORIA ───────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0
              ${activeCategory === cat.id
                ? `bg-gradient-to-r ${cat.color} text-white border-transparent shadow-lg ${cat.glow}`
                : 'bg-dark-800 text-zinc-400 border-dark-700 hover:border-dark-600 hover:text-white'
              }`}
          >
            <span className="text-base">{cat.icon}</span>
            {cat.label}
            {cat.id === 'basquete' && <span className="text-[8px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/30">NOVO</span>}
            {cat.id === 'ufc' && <span className="text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30">BETA</span>}
            {cat.id === 'divulgacao' && <span className="text-[8px] bg-pink-500/20 text-pink-400 px-1.5 py-0.5 rounded border border-pink-500/30">NOVO</span>}
          </button>
        ))}
      </div>

      {/* ── MODO MANUAL/AUTO (apenas Futebol) ───────────────────── */}
      {activeCategory === 'futebol' && (
        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => setMode('manual')}
            className={`group bg-dark-800 border-2 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 relative overflow-hidden text-center
              ${mode === 'manual'
                ? 'border-brand-500 bg-brand-500/5 shadow-lg shadow-brand-500/20'
                : 'border-dark-700 hover:border-brand-500/50'
              }`}
          >
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-brand-500/10 rounded-full blur-2xl group-hover:bg-brand-500/20 transition-all" />
            <div className={`h-14 w-14 rounded-2xl mx-auto flex items-center justify-center mb-3 border transition-colors
              ${mode === 'manual' ? 'bg-brand-500 border-brand-400 text-white' : 'bg-dark-900 border-dark-600 group-hover:border-brand-500/50 text-brand-500'}`}>
              <span className="text-2xl">🖐️</span>
            </div>
            <h3 className="text-lg font-black text-white mb-1">Modo Manual</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Escolha campeonato, jogo e personalize nos detalhes.
            </p>
            {mode === 'manual' && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                <span className="text-white text-[10px]">✓</span>
              </div>
            )}
          </div>

          <div
            onClick={() => setMode('auto')}
            className={`group bg-dark-800 border-2 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 relative overflow-hidden text-center
              ${mode === 'auto'
                ? 'border-green-500 bg-green-500/5 shadow-lg shadow-green-500/20'
                : 'border-dark-700 hover:border-green-500/50'
              }`}
          >
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all" />
            <div className={`h-14 w-14 rounded-2xl mx-auto flex items-center justify-center mb-3 border transition-colors
              ${mode === 'auto' ? 'bg-green-500 border-green-400 text-white' : 'bg-dark-900 border-dark-600 group-hover:border-green-500/50 text-green-500'}`}>
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-black text-white mb-1">Modo Automático</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Selecione temas e gere artes de todos os jogos do dia.
            </p>
            {mode === 'auto' && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-[10px]">✓</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── GRID DE TEMAS ───────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-xl">{cat?.icon}</span>
              Escolha o Tema
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {mode === 'auto'
                ? 'Selecione um ou mais designs para gerar em lote.'
                : 'Selecione o estilo da sua arte.'}
            </p>
          </div>

          {/* Botão Gerar Lote (modo auto) */}
          {mode === 'auto' && (
            <button
              onClick={handleGerarLote}
              disabled={autoSelectedThemes.length === 0 || generatingBatch}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-2.5 px-5 rounded-lg transition shadow-lg text-sm"
            >
              {generatingBatch ? (
                <><span className="animate-spin">⏳</span> Gerando...</>
              ) : (
                <><span>⚡</span> Gerar em Lote ({autoSelectedThemes.length})</>
              )}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {activeCategory === 'admin' ? (
            adminTemplates.map(temp => (
              <ThemeCard
                key={temp.id}
                theme={{
                  id: temp.id,
                  name: temp.name,
                  images: [temp.overlay_url, temp.bg_url].filter(Boolean),
                  isGroup: false,
                  variants: [],
                }}
                selected={selectedTheme}
                onSelect={handleThemeSelect}
                tick={tick}
              />
            ))
          ) : themes.map(theme => (
            mode === 'auto' ? (
              // Modo auto: checkbox simples
              <div
                key={theme.id}
                onClick={() => toggleAutoTheme(theme.id)}
                className={`cursor-pointer relative rounded-xl overflow-hidden aspect-[4/5] border-2 transition-all duration-300 active:scale-[0.97]
                  ${autoSelectedThemes.includes(theme.id)
                    ? 'border-green-500 ring-2 ring-green-500/40 shadow-lg scale-[1.02]'
                    : 'border-dark-700 hover:border-zinc-500'
                  }`}
              >
                <div className="absolute inset-0">
                  {theme.images.map((img, idx) => (
                    <img key={idx} src={img} alt={theme.name}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700
                        ${tick % theme.images.length === idx ? 'opacity-90' : 'opacity-0'}`}
                    />
                  ))}
                </div>
                {autoSelectedThemes.includes(theme.id) && (
                  <div className="absolute top-2 left-2 z-30 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
                {theme.badge && (
                  <div className="absolute top-2 right-2 z-30">
                    <span className="text-[9px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded">
                      {theme.badge}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-dark-900/95 border-t border-dark-700 py-2 px-2 z-20 backdrop-blur-md">
                  <span className={`text-[10px] font-bold uppercase text-center block truncate
                    ${autoSelectedThemes.includes(theme.id) ? 'text-green-400' : 'text-zinc-300'}`}>
                    {theme.name}
                  </span>
                </div>
              </div>
            ) : (
              <ThemeCard
                key={theme.id}
                theme={theme}
                selected={selectedTheme}
                onSelect={handleThemeSelect}
                tick={tick}
              />
            )
          ))}
        </div>
      </div>

      {/* ── RESULTADO LOTE ──────────────────────────────────────── */}
      {batchResult && (
        <div className="bg-gradient-to-r from-green-900/40 to-dark-800 border border-green-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-green-500/20 rounded-full flex items-center justify-center text-2xl border border-green-500/30">
              ✅
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{batchResult.count} artes geradas!</h3>
              <p className="text-zinc-400 text-xs">
                {batchResult.themes.length} tema(s) × jogos do dia. Prontas para download.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-5 py-2.5 rounded-xl transition shadow-lg text-sm">
              📥 Baixar ZIP
            </button>
            <button
              onClick={() => setBatchResult(null)}
              className="flex items-center gap-2 bg-dark-700 hover:bg-dark-600 text-zinc-300 font-bold px-4 py-2.5 rounded-xl transition text-sm"
            >
              ✕ Fechar
            </button>
          </div>
        </div>
      )}

      {/* ── PAINEL DE CONFIGURAÇÃO (tema selecionado, modo manual) ─ */}
      {selectedTheme && mode !== 'auto' && activeCategory === 'futebol' && (
        <FootballConfigurator 
          theme={selectedTheme} 
          sportsData={sportsData.soccer} 
          loading={loadingSports}
        />
      )}

      {selectedTheme && activeCategory !== 'futebol' && activeCategory !== 'filmes' && (
        <SportConfigurator 
          category={activeCategory} 
          theme={selectedTheme} 
          sportsData={activeCategory === 'ufc' ? sportsData.mma : sportsData.basketball}
          loading={loadingSports}
        />
      )}

      {/* ── GALERIA DE FILMES (para banners de filmes) ─────────── */}
      {(activeCategory === 'filmes' || activeCategory === 'admin') && selectedTheme && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <FilmesConfigurator 
            theme={selectedTheme} 
            contents={tmdbSearchResults.length > 0 ? tmdbSearchResults : contents} 
            trendingMovies={trendingMovies}
            trendingSeries={trendingSeries}
            loading={searchingTMDB || loading} 
            onSearch={handleTmdbSearch}
            onMovieSelect={setSelectedMovie}
            contact={bannerContact}
          />
          <div className="hidden lg:flex flex-col items-center gap-6 bg-dark-900/50 p-8 rounded-[2rem] border border-dark-700 sticky top-24 w-full">
            <h4 className="text-[12px] font-black text-brand-400 uppercase tracking-[0.2em] self-start border-l-4 border-brand-500 pl-3">Digital Twin Live Preview (UHD)</h4>
            <div className="w-full aspect-[9/16] max-h-[750px] overflow-y-auto overflow-x-hidden rounded-[1.5rem] border-4 border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black/40 custom-scrollbar-thin flex justify-center">
              <div ref={bannerRef} className="bg-black origin-top scale-[0.45] w-[1080px] h-[1920px] flex-shrink-0">
                {(['filme-t1', 'fire-series'].includes(selectedTheme) || activeCategory === 'admin') ? (
                  <MovieBannerElite 
                    movie={selectedMovie || sampleMovie} 
                    contact={bannerContact} 
                    theme={selectedTheme} 
                    config={activeCategory === 'admin' 
                      ? adminTemplates.find(t => t.id === selectedTheme)?.config 
                      : {}}
                  />
                ) : (
                  <div className="w-[1080px] h-[1920px] flex items-center justify-center text-4xl text-zinc-600 font-black uppercase text-center p-20">
                    Selecione um tema mestre para ver o preview Elite
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EMPTY STATE ─────────────────────────────────────────── */}
      {!selectedTheme && mode !== 'auto' && (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-600 border border-dashed border-dark-700 rounded-2xl">
          <span className="text-5xl mb-4 opacity-40">🎨</span>
          <p className="text-sm font-medium">Selecione um tema acima para continuar</p>
          <p className="text-xs mt-1 opacity-60">Passe o mouse sobre os cards para ver o carrossel</p>
        </div>
      )}

        </>
      ) : (
        /* ── ABA FÁBRICA DE TEMAS (MASTER ONLY) ─────────────────── */
        <div className="space-y-8 animate-slide-up">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">Oficina de <span className="text-brand-500">Modelos Elite</span></h2>
                <p className="text-zinc-400 text-sm mt-1">Configure o esqueleto visual dos banners da sua rede.</p>
              </div>
              <button 
                onClick={() => { setEditingTheme(null); setShowThemeModal(true); }}
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-brand-500/20 flex items-center gap-3 hover:scale-105 active:scale-95"
              >
                <Plus size={20} /> Criar Novo Modelo
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {adminTemplates.map(temp => (
                <div key={temp.id} className="group relative bg-dark-800 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-brand-500/50 transition-all shadow-2xl">
                  <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                    {temp.bg_url ? (
                      <img src={temp.bg_url} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-dark-700 to-black" />
                    )}
                    {temp.overlay_url && <img src={temp.overlay_url} className="absolute inset-0 w-full h-full object-contain z-10" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20" />
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/30 text-[10px] font-black uppercase text-brand-400 z-30 backdrop-blur-md">
                      {temp.type === 'movie' ? 'Cinematográfico' : temp.type === 'soccer' ? 'Sports' : temp.type}
                    </span>
                  </div>
                  <div className="p-6 flex justify-between items-center bg-dark-900 border-t border-white/5">
                    <div>
                      <h3 className="text-white font-bold text-lg">{temp.name}</h3>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black flex items-center gap-1">
                        <Monitor size={10} /> Design Estrutural
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditTheme(temp)} className="w-10 h-10 bg-white/5 text-zinc-400 hover:text-brand-500 hover:bg-brand-500/10 rounded-full flex items-center justify-center transition-all border border-white/5"><Settings size={18} /></button>
                      <button onClick={() => handleDeleteTheme(temp.id)} className="w-10 h-10 bg-white/5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-full flex items-center justify-center transition-all border border-white/5"><Trash2 size={18} /></button>
                    </div>
                  </div>
                </div>
              ))}
           </div>

           {adminTemplates.length === 0 && (
             <div className="py-20 text-center bg-dark-800/30 border border-dashed border-white/10 rounded-[3rem]">
                <Palette size={48} className="mx-auto text-zinc-700 mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">Sua Oficina está vazia</h3>
                <p className="text-zinc-500 max-w-sm mx-auto">Crie seu primeiro modelo de encarte para começar a automatizar o marketing da sua rede.</p>
             </div>
           )}
        </div>
      )}

      {/* ── MODAL DE GESTÃO DE TEMAS (FÁBRICA) ─────────────────── */}
      {showThemeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setShowThemeModal(false)}></div>
          <div className="relative bg-dark-800 border border-white/10 rounded-[3rem] w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,1)] animate-scale-in">
            {/* Header Modal */}
            <div className="p-8 border-b border-white/5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-brand-500/20 rounded-2xl flex items-center justify-center text-brand-500 border border-brand-500/30">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">{editingTheme ? 'Editar' : 'Novos'} <span className="text-brand-500">Protocolos Visuais</span></h2>
                  <p className="text-zinc-400 text-sm mt-1">Defina as proporções e camadas do modelo mestre.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowThemeModal(false)} 
                className="w-12 h-12 flex items-center justify-center text-zinc-500 hover:text-white transition bg-white/5 rounded-2xl border border-white/5 hover:bg-red-500/20 hover:border-red-500/30"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col lg:flex-row p-8 gap-8">
              {/* FORMULÁRIO */}
              <form onSubmit={handleSaveTheme} className="flex-1 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block ml-1">Nome do Dispositivo</label>
                    <input 
                      required 
                      value={themeFormData.name} 
                      onChange={e => setThemeFormData({...themeFormData, name: e.target.value})}
                      placeholder="Ex: Encarte Cinema Black Friday" 
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-zinc-700 outline-none focus:border-brand-500 transition-all shadow-inner focus:ring-4 focus:ring-brand-500/10 font-bold" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block ml-1">Categoria Alvo</label>
                    <select 
                      value={themeFormData.type} 
                      onChange={e => setThemeFormData({...themeFormData, type: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-brand-500 transition-all appearance-none cursor-pointer font-bold"
                    >
                      <option value="movie">Filmes & Séries (VOD)</option>
                      <option value="soccer">Esportes (Futebol)</option>
                      <option value="iptv">Canais Ao Vivo</option>
                      <option value="game">Grades de Programação</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <div className="space-y-3">
                      <label className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] block ml-1">Layout Principal</label>
                      <div className="flex gap-2">
                         <button type="button" onClick={() => setPreviewActive('feed')} className={`flex-1 py-3.5 rounded-2xl border text-[10px] font-black uppercase transition-all ${previewActive === 'feed' ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20' : 'bg-black/20 border-white/5 text-zinc-600'}`}>FEED (1:1)</button>
                         <button type="button" onClick={() => setPreviewActive('story')} className={`flex-1 py-3.5 rounded-2xl border text-[10px] font-black uppercase transition-all ${previewActive === 'story' ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20' : 'bg-black/20 border-white/5 text-zinc-600'}`}>STORY (9:16)</button>
                      </div>
                   </div>
                   <div className="space-y-3">
                      <label className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] block ml-1">Cromatismo Elite</label>
                      <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl flex items-center p-1 px-4 gap-4 h-[58px] shadow-inner">
                         <input type="color" value={themeFormData.config.text_color} onChange={e => setThemeFormData({...themeFormData, config: {...themeFormData.config, text_color: e.target.value}})}
                            className="h-9 w-9 bg-transparent cursor-pointer rounded-xl border-none" />
                         <input type="text" value={themeFormData.config.text_color} onChange={e => setThemeFormData({...themeFormData, config: {...themeFormData.config, text_color: e.target.value}})}
                            className="bg-transparent border-none text-white font-mono uppercase text-sm w-full outline-none font-bold" />
                      </div>
                   </div>
                   <div className="space-y-3">
                      <label className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] block ml-1">Tipografia</label>
                      <select 
                        value={themeFormData.config.font_family} 
                        onChange={e => setThemeFormData({...themeFormData, config: {...themeFormData.config, font_family: e.target.value}})}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl h-[58px] px-6 text-white outline-none focus:border-brand-500 transition-all appearance-none cursor-pointer font-extrabold text-sm shadow-inner"
                      >
                        <option value="Inter">INTER (Sleek)</option>
                        <option value="Outfit">OUTFIT (Modern)</option>
                        <option value="Roboto">ROBOTO (Classic)</option>
                      </select>
                   </div>
                   <div className="space-y-3">
                      <label className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] block ml-1">HUD Extra</label>
                      <button 
                        type="button"
                        onClick={() => setThemeFormData({...themeFormData, config: {...themeFormData.config, show_synopsis: !themeFormData.config.show_synopsis}})}
                        className={`w-full h-[58px] rounded-2xl border text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${themeFormData.config.show_synopsis ? 'bg-brand-500/20 border-brand-500 text-brand-500' : 'bg-black/20 border-white/5 text-zinc-600'}`}
                      >
                        {themeFormData.config.show_synopsis ? (
                            <><span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" /> Sinopse Ativa</>
                        ) : 'Sinopse Oculta'}
                      </button>
                   </div>
                </div>

                <div className="space-y-6 bg-black/40 p-6 rounded-[2rem] border border-white/5">
                  <h4 className="text-[10px] font-black text-zinc-500 flex items-center gap-2 uppercase tracking-widest border-b border-white/5 pb-2">
                    <Monitor size={14} /> Calibração Mestre de Layout (Digital Twin)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black text-white uppercase tracking-tighter">Poster Eixo X: {themeFormData.config.poster_x}%</span>
                        </div>
                        <input type="range" min="0" max="100" value={themeFormData.config.poster_x} onChange={e => setThemeFormData({...themeFormData, config: {...themeFormData.config, poster_x: parseInt(e.target.value)}})} 
                               className="w-full accent-brand-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer" />
                     </div>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black text-white uppercase tracking-tighter">Poster Eixo Y: {themeFormData.config.poster_y}%</span>
                        </div>
                        <input type="range" min="0" max="100" value={themeFormData.config.poster_y} onChange={e => setThemeFormData({...themeFormData, config: {...themeFormData.config, poster_y: parseInt(e.target.value)}})} 
                               className="w-full accent-brand-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer" />
                     </div>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black text-white uppercase tracking-tighter">Escala: {themeFormData.config.poster_scale}x</span>
                        </div>
                        <input type="range" min="0.5" max="2" step="0.1" value={themeFormData.config.poster_scale} onChange={e => setThemeFormData({...themeFormData, config: {...themeFormData.config, poster_scale: parseFloat(e.target.value)}})} 
                               className="w-full accent-brand-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer" />
                     </div>
                  </div>
                </div>

                <div className="space-y-6 bg-black/40 p-6 rounded-[2rem] border border-white/5">
                  <h4 className="text-[10px] font-black text-zinc-500 flex items-center gap-2 uppercase tracking-widest border-b border-white/5 pb-2">
                    <Shield size={14} /> Branding & Identidade Visual
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] block ml-1">Nome da Marca</label>
                      <input value={themeFormData.config.brand_name} onChange={e => setThemeFormData({...themeFormData, config: {...themeFormData.config, brand_name: e.target.value}})} 
                        placeholder="Ex: TV MAXX" className="w-full bg-black/40 border border-white/10 rounded-2xl py-4.5 px-6 text-sm text-white placeholder-zinc-700 outline-none focus:border-brand-500/50 transition-all font-bold" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] block ml-1">URL da Logo (PNG Transparente)</label>
                      <input value={themeFormData.config.brand_logo_url} onChange={e => setThemeFormData({...themeFormData, config: {...themeFormData.config, brand_logo_url: e.target.value}})} 
                        placeholder="Link da sua logo..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-4.5 px-6 text-sm text-white placeholder-zinc-700 outline-none focus:border-brand-500/50 transition-all font-mono text-[10px]" />
                    </div>
                  </div>

                  <h4 className="text-[10px] font-black text-zinc-500 flex items-center gap-2 uppercase tracking-widest border-b border-white/5 pb-2 mt-4">
                    <Layers size={14} /> Camadas de Composição (Layout Base)
                  </h4>
                  <div className="space-y-4">
                    <div className="relative group">
                      <label className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] block ml-1">Link da imagem BASE (Fundo Estático)</label>
                      <input value={themeFormData.bg_url} onChange={e => setThemeFormData({...themeFormData, bg_url: e.target.value})} 
                        placeholder="Cole a URL da imagem de fundo..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-4.5 pl-12 pr-6 text-sm text-white placeholder-zinc-700 outline-none focus:border-brand-500/50 transition-all font-mono font-bold" />
                    </div>
                    <div className="relative group">
                      <label className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] block ml-1">Link do OVERLAY PNG (Moldura Transparente)</label>
                      <input value={themeFormData.overlay_url} onChange={e => setThemeFormData({...themeFormData, overlay_url: e.target.value})} 
                        placeholder="Cole a URL do overlay transparente..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-4.5 pl-12 pr-6 text-sm text-white placeholder-zinc-700 outline-none focus:border-brand-500/50 transition-all font-mono font-bold" />
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <button type="submit" className="w-full h-16 bg-gradient-to-r from-brand-600 to-orange-500 text-white font-black rounded-[1.5rem] shadow-2xl shadow-brand-500/30 hover:scale-[1.02] active:scale-95 transition-all text-lg flex items-center justify-center gap-3">
                    <Save size={24} /> SELAR E SALVAR PROTOCOLO
                  </button>
                </div>
              </form>

              {/* LIVE DUAL PREVIEW */}
              <div className="lg:w-[450px] space-y-6">
                 <div className="bg-black/60 border border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center gap-6 shadow-2xl">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                       <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Digital Twin Preview</span>
                    </div>

                    <div className={`relative bg-zinc-950 border-4 border-white/5 rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,1)] overflow-hidden transition-all duration-500 ${previewActive === 'feed' ? 'aspect-square w-full' : 'aspect-[9/16] h-[650px]'}`}>
                        <div className="absolute inset-0 origin-top flex items-center justify-center">
                           <div className="origin-top" style={{ transform: `scale(${previewActive === 'feed' ? 0.38 : 0.33})` }}>
                              <div className="w-[1080px] h-[1920px]">
                              <MovieBannerElite 
                                movie={useRealContentInPreview ? sampleMovie : { titulo: 'MOCK TITLE', overview: 'LOREM IPSUM DOLOR SIT AMET...', poster_path: null, backdrop_path: null }} 
                                contact="(00) 00000-0000"
                                config={{
                                  ...themeFormData.config,
                                  custom_bg: themeFormData.bg_url,
                                  custom_overlay: themeFormData.overlay_url
                                }}
                              />
                           </div>
                        </div>
                        </div>

                        <div className="absolute top-4 right-4 z-[60]">
                           <button 
                             type="button"
                             onClick={() => setUseRealContentInPreview(!useRealContentInPreview)}
                             className="px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-[8px] font-black text-white hover:bg-brand-500/20 transition-all uppercase tracking-widest"
                           >
                             {useRealContentInPreview ? 'USAR MOCK' : 'DADOS REAIS'}
                           </button>
                        </div>
                    </div>

                    <div className="bg-brand-500/5 border border-brand-500/20 p-4 rounded-2xl flex gap-3">
                       <Info size={18} className="text-brand-500 shrink-0" />
                       <p className="text-[9px] text-zinc-500 leading-relaxed italic">
                         O motor de renderização Maxx compositor empilha as imagens nativamente. Certifique-se que o Overlay é um PNG de 24 bits com canal alpha transparente.
                       </p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BannerGenerator

// ─── CONFIGURADOR DE FUTEBOL ───────────────────────────────────────────────────
const FootballConfigurator = ({ theme, sportsData = [], loading }) => {
  const [matches, setMatches] = useState([])
  const [title, setTitle] = useState('TABELA DE JOGOS')
  const [date, setDate] = useState('HOJE')
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)

  // Inicializa com um jogo vazio se não houver dados
  useEffect(() => {
    if (matches.length === 0 && sportsData.length === 0) {
      setMatches([{ league: 'BRASILEIRÃO SÉRIE A', team1: 'FLAMENGO', team2: 'PALMEIRAS', time: '20:00' }])
    }
  }, [sportsData])

  const addMatch = () => setMatches(m => [...m, { league: '', team1: '', team2: '', time: '' }])
  const removeMatch = (i) => setMatches(m => m.filter((_, idx) => idx !== i))
  const updateMatch = (i, field, val) => setMatches(m => m.map((match, idx) => idx === i ? { ...match, [field]: val } : match))

  const importFromApi = (game) => {
    setMatches(prev => [...prev, {
      league: game.campeonato || '',
      team1: game.time_casa || '',
      team2: game.time_fora || '',
      time: game.horario || ''
    }])
  }

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => { setGenerating(false); setDone(true); setTimeout(() => setDone(false), 3000) }, 1500)
  }

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-dark-700 flex items-center justify-between bg-dark-900/50">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span>⚽</span> Configurar Banner de Futebol
        </h3>
        <span className="text-xs text-zinc-500 bg-dark-800 px-2 py-1 rounded border border-dark-700">
          Tema: {theme}
        </span>
      </div>
      <div className="p-6 space-y-5">
        {/* Sugestões da API */}
        {(sportsData.length > 0 || loading) && (
          <div className="bg-brand-500/5 border border-brand-500/10 rounded-xl p-4">
            <h4 className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              ⚡ Sugestões de Hoje (API Real)
            </h4>
            {loading ? (
              <div className="text-xs text-zinc-500 animate-pulse">Buscando jogos...</div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {sportsData.flatMap(cat => cat.jogos || []).map((game, idx) => (
                  <button
                    key={idx}
                    onClick={() => importFromApi(game)}
                    className="flex-shrink-0 bg-dark-900 border border-dark-700 hover:border-brand-500/50 p-3 rounded-lg text-left transition group"
                  >
                    <p className="text-[8px] font-bold text-zinc-500 uppercase truncate mb-1">{game.campeonato}</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-white mb-1">
                      <span>{game.time_casa}</span>
                      <span className="text-brand-500 italic">vs</span>
                      <span>{game.time_fora}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-yellow-500 font-bold">{game.horario}</span>
                      <span className="text-[9px] text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity font-black">+ ADD</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Título e Data */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Título</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-brand-500 outline-none transition"
              placeholder="TABELA DE JOGOS" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Data / Rodada</label>
            <input value={date} onChange={e => setDate(e.target.value)}
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-brand-500 outline-none transition"
              placeholder="HOJE" />
          </div>
        </div>

        {/* Lista de Jogos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Jogos ({matches.length})</label>
            <button onClick={addMatch}
              className="flex items-center gap-1 text-xs font-bold text-brand-400 hover:text-brand-300 transition">
              <span>+</span> Adicionar Jogo
            </button>
          </div>
          {matches.map((match, i) => (
            <div key={i} className="bg-dark-900 border border-dark-600 rounded-xl p-4 space-y-3 relative">
              <button onClick={() => removeMatch(i)}
                className="absolute top-3 right-3 text-zinc-600 hover:text-red-400 transition text-sm">✕</button>
              <div>
                <label className="text-[9px] font-bold text-zinc-500 uppercase">Campeonato</label>
                <input value={match.league} onChange={e => updateMatch(i, 'league', e.target.value)}
                  className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-500 outline-none transition mt-1"
                  placeholder="BRASILEIRÃO SÉRIE A" />
              </div>
              <div className="grid grid-cols-3 gap-3 items-center">
                <input value={match.team1} onChange={e => updateMatch(i, 'team1', e.target.value)}
                  className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm font-bold text-center focus:border-brand-500 outline-none transition"
                  placeholder="TIME 1" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-brand-500 font-black text-lg">VS</span>
                  <input value={match.time} onChange={e => updateMatch(i, 'time', e.target.value)}
                    className="w-full bg-dark-800 border border-dark-700 rounded-lg px-2 py-1.5 text-yellow-400 text-xs font-bold text-center focus:border-yellow-500 outline-none transition"
                    placeholder="20:00" />
                </div>
                <input value={match.team2} onChange={e => updateMatch(i, 'team2', e.target.value)}
                  className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm font-bold text-center focus:border-brand-500 outline-none transition"
                  placeholder="TIME 2" />
              </div>
            </div>
          ))}
        </div>

        {/* Botão Gerar */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 text-sm
            ${done
              ? 'bg-green-600 text-white'
              : 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white'
            }`}
        >
          {generating ? <><span className="animate-spin">⏳</span> Gerando arte...</>
            : done ? <><span>✅</span> Arte Gerada! Clique para baixar</>
            : <><span>🎨</span> Gerar Banner Agora</>}
        </button>
      </div>
    </div>
  )
}

// ─── CONFIGURADOR DE ESPORTES (Basquete, UFC, Divulgação) ─────────────────────
const SportConfigurator = ({ category, theme, sportsData = [], loading }) => {
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)

  const [team1, setTeam1] = useState('')
  const [team2, setTeam2] = useState('')
  const [gameTime, setGameTime] = useState('21:00')
  const [league, setLeague] = useState('')
  const [date, setDate] = useState('')

  const importGame = (game) => {
    setTeam1(game.time_casa || game.nome_evento || '')
    setTeam2(game.time_fora || '')
    setGameTime(game.horario || '')
    setLeague(game.campeonato || '')
  }

  const catInfo = {
    basquete:   { label: 'Basquete',    icon: '🏀', placeholder1: 'LA LAKERS', placeholder2: 'GOLDEN STATE', leagueDefault: 'NBA' },
    ufc:        { label: 'UFC',         icon: '🥊', placeholder1: 'POATAN',    placeholder2: 'PEREIRA',      leagueDefault: 'UFC' },
    divulgacao: { label: 'Divulgação',  icon: '📣', placeholder1: '',          placeholder2: '',             leagueDefault: '' },
  }
  const info = catInfo[category] || catInfo.divulgacao

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => { setGenerating(false); setDone(true); setTimeout(() => setDone(false), 3000) }, 1500)
  }

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden shadow-xl">
      <div className="px-6 py-4 border-b border-dark-700 flex items-center gap-2 bg-dark-900/50">
        <span className="text-lg">{info.icon}</span>
        <h3 className="font-bold text-white">Configurar Banner de {info.label}</h3>
      </div>
      <div className="p-6 space-y-4">
        {/* Sugestões da API */}
        {category !== 'divulgacao' && (sportsData.length > 0 || loading) && (
          <div className="bg-brand-500/5 border border-brand-500/10 rounded-xl p-4">
            <h4 className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              ⚡ {category === 'ufc' ? 'Eventos MMA Próximos' : 'Jogos NBA de Hoje'}
            </h4>
            {loading ? (
              <div className="text-xs text-zinc-500 animate-pulse">Buscando...</div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {sportsData.map((game, idx) => (
                  <button
                    key={idx}
                    onClick={() => importGame(game)}
                    className="flex-shrink-0 bg-dark-900 border border-dark-700 hover:border-brand-500/50 p-3 rounded-lg text-left transition group"
                  >
                    <div className="flex items-center gap-2 text-[10px] font-bold text-white mb-1">
                      <span>{game.time_casa || game.nome_evento}</span>
                      {game.time_fora && (
                        <>
                          <span className="text-brand-500 italic">vs</span>
                          <span>{game.time_fora}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-yellow-500 font-bold">{game.horario || game.data_fmt}</span>
                      <span className="text-[9px] text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity font-black">USAR</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {category !== 'divulgacao' && (
          <>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Liga / Campeonato</label>
              <input value={league} onChange={e => setLeague(e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-brand-500 outline-none transition"
                placeholder={info.leagueDefault} />
            </div>
            <div className="grid grid-cols-3 gap-3 items-center">
              <div>
                <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Time / Lutador 1</label>
                <input value={team1} onChange={e => setTeam1(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-white text-sm font-bold text-center focus:border-brand-500 outline-none transition"
                  placeholder={info.placeholder1} />
              </div>
              <div className="text-center">
                <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Horário</label>
                <input value={gameTime} onChange={e => setGameTime(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-yellow-400 text-sm font-bold text-center focus:border-yellow-500 outline-none transition"
                  placeholder="21:00" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Time / Lutador 2</label>
                <input value={team2} onChange={e => setTeam2(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-white text-sm font-bold text-center focus:border-brand-500 outline-none transition"
                  placeholder={info.placeholder2} />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Data</label>
              <input value={date} onChange={e => setDate(e.target.value)} type="date"
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-brand-500 outline-none transition" />
            </div>
          </>
        )}
        {category === 'divulgacao' && (
          <div className="bg-dark-900 border border-dashed border-dark-600 rounded-xl p-6 text-center text-zinc-500">
            <span className="text-3xl mb-2 block">📣</span>
            <p className="text-sm">Banners de divulgação não precisam de configuração.</p>
            <p className="text-xs mt-1">Clique em gerar para criar o banner com seu contato.</p>
          </div>
        )}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 text-sm
            ${done
              ? 'bg-green-600 text-white'
              : 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white'
            }`}
        >
          {generating ? <><span className="animate-spin">⏳</span> Gerando arte...</>
            : done ? <><span>✅</span> Arte Gerada! Clique para baixar</>
            : <><span>🎨</span> Gerar Banner Agora</>}
        </button>
      </div>
    </div>
  )
}

// ─── CONFIGURADOR DE FILMES ────────────────────────────────────────────────────
const FilmesConfigurator = ({ theme, contents, trendingMovies = [], trendingSeries = [], loading, onSearch, onMovieSelect, onGenerate }) => {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)

  const handleSelect = (c) => {
    setSelected(c)
    if (onMovieSelect) onMovieSelect(c)
  }

  const handleGenerateClick = () => {
    if (!selected) return
    setGenerating(true)
    if (onGenerate) onGenerate()
    setTimeout(() => {
      setGenerating(false)
      setDone(true)
      setTimeout(() => setDone(false), 3000)
    }, 1500)
  }

  const filtered = contents.filter(c =>
    c.titulo?.toLowerCase().includes(search.toLowerCase()) ||
    c.titulo_original?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden shadow-xl">
      <div className="px-6 py-4 border-b border-dark-700 flex items-center justify-between bg-dark-900/50">
        <h3 className="font-bold text-white flex items-center gap-2">🎬 Selecione o Filme / Série</h3>
        {selected && <span className="text-xs text-purple-400 font-bold">{selected.titulo}</span>}
      </div>
      <div className="p-6 space-y-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
          <input
            value={search} 
            onChange={e => {
              setSearch(e.target.value)
              onSearch(e.target.value)
            }}
            className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm focus:border-purple-500 outline-none transition"
            placeholder="Buscar filme ou série no catálogo e TMDB..."
          />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-10 text-zinc-500">
            <span className="animate-spin mr-2">⏳</span> Carregando títulos...
          </div>
        ) : (
          <div className="space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
            {/* Seções de Tendências (Somente se não houver busca ativa) */}
            {search.length < 3 && (
              <>
                {trendingMovies.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-3 flex items-center gap-2">🔥 Top 10 Filmes Hoje</h4>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                      {trendingMovies.map(c => (
                        <button key={c.id} onClick={() => handleSelect(c)} className={`flex-shrink-0 w-24 aspect-[2/3] rounded-xl overflow-hidden border-2 transition-all ${selected?.id === c.id ? 'border-brand-500 scale-105' : 'border-dark-700 hover:border-zinc-500'}`}>
                          <img src={`https://image.tmdb.org/t/p/w200${c.poster_path}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {trendingSeries.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">📺 Top 10 Séries Hoje</h4>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                      {trendingSeries.map(c => (
                        <button key={c.id} onClick={() => handleSelect(c)} className={`flex-shrink-0 w-24 aspect-[2/3] rounded-xl overflow-hidden border-2 transition-all ${selected?.id === c.id ? 'border-brand-500 scale-105' : 'border-dark-700 hover:border-zinc-500'}`}>
                          <img src={`https://image.tmdb.org/t/p/w200${c.poster_path}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Galeria Geral / Resultados de Busca */}
            <div>
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">
                {search.length >= 3 ? `Resultados para "${search}"` : 'Galeria de Conteúdos'}
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {filtered.slice(0, 30).map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(c)}
                    className={`group relative rounded-xl overflow-hidden aspect-[2/3] border-2 transition-all
                      ${selected?.id === c.id
                        ? 'border-brand-500 ring-2 ring-brand-500/40 scale-[1.03]'
                        : 'border-dark-700 hover:border-zinc-500'
                      }`}
                  >
                    {c.poster_path ? (
                      <img src={`https://image.tmdb.org/t/p/w200${c.poster_path}`} alt={c.titulo}
                        className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-dark-800 flex items-center justify-center text-xs text-zinc-600 text-center p-1 uppercase font-black">
                        {c.titulo}
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-[8px] font-black uppercase truncate">{c.titulo}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 && search.length >= 3 && (
              <div className="text-center py-8 text-zinc-600">
                <span className="block text-3xl mb-2">🎬</span>
                <p className="text-sm">Nenhum título encontrado</p>
              </div>
            )}
          </div>
        )}
        <button
          onClick={handleGenerateClick}
          disabled={!selected || generating}
          className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 text-sm
            ${done
              ? 'bg-green-600 text-white'
              : 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white disabled:opacity-50'
            }`}
        >
          {generating ? <><span className="animate-spin">⏳</span> Gerando arte...</>
            : done ? <><span>✅</span> Arte Gerada! Clique para baixar</>
            : <><span>🎬</span> Gerar Banner de Filme</>}
        </button>
      </div>
    </div>
  )
}
