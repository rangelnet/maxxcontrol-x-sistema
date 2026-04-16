import { useState, useEffect } from 'react'
import api from '../services/api'
import { Package, Plus, Download, CheckCircle, AlertTriangle, X, Save, Rocket } from 'lucide-react'

const inputStyle = {
  width:'100%', padding:'10px 14px', background:'rgba(5,5,5,0.6)',
  border:'1px solid rgba(255,255,255,0.08)', borderRadius:10,
  color:'#fff', fontSize:13, outline:'none', boxSizing:'border-box',
}

const labelStyle = {
  display:'block', fontSize:11, fontWeight:700, color:'#71717a',
  textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6,
}

const Versions = () => {
  const [versions, setVersions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [formData, setFormData] = useState({
    versao: '', obrigatoria: false, link_download: '', mensagem: ''
  })

  useEffect(() => { loadVersions() }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const loadVersions = async () => {
    try {
      const r = await api.get('/api/app/versions')
      setVersions(r.data.versions || [])
    } catch { setVersions([]) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/api/app/version', formData)
      showToast('Versão criada com sucesso!')
      setShowModal(false)
      setFormData({ versao:'', obrigatoria:false, link_download:'', mensagem:'' })
      loadVersions()
    } catch { showToast('Erro ao criar versão', 'error') }
    finally { setSaving(false) }
  }

  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleString('pt-BR', { dateStyle:'short', timeStyle:'short' })
  }

  const btnPrimary = {
    display:'inline-flex', alignItems:'center', gap:7, padding:'10px 20px',
    background:'linear-gradient(135deg,#FFA500,#FF6B00)', border:'none',
    borderRadius:10, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer',
    boxShadow:'0 4px 12px rgba(255,165,0,0.3)',
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed', top:24, right:24, zIndex:200,
          background: toast.type==='error' ? 'rgba(239,68,68,0.95)' : 'rgba(16,185,129,0.95)',
          backdropFilter:'blur(12px)', borderRadius:12, padding:'12px 20px',
          color:'#fff', fontSize:13, fontWeight:700, boxShadow:'0 12px 30px rgba(0,0,0,0.4)',
          display:'flex', alignItems:'center', gap:8,
        }}>
          {toast.type==='error' ? <AlertTriangle size={16}/> : <CheckCircle size={16}/>}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:900, color:'#fff', display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <Rocket size={26} color='#FFA500'/> Versões do App
          </h1>
          <p style={{ fontSize:12, color:'#52525b' }}>Gerencie as versões do aplicativo TV MAXX</p>
        </div>
        <button onClick={() => setShowModal(true)} style={btnPrimary}>
          <Plus size={16}/> Nova Versão
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign:'center', padding:48, color:'#52525b' }}>
          <Package size={32} color='#27272a' style={{ display:'block', margin:'0 auto 12px' }}/>
          Carregando versões...
        </div>
      )}

      {/* Lista */}
      {!loading && (
        versions.length === 0 ? (
          <div style={{ textAlign:'center', padding:48, background:'rgba(17,17,17,0.6)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:16 }}>
            <Package size={36} color='#27272a' style={{ display:'block', margin:'0 auto 12px' }}/>
            <p style={{ color:'#52525b', fontSize:14 }}>Nenhuma versão cadastrada.</p>
            <button onClick={() => setShowModal(true)} style={{ ...btnPrimary, marginTop:16 }}>
              <Plus size={14}/> Criar Primeira Versão
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {versions.map((v, idx) => (
              <div key={v.id} style={{
                background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)',
                border:'1px solid rgba(255,255,255,0.06)',
                borderLeft: idx===0 ? '3px solid #FFA500' : '3px solid rgba(255,255,255,0.06)',
                borderRadius:14, padding:'18px 22px',
                boxShadow:'0 4px 20px rgba(0,0,0,0.3)',
                transition:'border-color .2s',
              }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(255,165,0,0.25)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}
              >
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                  {/* Versão info */}
                  <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ width:48, height:48, borderRadius:12, background:'rgba(255,165,0,0.12)', border:'1px solid rgba(255,165,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Package size={22} color='#FFA500'/>
                    </div>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                        <h3 style={{ fontSize:18, fontWeight:800, color:'#fff' }}>v{v.versao}</h3>
                        {idx===0 && <span style={{ fontSize:10, padding:'2px 8px', borderRadius:999, background:'rgba(255,165,0,0.15)', border:'1px solid rgba(255,165,0,0.3)', color:'#FFA500', fontWeight:800 }}>MAIS RECENTE</span>}
                      </div>
                      <p style={{ fontSize:12, color:'#52525b' }}>{formatDate(v.criado_em)}</p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                    <span style={{ padding:'4px 12px', borderRadius:999, fontSize:11, fontWeight:800,
                      background: v.obrigatoria ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)',
                      border: `1px solid ${v.obrigatoria ? 'rgba(239,68,68,0.25)' : 'rgba(59,130,246,0.25)'}`,
                      color: v.obrigatoria ? '#f87171' : '#60a5fa',
                    }}>
                      {v.obrigatoria ? '⚠ OBRIGATÓRIA' : 'OPCIONAL'}
                    </span>
                    <span style={{ padding:'4px 12px', borderRadius:999, fontSize:11, fontWeight:800,
                      background: v.ativa ? 'rgba(16,185,129,0.12)' : 'rgba(113,113,122,0.12)',
                      border: `1px solid ${v.ativa ? 'rgba(16,185,129,0.25)' : 'rgba(113,113,122,0.2)'}`,
                      color: v.ativa ? '#34d399' : '#71717a',
                    }}>
                      {v.ativa ? '● ATIVA' : '○ INATIVA'}
                    </span>
                  </div>
                </div>

                {v.mensagem && (
                  <p style={{ marginTop:12, fontSize:13, color:'#a1a1aa', lineHeight:1.6, paddingLeft:62 }}>{v.mensagem}</p>
                )}

                {v.link_download && (
                  <a href={v.link_download} target='_blank' rel='noopener noreferrer'
                    style={{ marginTop:10, marginLeft:62, display:'inline-flex', alignItems:'center', gap:6, fontSize:12, color:'#FFA500', fontWeight:700, textDecoration:'none' }}>
                    <Download size={13}/> Download APK →
                  </a>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Modal Nova Versão */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16 }}
          onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div style={{ background:'rgba(17,17,17,0.96)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,165,0,0.18)', borderRadius:20, padding:28, width:'100%', maxWidth:460, boxShadow:'0 25px 60px rgba(0,0,0,0.6)' }}>
            {/* Modal Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,165,0,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Package size={18} color='#FFA500'/>
                </div>
                <h2 style={{ fontSize:16, fontWeight:800, color:'#fff' }}>Nova Versão</h2>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color:'#71717a', cursor:'pointer' }}>
                <X size={16}/>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={labelStyle}>Versão</label>
                <input style={inputStyle} value={formData.versao} onChange={e=>setFormData({...formData,versao:e.target.value})} placeholder='1.0.0' required/>
              </div>
              <div>
                <label style={labelStyle}>Link de Download</label>
                <input style={inputStyle} type='url' value={formData.link_download} onChange={e=>setFormData({...formData,link_download:e.target.value})} placeholder='https://...' required/>
              </div>
              <div>
                <label style={labelStyle}>Mensagem / Novidades</label>
                <textarea style={{ ...inputStyle, minHeight:80, resize:'vertical' }} value={formData.mensagem} onChange={e=>setFormData({...formData,mensagem:e.target.value})} placeholder='Novidades desta versão...'/>
              </div>
              {/* Checkbox obrigatória */}
              <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                <div onClick={() => setFormData({...formData,obrigatoria:!formData.obrigatoria})}
                  style={{ width:20, height:20, borderRadius:6, border:`2px solid ${formData.obrigatoria?'#FFA500':'rgba(255,255,255,0.15)'}`, background: formData.obrigatoria?'rgba(255,165,0,0.2)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s', flexShrink:0 }}>
                  {formData.obrigatoria && <CheckCircle size={12} color='#FFA500'/>}
                </div>
                <span style={{ fontSize:13, color:'#a1a1aa' }}>Atualização obrigatória</span>
              </label>

              <div style={{ display:'flex', gap:8, marginTop:4 }}>
                <button type='submit' disabled={saving} style={{ ...btnPrimary, flex:1, justifyContent:'center', opacity:saving?0.7:1 }}>
                  <Save size={15}/> {saving?'Salvando…':'Criar Versão'}
                </button>
                <button type='button' onClick={() => setShowModal(false)}
                  style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px 16px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'#a1a1aa', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Versions
