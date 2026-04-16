import { useState, useEffect } from 'react'
import api from '../services/api'
import { Server, Save, TestTube, AlertCircle, CheckCircle, Plus, Edit, Trash2, Settings, Users, X, Eye, EyeOff, Globe, Zap } from 'lucide-react'

// ─── Estilos base ───────────────────────────────────────────
const inputStyle = {
  width:'100%', padding:'10px 14px', background:'rgba(5,5,5,0.6)',
  border:'1px solid rgba(255,255,255,0.08)', borderRadius:10,
  color:'#fff', fontSize:13, outline:'none', boxSizing:'border-box',
}
const labelStyle = {
  display:'block', fontSize:11, fontWeight:700, color:'#71717a',
  textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:7,
}
const btnPrimary = {
  display:'inline-flex', alignItems:'center', gap:7, padding:'10px 20px',
  background:'linear-gradient(135deg,#FFA500,#FF6B00)', border:'none',
  borderRadius:10, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer',
  boxShadow:'0 4px 12px rgba(255,165,0,0.3)',
}
const btnGhost = {
  display:'inline-flex', alignItems:'center', gap:7, padding:'10px 16px',
  background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
  borderRadius:10, color:'#a1a1aa', fontSize:13, fontWeight:600, cursor:'pointer',
}

const statusCfg = {
  ativo:        { color:'#34d399', bg:'rgba(16,185,129,0.12)',  border:'rgba(16,185,129,0.25)',  label:'ATIVO'      },
  manutencao:   { color:'#facc15', bg:'rgba(250,204,21,0.12)',  border:'rgba(250,204,21,0.25)',  label:'MANUTENÇÃO' },
  'manutenção': { color:'#facc15', bg:'rgba(250,204,21,0.12)',  border:'rgba(250,204,21,0.25)',  label:'MANUTENÇÃO' },
  inativo:      { color:'#f87171', bg:'rgba(239,68,68,0.12)',   border:'rgba(239,68,68,0.25)',   label:'INATIVO'    },
}

const StatusBadge = ({ status }) => {
  const s = statusCfg[status] || statusCfg.inativo
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:999, background:s.bg, border:`1px solid ${s.border}`, color:s.color, fontSize:11, fontWeight:800 }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:s.color }}/>{s.label}
    </span>
  )
}

// ─── Feedback Alert ─────────────────────────────────────────
const MsgAlert = ({ msg }) => {
  if (!msg.text) return null
  const ok = msg.type === 'success'
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 14px', borderRadius:10, background: ok?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)', border:`1px solid ${ok?'rgba(16,185,129,0.25)':'rgba(239,68,68,0.25)'}`, color: ok?'#34d399':'#f87171', fontSize:13 }}>
      {ok ? <CheckCircle size={16}/> : <AlertCircle size={16}/>} {msg.text}
    </div>
  )
}

// ─── Modal Server ────────────────────────────────────────────
const ServerModal = ({ onClose, onSave, editing }) => {
  const [form, setForm] = useState(
    editing ? { name:editing.name, url:editing.url, region:editing.region||'', priority:editing.priority, status:editing.status }
            : { name:'', url:'', region:'', priority:100, status:'ativo' }
  )
  const [saving, setSaving] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.url.trim()) return
    setSaving(true)
    await onSave(form, editing?.id)
    setSaving(false)
  }
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'rgba(17,17,17,0.96)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,165,0,0.18)', borderRadius:20, padding:28, width:'100%', maxWidth:460, boxShadow:'0 25px 60px rgba(0,0,0,0.6)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,165,0,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Server size={18} color='#FFA500'/>
            </div>
            <h2 style={{ fontSize:16, fontWeight:800, color:'#fff' }}>{editing?'Editar':'Adicionar'} Servidor</h2>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color:'#71717a', cursor:'pointer' }}>
            <X size={16}/>
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div><label style={labelStyle}>Nome *</label><input style={inputStyle} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder='Servidor Brasil' required/></div>
          <div><label style={labelStyle}>URL *</label><input style={inputStyle} type='url' value={form.url} onChange={e=>setForm({...form,url:e.target.value})} placeholder='http://servidor.com:8080' required/></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><label style={labelStyle}>Região</label><input style={inputStyle} value={form.region} onChange={e=>setForm({...form,region:e.target.value})} placeholder='Brasil...'/></div>
            <div><label style={labelStyle}>Prioridade</label><input style={inputStyle} type='number' value={form.priority} onChange={e=>setForm({...form,priority:parseInt(e.target.value)})} min={1} max={999}/></div>
          </div>
          <div><label style={labelStyle}>Status</label>
            <select style={inputStyle} value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
              <option value='ativo'>Ativo</option><option value='manutencao'>Manutenção</option><option value='inativo'>Inativo</option>
            </select>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:4 }}>
            <button type='submit' disabled={saving} style={{ ...btnPrimary, flex:1, justifyContent:'center', opacity:saving?0.7:1 }}><Save size={15}/> {saving?'Salvando…':editing?'Atualizar':'Criar'}</button>
            <button type='button' onClick={onClose} style={{ ...btnGhost, flex:1, justifyContent:'center' }}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Componente Principal ────────────────────────────────────
