import { useState, useEffect } from 'react'
import api from '../services/api'
import { Server, Plus, Edit, Trash2, Settings, CheckCircle, AlertCircle, Users, X, Save, RefreshCw, Globe } from 'lucide-react'

const inputStyle = {
  width:'100%', padding:'10px 14px', background:'rgba(5,5,5,0.6)',
  border:'1px solid rgba(255,255,255,0.08)', borderRadius:10,
  color:'#fff', fontSize:13, outline:'none', boxSizing:'border-box',
}
const labelStyle = {
  display:'block', fontSize:11, fontWeight:700, color:'#71717a',
  textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:7,
}

const statusCfg = {
  ativo:       { color:'#34d399', bg:'rgba(16,185,129,0.12)',  border:'rgba(16,185,129,0.25)',  label:'ATIVO'      },
  'manutenção':{ color:'#facc15', bg:'rgba(250,204,21,0.12)',  border:'rgba(250,204,21,0.25)',  label:'MANUTENÇÃO' },
  inativo:     { color:'#f87171', bg:'rgba(239,68,68,0.12)',   border:'rgba(239,68,68,0.25)',   label:'INATIVO'    },
}

const ServerBadge = ({ status }) => {
  const s = statusCfg[status] || statusCfg.inativo
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:999, background:s.bg, border:`1px solid ${s.border}`, color:s.color, fontSize:11, fontWeight:800 }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:s.color }}/>
      {s.label}
    </span>
  )
}

