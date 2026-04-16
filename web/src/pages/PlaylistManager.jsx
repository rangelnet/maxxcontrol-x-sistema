import { useState, useEffect } from 'react'
import api from '../services/api'
import { Server, Plus, Trash2, Play, CheckCircle, Loader, X, Save, BarChart3, Activity } from 'lucide-react'

const inputStyle = {
  width:'100%', padding:'10px 14px', background:'rgba(5,5,5,0.6)',
  border:'1px solid rgba(255,255,255,0.08)', borderRadius:10,
  color:'#fff', fontSize:13, outline:'none', boxSizing:'border-box',
}
const labelStyle = {
  display:'block', fontSize:11, fontWeight:700, color:'#71717a',
  textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:7,
}
const btnPrimary = { display:'inline-flex', alignItems:'center', gap:7, padding:'10px 20px', background:'linear-gradient(135deg,#FFA500,#FF6B00)', border:'none', borderRadius:10, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 12px rgba(255,165,0,0.3)' }
const btnGhost   = { display:'inline-flex', alignItems:'center', gap:7, padding:'10px 16px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'#a1a1aa', fontSize:13, fontWeight:600, cursor:'pointer' }

const platforms = [
  { id:'smartone', name:'SmartOne', icon:'📺', accent:'#3b82f6' },
  { id:'ibocast',  name:'IBOCast',  icon:'🎥', accent:'#a855f7' },
  { id:'ibopro',   name:'IBOPro',   icon:'⚡', accent:'#22c55e' },
  { id:'vuplayer', name:'VU Player',icon:'🎬', accent:'#ef4444' },
]

const StatCard = ({ label, value, color }) => (
  <div style={{ textAlign:'center', padding:'18px 16px', background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, boxShadow:'0 4px 20px rgba(0,0,0,0.3)' }}>
    <p style={{ fontSize:28, fontWeight:800, color, lineHeight:1 }}>{value}</p>
    <p style={{ fontSize:11, color:'#52525b', marginTop:4, fontWeight:600 }}>{label}</p>
  </div>
)

const PlaylistManager = () => {
  const [servers, setServers]           = useState([])
  const [selectedServers, setSelectedServers] = useState([])
  const [currentPlatform, setCurrentPlatform] = useState(null)
  const [loading, setLoading]           = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showRegModal, setShowRegModal] = useState(false)
  const [registering, setRegistering]   = useState(false)
  const [serverForm, setServerForm]     = useState({ name:'', dns:'' })
  const [registerForm, setRegisterForm] = useState({ mac:'', username:'', password:'' })
  const [activityLog, setActivityLog]   = useState([])
  const [stats, setStats]               = useState({ total:0, success:0, error:0 })

  useEffect(() => { loadServers() }, [])

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString('pt-BR')
    setActivityLog(prev => [{ time, msg }, ...prev.slice(0,49)])
  }

  const loadServers = async () => {
    try { const r = await api.get('/api/playlist-manager/servers'); setServers(r.data) }
    catch { addLog('❌ Erro ao carregar servidores') }
    finally { setLoading(false) }
  }

  const addServer = async () => {
    if (!serverForm.name.trim() || !serverForm.dns.trim()) return
    try {
      await api.post('/api/playlist-manager/servers', serverForm)
      addLog(`✅ Servidor "${serverForm.name}" adicionado`)
      setServerForm({ name:'', dns:'' }); setShowAddModal(false); loadServers()
    } catch { addLog('❌ Erro ao adicionar servidor') }
  }

  const deleteServer = async (id, name) => {
    if (!confirm(`Remover "${name}"?`)) return
    try { await api.delete(`/api/playlist-manager/servers/${id}`); addLog(`🗑️ "${name}" removido`); setSelectedServers(p=>p.filter(sid=>sid!==id)); loadServers() }
    catch { addLog('❌ Erro ao remover') }
  }

  const toggleServer = (id) => setSelectedServers(p => p.includes(id) ? p.filter(sid=>sid!==id) : [...p,id])
  const selectAll    = () => setSelectedServers(selectedServers.length===servers.length ? [] : servers.map(s=>s.id))

  const openRegModal = () => {
    if (!selectedServers.length) { addLog('⚠️ Selecione servidores'); return }
    if (!currentPlatform)        { addLog('⚠️ Selecione a plataforma'); return }
    setShowRegModal(true)
  }

  const registerPlaylists = async () => {
    const { mac, username, password } = registerForm
    if (!mac || !username || !password) { addLog('⚠️ Preencha todos os campos'); return }
    if (!/^[0-9A-Fa-f:]{17}$/.test(mac)) { addLog('⚠️ MAC inválido'); return }
    setRegistering(true)
    addLog(`⏳ Iniciando: ${selectedServers.length} servidor(es)`)
    try {
      const r = await api.post('/api/playlist-manager/register', { platform:currentPlatform, serverIds:selectedServers, mac, username, password })
      r.data.results.forEach(res => addLog(res.success ? `✅ ${res.server} — ${res.message}` : `❌ ${res.server} — ${res.error}`))
      setStats(p => ({ total:p.total+r.data.summary.total, success:p.success+r.data.summary.success, error:p.error+r.data.summary.error }))
      addLog(`🎉 Finalizado! Sucesso: ${r.data.summary.success} | Erros: ${r.data.summary.error}`)
      setShowRegModal(false); setRegisterForm({ mac:'', username:'', password:'' })
    } catch (err) { addLog(`❌ ${err.response?.data?.error || err.message}`) }
    finally { setRegistering(false) }
  }

  if (loading) return (
    <div style={{ textAlign:'center', padding:48, color:'#52525b' }}>
      <Loader size={28} color='#FFA500' style={{ animation:'spin 1s linear infinite', display:'block', margin:'0 auto 12px' }}/>
      Carregando...
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize:26, fontWeight:900, color:'#fff', display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
          <Play size={26} color='#FFA500'/> Playlist Manager 4-em-1
        </h1>
        <p style={{ fontSize:12, color:'#52525b' }}>Cadastre playlists IPTV em 4 plataformas simultaneamente</p>
      </div>

      {/* Estatísticas */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        <StatCard label='Total Cadastrado' value={stats.total}   color='#FFA500'/>
        <StatCard label='Sucesso'          value={stats.success} color='#34d399'/>
        <StatCard label='Erros'            value={stats.error}   color='#f87171'/>
      </div>

      {/* Seleção de Plataforma */}
      <div style={{ background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)', border:'1px solid rgba(255,165,0,0.1)', borderRadius:16, padding:24 }}>
        <p style={{ fontSize:12, fontWeight:700, color:'#71717a', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>1 — Selecione a Plataforma</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))', gap:10 }}>
          {platforms.map(p => {
            const active = currentPlatform === p.id
            return (
              <button key={p.id} onClick={() => { setCurrentPlatform(p.id); addLog(`🎯 Plataforma: ${p.name}`) }}
                style={{ padding:'16px 10px', borderRadius:12, border:`2px solid ${active?p.accent:'rgba(255,255,255,0.07)'}`, background: active?`${p.accent}18`:'rgba(255,255,255,0.02)', cursor:'pointer', transition:'all .2s', textAlign:'center', boxShadow: active?`0 4px 14px ${p.accent}30`:'none' }}>
                <div style={{ fontSize:24, marginBottom:6 }}>{p.icon}</div>
                <div style={{ fontSize:12, fontWeight:700, color: active?p.accent:'#71717a' }}>{p.name}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Gerenciamento de Servidores */}
      <div style={{ background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)', border:'1px solid rgba(255,165,0,0.1)', borderRadius:16, padding:24 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <p style={{ fontSize:12, fontWeight:700, color:'#71717a', textTransform:'uppercase', letterSpacing:'0.08em' }}>2 — Servidores</p>
          <button onClick={() => setShowAddModal(true)} style={btnPrimary}><Plus size={14}/> Adicionar</button>
        </div>

        {servers.length > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, padding:'8px 12px', background:'rgba(255,255,255,0.03)', borderRadius:9 }}>
            <div onClick={selectAll} style={{ width:18, height:18, borderRadius:5, border:`2px solid ${selectedServers.length===servers.length?'#FFA500':'rgba(255,255,255,0.15)'}`, background:selectedServers.length===servers.length?'rgba(255,165,0,0.2)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
              {selectedServers.length===servers.length && <CheckCircle size={11} color='#FFA500'/>}
            </div>
            <span style={{ fontSize:12, color:'#71717a' }}>Selecionar todos · <strong style={{ color:'#a1a1aa' }}>{selectedServers.length}/{servers.length}</strong> selecionados</span>
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {servers.map(s => (
            <div key={s.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:11, border:`2px solid ${selectedServers.includes(s.id)?'rgba(255,165,0,0.3)':'rgba(255,255,255,0.05)'}`, background: selectedServers.includes(s.id)?'rgba(255,165,0,0.06)':'rgba(255,255,255,0.01)', transition:'all .15s', cursor:'pointer' }}
              onClick={() => toggleServer(s.id)}>
              <div style={{ width:18, height:18, borderRadius:5, border:`2px solid ${selectedServers.includes(s.id)?'#FFA500':'rgba(255,255,255,0.15)'}`, background:selectedServers.includes(s.id)?'rgba(255,165,0,0.2)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {selectedServers.includes(s.id) && <CheckCircle size={11} color='#FFA500'/>}
              </div>
              <div style={{ width:32, height:32, borderRadius:8, background:'rgba(255,165,0,0.1)', border:'1px solid rgba(255,165,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Server size={14} color='#FFA500'/>
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:700, color:'#e4e4e7' }}>{s.name}</p>
                <p style={{ fontFamily:'monospace', fontSize:11, color:'#52525b' }}>{s.dns}</p>
              </div>
              <button onClick={e=>{e.stopPropagation();deleteServer(s.id,s.name)}}
                style={{ width:28, height:28, borderRadius:7, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#f87171', flexShrink:0 }}>
                <Trash2 size={12}/>
              </button>
            </div>
          ))}

          {servers.length === 0 && (
            <div style={{ textAlign:'center', padding:32, color:'#52525b' }}>
              <Server size={32} color='#27272a' style={{ display:'block', margin:'0 auto 10px' }}/>
              Nenhum servidor. Adicione um acima!
            </div>
          )}
        </div>

        {servers.length > 0 && (
          <button onClick={openRegModal} disabled={!selectedServers.length || !currentPlatform}
            style={{ marginTop:16, width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px', background:selectedServers.length&&currentPlatform?'linear-gradient(135deg,#22c55e,#16a34a)':'rgba(255,255,255,0.04)', border:`1px solid ${selectedServers.length&&currentPlatform?'rgba(34,197,94,0.3)':'rgba(255,255,255,0.07)'}`, borderRadius:11, color:selectedServers.length&&currentPlatform?'#fff':'#52525b', fontSize:13, fontWeight:700, cursor:selectedServers.length&&currentPlatform?'pointer':'not-allowed', boxShadow:selectedServers.length&&currentPlatform?'0 4px 14px rgba(34,197,94,0.25)':'none', transition:'all .2s' }}>
            <Play size={15}/> {selectedServers.length && currentPlatform ? `Registrar ${selectedServers.length} Servidor(es) em ${platforms.find(p=>p.id===currentPlatform)?.name}` : 'Selecione plataforma e servidores'}
          </button>
        )}
      </div>

      {/* Log de Atividades */}
      <div style={{ background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)', border:'1px solid rgba(255,165,0,0.1)', borderRadius:16, padding:24 }}>
        <p style={{ fontSize:12, fontWeight:700, color:'#71717a', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
          <Activity size={13}/> Log de Atividades
        </p>
        <div style={{ background:'rgba(5,5,5,0.7)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:10, padding:'12px 14px', maxHeight:200, overflowY:'auto', fontFamily:'monospace', fontSize:11 }}>
          {activityLog.length === 0
            ? <p style={{ color:'#3f3f46' }}>Nenhuma atividade ainda...</p>
            : activityLog.map((log,i) => (
              <div key={i} style={{ marginBottom:4, color:'#a1a1aa' }}>
                <span style={{ color:'#52525b' }}>[{log.time}]</span> {log.msg}
              </div>
            ))
          }
        </div>
      </div>

      {/* Modal Adicionar Servidor */}
      {showAddModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16 }}
          onClick={e=>e.target===e.currentTarget&&setShowAddModal(false)}>
          <div style={{ background:'rgba(17,17,17,0.96)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,165,0,0.18)', borderRadius:20, padding:28, width:'100%', maxWidth:420 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <h2 style={{ fontSize:16, fontWeight:800, color:'#fff', display:'flex',alignItems:'center',gap:8 }}><Server size={16} color='#FFA500'/> Adicionar Servidor</h2>
              <button onClick={()=>setShowAddModal(false)} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color:'#71717a', cursor:'pointer' }}><X size={14}/></button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div><label style={labelStyle}>Nome do Servidor</label><input style={inputStyle} value={serverForm.name} onChange={e=>setServerForm({...serverForm,name:e.target.value})} placeholder='Meggas, UltraFlex...'/></div>
              <div><label style={labelStyle}>DNS do Servidor</label>
                <input style={inputStyle} value={serverForm.dns} onChange={e=>setServerForm({...serverForm,dns:e.target.value})} placeholder='ultraflex.top'/>
                <p style={{ fontSize:10, color:'#52525b', marginTop:4 }}>Apenas o domínio, sem http://</p>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={addServer} style={{ ...btnPrimary, flex:1, justifyContent:'center' }}><Save size={14}/> Adicionar</button>
                <button onClick={()=>setShowAddModal(false)} style={{ ...btnGhost, flex:1, justifyContent:'center' }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Registro em Lote */}
      {showRegModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16 }}
          onClick={e=>e.target===e.currentTarget&&!registering&&setShowRegModal(false)}>
          <div style={{ background:'rgba(17,17,17,0.96)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,165,0,0.18)', borderRadius:20, padding:28, width:'100%', maxWidth:440 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <h2 style={{ fontSize:16, fontWeight:800, color:'#fff', display:'flex',alignItems:'center',gap:8 }}><Play size={16} color='#22c55e'/> Registro em Lote</h2>
              {!registering && <button onClick={()=>setShowRegModal(false)} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color:'#71717a', cursor:'pointer' }}><X size={14}/></button>}
            </div>

            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, padding:'10px 14px', marginBottom:16 }}>
              <p style={{ fontSize:12, color:'#71717a', marginBottom:4 }}>Plataforma: <strong style={{ color:'#FFA500' }}>{platforms.find(p=>p.id===currentPlatform)?.name}</strong></p>
              <p style={{ fontSize:12, color:'#71717a', marginBottom:4 }}>Servidores: <strong style={{ color:'#a1a1aa' }}>{selectedServers.length}</strong></p>
              <p style={{ fontSize:11, color:'#3f3f46' }}>{servers.filter(s=>selectedServers.includes(s.id)).map(s=>s.name).join(', ')}</p>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div><label style={labelStyle}>MAC Address</label><input style={inputStyle} value={registerForm.mac} onChange={e=>setRegisterForm({...registerForm,mac:e.target.value})} placeholder='00:1A:79:XX:XX:XX'/></div>
              <div><label style={labelStyle}>Usuário</label><input style={inputStyle} value={registerForm.username} onChange={e=>setRegisterForm({...registerForm,username:e.target.value})} placeholder='usuario123'/></div>
              <div><label style={labelStyle}>Senha</label><input style={inputStyle} type='password' value={registerForm.password} onChange={e=>setRegisterForm({...registerForm,password:e.target.value})} placeholder='senha456'/></div>
              <div style={{ display:'flex', gap:8, marginTop:4 }}>
                <button onClick={registerPlaylists} disabled={registering}
                  style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'10px', background:'linear-gradient(135deg,#22c55e,#16a34a)', border:'none', borderRadius:10, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', opacity:registering?0.7:1 }}>
                  {registering ? <><Loader size={14} style={{ animation:'spin 1s linear infinite' }}/> Registrando...</> : <><CheckCircle size={14}/> Registrar</>}
                </button>
                <button onClick={()=>!registering&&setShowRegModal(false)} disabled={registering} style={{ ...btnGhost, flex:1, justifyContent:'center', opacity:registering?0.5:1 }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default PlaylistManager
