import { useState, useEffect } from 'react'
import api from '../services/api'
import { Package, Plus, Download, CheckCircle, AlertTriangle, X, Save, Rocket, Calendar, HardDrive, Layers, Bug, Star } from 'lucide-react'

const inputStyle = {
  width:'100%', padding:'10px 14px', background:'rgba(5,5,5,0.6)',
  border:'1px solid rgba(255,255,255,0.08)', borderRadius:10,
  color:'#fff', fontSize:13, outline:'none', boxSizing:'border-box',
}

const labelStyle = {
  display:'block', fontSize:11, fontWeight:700, color:'#71717a',
  textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6,
}

const emptyForm = {
  versao: '',
  previous_version: '',
  title: 'Novidades da atualizacao',
  description: '',
  release_date: '',
  size: '',
  obrigatoria: false,
  link_download: '',
  mensagem: '',
  platform: 'web',
  channel: 'production',
  status: 'published',
  min_supported_version: '',
  addedText: '',
  bugFixesText: '',
  improvementsText: '',
  cardsText: 'Performance|+32%|rocket\nCarregamento|mais rapido|gauge\nMais|estabilidade|shield\nInterface|refinada|star',
}

const getVersionNumber = (v) => v.versao || v.latestVersion || v.raw?.versao || '—'
const getCreatedAt = (v) => v.criado_em || v.releaseDate || v.raw?.criado_em
const isRequired = (v) => Boolean(v.obrigatoria ?? v.forceUpdate ?? v.raw?.obrigatoria)
const isActive = (v) => v.ativa ?? v.raw?.ativa ?? true
const getPlatform = (v) => v.platform || v.raw?.platform || 'web'
const getChannel = (v) => v.channel || v.raw?.channel || 'production'
const getTitle = (v) => v.title || v.raw?.title || v.mensagem || v.message || 'Versao publicada'

