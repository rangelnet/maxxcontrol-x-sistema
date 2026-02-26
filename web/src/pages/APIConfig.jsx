import { useState, useEffect } from 'react'
import api from '../services/api'
import { Plus, Edit, Trash2, Save, X, CheckCircle, XCircle } from 'lucide-react'

const APIConfig = () => {
  const [apis, setApis] = useState([])
  const [categories, setCategories] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingAPI, setEditingAPI] = useState(null)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    url: '',
    categoria: '',
    critica: false,
    ativa: true,
    metodo: 'GET',
    headers: '',
    timeout: 5000
  })

  useEffect(() => {
    loadAPIs()
    loadCategories()
  }, [])

  const loadAPIs = async () => {
    try {
      const response = await api.get('/api/api-config')
      setApis(response.data.apis)
    } catch (error) {
      console.error('Erro ao carregar APIs:', error)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await api.get('/api/api-config/categories/list')
      setCategories(response.data.categories)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingAPI) {
        await api.put(`/api/api-config/${editingAPI.id}`, formData)
      } else {
        await api.post('/api/api-config', formData)
      }
      
      setShowModal(false)
      setEditingAPI(null)
      resetForm()
      loadAPIs()
      loadCategories()
    } catch (error) {
      console.error('Erro ao salvar API:', error)
      alert('Erro ao salvar API')
    }
  }

  const handleEdit = (apiItem) => {
    setEditingAPI(apiItem)
    setFormData({
      nome: apiItem.nome,
      descricao: apiItem.descricao || '',
      url: apiItem.url,
      categoria: apiItem.categoria || '',
      critica: apiItem.critica,
      ativa: apiItem.ativa,
      metodo: apiItem.metodo || 'GET',
      headers: apiItem.headers ? JSON.stringify(apiItem.headers, null, 2) : '',
      timeout: apiItem.timeout || 5000
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Deseja realmente deletar esta API?')) return

    try {
      await api.delete(`/api/api-config/${id}`)
      loadAPIs()
    } catch (error) {
      console.error('Erro ao deletar API:', error)
      alert('Erro ao deletar API')
    }
  }

  const toggleActive = async (apiItem) => {
    try {
      await api.put(`/api/api-config/${apiItem.id}`, {
        ...apiItem,
        ativa: !apiItem.ativa
      })
      loadAPIs()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      url: '',
      categoria: '',
      critica: false,
      ativa: true,
      metodo: 'GET',
      headers: '',
      timeout: 5000
    })
  }

  const openNewModal = () => {
    setEditingAPI(null)
    resetForm()
    setShowModal(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Configuração de APIs</h1>
        <button onClick={openNewModal} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Nova API
        </button>
      </div>

      {/* Lista de APIs */}
      <div className="space-y-4">
        {apis.map((apiItem) => (
          <div key={apiItem.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold">{apiItem.nome}</h3>
                  
                  {apiItem.critica && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-500 text-xs rounded">
                      Crítica
                    </span>
                  )}
                  
                  {apiItem.categoria && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-500 text-xs rounded">
                      {apiItem.categoria}
                    </span>
                  )}
                  
                  <button
                    onClick={() => toggleActive(apiItem)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      apiItem.ativa 
                        ? 'bg-green-500/20 text-green-500' 
                        : 'bg-gray-500/20 text-gray-500'
                    }`}
                  >
                    {apiItem.ativa ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {apiItem.ativa ? 'Ativa' : 'Inativa'}
                  </button>
                </div>
                
                {apiItem.descricao && (
                  <p className="text-gray-400 mb-2">{apiItem.descricao}</p>
                )}
                
                <p className="text-sm text-gray-500 font-mono mb-2">{apiItem.url}</p>
                
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>Método: {apiItem.metodo}</span>
                  <span>Timeout: {apiItem.timeout}ms</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(apiItem)}
                  className="p-2 hover:bg-gray-800 rounded transition-colors"
                >
                  <Edit size={18} className="text-blue-500" />
                </button>
                <button
                  onClick={() => handleDelete(apiItem.id)}
                  className="p-2 hover:bg-gray-800 rounded transition-colors"
                >
                  <Trash2 size={18} className="text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {apis.length === 0 && (
          <div className="card text-center text-gray-400">
            Nenhuma API configurada. Clique em "Nova API" para adicionar.
          </div>
        )}
      </div>

      {/* Modal de Criação/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingAPI ? 'Editar API' : 'Nova API'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Nome da API *</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
                    placeholder="Ex: Auth API"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
                    rows="2"
                    placeholder="Para que serve esta API?"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">URL *</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
                    placeholder="https://api.exemplo.com/"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Categoria</label>
                  <input
                    type="text"
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
                    placeholder="Ex: autenticacao, conteudo"
                    list="categories"
                  />
                  <datalist id="categories">
                    {categories.map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Método HTTP</label>
                  <select
                    value={formData.metodo}
                    onChange={(e) => setFormData({...formData, metodo: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Timeout (ms)</label>
                  <input
                    type="number"
                    value={formData.timeout}
                    onChange={(e) => setFormData({...formData, timeout: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
                    min="1000"
                    max="30000"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Headers (JSON)</label>
                  <textarea
                    value={formData.headers}
                    onChange={(e) => setFormData({...formData, headers: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded font-mono text-sm"
                    rows="4"
                    placeholder='{"Authorization": "Bearer token"}'
                  />
                </div>

                <div className="col-span-2 flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.critica}
                      onChange={(e) => setFormData({...formData, critica: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">API Crítica (essencial para o sistema)</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.ativa}
                      onChange={(e) => setFormData({...formData, ativa: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Ativa (monitorar)</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Save size={18} />
                  {editingAPI ? 'Atualizar' : 'Criar'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default APIConfig
