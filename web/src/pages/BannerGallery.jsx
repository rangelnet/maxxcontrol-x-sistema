import { useState, useEffect } from 'react'
import { Download, Eye, Search, Filter, Image, Trash2, Grid3x3, List, RefreshCw, PlusCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const BannerGallery = () => {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [selectedBanner, setSelectedBanner] = useState(null) // Modal de preview

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/banners/gallery')
      setBanners(res.data || [])
    } catch (error) {
      console.error('Erro ao carregar galeria:', error)
      // Demo data se API não existir
      setBanners(Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        name: `Banner_${String(i + 1).padStart(3, '0')}`,
        type: ['Futebol', 'Filmes', 'UFC', 'Divulgação', 'Basquete'][i % 5],
        created_at: new Date(Date.now() - i * 86400000).toISOString(),
        url: null,
        size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      })))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (bannerId) => {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return
    try {
      await api.delete(`/api/banners/${bannerId}`)
      setBanners(prev => prev.filter(b => b.id !== bannerId))
    } catch (err) {
      console.error('Erro ao excluir:', err)
    }
  }

  const filteredBanners = banners.filter(b =>
    b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.type?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const typeColors = {
    'Futebol': 'bg-green-500/10 text-green-400 border-green-500/20',
    'Filmes': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'UFC': 'bg-red-500/10 text-red-400 border-red-500/20',
    'Divulgação': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    'Basquete': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const BannerPlaceholder = ({ name, type }) => {
    const colors = {
      'Futebol': 'from-green-900/60 to-dark-900',
      'Filmes': 'from-purple-900/60 to-dark-900',
      'UFC': 'from-red-900/60 to-dark-900',
      'Divulgação': 'from-pink-900/60 to-dark-900',
      'Basquete': 'from-orange-900/60 to-dark-900',
    }
    const icons = {
      'Futebol': '⚽', 'Filmes': '🎬', 'UFC': '🥊', 'Divulgação': '📢', 'Basquete': '🏀',
    }
    return (
      <div className={`w-full h-full bg-gradient-to-b ${colors[type] || 'from-dark-700 to-dark-900'} flex flex-col items-center justify-center gap-2`}>
        <span className="text-4xl">{icons[type] || '🖼️'}</span>
        <span className="text-xs text-zinc-500 font-mono text-center px-2 truncate w-full text-center">{name}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ══════ HEADER ══════ */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Image size={22} className="text-brand-500" />
            Minha Galeria
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            {filteredBanners.length} banner{filteredBanners.length !== 1 ? 's' : ''} criado{filteredBanners.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadBanners}
            className="p-2 hover:bg-dark-700 rounded-lg transition text-zinc-400 hover:text-white border border-dark-700"
            title="Atualizar"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <Link
            to="/branding-banners"
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-brand-500/20"
          >
            <PlusCircle size={16} />
            Criar Novo
          </Link>
        </div>
      </div>

      {/* ══════ BARRA DE FILTROS ══════ */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
          <input
            type="text"
            placeholder="Buscar por nome ou tipo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-dark-800 border border-dark-700 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-zinc-600 focus:border-brand-500 focus:outline-none transition-colors"
          />
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-dark-800 border border-dark-700 rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-brand-500 text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            <Grid3x3 size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-brand-500 text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* ══════ LOADING ══════ */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-zinc-500">
          <RefreshCw size={24} className="animate-spin mr-3" />
          Carregando galeria...
        </div>
      )}

      {/* ══════ GRID VIEW ══════ */}
      {!loading && viewMode === 'grid' && (
        <>
          {filteredBanners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <Image size={40} className="mb-3 opacity-30" />
              <p className="text-sm">Nenhum banner encontrado.</p>
              <Link to="/branding-banners" className="mt-3 text-brand-400 text-sm hover:underline">
                Criar meu primeiro banner →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredBanners.map((banner) => (
                <div
                  key={banner.id}
                  className="bg-dark-800 rounded-xl overflow-hidden border border-dark-700 hover:border-brand-500/50 transition-all duration-300 group relative"
                >
                  {/* Thumbnail */}
                  <div className="aspect-[9/16] bg-black relative overflow-hidden group-hover:scale-[1.01] transition duration-300">
                    {banner.url ? (
                      <img
                        src={banner.url}
                        alt={banner.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <BannerPlaceholder name={banner.name} type={banner.type} />
                    )}

                    {/* Overlay de Ações */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-sm">
                      {banner.url && (
                        <a
                          href={banner.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white text-black h-11 w-11 rounded-full flex items-center justify-center hover:scale-110 transition shadow-lg"
                          title="Visualizar"
                        >
                          <Eye size={18} />
                        </a>
                      )}
                      {banner.url && (
                        <a
                          href={banner.url}
                          download={banner.name}
                          className="bg-brand-500 text-white h-11 w-11 rounded-full flex items-center justify-center hover:scale-110 transition shadow-lg"
                          title="Baixar"
                        >
                          <Download size={18} />
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="bg-red-600 text-white h-11 w-11 rounded-full flex items-center justify-center hover:scale-110 transition shadow-lg"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 bg-dark-800 border-t border-dark-700">
                    <p className="font-semibold text-xs text-white truncate mb-1" title={banner.name}>
                      {banner.name}
                    </p>
                    <div className="flex items-center justify-between">
                      {banner.type && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${typeColors[banner.type] || 'bg-dark-700 text-zinc-400 border-dark-600'}`}>
                          {banner.type}
                        </span>
                      )}
                      <p className="text-[10px] text-zinc-600">{formatDate(banner.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ══════ LIST VIEW ══════ */}
      {!loading && viewMode === 'list' && (
        <div className="space-y-2">
          {filteredBanners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <Image size={40} className="mb-3 opacity-30" />
              <p className="text-sm">Nenhum banner encontrado.</p>
            </div>
          ) : (
            filteredBanners.map((banner) => (
              <div
                key={banner.id}
                className="flex items-center gap-4 bg-dark-800 border border-dark-700 hover:border-dark-600 rounded-xl p-4 group transition-all"
              >
                {/* Mini thumb */}
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-dark-900 border border-dark-700 shrink-0">
                  {banner.url ? (
                    <img src={banner.url} alt={banner.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">🖼️</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white truncate">{banner.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {banner.type && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${typeColors[banner.type] || 'bg-dark-700 text-zinc-400 border-dark-600'}`}>
                        {banner.type}
                      </span>
                    )}
                    <span className="text-xs text-zinc-500">{formatDate(banner.created_at)}</span>
                    {banner.size && <span className="text-xs text-zinc-600">{banner.size}</span>}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {banner.url && (
                    <>
                      <a href={banner.url} target="_blank" rel="noopener noreferrer"
                        className="p-2 hover:bg-dark-700 rounded-lg transition text-zinc-400 hover:text-white" title="Visualizar">
                        <Eye size={16} />
                      </a>
                      <a href={banner.url} download={banner.name}
                        className="p-2 hover:bg-brand-500/20 rounded-lg transition text-brand-400 hover:text-brand-300" title="Baixar">
                        <Download size={16} />
                      </a>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition text-zinc-600 hover:text-red-400" title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  )
}

export default BannerGallery
