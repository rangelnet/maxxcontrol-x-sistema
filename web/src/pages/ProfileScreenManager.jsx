import { useState, useEffect, useCallback } from 'react'
import { Upload, Trash2, Eye, EyeOff, GripVertical, Clock, Film, Shuffle, ArrowUp, ArrowDown, Image, Settings2, Monitor } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '')

const ProfileScreenManager = () => {
  const [config, setConfig] = useState({
    slide_interval_ms: 5000,
    use_tmdb: true,
    tmdb_position: 'mixed'
  })
  const [backgrounds, setBackgrounds] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dragFile, setDragFile] = useState(false)
  const [uploadTitle, setUploadTitle] = useState('')

  const token = localStorage.getItem('token')

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/branding/profile-screen`)
      const data = await res.json()
      if (data.config) setConfig(data.config)
      if (data.backgrounds) setBackgrounds(data.backgrounds)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSaveConfig = async () => {
    setSaving(true)
    try {
      await fetch(`${API}/api/branding/profile-screen/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(config)
      })
    } catch (err) {
      console.error('Erro ao salvar config:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleUpload = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('title', uploadTitle || file.name.replace(/\.[^.]+$/, ''))

      const res = await fetch(`${API}/api/branding/profile-screen/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Erro no upload')
        return
      }
      setUploadTitle('')
      fetchData()
    } catch (err) {
      console.error('Erro no upload:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async (id) => {
    if (!confirm('Remover esta imagem de fundo?')) return
    try {
      await fetch(`${API}/api/branding/profile-screen/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchData()
    } catch (err) {
      console.error('Erro ao remover:', err)
    }
  }

  const handleToggle = async (id) => {
    try {
      await fetch(`${API}/api/branding/profile-screen/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchData()
    } catch (err) {
      console.error('Erro ao toggle:', err)
    }
  }

  const handleReorder = async (idx, direction) => {
    const newBgs = [...backgrounds]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= newBgs.length) return

    const tempOrdem = newBgs[idx].ordem
    newBgs[idx].ordem = newBgs[swapIdx].ordem
    newBgs[swapIdx].ordem = tempOrdem;
    [newBgs[idx], newBgs[swapIdx]] = [newBgs[swapIdx], newBgs[idx]]

    setBackgrounds(newBgs)
    try {
      await fetch(`${API}/api/branding/profile-screen/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items: newBgs.map((bg, i) => ({ id: bg.id, ordem: i })) })
      })
    } catch (err) {
      console.error('Erro ao reordenar:', err)
    }
  }

  const intervalSec = (config.slide_interval_ms || 5000) / 1000
  const activeCount = backgrounds.filter(b => b.ativo).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <Monitor className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Tela de Perfis</h2>
            <p className="text-zinc-500 text-xs">Gerencie os fundos e o slideshow da tela de seleção de perfis</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500">{activeCount} ativas</span>
          <span className="text-zinc-700">•</span>
          <span className="text-zinc-500">{backgrounds.length}/20 total</span>
        </div>
      </div>

      {/* ═══ CONFIG DO SLIDESHOW ═══ */}
      <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Settings2 className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-bold text-white">Configuração do Slideshow</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tempo de transição */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Tempo de Transição
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1000}
                max={30000}
                step={1000}
                value={config.slide_interval_ms}
                onChange={e => setConfig(prev => ({ ...prev, slide_interval_ms: parseInt(e.target.value) }))}
                className="flex-1 accent-brand-500"
              />
              <span className="text-white font-black text-lg w-12 text-right">{intervalSec}s</span>
            </div>
          </div>

          {/* Toggle TMDB */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 font-semibold flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5" /> Imagens TMDB
            </label>
            <button
              onClick={() => setConfig(prev => ({ ...prev, use_tmdb: !prev.use_tmdb }))}
              className={`w-full py-2.5 px-4 rounded-xl border-2 text-sm font-bold transition-all
                ${config.use_tmdb
                  ? 'bg-green-500/10 border-green-500/40 text-green-400'
                  : 'bg-dark-900 border-dark-600 text-zinc-500'
                }`}
            >
              {config.use_tmdb ? '✅ TMDB Ativado' : '❌ TMDB Desativado'}
            </button>
          </div>

          {/* Modo de intercalação */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 font-semibold flex items-center gap-1.5">
              <Shuffle className="w-3.5 h-3.5" /> Modo de Intercalação
            </label>
            <select
              value={config.tmdb_position}
              onChange={e => setConfig(prev => ({ ...prev, tmdb_position: e.target.value }))}
              disabled={!config.use_tmdb}
              className="w-full bg-dark-900 border-2 border-dark-600 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:border-brand-500 outline-none disabled:opacity-40"
            >
              <option value="mixed">🔀 Misturadas</option>
              <option value="first">⬆️ TMDB Primeiro</option>
              <option value="last">⬇️ TMDB Por Último</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSaveConfig}
          disabled={saving}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all disabled:opacity-50"
        >
          {saving ? 'Salvando...' : '💾 Salvar Configuração'}
        </button>
      </div>

      {/* ═══ UPLOAD ═══ */}
      <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-bold text-white">Adicionar Imagem de Fundo</h3>
          <span className="text-[10px] text-zinc-600 ml-auto">JPG, PNG, WebP • Máx 5MB</span>
        </div>

        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <label className="text-[10px] text-zinc-500 font-semibold uppercase">Título (opcional)</label>
            <input
              type="text"
              value={uploadTitle}
              onChange={e => setUploadTitle(e.target.value)}
              placeholder="Ex: Banner Maxx, Promo Verão..."
              className="w-full bg-dark-900 border-2 border-dark-600 rounded-xl px-3 py-2 text-sm text-white focus:border-brand-500 outline-none"
            />
          </div>
          <label
            onDragOver={e => { e.preventDefault(); setDragFile(true) }}
            onDragLeave={() => setDragFile(false)}
            onDrop={e => { e.preventDefault(); setDragFile(false); handleUpload(e.dataTransfer.files[0]) }}
            className={`relative cursor-pointer flex items-center gap-2 px-5 py-2 rounded-xl border-2 border-dashed transition-all
              ${dragFile ? 'border-brand-500 bg-brand-500/10' : 'border-dark-600 hover:border-brand-500/50'}
              ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={e => handleUpload(e.target.files[0])}
              disabled={uploading || backgrounds.length >= 20}
            />
            {uploading ? (
              <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4 text-brand-400" />
            )}
            <span className="text-sm font-bold text-zinc-300">
              {uploading ? 'Enviando...' : backgrounds.length >= 20 ? 'Limite atingido (20)' : 'Enviar Imagem'}
            </span>
          </label>
        </div>
      </div>

      {/* ═══ GALERIA DE BACKGROUNDS ═══ */}
      <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-bold text-white">Galeria de Backgrounds</h3>
          <span className="text-[10px] text-zinc-600 ml-auto">{backgrounds.length} imagens</span>
        </div>

        {backgrounds.length === 0 ? (
          <div className="text-center py-12 text-zinc-600">
            <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Nenhuma imagem adicionada</p>
            <p className="text-xs mt-1">Faça upload acima para começar a personalizar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {backgrounds.map((bg, idx) => (
              <div
                key={bg.id}
                className={`relative group rounded-xl overflow-hidden border-2 transition-all
                  ${bg.ativo
                    ? 'border-brand-500/40 shadow-lg shadow-brand-500/5'
                    : 'border-dark-600 opacity-50'
                  }`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-dark-900">
                  <img
                    src={bg.image_url?.startsWith('http') ? bg.image_url : `${API}${bg.image_url}`}
                    alt={bg.title || 'Background'}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none' }}
                  />
                  {/* Overlay de ações */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleToggle(bg.id)}
                      className={`p-2 rounded-lg transition-colors ${bg.ativo ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-600/50'}`}
                      title={bg.ativo ? 'Desativar' : 'Ativar'}
                    >
                      {bg.ativo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleReorder(idx, 'up')}
                      disabled={idx === 0}
                      className="p-2 rounded-lg bg-zinc-700/50 text-zinc-300 hover:bg-zinc-600/50 disabled:opacity-30"
                      title="Mover para cima"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleReorder(idx, 'down')}
                      disabled={idx === backgrounds.length - 1}
                      className="p-2 rounded-lg bg-zinc-700/50 text-zinc-300 hover:bg-zinc-600/50 disabled:opacity-30"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemove(bg.id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-2 bg-dark-900/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-300 truncate">
                      {bg.title || `Fundo #${bg.id}`}
                    </span>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${bg.ativo ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700 text-zinc-500'}`}>
                      {bg.ativo ? 'ATIVO' : 'OFF'}
                    </span>
                  </div>
                  <span className="text-[9px] text-zinc-600">Ordem: {bg.ordem}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileScreenManager
