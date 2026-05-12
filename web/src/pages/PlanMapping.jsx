import { useState, useEffect } from 'react'
import { Server, Save, Layers, CheckCircle, AlertTriangle, CheckSquare, Square, Zap } from 'lucide-react'
import axios from '../services/api'

const PlanMapping = () => {
  const [plans, setPlans] = useState([])
  const [servers, setServers] = useState([])
  const [mappings, setMappings] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Estados para a edição do mapeamento
  const [editingMapping, setEditingMapping] = useState([]) // Array de { server_id, package_name, enabled }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Carrega planos (obrigatório)
      const plansRes = await axios.get('/api/finance/plans').catch(e => {
        console.error("Erro ao carregar planos:", e)
        return { data: [] }
      })
      setPlans(plansRes.data)

      // Carrega servidores (extrai de qpanels)
      const serversRes = await axios.get('/api/iptv-plugin/qpanels').catch(e => {
        console.error("Erro ao carregar servidores:", e)
        return { data: { panels: [] } }
      })
      
      // Unifica todos os servidores de todos os painéis Sigma em uma única lista
      const allServers = []
      if (serversRes.data && serversRes.data.panels) {
        serversRes.data.panels.forEach(panel => {
          if (panel.servers && Array.isArray(panel.servers)) {
            panel.servers.forEach(srv => {
              // Evita duplicados por DNS ou Nome
              if (!allServers.find(s => s.name === srv.name)) {
                allServers.push(srv)
              }
            })
          }
        })
      }
      setServers(allServers)

      // Carrega mapeamentos existentes (opcional)
      const mappingRes = await axios.get('/api/plan-mapping').catch(e => {
        console.error("Erro ao carregar mapeamentos:", e)
        return { data: [] }
      })
      setMappings(mappingRes.data || [])

      if (plansRes.data.length === 0) {
        setMessage({ type: 'info', text: 'Nenhum plano comercial encontrado no sistema financeiro.' })
      }
    } catch (error) {
      console.error("Erro geral ao carregar dados:", error)
      setMessage({ type: 'error', text: 'Erro crítico ao conectar com o servidor.' })
    } finally {
      setLoading(false)
    }
  }

  const openMapping = (plan) => {
    setSelectedPlan(plan)
    const existingMapping = mappings.find(m => m.plan_id === plan.id)
    
    const initial = servers.map(s => {
      const saved = existingMapping?.config?.find(c => c.server_id === (s.id || s.name))
      return {
        server_id: s.id || s.name,
        server_name: s.name, // Corrigido aqui
        package_name: saved?.package_name || plan.sigma_package || '',
        enabled: saved ? saved.enabled : false
      }
    })
    setEditingMapping(initial)
    setMessage({ type: '', text: '' })
  }

  const toggleAll = (value) => {
    setEditingMapping(editingMapping.map(m => ({ ...m, enabled: value })))
  }

  const updateMapping = (index, field, value) => {
    const next = [...editingMapping]
    next[index][field] = value
    setEditingMapping(next)
  }

  const [globalPackage, setGlobalPackage] = useState('')

  const applyGlobalPackage = () => {
    setEditingMapping(editingMapping.map(m => 
      m.enabled ? { ...m, package_name: globalPackage } : m
    ))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await axios.post('/api/plan-mapping', {
        plan_id: selectedPlan.id,
        config: editingMapping
      })
      setMessage({ type: 'success', text: 'Mapeamento salvo com sucesso!' })
      fetchData()
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar mapeamento.' })
    } finally {
      setSaving(false)
    }
  }

  // Estilos seguindo o padrão TV MAXX Oficial
  const btnPrimary = { display:'inline-flex', alignItems:'center', gap:7, padding:'10px 20px', background:'linear-gradient(135deg,#FFA500,#FF8C00)', border:'none', borderRadius:10, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 12px rgba(255,165,0,0.3)', whiteSpace:'nowrap' }
  const btnGhost   = { display:'inline-flex', alignItems:'center', gap:7, padding:'8px 16px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'#a1a1aa', fontSize:12, fontWeight:600, cursor:'pointer' }
  const inputStyle = { width:'100%', padding:'8px 12px', background:'rgba(5,5,5,0.6)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, color:'#fff', fontSize:12, outline:'none' }

  if (loading) return <div style={{ color: '#52525b', padding: 20 }}>Carregando mapeamentos...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Lista de Planos */}
      <div style={{ background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)', border:'1px solid rgba(252, 95, 22,0.1)', borderRadius:16, padding:24 }}>
        <h2 style={{ fontSize:18, fontWeight:900, color:'#fff', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
          <Layers size={20} color="#FC5F16" /> Mapeamento de Planos x Servidores
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {plans.map(plan => {
            const hasMapping = mappings.some(m => m.plan_id === plan.id)
            return (
              <div 
                key={plan.id}
                onClick={() => openMapping(plan)}
                style={{ 
                  background: selectedPlan?.id === plan.id ? 'rgba(252, 95, 22, 0.1)' : 'rgba(255,255,255,0.03)',
                  border: selectedPlan?.id === plan.id ? '1px solid #FC5F16' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, padding: 16, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <h3 style={{ fontSize:15, fontWeight:800, color:'#fff' }}>{plan.name}</h3>
                  {hasMapping && <CheckCircle size={16} color="#34d399" />}
                </div>
                <p style={{ fontSize:12, color:'#71717a' }}>{plan.max_connections} Tela(s) · {plan.duration_days} Dias</p>
                <div style={{ marginTop:12, fontSize:10, fontWeight:700, color: hasMapping ? '#FC5F16' : '#52525b', textTransform:'uppercase' }}>
                  {hasMapping ? 'Configurado' : 'Clique para configurar'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Editor de Mapeamento */}
      {selectedPlan && (
        <div style={{ background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)', border:'1px solid rgba(252, 95, 22,0.1)', borderRadius:16, padding:28, animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
            <div>
              <h2 style={{ fontSize:18, fontWeight:900, color:'#fff' }}>Configurar: {selectedPlan.name}</h2>
              <p style={{ fontSize:12, color:'#71717a' }}>Selecione quais servidores serão ativados para este plano</p>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => toggleAll(true)} style={btnGhost}><CheckSquare size={14}/> Marcar Todos</button>
              <button onClick={() => toggleAll(false)} style={btnGhost}><Square size={14}/> Desmarcar Todos</button>
            </div>
          </div>

          {/* Barra de Aplicação Global */}
          <div style={{ background:'rgba(255, 165, 0, 0.05)', border:'1px dashed #FFA500', borderRadius:12, padding:16, marginBottom:24, display:'flex', alignItems:'center', gap:15 }}>
            <Zap size={20} color="#FFA500" />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, fontWeight:800, color:'#FFA500', marginBottom:5, textTransform:'uppercase' }}>Definir Nome do Pacote para todos os Marcados:</div>
              <input 
                style={{ ...inputStyle, background:'rgba(0,0,0,0.3)' }}
                placeholder="Ex: 6 MESES IPTV - COMPLETO C/ ADULTO"
                value={globalPackage}
                onChange={e => setGlobalPackage(e.target.value)}
              />
            </div>
            <button onClick={applyGlobalPackage} style={{ ...btnPrimary, height:40 }}>Aplicar nos Marcados</button>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:24 }}>
            {editingMapping.map((item, index) => (
              <div 
                key={item.server_id} 
                style={{ 
                  display:'grid', gridTemplateColumns:'auto 1fr 2fr', gap:20, alignItems:'center',
                  background: item.enabled ? 'rgba(252, 95, 22, 0.03)' : 'transparent',
                  padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <input 
                  type="checkbox" 
                  checked={item.enabled} 
                  onChange={e => updateMapping(index, 'enabled', e.target.checked)}
                  style={{ width:18, height:18, cursor:'pointer', accentColor:'#FC5F16' }}
                />
                <div style={{ fontWeight:700, color: item.enabled ? '#fff' : '#52525b', fontSize:14 }}>{item.server_name}</div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                   <span style={{ fontSize:11, color:'#71717a', whiteSpace:'nowrap' }}>Pacote no Servidor:</span>
                   <input 
                     style={{ ...inputStyle, opacity: item.enabled ? 1 : 0.5 }} 
                     disabled={!item.enabled}
                     value={item.package_name}
                     onChange={e => updateMapping(index, 'package_name', e.target.value)}
                     placeholder="Ex: FULL HD + ADULTOS"
                   />
                </div>
              </div>
            ))}
          </div>

          {message.text && (
            <div style={{ marginBottom:20, padding:'12px 16px', borderRadius:10, background: message.type==='success'?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)', border:`1px solid ${message.type==='success'?'#10b981':'#ef4444'}`, color: message.type==='success'?'#34d399':'#f87171', fontSize:13, display:'flex', alignItems:'center', gap:8 }}>
              {message.type==='success' ? <CheckCircle size={16}/> : <AlertTriangle size={16}/>}
              {message.text}
            </div>
          )}

          <div style={{ display:'flex', gap:12 }}>
            <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, flex:1, justifyContent:'center' }}>
              <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Configuração do Plano'}
            </button>
            <button onClick={() => setSelectedPlan(null)} style={{ ...btnGhost, padding:'0 24px' }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlanMapping
