import { useState, useEffect } from 'react'
import api from '../services/api'
import { Server, Plus, Trash2, Play, CheckCircle, XCircle, Loader } from 'lucide-react'

const PlaylistManager = () => {
  const [servers, setServers] = useState([])
  const [selectedServers, setSelectedServers] = useState([])
  const [currentPlatform, setCurrentPlatform] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [registering, setRegistering] = useState(false)
  
  // Form states
  const [serverForm, setServerForm] = useState({ name: '', dns: '' })
  const [registerForm, setRegisterForm] = useState({ mac: '', username: '', password: '' })
  
  // Log e estatísticas
  const [activityLog, setActivityLog] = useState([])
  const [stats, setStats] = useState({ total: 0, success: 0, error: 0 })

  const platforms = [
    { id: 'smartone', name: 'SmartOne', icon: '📺', color: 'bg-blue-500' },
    { id: 'ibocast', name: 'IBOCast', icon: '🎥', color: 'bg-purple-500' },
    { id: 'ibopro', name: 'IBOPro', icon: '⚡', color: 'bg-green-500' },
    { id: 'vuplayer', name: 'VU Player', icon: '🎬', color: 'bg-red-500' }
  ]

  useEffect(() => {
    loadServers()
  }, [])

  const loadServers = async () => {
    try {
      const response = await api.get('/api/playlist-manager/servers')
      setServers(response.data)
    } catch (error) {
      console.error('Erro ao carregar servidores:', error)
      addLog('❌ Erro ao carregar servidores')
    } finally {
      setLoading(false)
    }
  }

  const addServer = async () => {
    if (!serverForm.name.trim() || !serverForm.dns.trim()) {
      alert('Nome e DNS são obrigatórios')
      return
    }

    try {
      await api.post('/api/playlist-manager/servers', serverForm)
      addLog(`✅ Servidor "${serverForm.name}" adicionado`)
      setServerForm({ name: '', dns: '' })
      setShowAddModal(false)
      loadServers()
    } catch (error) {
      console.error('Erro ao adicionar servidor:', error)
      alert('Erro ao adicionar servidor')
    }
  }

  const deleteServer = async (id, name) => {
    if (!confirm(`Deseja remover o servidor "${name}"?`)) return

    try {
      await api.delete(`/api/playlist-manager/servers/${id}`)
      addLog(`🗑️ Servidor "${name}" removido`)
      
      // Remover da seleção se estava selecionado
      setSelectedServers(prev => prev.filter(serverId => serverId !== id))
      
      loadServers()
    } catch (error) {
      console.error('Erro ao deletar servidor:', error)
      alert('Erro ao deletar servidor')
    }
  }

  const toggleServerSelection = (serverId) => {
    setSelectedServers(prev => {
      if (prev.includes(serverId)) {
        return prev.filter(id => id !== serverId)
      } else {
        return [...prev, serverId]
      }
    })
  }

  const selectAllServers = () => {
    if (selectedServers.length === servers.length) {
      setSelectedServers([])
    } else {
      setSelectedServers(servers.map(s => s.id))
    }
  }

  const selectPlatform = (platformId) => {
    setCurrentPlatform(platformId)
    addLog(`🎯 Plataforma selecionada: ${platforms.find(p => p.id === platformId).name}`)
  }

  const openRegisterModal = () => {
    if (selectedServers.length === 0) {
      alert('Selecione pelo menos um servidor!')
      return
    }
    
    if (!currentPlatform) {
      alert('Selecione uma plataforma primeiro!')
      return
    }
    
    setShowRegisterModal(true)
    addLog(`📝 Formulário em lote aberto: ${selectedServers.length} servidor(es)`)
  }

  const registerPlaylists = async () => {
    const { mac, username, password } = registerForm
    
    if (!mac || !username || !password) {
      alert('Preencha todos os campos')
      return
    }

    // Validar MAC
    const macRegex = /^[0-9A-Fa-f:]{17}$/
    if (!macRegex.test(mac)) {
      alert('Formato de MAC inválido. Use: 00:1A:79:XX:XX:XX')
      return
    }

    setRegistering(true)
    addLog(`⏳ Iniciando registro em lote: ${selectedServers.length} servidor(es)`)

    try {
      const response = await api.post('/api/playlist-manager/register', {
        platform: currentPlatform,
        serverIds: selectedServers,
        mac,
        username,
        password
      })

      // Processar resultados
      response.data.results.forEach(result => {
        if (result.success) {
          addLog(`✅ ${result.server} - ${result.message}`)
        } else {
          addLog(`❌ ${result.server} - ${result.error}`)
        }
      })

      // Atualizar estatísticas
      setStats(prev => ({
        total: prev.total + response.data.summary.total,
        success: prev.success + response.data.summary.success,
        error: prev.error + response.data.summary.error
      }))

      addLog(`🎉 Registro finalizado! Sucesso: ${response.data.summary.success} | Erros: ${response.data.summary.error}`)
      
      setShowRegisterModal(false)
      setRegisterForm({ mac: '', username: '', password: '' })
      
    } catch (error) {
      console.error('Erro no registro:', error)
      addLog(`❌ Erro no registro em lote: ${error.response?.data?.error || error.message}`)
      alert('Erro no registro em lote')
    } finally {
      setRegistering(false)
    }
  }

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR')
    setActivityLog(prev => [
      { time: timestamp, message },
      ...prev.slice(0, 49) // Manter últimas 50 entradas
    ])
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader className="inline-block animate-spin mb-4" size={32} />
        <p className="text-gray-400">Carregando...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Playlist Manager 4-in-1</h1>
        <p className="text-gray-400 mt-2">
          Cadastre playlists IPTV em 4 plataformas simultaneamente
        </p>
      </div>

      {/* Seleção de Plataforma */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">1. Selecione a Plataforma</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {platforms.map(platform => (
            <button
              key={platform.id}
              onClick={() => selectPlatform(platform.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                currentPlatform === platform.id
                  ? `${platform.color} border-white text-white`
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="text-3xl mb-2">{platform.icon}</div>
              <div className="font-semibold">{platform.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Gerenciamento de Servidores */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">2. Gerenciar Servidores</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80"
          >
            <Plus size={18} />
            Adicionar Servidor
          </button>
        </div>

        {servers.length > 0 && (
          <div className="mb-4 flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedServers.length === servers.length && servers.length > 0}
                onChange={selectAllServers}
                className="w-4 h-4"
              />
              <span className="text-sm">Selecionar Todos</span>
            </label>
            <span className="text-sm text-gray-400">
              {selectedServers.length} de {servers.length} selecionado(s)
            </span>
          </div>
        )}

        <div className="space-y-2">
          {servers.map(server => (
            <div
              key={server.id}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                selectedServers.includes(server.id)
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedServers.includes(server.id)}
                onChange={() => toggleServerSelection(server.id)}
                className="w-5 h-5"
              />
              <Server className="text-primary" size={20} />
              <div className="flex-1">
                <div className="font-semibold">{server.name}</div>
                <div className="text-sm text-gray-400">{server.dns}</div>
              </div>
              <button
                onClick={() => deleteServer(server.id, server.name)}
                className="text-red-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          {servers.length === 0 && (
            <p className="text-center text-gray-400 py-8">
              Nenhum servidor cadastrado. Adicione um acima! 👆
            </p>
          )}
        </div>

        {servers.length > 0 && (
          <button
            onClick={openRegisterModal}
            disabled={selectedServers.length === 0 || !currentPlatform}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Play size={20} />
            {selectedServers.length > 0 && currentPlatform
              ? `Registrar ${selectedServers.length} Servidor(es)`
              : 'Registrar Selecionados'}
          </button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-500">{stats.total}</div>
          <div className="text-sm text-gray-400">Total Cadastrado</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-500">{stats.success}</div>
          <div className="text-sm text-gray-400">Sucesso</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-red-500">{stats.error}</div>
          <div className="text-sm text-gray-400">Erros</div>
        </div>
      </div>

      {/* Log de Atividades */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Log de Atividades</h2>
        <div className="bg-dark rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
          {activityLog.length === 0 ? (
            <p className="text-gray-500">Nenhuma atividade ainda...</p>
          ) : (
            activityLog.map((log, index) => (
              <div key={index} className="mb-1">
                <span className="text-gray-500">[{log.time}]</span>{' '}
                <span>{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Adicionar Servidor */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-gray-800">
            <h2 className="text-xl font-bold mb-4">Adicionar Servidor</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome do Servidor</label>
                <input
                  type="text"
                  value={serverForm.name}
                  onChange={(e) => setServerForm({ ...serverForm, name: e.target.value })}
                  placeholder="Meggas, UltraFlex..."
                  className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">DNS do Servidor</label>
                <input
                  type="text"
                  value={serverForm.dns}
                  onChange={(e) => setServerForm({ ...serverForm, dns: e.target.value })}
                  placeholder="ultraflex.top"
                  className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                />
                <p className="text-xs text-gray-500 mt-1">Apenas o domínio, sem http://</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={addServer}
                  className="flex-1 px-4 py-2 bg-primary rounded-lg hover:bg-primary/80"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Registro em Lote */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-gray-800">
            <h2 className="text-xl font-bold mb-4">Registro em Lote</h2>
            
            <div className="mb-4 p-4 bg-dark rounded-lg">
              <div className="text-sm text-gray-400 mb-2">
                <strong>Plataforma:</strong> {platforms.find(p => p.id === currentPlatform)?.name}
              </div>
              <div className="text-sm text-gray-400 mb-2">
                <strong>Servidores:</strong> {selectedServers.length}
              </div>
              <div className="text-xs text-gray-500">
                {servers.filter(s => selectedServers.includes(s.id)).map(s => s.name).join(', ')}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">MAC Address</label>
                <input
                  type="text"
                  value={registerForm.mac}
                  onChange={(e) => setRegisterForm({ ...registerForm, mac: e.target.value })}
                  placeholder="00:1A:79:XX:XX:XX"
                  className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Usuário</label>
                <input
                  type="text"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                  placeholder="usuario123"
                  className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Senha</label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  placeholder="senha456"
                  className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRegisterModal(false)}
                  disabled={registering}
                  className="flex-1 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={registerPlaylists}
                  disabled={registering}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {registering ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Registrar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlaylistManager
