import { useState, useEffect } from 'react'
import { Server, Save, Edit3, Trash2, CheckCircle, AlertTriangle, Search, ToggleLeft, ToggleRight } from 'lucide-react'
import axios from '../services/api'

const ServerManager = () => {
  const [panels, setPanels] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  const [selectedServers, setSelectedServers] = useState([]) // Array de strings "panelId-serverIndex"
  const [bulkName, setBulkName] = useState('')

  useEffect(() => {
    fetchServers()
  }, [])

  const fetchServers = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/iptv-plugin/qpanels')
      setPanels(res.data.panels || [])
    } catch (error) {
      console.error("Erro ao carregar servidores:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleServerSelection = (panelIdx, serverIdx) => {
    const id = `${panelIdx}-${serverIdx}`
    if (selectedServers.includes(id)) {
      setSelectedServers(selectedServers.filter(i => i !== id))
    } else {
      setSelectedServers([...selectedServers, id])
    }
  }

  const toggleAllInPanel = (panelIdx, value) => {
    const panel = panels[panelIdx]
    const newSelections = [...selectedServers]
    
    panel.servers.forEach((_, sIdx) => {
      const id = `${panelIdx}-${sIdx}`
      if (value && !newSelections.includes(id)) {
        newSelections.push(id)
      } else if (!value) {
        const index = newSelections.indexOf(id)
        if (index > -1) newSelections.splice(index, 1)
      }
    })
    setSelectedServers(newSelections)
  }

  const applyBulkName = () => {
    const next = [...panels]
    selectedServers.forEach(id => {
      const [pIdx, sIdx] = id.split('-').map(Number)
      next[pIdx].servers[sIdx].name = bulkName
    })
    setPanels(next)
    setBulkName('')
    setSelectedServers([])
  }

  const updateServerData = (panelIndex, serverIndex, field, value) => {
    const next = [...panels]
    next[panelIndex].servers[serverIndex][field] = value
    setPanels(next)
  }

  const handleSave = async (panelId, servers) => {
    setSaving(true)
    try {
      await axios.post('/api/iptv-plugin/qpanel-load-servers', {
        panel_id: panelId,
        servers: servers
      })
      setMessage({ type: 'success', text: 'Alterações salvas com sucesso!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar alterações.' })
    } finally {
      setSaving(false)
    }
  }

  // Estilos TV MAXX
  const inputStyle = { padding:'8px 12px', background:'rgba(5,5,5,0.6)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, color:'#fff', fontSize:13, outline:'none' }
  const btnPrimary = { display:'inline-flex', alignItems:'center', gap:7, padding:'8px 16px', background:'linear-gradient(135deg,#FFA500,#FF8C00)', border:'none', borderRadius:10, color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer' }

  if (loading) return <div style={{ color: '#52525b', padding: 20 }}>Carregando servidores...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)', border:'1px solid rgba(255,165,0,0.1)', borderRadius:16, padding:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ fontSize:18, fontWeight:900, color:'#fff', display:'flex', alignItems:'center', gap:10 }}>
            <Server size={20} color="#FFA500" /> Lista de Servidores Sigma
          </h2>
          <div style={{ position:'relative' }}>
            <Search size={16} color="#52525b" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }} />
            <input 
              style={{ ...inputStyle, paddingLeft:36, width:250 }} 
              placeholder="Buscar servidor..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Barra de Ações em Massa */}
        {selectedServers.length > 0 && (
          <div style={{ background:'rgba(255, 165, 0, 0.05)', border:'1px dashed #FFA500', borderRadius:12, padding:16, marginBottom:24, display:'flex', alignItems:'center', gap:15, animation:'fadeIn 0.2s ease' }}>
            <Edit3 size={20} color="#FFA500" />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, fontWeight:800, color:'#FFA500', marginBottom:5, textTransform:'uppercase' }}>Renomear {selectedServers.length} Servidor(es) selecionado(s):</div>
              <input 
                style={{ ...inputStyle, background:'rgba(0,0,0,0.3)', width:'100%' }}
                placeholder="Digite o novo nome (ex: MEGGA'S)"
                value={bulkName}
                onChange={e => setBulkName(e.target.value)}
              />
            </div>
            <button onClick={applyBulkName} style={{ ...btnPrimary, height:40 }}>Aplicar Nome nos Marcados</button>
          </div>
        )}

        {panels.map((panel, pIdx) => (
          <div key={panel.id} style={{ marginBottom:30, border:'1px solid rgba(255,255,255,0.05)', borderRadius:12, overflow:'hidden' }}>
            <div style={{ background:'rgba(255,255,255,0.02)', padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:15 }}>
                <div>
                  <span style={{ fontSize:10, color:'#71717a', textTransform:'uppercase', fontWeight:800 }}>Painel</span>
                  <div style={{ fontSize:14, fontWeight:700, color:'#fff' }}>{panel.panel_name}</div>
                </div>
                <div style={{ display:'flex', gap:8, marginLeft:20 }}>
                  <button onClick={() => toggleAllInPanel(pIdx, true)} style={{ ...btnGhost, padding:'4px 10px', fontSize:10 }}>Marcar Todos</button>
                  <button onClick={() => toggleAllInPanel(pIdx, false)} style={{ ...btnGhost, padding:'4px 10px', fontSize:10 }}>Desmarcar Todos</button>
                </div>
              </div>
              <button onClick={() => handleSave(panel.id, panel.servers)} disabled={saving} style={btnPrimary}>
                <Save size={14} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>

            <div style={{ padding:10 }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ textAlign:'left', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <th style={{ padding:12, width:40 }}></th>
                    <th style={{ padding:12, fontSize:11, color:'#71717a', width:120 }}>STATUS</th>
                    <th style={{ padding:12, fontSize:11, color:'#71717a' }}>NOME DO SERVIDOR (EDITÁVEL)</th>
                    <th style={{ padding:12, fontSize:11, color:'#71717a' }}>DNS / URL original</th>
                  </tr>
                </thead>
                <tbody>
                  {panel.servers
                    .filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.dns?.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((server, sIdx) => (
                    <tr key={sIdx} style={{ borderBottom:'1px solid rgba(255,255,255,0.02)', background: selectedServers.includes(`${pIdx}-${sIdx}`) ? 'rgba(255,165,0,0.03)' : 'transparent' }}>
                      <td style={{ padding:12 }}>
                        <input 
                          type="checkbox" 
                          checked={selectedServers.includes(`${pIdx}-${sIdx}`)}
                          onChange={() => toggleServerSelection(pIdx, sIdx)}
                          style={{ width:16, height:16, cursor:'pointer', accentColor:'#FFA500' }}
                        />
                      </td>
                      <td style={{ padding:12 }}>
                        <div 
                          onClick={() => updateServerData(pIdx, sIdx, 'status', server.status === 'active' ? 'inactive' : 'active')}
                          style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}
                        >
                          {server.status === 'active' ? <ToggleRight size={24} color="#FFA500" /> : <ToggleLeft size={24} color="#52525b" />}
                          <span style={{ fontSize:10, color: server.status === 'active' ? '#fff' : '#52525b', fontWeight:700 }}>
                            {server.status === 'active' ? 'ATIVO' : 'INATIVO'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding:12 }}>
                        <input 
                          style={{ ...inputStyle, width:'100%', border: 'none', background:'rgba(255,255,255,0.02)', fontWeight:700 }}
                          value={server.name}
                          onChange={e => updateServerData(pIdx, sIdx, 'name', e.target.value)}
                        />
                      </td>
                      <td style={{ padding:12, fontSize:11, color:'#52525b' }}>{server.dns}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {message.text && (
          <div style={{ position:'fixed', bottom:20, right:20, padding:'12px 20px', borderRadius:10, background:'#111', border:`1px solid ${message.type==='success'?'#FFA500':'#ef4444'}`, color: '#fff', fontSize:13, display:'flex', alignItems:'center', gap:10, boxShadow:'0 10px 30px rgba(0,0,0,0.5)', zIndex:1000 }}>
            {message.type==='success' ? <CheckCircle size={18} color="#FFA500"/> : <AlertTriangle size={18} color="#ef4444"/>}
            {message.text}
          </div>
        )}
      </div>
    </div>
  )
}

export default ServerManager
