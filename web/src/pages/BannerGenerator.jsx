import { useState, useEffect } from 'react'
import api from '../services/api'


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
  const [activeCategory, setActiveCategory] = useState('futebol')
  const [selectedTheme, setSelectedTheme] = useState(null)
  const [mode, setMode] = useState(null) // 'manual' | 'auto'
  const [tick, setTick] = useState(0) // para carrossel
  const [contents, setContents] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatingBatch, setGeneratingBatch] = useState(false)
  const [batchResult, setBatchResult] = useState(null)
  const [autoSelectedThemes, setAutoSelectedThemes] = useState([])
  const [adminTemplates, setAdminTemplates] = useState([])
  const [tmdbSearchResults, setTmdbSearchResults] = useState([])
  const [searchingTMDB, setSearchingTMDB] = useState(false)
  const [curationItems, setCurationItems] = useState([])
  const [loadingCuration, setLoadingCuration] = useState(false)

  // Carrega templates personalizados do Admin e Curadoria
  useEffect(() => {
    fetchAdminTemplates()
    fetchCuration()
  }, [])

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

  // Carrossel automático
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 2500)
    return () => clearInterval(interval)
  }, [])

  // Carrega conteúdos para filmes
  useEffect(() => {
    if (activeCategory === 'filmes') loadContents()
  }, [activeCategory])

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
    <div className="space-y-6 pb-10">
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xl">
              🎨
            </div>
            Gerador de Banners
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Crie artes profissionais para IPTV em segundos. Escolha a categoria e o tema.
          </p>
        </div>
        {selectedTheme && (
          <div className="flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 px-4 py-2 rounded-full">
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            <span className="text-brand-400 text-xs font-bold uppercase">Tema Selecionado</span>
          </div>
        )}
      </div>

      {/* ── SEÇÃO DE CURADORIA (ITENS SELECIONADOS NA ÁRVORE) ─── */}
      {curationItems.length > 0 && (
        <div className="bg-dark-800/50 border border-brand-500/20 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
              <span className="text-lg">🎬</span> Sua Seleção (Árvore IPTV)
            </h2>
            <button 
              onClick={fetchCuration}
              className="text-[10px] font-bold text-brand-400 hover:text-brand-300 transition-colors"
            >
              🔄 ATUALIZAR LISTA
            </button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {curationItems.map((item) => (
              <div 
                key={item.id}
                onClick={() => {
                  setSearchQuery(item.title);
                  handleTmdbSearch(item.title);
                }}
                className="flex-shrink-0 group cursor-pointer"
                style={{ width: 100 }}
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-white/10 group-hover:border-brand-500/50 transition-all">
                  <img 
                    src={item.poster_path || 'https://via.placeholder.com/200x300?text=No+Image'} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-1 left-0 right-0 px-2">
                    <p className="text-[9px] font-bold text-white truncate">{item.title}</p>
                    <p className="text-[7px] text-brand-400 font-black uppercase">{item.provider_name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-zinc-500 mt-3 italic">
            💡 Estes são os filmes que você enviou da <b>Árvore de Curadoria</b>. Clique em um para gerar o banner.
          </p>
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
              ${mode === 'auto' ? 'bg-green-500 border-green-400 text-white' : 'bg-dark-900 border-dark-600 group-hover:border-brand-500/50 text-green-500'}`}>
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
        <FootballConfigurator theme={selectedTheme} />
      )}

      {selectedTheme && activeCategory !== 'futebol' && activeCategory !== 'filmes' && (
        <SportConfigurator category={activeCategory} theme={selectedTheme} />
      )}

      {/* ── GALERIA DE FILMES (para banners de filmes) ─────────── */}
      {(activeCategory === 'filmes' || activeCategory === 'admin') && selectedTheme && (
        <FilmesConfigurator 
          theme={selectedTheme} 
          contents={tmdbSearchResults.length > 0 ? tmdbSearchResults : contents} 
          loading={searchingTMDB || loading} 
          onSearch={handleTmdbSearch}
        />
      )}

      {/* ── EMPTY STATE ─────────────────────────────────────────── */}
      {!selectedTheme && mode !== 'auto' && (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-600 border border-dashed border-dark-700 rounded-2xl">
          <span className="text-5xl mb-4 opacity-40">🎨</span>
          <p className="text-sm font-medium">Selecione um tema acima para continuar</p>
          <p className="text-xs mt-1 opacity-60">Passe o mouse sobre os cards para ver o carrossel</p>
        </div>
      )}
    </div>
  )
}

// ─── CONFIGURADOR DE FUTEBOL ───────────────────────────────────────────────────
const FootballConfigurator = ({ theme }) => {
  const [matches, setMatches] = useState([
    { league: 'BRASILEIRÃO SÉRIE A', team1: 'FLAMENGO', team2: 'PALMEIRAS', time: '20:00' }
  ])
  const [title, setTitle] = useState('TABELA DE JOGOS')
  const [date, setDate] = useState('HOJE')
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)

  const addMatch = () => setMatches(m => [...m, { league: '', team1: '', team2: '', time: '' }])
  const removeMatch = (i) => setMatches(m => m.filter((_, idx) => idx !== i))
  const updateMatch = (i, field, val) => setMatches(m => m.map((match, idx) => idx === i ? { ...match, [field]: val } : match))

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
const SportConfigurator = ({ category, theme }) => {
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)

  const [team1, setTeam1] = useState('')
  const [team2, setTeam2] = useState('')
  const [gameTime, setGameTime] = useState('21:00')
  const [league, setLeague] = useState('')
  const [date, setDate] = useState('')

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
const FilmesConfigurator = ({ theme, contents, loading, onSearch }) => {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)

  const filtered = contents.filter(c =>
    c.titulo?.toLowerCase().includes(search.toLowerCase()) ||
    c.titulo_original?.toLowerCase().includes(search.toLowerCase())
  )

  const handleGenerate = () => {
    if (!selected) return
    setGenerating(true)
    setTimeout(() => { setGenerating(false); setDone(true); setTimeout(() => setDone(false), 3000) }, 1800)
  }

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
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
            {filtered.slice(0, 30).map(c => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className={`group relative rounded-xl overflow-hidden aspect-[2/3] border-2 transition-all
                  ${selected?.id === c.id
                    ? 'border-purple-500 ring-2 ring-purple-500/40 scale-[1.03]'
                    : 'border-dark-700 hover:border-zinc-500'
                  }`}
              >
                {c.poster_path ? (
                  <img src={`https://image.tmdb.org/t/p/w200${c.poster_path}`} alt={c.titulo}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-dark-800 flex items-center justify-center text-xs text-zinc-600 text-center p-1">
                    {c.titulo}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <p className="text-white text-[10px] font-bold leading-tight line-clamp-2">{c.titulo}</p>
                </div>
                {selected?.id === c.id && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow">
                    <span className="text-white text-[10px]">✓</span>
                  </div>
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-8 text-zinc-600">
                <span className="block text-3xl mb-2">🎬</span>
                <p className="text-sm">Nenhum título encontrado</p>
              </div>
            )}
          </div>
        )}
        <button
          onClick={handleGenerate}
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

export default BannerGenerator
