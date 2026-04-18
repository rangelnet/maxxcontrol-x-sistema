import { useState, useEffect, useRef } from 'react'
import api from '../services/api'
import html2canvas from 'html2canvas'
import MovieBannerElite from '../components/MovieBannerElite'


// ─── DADOS DOS TEMAS POR CATEGORIA ────────────────────────────────────────────
const CATEGORIES = [
  { id: 'futebol', label: 'Futebol', icon: '⚽', color: 'from-green-600 to-emerald-600', glow: 'shadow-green-500/20' },
  { id: 'baquete', label: 'NBA / Basketball', icon: '🏀', color: 'from-orange-600 to-red-600', glow: 'shadow-orange-500/20' },
  { id: 'ufc', label: 'MMA / UFC', icon: '🥊', color: 'from-red-600 to-zinc-900', glow: 'shadow-red-500/20' },
  { id: 'filmes', label: 'Filmes & Séries', icon: '🎬', color: 'from-purple-600 to-violet-600', glow: 'shadow-purple-500/20' },
  { id: 'kids', label: 'Kids / Desenhos', icon: '🧸', color: 'from-blue-400 to-cyan-500', glow: 'shadow-blue-500/20' },
  { id: 'animes', label: 'Animes', icon: '👺', color: 'from-rose-500 to-orange-500', glow: 'shadow-rose-500/20' },
  { id: 'divulgacao', label: 'Promo / Planos', icon: '📢', color: 'from-pink-500 to-rose-600', glow: 'shadow-pink-500/20' },
  { id: 'admin', label: 'Personalizados', icon: '🛠️', color: 'from-zinc-700 to-zinc-900', glow: 'shadow-zinc-500/20' }
]

const THEMES = {
  futebol: [
    { id: 'spot-orange', name: 'Spotlight Orange', images: ['/banners/football/spot_orange.png'], isGroup: false },
    { id: 'neon-strike', name: 'Neon Strike', images: ['/banners/football/neon_strike.png'], isGroup: false },
    { id: 'stadium-master', name: 'Stadium Master', images: ['/banners/football/stadium_master.png'], isGroup: false },
  ],
  filmes: [
    { id: 'filme-t1', name: 'Cinema Dark', images: ['/banners/movies/cinema_dark.jpg'], isGroup: false },
    { id: 'filme-t2', name: 'Action Blue', images: ['/banners/movies/action_blue.jpg'], isGroup: false },
    { id: 'filme-t3', name: 'Glow Premium', images: ['/banners/movies/glow_premium.jpg'], isGroup: false },
  ],
  divulgacao: [
    { id: 'promo-basic', name: 'Promoção Simples', images: ['/banners/promo/promo_basic.jpg'], isGroup: false },
    { id: 'plan-master', name: 'Tabela de Preços', images: ['/banners/promo/plan_master.jpg'], isGroup: false },
  ]
}

// ─── COMPONENTES AUXILIARES ────────────────────────────────────────────────────

