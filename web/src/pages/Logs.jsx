import { useState, useEffect } from 'react'
import api from '../services/api'
import { FileText, Filter } from 'lucide-react'

const Logs = () => {
  const [logs, setLogs] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLogs()
  }, [filter])

  const loadLogs = async () => {
    try {
      const params = filter ? { tipo: filter } : {}
      const response = await api.get('/api/log', { params })
      setLogs(response.data.logs)
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('pt-BR')
  }

  const getTypeColor = (tipo) => {
    const colors = {
      login: 'bg-blue-500/20 text-blue-500',
      erro: 'bg-red-500/20 text-red-500',
      player: 'bg-green-500/20 text-green-500',
      api: 'bg-purple-500/20 text-purple-500'
    }
    return colors[tipo] || 'bg-gray-500/20 text-gray-500'
  }

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Logs do Sistema</h1>
        
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded"
          >
            <option value="">Todos</option>
            <option value="login">Login</option>
            <option value="erro">Erro</option>
            <option value="player">Player</option>
            <option value="api">API</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-4 p-3 bg-gray-900 rounded">
              <FileText className="text-gray-400 mt-1" size={20} />
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`px-2 py-1 rounded text-xs ${getTypeColor(log.tipo)}`}>
                    {log.tipo}
                  </span>
                  <span className="text-sm text-gray-400">{formatDate(log.data)}</span>
                  {log.mac_address && (
                    <span className="text-xs text-gray-500 font-mono">{log.mac_address}</span>
                  )}
                </div>
                
                <p className="text-gray-300">{log.descricao}</p>
                
                {log.modelo && (
                  <p className="text-xs text-gray-500 mt-1">{log.modelo}</p>
                )}
              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Nenhum log encontrado
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Logs
