import { useState, useEffect } from 'react'
import api from '../services/api'
import { Package, Plus } from 'lucide-react'

const Versions = () => {
  const [versions, setVersions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    versao: '',
    obrigatoria: false,
    link_download: '',
    mensagem: ''
  })

  useEffect(() => {
    loadVersions()
  }, [])

  const loadVersions = async () => {
    try {
      const response = await api.get('/api/app/versions')
      setVersions(response.data.versions)
    } catch (error) {
      console.error('Erro ao carregar versões:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/api/app/version', formData)
      setShowModal(false)
      setFormData({ versao: '', obrigatoria: false, link_download: '', mensagem: '' })
      loadVersions()
    } catch (error) {
      console.error('Erro ao criar versão:', error)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('pt-BR')
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Versões do App</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Nova Versão
        </button>
      </div>

      <div className="space-y-4">
        {versions.map((version) => (
          <div key={version.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Package className="text-primary" size={32} />
                <div>
                  <h3 className="text-xl font-bold">v{version.versao}</h3>
                  <p className="text-sm text-gray-400">{formatDate(version.criado_em)}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded text-sm ${
                  version.obrigatoria ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'
                }`}>
                  {version.obrigatoria ? 'Obrigatória' : 'Opcional'}
                </span>
                <span className={`px-3 py-1 rounded text-sm ${
                  version.ativa ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                }`}>
                  {version.ativa ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            </div>
            
            {version.mensagem && (
              <p className="mt-3 text-gray-300">{version.mensagem}</p>
            )}
            
            {version.link_download && (
              <a href={version.link_download} target="_blank" rel="noopener noreferrer" 
                 className="mt-3 inline-block text-primary hover:text-orange-400">
                Link de Download →
              </a>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Nova Versão</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Versão</label>
                <input
                  type="text"
                  value={formData.versao}
                  onChange={(e) => setFormData({...formData, versao: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
                  placeholder="1.0.0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Link de Download</label>
                <input
                  type="url"
                  value={formData.link_download}
                  onChange={(e) => setFormData({...formData, link_download: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
                  placeholder="https://..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mensagem</label>
                <textarea
                  value={formData.mensagem}
                  onChange={(e) => setFormData({...formData, mensagem: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
                  rows="3"
                  placeholder="Novidades desta versão..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="obrigatoria"
                  checked={formData.obrigatoria}
                  onChange={(e) => setFormData({...formData, obrigatoria: e.target.checked})}
                  className="w-4 h-4"
                />
                <label htmlFor="obrigatoria" className="text-sm">Atualização obrigatória</label>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">Criar</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
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

export default Versions
