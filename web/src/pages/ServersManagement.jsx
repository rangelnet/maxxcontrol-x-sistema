import { useState, useEffect } from 'react'
import api from '../services/api'
import { Server, Plus, Edit, Trash2, Settings, CheckCircle, AlertCircle, Users, X, Save } from 'lucide-react'

const ServersManagement = () => {
  const [servers, setServers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingServer, setEditingServer] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    region: '',
    priority: 100,
    status: 'ativo'
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadServers()
  }, [])

  const loadServers = async () => {
    try {
      console.log('🔄 Carregando servidores...')
      const token = localStorage.getItem('token')
      console.log('🔑 Token presente:', !!token)
      
      const response = await api.get('/api/iptv/servers/all')
      console.log('✅ Servidores carregados:', response.data.length)
      setServers(response.data)
    } catch (error) {
      console.error('❌ Erro ao carregar servidores:', error)
      console.error('Detalhes:', error.response?.data)
      console.error('Status:', error.response?.status)
      
      if (error.response?.status === 401) {
        alert('Sessão expirada. Por favor, faça login novamente.')
        window.location.href = '/login'
      } else {
        const errorMessage = error.response?.data?.error || 'Erro ao carregar servidores'
        alert(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingServer(null)
    setFormData({
      name: '',
      url: '',
      region: '',
      priority: 100,
      status: 'ativo'
    })
    setShowModal(true)
  }

  const openEditModal = (server) => {
    setEditingServer(server)
    setFormData({
      name: server.name,
      url: server.url,
      region: server.region || '',
      priority: server.priority,
      status: server.status
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.url.trim()) {
      alert('Nome e URL são obrigatórios')
      return
    }

    setSaving(true)
    try {
      if (editingServer) {
        // Atualizar servidor existente
        await api.put(`/api/iptv/servers/${editingServer.id}`, formData)
        alert('Servidor atualizado com sucesso!')
      } else {
        // Criar novo servidor
        await api.post('/api/iptv/servers', formData)
        alert('Servidor criado com sucesso!')
      }
      
      setShowModal(false)
      loadServers()
    } catch (error) {
      console.error('Erro ao salvar servidor:', error)
      const errorMessage = error.response?.data?.error || 'Erro ao salvar servidor'
      alert(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const deleteServer = async (serverId, serverName) => {
    if (!confirm(`Deseja excluir o servidor "${serverName}"?\n\nEsta ação não pode ser desfeita.`)) {
      return
    }

    try {
      await api.delete(`/api/iptv/servers/${serverId}`)
      alert('Servidor excluído com sucesso!')
      loadServers()
    } catch (error) {
      console.error('Erro ao excluir servidor:', error)
      const errorMessage = error.response?.data?.error || 'Erro ao excluir servidor'
      alert(errorMessage)
    }
  }

  const setMaintenance = async (serverId, serverName) => {
    if (!confirm(`Colocar servidor "${serverName}" em manutenção?\n\nDispositivos não poderão usar este servidor.`)) {
      return
    }

    try {
      await api.post(`/api/iptv/servers/${serverId}/maintenance`)
      alert('Servidor colocado em manutenção!')
      loadServers()
    } catch (error) {
      console.error('Erro ao colocar em manutenção:', error)
      alert('Erro ao atualizar status do servidor')
    }
  }

  const activateServer = async (serverId, serverName) => {
    if (!confirm(`Ativar servidor "${serverName}"?`)) {
      return
    }

    try {
      await api.post(`/api/iptv/servers/${serverId}/activate`)
      alert('Servidor ativado com sucesso!')
      loadServers()
    } catch (error) {
      console.error('Erro ao ativar servidor:', error)
      alert('Erro ao atualizar status do servidor')
    }
  }

  const refreshUserCount = async (serverId) => {
    try {
      const response = await api.get(`/api/iptv/servers/${serverId}/users`)
      alert(`Servidor: ${response.data.server_name}\nUsuários ativos: ${response.data.users}`)
      loadServers()
    } catch (error) {
      console.error('Erro ao atualizar contagem:', error)
      alert('Erro ao atualizar contagem de usuários')
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ativo': {
        icon: CheckCircle,
        color: 'bg-green-500/20 text-green-500',
        text: 'Ativo'
      },
      'manutenção': {
        icon: Settings,
        color: 'bg-yellow-500/20 text-yellow-500',
        text: 'Manutenção'
      },
      'inativo': {
        icon: AlertCircle,
        color: 'bg-red-500/20 text-red-500',
        text: 'Inativo'
      }
    }

    const config = statusConfig[status] || statusConfig['inativo']
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${config.color}`}>
        <Icon size={14} />
        {config.text}
      </span>
    )
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('pt-BR')
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-400">Carregando servidores...</p>
        <p className="text-xs text-gray-500 mt-2">Verifique o console (F12) para mais detalhes</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Servidores IPTV</h1>
          <p className="text-gray-400 mt-2">
            Configure e monitore os servidores IPTV disponíveis para os dispositivos
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
        >
          <Plus size={18} />
          Adicionar Servidor
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4">Servidor</th>
                <th className="text-left py-3 px-4">URL</th>
                <th className="text-left py-3 px-4">Região</th>
                <th className="text-left py-3 px-4">Prioridade</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Usuários</th>
                <th className="text-left py-3 px-4">Criado em</th>
                <th className="text-left py-3 px-4">Ações</th>
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
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm text-gray-400">{server.url}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-300">{server.region || 'N/A'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-500 rounded text-sm font-semibold">
                      {server.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(server.status)}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => refreshUserCount(server.id)}
                      className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors"
                      title="Atualizar contagem"
                    >
                      <Users size={16} />
                      <span className="font-semibold">{server.users || 0}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-400">
                    {formatDate(server.created_at)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(server)}
                        className="text-blue-400 hover:text-blue-300 p-2 hover:bg-blue-500/10 rounded transition-colors"
                        title="Editar servidor"
                      >
                        <Edit size={16} />
                      </button>
                      
                      {server.status === 'ativo' ? (
                        <button
                          onClick={() => setMaintenance(server.id, server.name)}
                          className="text-yellow-400 hover:text-yellow-300 p-2 hover:bg-yellow-500/10 rounded transition-colors"
                          title="Colocar em manutenção"
                        >
                          <Settings size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => activateServer(server.id, server.name)}
                          className="text-green-400 hover:text-green-300 p-2 hover:bg-green-500/10 rounded transition-colors"
                          title="Ativar servidor"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteServer(server.id, server.name)}
                        className="text-red-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded transition-colors"
                        title="Excluir servidor"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {servers.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Nenhum servidor cadastrado. Clique em "Adicionar Servidor" para começar.
            </div>
          )}
        </div>
      </div>

      {/* Modal de Criar/Editar Servidor */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Server className="text-primary" size={24} />
                {editingServer ? 'Editar Servidor' : 'Adicionar Servidor'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Servidor *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Servidor Brasil"
                  className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL do Servidor *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="http://servidor.exemplo.com:8080"
                  className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Inclua protocolo (http:// ou https://) e porta
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Região
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="Brasil, EUA, Europa..."
                  className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prioridade
                </label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  min="1"
                  max="999"
                  className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Menor número = maior prioridade (1 = primeira opção)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                >
                  <option value="ativo">Ativo</option>
                  <option value="manutenção">Manutenção</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
                >
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

export default ServersManagement
