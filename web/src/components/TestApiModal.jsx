import { useState, useEffect } from 'react'
import api from '../services/api'
import { X, Save, Trash2, TestTube, Plus } from 'lucide-react'

const TestApiModal = ({ device, onClose, onSave }) => {
  const [urls, setUrls] = useState([''])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!device) return

    // Suporte a múltiplas URLs (novo) ou URL única (legado)
    if (device.test_api_urls && Array.isArray(device.test_api_urls) && device.test_api_urls.length > 0) {
      setUrls(device.test_api_urls)
    } else if (device.test_api_url) {
      setUrls([device.test_api_url])
    } else {
      setUrls([''])
    }
  }, [device])

  const handleUrlChange = (index, value) => {
    const updated = [...urls]
    updated[index] = value
    setUrls(updated)
  }

  const addUrl = () => {
    setUrls([...urls, ''])
  }

  const removeUrl = (index) => {
    if (urls.length === 1) {
      setUrls([''])
      return
    }
    setUrls(urls.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setError('')
    const filtered = urls.filter(u => u.trim() !== '')

    setSaving(true)
    try {
      await api.post('/api/device/test-api-url', {
        mac_address: device.mac_address,
        test_api_url: filtered[0] || null,       // compatibilidade legado
        test_api_urls: filtered.length > 0 ? filtered : null
      })

      onSave()
      onClose()
    } catch (err) {
      console.error('Erro ao salvar URLs:', err)
      setError(err.response?.data?.error || 'Erro ao salvar configuração')
    } finally {
      setSaving(false)
    }
  }

  const handleClear = async () => {
    if (!confirm('Remover todas as URLs? O dispositivo usará a URL padrão.')) return

    setError('')
    setSaving(true)
    try {
      await api.post('/api/device/test-api-url', {
        mac_address: device.mac_address,
        test_api_url: null,
        test_api_urls: null
      })

      onSave()
      onClose()
    } catch (err) {
      console.error('Erro ao limpar URLs:', err)
      setError(err.response?.data?.error || 'Erro ao limpar configuração')
    } finally {
      setSaving(false)
    }
  }

  if (!device) return null

  const hasAnyUrl = urls.some(u => u.trim() !== '')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 max-w-lg w-full mx-4 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TestTube className="text-primary" size={24} />
            API de Teste Grátis
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-dark rounded border border-gray-800">
          <p className="text-sm text-gray-400">Dispositivo:</p>
          <p className="text-white font-mono">{device.mac_address}</p>
          <p className="text-sm text-gray-400 mt-1">{device.modelo}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">
              URLs da API de Teste
            </label>
            <button
              onClick={addUrl}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <Plus size={14} />
              Adicionar URL
            </button>
          </div>

          <p className="text-xs text-gray-500">
            O app tenta cada URL em ordem — se uma falhar, usa a próxima.
          </p>

          {urls.map((url, index) => (
            <div key={index} className="flex gap-2 items-center">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-400">
                {index + 1}
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => handleUrlChange(index, e.target.value)}
                placeholder="https://painel.exemplo.com/api/chatbot/..."
                className="flex-1 px-3 py-2 bg-dark border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
              />
              <button
                onClick={() => removeUrl(index)}
                className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                title="Remover esta URL"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>

            {hasAnyUrl && (
              <button
                onClick={handleClear}
                disabled={saving}
                className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                title="Limpar todas as URLs"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 text-center">
            Se não configurar, o dispositivo usará a URL padrão do sistema
          </p>
        </div>
      </div>
    </div>
  )
}

export default TestApiModal
