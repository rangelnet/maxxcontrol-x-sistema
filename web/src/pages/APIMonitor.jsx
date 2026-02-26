import { useState, useEffect } from 'react'
import api from '../services/api'
import { Activity, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'

const APIMonitor = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadData()
    
    if (autoRefresh) {
      const interval = setInterval(loadData, 30000) // 30 segundos
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const loadData = async () => {
    try {
      const response = await api.get('/api/api-monitor/check-all')
      setData(response.data)
    } catch (error) {
      console.error('Erro ao carregar status das APIs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    return status === 'online' ? 'text-green-500' : 'text-red-500'
  }

  const getStatusIcon = (status) => {
    return status === 'online' ? <CheckCircle size={20} /> : <XCircle size={20} />
  }

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Monitor de APIs</h1>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4"
            />
            Auto-refresh (30s)
          </label>
          <button onClick={loadData} className="btn-primary">
            Atualizar Agora
          </button>
        </div>
      </div>

      {/* Resumo */}
      {data?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total de APIs</p>
                <p className="text-3xl font-bold">{data.summary.total}</p>
              </div>
              <Activity className="text-blue-500" size={40} />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Online</p>
                <p className="text-3xl font-bold text-green-500">{data.summary.online}</p>
              </div>
              <CheckCircle className="text-green-500" size={40} />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Offline</p>
                <p className="text-3xl font-bold text-red-500">{data.summary.offline}</p>
              </div>
              <XCircle className="text-red-500" size={40} />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Latência Média</p>
                <p className="text-3xl font-bold">{data.summary.avg_latency}ms</p>
              </div>
              <Clock className="text-primary" size={40} />
            </div>
          </div>
        </div>
      )}

      {/* Alerta de APIs críticas offline */}
      {data?.summary?.critical_offline > 0 && (
        <div className="card bg-red-500/10 border-red-500 mb-8">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500" size={24} />
            <div>
              <p className="font-bold text-red-500">Atenção!</p>
              <p className="text-sm text-gray-300">
                {data.summary.critical_offline} API(s) crítica(s) estão offline
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de APIs */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Status das APIs</h2>
        
        <div className="space-y-3">
          {data?.apis?.map((apiItem, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-900 rounded">
              <div className="flex items-center gap-4 flex-1">
                <div className={getStatusColor(apiItem.status)}>
                  {getStatusIcon(apiItem.status)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{apiItem.name}</p>
                    {apiItem.critical && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-500 text-xs rounded">
                        Crítica
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 font-mono">{apiItem.url}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm">
                {apiItem.status === 'online' && (
                  <>
                    <div className="text-center">
                      <p className="text-gray-400">Status</p>
                      <p className="font-semibold">{apiItem.statusCode}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400">Latência</p>
                      <p className="font-semibold">{apiItem.latency}ms</p>
                    </div>
                  </>
                )}
                {apiItem.status === 'offline' && apiItem.error && (
                  <div className="text-right">
                    <p className="text-red-500 text-xs">{apiItem.error}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default APIMonitor
