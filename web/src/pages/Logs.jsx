import { useState, useEffect } from 'react'
import api from '../services/api'
import {
  Bug, FileText, Search, X, CheckCircle, RefreshCw,
  AlertTriangle, AlertOctagon, Info, Zap, Cpu, Globe,
  Navigation, Play, Wifi, Monitor, ChevronDown, ChevronUp,
  Smartphone, Clock, Hash
} from 'lucide-react'

// ─── Helpers ───────────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

const severityConfig = {
  critical: { label: 'CRÍTICO',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)',  Icon: AlertOctagon },
  error:    { label: 'ERRO',     color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.25)', Icon: AlertTriangle },
  warning:  { label: 'AVISO',   color: '#eab308', bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.25)',  Icon: AlertTriangle },
  info:     { label: 'INFO',    color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', Icon: Info },
}

const typeConfig = {
  AppSync:    { icon: '📱', color: '#a78bfa', label: 'AppSync'    },
  crash:      { icon: '💥', color: '#ef4444', label: 'Crash'      },
  navigation: { icon: '🧭', color: '#60a5fa', label: 'Navigation' },
  player:     { icon: '▶️', color: '#34d399', label: 'Player'     },
  api:        { icon: '🔌', color: '#FFA500', label: 'API'        },
  ui:         { icon: '🎨', color: '#f472b6', label: 'UI'         },
  network:    { icon: '📡', color: '#38bdf8', label: 'Network'    },
  system:     { icon: '⚙️', color: '#94a3b8', label: 'System'    },
}

// ─── Sub-componentes ───────────────────────────────────────
const inputStyle = {
  padding: '9px 14px', background: 'rgba(5,5,5,0.6)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
  color: '#fff', fontSize: 13, outline: 'none', boxSizing:'border-box',
}

const selectStyle = {
  ...{ padding: '9px 14px', background: 'rgba(5,5,5,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none', cursor: 'pointer' }
}

const StatCard = ({ value, label, color, Icon }) => (
  <div style={{
    background: 'rgba(17,17,17,0.7)', backdropFilter: 'blur(14px)',
    border: '1px solid rgba(255,165,0,0.1)', borderRadius: 14,
    padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  }}>
    <div style={{ width: 42, height: 42, borderRadius: 10, background: `${color}22`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0 }}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 11, color: '#52525b', marginTop: 2, fontWeight: 600 }}>{label}</p>
    </div>
  </div>
)

const SeverityBadge = ({ severity }) => {
  const cfg = severityConfig[severity] || { label: severity?.toUpperCase() || 'N/A', color: '#71717a', bg: 'rgba(113,113,122,0.1)', border: 'rgba(113,113,122,0.2)', Icon: Info }
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:999, background: cfg.bg, border:`1px solid ${cfg.border}`, color: cfg.color, fontSize:11, fontWeight:800 }}>
      <cfg.Icon size={11} />
      {cfg.label}
    </span>
  )
}

const TypeBadge = ({ type }) => {
  const cfg = typeConfig[type] || { icon: '📄', color: '#71717a', label: type || 'N/A' }
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:999, background: `${cfg.color}15`, border:`1px solid ${cfg.color}35`, color: cfg.color, fontSize:11, fontWeight:700 }}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

