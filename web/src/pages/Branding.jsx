import { useState, useEffect } from 'react'
import api from '../services/api'
import { Save, X, Palette } from 'lucide-react'

const Branding = () => {
  const [branding, setBranding] = useState(null)
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    banner_titulo: '',
    banner_subtitulo: '',
    banner_cor_fundo: '#000000',
    banner_cor_texto: '#FF6A00',
    logo_url: '',
    splash_url: '',
    tema: 'dark'
  })

  useEffect(() => {
    loadBranding()
    loadTemplates()
  }, [])

  const loadBranding = async () => {
    try {
      const response = await api.get('/api/branding/current')
      setBranding(response.data)
      setFormData({
        banner_titulo: response.data.banner_titulo || '',
        banner_subtitulo: response.data.banner_subtitulo || '',
        banner_cor_fundo: response.data.banner_cor_fundo || '#000000',
        banner_cor_texto: response.data.banner_cor_texto || '#FF6A00',
        logo_url: response.data.logo_url || '',
        splash_url: response.data.splash_url || '',
        tema: response.data.tema || 'dark'
      })
    } catch (error) {
      console.error('Erro ao carregar branding:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTemplates = async () => {
    try {
      const response = await api.get('/api/branding/templates')
      setTemplates(response.data)
    } catch (error) {
      console.error('Erro ao carregar templates:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (branding?.id) {
        await api.put(`/api/branding/${branding.id}`, formData)
      } else {
        await api.post('/api/branding', formData)
      }
      
      alert('Branding atualizado com sucesso!')
      loadBranding()
    } catch (error) {
      console.error('Erro ao salvar branding:', error)
      alert('Erro ao salvar branding')
    }
  }

  const applyTemplate = (template) => {
    setFormData({
      ...formData,
      banner_cor_fundo: template.banner_cor_fundo,
      banner_cor_texto: template.banner_cor_texto,
      tema: template.tema
    })
  }

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gerenciar Branding</h1>
        <Palette size={32} className="text-orange-500" />
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Formulário */}
        <div className="col-span-2">
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Configurações de Branding</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Textos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">Textos</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Título do Banner</label>
                  <input
                    type="text"
                    value={formData.banner_titulo}
                    onChange={(e) => setFormData({...formData, banner_titulo: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
                    placeholder="Ex: TV Maxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Subtítulo do Banner</label>
                  <input
                    type="text"
                    value={formData.banner_subtitulo}
                    onChange={(e) => setFormData({...formData, banner_subtitulo: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
                    placeholder="Ex: Seu Entretenimento"
                  />
                </div>
              </div>

              {/* Cores */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">Cores</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Cor de Fundo</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.banner_cor_fundo}
                        onChange={(e) => setFormData({...formData, banner_cor_fundo: e.target.value})}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.banner_cor_fundo}
                        onChange={(e) => setFormData({...formData, banner_cor_fundo: e.target.value})}
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded font-mono text-sm"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Cor do Texto</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.banner_cor_texto}
                        onChange={(e) => setFormData({...formData, banner_cor_texto: e.target.value})}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.banner_cor_texto}
                        onChange={(e) => setFormData({...formData, banner_cor_texto: e.target.value})}
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded font-mono text-sm"
                        placeholder="#FF6A00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* URLs */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">Mídia</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">URL do Logo</label>
                  <input
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
                    placeholder="https://exemplo.com/logo.png"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">URL da Splash Screen</label>
                  <input
                    type="url"
                    value={formData.splash_url}
                    onChange={(e) => setFormData({...formData, splash_url: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
                    placeholder="https://exemplo.com/splash.png"
                  />
                </div>
              </div>

              {/* Tema */}
              <div>
                <label className="block text-sm font-medium mb-2">Tema</label>
                <select
                  value={formData.tema}
                  onChange={(e) => setFormData({...formData, tema: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
                >
                  <option value="dark">Escuro</option>
                  <option value="light">Claro</option>
                  <option value="auto">Automático</option>
                </select>
              </div>

              {/* Preview */}
              <div className="bg-gray-800 p-4 rounded border border-gray-700">
                <h3 className="text-sm font-medium mb-3 text-gray-300">Preview</h3>
                <div 
                  className="p-6 rounded text-center"
                  style={{
                    backgroundColor: formData.banner_cor_fundo,
                    color: formData.banner_cor_texto
                  }}
                >
                  <h4 className="text-2xl font-bold mb-2">{formData.banner_titulo || 'Título'}</h4>
                  <p className="text-sm">{formData.banner_subtitulo || 'Subtítulo'}</p>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                <Save size={18} />
                Salvar Branding
              </button>
            </form>
          </div>
        </div>

        {/* Templates */}
        <div>
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Templates Rápidos</h2>
            
            <div className="space-y-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded"
                      style={{
                        backgroundColor: template.banner_cor_fundo,
                        border: `2px solid ${template.banner_cor_texto}`
                      }}
                    />
                    <div>
                      <p className="font-medium text-sm">{template.nome}</p>
                      <p className="text-xs text-gray-400">{template.descricao}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Informações */}
          <div className="card mt-4">
            <h3 className="font-bold mb-3">Informações Atuais</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p><strong>Tema:</strong> {formData.tema}</p>
              <p><strong>Fundo:</strong> {formData.banner_cor_fundo}</p>
              <p><strong>Texto:</strong> {formData.banner_cor_texto}</p>
              {branding?.atualizado_em && (
                <p><strong>Atualizado:</strong> {new Date(branding.atualizado_em).toLocaleString('pt-BR')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Branding
