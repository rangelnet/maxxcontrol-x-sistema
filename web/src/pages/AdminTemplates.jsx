import { useState, useEffect } from 'react'
import api from '../services/api'
import { 
  Type, Layout, Image as ImageIcon, Plus, Trash2, Save, 
  Settings, Layers, Monitor, Phone, Info, AlertTriangle,
  Upload, CheckCircle, ChevronRight, X
} from 'lucide-react'

export default function AdminTemplates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [previewActive, setPreviewActive] = useState('feed') // 'feed' | 'story'
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'movie',
    bg_url: '',
    overlay_url: '',
    config: {
      poster_x: 50,
      poster_y: 50,
      poster_scale: 1,
      text_color: '#ffffff',
      font_family: 'Inter',
      show_synopsis: true
    }
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/banner-templates')
      if (res.data.templates) setTemplates(res.data.templates)
    } catch (err) {
      console.error('Erro ao buscar templates:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const method = editingTemplate ? 'put' : 'post'
    const url = editingTemplate ? `/api/banner-templates/${editingTemplate.id}` : '/api/banner-templates'

    try {
      const res = await api[method](url, formData)
      
      if (res.status === 200 || res.status === 201) {
        setShowModal(false)
        fetchTemplates()
        setEditingTemplate(null)
        setFormData({ name: '', type: 'movie', bg_url: '', overlay_url: '', config: { poster_x: 50, poster_y: 50, poster_scale: 1, text_color: '#ffffff', font_family: 'Inter', show_synopsis: true } })
      }
    } catch (err) {
      console.error('Erro ao salvar template:', err)
    }
  }

  const handleEdit = (temp) => {
    setEditingTemplate(temp)
    setFormData({
      name: temp.name,
      type: temp.type,
      bg_url: temp.bg_url,
      overlay_url: temp.overlay_url,
      config: temp.config || formData.config
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Deseja realmente excluir este template?')) return
    try {
      const res = await api.delete(`/api/banner-templates/${id}`)
      if (res.status === 200) fetchTemplates()
    } catch (err) {
      console.error('Erro ao deletar:', err)
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Fábrica de <span className="text-brand-500">Temas</span></h1>
          <p className="text-zinc-400 text-sm mt-1">Crie as molduras e estilos que serão usados pelos revendedores.</p>
        </div>
        <button 
          onClick={() => { setEditingTemplate(null); setShowModal(true); }}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Novo Modelo de Encarte
        </button>
      </div>

      {/* AVISO MASTER */}
      <div className="bg-brand-500/10 border border-brand-500/20 p-4 rounded-2xl flex items-center gap-4">
        <div className="h-10 w-10 bg-brand-500/20 rounded-full flex items-center justify-center text-brand-400 shrink-0">
          <Settings size={20} />
        </div>
        <p className="text-sm text-zinc-300 leading-relaxed text-balance">
          Esta é a sua **Oficina Privada**. Os modelos que você criar aqui aparecerão na barra de seleção do Gerador de Banners para todos os seus logistas.
        </p>
      </div>

      {/* GRID DE TEMPLATES */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white/5 animate-pulse rounded-2xl border border-white/5"></div>)}
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-[#111] border border-dashed border-white/10 rounded-3xl p-20 text-center">
          <ImageIcon size={48} className="mx-auto text-zinc-700 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhum template cadastrado</h3>
          <p className="text-zinc-500 max-w-sm mx-auto">Você ainda não criou nenhuma moldura. Comece agora para dar uma cara única aos banners da sua rede.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(temp => (
            <div key={temp.id} className="group relative bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-brand-500/50 transition-all shadow-xl">
              <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                {temp.bg_url ? (
                  <img src={temp.bg_url} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="" />
                ) : (
                  <div className="text-zinc-800"><ImageIcon size={40} /></div>
                )}
                {temp.overlay_url && (
                  <img src={temp.overlay_url} className="absolute inset-0 w-full h-full object-contain z-10" alt="" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20"></div>
                
                <span className="absolute top-3 left-3 px-2 py-1 rounded-md bg-brand-500/20 border border-brand-500/30 text-[10px] font-black uppercase text-brand-400 z-30">
                  {temp.type === 'movie' ? 'Filmes' : temp.type === 'serie' ? 'Séries' : 'Jogos'}
                </span>
              </div>
              
              <div className="p-4 relative z-30 flex justify-between items-center bg-[#0d0d0d]">
                <div>
                  <h3 className="text-white font-bold">{temp.name}</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Configurado em {new Date(temp.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(temp)} className="p-2 text-zinc-400 hover:text-brand-500 transition"><Settings size={18} /></button>
                  <button onClick={() => handleDelete(temp.id)} className="p-2 text-zinc-400 hover:text-red-500 transition"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
          
          <div className="relative bg-[#111] border border-white/10 rounded-[2.5rem] w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in">
            {/* Header Modal */}
            <div className="p-8 border-b border-white/10 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-2xl font-black text-white">{editingTemplate ? 'Editar' : 'Novo'} <span className="text-brand-500">Tema Estrutural</span></h2>
                <p className="text-zinc-400 text-sm mt-1">Configure as camadas e o motor de renderização do banner.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-zinc-500 hover:text-white transition bg-white/5 rounded-full"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col lg:flex-row">
              {/* FORMULÁRIO */}
              <form onSubmit={handleSave} className="flex-1 p-8 space-y-6 lg:border-r border-white/10">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block mb-2">Nome do Tema</label>
                    <input 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: Lançamento Red Prime" 
                      className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-5 text-white placeholder-zinc-700 focus:outline-none focus:border-brand-500 transition shadow-inner"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block mb-2">Categoria</label>
                      <select 
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-brand-500 transition appearance-none"
                      >
                        <option value="movie">Filmes</option>
                        <option value="serie">Séries</option>
                        <option value="iptv">Canais de TV</option>
                        <option value="game">Grade de Jogos</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block mb-2">Cor de Destaque</label>
                      <div className="flex gap-2">
                        <input 
                          type="color" 
                          value={formData.config.text_color}
                          onChange={e => setFormData({...formData, config: {...formData.config, text_color: e.target.value}})}
                          className="h-14 w-14 bg-black/50 border border-white/10 rounded-2xl p-2 cursor-pointer"
                        />
                        <input 
                          type="text" 
                          value={formData.config.text_color}
                          onChange={e => setFormData({...formData, config: {...formData.config, text_color: e.target.value}})}
                          className="flex-1 bg-black/50 border border-white/10 rounded-2xl py-4 px-5 text-white font-mono uppercase text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="border-white/5 my-6" />

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><Layers size={16} className="text-brand-500" /> Camadas do Banner</h4>
                    
                    <div>
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-2">1. Background (Fundo Sólido ou Textura)</label>
                      <div className="relative">
                        <input 
                          value={formData.bg_url}
                          onChange={e => setFormData({...formData, bg_url: e.target.value})}
                          placeholder="Link da imagem de fundo" 
                          className="w-full bg-black/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-zinc-700 focus:outline-none focus:border-brand-500 transition text-sm"
                        />
                        <ImageIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-2">2. Overlay (Moldura c/ transparencia .png)</label>
                      <div className="relative">
                        <input 
                          value={formData.overlay_url}
                          onChange={e => setFormData({...formData, overlay_url: e.target.value})}
                          placeholder="Link da moldura em PNG" 
                          className="w-full bg-black/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-zinc-700 focus:outline-none focus:border-brand-500 transition text-sm"
                        />
                        <Layout size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button type="submit" className="w-full bg-gradient-to-r from-brand-600 to-indigo-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-brand-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                    <Save size={20} /> Salvar Configurações do Tema
                  </button>
                </div>
              </form>

              {/* PREVIEW EM TEMPO REAL */}
              <div className="lg:w-[400px] bg-black/40 p-8 flex flex-col items-center gap-6">
                <div className="w-full pb-4 border-b border-white/5">
                  <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest text-center">Preview Teórico</h4>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setPreviewActive('feed')} className={`px-4 py-2 rounded-full text-[10px] font-bold transition ${previewActive === 'feed' ? 'bg-brand-500 text-white' : 'bg-white/5 text-zinc-500'}`}>FEED (1:1)</button>
                  <button onClick={() => setPreviewActive('story')} className={`px-4 py-2 rounded-full text-[10px] font-bold transition ${previewActive === 'story' ? 'bg-brand-500 text-white' : 'bg-white/5 text-zinc-500'}`}>STORES (9:16)</button>
                </div>

                {/* ÁREA DO CANVAS SIMULADA */}
                <div className={`relative bg-zinc-900 border border-white/10 shadow-2xl transition-all overflow-hidden ${previewActive === 'feed' ? 'aspect-square w-full' : 'aspect-[9/16] h-[400px]'}`}>
                  {/* Camada 1: BG */}
                  <div className="absolute inset-0 z-0">
                    {formData.bg_url ? (
                      <img src={formData.bg_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#111] to-[#050505]"></div>
                    )}
                  </div>

                  {/* Camada 2: Conteúdo TMDB (Simulado) */}
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-24 h-36 bg-zinc-800 rounded shadow-2xl border border-white/10 flex items-center justify-center mb-4">
                      <ImageIcon className="text-zinc-700" />
                    </div>
                    <div className="h-4 w-32 bg-zinc-800 rounded-full mb-2"></div>
                    <div className="h-2 w-48 bg-zinc-800 rounded-full mb-1"></div>
                    <div className="h-2 w-40 bg-zinc-800 rounded-full"></div>
                  </div>

                  {/* Camada 3: Overlay */}
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    {formData.overlay_url && (
                      <img src={formData.overlay_url} className="w-full h-full object-contain" alt="" />
                    )}
                  </div>

                  {/* Label Camadas */}
                  <div className="absolute bottom-4 left-4 z-30 space-y-1">
                    <span className="block text-[8px] bg-black/60 text-zinc-400 px-2 py-0.5 rounded backdrop-blur-sm">Camada 3: Overlay</span>
                    <span className="block text-[8px] bg-black/60 text-zinc-400 px-2 py-0.5 rounded backdrop-blur-sm">Camada 2: TMDB Data</span>
                    <span className="block text-[8px] bg-black/60 text-zinc-400 px-2 py-0.5 rounded backdrop-blur-sm">Camada 1: Background</span>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-2xl flex gap-3 items-start">
                  <Info size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                    O gerador vai empilhar as imagens nesta ordem exata. Certifique-se que o seu **Overlay** tem fundo transparente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
