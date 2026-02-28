import { useState, useEffect } from 'react'
import { Server, Save, TestTube, AlertCircle, CheckCircle } from 'lucide-react'

const IptvServer = () => {
  const [config, setConfig] = useState({
    xtream_url: '',
    xtream_username: '',
    xtream_password: ''
  })
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/iptv-server/config')
      const data = await response.json()
      if (data.xtream_url) {
        setConfig(data)
      }
    } catch (error) {
      console.error('Erro ao buscar configuração:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch('/api/iptv-server/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      const data = await response.json()
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Configuração salva com sucesso!' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar configuração' })
    } finally {
      setLoading(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch('/api/iptv-server/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      const data = await response.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: `Conexão bem-sucedida! ${data.channels || 0} canais disponíveis` })
      } else {
        setMessage({ type: 'error', text: data.message || 'Falha na conexão' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao testar conexão' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Server className="text-primary" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-white">Servidor IPTV Global</h1>
          <p className="text-gray-400 text-sm">Configuração padrão para todos os dispositivos</p>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
        <p className="text-blue-400 text-sm">
          💡 Esta é a configuração global. Você pode configurar servidores específicos para cada dispositivo na página "Dispositivos".
        </p>
      </div>

      <div className="bg-card rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-4">Configuração Xtream Codes</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL do Servidor
            </label>
            <input
              type="text"
              value={config.xtream_url}
              onChange={(e) => setConfig({ ...config, xtream_url: e.target.value })}
              placeholder="http://exemplo.com:8080"
              className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Usuário
            </label>
            <input
              type="text"
              value={config.xtream_username}
              onChange={(e) => setConfig({ ...config, xtream_username: e.target.value })}
              placeholder="usuario"
              className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={config.xtream_password}
              onChange={(e) => setConfig({ ...config, xtream_password: e.target.value })}
              placeholder="senha"
              className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
              required
            />
          </div>

          {message.text && (
            <div className={`flex items-center gap-2 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            }`}>
              {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              {message.text}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              {loading ? 'Salvando...' : 'Salvar'}
            </button>

            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !config.xtream_url}
              className="flex items-center gap-2 px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <TestTube size={20} />
              {testing ? 'Testando...' : 'Testar Conexão'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default IptvServer
