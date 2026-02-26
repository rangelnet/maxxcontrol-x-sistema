import { useState, useEffect } from 'react'
import api from '../services/api'
import { Bug, CheckCircle, XCircle } from 'lucide-react'

const Bugs = () => {
  const [bugs, setBugs] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBugs()
  }, [filter])

  const loadBugs = async () => {
    try {
      const params = filter !== 'all' ? { resolvido: filter === 'resolved' } : {}
      const response = await api.get('/api/bug', { params })
      setBugs(response.data.bugs)
    } catch (error) {
      console.error('Erro ao carregar bugs:', error)
    } finally {
      setLoading(false)
    }
  }

  const resolveBug = async (bugId) => {
    try {
      await api.post('/api/bug/resolve', { bug_id: bugId })
      loadBugs()
    } catch (error) {
      console.error('Erro ao resolver bug:', error)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('pt-BR')
  }

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Bugs Reportados</h1>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-primary' : 'bg-gray-700'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-primary' : 'bg-gray-700'}`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded ${filter === 'resolved' ? 'bg-primary' : 'bg-gray-700'}`}
          >
            Resolvidos
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {bugs.map((bug) => (
          <div key={bug.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Bug className="text-red-500" size={20} />
                  <span className="text-sm text-gray-400">{formatDate(bug.data)}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    bug.resolvido ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {bug.resolvido ? 'Resolvido' : 'Pendente'}
                  </span>
                </div>
                
                <div className="mb-2">
                  <span className="text-sm text-gray-400">Usuário:</span> {bug.nome} ({bug.email})
                </div>
                
                <div className="mb-2">
                  <span className="text-sm text-gray-400">Modelo:</span> {bug.modelo} | 
                  <span className="text-sm text-gray-400"> Versão:</span> {bug.app_version}
                </div>
                
                {bug.stack_trace && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-primary hover:text-orange-400">
                      Ver Stack Trace
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-900 rounded text-xs overflow-x-auto">
                      {bug.stack_trace}
                    </pre>
                  </details>
                )}
              </div>
              
              {!bug.resolvido && (
                <button
                  onClick={() => resolveBug(bug.id)}
                  className="btn-primary ml-4"
                >
                  Marcar como Resolvido
                </button>
              )}
            </div>
          </div>
        ))}

        {bugs.length === 0 && (
          <div className="card text-center text-gray-400">
            Nenhum bug encontrado
          </div>
        )}
      </div>
    </div>
  )
}

export default Bugs
