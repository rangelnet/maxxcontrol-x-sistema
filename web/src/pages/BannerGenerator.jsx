import { useState, useEffect } from 'react'
import { Image, Film, Trophy, Plus, Trash2, Eye, Download, Save } from 'lucide-react'
import api from '../services/api'

const BannerGenerator = () => {
  const [banners, setBanners] = useState([])
  const [contents, setContents] = useState([])
  const [recentContents, setRecentContents] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showContentList, setShowContentList] = useState(false)
  const [bannerType, setBannerType] = useState('movie')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Dados do banner de filme
  const [movieData, setMovieData] = useState({
    title: '',
    year: '2025',
    description: '',
    posterUrl: '',
    rating: 8,
    dubbed: true,
    isNew: true
  })
  
  // Dados do banner de futebol
  const [footballData, setFootballData] = useState({
    title: 'TABELA DE JOGOS',
    date: 'HOJE',
    matches: [
      { league: 'BRASILEIRÃO SÉRIE A', team1: 'FLAMENGO', team2: 'PALMEIRAS', time: '20:00' }
    ]
  })

  useEffect(() => {
    loadBanners()
    loadContents()
    loadRecentContents()
  }, [])

  const loadBanners = async () => {
    try {
      const response = await api.get('/api/banners/list')
      setBanners(response.data.banners)
    } catch (error) {
      console.error('Erro ao carregar banners:', error)
    }
  }

  const loadContents = async () => {
    try {
      const response = await api.get('/api/content/list?limit=100')
      setContents(response.data.conteudos || [])
    } catch (error) {
      console.error('Erro ao carregar conteúdos:', error)
    }
  }

  const loadRecentContents = async () => {
    try {
      const response = await api.get('/api/content/list?limit=10')
      setRecentContents(response.data.conteudos || [])
    } catch (error) {
      console.error('Erro ao carregar recentes:', error)
    }
  }

  const selectContent = (content) => {
    setMovieData({
      title: content.titulo,
      year: content.ano,
      description: content.descricao,
      posterUrl: content.poster_path ? `https://image.tmdb.org/t/p/w500${content.poster_path}` : '',
      rating: content.nota || 8,
      dubbed: true,
      isNew: false
    })
    setShowContentList(false)
  }

  const filteredContents = contents.filter(c => 
    c.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.titulo_original?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const searchTMDB = async (query) => {
    try {
      const response = await api.get(`/api/content/search?query=${query}`)
      if (response.data.results && response.data.results.length > 0) {
        const movie = response.data.results[0]
        setMovieData({
          ...movieData,
          title: movie.title || movie.name,
          year: movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0],
          description: movie.overview,
          posterUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          rating: movie.vote_average
        })
      }
    } catch (error) {
      console.error('Erro ao buscar no TMDB:', error)
    }
  }

  const generatePreview = async () => {
    setLoading(true)
    try {
      const data = bannerType === 'movie' ? movieData : footballData
      const response = await api.post('/api/banners/generate', {
        type: bannerType,
        data
      })
      
      if (response.data.success) {
        alert('✅ Banner configurado com sucesso!\n\nNota: A geração de imagem visual será implementada em breve.\nPor enquanto, os dados do banner foram salvos.')
      }
    } catch (error) {
      console.error('Erro ao gerar preview:', error)
      alert('Erro ao configurar banner')
    } finally {
      setLoading(false)
    }
  }

  const saveBanner = async () => {
    try {
      const data = bannerType === 'movie' ? movieData : footballData
      await api.post('/api/banners/create', {
        type: bannerType,
        title: data.title,
        data,
        template: bannerType
      })
      alert('Banner salvo com sucesso!')
      setShowModal(false)
      loadBanners()
    } catch (error) {
      console.error('Erro ao salvar banner:', error)
      alert('Erro ao salvar banner')
    }
  }

  const deleteBanner = async (id) => {
    if (!confirm('Deletar este banner?')) return
    
    try {
      await api.delete(`/api/banners/${id}`)
      loadBanners()
    } catch (error) {
      console.error('Erro ao deletar:', error)
    }
  }

  const addMatch = () => {
    setFootballData({
      ...footballData,
      matches: [...footballData.matches, { league: '', team1: '', team2: '', time: '' }]
    })
  }

  const updateMatch = (index, field, value) => {
    const newMatches = [...footballData.matches]
    newMatches[index][field] = value
    setFootballData({ ...footballData, matches: newMatches })
  }

  const removeMatch = (index) => {
    const newMatches = footballData.matches.filter((_, i) => i !== index)
    setFootballData({ ...footballData, matches: newMatches })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image className="text-primary" size={32} />
          <h1 className="text-3xl font-bold text-white">Gerador de Banners</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
        >
          <Plus size={20} />
          Novo Banner
        </button>
      </div>

      {/* Lista de Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-card rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">{banner.title}</h3>
              <button
                onClick={() => deleteBanner(banner.id)}
                className="text-red-500 hover:text-red-400"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div className="bg-dark rounded p-2 text-sm text-gray-400">
              Tipo: {banner.type === 'movie' ? 'Filme/Série' : 'Futebol'}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Criação */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-card rounded-lg p-6 max-w-4xl w-full mx-4 my-8 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Criar Banner</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            {/* Tipo de Banner */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setBannerType('movie')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                  bannerType === 'movie' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400'
                }`}
              >
                <Film size={20} />
                Filme/Série
              </button>
              <button
                onClick={() => setBannerType('football')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                  bannerType === 'football' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400'
                }`}
              >
                <Trophy size={20} />
                Futebol
              </button>
            </div>

            {/* Formulário de Filme */}
            {bannerType === 'movie' && (
              <div className="space-y-4">
                {/* Últimos Adicionados */}
                {recentContents.length > 0 && (
                  <div className="bg-dark rounded-lg p-4 border border-gray-700">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      ⚡ Últimos Adicionados
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {recentContents.map((content) => (
                        <button
                          key={content.id}
                          onClick={() => selectContent(content)}
                          className="group relative overflow-hidden rounded-lg hover:ring-2 hover:ring-primary transition-all"
                          title={content.titulo}
                        >
                          {content.poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w200${content.poster_path}`}
                              alt={content.titulo}
                              className="w-full h-40 object-cover"
                            />
                          ) : (
                            <div className="w-full h-40 bg-gray-800 flex items-center justify-center">
                              <span className="text-gray-600">Sem imagem</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                            <p className="text-white text-xs font-semibold line-clamp-2">{content.titulo}</p>
                          </div>
                          <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-yellow-500">
                            ⭐ {content.nota?.toFixed(1)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowContentList(!showContentList)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    📋 Ver Todos os Conteúdos ({contents.length})
                  </button>
                </div>

                {/* Lista de Conteúdos */}
                {showContentList && (
                  <div className="bg-dark rounded-lg p-4 max-h-96 overflow-y-auto border border-gray-700">
                    <input
                      type="text"
                      placeholder="Buscar conteúdo..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white mb-3"
                    />
                    
                    {filteredContents.length === 0 ? (
                      <p className="text-gray-400 text-center py-4">Nenhum conteúdo encontrado</p>
                    ) : (
                      <div className="space-y-2">
                        {filteredContents.map((content) => (
                          <button
                            key={content.id}
                            onClick={() => selectContent(content)}
                            className="w-full flex items-center gap-3 p-3 bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors text-left"
                          >
                            {content.poster_path && (
                              <img
                                src={`https://image.tmdb.org/t/p/w92${content.poster_path}`}
                                alt={content.titulo}
                                className="w-12 h-16 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <p className="text-white font-semibold">{content.titulo}</p>
                              <p className="text-gray-400 text-sm">
                                {content.tipo === 'filme' ? '🎬 Filme' : '📺 Série'} • {content.ano}
                              </p>
                            </div>
                            <span className="text-yellow-500">⭐ {content.nota?.toFixed(1)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ou buscar no TMDB
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Digite o nome do filme/série"
                      className="flex-1 px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white"
                      onKeyPress={(e) => e.key === 'Enter' && searchTMDB(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Título</label>
                    <input
                      type="text"
                      value={movieData.title}
                      onChange={(e) => setMovieData({ ...movieData, title: e.target.value })}
                      className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Ano</label>
                    <input
                      type="text"
                      value={movieData.year}
                      onChange={(e) => setMovieData({ ...movieData, year: e.target.value })}
                      className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                  <textarea
                    value={movieData.description}
                    onChange={(e) => setMovieData({ ...movieData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">URL do Poster</label>
                  <input
                    type="text"
                    value={movieData.posterUrl}
                    onChange={(e) => setMovieData({ ...movieData, posterUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white"
                  />
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-white">
                    <input
                      type="checkbox"
                      checked={movieData.dubbed}
                      onChange={(e) => setMovieData({ ...movieData, dubbed: e.target.checked })}
                    />
                    Dublado
                  </label>
                  <label className="flex items-center gap-2 text-white">
                    <input
                      type="checkbox"
                      checked={movieData.isNew}
                      onChange={(e) => setMovieData({ ...movieData, isNew: e.target.checked })}
                    />
                    Lançamento
                  </label>
                </div>
              </div>
            )}

            {/* Formulário de Futebol */}
            {bannerType === 'football' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Título</label>
                    <input
                      type="text"
                      value={footballData.title}
                      onChange={(e) => setFootballData({ ...footballData, title: e.target.value })}
                      className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Data</label>
                    <input
                      type="text"
                      value={footballData.date}
                      onChange={(e) => setFootballData({ ...footballData, date: e.target.value })}
                      className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">Jogos</label>
                    <button
                      onClick={addMatch}
                      className="flex items-center gap-1 px-3 py-1 bg-primary text-white rounded text-sm"
                    >
                      <Plus size={16} />
                      Adicionar Jogo
                    </button>
                  </div>

                  {footballData.matches.map((match, index) => (
                    <div key={index} className="bg-dark p-4 rounded-lg space-y-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold">Jogo {index + 1}</span>
                        <button
                          onClick={() => removeMatch(index)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Campeonato"
                        value={match.league}
                        onChange={(e) => updateMatch(index, 'league', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Time 1"
                          value={match.team1}
                          onChange={(e) => updateMatch(index, 'team1', e.target.value)}
                          className="px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Time 2"
                          value={match.team2}
                          onChange={(e) => updateMatch(index, 'team2', e.target.value)}
                          className="px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Horário"
                          value={match.time}
                          onChange={(e) => updateMatch(index, 'time', e.target.value)}
                          className="px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview */}
            {preview && (
              <div className="mt-6">
                <h3 className="text-white font-semibold mb-3">Preview:</h3>
                <img src={preview} alt="Preview" className="w-full rounded-lg border border-gray-700" />
              </div>
            )}

            {/* Aviso temporário */}
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-400 text-sm">
                ℹ️ A geração visual de banners será implementada em breve. Por enquanto, você pode configurar e salvar os dados dos banners.
              </p>
            </div>

            {/* Ações */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={saveBanner}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
              >
                <Save size={20} />
                Salvar Banner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BannerGenerator
