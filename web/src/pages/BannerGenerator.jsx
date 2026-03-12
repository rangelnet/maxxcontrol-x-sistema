import { useState, useEffect, useRef } from 'react'
import { Image, Film, Trophy, Plus, Trash2, Eye, Download, Save, X } from 'lucide-react'
import api from '../services/api'

const BannerGenerator = () => {
  const [banners, setBanners] = useState([])
  const [contents, setContents] = useState([])
  const [recentContents, setRecentContents] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showContentList, setShowContentList] = useState(false)
  const [showSizeSelector, setShowSizeSelector] = useState(false)
  const [selectedContent, setSelectedContent] = useState(null)
  const [bannerType, setBannerType] = useState('movie')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSize, setSelectedSize] = useState('banner')
  const [selectedPlatforms, setSelectedPlatforms] = useState(['tv', 'mobile'])
  const canvasRef = useRef(null)

  // Tamanhos disponíveis
  const sizes = {
    'cartaz': { width: 1080, height: 1920, name: 'Cartaz (Portrait)', icon: '📱' },
    'banner': { width: 1920, height: 1080, name: 'Banner (Landscape)', icon: '🖥️' },
    'stories': { width: 1080, height: 1920, name: 'Stories', icon: '📲' },
    'post': { width: 1080, height: 1080, name: 'Post Quadrado', icon: '⬛' },
    'facebook': { width: 820, height: 312, name: 'Capa Facebook', icon: '📘' },
    'youtube': { width: 1280, height: 720, name: 'Thumbnail YouTube', icon: '▶️' }
  }

  // Ícones de plataformas
  const platformIcons = {
    'tv': { icon: '📺', name: 'TV Box' },
    'notebook': { icon: '💻', name: 'Notebook' },
    'mobile': { icon: '📱', name: 'Celular' },
    'xbox': { icon: '🎮', name: 'Xbox' },
    'chromecast': { icon: '📡', name: 'Chromecast' },
    'smart': { icon: '🖥️', name: 'Smart TV' }
  }
  
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
      setBanners(response.data.banners || [])
    } catch (error) {
      console.error('Erro ao carregar banners:', error)
      setError('Erro ao carregar banners: ' + (error.response?.data?.error || error.message))
    }
  }

  const loadContents = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/content/list?limit=100')
      setContents(response.data.conteudos || [])
      setError(null)
    } catch (error) {
      console.error('Erro ao carregar conteúdos:', error)
      setError('Erro ao carregar conteúdos: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  const loadRecentContents = async () => {
    try {
      const response = await api.get('/api/content/list?limit=10')
      setRecentContents(response.data.conteudos || [])
    } catch (error) {
      console.error('Erro ao carregar recentes:', error)
      // Não mostra erro para recentes, apenas loga
    }
  }

  const openSizeSelector = (content) => {
    setSelectedContent(content)
    setShowSizeSelector(true)
  }

  const generateAndDownload = async (size) => {
    if (!selectedContent) return
    
    setLoading(true)
    try {
      const sizeConfig = sizes[size]
      const canvas = document.createElement('canvas')
      canvas.width = sizeConfig.width
      canvas.height = sizeConfig.height
      const ctx = canvas.getContext('2d')

      // Preparar dados do conteúdo
      const isPortrait = ['cartaz', 'stories'].includes(size)
      let imageUrl = ''
      
      if (isPortrait && selectedContent.poster_path) {
        imageUrl = `https://image.tmdb.org/t/p/original${selectedContent.poster_path}`
      } else if (selectedContent.backdrop_path) {
        imageUrl = `https://image.tmdb.org/t/p/original${selectedContent.backdrop_path}`
      } else if (selectedContent.poster_path) {
        imageUrl = `https://image.tmdb.org/t/p/original${selectedContent.poster_path}`
      }

      const movieData = {
        title: selectedContent.titulo,
        year: selectedContent.ano,
        description: selectedContent.descricao,
        posterUrl: imageUrl,
        rating: selectedContent.nota || 8,
        dubbed: true,
        isNew: false
      }

      // Gerar banner
      await generateMovieBannerDirect(ctx, canvas, sizeConfig, movieData)

      // Download direto
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `${selectedContent.titulo.replace(/[^a-z0-9]/gi, '_')}_${sizeConfig.name.replace(/\s+/g, '_')}.png`
      link.href = dataUrl
      link.click()

      setShowSizeSelector(false)
      setSelectedContent(null)
    } catch (error) {
      console.error('Erro ao gerar banner:', error)
      alert('Erro ao gerar banner')
    } finally {
      setLoading(false)
    }
  }

  const generateMovieBannerDirect = async (ctx, canvas, sizeConfig, data) => {
    const { width, height } = sizeConfig
    const isPortrait = height > width
    const scale = width / 1920

    // Fundo gradiente
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#0a0a0a')
    gradient.addColorStop(1, '#1a1a2e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Carregar imagem
    if (data.posterUrl) {
      try {
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = data.posterUrl
        })

        if (isPortrait) {
          const imgHeight = height * 0.6
          const imgWidth = width * 0.9
          const x = (width - imgWidth) / 2
          ctx.drawImage(img, x, 50 * scale, imgWidth, imgHeight)
        } else {
          const imgWidth = width * 0.4
          const imgHeight = height * 0.8
          const x = width - imgWidth - 50 * scale
          const y = (height - imgHeight) / 2
          ctx.drawImage(img, x, y, imgWidth, imgHeight)
        }
      } catch (err) {
        console.error('Erro ao carregar imagem:', err)
      }
    }

    const textX = isPortrait ? width * 0.1 : width * 0.05
    const textY = isPortrait ? height * 0.65 : height * 0.15
    const maxTextWidth = isPortrait ? width * 0.8 : width * 0.5

    // Título
    ctx.fillStyle = '#FF6A00'
    ctx.font = `bold ${Math.floor(60 * scale)}px Arial`
    ctx.fillText(data.title || 'Título', textX, textY)

    // Ano
    ctx.fillStyle = '#ffffff'
    ctx.font = `${Math.floor(30 * scale)}px Arial`
    ctx.fillText(`(${data.year || '2025'})`, textX, textY + 50 * scale)

    // Descrição
    ctx.fillStyle = '#cccccc'
    ctx.font = `${Math.floor(24 * scale)}px Arial`
    wrapText(ctx, data.description || 'Descrição', textX, textY + 100 * scale, maxTextWidth, 35 * scale)

    // Rating
    if (data.rating) {
      const stars = Math.round(data.rating / 2)
      ctx.fillStyle = '#FFD700'
      ctx.font = `${Math.floor(40 * scale)}px Arial`
      const ratingY = isPortrait ? height * 0.85 : height * 0.65
      ctx.fillText('★'.repeat(stars) + '☆'.repeat(5 - stars), textX, ratingY)
    }

    // Badges
    const badgeY = 30 * scale
    if (data.dubbed) {
      drawBadge(ctx, 'DUBLADO', textX, badgeY, '#00AA00', scale)
    }

    // Ícones de plataformas
    drawPlatformIcons(ctx, width, height, scale)
  }

  const selectContent = (content) => {
    // Escolher imagem baseada no tamanho selecionado
    let imageUrl = ''
    const isPortrait = ['cartaz', 'stories'].includes(selectedSize)
    
    if (isPortrait && content.poster_path) {
      // Para formatos verticais, usar poster
      imageUrl = `https://image.tmdb.org/t/p/original${content.poster_path}`
    } else if (content.backdrop_path) {
      // Para formatos horizontais, usar backdrop
      imageUrl = `https://image.tmdb.org/t/p/original${content.backdrop_path}`
    } else if (content.poster_path) {
      // Fallback para poster
      imageUrl = `https://image.tmdb.org/t/p/original${content.poster_path}`
    }
    
    setMovieData({
      title: content.titulo,
      year: content.ano,
      description: content.descricao,
      posterUrl: imageUrl,
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
    if (!query.trim()) return
    
    try {
      const response = await api.get(`/api/content/search?query=${query}`)
      if (response.data.results && response.data.results.length > 0) {
        const movie = response.data.results[0]
        
        // Escolher imagem baseada no tamanho selecionado
        let imageUrl = ''
        const isPortrait = ['cartaz', 'stories'].includes(selectedSize)
        
        if (isPortrait && movie.poster_path) {
          // Para formatos verticais, usar poster
          imageUrl = `https://image.tmdb.org/t/p/original${movie.poster_path}`
        } else if (movie.backdrop_path) {
          // Para formatos horizontais, usar backdrop
          imageUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        } else if (movie.poster_path) {
          // Fallback para poster
          imageUrl = `https://image.tmdb.org/t/p/original${movie.poster_path}`
        }
        
        setMovieData({
          ...movieData,
          title: movie.title || movie.name,
          year: movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0],
          description: movie.overview,
          posterUrl: imageUrl,
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
      const sizeConfig = sizes[selectedSize]
      const canvas = document.createElement('canvas')
      canvas.width = sizeConfig.width
      canvas.height = sizeConfig.height
      const ctx = canvas.getContext('2d')

      if (bannerType === 'movie') {
        await generateMovieBanner(ctx, canvas, sizeConfig)
      } else {
        await generateFootballBanner(ctx, canvas, sizeConfig)
      }

      const dataUrl = canvas.toDataURL('image/png')
      setPreview(dataUrl)
      setShowPreviewModal(true)
    } catch (error) {
      console.error('Erro ao gerar preview:', error)
      alert('Erro ao gerar preview')
    } finally {
      setLoading(false)
    }
  }

  const generateMovieBanner = async (ctx, canvas, sizeConfig) => {
    const { width, height } = sizeConfig
    const isPortrait = height > width
    const scale = width / 1920 // Escala para adaptar elementos

    // Fundo gradiente
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#0a0a0a')
    gradient.addColorStop(1, '#1a1a2e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Carregar poster/backdrop
    if (movieData.posterUrl) {
      try {
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = movieData.posterUrl
        })

        if (isPortrait) {
          // Layout vertical - imagem no topo
          const imgHeight = height * 0.6
          const imgWidth = width * 0.9
          const x = (width - imgWidth) / 2
          ctx.drawImage(img, x, 50 * scale, imgWidth, imgHeight)
        } else {
          // Layout horizontal - imagem na direita
          const imgWidth = width * 0.4
          const imgHeight = height * 0.8
          const x = width - imgWidth - 50 * scale
          const y = (height - imgHeight) / 2
          ctx.drawImage(img, x, y, imgWidth, imgHeight)
        }
      } catch (err) {
        console.error('Erro ao carregar imagem:', err)
      }
    }

    // Posições adaptadas ao layout
    const textX = isPortrait ? width * 0.1 : width * 0.05
    const textY = isPortrait ? height * 0.65 : height * 0.15
    const maxTextWidth = isPortrait ? width * 0.8 : width * 0.5

    // Título
    ctx.fillStyle = '#FF6A00'
    ctx.font = `bold ${Math.floor(60 * scale)}px Arial`
    ctx.fillText(movieData.title || 'Título', textX, textY)

    // Ano
    ctx.fillStyle = '#ffffff'
    ctx.font = `${Math.floor(30 * scale)}px Arial`
    ctx.fillText(`(${movieData.year || '2025'})`, textX, textY + 50 * scale)

    // Descrição
    ctx.fillStyle = '#cccccc'
    ctx.font = `${Math.floor(24 * scale)}px Arial`
    wrapText(ctx, movieData.description || 'Descrição', textX, textY + 100 * scale, maxTextWidth, 35 * scale)

    // Rating
    if (movieData.rating) {
      const stars = Math.round(movieData.rating / 2)
      ctx.fillStyle = '#FFD700'
      ctx.font = `${Math.floor(40 * scale)}px Arial`
      const ratingY = isPortrait ? height * 0.85 : height * 0.65
      ctx.fillText('★'.repeat(stars) + '☆'.repeat(5 - stars), textX, ratingY)
    }

    // Badges
    const badgeY = 30 * scale
    if (movieData.dubbed) {
      drawBadge(ctx, 'DUBLADO', textX, badgeY, '#00AA00', scale)
    }
    if (movieData.isNew) {
      drawBadge(ctx, 'LANÇAMENTO', textX + 220 * scale, badgeY, '#FF6A00', scale)
    }

    // Ícones de plataformas no rodapé
    drawPlatformIcons(ctx, width, height, scale)
  }

  const generateFootballBanner = async (ctx, canvas, sizeConfig) => {
    const { width, height } = sizeConfig
    const scale = width / 1920

    // Fundo gradiente de fogo
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#1a0000')
    gradient.addColorStop(0.5, '#330000')
    gradient.addColorStop(1, '#1a0000')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Título
    ctx.fillStyle = '#ffffff'
    ctx.font = `bold ${Math.floor(50 * scale)}px Arial`
    ctx.textAlign = 'center'
    ctx.fillText(footballData.title || 'TABELA DE JOGOS', width / 2, 80 * scale)

    // Data
    ctx.fillStyle = '#FF6A00'
    ctx.font = `bold ${Math.floor(35 * scale)}px Arial`
    ctx.fillText(footballData.date || 'HOJE', width / 2, 140 * scale)

    // Jogos
    let yPos = 200 * scale
    const matchHeight = 120 * scale
    footballData.matches.forEach((match) => {
      drawMatch(ctx, match, yPos, width, scale)
      yPos += matchHeight + 20 * scale
    })

    // Ícones de plataformas no rodapé
    drawPlatformIcons(ctx, width, height, scale)
  }

  const drawMatch = (ctx, match, y, width, scale) => {
    const centerX = width / 2
    const boxWidth = width * 0.8
    const boxX = (width - boxWidth) / 2

    // Box da partida
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.fillRect(boxX, y, boxWidth, 100 * scale)

    // Campeonato
    ctx.fillStyle = '#cccccc'
    ctx.font = `bold ${Math.floor(20 * scale)}px Arial`
    ctx.textAlign = 'center'
    ctx.fillText(match.league || 'CAMPEONATO', centerX, y + 30 * scale)

    // Time 1
    ctx.fillStyle = '#ffffff'
    ctx.font = `bold ${Math.floor(28 * scale)}px Arial`
    ctx.textAlign = 'right'
    ctx.fillText(match.team1 || 'TIME 1', centerX - 80 * scale, y + 70 * scale)

    // VS
    ctx.fillStyle = '#FF6A00'
    ctx.font = `bold ${Math.floor(35 * scale)}px Arial`
    ctx.textAlign = 'center'
    ctx.fillText('VS', centerX, y + 70 * scale)

    // Time 2
    ctx.fillStyle = '#ffffff'
    ctx.font = `bold ${Math.floor(28 * scale)}px Arial`
    ctx.textAlign = 'left'
    ctx.fillText(match.team2 || 'TIME 2', centerX + 80 * scale, y + 70 * scale)

    // Horário
    ctx.fillStyle = '#FFD700'
    ctx.font = `bold ${Math.floor(25 * scale)}px Arial`
    ctx.textAlign = 'center'
    ctx.fillText(match.time || '20:00', boxX + boxWidth - 80 * scale, y + 70 * scale)
  }

  const drawBadge = (ctx, text, x, y, color, scale = 1) => {
    const badgeWidth = 180 * scale
    const badgeHeight = 50 * scale
    
    ctx.fillStyle = color
    ctx.fillRect(x, y, badgeWidth, badgeHeight)
    ctx.fillStyle = '#ffffff'
    ctx.font = `bold ${Math.floor(20 * scale)}px Arial`
    ctx.textAlign = 'center'
    ctx.fillText(text, x + badgeWidth / 2, y + badgeHeight / 2 + 8 * scale)
    ctx.textAlign = 'left'
  }

  const drawPlatformIcons = (ctx, width, height, scale) => {
    if (selectedPlatforms.length === 0) return

    const iconSize = 40 * scale
    const spacing = 60 * scale
    const totalWidth = selectedPlatforms.length * spacing
    const startX = (width - totalWidth) / 2
    const y = height - 60 * scale

    ctx.font = `${Math.floor(iconSize)}px Arial`
    ctx.textAlign = 'center'

    selectedPlatforms.forEach((platform, index) => {
      const x = startX + index * spacing + spacing / 2
      const platformData = platformIcons[platform]
      
      if (platformData) {
        // Ícone
        ctx.fillText(platformData.icon, x, y)
        
        // Nome (opcional, apenas se houver espaço)
        if (scale >= 0.5) {
          ctx.font = `${Math.floor(12 * scale)}px Arial`
          ctx.fillStyle = '#888888'
          ctx.fillText(platformData.name, x, y + 25 * scale)
          ctx.font = `${Math.floor(iconSize)}px Arial`
          ctx.fillStyle = '#ffffff'
        }
      }
    })

    ctx.textAlign = 'left'
  }

  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ')
    let line = ''
    let lineCount = 0

    for (let i = 0; i < words.length && lineCount < 5; i++) {
      const testLine = line + words[i] + ' '
      const metrics = ctx.measureText(testLine)

      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, x, y)
        line = words[i] + ' '
        y += lineHeight
        lineCount++
      } else {
        line = testLine
      }
    }

    if (lineCount < 5) {
      ctx.fillText(line, x, y)
    }
  }

  const downloadBanner = () => {
    if (!preview) return
    
    const sizeConfig = sizes[selectedSize]
    const link = document.createElement('a')
    link.download = `banner_${sizeConfig.name.replace(/\s+/g, '_')}_${Date.now()}.png`
    link.href = preview
    link.click()
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
          Criar Personalizado
        </button>
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-red-500 text-xl">⚠️</div>
            <div className="flex-1">
              <h3 className="text-red-500 font-bold mb-1">Erro ao carregar dados</h3>
              <p className="text-red-300 text-sm">{error}</p>
              <button
                onClick={() => {
                  setError(null)
                  loadContents()
                  loadBanners()
                }}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Inicial */}
      {loading && contents.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-white text-lg">Carregando conteúdos...</p>
        </div>
      )}

      {/* Mensagem quando não há conteúdos */}
      {!loading && contents.length === 0 && recentContents.length === 0 && !error && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-white font-bold text-xl mb-2">Nenhum conteúdo disponível</h3>
          <p className="text-gray-400 mb-4">
            Importe filmes e séries do TMDB para começar a gerar banners
          </p>
          <button
            onClick={() => window.location.href = '/content'}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
          >
            Ir para Conteúdos
          </button>
        </div>
      )}

      {/* Galeria de Conteúdos - ÚLTIMAS SÉRIES ADICIONADAS */}
      {recentContents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-primary">⚡ ÚLTIMAS SÉRIES ADICIONADAS</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {recentContents.map((content) => (
              <button
                key={content.id}
                onClick={() => openSizeSelector(content)}
                className="group relative overflow-hidden rounded-lg hover:ring-2 hover:ring-primary transition-all transform hover:scale-105"
                title={`Clique para gerar banner de ${content.titulo}`}
              >
                {content.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${content.poster_path}`}
                    alt={content.titulo}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-600">Sem imagem</span>
                  </div>
                )}
                
                {/* Overlay com info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <p className="text-white text-sm font-bold line-clamp-2 mb-1">{content.titulo}</p>
                  <p className="text-gray-300 text-xs">{content.ano}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {content.nota && <span className="text-yellow-500 text-xs">⭐ {(parseFloat(content.nota) || 0).toFixed(1)}</span>}
                    <span className="text-primary text-xs font-semibold">Clique para gerar</span>
                  </div>
                </div>

                {/* Badge de rating */}
                {content.nota && (
                  <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-yellow-500 font-bold">
                    ⭐ {(parseFloat(content.nota) || 0).toFixed(1)}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Galeria de Todos os Conteúdos */}
      {contents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">📚 TODOS OS CONTEÚDOS</h2>
            <input
              type="text"
              placeholder="🔍 Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white w-64"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {contents
              .filter(c => 
                c.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.titulo_original?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((content) => (
                <button
                  key={content.id}
                  onClick={() => openSizeSelector(content)}
                  className="group relative overflow-hidden rounded-lg hover:ring-2 hover:ring-primary transition-all transform hover:scale-105"
                  title={`Clique para gerar banner de ${content.titulo}`}
                >
                  {content.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${content.poster_path}`}
                      alt={content.titulo}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-600">Sem imagem</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <p className="text-white text-sm font-bold line-clamp-2 mb-1">{content.titulo}</p>
                    <p className="text-gray-300 text-xs">{content.ano}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {content.nota && <span className="text-yellow-500 text-xs">⭐ {(parseFloat(content.nota) || 0).toFixed(1)}</span>}
                      <span className="text-primary text-xs font-semibold">Clique para gerar</span>
                    </div>
                  </div>

                  {content.nota && (
                    <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-yellow-500 font-bold">
                      ⭐ {(parseFloat(content.nota) || 0).toFixed(1)}
                    </div>
                  )}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Modal de Seleção de Tamanho */}
      {showSizeSelector && selectedContent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-4xl w-full border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedContent.titulo}</h2>
                <p className="text-gray-400">{selectedContent.ano}{selectedContent.nota && ` • ⭐ ${(selectedContent.nota || 0).toFixed(1)}`}</p>
              </div>
              <button 
                onClick={() => {
                  setShowSizeSelector(false)
                  setSelectedContent(null)
                }} 
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            {/* Preview do Conteúdo */}
            <div className="mb-6 flex gap-4">
              {selectedContent.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w200${selectedContent.poster_path}`}
                  alt={selectedContent.titulo}
                  className="w-32 h-48 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <p className="text-gray-300 text-sm line-clamp-4">{selectedContent.descricao}</p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-4">📐 Escolha o tamanho do banner:</h3>

            {/* Grid de Tamanhos */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {Object.entries(sizes).map(([key, size]) => (
                <button
                  key={key}
                  onClick={() => generateAndDownload(key)}
                  disabled={loading}
                  className="flex flex-col items-center gap-3 p-4 rounded-lg bg-gray-800 hover:bg-primary hover:ring-2 hover:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <span className="text-4xl">{size.icon}</span>
                  <div className="text-center">
                    <p className="text-white font-semibold group-hover:text-white">{size.name}</p>
                    <p className="text-xs text-gray-400 group-hover:text-gray-200">{size.width}x{size.height}</p>
                  </div>
                  <Download size={20} className="text-primary group-hover:text-white" />
                </button>
              ))}
            </div>

            {loading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                <p className="text-white mt-2">Gerando banner...</p>
              </div>
            )}

            {/* Seletor de Plataformas */}
            <div className="border-t border-gray-700 pt-4">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                🎮 Plataformas que aparecerão no rodapé:
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {Object.entries(platformIcons).map(([key, platform]) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (selectedPlatforms.includes(key)) {
                        setSelectedPlatforms(selectedPlatforms.filter(p => p !== key))
                      } else {
                        setSelectedPlatforms([...selectedPlatforms, key])
                      }
                    }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                      selectedPlatforms.includes(key)
                        ? 'bg-primary text-white ring-2 ring-primary'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-xl">{platform.icon}</span>
                    <span className="text-xs">{platform.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação Personalizada */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-card rounded-lg p-6 max-w-4xl w-full mx-4 my-8 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Criar Banner</h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={28} />
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

            {/* Seletor de Tamanho */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                📐 Tamanho do Banner
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(sizes).map(([key, size]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedSize(key)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                      selectedSize === key 
                        ? 'bg-primary text-white ring-2 ring-primary' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-2xl">{size.icon}</span>
                    <span className="text-xs font-semibold text-center">{size.name}</span>
                    <span className="text-xs opacity-70">{size.width}x{size.height}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Seletor de Plataformas */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                🎮 Plataformas (aparecerão no rodapé)
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {Object.entries(platformIcons).map(([key, platform]) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (selectedPlatforms.includes(key)) {
                        setSelectedPlatforms(selectedPlatforms.filter(p => p !== key))
                      } else {
                        setSelectedPlatforms([...selectedPlatforms, key])
                      }
                    }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                      selectedPlatforms.includes(key)
                        ? 'bg-primary text-white ring-2 ring-primary'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-xl">{platform.icon}</span>
                    <span className="text-xs">{platform.name}</span>
                  </button>
                ))}
              </div>
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
                            ⭐ {content.nota ? content.nota.toFixed(1) : 'N/A'}
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
                            <span className="text-yellow-500">⭐ {content.nota ? content.nota.toFixed(1) : 'N/A'}</span>
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
                      placeholder="Digite o nome do filme/série e aperte Enter"
                      className="flex-1 px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          searchTMDB(e.target.value)
                          e.target.value = ''
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Dica: A busca usa imagens em alta qualidade do TMDB. Para formatos verticais (Cartaz/Stories) usa poster, para horizontais usa backdrop.
                  </p>
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
            {preview && !showPreviewModal && (
              <div className="mt-6">
                <h3 className="text-white font-semibold mb-3">Preview:</h3>
                <div className="relative">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-full rounded-lg border border-gray-700 cursor-pointer hover:border-primary transition-colors" 
                    onClick={() => setShowPreviewModal(true)}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50 rounded-lg cursor-pointer" onClick={() => setShowPreviewModal(true)}>
                    <Eye size={48} className="text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={generatePreview}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <Eye size={20} />
                {loading ? 'Gerando...' : 'Gerar Preview'}
              </button>
              
              {preview && (
                <button
                  onClick={downloadBanner}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download size={20} />
                  Baixar
                </button>
              )}
              
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

      {/* Modal de Preview do Banner */}
      {showPreviewModal && preview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-7xl w-full">
            {/* Botão Fechar */}
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-primary transition-colors flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg"
            >
              <X size={24} />
              Fechar
            </button>

            {/* Banner Preview */}
            <div className="bg-dark rounded-lg p-4 border border-gray-800">
              <img 
                src={preview} 
                alt="Preview do Banner" 
                className="w-full rounded-lg shadow-2xl"
              />
              
              {/* Ações */}
              <div className="flex gap-3 mt-4 justify-center">
                <button
                  onClick={downloadBanner}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download size={20} />
                  Baixar Banner
                </button>
                
                <button
                  onClick={() => {
                    saveBanner()
                    setShowPreviewModal(false)
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                >
                  <Save size={20} />
                  Salvar e Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BannerGenerator
