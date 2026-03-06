import { useState, useEffect } from 'react'
import api from '../services/api'
import { Save, X, Palette } from 'lucide-react'

const Branding = () => {
  const [branding, setBranding] = useState(null)
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    app_name: 'TV Maxx',
    logo_url: '',
    logo_dark_url: '',
    primary_color: '#F63012',
    secondary_color: '#FF0000',
    background_color: '#000000',
    text_color: '#FFFFFF',
    accent_color: '#FFA500',
    splash_screen_url: '',
    hero_banner_url: ''
  })

  useEffect(() => {
    loadBranding()
    loadTemplates()
    loadAppLogos()
  }, [])

  const loadBranding = async () => {
    try {
      const response = await api.get('/api/branding/current')
      setBranding(response.data)
      setFormData({
        app_name: response.data.app_name || 'TV Maxx',
        logo_url: response.data.logo_url || '',
        logo_dark_url: response.data.logo_dark_url || '',
        primary_color: response.data.primary_color || '#F63012',
        secondary_color: response.data.secondary_color || '#FF0000',
        background_color: response.data.background_color || '#000000',
        text_color: response.data.text_color || '#FFFFFF',
        accent_color: response.data.accent_color || '#FFA500',
        splash_screen_url: response.data.splash_screen_url || '',
        hero_banner_url: response.data.hero_banner_url || ''
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

  const loadAppLogos = async () => {
    try {
      // Buscar logos do projeto Android automaticamente
      const logoUrl = `${api.defaults.baseURL}/api/branding/app-logos/logo`
      const logoDarkUrl = `${api.defaults.baseURL}/api/branding/app-logos/logo_dark`
      
      // Atualizar formData com URLs das logos
      setFormData(prev => ({
        ...prev,
        logo_url: prev.logo_url || logoUrl,
        logo_dark_url: prev.logo_dark_url || logoDarkUrl
      }))
    } catch (error) {
      console.error('Erro ao carregar logos do app:', error)
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
      primary_color: template.primary_color,
      background_color: template.background_color,
      text_color: template.text_color
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
              {/* Nome do App */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">Informações do App</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Nome do App</label>
                  <input
                    type="text"
                    value={formData.app_name}
                    onChange={(e) => setFormData({...formData, app_name: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
                    placeholder="Ex: TV Maxx"
                  />
                </div>
              </div>

              {/* Logos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">Logos</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">URL do Logo (Claro)</label>
                  <input
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
                    placeholder="https://exemplo.com/logo.png"
                  />
                  {formData.logo_url && (
                    <img src={formData.logo_url} alt="Logo Preview" className="mt-2 h-16 object-contain bg-white p-2 rounded" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">URL do Logo (Escuro)</label>
                  <input
                    type="url"
                    value={formData.logo_dark_url}
                    onChange={(e) => setFormData({...formData, logo_dark_url: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
                    placeholder="https://exemplo.com/logo-dark.png"
                  />
                  {formData.logo_dark_url && (
                    <img src={formData.logo_dark_url} alt="Logo Dark Preview" className="mt-2 h-16 object-contain bg-gray-900 p-2 rounded" />
                  )}
                </div>
              </div>

              {/* Cores */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">Cores</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Cor Primária</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.primary_color}
                        onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded font-mono text-sm"
                        placeholder="#F63012"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Cor Secundária</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.secondary_color}
                        onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.secondary_color}
                        onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded font-mono text-sm"
                        placeholder="#FF0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Cor de Fundo</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.background_color}
                        onChange={(e) => setFormData({...formData, background_color: e.target.value})}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.background_color}
                        onChange={(e) => setFormData({...formData, background_color: e.target.value})}
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
                        value={formData.text_color}
                        onChange={(e) => setFormData({...formData, text_color: e.target.value})}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.text_color}
                        onChange={(e) => setFormData({...formData, text_color: e.target.value})}
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded font-mono text-sm"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Cor de Destaque</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.accent_color}
                        onChange={(e) => setFormData({...formData, accent_color: e.target.value})}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.accent_color}
                        onChange={(e) => setFormData({...formData, accent_color: e.target.value})}
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded font-mono text-sm"
                        placeholder="#FFA500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Imagens */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">Imagens</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">URL da Splash Screen</label>
                  <input
                    type="url"
                    value={formData.splash_screen_url}
                    onChange={(e) => setFormData({...formData, splash_screen_url: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
                    placeholder="https://exemplo.com/splash.png"
                  />
                  {formData.splash_screen_url && (
                    <img src={formData.splash_screen_url} alt="Splash Preview" className="mt-2 h-32 object-contain bg-gray-900 p-2 rounded" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">URL do Hero Banner</label>
                  <input
                    type="url"
                    value={formData.hero_banner_url}
                    onChange={(e) => setFormData({...formData, hero_banner_url: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
                    placeholder="https://exemplo.com/hero.png"
                  />
                  {formData.hero_banner_url && (
                    <img src={formData.hero_banner_url} alt="Hero Preview" className="mt-2 h-32 object-cover w-full rounded" />
                  )}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-800 p-4 rounded border border-gray-700">
                <h3 className="text-sm font-medium mb-3 text-gray-300">Preview</h3>
                <div 
                  className="p-6 rounded text-center"
                  style={{
                    backgroundColor: formData.background_color,
                    color: formData.text_color
                  }}
                >
                  {formData.logo_url && (
                    <img src={formData.logo_url} alt="Logo" className="h-12 mx-auto mb-4 object-contain" />
                  )}
                  <h4 className="text-2xl font-bold mb-2">{formData.app_name || 'Nome do App'}</h4>
                  <button 
                    type="button"
                    className="px-6 py-2 rounded font-medium"
                    style={{
                      backgroundColor: formData.primary_color,
                      color: formData.text_color
                    }}
                  >
                    Botão Primário
                  </button>
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
                        backgroundColor: template.background_color,
                        border: `2px solid ${template.primary_color}`
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
              <p><strong>App:</strong> {formData.app_name}</p>
              <p><strong>Cor Primária:</strong> {formData.primary_color}</p>
              <p><strong>Cor de Fundo:</strong> {formData.background_color}</p>
              <p><strong>Cor do Texto:</strong> {formData.text_color}</p>
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