const ItemCard = ({ item, isBug, onResolve }) => {
  const [expanded, setExpanded] = useState(false)
  const hasTrace = !!(item.stack_trace || item.message)

  return (
    <div style={{
      background: 'rgba(17,17,17,0.65)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14,
      overflow: 'hidden', transition: 'border-color .2s',
      borderLeft: `3px solid ${severityConfig[item.severity]?.color || '#FFA500'}`,
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,165,0,0.3)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
    >
      <div style={{ padding: '16px 20px' }}>
        {/* Linha superior: badges + data */}
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:10 }}>
          <SeverityBadge severity={item.severity} />
          <TypeBadge type={item.type} />
          {isBug && item.resolvido && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:999, background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.25)', color:'#34d399', fontSize:11, fontWeight:700 }}>
              <CheckCircle size={11}/> RESOLVIDO
            </span>
          )}
          <span style={{ marginLeft:'auto', fontSize:11, color:'#52525b', display:'flex', alignItems:'center', gap:5 }}>
            <Clock size={11}/> {formatDate(item.data || item.timestamp)}
          </span>
        </div>

        {/* Infos do dispositivo */}
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom: hasTrace || (isBug && !item.resolvido) ? 12 : 0 }}>
          {(item.modelo || item.nome) && (
            <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#71717a' }}>
              <Smartphone size={12}/> {item.modelo || item.nome}
            </span>
          )}
          {item.app_version && (
            <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#71717a' }}>
              <Hash size={12}/> v{item.app_version}
            </span>
          )}
          {item.email && (
            <span style={{ fontSize:12, color:'#52525b' }}>{item.email}</span>
          )}
          {item.context?.screenName && (
            <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#71717a' }}>
              <Monitor size={12}/> {item.context.screenName}
              {item.context.userAction && <span style={{ color:'#3f3f46' }}>→ {item.context.userAction}</span>}
            </span>
          )}
          {item.device_id && (
            <span style={{ fontFamily:'monospace', fontSize:11, color:'#3f3f46' }}>ID: {item.device_id}</span>
          )}
        </div>

        {/* Stack Trace expansível */}
        {hasTrace && (
          <>
            <button onClick={() => setExpanded(v => !v)}
              style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'#FFA500', fontSize:12, fontWeight:700, padding:0, marginBottom: expanded ? 10 : 0 }}>
              {expanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
              {expanded ? 'Ocultar' : 'Ver'} {item.stack_trace ? 'Stack Trace' : 'Mensagem'}
            </button>
            {expanded && (
              <pre style={{
                background:'rgba(5,5,5,0.7)', border:'1px solid rgba(255,255,255,0.06)',
                borderRadius:10, padding:'12px 14px', fontSize:11, color:'#a1a1aa',
                overflowX:'auto', maxHeight:200, lineHeight:1.6, whiteSpace:'pre-wrap', wordBreak:'break-word',
              }}>
                {item.stack_trace || item.message}
              </pre>
            )}
          </>
        )}

        {/* Botão resolver */}
        {isBug && !item.resolvido && (
          <button onClick={() => onResolve(item.id)}
            style={{ marginTop:12, display:'inline-flex', alignItems:'center', gap:6, padding:'7px 16px', background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:9, color:'#34d399', fontSize:12, fontWeight:700, cursor:'pointer' }}>
            <CheckCircle size={14}/> Marcar como Resolvido
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Componente Principal ──────────────────────────────────
const Logs = () => {
  const [activeTab, setActiveTab]  = useState('bugs')
  const [bugs, setBugs]            = useState([])
  const [logs, setLogs]            = useState([])
  const [loading, setLoading]      = useState(true)
  const [error, setError]          = useState(null)
  const [filters, setFilters]      = useState({ resolvido:'false', severity:'', type:'', search:'' })

  useEffect(() => {
    if (activeTab === 'bugs') fetchBugs()
    else fetchLogs()
  }, [activeTab, filters.resolvido, filters.severity, filters.type])

  const fetchBugs = async () => {
    try {
      setLoading(true); setError(null)
      const p = new URLSearchParams()
      if (filters.resolvido) p.append('resolvido', filters.resolvido)
      if (filters.severity)  p.append('severity',  filters.severity)
      if (filters.type)      p.append('type',       filters.type)
      const r = await api.get(`/api/bug?${p}`)
      setBugs(r.data.bugs || [])
    } catch { setError('Erro ao carregar bugs.') }
    finally { setLoading(false) }
  }

  const fetchLogs = async () => {
    try {
      setLoading(true); setError(null)
      const p = new URLSearchParams()
      if (filters.severity) p.append('severity', filters.severity)
      if (filters.type)     p.append('type',     filters.type)
      const r = await api.get(`/api/logs?${p}`)
      setLogs(r.data.logs || [])
    } catch { setError('Erro ao carregar logs.') }
    finally { setLoading(false) }
  }

  const resolveBug = async (bugId) => {
    try { await api.post('/api/bug/resolve', { bug_id: bugId }); fetchBugs() }
    catch { alert('Erro ao resolver bug') }
  }

  const clearFilters = () => setFilters({ resolvido:'false', severity:'', type:'', search:'' })

  const rawData = activeTab === 'bugs' ? bugs : logs
  const data = rawData.filter(item => {
    if (!filters.search) return true
    const t = filters.search.toLowerCase()
    return item.stack_trace?.toLowerCase().includes(t) ||
           item.message?.toLowerCase().includes(t) ||
           item.modelo?.toLowerCase().includes(t) ||
           item.type?.toLowerCase().includes(t)
  })

  // Stats
  const bugsTotal    = bugs.length
  const bugsPending  = bugs.filter(b => !b.resolvido).length
  const bugsResolved = bugs.filter(b => b.resolvido).length
  const critical     = rawData.filter(i => i.severity === 'critical').length
  const errors       = rawData.filter(i => i.severity === 'error').length

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize:26, fontWeight:900, color:'#fff', display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
          <Bug size={26} color='#FFA500' /> Logs & Bugs
        </h1>
        <p style={{ fontSize:12, color:'#52525b' }}>Monitoramento em tempo real de erros e logs do sistema</p>
      </div>

      {/* ── Stats Cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:24 }}>
        <StatCard value={bugsTotal}   label="Bugs Total"   color="#FFA500" Icon={Bug}           />
        <StatCard value={bugsPending}  label="Pendentes"    color="#ef4444" Icon={AlertOctagon}  />
        <StatCard value={bugsResolved} label="Resolvidos"   color="#34d399" Icon={CheckCircle}   />
        <StatCard value={critical}     label="Críticos"     color="#f97316" Icon={Zap}           />
        <StatCard value={logs.length}  label="System Logs"  color="#3b82f6" Icon={FileText}      />
      </div>

      {/* ── Tabs ── */}
      <div style={{ display:'flex', gap:4, marginBottom:20, background:'rgba(17,17,17,0.6)', padding:5, borderRadius:12, width:'fit-content', border:'1px solid rgba(255,255,255,0.06)' }}>
        {[
          { key:'bugs', Icon:Bug,       label:`Bugs (${bugs.length})`           },
          { key:'logs', Icon:FileText,  label:`System Logs (${logs.length})`    },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{
              display:'flex', alignItems:'center', gap:7, padding:'8px 18px', borderRadius:9,
              border:'none', cursor:'pointer', fontSize:13, fontWeight:700, transition:'all .2s',
              background: activeTab===tab.key ? 'rgba(255,165,0,0.15)' : 'transparent',
              color: activeTab===tab.key ? '#FFA500' : '#71717a',
              boxShadow: activeTab===tab.key ? '0 2px 10px rgba(255,165,0,0.15)' : 'none',
            }}>
            <tab.Icon size={15}/> {tab.label}
          </button>
        ))}
      </div>

      {/* ── Filtros ── */}
      <div style={{
        background:'rgba(17,17,17,0.65)', backdropFilter:'blur(12px)',
        border:'1px solid rgba(255,255,255,0.06)', borderRadius:14,
        padding:'14px 18px', marginBottom:20,
        display:'flex', gap:10, flexWrap:'wrap', alignItems:'center',
      }}>
        {/* Busca */}
        <div style={{ position:'relative', flex:'1', minWidth:200 }}>
          <Search size={14} color='#52525b' style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
          <input
            value={filters.search}
            onChange={e => setFilters({...filters, search:e.target.value})}
            placeholder="Buscar por mensagem, modelo, tipo..."
            style={{ ...inputStyle, paddingLeft:32, paddingRight: filters.search ? 32 : 14, width:'100%' }}
          />
          {filters.search && (
            <button onClick={() => setFilters({...filters, search:''})}
              style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#71717a', cursor:'pointer', display:'flex' }}>
              <X size={13}/>
            </button>
          )}
        </div>

        {/* Severidade */}
        <select value={filters.severity} onChange={e=>setFilters({...filters,severity:e.target.value})} style={selectStyle}>
          <option value=''>Todas Severidades</option>
          <option value='critical'>🔴 Critical</option>
          <option value='error'>🟠 Error</option>
          <option value='warning'>🟡 Warning</option>
          <option value='info'>🔵 Info</option>
        </select>

        {/* Tipo */}
        <select value={filters.type} onChange={e=>setFilters({...filters,type:e.target.value})} style={selectStyle}>
          <option value=''>Todos Tipos</option>
          <option value='AppSync'>📱 AppSync</option>
          <option value='crash'>💥 Crash</option>
          <option value='navigation'>🧭 Navigation</option>
          <option value='player'>▶️ Player</option>
          <option value='api'>🔌 API</option>
          <option value='ui'>🎨 UI</option>
          <option value='network'>📡 Network</option>
          <option value='system'>⚙️ System</option>
        </select>

        {/* Status (só bugs) */}
        {activeTab === 'bugs' && (
          <select value={filters.resolvido} onChange={e=>setFilters({...filters,resolvido:e.target.value})} style={selectStyle}>
            <option value='false'>🔴 Não Resolvidos</option>
            <option value='true'>✅ Resolvidos</option>
            <option value=''>Todos</option>
          </select>
        )}

        {/* Botão Atualizar */}
        <button onClick={() => activeTab==='bugs' ? fetchBugs() : fetchLogs()}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 14px', background:'rgba(255,165,0,0.1)', border:'1px solid rgba(255,165,0,0.2)', borderRadius:10, color:'#FFA500', fontSize:13, fontWeight:700, cursor:'pointer' }}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}/> Atualizar
        </button>

        {/* Limpar filtros */}
        <button onClick={clearFilters}
          style={{ display:'flex', alignItems:'center', gap:5, padding:'9px 12px', background:'none', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, color:'#52525b', fontSize:12, cursor:'pointer' }}>
          <X size={13}/> Limpar
        </button>
      </div>

      {/* ── Erro ── */}
      {error && (
        <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:12, padding:'14px 18px', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ color:'#f87171', fontSize:13 }}>{error}</span>
          <button onClick={() => activeTab==='bugs' ? fetchBugs() : fetchLogs()}
            style={{ padding:'7px 14px', background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, color:'#f87171', fontSize:12, cursor:'pointer' }}>
            Tentar Novamente
          </button>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && !error && (
        <div style={{ textAlign:'center', padding:48, color:'#52525b' }}>
          <RefreshCw size={26} color='#FFA500' style={{ animation:'spin 1s linear infinite', display:'block', margin:'0 auto 12px' }}/>
          Carregando {activeTab === 'bugs' ? 'bugs' : 'logs'}...
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && data.length === 0 && (
        <div style={{ textAlign:'center', padding:48, background:'rgba(17,17,17,0.5)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:14 }}>
          {activeTab === 'bugs'
            ? <Bug size={36} color='#27272a' style={{ display:'block', margin:'0 auto 12px' }}/>
            : <FileText size={36} color='#27272a' style={{ display:'block', margin:'0 auto 12px' }}/>
          }
          <p style={{ color:'#52525b', fontSize:14 }}>
            Nenhum {activeTab === 'bugs' ? 'bug' : 'log'} encontrado com os filtros aplicados.
          </p>
          <button onClick={clearFilters}
            style={{ marginTop:12, padding:'8px 18px', background:'rgba(255,165,0,0.12)', border:'1px solid rgba(255,165,0,0.25)', borderRadius:9, color:'#FFA500', fontSize:13, cursor:'pointer', fontWeight:700 }}>
            Limpar Filtros
          </button>
        </div>
      )}

      {/* ── Lista ── */}
      {!loading && !error && data.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <p style={{ fontSize:11, color:'#52525b', marginBottom:4 }}>
            Exibindo <span style={{ color:'#FFA500', fontWeight:700 }}>{data.length}</span> {activeTab === 'bugs' ? 'bugs' : 'logs'}
            {filters.search && <span> para "<strong>{filters.search}</strong>"</span>}
          </p>
          {data.map(item => (
            <ItemCard key={item.id} item={item} isBug={activeTab==='bugs'} onResolve={resolveBug} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}

export default Logs
