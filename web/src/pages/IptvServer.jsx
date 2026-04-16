import { useState, useEffect } from 'react'
import { Server, Save, TestTube, CheckCircle, AlertTriangle, List, X, Zap } from 'lucide-react'

const inputStyle = {
  width:'100%', padding:'10px 14px', background:'rgba(5,5,5,0.6)',
  border:'1px solid rgba(255,255,255,0.08)', borderRadius:10,
  color:'#fff', fontSize:13, outline:'none', boxSizing:'border-box',
  transition:'border-color .2s',
}

const labelStyle = {
  display:'block', fontSize:11, fontWeight:700, color:'#71717a',
  textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:7,
}

const IptvServer = () => {
  const [config, setConfig] = useState({ xtream_url:'', xtream_username:'', xtream_password:'' })
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState({ type:'', text:'' })
  const [showTestLists, setShowTestLists] = useState(false)

  const testLists = [
    { name:'Servidor Teste 1', url:'http://xtream.swiftiptv.com:8080', username:'test', password:'test', description:'Servidor público de teste com canais internacionais' },
    { name:'Servidor Teste 2', url:'http://pro.xviptv.com:25443',      username:'test', password:'test', description:'Servidor de demonstração com múltiplas categorias' },
    { name:'Servidor Teste 3', url:'http://iptv.allkaicerteam.com:8080',username:'test', password:'test', description:'Servidor teste com VOD e séries' },
  ]

  useEffect(() => { fetchConfig() }, [])

  const fetchConfig = async () => {
    try {
      const r = await fetch('/api/iptv-server/config')
      const d = await r.json()
      if (d.xtream_url) setConfig(d)
    } catch {}
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setMessage({ type:'', text:'' })
    try {
      const r = await fetch('/api/iptv-server/config', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(config) })
      const d = await r.json()
      setMessage(r.ok ? { type:'success', text:'Configuração salva com sucesso!' } : { type:'error', text:d.error||'Erro ao salvar' })
    } catch { setMessage({ type:'error', text:'Erro ao salvar configuração' }) }
    finally { setLoading(false) }
  }

  const handleTest = async () => {
    setTesting(true); setMessage({ type:'', text:'' })
    try {
      const r = await fetch('/api/iptv-server/test', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(config) })
      const d = await r.json()
      setMessage(d.success ? { type:'success', text:`Conexão OK! ${d.channels||0} canais disponíveis` } : { type:'error', text:d.message||'Falha na conexão' })
    } catch { setMessage({ type:'error', text:'Erro ao testar conexão' }) }
    finally { setTesting(false) }
  }

  const loadTestList = (t) => {
    setConfig({ xtream_url:t.url, xtream_username:t.username, xtream_password:t.password })
    setShowTestLists(false)
    setMessage({ type:'info', text:`Lista "${t.name}" carregada. Clique em "Testar Conexão" para verificar.` })
  }

  const btnPrimary = { display:'inline-flex', alignItems:'center', gap:7, padding:'10px 20px', background:'linear-gradient(135deg,#FFA500,#FF6B00)', border:'none', borderRadius:10, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 12px rgba(255,165,0,0.3)', whiteSpace:'nowrap' }
  const btnGhost   = { display:'inline-flex', alignItems:'center', gap:7, padding:'10px 16px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'#a1a1aa', fontSize:13, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:900, color:'#fff', display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
          <Server size={26} color='#FFA500'/> Servidor IPTV Global
        </h1>
        <p style={{ fontSize:12, color:'#52525b' }}>Configuração padrão aplicada a todos os dispositivos</p>
      </div>

      {/* Info banner */}
      <div style={{ background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:12, padding:'12px 16px', marginBottom:24, display:'flex', alignItems:'center', gap:10 }}>
        <Zap size={16} color='#60a5fa'/>
        <p style={{ fontSize:12, color:'#93c5fd' }}>
          Esta é a configuração global. Servidores específicos por dispositivo podem ser definidos na aba <strong>Dispositivos</strong>.
        </p>
      </div>

      {/* Card config */}
      <div style={{ background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)', border:'1px solid rgba(255,165,0,0.1)', borderRadius:16, padding:28, boxShadow:'0 8px 32px rgba(0,0,0,0.35)', marginBottom:20 }}>
        <h2 style={{ fontSize:16, fontWeight:800, color:'#fff', marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#FFA500', boxShadow:'0 0 8px #FFA500' }}/> Configuração Xtream Codes
        </h2>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div>
            <label style={labelStyle}>URL do Servidor</label>
            <input style={inputStyle} value={config.xtream_url} onChange={e=>setConfig({...config,xtream_url:e.target.value})} placeholder='http://exemplo.com:8080' required/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={labelStyle}>Usuário</label>
              <input style={inputStyle} value={config.xtream_username} onChange={e=>setConfig({...config,xtream_username:e.target.value})} placeholder='usuario' required/>
            </div>
            <div>
              <label style={labelStyle}>Senha</label>
              <input style={inputStyle} type='password' value={config.xtream_password} onChange={e=>setConfig({...config,xtream_password:e.target.value})} placeholder='senha' required/>
            </div>
          </div>

          {/* Mensagem feedback */}
          {message.text && (
            <div style={{
              display:'flex', alignItems:'center', gap:8, padding:'12px 14px', borderRadius:10,
              background: message.type==='success' ? 'rgba(16,185,129,0.1)' : message.type==='info' ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${message.type==='success'?'rgba(16,185,129,0.25)':message.type==='info'?'rgba(59,130,246,0.25)':'rgba(239,68,68,0.25)'}`,
              color: message.type==='success' ? '#34d399' : message.type==='info' ? '#60a5fa' : '#f87171',
              fontSize:13,
            }}>
              {message.type==='success' ? <CheckCircle size={16}/> : <AlertTriangle size={16}/>}
              {message.text}
            </div>
          )}

          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <button type='submit' disabled={loading} style={{ ...btnPrimary, opacity:loading?0.7:1 }}>
              <Save size={15}/> {loading?'Salvando…':'Salvar Configuração'}
            </button>
            <button type='button' onClick={handleTest} disabled={testing||!config.xtream_url} style={{ ...btnGhost, opacity:(testing||!config.xtream_url)?0.5:1 }}>
              <TestTube size={15}/> {testing?'Testando…':'Testar Conexão'}
            </button>
            <button type='button' onClick={() => setShowTestLists(!showTestLists)} style={btnGhost}>
              <List size={15}/> Listas de Teste
            </button>
          </div>
        </form>
      </div>

      {/* Listas de teste */}
      {showTestLists && (
        <div style={{ background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <h3 style={{ fontSize:14, fontWeight:800, color:'#fff', display:'flex', alignItems:'center', gap:8 }}>
              <TestTube size={15} color='#FFA500'/> Servidores de Teste Públicos
            </h3>
            <button onClick={() => setShowTestLists(false)} style={{ background:'none', border:'none', color:'#52525b', cursor:'pointer', display:'flex' }}>
              <X size={16}/>
            </button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {testLists.map((t, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:10 }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:'#e4e4e7', marginBottom:2 }}>{t.name}</p>
                  <p style={{ fontSize:11, color:'#52525b' }}>{t.description}</p>
                  <p style={{ fontFamily:'monospace', fontSize:11, color:'#FFA500', marginTop:3 }}>{t.url}</p>
                </div>
                <button onClick={() => loadTestList(t)}
                  style={{ padding:'7px 14px', background:'rgba(255,165,0,0.12)', border:'1px solid rgba(255,165,0,0.25)', borderRadius:9, color:'#FFA500', fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', marginLeft:12 }}>
                  Usar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default IptvServer
