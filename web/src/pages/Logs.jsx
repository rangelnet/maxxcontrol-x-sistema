import { useState, useEffect } from 'react'
import api from '../services/api'
import { Bug, FileText, Search, X } from 'lucide-react'

const Logs = () => {
  const [activeTab, setActiveTab] = useState('bugs')
  const [bugs, setBugs] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    resolvido: 'false',
    severity: '',
    type: '',
    search: ''
  })

  // Severity colors mapping
  const severityColors = {
    critical: 'bg-red-600',
    error: 'bg-orange-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }

  // Type icons mapping
  const typeIcons = {
    AppSync: '📱',
    crash: '💥',
    navigation: '🧭',
    player: '▶️',
    api: '🔌',
    ui: '🎨',
    network: '📡',
    system: '⚙️'
  }

  useEffect(() => {
    if (activeTab === 'bugs') {
      fetchBugs()
    } else {
      fetchLogs()
    }
  }, [activeTab, filters.resolvido, filters.severity, filters.type])

  const fetchBugs = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (filters.resolvido) params.append('resolvido', filters.resolvido)
      if (filters.severity) params.append('severity', filters.severity)
      if (filters.type) params.append('type', filters.type)

      const response = await api.get(`/api/bug?${params.toString()}`)
      setBugs(response.data.bugs || [])
    } catch (err) {
      console.error('Erro ao buscar bugs:', err)
      setError('Erro ao carregar bugs. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (filters.severity) params.append('severity', filters.severity)
      if (filters.type) params.append('type', filters.type)

      const response = await api.get(`/api/logs?${params.toString()}`)
      setLogs(response.data.logs || [])
    } catch (err) {
      console.error('Erro ao buscar logs:', err)
      setError('Erro ao carregar logs. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const resolveBug = async (bugId) => {
    try {
      await api.post('/api/bug/resolve', { bug_id: bugId })
      fetchBugs()
    } catch (err) {
      console.error('Erro ao resolver bug:', err)
      alert('Erro ao marcar bug como resolvido')
    }
  }

  const clearFilters = () => {
    setFilters({
      resolvido: 'false',
      severity: '',
      type: '',
      search: ''
    })
  }

  // Filter data based on search
  const filteredData = activeTab === 'bugs' ? bugs : logs
  const searchFiltered = filteredData.filter(item => {
    if (!filters.search) return true
    const searchLower = filters.search.toLowerCase()
    return (
      item.stack_trace?.toLowerCase().includes(searchLower) ||
      item.message?.toLowerCase().includes(searchLower) ||
      item.modelo?.toLowerCase().includes(searchLower) ||
      item.type?.toLowerCase().includes(searchLower)
    )
  })

  const formatDate = (date) => {
    return new Date(date).toLocaleString('pt-BR')
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Logs & Bugs</h1>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('bugs')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'bugs'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Bug size={20} />
            Bugs ({bugs.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'logs'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText size={20} />
            System Logs ({logs.length})
          </div>
        </button>
      </div>
      
      {/* Filters */}
      <div className="card mb-6">
        <div className="flex gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="🔍 Buscar..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Severity Filter */}
          <select 
            value={filters.severity}
            onChange={(e) => setFilters({...filters, severity: e.target.value})}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
          >
            <option value="">Todas Severidades</option>
            <option value="critical">Critical</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>

          {/* Type Filter */}
          <select 
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
          >
            <option value="">Todos Tipos</option>
            <option value="AppSync">📱 AppSync</option>
            <option value="crash">Crash</option>
            <option value="navigation">Navigation</option>
            <option value="player">Player</option>
            <option value="api">API</option>
            <option value="ui">UI</option>
            <option value="network">Network</option>
            <option value="system">System</option>
          </select>

          {/* Resolved Filter (only for bugs tab) */}
          {activeTab === 'bugs' && (
            <select 
              value={filters.resolvido}
              onChange={(e) => setFilters({...filters, resolvido: e.target.value})}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
            >
              <option value="false">Não Resolvidos</option>
              <option value="true">Resolvidos</option>
              <option value="">Todos</option>
            </select>
          )}

          {/* Clear Filters Button */}
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <X size={16} />
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="card bg-red-500/10 border border-red-500/20 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => activeTab === 'bugs' ? fetchBugs() : fetchLogs()}
              className="btn-primary"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12 text-gray-400">
          Carregando...
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && searchFiltered.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-400 mb-4">
            Nenhum {activeTab === 'bugs' ? 'bug' : 'log'} encontrado com os filtros aplicados.
          </p>
          <button
            onClick={clearFilters}
            className="btn-primary"
          >
            Limpar Filtros
          </button>
        </div>
      )}

      {/* List of Bugs/Logs */}
      {!loading && !error && searchFiltered.length > 0 && (
        <div className="space-y-4">
          {searchFiltered.map(item => (
            <div key={item.id} className="card">
              <div className="flex items-start gap-3 mb-3">
                {/* Type Icon */}
                <span className="text-2xl">{typeIcons[item.type] || '📄'}</span>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    {/* Severity Badge */}
                    <span className={`px-3 py-1 rounded text-white text-sm font-medium ${severityColors[item.severity] || 'bg-gray-600'}`}>
                      {item.severity?.toUpperCase() || 'UNKNOWN'}
                    </span>
                    
                    {/* Type */}
                    <span className="text-gray-400 text-sm">{item.type}</span>
                    
                    {/* Resolved Badge (only for bugs) */}
                    {activeTab === 'bugs' && item.resolvido && (
                      <span className="px-3 py-1 rounded bg-green-500/20 text-green-500 text-sm font-medium">
                        ✓ Resolvido
                      </span>
                    )}
                    
                    {/* Timestamp */}
                    <span className="text-gray-400 text-sm ml-auto">
                      {formatDate(item.data || item.timestamp)}
                    </span>
                  </div>
                  
                  {/* Device Info */}
                  <div className="text-sm text-gray-400 mb-2">
                    <strong>Modelo:</strong> {item.modelo} | 
                    <strong> Versão:</strong> {item.app_version}
                    {item.device_id && <> | <strong>Device ID:</strong> {item.device_id}</>}
                  </div>
                  
                  {/* Context Information */}
                  {item.context && typeof item.context === 'object' && (
                    <div className="text-sm text-gray-400 mb-2">
                      {item.context.screenName && (
                        <>
                          <strong>Tela:</strong> {item.context.screenName}
                          {item.context.userAction && <> | <strong>Ação:</strong> {item.context.userAction}</>}
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Stack Trace / Message */}
                  {(item.stack_trace || item.message) && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-primary hover:text-orange-400 text-sm">
                        Ver {item.stack_trace ? 'Stack Trace' : 'Mensagem'}
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-900 rounded text-xs overflow-x-auto max-h-48">
                        {item.stack_trace || item.message}
                      </pre>
                    </details>
                  )}
                  
                  {/* Resolve Button (only for unresolved bugs) */}
                  {activeTab === 'bugs' && !item.resolvido && (
                    <button
                      onClick={() => resolveBug(item.id)}
                      className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                    >
                      Marcar como Resolvido
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Logs
