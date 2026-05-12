import { useState, useEffect } from 'react'
import api from '../services/api'
import { Server, Plus, Edit, Trash2, Settings, CheckCircle, AlertCircle, Users, X, Save, RefreshCw, Globe, Zap, Radio, Link2 } from 'lucide-react'

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
  const [syncing, setSyncing]         = useState(false)
  const [formData, setFormData]       = useState({ name:'', url:'', region:'', priority:100, status:'ativo' })

  // === Estados Painéis qPanel ===
  const [qpanels, setQpanels]         = useState([])
  const [loadingPanels, setLoadingPanels] = useState(false)
  const [panelName, setPanelName]     = useState('')
  const [panelUrl, setPanelUrl]       = useState('')
  const [panelUsername, setPanelUsername] = useState('')
  const [panelPassword, setPanelPassword] = useState('')
  const [savingPanel, setSavingPanel] = useState(false)

  useEffect(() => { loadServers(); loadQpanels() }, [])

  const [resellerEmail, setResellerEmail] = useState('')
  const [resellerDnsCode, setResellerDnsCode] = useState('')

  // === CRUD Painéis qPanel ===
  const loadQpanels = async () => {
    setLoadingPanels(true)
    try {
      const r = await api.get('/api/iptv-plugin/qpanels')
      setQpanels(r.data.panels || [])
    } catch (err) {
      console.error('Erro ao carregar painéis:', err)
    } finally { setLoadingPanels(false) }
  }

  const handleAddPanel = async () => {
    if (!panelName.trim() || !panelUrl.trim()) { showToast('Nome e URL são obrigatórios', 'error'); return }
    
    // Auto-corrigir URL sem protocolo
    let finalUrl = panelUrl.trim()
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl
    }
    
    try { new URL(finalUrl) } catch { showToast('URL inválida. Ex: https://painel.exemplo.com', 'error'); return }
    
    setSavingPanel(true)
    try {
      console.log('📡 Salvando painel:', { panel_name: panelName.trim(), panel_url: finalUrl })
      const payload = { 
        panel_name: panelName.trim(), 
        panel_url: finalUrl,
        panel_username: panelUsername.trim() || null,
        panel_password: panelPassword.trim() || null,
        reseller_email: resellerEmail.trim() || null,
        reseller_dns_code: resellerDnsCode.trim() || null
      }
      const res = await api.post('/api/iptv-plugin/add-qpanel', payload)
      console.log('✅ Resposta:', res.data)
      showToast(`Painel "${panelName}" adicionado com sucesso!`)
      setPanelName(''); setPanelUrl(''); setPanelUsername(''); setPanelPassword(''); setResellerEmail(''); setResellerDnsCode('')
      loadQpanels()
    } catch (err) {
      console.error('❌ Erro ao salvar painel:', err.response?.data || err.message)
      showToast(err.response?.data?.error || err.response?.data?.detail || 'Erro ao salvar painel. Verifique o console.', 'error')
    }
    finally { setSavingPanel(false) }
  }

  const handleDeletePanel = async (id, name) => {
    if (!confirm(`Remover o painel "${name}"?`)) return
    try {
      await api.delete(`/api/iptv-plugin/qpanel/${id}`)
      showToast(`Painel "${name}" removido!`)
      loadQpanels()
    } catch (err) { showToast('Erro ao remover painel', 'error') }
  }

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),2800) }

  const handleSyncFromSigma = async () => {
    setSyncing(true);
    showToast('Iniciando varredura em todos os painéis Sigma...', 'info');
    try {
      const res = await api.post('/api/iptv-plugin/relay-command-multi', {
        command_type: 'sync_servers',
        payload: { force: true },
        servers: ['broadcast']
      });

      if (res.data.success && res.data.command_ids && res.data.command_ids.length > 0) {
        let completed = 0;
        const total = res.data.command_ids.length;
        
        // Processar CADA comando (1 por painel cadastrado)
        for (const cmdId of res.data.command_ids) {
          let attempts = 0;
          await new Promise((resolve) => {
            const check = setInterval(async () => {
              attempts++;
              try {
                const statusRes = await api.get(`/api/iptv-plugin/relay-status/${cmdId}`);
                const cmd = statusRes.data.commands?.[0];

                if (cmd?.status === 'done' && cmd.result) {
                  clearInterval(check);
                  // Enviar para o batch de sincronização
                  await api.post('/api/iptv-plugin/sync-servers-batch', {
                    panel_name: cmd.result.panel_name || cmd.result.panel_url,
                    panel_url: cmd.result.panel_url,
                    servers: cmd.result.servers
                  });
                  completed++;
                  showToast(`Sincronizado ${completed}/${total} painéis...`, 'info');
                  resolve();
                } else if (cmd?.status === 'error' || attempts > 20) {
                  clearInterval(check);
                  completed++;
                  resolve();
                }
              } catch (e) {
                clearInterval(check);
                completed++;
                resolve();
              }
            }, 3000);
          });
        }
        
        showToast(`✅ Sincronização concluída! ${completed} painel(is) processados.`);
        loadServers();
        loadQpanels();
      }
    } catch (err) {
      showToast('Falha ao iniciar sincronização', 'error');
    }
    setSyncing(false);
  }

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
  const btnPrimary = { display:'inline-flex', alignItems:'center', gap:7, padding:'10px 20px', background:'linear-gradient(135deg,#FFA500,#FF8C00)', border:'none', borderRadius:10, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 12px rgba(255,165,0,0.3)' }
  const btnGhost   = { display:'inline-flex', alignItems:'center', gap:7, padding:'10px 16px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'#a1a1aa', fontSize:13, fontWeight:600, cursor:'pointer' }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:24, right:24, zIndex:200, background:toast.type==='error'?'rgba(239,68,68,0.95)':toast.type==='info'?'rgba(59,130,246,0.95)':'rgba(16,185,129,0.95)', backdropFilter:'blur(12px)', borderRadius:12, padding:'12px 20px', color:'#fff', fontSize:13, fontWeight:700, boxShadow:'0 12px 30px rgba(0,0,0,0.4)', display:'flex', alignItems:'center', gap:8 }}>
          {toast.type==='error'?<AlertCircle size={16}/>:toast.type==='info'?<RefreshCw size={16} style={{animation:'spin 2s linear infinite'}}/>:<CheckCircle size={16}/>} {toast.msg}
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
          <button onClick={handleSyncFromSigma} disabled={syncing} style={{ ...btnGhost, color:'#FFA500', borderColor:'rgba(255, 165, 0, 0.3)' }}>
            <Zap size={14} fill={syncing?'#FFA500':'none'}/> {syncing?'Sincronizando...':'Sincronizar com Sigma'}
          </button>
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
                  {['Servidor','URL','Região','Prioridade','Status','Usuários','Sincronizado','Ações'].map(h => (
                    <th key={h} style={{ padding:'11px 16px', textAlign:'left', fontSize:10, fontWeight:700, color:'#52525b', textTransform:'uppercase', letterSpacing:'0.08em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {servers.map((s,idx) => (
                  <tr key={s.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', background:idx%2===0?'transparent':'rgba(255,255,255,0.01)', transition:'background .15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(252, 95, 22,0.04)'}
                    onMouseLeave={e=>e.currentTarget.style.background=idx%2===0?'transparent':'rgba(255,255,255,0.01)'}
                  >
                    <td style={{ padding:'12px 16px', whiteSpace:'nowrap' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:32, height:32, borderRadius:8, background:'rgba(252, 95, 22,0.1)', border:'1px solid rgba(252, 95, 22,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <Server size={14} color='#FC5F16'/>
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
                    <td style={{ padding:'12px 16px', fontSize:11, color:'#52525b', whiteSpace:'nowrap' }}>{formatDate(s.updated_at || s.created_at)}</td>
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

      {/* ══════ SEÇÃO PAINÉIS QPANEL ══════ */}
      <div style={{ marginTop:28 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'rgba(168,85,247,0.15)', border:'1px solid rgba(168,85,247,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Radio size={18} color='#a855f7'/>
            </div>
            <div>
              <h2 style={{ fontSize:18, fontWeight:800, color:'#fff', margin:0 }}>📡 Painéis qPanel</h2>
              <p style={{ fontSize:11, color:'#52525b', margin:0 }}>Cadastre painéis Sigma para usar com revendas (DNS alternativo)</p>
            </div>
          </div>
          <button onClick={loadQpanels} style={btnGhost}><RefreshCw size={14}/> Atualizar</button>
        </div>

        {/* Card de cadastro + lista */}
        <div style={{ background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)', border:'1px solid rgba(168,85,247,0.15)', borderRadius:16, overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.35)' }}>

          {/* Formulário Adicionar Painel */}
          <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'flex-end', gap:12, flexWrap:'wrap' }}>
            <div style={{ flex:'1 1 180px', minWidth:160 }}>
              <label style={labelStyle}>Nome do Painel</label>
              <input style={inputStyle} value={panelName} onChange={e=>setPanelName(e.target.value)} placeholder='Ex: Painel Principal'/>
            </div>
            <div style={{ flex:'2 1 200px', minWidth:180 }}>
              <label style={labelStyle}>URL do Painel</label>
              <input style={inputStyle} value={panelUrl} onChange={e=>setPanelUrl(e.target.value)} placeholder='https://painel.exemplo.com'/>
            </div>
            <div style={{ flex:'1 1 180px', minWidth:160 }}>
              <label style={labelStyle}>Usuário Admin</label>
              <input style={inputStyle} value={panelUsername} onChange={e=>setPanelUsername(e.target.value)} placeholder='admin'/>
            </div>
            <div style={{ flex:'1 1 180px', minWidth:160 }}>
              <label style={labelStyle}>Senha Admin</label>
              <input style={inputStyle} type='text' value={panelPassword} onChange={e=>setPanelPassword(e.target.value)} placeholder='senha123'/>
            </div>
            <div style={{ flex:'1 1 180px', minWidth:160 }}>
              <label style={labelStyle}>Email Revenda (Opcional)</label>
              <input style={inputStyle} value={resellerEmail} onChange={e=>setResellerEmail(e.target.value)} placeholder='email@revenda.com'/>
            </div>
            <div style={{ flex:'1 1 180px', minWidth:160 }}>
              <label style={labelStyle}>Código Integração (Opcional)</label>
              <input style={inputStyle} value={resellerDnsCode} onChange={e=>setResellerDnsCode(e.target.value)} placeholder='Ex: COD123'/>
            </div>
            <button onClick={handleAddPanel} disabled={savingPanel || !panelName.trim() || !panelUrl.trim()}
              style={{ ...btnPrimary, height:42, opacity:(savingPanel || !panelName.trim() || !panelUrl.trim())?0.5:1, background:'linear-gradient(135deg,#a855f7,#7c3aed)' }}>
              <Plus size={15}/> {savingPanel ? 'Salvando…' : 'Salvar Painel'}
            </button>
          </div>

          {/* Lista de painéis */}
          {loadingPanels ? (
            <div style={{ textAlign:'center', padding:32, color:'#52525b' }}>
              <RefreshCw size={20} color='#a855f7' style={{ animation:'spin 1s linear infinite', display:'block', margin:'0 auto 8px' }}/>
              Carregando painéis...
            </div>
          ) : qpanels.length === 0 ? (
            <div style={{ textAlign:'center', padding:32, color:'#52525b' }}>
              <Radio size={28} color='#27272a' style={{ display:'block', margin:'0 auto 8px' }}/>
              <p style={{ fontSize:13 }}>Nenhum painel cadastrado.</p>
              <p style={{ fontSize:11, color:'#3f3f46' }}>Adicione painéis Sigma acima para que revendas possam usar DNS alternativos.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column' }}>
              {qpanels.map((p, idx) => (
                <div key={p.id} style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 24px',
                  borderBottom: idx < qpanels.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  transition:'background .15s',
                }} onMouseEnter={e=>e.currentTarget.style.background='rgba(168,85,247,0.04)'}
                   onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, minWidth:0 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:'rgba(168,85,247,0.1)', border:'1px solid rgba(168,85,247,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Radio size={15} color='#a855f7'/>
                    </div>
                    <div style={{ minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:'#e4e4e7', margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.panel_name}</p>
                      <p style={{ fontSize:11, fontFamily:'monospace', color:'#52525b', margin:0, display:'flex', alignItems:'center', gap:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        <Link2 size={11}/> {p.panel_url}
                      </p>
                      {(p.reseller_email || p.reseller_dns_code || p.panel_username || p.panel_password) && (
                        <div style={{ display:'flex', gap:8, marginTop:4, flexWrap:'wrap' }}>
                          {p.panel_username && <span style={{ fontSize:10, color:'#60a5fa', background:'rgba(96,165,250,0.1)', padding:'2px 6px', borderRadius:4, border:'1px solid rgba(96,165,250,0.2)' }}>👤 {p.panel_username}</span>}
                          {p.panel_password && <span style={{ fontSize:10, color:'#f43f5e', background:'rgba(244,63,94,0.1)', padding:'2px 6px', borderRadius:4, border:'1px solid rgba(244,63,94,0.2)' }}>🔑 {p.panel_password}</span>}
                          {p.reseller_email && <span style={{ fontSize:10, color:'#a855f7', background:'rgba(168,85,247,0.1)', padding:'2px 6px', borderRadius:4, border:'1px solid rgba(168,85,247,0.2)' }}>📧 {p.reseller_email}</span>}
                          {p.reseller_dns_code && <span style={{ fontSize:10, color:'#f59e0b', background:'rgba(245,158,11,0.1)', padding:'2px 6px', borderRadius:4, border:'1px solid rgba(245,158,11,0.2)' }}>🏷️ {p.reseller_dns_code}</span>}
                        </div>
                      )}
                      {p.servers && p.servers.length > 0 && (
                        <div style={{ marginTop: 8, display:'flex', flexDirection:'column', gap:4 }}>
                          {p.servers.map((s, sIdx) => (
                            <span key={sIdx} style={{ fontSize:10, color:'#a1a1aa', display:'flex', alignItems:'center', gap:4 }}>
                              <Server size={10} color='#34d399'/> {s.name || s.server_name || 'Sem Nome'}: <span style={{ color:'#e4e4e7' }}>{s.dns || s.server_dns || 'Sem DNS'}</span>
                            </span>
                          ))}
                        </div>
                      )}
                      {p.last_sync_at && (
                        <p style={{ fontSize:10, color:'#71717a', margin:'6px 0 0 0' }}>
                          Última sincronização: {formatDate(p.last_sync_at)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                    {p.servers && p.servers.length > 0 && (
                      <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:999, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', color:'#34d399', fontSize:10, fontWeight:700 }}>
                        <Server size={10}/> {p.servers.length} capturado(s)
                      </span>
                    )}
                    <button onClick={()=>handleDeletePanel(p.id, p.panel_name)} title='Remover painel'
                      style={{ width:32, height:32, borderRadius:8, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#f87171', transition:'all .15s' }}>
                      <X size={14}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16 }}
          onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div style={{ background:'rgba(17,17,17,0.96)', backdropFilter:'blur(20px)', border:'1px solid rgba(252, 95, 22,0.18)', borderRadius:20, padding:28, width:'100%', maxWidth:480, boxShadow:'0 25px 60px rgba(0,0,0,0.6)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'rgba(252, 95, 22,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Server size={18} color='#FC5F16'/>
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
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:12 }}>
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