const ThemeCard = ({ theme, selected, onSelect, tick }) => {
  const isSelected = selected === theme.id
  
  return (
    <div 
      onClick={() => onSelect(theme.id)}
      className={`relative group cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300 transform 
        ${isSelected 
          ? 'border-brand-500 scale-[1.02] shadow-2xl shadow-brand-500/20 ring-4 ring-brand-500/10' 
          : 'border-dark-700 hover:border-brand-500/50 hover:-translate-y-1'
        }`}
    >
      <div className="aspect-[9/16] relative bg-dark-900">
        <img 
          src={theme.images[tick % theme.images.length]} 
          alt={theme.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-[10px] font-black text-white uppercase tracking-widest">{theme.name}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
            <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-tighter">HD Rendering</span>
          </div>
        </div>
      </div>

      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center shadow-lg animate-bounce-subtle">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
    </div>
  )
}

const FootballConfigurator = ({ theme, sportsData, loading }) => {
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)

  const handleGenerate = () => {
    if (!selectedMatch) return
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      setDone(true)
      setTimeout(() => setDone(false), 3000)
    }, 2000)
  }

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden shadow-xl animate-fade-in">
      <div className="px-6 py-4 border-b border-dark-700 flex items-center justify-between bg-dark-900/50">
        <h3 className="font-bold text-white flex items-center gap-2 tracking-wide uppercase text-xs">
          <span className="text-brand-500">⚡</span> Configuração da Partida
        </h3>
        {selectedMatch && (
          <span className="text-[10px] bg-brand-500/10 text-brand-400 px-3 py-1 rounded-full border border-brand-500/20 font-black">
            {selectedMatch.home_team} vs {selectedMatch.away_team}
          </span>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Lista de Jogos do Dia */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Jogos Recentes / Próximos</label>
          
          {loading ? (
             <div className="flex items-center justify-center py-10 bg-dark-900/30 rounded-xl border border-dashed border-dark-700">
               <span className="animate-spin text-brand-500 mr-3 text-xl">⏳</span>
               <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Sincronizando Live Scores...</span>
             </div>
          ) : sportsData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {sportsData.map(match => (
                <div 
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between
                    ${selectedMatch?.id === match.id 
                      ? 'border-brand-500 bg-brand-500/5' 
                      : 'border-dark-700 bg-dark-900/50 hover:border-dark-600'}`}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">{match.league_name}</span>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <span className="text-white font-black text-xs">{match.home_team}</span>
                      </div>
                      <span className="text-brand-500 font-black italic">VS</span>
                      <div className="flex flex-col items-center">
                        <span className="text-white font-black text-xs">{match.away_team}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-dark-700 text-zinc-300 px-2 py-1 rounded font-bold">{match.match_time}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-dark-900/30 rounded-xl border border-dashed border-dark-700">
               <span className="text-4xl mb-3 block">🏟️</span>
               <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Nenhum jogo encontrado para hoje</p>
            </div>
          )}
        </div>

        <button 
          onClick={handleGenerate}
          disabled={!selectedMatch || generating}
          className={`w-full font-black py-4 rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em]
            ${done 
              ? 'bg-green-600 text-white animate-bounce-subtle' 
              : 'bg-gradient-to-r from-brand-500 to-orange-600 hover:from-brand-400 hover:to-orange-500 text-white disabled:opacity-30 disabled:grayscale disabled:scale-100'}`}
        >
          {generating ? <><span className="animate-spin">⏳</span> Renderizando Banner...</> 
           : done ? <><span>✅</span> Banner Gerado!</> 
           : <><span>🎨</span> Gerar Banner Agora</>}
        </button>
      </div>
    </div>
  )
}

const SportConfigurator = ({ category, theme, sportsData, loading }) => {
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)
  
  const handleGenerate = () => {
    if (!selectedMatch) return
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      setDone(true)
      setTimeout(() => setDone(false), 3000)
    }, 2000)
  }

  const getCategoryIcon = () => {
    if (category === 'ufc') return '🥊'
    if (category === 'basquete') return '🏀'
    return '🏆'
  }

  const getCategoryLabel = () => {
    if (category === 'ufc') return 'Luta / Evento'
    if (category === 'basquete') return 'Partida NBA'
    return 'Evento'
  }

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden shadow-xl animate-fade-in group">
       <div className="px-6 py-4 border-b border-dark-700 flex items-center justify-between bg-dark-900/50">
        <h3 className="font-bold text-white flex items-center gap-2 tracking-wide uppercase text-xs">
          <span className="text-brand-500">{getCategoryIcon()}</span> Configuração de {getCategoryLabel()}
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {loading ? (
           <div className="flex items-center justify-center py-20 bg-dark-900/30 rounded-xl border border-dashed border-dark-700">
             <span className="animate-spin text-brand-500 mr-3 text-xl">⏳</span>
             <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest italic">Sincronizando feeds de {category}...</span>
           </div>
        ) : sportsData && sportsData.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
             {sportsData.map(match => (
                <div 
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-4 relative overflow-hidden
                    ${selectedMatch?.id === match.id 
                      ? 'border-brand-500 bg-brand-500/10' 
                      : 'border-dark-700 bg-dark-900/50 hover:border-dark-600'}`}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">{match.league_name || 'MASTER LEAGUE'}</span>
                    <span className="text-[10px] font-bold text-zinc-500 bg-dark-900 px-2 py-1 rounded">{match.match_time}</span>
                  </div>

                  <div className="flex items-center gap-6 relative z-10">
                    <div className="flex-1 flex flex-col items-center gap-2">
                       <div className="w-12 h-12 bg-dark-800 rounded-full flex items-center justify-center border border-white/5 text-xl">👤</div>
                       <span className="text-white font-black text-xs text-center uppercase tracking-tighter">{match.home_team}</span>
                    </div>

                    <div className="flex flex-col items-center">
                       <span className="text-brand-500 font-black italic text-lg">VS</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center gap-2">
                       <div className="w-12 h-12 bg-dark-800 rounded-full flex items-center justify-center border border-white/5 text-xl">👤</div>
                       <span className="text-white font-black text-xs text-center uppercase tracking-tighter">{match.away_team}</span>
                    </div>
                  </div>
                  
                  {selectedMatch?.id === match.id && (
                     <div className="absolute top-0 right-0 p-2">
                        <div className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center animate-pulse">
                           <span className="text-white text-[10px]">✓</span>
                        </div>
                     </div>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-dark-900/30 rounded-xl border border-dashed border-dark-700">
             <span className="text-5xl mb-4 block">📡</span>
             <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Sem eventos detectados no momento</p>
             <p className="text-zinc-600 text-[9px] mt-2 uppercase">Verificaremos novas transmissões em breve</p>
          </div>
        )}

        <button 
          onClick={handleGenerate}
          disabled={!selectedMatch || generating}
          className={`w-full font-black py-4 rounded-2xl shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.3em] overflow-hidden relative
            ${done 
              ? 'bg-green-600 text-white' 
              : 'bg-gradient-to-r from-brand-600 to-orange-600 hover:from-brand-500 hover:to-orange-500 text-white disabled:opacity-20 disabled:grayscale'}`}
        >
          {generating ? <span className="animate-spin text-lg">⏳</span> : done ? '✅ ARTE PRONTA!' : '🎨 CRIAR BANNER PREMIUM'}
        </button>
      </div>
    </div>
  )
}

const ManualConfigurator = ({ theme, category, contents, info }) => {
  const [selected, setSelected] = useState(null)
  const [team1, setTeam1] = useState('')
  const [team2, setTeam2] = useState('')
  const [date, setDate] = useState('')
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)

  const handleGenerate = () => {
    if (!selected) return
    setGenerating(true)
    setTimeout(() => { setGenerating(false); setDone(true); setTimeout(() => setDone(false), 3000) }, 1800)
  }

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden shadow-xl animate-scale-in">
      <div className="px-6 py-4 border-b border-dark-700 bg-dark-900/50 flex items-center justify-between">
        <h3 className="font-bold text-white text-xs uppercase tracking-widest flex items-center gap-2">
          <span className="text-brand-500 text-base">✏️</span> Edição Master
        </h3>
        <span className="text-[10px] font-bold text-zinc-500 bg-dark-900 px-2 py-0.5 rounded border border-white/5 uppercase">{theme}</span>
      </div>
      <div className="p-6 space-y-6">
        {category !== 'divulgacao' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Time / Lutador 1</label>
                <input value={team1} onChange={e => setTeam1(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-white text-sm font-bold text-center focus:border-brand-500 outline-none transition"
                  placeholder={info.placeholder1} />
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
const FilmesConfigurator = ({ theme, contents, loading, onSearch, onMovieSelect, onGenerate }) => {
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
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
            {filtered.slice(0, 30).map(c => (
              <button
                key={c.id}
                onClick={() => handleSelect(c)}
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
  const [loadingSports, setLoadingSports] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [bannerContact, setBannerContact] = useState('')
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

  // Carrega conteúdos para filmes e esportes
  useEffect(() => {
    if (activeCategory === 'filmes') loadContents()
    if (activeCategory === 'futebol') fetchSportsData('soccer')
    if (activeCategory === 'ufc') fetchSportsData('mma')
    if (activeCategory === 'basquete') fetchSportsData('basketball')
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
              <div 
                key={theme.id}
                onClick={() => toggleAutoTheme(theme.id)}
                className={`relative group cursor-pointer rounded-2xl overflow-hidden border-2 transition-all
                  ${autoSelectedThemes.includes(theme.id) 
                    ? 'border-green-500 ring-2 ring-green-500/20' 
                    : 'border-dark-700 hover:border-dark-600'}`}
              >
                <div className="aspect-[9/16] bg-dark-900">
                  <img src={theme.images[0]} className="w-full h-full object-cover opacity-60" alt="" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
                      ${autoSelectedThemes.includes(theme.id) ? 'bg-green-500 border-green-400' : 'bg-black/50 border-white/20'}`}>
                      {autoSelectedThemes.includes(theme.id) && <span className="text-white text-xs">✓</span>}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black text-center">
                     <p className="text-[9px] font-black text-white uppercase">{theme.name}</p>
                  </div>
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

      {/* ── RESULTADO EM LOTE ───────────────────────────────────── */}
      {batchResult && (
        <div className="bg-brand-500/10 border-2 border-brand-500/30 rounded-3xl p-8 text-center animate-bounce-subtle mt-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand-500 animate-pulse" />
          <span className="text-5xl mb-4 block">🔥</span>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">Sucesso! Geramos {batchResult.count} banners</h3>
          <p className="text-zinc-400 mt-2 text-sm">Todas as artes foram processadas e estão prontas para download.</p>
          
          <div className="flex gap-3 justify-center mt-6">
            <button
               className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-black py-3 px-8 rounded-xl transition shadow-xl text-sm uppercase tracking-widest"
            >
              📥 Baixar ZIP com Todas
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
            loading={searchingTMDB || loading} 
            onSearch={handleTmdbSearch}
            onMovieSelect={setSelectedMovie}
            onGenerate={handleExportBanner}
          />
          
            <div className="w-full aspect-[9/16] max-h-[600px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl origin-top scale-[0.35]">
              <div ref={bannerRef} className="bg-black">
                {selectedTheme === 'filme-t1' ? (
                  <MovieBannerElite 
                    movie={selectedMovie} 
                    contact={bannerContact} 
                    theme={selectedTheme} 
                  />
                ) : (
                  <div className="w-[1080px] h-[1920px] flex items-center justify-center text-4xl text-zinc-600 font-black uppercase text-center p-20">
                    Selecione o tema Cinema Dark para ver o preview Elite
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EMPTY STATE ─────────────────────────────────────────── */}
      {!selectedTheme && (
        <div className="py-20 text-center bg-dark-800/20 rounded-3xl border-2 border-dashed border-dark-700/50">
          <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
            <span className="text-3xl grayscale opacity-50">🎨</span>
          </div>
          <h3 className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Aguardando Seleção</h3>
          <p className="text-zinc-600 text-xs mt-1">Escolha um estilo acima para configurar sua arte</p>
        </div>
      )}
    </div>
  )
}

// ─── CONFIGURADOR DE FILMES ────────────────────────────────────────────────────
const FilmesConfigurator = ({ theme, contents, loading, onSearch, onMovieSelect, onGenerate }) => {
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
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
            {filtered.slice(0, 30).map(c => (
              <button
                key={c.id}
                onClick={() => handleSelect(c)}
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

export default BannerGenerator
