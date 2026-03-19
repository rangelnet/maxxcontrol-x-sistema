import { useState, useEffect } from 'react'
import api from '../services/api'
import { Plus, Edit, Trash2, Save, X, CheckCircle, XCircle, Activity, Clock, AlertTriangle } from 'lucide-react'

const APIPanel = () => {
  const [activeTab, setActiveTab] = useState('config')
  const [apis, setApis] = useState([])
  const [categories, setCategories] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingAPI, setEditingAPI] = useState(null)
  const [formData, setFormData] = useState({ nome: '', descricao: '', url: '', categoria: '', critica: false, ativa: true, metodo: 'GET', headers: '', timeout: 5000 })
  const [monitorData, setMonitorData] = useState(null)
  const [monitorLoading, setMonitorLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => { loadAPIs(); loadCategories() }, [])
  useEffect(() => { if (activeTab === 'monitor') loadMonitorData() }, [activeTab])
  useEffect(() => {
    if (!autoRefresh || activeTab !== 'monitor') return
    const interval = setInterval(loadMonitorData, 30000)
    return () => clearInterval(interval)
  }, [autoRefresh, activeTab])

  const loadAPIs = async () => {
    try { const r = await api.get('/api/api-config'); setApis(r.data.apis) }
    catch (e) { console.error('Erro ao carregar APIs:', e) }
  }
  const loadCategories = async () => {
    try { const r = await api.get('/api/api-config/categories/list'); setCategories(r.data.categories) }
    catch (e) { console.error('Erro ao carregar categorias:', e) }
  }
  const loadMonitorData = async () => {
    try { const r = await api.get('/api/api-monitor/check-all'); setMonitorData(r.data) }
    catch (e) { console.error('Erro monitor:', e) }
    finally { setMonitorLoading(false) }
  }
  const resetForm = () => setFormData({ nome: '', descricao: '', url: '', categoria: '', critica: false, ativa: true, metodo: 'GET', headers: '', timeout: 5000 })
  const openNewModal = () => { setEditingAPI(null); resetForm(); setShowModal(true) }
  const handleEdit = (a) => {
    setEditingAPI(a)
    setFormData({ nome: a.nome, descricao: a.descricao || '', url: a.url, categoria: a.categoria || '', critica: a.critica, ativa: a.ativa, metodo: a.metodo || 'GET', headers: a.headers ? JSON.stringify(a.headers, null, 2) : '', timeout: a.timeout || 5000 })
    setShowModal(true)
  }
  const handleDelete = async (id) => {
    if (!confirm('Deseja realmente deletar esta API?')) return
    try { await api.delete(`/api/api-config/${id}`); loadAPIs() }
    catch (e) { alert('Erro ao deletar API') }
  }
  const toggleActive = async (a) => {
    try { await api.put(`/api/api-config/${a.id}`, { ...a, ativa: !a.ativa }); loadAPIs() }
    catch (e) { console.error('Erro ao atualizar status:', e) }
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingAPI) await api.put(`/api/api-config/${editingAPI.id}`, formData)
      else await api.post('/api/api-config', formData)
      setShowModal(false); setEditingAPI(null); resetForm(); loadAPIs(); loadCategories()
    } catch (e) { alert('Erro ao salvar API') }
  }
  const statusColor = (s) => s === 'online' ? 'text-green-500' : 'text-red-500'
  const statusIcon = (s) => s === 'online' ? <CheckCircle size={20} /> : <XCircle size={20} />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">APIs</h1>
        {activeTab === 'config' && (
          <button onClick={openNewModal} className="btn-primary flex items-center gap-2"><Plus size={20} />Nova API</button>
        )}
        {activeTab === 'monitor' && (
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="w-4 h-4" />
              Auto-refresh (30s)
            </label>
            <button onClick={loadMonitorData} className="btn-primary">Atualizar Agora</button>
          </div>
        )}
      </div>

      <div className="flex gap-1 mb-6 bg-gray-900 p-1 rounded-xl w-fit">
        <button onClick={() => setActiveTab('config')} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'config' ? 'bg-[#FF4D33] text-white' : 'text-gray-400 hover:text-white'}`}>Configuracao</button>
        <button onClick={() => setActiveTab('monitor')} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'monitor' ? 'bg-[#FF4D33] text-white' : 'text-gray-400 hover:text-white'}`}><Activity size={16} />Monitor</button>
      </div>

      {activeTab === 'config' && (
        <div className="space-y-4">
          {apis.map((a) => (
            <div key={a.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{a.nome}</h3>
                    {a.critica && <span className="px-2 py-1 bg-red-500/20 text-red-500 text-xs rounded">Critica</span>}
                    {a.categoria && <span className="px-2 py-1 bg-blue-500/20 text-blue-500 text-xs rounded">{a.categoria}</span>}
                    <button onClick={() => toggleActive(a)} className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${a.ativa ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                      {a.ativa ? <CheckCircle size={14} /> : <XCircle size={14} />}{a.ativa ? 'Ativa' : 'Inativa'}
                    </button>
                  </div>
                  {a.descricao && <p className="text-gray-400 mb-2">{a.descricao}</p>}
                  <p className="text-sm text-gray-500 font-mono mb-2">{a.url}</p>
                  <div className="flex gap-4 text-xs text-gray-500"><span>Metodo: {a.metodo}</span><span>Timeout: {a.timeout}ms</span></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(a)} className="p-2 hover:bg-gray-800 rounded transition-colors"><Edit size={18} className="text-blue-500" /></button>
                  <button onClick={() => handleDelete(a.id)} className="p-2 hover:bg-gray-800 rounded transition-colors"><Trash2 size={18} className="text-red-500" /></button>
                </div>
              </div>
            </div>
          ))}
          {apis.length === 0 && <div className="card text-center text-gray-400">Nenhuma API configurada. Clique em "Nova API" para adicionar.</div>}
        </div>
      )}

      {activeTab === 'monitor' && (
        <div>
          {monitorLoading ? <div className="text-center py-8">Carregando...</div> : (
            <>
              {monitorData?.summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="card"><div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm mb-1">Total de APIs</p><p className="text-3xl font-bold">{monitorData.summary.total}</p></div><Activity className="text-blue-500" size={40} /></div></div>
                  <div className="card"><div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm mb-1">Online</p><p className="text-3xl font-bold text-green-500">{monitorData.summary.online}</p></div><CheckCircle className="text-green-500" size={40} /></div></div>
                  <div className="card"><div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm mb-1">Offline</p><p className="text-3xl font-bold text-red-500">{monitorData.summary.offline}</p></div><XCircle className="text-red-500" size={40} /></div></div>
                  <div className="card"><div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm mb-1">Latencia Media</p><p className="text-3xl font-bold">{monitorData.summary.avg_latency}ms</p></div><Clock className="text-primary" size={40} /></div></div>
                </div>
              )}
              {monitorData?.summary?.critical_offline > 0 && (
                <div className="card bg-red-500/10 border-red-500 mb-8">
                  <div className="flex items-center gap-3"><AlertTriangle className="text-red-500" size={24} /><div><p className="font-bold text-red-500">Atencao!</p><p className="text-sm text-gray-300">{monitorData.summary.critical_offline} API(s) critica(s) estao offline</p></div></div>
                </div>
              )}
              <div className="card">
                <h2 className="text-xl font-bold mb-4">Status das APIs</h2>
                <div className="space-y-3">
                  {monitorData?.apis?.map((a, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-900 rounded">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={statusColor(a.status)}>{statusIcon(a.status)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2"><p className="font-semibold">{a.name}</p>{a.critical && <span className="px-2 py-1 bg-red-500/20 text-red-500 text-xs rounded">Critica</span>}</div>
                          <p className="text-sm text-gray-400 font-mono">{a.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        {a.status === 'online' && <><div className="text-center"><p className="text-gray-400">Status</p><p className="font-semibold">{a.statusCode}</p></div><div className="text-center"><p className="text-gray-400">Latencia</p><p className="font-semibold">{a.latency}ms</p></div></>}
                        {a.status === 'offline' && a.error && <div className="text-right"><p className="text-red-500 text-xs">{a.error}</p></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingAPI ? 'Editar API' : 'Nova API'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-sm font-medium mb-2">Nome da API *</label><input type="text" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded" placeholder="Ex: Auth API" required /></div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-2">Descricao</label><textarea value={formData.descricao} onChange={(e) => setFormData({...formData, descricao: e.target.value})} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded" rows="2" /></div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-2">URL *</label><input type="url" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded" placeholder="https://api.exemplo.com/" required /></div>
                <div><label className="block text-sm font-medium mb-2">Categoria</label><input type="text" value={formData.categoria} onChange={(e) => setFormData({...formData, categoria: e.target.value})} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded" list="cats" /><datalist id="cats">{categories.map(c => <option key={c} value={c} />)}</datalist></div>
                <div><label className="block text-sm font-medium mb-2">Metodo HTTP</label><select value={formData.metodo} onChange={(e) => setFormData({...formData, metodo: e.target.value})} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option><option>PATCH</option></select></div>
                <div><label className="block text-sm font-medium mb-2">Timeout (ms)</label><input type="number" value={formData.timeout} onChange={(e) => setFormData({...formData, timeout: parseInt(e.target.value)})} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded" min="1000" max="30000" /></div>
                <div className="col-span-2"><label className="block text-sm font-medium mb-2">Headers (JSON)</label><textarea value={formData.headers} onChange={(e) => setFormData({...formData, headers: e.target.value})} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded font-mono text-sm" rows="3" placeholder='{"Authorization": "Bearer token"}' /></div>
                <div className="col-span-2 flex gap-4">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={formData.critica} onChange={(e) => setFormData({...formData, critica: e.target.checked})} className="w-4 h-4" /><span className="text-sm">API Critica</span></label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={formData.ativa} onChange={(e) => setFormData({...formData, ativa: e.target.checked})} className="w-4 h-4" /><span className="text-sm">Ativa (monitorar)</span></label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2"><Save size={18} />{editingAPI ? 'Atualizar' : 'Criar'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default APIPanel