const Versions = () => {
  const [versions, setVersions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [formData, setFormData] = useState(emptyForm)

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
      showToast('Versao criada com sucesso!')
      setShowModal(false)
      setFormData(emptyForm)
      loadVersions()
    } catch { showToast('Erro ao criar versao', 'error') }
    finally { setSaving(false) }
  }

  const updateField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }))

  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleString('pt-BR', { dateStyle:'short', timeStyle:'short' })
  }

  const btnPrimary = {
    display:'inline-flex', alignItems:'center', gap:7, padding:'10px 20px',
    background:'linear-gradient(135deg,#FC5F16,#FF6B00)', border:'none',
    borderRadius:10, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer',
    boxShadow:'0 4px 12px rgba(252, 95, 22,0.3)',
  }

  const field = (label, key, props = {}) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <input style={inputStyle} value={formData[key]} onChange={e=>updateField(key,e.target.value)} {...props}/>
    </div>
  )

  const area = (label, key, placeholder) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <textarea style={{ ...inputStyle, minHeight:90, resize:'vertical' }} value={formData[key]} onChange={e=>updateField(key,e.target.value)} placeholder={placeholder}/>
    </div>
  )

  return (
    <div>
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

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:900, color:'#fff', display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <Rocket size={26} color='#FC5F16'/> Versoes do App
          </h1>
          <p style={{ fontSize:12, color:'#52525b' }}>Gerencie atualizacao, changelog e contrato usado pelo MAXX PLAYER.</p>
        </div>
        <button onClick={() => setShowModal(true)} style={btnPrimary}>
          <Plus size={16}/> Nova Versao
        </button>
      </div>

      {loading && (
        <div style={{ textAlign:'center', padding:48, color:'#52525b' }}>
          <Package size={32} color='#27272a' style={{ display:'block', margin:'0 auto 12px' }}/>
          Carregando versoes...
        </div>
      )}

      {!loading && (
        versions.length === 0 ? (
          <div style={{ textAlign:'center', padding:48, background:'rgba(17,17,17,0.6)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:16 }}>
            <Package size={36} color='#27272a' style={{ display:'block', margin:'0 auto 12px' }}/>
            <p style={{ color:'#52525b', fontSize:14 }}>Nenhuma versao cadastrada.</p>
            <button onClick={() => setShowModal(true)} style={{ ...btnPrimary, marginTop:16 }}>
              <Plus size={14}/> Criar Primeira Versao
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {versions.map((v, idx) => (
              <div key={v.id || (getVersionNumber(v) + '-' + idx)} style={{
                background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)',
                border:'1px solid rgba(255,255,255,0.06)',
                borderLeft: idx===0 ? '3px solid #FC5F16' : '3px solid rgba(255,255,255,0.06)',
                borderRadius:14, padding:'18px 22px',
                boxShadow:'0 4px 20px rgba(0,0,0,0.3)',
              }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ width:48, height:48, borderRadius:12, background:'rgba(252, 95, 22,0.12)', border:'1px solid rgba(252, 95, 22,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Package size={22} color='#FC5F16'/>
                    </div>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                        <h3 style={{ fontSize:18, fontWeight:800, color:'#fff' }}>v{getVersionNumber(v)}</h3>
                        {idx===0 && <span style={{ fontSize:10, padding:'2px 8px', borderRadius:999, background:'rgba(252, 95, 22,0.15)', border:'1px solid rgba(252, 95, 22,0.3)', color:'#FC5F16', fontWeight:800 }}>MAIS RECENTE</span>}
                        <span style={{ fontSize:10, padding:'2px 8px', borderRadius:999, background:'rgba(255,255,255,0.06)', color:'#a1a1aa', fontWeight:800 }}>{getPlatform(v)} / {getChannel(v)}</span>
                      </div>
                      <strong style={{ color:'#e4e4e7', fontSize:13 }}>{getTitle(v)}</strong>
                      <p style={{ fontSize:12, color:'#52525b', marginTop:4 }}>{formatDate(getCreatedAt(v))}</p>
                    </div>
                  </div>

                  <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                    <span style={{ padding:'4px 12px', borderRadius:999, fontSize:11, fontWeight:800,
                      background: isRequired(v) ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)',
                      border: '1px solid ' + (isRequired(v) ? 'rgba(239,68,68,0.25)' : 'rgba(59,130,246,0.25)'),
                      color: isRequired(v) ? '#f87171' : '#60a5fa',
                    }}>
                      {isRequired(v) ? 'OBRIGATORIA' : 'OPCIONAL'}
                    </span>
                    <span style={{ padding:'4px 12px', borderRadius:999, fontSize:11, fontWeight:800,
                      background: isActive(v) ? 'rgba(16,185,129,0.12)' : 'rgba(113,113,122,0.12)',
                      border: '1px solid ' + (isActive(v) ? 'rgba(16,185,129,0.25)' : 'rgba(113,113,122,0.2)'),
                      color: isActive(v) ? '#34d399' : '#71717a',
                    }}>
                      {isActive(v) ? 'ATIVA' : 'INATIVA'}
                    </span>
                  </div>
                </div>

                {(v.description || v.mensagem || v.message) && (
                  <p style={{ marginTop:12, fontSize:13, color:'#a1a1aa', lineHeight:1.6, paddingLeft:62 }}>{v.description || v.mensagem || v.message}</p>
                )}

                <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap', paddingLeft:62, marginTop:12, color:'#71717a', fontSize:12 }}>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}><Calendar size={13}/> {formatDate(v.releaseDate || v.raw?.release_date)}</span>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}><HardDrive size={13}/> {v.size || v.raw?.size || 'sem tamanho'}</span>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}><Layers size={13}/> {(v.added || []).length} novidades</span>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}><Bug size={13}/> {(v.bugFixes || []).length} correcoes</span>
                </div>

                {(v.downloadUrl || v.link_download || v.raw?.link_download) && (
                  <a href={v.downloadUrl || v.link_download || v.raw?.link_download} target='_blank' rel='noopener noreferrer'
                    style={{ marginTop:10, marginLeft:62, display:'inline-flex', alignItems:'center', gap:6, fontSize:12, color:'#FC5F16', fontWeight:700, textDecoration:'none' }}>
                    <Download size={13}/> Download
                  </a>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16 }}
          onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div style={{ background:'rgba(17,17,17,0.96)', backdropFilter:'blur(20px)', border:'1px solid rgba(252, 95, 22,0.18)', borderRadius:20, padding:28, width:'100%', maxWidth:860, maxHeight:'90vh', overflow:'auto', boxShadow:'0 25px 60px rgba(0,0,0,0.6)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'rgba(252, 95, 22,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Package size={18} color='#FC5F16'/>
                </div>
                <h2 style={{ fontSize:16, fontWeight:800, color:'#fff' }}>Nova Versao do App</h2>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color:'#71717a', cursor:'pointer' }}>
                <X size={16}/>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:12 }}>
                {field('Versao nova', 'versao', { placeholder:'2.1.11', required:true })}
                {field('Versao anterior', 'previous_version', { placeholder:'2.1.10' })}
                {field('Tamanho', 'size', { placeholder:'78,6 MB' })}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:12 }}>
                {field('Data da atualizacao', 'release_date', { type:'date' })}
                {field('Versao minima suportada', 'min_supported_version', { placeholder:'2.1.0' })}
                {field('Link de download', 'link_download', { type:'url', placeholder:'https://...' })}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:12 }}>
                <div>
                  <label style={labelStyle}>Plataforma</label>
                  <select style={inputStyle} value={formData.platform} onChange={e=>updateField('platform', e.target.value)}>
                    <option value='web'>WEB</option>
                    <option value='android_tv'>Android TV</option>
                    <option value='tv_box'>TV Box</option>
                    <option value='android'>Android</option>
                    <option value='all'>Todas</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Canal</label>
                  <select style={inputStyle} value={formData.channel} onChange={e=>updateField('channel', e.target.value)}>
                    <option value='production'>production</option>
                    <option value='beta'>beta</option>
                    <option value='test'>test</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select style={inputStyle} value={formData.status} onChange={e=>updateField('status', e.target.value)}>
                    <option value='published'>published</option>
                    <option value='draft'>draft</option>
                  </select>
                </div>
              </div>
              {field('Titulo da tela', 'title', { placeholder:'Novidades da atualizacao' })}
              {area('Descricao principal', 'description', 'Texto exibido no hero da tela de atualizacao.')}
              {area('O que foi adicionado', 'addedText', 'Uma linha por item. Use: Titulo|Descricao')}
              {area('Correcoes de bugs', 'bugFixesText', 'Uma linha por item. Use: Titulo|Descricao')}
              {area('Melhorias', 'improvementsText', 'Uma linha por item. Use: Titulo|Descricao')}
              {area('Cards inferiores', 'cardsText', 'Uma linha por card. Use: Label|Valor|icone')}

              <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                <div onClick={() => updateField('obrigatoria', !formData.obrigatoria)}
                  style={{ width:20, height:20, borderRadius:6, border:'2px solid ' + (formData.obrigatoria?'#FC5F16':'rgba(255,255,255,0.15)'), background: formData.obrigatoria?'rgba(252, 95, 22,0.2)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s', flexShrink:0 }}>
                  {formData.obrigatoria && <CheckCircle size={12} color='#FC5F16'/>}
                </div>
                <span style={{ fontSize:13, color:'#a1a1aa' }}>Atualizacao obrigatoria</span>
              </label>

              <div style={{ display:'flex', gap:8, marginTop:4 }}>
                <button type='submit' disabled={saving} style={{ ...btnPrimary, flex:1, justifyContent:'center', opacity:saving?0.7:1 }}>
                  <Save size={15}/> {saving?'Salvando...':'Criar Versao'}
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
