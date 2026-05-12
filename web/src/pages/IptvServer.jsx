import { useState, useEffect } from 'react'
import { Server, Save, TestTube, CheckCircle, AlertTriangle, List, X, Zap, Layers, HardDrive } from 'lucide-react'
import PlanMapping from './PlanMapping'
import ServerManager from './ServerManager'

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
  const [activeTab, setActiveTab] = useState('global') // 'global' | 'mapping' | 'servers'
  const [config, setConfig] = useState({ xtream_url:'', xtream_username:'', xtream_password:'' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type:'', text:'' })

  useEffect(() => { fetchConfig() }, [])

  const fetchConfig = async () => {
    try {
      const r = await fetch('/api/iptv-server/config')
      const d = await r.json()
      const urls = Array.isArray(d.test_api_urls) ? d.test_api_urls : (d.test_api_url ? [d.test_api_url] : [''])
      setConfig({ ...d, test_api_urls: urls.length > 0 ? urls : [''] })
    } catch {}
  }

  const addUrl = () => {
    setConfig({ ...config, test_api_urls: [...(config.test_api_urls || []), ''] })
  }

  const removeUrl = (index) => {
    const newUrls = (config.test_api_urls || []).filter((_, i) => i !== index)
    setConfig({ ...config, test_api_urls: newUrls.length > 0 ? newUrls : [''] })
  }

  const updateUrl = (index, value) => {
    const newUrls = [...(config.test_api_urls || [])]
    newUrls[index] = value
    setConfig({ ...config, test_api_urls: newUrls })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setMessage({ type:'', text:'' })
    try {
      const filteredUrls = (config.test_api_urls || []).filter(url => url.trim() !== '')
      const payload = { ...config, test_api_urls: filteredUrls, test_api_url: filteredUrls[0] || '' }
      
      const r = await fetch('/api/iptv-server/config', { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body:JSON.stringify(payload) 
      })
      const d = await r.json()
      setMessage(r.ok ? { type:'success', text:'Configuração salva com sucesso!' } : { type:'error', text:d.error||'Erro ao salvar' })
    } catch { setMessage({ type:'error', text:'Erro ao salvar configuração' }) }
    finally { setLoading(false) }
  }

  const btnPrimary = { display:'inline-flex', alignItems:'center', gap:7, padding:'10px 20px', background:'linear-gradient(135deg,#FFA500,#FF8C00)', border:'none', borderRadius:10, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 12px rgba(255,165,0,0.3)', whiteSpace:'nowrap' }
  const btnGhost   = { display:'inline-flex', alignItems:'center', gap:7, padding:'10px 16px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'#a1a1aa', fontSize:13, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:900, color:'#fff', display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
          <Server size={26} color='#FFA500'/> Gerenciamento IPTV
        </h1>
        <p style={{ fontSize:12, color:'#52525b' }}>Configuração global, mapeamento de planos e controle de servidores</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:24, borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:12 }}>
        <button 
          onClick={() => setActiveTab('global')}
          style={{ 
            ...btnGhost, 
            background: activeTab === 'global' ? 'rgba(255, 165, 0, 0.1)' : 'transparent',
            borderColor: activeTab === 'global' ? '#FFA500' : 'rgba(255,255,255,0.08)',
            color: activeTab === 'global' ? '#fff' : '#71717a'
          }}
        >
          <Zap size={16}/> Configuração Global
        </button>
        <button 
          onClick={() => setActiveTab('mapping')}
          style={{ 
            ...btnGhost, 
            background: activeTab === 'mapping' ? 'rgba(255, 165, 0, 0.1)' : 'transparent',
            borderColor: activeTab === 'mapping' ? '#FFA500' : 'rgba(255,255,255,0.08)',
            color: activeTab === 'mapping' ? '#fff' : '#71717a'
          }}
        >
          <Layers size={16}/> Mapeamento de Planos
        </button>
        <button 
          onClick={() => setActiveTab('servers')}
          style={{ 
            ...btnGhost, 
            background: activeTab === 'servers' ? 'rgba(255, 165, 0, 0.1)' : 'transparent',
            borderColor: activeTab === 'servers' ? '#FFA500' : 'rgba(255,255,255,0.08)',
            color: activeTab === 'servers' ? '#fff' : '#71717a'
          }}
        >
          <HardDrive size={16}/> Servidores
        </button>
      </div>

      {activeTab === 'global' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:12, padding:'12px 16px', marginBottom:24, display:'flex', alignItems:'center', gap:10 }}>
            <Zap size={16} color='#60a5fa'/>
            <p style={{ fontSize:12, color:'#93c5fd' }}>
              Esta é a configuração global. Servidores específicos por dispositivo podem ser definidos na aba <strong>Dispositivos</strong>.
            </p>
          </div>

          <div style={{ background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)', border:'1px solid rgba(255,165,0,0.1)', borderRadius:16, padding:28, boxShadow:'0 8px 32px rgba(0,0,0,0.35)', marginBottom:20 }}>
            <h2 style={{ fontSize:16, fontWeight:800, color:'#fff', marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#FFA500', boxShadow:'0 0 8px #FFA500' }}/> Links de Teste Grátis (Múltiplos)
            </h2>

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <label style={labelStyle}>Lista de URLs da API de Teste</label>
                
                {(config.test_api_urls || ['']).map((url, index) => (
                  <div key={index} style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <div style={{ flex:1 }}>
                      <input 
                        style={inputStyle} 
                        value={url} 
                        onChange={e => updateUrl(index, e.target.value)} 
                        placeholder='https://painel.masterbins.com/api/chatbot/...' 
                        required
                      />
                    </div>
                    <button 
                      type='button' 
                      onClick={() => removeUrl(index)}
                      style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, padding:10, color:'#f87171', cursor:'pointer' }}
                      title="Remover link"
                    >
                      <X size={16}/>
                    </button>
                  </div>
                ))}

                <button 
                  type='button' 
                  onClick={addUrl}
                  style={{ ...btnGhost, alignSelf:'flex-start', marginTop:4, borderColor:'rgba(255, 165, 0, 0.3)', color:'#FFA500' }}
                >
                  + Adicionar Novo Link
                </button>
              </div>

              {message.text && (
                <div style={{
                  display:'flex', alignItems:'center', gap:8, padding:'12px 14px', borderRadius:10,
                  background: message.type==='success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${message.type==='success'?'rgba(16,185,129,0.25)':'rgba(239,68,68,0.25)'}`,
                  color: message.type==='success' ? '#34d399' : '#f87171',
                  fontSize:13,
                }}>
                  {message.type==='success' ? <CheckCircle size={16}/> : <AlertTriangle size={16}/>}
                  {message.text}
                </div>
              )}

              <div style={{ display:'flex', gap:10 }}>
                <button type='submit' disabled={loading} style={{ ...btnPrimary, opacity:loading?0.7:1 }}>
                  <Save size={15}/> {loading?'Salvando…':'Salvar Configuração'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'mapping' && <PlanMapping />}
      {activeTab === 'servers' && <ServerManager />}
    </div>
  )
}

export default IptvServer
