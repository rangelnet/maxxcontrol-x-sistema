import { useState, useEffect } from 'react'
import api from '../services/api'
import { Activity, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw, Wifi, Zap } from 'lucide-react'

const StatCard = ({ label, value, color, Icon }) => (
  <div style={{ background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)', border:'1px solid rgba(255,165,0,0.1)', borderRadius:14, padding:'18px 22px', display:'flex', alignItems:'center', gap:14, boxShadow:'0 4px 20px rgba(0,0,0,0.3)' }}>
    <div style={{ width:46, height:46, borderRadius:12, background:`${color}20`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <Icon size={22} color={color}/>
    </div>
    <div>
      <p style={{ fontSize:24, fontWeight:800, color:'#fff', lineHeight:1 }}>{value ?? '—'}</p>
      <p style={{ fontSize:11, color:'#52525b', marginTop:3, fontWeight:600 }}>{label}</p>
    </div>
  </div>
)

const APIMonitor = () => {
  const [data, setData]             = useState(null)
  const [loading, setLoading]       = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    loadData()
    if (autoRefresh) {
      const interval = setInterval(loadData, 30000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const loadData = async () => {
    try {
      const r = await api.get('/api/api-monitor/check-all')
      setData(r.data)
      setLastUpdate(new Date())
    } catch {}
    finally { setLoading(false) }
  }

  const formatLatency = (ms) => {
    if (!ms) return '—'
    const v = parseInt(ms)
    if (v < 100)  return { text:`${v}ms`, color:'#34d399' }
    if (v < 500)  return { text:`${v}ms`, color:'#facc15' }
    return { text:`${v}ms`, color:'#f87171' }
  }

  const formatUpdate = () => {
    if (!lastUpdate) return ''
    const diff = Math.floor((new Date()-lastUpdate)/1000)
    if (diff < 10) return 'agora mesmo'
    if (diff < 60) return `há ${diff}s`
    return `há ${Math.floor(diff/60)}min`
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:900, color:'#fff', display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <Activity size={26} color='#FFA500'/> Monitor de APIs
          </h1>
          <p style={{ fontSize:12, color:'#52525b' }}>
            {lastUpdate ? `Atualizado ${formatUpdate()}` : 'Verificando status...'}
          </p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {/* Toggle auto-refresh */}
          <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
            <div onClick={() => setAutoRefresh(v=>!v)} style={{ width:38, height:20, borderRadius:999, background: autoRefresh?'rgba(255,165,0,0.3)':'rgba(255,255,255,0.08)', border:`1px solid ${autoRefresh?'rgba(255,165,0,0.5)':'rgba(255,255,255,0.1)'}`, position:'relative', transition:'all .2s', cursor:'pointer', flexShrink:0 }}>
              <div style={{ width:14, height:14, borderRadius:'50%', background: autoRefresh?'#FFA500':'#52525b', position:'absolute', top:2, left: autoRefresh?20:2, transition:'all .2s' }}/>
            </div>
            <span style={{ fontSize:12, color:'#71717a' }}>Auto (30s)</span>
          </label>
          <button onClick={loadData} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 16px', background:'rgba(255,165,0,0.1)', border:'1px solid rgba(255,165,0,0.2)', borderRadius:10, color:'#FFA500', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            <RefreshCw size={14} style={{ animation:loading?'spin 1s linear infinite':'none' }}/> Atualizar
          </button>
        </div>
      </div>

      {/* Stats */}
      {data?.summary && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:24 }}>
          <StatCard label='Total de APIs'   value={data.summary.total}         color='#FFA500' Icon={Activity}     />
          <StatCard label='Online'          value={data.summary.online}        color='#34d399' Icon={CheckCircle}  />
          <StatCard label='Offline'         value={data.summary.offline}       color='#f87171' Icon={XCircle}      />
          <StatCard label='Latência Média'  value={data.summary.avg_latency ? `${data.summary.avg_latency}ms` : '—'} color='#60a5fa' Icon={Clock} />
        </div>
      )}

      {/* Alerta crítico */}
      {data?.summary?.critical_offline > 0 && (
        <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:12, padding:'14px 18px', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
          <AlertTriangle size={18} color='#f87171'/>
          <div>
            <p style={{ fontSize:13, fontWeight:800, color:'#f87171', marginBottom:2 }}>Atenção!</p>
            <p style={{ fontSize:12, color:'#fca5a5' }}>{data.summary.critical_offline} API(s) crítica(s) offline — verifique imediatamente.</p>
          </div>
        </div>
      )}

      {/* Lista de APIs */}
      {loading && !data ? (
        <div style={{ textAlign:'center', padding:48, color:'#52525b' }}>
          <RefreshCw size={26} color='#FFA500' style={{ animation:'spin 1s linear infinite', display:'block', margin:'0 auto 12px' }}/>
          Verificando APIs...
        </div>
      ) : (
        <div style={{ background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)', border:'1px solid rgba(255,165,0,0.1)', borderRadius:16, overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.3)' }}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ fontSize:14, fontWeight:800, color:'#fff' }}>Status das APIs</h2>
          </div>
          <div style={{ display:'flex', flexDirection:'column' }}>
            {data?.apis?.map((api, idx) => {
              const isOnline = api.status === 'online'
              const latency = formatLatency(api.latency)
              return (
                <div key={idx} style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px',
                  borderBottom:'1px solid rgba(255,255,255,0.04)',
                  background: idx%2===0?'transparent':'rgba(255,255,255,0.01)',
                  transition:'background .15s', gap:12, flexWrap:'wrap',
                }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,165,0,0.04)'}
                  onMouseLeave={e=>e.currentTarget.style.background=idx%2===0?'transparent':'rgba(255,255,255,0.01)'}
                >
                  {/* Status + Info */}
                  <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, minWidth:200 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background: isOnline?'rgba(16,185,129,0.12)':'rgba(239,68,68,0.12)', border:`1px solid ${isOnline?'rgba(16,185,129,0.25)':'rgba(239,68,68,0.25)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {isOnline ? <CheckCircle size={16} color='#34d399'/> : <XCircle size={16} color='#f87171'/>}
                    </div>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                        <p style={{ fontSize:13, fontWeight:700, color:'#e4e4e7' }}>{api.name}</p>
                        {api.critical && <span style={{ fontSize:10, padding:'2px 7px', borderRadius:999, background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171', fontWeight:800 }}>CRÍTICA</span>}
                      </div>
                      <p style={{ fontFamily:'monospace', fontSize:11, color:'#52525b' }}>{api.url}</p>
                    </div>
                  </div>

                  {/* Métricas */}
                  <div style={{ display:'flex', gap:16, alignItems:'center' }}>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 12px', borderRadius:999, background: isOnline?'rgba(16,185,129,0.12)':'rgba(239,68,68,0.12)', border:`1px solid ${isOnline?'rgba(16,185,129,0.25)':'rgba(239,68,68,0.25)'}`, color: isOnline?'#34d399':'#f87171', fontSize:11, fontWeight:800 }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background: isOnline?'#34d399':'#f87171', boxShadow: isOnline?'0 0 6px #34d399':'none', animation: isOnline?'pulse 1.5s infinite':'none' }}/>
                      {isOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                    {isOnline && api.statusCode && (
                      <span style={{ fontSize:12, color:'#71717a' }}>HTTP {api.statusCode}</span>
                    )}
                    {isOnline && typeof api.latency !== 'undefined' && (
                      <span style={{ fontSize:12, fontWeight:700, color: latency.color, display:'flex', alignItems:'center', gap:4 }}>
                        <Clock size={12}/> {latency.text}
                      </span>
                    )}
                    {!isOnline && api.error && (
                      <span style={{ fontSize:11, color:'#91524a', maxWidth:200, textAlign:'right' }}>{api.error}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
      `}</style>
    </div>
  )
}

export default APIMonitor