const IptvPanel = () => {
  const [activeTab, setActiveTab] = useState('global')
  const [config, setConfig]       = useState({ xtream_url:'', xtream_username:'', xtream_password:'' })
  const [loadingCfg, setLoadingCfg] = useState(false)
  const [testing, setTesting]     = useState(false)
  const [message, setMessage]     = useState({ type:'', text:'' })
  const [showPwd, setShowPwd]     = useState(false)
  const [servers, setServers]     = useState([])
  const [loadingSrv, setLoadingSrv] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingServer, setEditingServer] = useState(null)
  const [toast, setToast]         = useState(null)

  useEffect(() => { fetchConfig(); loadServers() }, [])

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),2800) }

  const fetchConfig = async () => {
    try { const r = await api.get('/api/iptv-server/config'); if (r.data?.xtream_url) setConfig(r.data) } catch {}
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoadingCfg(true); setMessage({type:'',text:''})
    try {
      await api.post('/api/iptv-server/config', config)
      setMessage({ type:'success', text:'Configuração salva com sucesso!' })
    } catch (err) { setMessage({ type:'error', text: err.response?.data?.error||'Erro ao salvar' }) }
    finally { setLoadingCfg(false) }
  }

  const handleTest = async () => {
    setTesting(true); setMessage({type:'',text:''})
    try {
      const r = await api.post('/api/iptv-server/test', config)
      setMessage(r.data.success ? { type:'success', text:`Conexão OK! ${r.data.channels||0} canais disponíveis` } : { type:'error', text:r.data.message||'Falha na conexão' })
    } catch (err) { setMessage({ type:'error', text: err.response?.data?.message||'Erro ao testar' }) }
    finally { setTesting(false) }
  }

  const loadServers = async () => {
    try { const r = await api.get('/api/iptv/servers/all'); setServers(r.data) } 
    catch (err) { if (err.response?.status===401) window.location.href='/login' }
    finally { setLoadingSrv(false) }
  }

  const handleSaveServer = async (form, id) => {
    try {
      if (id) await api.put(`/api/iptv/servers/${id}`, form)
      else    await api.post('/api/iptv/servers', form)
      showToast(id ? 'Servidor atualizado!' : 'Servidor criado!')
      setShowModal(false); setEditingServer(null); loadServers()
    } catch (err) { showToast(err.response?.data?.error||'Erro ao salvar','error') }
  }

  const deleteServer = async (id, name) => {
    if (!confirm(`Excluir "${name}"?`)) return
    try { await api.delete(`/api/iptv/servers/${id}`); showToast('Servidor excluído!'); loadServers() }
    catch (err) { showToast(err.response?.data?.error||'Erro ao excluir','error') }
  }

  const toggleMaintenance = async (server) => {
    const isActive = server.status === 'ativo'
    try {
      if (isActive) await api.post(`/api/iptv/servers/${server.id}/maintenance`)
      else          await api.post(`/api/iptv/servers/${server.id}/activate`)
      showToast(isActive ? `${server.name} em manutenção` : `${server.name} ativado!`)
      loadServers()
    } catch { showToast('Erro ao atualizar status','error') }
  }

  const tabs = [
    { key:'global',  label:'Servidor Global', Icon:Globe  },
    { key:'servers', label:`Servidores (${servers.length})`, Icon:Server },
  ]

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:24, right:24, zIndex:200, background:toast.type==='error'?'rgba(239,68,68,0.95)':'rgba(16,185,129,0.95)', backdropFilter:'blur(12px)', borderRadius:12, padding:'12px 20px', color:'#fff', fontSize:13, fontWeight:700, boxShadow:'0 12px 30px rgba(0,0,0,0.4)', display:'flex', alignItems:'center', gap:8 }}>
          {toast.type==='error'?<AlertCircle size={16}/>:<CheckCircle size={16}/>} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:26, fontWeight:900, color:'#fff', display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
          <Server size={26} color='#FFA500'/> IPTV
        </h1>
        <p style={{ fontSize:12, color:'#52525b' }}>Servidor global e gerenciamento de servidores IPTV</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:24, background:'rgba(17,17,17,0.6)', padding:5, borderRadius:14, width:'fit-content', border:'1px solid rgba(255,255,255,0.06)' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 22px', borderRadius:10, border:'none', cursor:'pointer', fontSize:13, fontWeight:700, transition:'all .2s', background:activeTab===t.key?'rgba(255,165,0,0.15)':'transparent', color:activeTab===t.key?'#FFA500':'#71717a', boxShadow:activeTab===t.key?'0 2px 10px rgba(255,165,0,0.15)':'none' }}>
            <t.Icon size={15}/> {t.label}
          </button>
        ))}
      </div>

      {/* ─── Tab Global ─── */}
      {activeTab === 'global' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:12, padding:'12px 16px', display:'flex', alignItems:'center', gap:10 }}>
            <Zap size={16} color='#60a5fa'/><p style={{ fontSize:12, color:'#93c5fd' }}>Configuração global aplicada a todos os dispositivos. Servidores por dispositivo podem ser configurados na aba Dispositivos.</p>
          </div>

          <div style={{ background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)', border:'1px solid rgba(255,165,0,0.1)', borderRadius:16, padding:28, boxShadow:'0 8px 32px rgba(0,0,0,0.35)' }}>
            <h2 style={{ fontSize:16, fontWeight:800, color:'#fff', marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#FFA500', boxShadow:'0 0 8px #FFA500' }}/> Xtream Codes
            </h2>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div><label style={labelStyle}>URL do Servidor</label><input style={inputStyle} value={config.xtream_url} onChange={e=>setConfig({...config,xtream_url:e.target.value})} placeholder='http://exemplo.com:8080' required/></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div><label style={labelStyle}>Usuário</label><input style={inputStyle} value={config.xtream_username} onChange={e=>setConfig({...config,xtream_username:e.target.value})} placeholder='usuario' required/></div>
                <div>
                  <label style={labelStyle}>Senha</label>
                  <div style={{ position:'relative' }}>
                    <input style={{ ...inputStyle, paddingRight:40 }} type={showPwd?'text':'password'} value={config.xtream_password} onChange={e=>setConfig({...config,xtream_password:e.target.value})} placeholder='senha' required/>
                    <button type='button' onClick={()=>setShowPwd(v=>!v)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#52525b', cursor:'pointer', display:'flex' }}>
                      {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>
              </div>
              <MsgAlert msg={message}/>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                <button type='submit' disabled={loadingCfg} style={{ ...btnPrimary, opacity:loadingCfg?0.7:1 }}><Save size={15}/> {loadingCfg?'Salvando…':'Salvar'}</button>
                <button type='button' onClick={handleTest} disabled={testing||!config.xtream_url} style={{ ...btnGhost, opacity:(testing||!config.xtream_url)?0.5:1 }}><TestTube size={15}/> {testing?'Testando…':'Testar Conexão'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Tab Servidores ─── */}
      {activeTab === 'servers' && (
        <div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
            <button onClick={()=>{setEditingServer(null);setShowModal(true)}} style={btnPrimary}><Plus size={15}/> Adicionar Servidor</button>
          </div>

          <div style={{ background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)', border:'1px solid rgba(255,165,0,0.1)', borderRadius:16, overflow:'hidden' }}>
            {loadingSrv ? (
              <div style={{ textAlign:'center', padding:48, color:'#52525b' }}>Carregando servidores...</div>
            ) : servers.length===0 ? (
              <div style={{ textAlign:'center', padding:48, color:'#52525b' }}>
                <Server size={36} color='#27272a' style={{ display:'block', margin:'0 auto 12px' }}/>
                <p>Nenhum servidor. <button onClick={()=>setShowModal(true)} style={{ color:'#FFA500', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>Adicionar</button></p>
              </div>
            ) : (
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                      {['Servidor','URL','Região','Prioridade','Status','Usuários','Ações'].map(h=>(
                        <th key={h} style={{ padding:'11px 16px', textAlign:'left', fontSize:10, fontWeight:700, color:'#52525b', textTransform:'uppercase', letterSpacing:'0.08em', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {servers.map((s,idx) => (
                      <tr key={s.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', background:idx%2===0?'transparent':'rgba(255,255,255,0.01)', transition:'background .15s' }}
                        onMouseEnter={e=>e.currentTarget.style.background='rgba(255,165,0,0.04)'}
                        onMouseLeave={e=>e.currentTarget.style.background=idx%2===0?'transparent':'rgba(255,255,255,0.01)'}>
                        <td style={{ padding:'12px 16px', whiteSpace:'nowrap' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ width:30, height:30, borderRadius:8, background:'rgba(255,165,0,0.1)', border:'1px solid rgba(255,165,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Server size={13} color='#FFA500'/></div>
                            <span style={{ fontSize:13, fontWeight:700, color:'#e4e4e7' }}>{s.name}</span>
                          </div>
                        </td>
                        <td style={{ padding:'12px 16px', maxWidth:180 }}><span style={{ fontFamily:'monospace', fontSize:11, color:'#52525b', display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.url}</span></td>
                        <td style={{ padding:'12px 16px', fontSize:12, color:'#a1a1aa' }}>{s.region||'—'}</td>
                        <td style={{ padding:'12px 16px' }}><span style={{ padding:'3px 10px', borderRadius:999, background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.25)', color:'#60a5fa', fontSize:11, fontWeight:800 }}>{s.priority}</span></td>
                        <td style={{ padding:'12px 16px', whiteSpace:'nowrap' }}><StatusBadge status={s.status}/></td>
                        <td style={{ padding:'12px 16px' }}><span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#71717a' }}><Users size={13}/> <strong style={{ color:'#a1a1aa' }}>{s.users||0}</strong></span></td>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ display:'flex', gap:4 }}>
                            <button onClick={()=>{setEditingServer(s);setShowModal(true)}} title='Editar' style={{ width:28, height:28, borderRadius:7, background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#60a5fa' }}><Edit size={12}/></button>
                            <button onClick={()=>toggleMaintenance(s)} title={s.status==='ativo'?'Manutenção':'Ativar'} style={{ width:28, height:28, borderRadius:7, background:s.status==='ativo'?'rgba(250,204,21,0.12)':'rgba(16,185,129,0.12)', border:`1px solid ${s.status==='ativo'?'rgba(250,204,21,0.2)':'rgba(16,185,129,0.2)'}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:s.status==='ativo'?'#facc15':'#34d399' }}>
                              {s.status==='ativo' ? <Settings size={12}/> : <CheckCircle size={12}/>}
                            </button>
                            <button onClick={()=>deleteServer(s.id,s.name)} title='Excluir' style={{ width:28, height:28, borderRadius:7, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#f87171' }}><Trash2 size={12}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && <ServerModal onClose={()=>{setShowModal(false);setEditingServer(null)}} onSave={handleSaveServer} editing={editingServer}/>}
    </div>
  )
}

export default IptvPanel
