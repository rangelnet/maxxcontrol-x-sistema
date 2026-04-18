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

  // Carrega templates personalizados do Admin e a Curadoria
  useEffect(() => {
    fetchAdminTemplates()
    fetchCuration()
  }, [])
  
  const fetchCuration = async () => {
    setLoadingCuration(true)
    try {
      const res = await api.get('/api/iptv-server/curation')
      setCurationItems(res.data)
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
....
