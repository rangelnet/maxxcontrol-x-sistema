import { useState, useEffect } from 'react'
import api from '../services/api'
import { Server, Save, TestTube, AlertCircle, CheckCircle, Plus, Edit, Trash2, Settings, Users, X, Eye, EyeOff } from 'lucide-react'

const IptvPanel = () => {
  const [activeTab, setActiveTab] = useState('global')

  const [config, setConfig] = useState({ xtream_url: '', xtream_username: '', xtream_password: '' })
  const [loadingConfig, setLoadingConfig] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showPassword, setShowPassword] = useState(false)

  const [servers, setServers] = useState([])
  const [loadingServers, setLoadingServers] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingServer, setEditingServer] = useState(null)
  const [formData, setFormData] = useState({ name: '', url: '', region: '', priority: 100, status: 'ativo' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchConfig()
    loadServers()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await api.get('/api/iptv-server/config')
      if (response.data && response.data.xtream_url) {
        setConfig({
          xtream_url: response.data.xtream_url || '',
          xtream_username: response.data.xtream_username || '',
          xtream_password: response.data.xtream_password || ''
        })
      }
    } catch (error) {
      console.error('Erro ao buscar configuracao:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoadingConfig(true)
    setMessage({ type: '', text: '' })
    try {
      const response = await api.post('/api/iptv-server/config', config)
      if (response.data) {
        setMessage({ type: 'success', text: 'Configuracao salva com sucesso!' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Erro ao salvar configuracao' })
    } finally {
      setLoadingConfig(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setMessage({ type: '', text: '' })
    try {
      const response = await api.post('/api/iptv-server/test', config)
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Conexao bem-sucedida! ' + (response.data.channels || 0) + ' canais disponiveis' })
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Falha na conexao' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erro ao testar conexao' })
    } finally {
      setTesting(false)
    }
  }

  const loadServers = async () => {
    try {
      const response = await api.get('/api/iptv/servers/all')
      setServers(response.data)
    } catch (error) {
      console.error('Erro ao carregar servidores:', error)
      if (error.response?.status === 401) {
        alert('Sessao expirada. Por favor, faca login novamente.')
        window.location.href = '/login'
      }
    } finally {
      setLoadingServers(false)
    }
  }

  const openCreateModal = () => {
    setEditingServer(null)
    setFormData({ name: '', url: '', region: '', priority: 100, status: 'ativo' })
    setShowModal(true)
  }

  const openEditModal = (server) => {
    setEditingServer(server)
    setFormData({ name: server.name, url: server.url, region: server.region || '', priority: server.priority, status: server.status })
    setShowModal(true)
  }

  const handleServerSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.url.trim()) {
      alert('Nome e URL sao obrigatorios')
      return
    }
    setSaving(true)
    try {
      if (editingServer) {
        await api.put('/api/iptv/servers/' + editingServer.id, formData)
        alert('Servidor atualizado com sucesso!')
      } else {
        await api.post('/api/iptv/servers', formData)
        alert('Servidor criado com sucesso!')
      }
      setShowModal(false)
      loadServers()
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao salvar servidor')
    } finally {
      setSaving(false)
    }
  }

  const deleteServer = async (serverId, serverName) => {
    if (!confirm('Deseja excluir o servidor "' + serverName + '"?')) return
    try {
      await api.delete('/api/iptv/servers/' + serverId)
      alert('Servidor excluido com sucesso!')
      loadServers()
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao excluir servidor')
    }
  }

  const toggleMaintenance = async (server) => {
    const isActive = server.status === 'ativo'
    const msg = isActive ? 'Colocar "' + server.name + '" em manutencao?' : 'Ativar "' + server.name + '"?'
    if (!confirm(msg)) return
    try {
      if (isActive) {
        await api.post('/api/iptv/servers/' + server.id + '/maintenance')
      } else {
        await api.post('/api/iptv/servers/' + server.id + '/activate')
      }
      loadServers()
    } catch (error) {
      alert('Erro ao atualizar status do servidor')
    }
  }

  const getStatusBadge = (status) => {
    const map = {
      'ativo': { icon: CheckCircle, color: 'bg-green-500/20 text-green-500', text: 'Ativo' },
      'manutencao': { icon: Settings, color: 'bg-yellow-500/20 text-yellow-500', text: 'Manutencao' },
      'inativo': { icon: AlertCircle, color: 'bg-red-500/20 text-red-500', text: 'Inativo' }
    }
    const cfg = map[status] || map['inativo']
    const Icon = cfg.icon
    return (
      <span className={'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ' + cfg.color}>
        <Icon size={14} />{cfg.text}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Server className="text-primary" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-white">IPTV</h1>
          <p className="text-gray-400 text-sm">Servidor global e gerenciamento de servidores</p>
        </div>
      </div>

      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab('global')}
          className={'px-6 py-3 text-sm font-medium transition-colors ' + (activeTab === 'global' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white')}
        >
          Servidor Global
        </button>
        <button
          onClick={() => setActiveTab('servers')}
          className={'px-6 py-3 text-sm font-medium transition-colors ' + (activeTab === 'servers' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white')}
        >
          Servidores
        </button>
      </div>

      {activeTab === 'global' && (
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-400 text-sm">
              Esta e a configuracao global. Voce pode configurar servidores especificos para cada dispositivo na pagina Dispositivos.
            </p>
          </div>
          <div className="bg-card rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">Configuracao Xtream Codes</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">URL do Servidor</label>
                <input type="text" value={config.xtream_url} onChange={(e) => setConfig({ ...config, xtream_url: e.target.value })} placeholder="http://exemplo.com:8080" className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Usuario</label>
                <input type="text" value={config.xtream_username} onChange={(e) => setConfig({ ...config, xtream_username: e.target.value })} placeholder="usuario" className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={config.xtream_password} onChange={(e) => setConfig({ ...config, xtream_password: e.target.value })} placeholder="senha" className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary pr-10" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-white">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {message.text && (
                <div className={'flex items-center gap-2 p-4 rounded-lg ' + (message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500')}>
                  {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                  {message.text}
                </div>
              )}
              <div className="flex gap-3">
                <button type="submit" disabled={loadingConfig} className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50">
                  <Save size={20} />
                  {loadingConfig ? 'Salvando...' : 'Salvar'}
                </button>
                <button type="button" onClick={handleTest} disabled={testing || !config.xtream_url} className="flex items-center gap-2 px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50">
                  <TestTube size={20} />
                  {testing ? 'Testando...' : 'Testar Conexao'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'servers' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">
              <Plus size={18} />
              Adicionar Servidor
            </button>
          </div>
          {loadingServers ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-gray-400">Carregando servidores...</p>
            </div>
          ) : (
            <div className="card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4">Servidor</th>
                      <th className="text-left py-3 px-4">URL</th>
                      <th className="text-left py-3 px-4">Regiao</th>
                      <th className="text-left py-3 px-4">Prioridade</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Usuarios</th>
                      <th className="text-left py-3 px-4">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {servers.map((server) => (
                      <tr key={server.id} className="border-b border-gray-800 hover:bg-gray-900">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Server className="text-primary" size={18} />
                            <span className="font-semibold">{server.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4"><span className="font-mono text-sm text-gray-400">{server.url}</span></td>
                        <td className="py-3 px-4 text-gray-300">{server.region || 'N/A'}</td>
                        <td className="py-3 px-4"><span className="px-2 py-1 bg-blue-500/20 text-blue-500 rounded text-sm font-semibold">{server.priority}</span></td>
                        <td className="py-3 px-4">{getStatusBadge(server.status)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-gray-300">
                            <Users size={16} />
                            <span className="font-semibold">{server.users || 0}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button onClick={() => openEditModal(server)} className="text-blue-400 hover:text-blue-300 p-2 hover:bg-blue-500/10 rounded transition-colors" title="Editar"><Edit size={16} /></button>
                            <button
                              onClick={() => toggleMaintenance(server)}
                              className={'p-2 rounded transition-colors ' + (server.status === 'ativo' ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10' : 'text-green-400 hover:text-green-300 hover:bg-green-500/10')}
                              title={server.status === 'ativo' ? 'Manutencao' : 'Ativar'}
                            >
                              {server.status === 'ativo' ? <Settings size={16} /> : <CheckCircle size={16} />}
                            </button>
                            <button onClick={() => deleteServer(server.id, server.name)} className="text-red-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded transition-colors" title="Excluir"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {servers.length === 0 && (
                  <div className="text-center py-8 text-gray-400">Nenhum servidor cadastrado. Clique em "Adicionar Servidor" para comecar.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Server className="text-primary" size={24} />
                {editingServer ? 'Editar Servidor' : 'Adicionar Servidor'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleServerSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome do Servidor *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Servidor Brasil" className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">URL do Servidor *</label>
                <input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="http://servidor.exemplo.com:8080" className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Regiao</label>
                <input type="text" value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} placeholder="Brasil, EUA, Europa..." className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Prioridade</label>
                <input type="number" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })} min="1" max="999" className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary" />
                <p className="text-xs text-gray-500 mt-1">Menor numero = maior prioridade</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary">
                  <option value="ativo">Ativo</option>
                  <option value="manutencao">Manutencao</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50">
                  <Save size={18} />
                  {saving ? 'Salvando...' : editingServer ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default IptvPanel
