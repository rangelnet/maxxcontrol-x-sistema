import { useState, useEffect } from 'react'
import api from '../services/api'
import { X, Save, Trash2, TestTube } from 'lucide-react'

const TestApiModal = ({ device, onClose, onSave }) => {
  const [testApiUrl, setTestApiUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Carregar URL atual se existir
    if (device?.test_api_url) {
      setTestApiUrl(device.test_api_url)
    }
  }, [device])

  const handleSave = async () => {
    setError('')
    setSaving(true)

    try {
      await api.post('/api/device/test-api-url', {
        mac_address: device.mac_address,
        test_api_url: testApiUrl || null
      })
      
      onSave()
      onClose()
    } catch (err) {
      console.error('Erro ao salvar URL:', err)
      setError(err.response?.data?.error || 'Erro ao salvar configuração')
    } finally {
      setSaving(false)
    }
  }

  const handleClear = async () => {
    if (!confirm('Remover URL personalizada? O dispositivo usará a URL padrão.')) return

    setError('')
    setSaving(true)

    try {
      await api.post('/api/device/test-api-url', {
        mac_address: device.mac_address,
        test_api_url: null
      })
      
      onSave()
      onClose()
    } catch (err) {
      console.error('Erro ao limpar URL:', err)
      setError(err.response?.data?.error || 'Erro ao limpar configuração')
    } finally {
      setSaving(false)
    }
  }

  if (!device) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-gray-800">
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

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL da API de Teste
            </label>
            <input
              type="text"
              value={testApiUrl}
              onChange={(e) => setTestApiUrl(e.target.value)}
              placeholder="https://painel.exemplo.com/api/chatbot/..."
              className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL personalizada para o botão "TESTE GRÁTIS" no app
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            
            {testApiUrl && (
              <button
                onClick={handleClear}
                disabled={saving}
                className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                title="Usar URL padrão"
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
