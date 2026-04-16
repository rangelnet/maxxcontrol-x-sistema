import { useState, useEffect } from 'react'
import api from '../services/api'
import {
  Bug, CheckCircle, AlertOctagon, AlertTriangle, Clock,
  Smartphone, Hash, RefreshCw, ChevronDown, ChevronUp, X
} from 'lucide-react'

// ─── Helpers ───────────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

const severityConfig = {
  critical: { color:'#ef4444', bg:'rgba(239,68,68,0.12)',  border:'rgba(239,68,68,0.25)'  },
  error:    { color:'#f97316', bg:'rgba(249,115,22,0.12)', border:'rgba(249,115,22,0.25)' },
  warning:  { color:'#eab308', bg:'rgba(234,179,8,0.12)',  border:'rgba(234,179,8,0.25)'  },
  info:     { color:'#3b82f6', bg:'rgba(59,130,246,0.12)', border:'rgba(59,130,246,0.25)' },
}

// ─── BugCard ───────────────────────────────────────────────
const BugCard = ({ bug, onResolve }) => {
  const [expanded, setExpanded] = useState(false)
  const sev = severityConfig[bug.severity] || { color:'#71717a', bg:'rgba(113,113,122,0.1)', border:'rgba(113,113,122,0.2)' }

  return (
    <div style={{
      background: 'rgba(17,17,17,0.7)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderLeft: `3px solid ${sev.color}`,
      borderRadius: 14, overflow: 'hidden', transition: 'border-color .2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,165,0,0.25)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
    >
      <div style={{ padding: '16px 20px' }}>
        {/* Badges + Data */}
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:10 }}>
          {bug.severity && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:999, background:sev.bg, border:`1px solid ${sev.border}`, color:sev.color, fontSize:11, fontWeight:800 }}>
              <AlertOctagon size={11}/> {bug.severity.toUpperCase()}
            </span>
          )}
          <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:999, background: bug.resolvido ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', border:`1px solid ${bug.resolvido ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, color: bug.resolvido ? '#34d399' : '#f87171', fontSize:11, fontWeight:800 }}>
            {bug.resolvido ? <><CheckCircle size={11}/> RESOLVIDO</> : <><Bug size={11}/> PENDENTE</>}
          </span>
          <span style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#52525b' }}>
            <Clock size={11}/> {formatDate(bug.data)}
          </span>
        </div>

        {/* Info do dispositivo/usuário */}
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom: bug.stack_trace || !bug.resolvido ? 10 : 0 }}>
          {bug.nome && (
            <span style={{ fontSize:12, color:'#a1a1aa' }}>{bug.nome} <span style={{ color:'#52525b' }}>({bug.email})</span></span>
          )}
          {bug.modelo && (
            <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'#71717a' }}>
              <Smartphone size={12}/> {bug.modelo}
            </span>
          )}
          {bug.app_version && (
            <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'#71717a' }}>
              <Hash size={12}/> v{bug.app_version}
            </span>
          )}
        </div>

        {/* Stack Trace expansível */}
        {bug.stack_trace && (
          <>
            <button onClick={() => setExpanded(v => !v)}
              style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'#FFA500', fontSize:12, fontWeight:700, padding:0, marginBottom: expanded ? 10 : 0 }}>
              {expanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
              {expanded ? 'Ocultar' : 'Ver'} Stack Trace
            </button>
            {expanded && (
              <pre style={{
                background:'rgba(5,5,5,0.75)', border:'1px solid rgba(255,255,255,0.05)',
                borderRadius:10, padding:'12px 14px', fontSize:11, color:'#a1a1aa',
                overflowX:'auto', maxHeight:200, lineHeight:1.6, whiteSpace:'pre-wrap', wordBreak:'break-word',
              }}>
                {bug.stack_trace}
              </pre>
            )}
          </>
        )}

        {/* Resolver */}
        {!bug.resolvido && (
          <button onClick={() => onResolve(bug.id)}
            style={{ marginTop:12, display:'inline-flex', alignItems:'center', gap:6, padding:'7px 16px', background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:9, color:'#34d399', fontSize:12, fontWeight:700, cursor:'pointer' }}>
            <CheckCircle size={14}/> Marcar como Resolvido
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Componente Principal ──────────────────────────────────
const Bugs = () => {
  const [bugs, setBugs]     = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadBugs() }, [filter])

  const loadBugs = async () => {
    try {
      setLoading(true)
      const params = filter !== 'all' ? { resolvido: filter === 'resolved' } : {}
      const r = await api.get('/api/bug', { params })
      setBugs(r.data.bugs || [])
    } catch { setBugs([]) }
    finally { setLoading(false) }
  }

  const resolveBug = async (bugId) => {
    try { await api.post('/api/bug/resolve', { bug_id: bugId }); loadBugs() }
    catch { alert('Erro ao resolver bug') }
  }

  const pending  = bugs.filter(b => !b.resolvido).length
  const resolved = bugs.filter(b => b.resolvido).length

  const filterOpts = [
    { key:'all',      label:`Todos (${bugs.length})` },
    { key:'pending',  label:`Pendentes (${pending})`  },
    { key:'resolved', label:`Resolvidos (${resolved})` },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:900, color:'#fff', display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <Bug size={26} color='#FFA500'/> Bugs Reportados
          </h1>
          <p style={{ fontSize:12, color:'#52525b' }}>Erros reportados pelos dispositivos Android</p>
        </div>

        {/* Stats rápidas */}
        <div style={{ display:'flex', gap:10 }}>
          {[
            { label:'Total',     val:bugs.length, color:'#FFA500' },
            { label:'Pendentes', val:pending,      color:'#ef4444' },
            { label:'Resolvidos',val:resolved,     color:'#34d399' },
          ].map(s => (
            <div key={s.label} style={{ textAlign:'center', padding:'10px 16px', background:'rgba(17,17,17,0.7)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12 }}>
              <p style={{ fontSize:20, fontWeight:800, color:s.color, lineHeight:1 }}>{s.val}</p>
              <p style={{ fontSize:10, color:'#52525b', marginTop:2 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:20 }}>
        <div style={{ display:'flex', gap:4, background:'rgba(17,17,17,0.65)', padding:5, borderRadius:12, border:'1px solid rgba(255,255,255,0.06)' }}>
          {filterOpts.map(opt => (
            <button key={opt.key} onClick={() => setFilter(opt.key)}
              style={{
                padding:'7px 16px', borderRadius:9, border:'none', cursor:'pointer', fontSize:12, fontWeight:700, transition:'all .2s',
                background: filter===opt.key ? 'rgba(255,165,0,0.15)' : 'transparent',
                color: filter===opt.key ? '#FFA500' : '#71717a',
              }}>
              {opt.label}
            </button>
          ))}
        </div>
        <button onClick={loadBugs}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 14px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'#71717a', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}/> Atualizar
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign:'center', padding:48, color:'#52525b' }}>
          <RefreshCw size={26} color='#FFA500' style={{ animation:'spin 1s linear infinite', display:'block', margin:'0 auto 12px' }}/>
          Carregando bugs...
        </div>
      )}

      {/* Lista */}
      {!loading && (
        bugs.length === 0 ? (
          <div style={{ textAlign:'center', padding:48, background:'rgba(17,17,17,0.5)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:14 }}>
            <CheckCircle size={36} color='#27272a' style={{ display:'block', margin:'0 auto 12px' }}/>
            <p style={{ color:'#52525b', fontSize:14 }}>Nenhum bug encontrado para o filtro selecionado.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {bugs.map(bug => <BugCard key={bug.id} bug={bug} onResolve={resolveBug} />)}
          </div>
        )
      )}

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )
}

export default Bugs