const ServersManagement = () => {
  const [servers, setServers]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [showModal, setShowModal]     = useState(false)
  const [editingServer, setEditingServer] = useState(null)
  const [saving, setSaving]           = useState(false)
  const [toast, setToast]             = useState(null)
  const [formData, setFormData]       = useState({ name:'', url:'', region:'', priority:100, status:'ativo' })

  useEffect(() => { loadServers() }, [])

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),2800) }

  const loadServers = async () => {
    try {
      const r = await api.get('/api/iptv/servers/all')
      setServers(r.data)
    } catch (err) {
      if (err.response?.status===401) { window.location.href='/login'; return }
      showToast(err.response?.data?.error||'Erro ao carregar servidores','error')
    } finally { setLoading(false) }
  }

  const openCreate = () => { setEditingServer(null); setFormData({name:'',url:'',region:'',priority:100,status:'ativo'}); setShowModal(true) }
  const openEdit   = (s) => { setEditingServer(s); setFormData({name:s.name,url:s.url,region:s.region||'',priority:s.priority,status:s.status}); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.url.trim()) { showToast('Nome e URL são obrigatórios','error'); return }
    setSaving(true)
    try {
      if (editingServer) await api.put(`/api/iptv/servers/${editingServer.id}`, formData)
      else await api.post('/api/iptv/servers', formData)
      showToast(editingServer ? 'Servidor atualizado!' : 'Servidor criado!')
      setShowModal(false); loadServers()
    } catch (err) { showToast(err.response?.data?.error||'Erro ao salvar','error') }
    finally { setSaving(false) }
  }

  const deleteServer = async (id, name) => {
    if (!confirm(`Excluir o servidor "${name}"?\nEsta ação não pode ser desfeita.`)) return
    try { await api.delete(`/api/iptv/servers/${id}`); showToast('Servidor excluído!'); loadServers() }
    catch (err) { showToast(err.response?.data?.error||'Erro ao excluir','error') }
  }

  const setMaintenance = async (id, name) => {
    if (!confirm(`Colocar "${name}" em manutenção?`)) return
    try { await api.post(`/api/iptv/servers/${id}/maintenance`); showToast('Servidor em manutenção!'); loadServers() }
    catch { showToast('Erro ao atualizar status','error') }
  }

  const activateServer = async (id, name) => {
    if (!confirm(`Ativar o servidor "${name}"?`)) return
    try { await api.post(`/api/iptv/servers/${id}/activate`); showToast('Servidor ativado!'); loadServers() }
    catch { showToast('Erro ao ativar servidor','error') }
  }

  const refreshUsers = async (id) => {
    try {
      const r = await api.get(`/api/iptv/servers/${id}/users`)
      showToast(`${r.data.server_name}: ${r.data.users} usuário(s) ativo(s)`)
      loadServers()
    } catch { showToast('Erro ao atualizar contagem','error') }
  }

  const formatDate = (date) => date ? new Date(date).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}) : '—'

  const ativo = servers.filter(s=>s.status==='ativo').length
  const btnPrimary = { display:'inline-flex', alignItems:'center', gap:7, padding:'10px 20px', background:'linear-gradient(135deg,#FFA500,#FF6B00)', border:'none', borderRadius:10, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 12px rgba(255,165,0,0.3)' }
  const btnGhost   = { display:'inline-flex', alignItems:'center', gap:7, padding:'10px 16px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'#a1a1aa', fontSize:13, fontWeight:600, cursor:'pointer' }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:24, right:24, zIndex:200, background:toast.type==='error'?'rgba(239,68,68,0.95)':'rgba(16,185,129,0.95)', backdropFilter:'blur(12px)', borderRadius:12, padding:'12px 20px', color:'#fff', fontSize:13, fontWeight:700, boxShadow:'0 12px 30px rgba(0,0,0,0.4)', display:'flex', alignItems:'center', gap:8 }}>
          {toast.type==='error'?<AlertCircle size={16}/>:<CheckCircle size={16}/>} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:900, color:'#fff', display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <Globe size={26} color='#FFA500'/> Servidores IPTV
          </h1>
          <p style={{ fontSize:12, color:'#52525b' }}>
            {servers.length} servidor(es) · <span style={{ color:'#34d399' }}>{ativo} ativo(s)</span>
          </p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => loadServers()} style={btnGhost}><RefreshCw size={14}/> Atualizar</button>
          <button onClick={openCreate} style={btnPrimary}><Plus size={15}/> Adicionar Servidor</button>
        </div>
      </div>

      {/* Tabela */}
      <div style={{ background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)', border:'1px solid rgba(255,165,0,0.1)', borderRadius:16, overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.35)' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:48, color:'#52525b' }}>
            <RefreshCw size={26} color='#FFA500' style={{ animation:'spin 1s linear infinite', display:'block', margin:'0 auto 12px' }}/>
            Carregando servidores...
          </div>
        ) : servers.length===0 ? (
          <div style={{ textAlign:'center', padding:48, color:'#52525b' }}>
            <Server size={36} color='#27272a' style={{ display:'block', margin:'0 auto 12px' }}/>
            <p style={{ fontSize:14, marginBottom:16 }}>Nenhum servidor cadastrado.</p>
            <button onClick={openCreate} style={btnPrimary}><Plus size={14}/> Adicionar Primeiro</button>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  {['Servidor','URL','Região','Prioridade','Status','Usuários','Criado em','Ações'].map(h => (
                    <th key={h} style={{ padding:'11px 16px', textAlign:'left', fontSize:10, fontWeight:700, color:'#52525b', textTransform:'uppercase', letterSpacing:'0.08em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {servers.map((s,idx) => (
                  <tr key={s.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', background:idx%2===0?'transparent':'rgba(255,255,255,0.01)', transition:'background .15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(255,165,0,0.04)'}
                    onMouseLeave={e=>e.currentTarget.style.background=idx%2===0?'transparent':'rgba(255,255,255,0.01)'}
                  >
                    <td style={{ padding:'12px 16px', whiteSpace:'nowrap' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:32, height:32, borderRadius:8, background:'rgba(255,165,0,0.1)', border:'1px solid rgba(255,165,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <Server size={14} color='#FFA500'/>
                        </div>
                        <span style={{ fontSize:13, fontWeight:700, color:'#e4e4e7' }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:'12px 16px', maxWidth:220 }}>
                      <span style={{ fontFamily:'monospace', fontSize:11, color:'#52525b', display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.url}</span>
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:12, color:'#a1a1aa', whiteSpace:'nowrap' }}>{s.region||'—'}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:999, background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.25)', color:'#60a5fa', fontSize:11, fontWeight:800 }}>{s.priority}</span>
                    </td>
                    <td style={{ padding:'12px 16px', whiteSpace:'nowrap' }}><ServerBadge status={s.status}/></td>
                    <td style={{ padding:'12px 16px' }}>
                      <button onClick={() => refreshUsers(s.id)} style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:'none', cursor:'pointer', color:'#71717a', fontSize:12 }}>
                        <Users size={13}/> <span style={{ fontWeight:700, color:'#a1a1aa' }}>{s.users||0}</span>
                      </button>
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:11, color:'#52525b', whiteSpace:'nowrap' }}>{formatDate(s.created_at)}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', gap:4 }}>
                        <button onClick={() => openEdit(s)} title='Editar'
                          style={{ width:30, height:30, borderRadius:8, background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#60a5fa' }}>
                          <Edit size={13}/>
                        </button>
                        {s.status==='ativo' ? (
                          <button onClick={() => setMaintenance(s.id,s.name)} title='Manutenção'
                            style={{ width:30, height:30, borderRadius:8, background:'rgba(250,204,21,0.12)', border:'1px solid rgba(250,204,21,0.2)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#facc15' }}>
                            <Settings size={13}/>
                          </button>
                        ) : (
                          <button onClick={() => activateServer(s.id,s.name)} title='Ativar'
                            style={{ width:30, height:30, borderRadius:8, background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.2)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#34d399' }}>
                            <CheckCircle size={13}/>
                          </button>
                        )}
                        <button onClick={() => deleteServer(s.id,s.name)} title='Excluir'
                          style={{ width:30, height:30, borderRadius:8, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#f87171' }}>
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16 }}
          onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div style={{ background:'rgba(17,17,17,0.96)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,165,0,0.18)', borderRadius:20, padding:28, width:'100%', maxWidth:480, boxShadow:'0 25px 60px rgba(0,0,0,0.6)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,165,0,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Server size={18} color='#FFA500'/>
                </div>
                <h2 style={{ fontSize:16, fontWeight:800, color:'#fff' }}>{editingServer?'Editar Servidor':'Adicionar Servidor'}</h2>
              </div>
              <button onClick={()=>setShowModal(false)} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color:'#71717a', cursor:'pointer' }}>
                <X size={16}/>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={labelStyle}>Nome do Servidor *</label>
                <input style={inputStyle} value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} placeholder='Servidor Brasil' required/>
              </div>
              <div>
                <label style={labelStyle}>URL do Servidor *</label>
                <input style={inputStyle} type='url' value={formData.url} onChange={e=>setFormData({...formData,url:e.target.value})} placeholder='http://servidor.com:8080' required/>
                <p style={{ fontSize:10, color:'#52525b', marginTop:5 }}>Inclua protocolo (http:// ou https://) e porta</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={labelStyle}>Região</label>
                  <input style={inputStyle} value={formData.region} onChange={e=>setFormData({...formData,region:e.target.value})} placeholder='Brasil, EUA...'/>
                </div>
                <div>
                  <label style={labelStyle}>Prioridade</label>
                  <input style={inputStyle} type='number' value={formData.priority} onChange={e=>setFormData({...formData,priority:parseInt(e.target.value)})} min={1} max={999}/>
                  <p style={{ fontSize:10, color:'#52525b', marginTop:5 }}>1 = maior prioridade</p>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select style={inputStyle} value={formData.status} onChange={e=>setFormData({...formData,status:e.target.value})}>
                  <option value='ativo'>Ativo</option>
                  <option value='manutenção'>Manutenção</option>
                  <option value='inativo'>Inativo</option>
                </select>
              </div>
              <div style={{ display:'flex', gap:8, marginTop:4 }}>
                <button type='submit' disabled={saving} style={{ ...btnPrimary, flex:1, justifyContent:'center', opacity:saving?0.7:1 }}>
                  <Save size={15}/> {saving?'Salvando…':editingServer?'Atualizar':'Criar Servidor'}
                </button>
                <button type='button' onClick={()=>setShowModal(false)} style={{ ...btnGhost, flex:1, justifyContent:'center' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default ServersManagement
