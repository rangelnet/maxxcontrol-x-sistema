import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import api from '../services/api'

// ─── PALETAS RÁPIDAS ───────────────────────────────────────────────────────────
const PALETTES = [
  { name: 'MAXX Orange',  tema: 'Neon',     primary: '#FC5F16', secondary: '#FF6A00', bg: '#050505', text: '#FFFFFF', accent: '#FF8C00', btnPrimary: '#FC5F16', btnFocus: '#FFA500' },
  { name: 'Netflix Red',  tema: 'Custom',   primary: '#E50914', secondary: '#B20710', bg: '#141414', text: '#FFFFFF', accent: '#FF1E2D', btnPrimary: '#E50914', btnFocus: '#B20710' },
  { name: 'Prime Blue',   tema: 'Azul',     primary: '#00A8E1', secondary: '#0094CB', bg: '#0F171E', text: '#FFFFFF', accent: '#1EC1F0', btnPrimary: '#00A8E1', btnFocus: '#0094CB' },
  { name: 'Disney+',      tema: 'Custom',   primary: '#113CCF', secondary: '#0B2AA0', bg: '#040B2A', text: '#FFFFFF', accent: '#1A4DE0', btnPrimary: '#113CCF', btnFocus: '#1A4DE0' },
  { name: 'Paramount',    tema: 'Custom',   primary: '#006EFF', secondary: '#0055CC', bg: '#0A0A14', text: '#FFFFFF', accent: '#3385FF', btnPrimary: '#006EFF', btnFocus: '#3385FF' },
  { name: 'Neon Green',   tema: 'Custom',   primary: '#00FF87', secondary: '#00CC6E', bg: '#070F0A', text: '#FFFFFF', accent: '#00E87A', btnPrimary: '#00FF87', btnFocus: '#00E87A' },
  { name: 'Roxo Premium', tema: 'Custom',   primary: '#9B59B6', secondary: '#8E44AD', bg: '#0D0812', text: '#FFFFFF', accent: '#A975C8', btnPrimary: '#9B59B6', btnFocus: '#A975C8' },
  { name: 'Gold Line',    tema: 'Custom',   primary: '#FFD700', secondary: '#FFC107', bg: '#0A0800', text: '#FFFFFF', accent: '#FFE033', btnPrimary: '#FFD700', btnFocus: '#FFE033' },
]

// ─── CAMPO DE COR ──────────────────────────────────────────────────────────────
const ColorField = ({ label, value, onChange }) => (
  <div>
    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">{label}</label>
    <div className="flex items-center gap-2 bg-dark-900 border border-dark-600 rounded-xl px-3 py-2 focus-within:border-brand-500 transition group">
      <div className="relative shrink-0">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0.5"
          style={{ backgroundColor: value }}
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        maxLength={7}
        className="flex-1 bg-transparent text-white font-mono text-sm outline-none min-w-0"
        placeholder="#000000"
      />
      <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: value }} />
    </div>
  </div>
)

// ─── CAMPO DE INPUT ────────────────────────────────────────────────────────────
const InputField = ({ label, value, onChange, placeholder, type = 'text', hint }) => (
  <div>
    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-2.5 text-white text-sm focus:border-brand-500 outline-none transition"
    />
    {hint && <p className="text-[10px] text-zinc-600 mt-1">{hint}</p>}
  </div>
)

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
const Branding = () => {
  const [branding, setBranding] = useState(null)
  const [allBrandings, setAllBrandings] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState('identidade')

  const [formData, setFormData] = useState({
    app_name:         'TV Maxx',
    logo_url:         '/branding/ic_maxx_player.png',
    logo_dark_url:    '/branding/ic_launcher.png',
    primary_color:    '#FC5F16',
    secondary_color:  '#FF6A00',
    background_color: '#050505',
    text_color:       '#FFFFFF',
    accent_color:     '#FF8C00',
    button_primary_color: '#FC5F16',
    button_secondary_color: '#FF6A00',
    button_text_color: '#FFFFFF',
    button_focus_color: '#FFA500',
    splash_screen_url:'https://i.postimg.cc/BQwXmzTj/TVMAXX_MOVE.png',
    hero_banner_url:  '/branding/banner_apptv.png',
    tema:             'Neon',
  })

  useEffect(() => {
    loadAllBrandings()
    loadTemplates()
  }, [])

  const loadAllBrandings = async () => {
    try {
      const r = await api.get('/api/branding')
      setAllBrandings(r.data || [])
      
      // Tenta selecionar o ativo por padrão ou o primeiro da lista
      const active = r.data.find(b => b.ativo)
      if (active) {
        selectBranding(active)
      } else if (r.data.length > 0) {
        selectBranding(r.data[0])
      }
    } catch (e) {
      console.error('Erro ao listar brandings:', e)
    } finally {
      setLoading(false)
    }
  }

  const selectBranding = (b) => {
    setBranding(b)
    setFormData({
      app_name:          b.app_name         || 'TV Maxx',
      logo_url:          b.logo_url         || '',
      logo_dark_url:     b.logo_dark_url    || '',
      primary_color:     b.primary_color    || '#FC5F16',
      secondary_color:   b.secondary_color  || '#FF6A00',
      background_color:  b.background_color || '#050505',
      text_color:        b.text_color       || '#FFFFFF',
      accent_color:      b.accent_color     || '#FF8C00',
      button_primary_color: b.button_primary_color || b.primary_color || '#FC5F16',
      button_secondary_color: b.button_secondary_color || b.secondary_color || '#FF6A00',
      button_text_color: b.button_text_color || b.text_color || '#FFFFFF',
      button_focus_color: b.button_focus_color || b.accent_color || '#FFA500',
      splash_screen_url: b.splash_screen_url|| '',
      hero_banner_url:   b.hero_banner_url  || '',
      platforms:         b.platforms        || [],
      tema:              b.tema             || 'Neon'
    })
  }

  const loadTemplates = async () => {
    try {
      const r = await api.get('/api/branding/templates')
      setTemplates(r.data || [])
    } catch { /* ignora */ }
  }

  const set = (key) => (val) => setFormData(prev => ({ ...prev, [key]: val }))

  const togglePlatform = (id) => {
    setFormData(prev => {
      const platforms = prev.platforms || []
      if (platforms.includes(id)) {
        return { ...prev, platforms: platforms.filter(p => p !== id) }
      } else {
        return { ...prev, platforms: [...platforms, id] }
      }
    })
  }

  const PLATFORMS_LIST = [
    { id: 'nfx', label: 'Netflix', banner: '/branding/banner_ntx.png' },
    { id: 'prm', label: 'Prime Video', banner: '/branding/banner_pv.png' },
    { id: 'dis', label: 'Disney+', banner: '/branding/banner_disney.png' },
    { id: 'hbo', label: 'HBO Max', banner: '/branding/banner_hm.png' },
    { id: 'glo', label: 'Globoplay', banner: '/branding/banner_glo.png' },
    { id: 'sta', label: 'Star+', banner: '/branding/banner_star.png' },
    { id: 'par', label: 'Paramount+', banner: '/branding/banner_pt.png' },
    { id: 'ani', label: 'Crunchyroll', banner: '/branding/banner_cru.png' },
    { id: 'hul', label: 'Hulu', banner: '/branding/banner_hulu.png' },
    { id: 'app', label: 'Apple TV+', banner: '/branding/banner_apptv.png' },
    { id: 'gaming', label: 'Maxx Gaming', banner: '/branding/banner_mgaming.png' },
    { id: 'maxx', label: 'Maxx Play', banner: '/branding/banner_mplay.png' },
    { id: 'hot', label: 'Maxx Red (Adulto)', banner: '/branding/banner_mred.png' },
  ]

  const applyPalette = (p) => setFormData(prev => ({
    ...prev,
    primary_color:    p.primary,
    secondary_color:  p.secondary,
    background_color: p.bg,
    text_color:       p.text,
    accent_color:     p.accent,
    button_primary_color: p.btnPrimary || p.primary,
    button_focus_color: p.btnFocus || p.accent,
    tema:             p.tema || 'Custom'
  }))

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setSaving(true)
    try {
      if (branding?.id) {
        await api.put(`/api/branding/${branding.id}`, formData)
      } else {
        await api.post('/api/branding', formData)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      loadAllBrandings()
    } catch (err) {
      console.error('Erro ao salvar:', err)
      alert(err.response?.data?.error || 'Erro ao salvar branding')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateNew = () => {
    setBranding(null)
    setFormData({
      app_name:         'Novo Tema',
      logo_url:         '',
      logo_dark_url:    '',
      primary_color:    '#FC5F16',
      secondary_color:  '#FF6A00',
      background_color: '#050505',
      text_color:       '#FFFFFF',
      accent_color:     '#FF8C00',
      splash_screen_url:'',
      hero_banner_url:  '',
      platforms:        []
    })
  }

  const handleActivate = async () => {
    if (!branding?.id) return
    setSaving(true)
    try {
      await api.post(`/api/branding/${branding.id}/activate`)
      alert('Tema ativado com sucesso! Este tema agora é o padrão do App.')
      loadAllBrandings()
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao ativar tema')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!branding?.id) return
    if (!window.confirm('Tem certeza que deseja excluir este tema? Esta ação é irreversível.')) return
    
    setSaving(true)
    try {
      await api.delete(`/api/branding/${branding.id}`)
      loadAllBrandings()
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao excluir tema')
    } finally {
      setSaving(false)
    }
  }

  const SECTIONS = [
    { id: 'identidade', label: 'Identidade',  icon: '🏷️' },
    { id: 'cores',      label: 'Cores',        icon: '🎨' },
    { id: 'midias',     label: 'Imagens',      icon: '🖼️' },
    { id: 'plataformas', label: 'Plataformas', icon: '🚀' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-zinc-500">
      <span className="animate-spin mr-2 text-xl">⏳</span> Carregando branding...
    </div>
  )

  return (
    <form onSubmit={handleSave} className="space-y-6">

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xl">
              🎨
            </div>
            Fábrica de Temas Master
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Crie e gerencie múltiplas identidades visuais para o seu ecossistema.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-zinc-800 hover:bg-zinc-700 text-white transition active:scale-95 border border-zinc-700"
          >
            ➕ Novo Tema
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition transform active:scale-95 shadow-lg shrink-0
              ${saved
                ? 'bg-green-600 text-white shadow-green-500/20'
                : 'bg-gradient-to-r from-brand-500 to-orange-500 hover:from-brand-400 hover:to-orange-400 text-white shadow-brand-500/25'
              }`}
          >
            {saving ? '⏳ Salvando...' : saved ? '✅ Salvo!' : '💾 Salvar Alterações'}
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* ── BARRA LATERAL: MEUS TEMAS ──────────────────────── */}
        <div className="xl:w-80 shrink-0 space-y-4">
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-4 shadow-xl">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Meus Temas Salvos</h3>
            <div className="space-y-2">
              {allBrandings.map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => selectBranding(b)}
                  className={`w-full group relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left
                    ${branding?.id === b.id 
                      ? 'bg-brand-500/10 border-brand-500' 
                      : 'bg-dark-900 border-transparent hover:border-zinc-700'}`}
                >
                  <div className="h-10 w-10 rounded-lg border border-white/10 shrink-0 flex items-center justify-center overflow-hidden" 
                    style={{ backgroundColor: b.background_color }}>
                    {b.logo_url ? (
                      <img src={b.logo_url} className="w-full h-full object-contain" onError={e => e.target.style.display='none'} />
                    ) : (
                      <span className="text-white text-xs font-black">{b.app_name?.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${branding?.id === b.id ? 'text-brand-400' : 'text-zinc-300'}`}>
                      {b.app_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex -space-x-1">
                        <div className="w-2 h-2 rounded-full border border-dark-900" style={{ backgroundColor: b.primary_color }} />
                        <div className="w-2 h-2 rounded-full border border-dark-900" style={{ backgroundColor: b.accent_color }} />
                      </div>
                      {b.ativo && (
                        <span className="text-[8px] font-black text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded uppercase tracking-tighter">Ativo</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              {allBrandings.length === 0 && (
                <p className="text-center py-4 text-zinc-600 text-[10px]">Nenhum tema salvo.</p>
              )}
            </div>
          </div>

          {/* Banner Ajuda */}
          <div className="bg-brand-500/5 border border-brand-500/10 rounded-2xl p-4">
            <p className="text-[10px] text-brand-400/80 leading-relaxed font-medium">
              DICA: Após criar seu tema, clique em <b>ATIVAR</b> para que seu App Android TV mude instantaneamente de cor.
            </p>
          </div>
        </div>

        {/* ── COLUNA CENTRAL: EDITOR ─────────────────────────── */}
        <div className="flex-1 space-y-5">

          {/* Abas de seção */}
          <div className="flex gap-1 bg-dark-800 border border-dark-700 rounded-xl p-1">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSection(s.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all
                  ${activeSection === s.id
                    ? 'bg-dark-900 text-white shadow-md border border-dark-600'
                    : 'text-zinc-500 hover:text-white'
                  }`}
              >
                <span>{s.icon}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            ))}
          </div>

          {/* ── SEÇÃO: IDENTIDADE ────────────────────────────── */}
          {activeSection === 'identidade' && (
            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 space-y-5 shadow-xl">
              <h2 className="font-bold text-white flex items-center gap-2">🏷️ Identidade do App</h2>

              <InputField
                label="Nome do App"
                value={formData.app_name}
                onChange={set('app_name')}
                placeholder="Ex: TV Maxx Pro"
                hint="Este nome aparecerá na splash screen e no launcher do Android TV."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <InputField
                    label="URL da Logo Principal"
                    value={formData.logo_url}
                    onChange={set('logo_url')}
                    placeholder="https://..."
                    type="url"
                    hint="Recomendado: PNG transparente 512×512px"
                  />
                  {formData.logo_url && (
                    <div className="bg-white rounded-xl p-3 flex justify-center">
                      <img src={formData.logo_url} alt="Logo" className="h-14 object-contain" onError={e => e.target.style.display='none'} />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <InputField
                    label="URL da Logo Escura"
                    value={formData.logo_dark_url}
                    onChange={set('logo_dark_url')}
                    placeholder="https://..."
                    type="url"
                    hint="Versão para fundos claros"
                  />
                  {formData.logo_dark_url && (
                    <div className="bg-zinc-900 rounded-xl p-3 flex justify-center border border-dark-600">
                      <img src={formData.logo_dark_url} alt="Logo Dark" className="h-14 object-contain" onError={e => e.target.style.display='none'} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── SEÇÃO: CORES ─────────────────────────────────── */}
          {activeSection === 'cores' && (
            <div className="space-y-5">
              {/* Paletas rápidas */}
              <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5 shadow-xl">
                <h2 className="font-bold text-white flex items-center gap-2 mb-4">⚡ Paletas Rápidas</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PALETTES.map(p => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => applyPalette(p)}
                      className="group relative rounded-xl overflow-hidden border border-dark-600 hover:border-brand-500/50 transition-all hover:scale-[1.04] active:scale-[0.97]"
                    >
                      {/* Mini-preview */}
                      <div className="h-14 relative" style={{ backgroundColor: p.bg }}>
                        <div className="absolute inset-0 flex items-center justify-center gap-1 px-2">
                          <div className="w-4 h-4 rounded-full shadow-lg border border-white/10" style={{ backgroundColor: p.primary }} />
                          <div className="w-3 h-3 rounded-full shadow-lg border border-white/10" style={{ backgroundColor: p.secondary }} />
                          <div className="w-2.5 h-2.5 rounded-full shadow-lg border border-white/10" style={{ backgroundColor: p.accent }} />
                        </div>
                      </div>
                      <div className="bg-dark-900 px-2 py-1.5 border-t border-dark-700">
                        <p className="text-[9px] font-bold text-white text-center truncate">{p.name}</p>
                      </div>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-brand-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] font-black text-white bg-brand-500 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">APLICAR</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Campos de cor */}
              <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5 shadow-xl">
                <h2 className="font-bold text-white flex items-center gap-2 mb-4">🎨 Cores Personalizadas</h2>
                
                {/* Seletor de Tema Base */}
                <div className="mb-6 p-4 bg-dark-900 border border-dark-600 rounded-xl">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-3">Tema Base (Sincronizado com Android)</label>
                  <div className="flex gap-2">
                    {['Neon', 'Clássico', 'Azul', 'Custom'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => set('tema')(t)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                          formData.tema === t 
                            ? 'bg-brand-500 border-brand-500 text-white' 
                            : 'bg-dark-800 border-dark-700 text-zinc-500 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ColorField label="Cor Primária"    value={formData.primary_color}    onChange={set('primary_color')} />
                  <ColorField label="Cor Secundária"  value={formData.secondary_color}  onChange={set('secondary_color')} />
                  <ColorField label="Cor de Fundo"    value={formData.background_color} onChange={set('background_color')} />
                  <ColorField label="Cor do Texto"    value={formData.text_color}       onChange={set('text_color')} />
                  <ColorField label="Cor de Destaque" value={formData.accent_color}     onChange={set('accent_color')} />
                </div>

                <div className="mt-8 pt-6 border-t border-dark-700">
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-4">🕹️ Interação e Botões</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ColorField label="Botão Principal"  value={formData.button_primary_color}   onChange={set('button_primary_color')} />
                    <ColorField label="Cor de Foco (Glow)" value={formData.button_focus_color}     onChange={set('button_focus_color')} />
                    <ColorField label="Texto do Botão"   value={formData.button_text_color}      onChange={set('button_text_color')} />
                  </div>
                </div>
              </div>

              {/* Templates do backend */}
              {templates.length > 0 && (
                <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5 shadow-xl">
                  <h2 className="font-bold text-white flex items-center gap-2 mb-4">📋 Templates Salvos</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {templates.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => applyPalette({
                          primary: t.primary_color, secondary: t.secondary_color || t.primary_color,
                          bg: t.background_color, text: t.text_color, accent: t.accent_color || t.primary_color
                        })}
                        className="flex items-center gap-3 bg-dark-900 hover:bg-dark-700 border border-dark-600 hover:border-brand-500/40 rounded-xl px-4 py-3 transition text-left group"
                      >
                        <div className="w-10 h-10 rounded-lg border border-white/10 shrink-0"
                          style={{ backgroundColor: t.background_color, borderColor: t.primary_color }} />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{t.nome}</p>
                          {t.descricao && <p className="text-[10px] text-zinc-500 truncate">{t.descricao}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SEÇÃO: IMAGENS ───────────────────────────────── */}
          {activeSection === 'midias' && (
            <div className="space-y-5">

              {/* Assets do Projeto Android */}
              <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5 shadow-xl">
                <h2 className="font-bold text-white flex items-center gap-2 mb-1">📦 Assets do Projeto TV MAXX Android</h2>
                <p className="text-[11px] text-zinc-500 mb-4">Clique para usar diretamente no branding.</p>

                <div className="space-y-4">
                  {/* Logos */}
                  <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">🏷️ Logos do Launcher</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { label: 'MAXX Player Logo', path: '/branding/ic_maxx_player.png', bg: 'bg-black' },
                        { label: 'Launcher Icon',    path: '/branding/ic_launcher.png',    bg: 'bg-white' },
                        { label: 'Logo Move',        path: '/branding/logo_move.png',      bg: 'bg-black' },
                        { label: 'Logo Nova',        path: '/branding/logo_new.jpg',       bg: 'bg-black' },
                        { label: 'Logo High',        path: '/branding/maxx_logo_high.jpg', bg: 'bg-black' },
                        { label: 'MAXX Gaming',      path: '/branding/maxxgaming.png',     bg: 'bg-black' },
                        { label: 'MAXX Hot',         path: '/branding/maxxhot.png',        bg: 'bg-black' },
                        { label: 'MAXX Play',        path: '/branding/maxxplay.png',       bg: 'bg-black' },
                        { label: 'Ícone All',        path: '/branding/ic_all.webp',        bg: 'bg-dark-900' },
                      ].map(asset => (
                        <div
                          key={asset.path}
                          className="group cursor-pointer rounded-xl overflow-hidden border-2 border-dark-600 hover:border-brand-500 transition-all"
                        >
                          <div className={`h-20 ${asset.bg} flex items-center justify-center p-2`}>
                            <img src={asset.path} alt={asset.label}
                              className="max-h-16 object-contain"
                              onError={e => { e.target.src=''; e.target.style.display='none' }}
                            />
                          </div>
                          <div className="bg-dark-900 border-t border-dark-700 p-2 flex flex-col gap-1">
                            <span className="text-[9px] text-zinc-400 truncate block">{asset.label}</span>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => set('logo_url')(asset.path)}
                                className="flex-1 text-[8px] font-bold bg-brand-500/20 hover:bg-brand-500 text-brand-400 hover:text-white px-1 py-0.5 rounded transition"
                              >
                                Logo Principal
                              </button>
                              <button
                                type="button"
                                onClick={() => set('logo_dark_url')(asset.path)}
                                className="flex-1 text-[8px] font-bold bg-dark-700 hover:bg-dark-600 text-zinc-400 hover:text-white px-1 py-0.5 rounded transition"
                              >
                                Logo Escura
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Banners */}
                  <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">🖼️ Banners do App</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { label: 'Banner App TV',     path: '/branding/banner_apptv.png' },
                        { label: 'Banner Mplay',      path: '/branding/banner_mplay.png' },
                        { label: 'Banner MAXX Gaming',path: '/branding/banner_mgaming.png' },
                        { label: 'Banner MAXX Red',   path: '/branding/banner_mred.png' },
                        { label: 'Banner Globo',      path: '/branding/banner_glo.png' },
                        { label: 'Banner Crunchyroll',path: '/branding/banner_cru.png' },
                        { label: 'Banner Disney+',    path: '/branding/banner_disney.png' },
                        { label: 'Banner Star+',      path: '/branding/banner_star.png' },
                        { label: 'Banner HBO Max',    path: '/branding/banner_hm.png' },
                        { label: 'Banner Paramount',  path: '/branding/banner_pt.png' },
                        { label: 'Banner Prime',      path: '/branding/banner_pv.png' },
                        { label: 'Banner Hulu',       path: '/branding/banner_hulu.png' },
                        { label: 'Banner Netflix',    path: '/branding/banner_ntx.png' },
                        { label: 'Banner Novo',       path: '/branding/banner_new.jpg' },
                        { label: 'Banner MAXX High',  path: '/branding/maxx_banner_high.jpg' },
                      ].map(asset => (
                        <div
                          key={asset.path}
                          className="group cursor-pointer rounded-xl overflow-hidden border-2 border-dark-600 hover:border-brand-500 transition-all"
                        >
                          <div className="h-24 bg-black flex items-center justify-center p-2">
                            <img src={asset.path} alt={asset.label}
                              className="max-h-20 object-contain w-full"
                              onError={e => { e.target.style.opacity='0.2' }}
                            />
                          </div>
                          <div className="bg-dark-900 border-t border-dark-700 p-2 flex items-center justify-between">
                            <span className="text-[9px] text-zinc-400 truncate">{asset.label}</span>
                            <button
                              type="button"
                              onClick={() => set('hero_banner_url')(asset.path)}
                              className="text-[8px] font-bold bg-brand-500/20 hover:bg-brand-500 text-brand-400 hover:text-white px-2 py-0.5 rounded transition ml-2 shrink-0"
                            >
                              Usar como Hero
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Splash externa */}
                  <div className="bg-dark-900 border border-dark-600 rounded-xl p-3 flex items-center gap-3">
                    <div className="text-2xl">🌐</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white">Splash Screen Externa (PostImg)</p>
                      <p className="text-[10px] text-zinc-500 truncate">https://i.postimg.cc/BQwXmzTj/TVMAXX_MOVE.png</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => set('splash_screen_url')('https://i.postimg.cc/BQwXmzTj/TVMAXX_MOVE.png')}
                      className="text-[9px] font-bold bg-brand-500 hover:bg-brand-400 text-white px-3 py-1.5 rounded-lg transition shrink-0"
                    >
                      ✓ Usar
                    </button>
                  </div>
                </div>
              </div>

              {/* Campos manuais */}
              <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5 shadow-xl">
                <h2 className="font-bold text-white flex items-center gap-2 mb-4">✏️ Editar Manualmente</h2>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <InputField
                      label="Splash Screen (Tela de Carregamento)"
                      value={formData.splash_screen_url}
                      onChange={set('splash_screen_url')}
                      placeholder="https://... ou /branding/..."
                      type="text"
                      hint="Resolução recomendada: 1920×1080px ou 2560×1440px"
                    />
                    {formData.splash_screen_url && (
                      <div className="relative rounded-xl overflow-hidden border border-dark-600 h-36">
                        <img src={formData.splash_screen_url} alt="Splash Preview"
                          className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                        <div className="absolute bottom-2 left-2">
                          <span className="text-xs text-zinc-300 bg-dark-900/80 px-2 py-0.5 rounded-full font-bold">Splash Preview</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <InputField
                      label="Hero Banner (Banner Principal)"
                      value={formData.hero_banner_url}
                      onChange={set('hero_banner_url')}
                      placeholder="https://... ou /branding/..."
                      type="text"
                      hint="Banner exibido na tela inicial. Resolução: 1920×720px"
                    />
                    {formData.hero_banner_url && (
                      <div className="relative rounded-xl overflow-hidden border border-dark-600 h-36">
                        <img src={formData.hero_banner_url} alt="Hero Preview"
                          className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-end p-3">
                          <span className="text-xs text-zinc-300 font-bold">Hero Banner</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 🚀 PLATFORMAS */}
          {activeSection === 'plataformas' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-dark-900/50 border border-dark-600 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-2xl">
                    🚀
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Explorar por Plataforma</h3>
                    <p className="text-zinc-500 text-xs font-medium">Selecione quais plataformas aparecerão no Launcher do Player Web</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {PLATFORMS_LIST.map(plat => {
                    const isActive = (formData.platforms || []).includes(plat.id)
                    return (
                      <button
                        key={plat.id}
                        type="button"
                        onClick={() => togglePlatform(plat.id)}
                        className={`group relative aspect-video rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                          isActive 
                            ? 'border-brand-500 ring-4 ring-brand-500/20 scale-[1.02]' 
                            : 'border-dark-700 grayscale hover:grayscale-0 opacity-40 hover:opacity-100'
                        }`}
                      >
                        <img 
                          src={plat.banner} 
                          alt={plat.label}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        
                        {/* Overlay */}
                        <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${isActive ? 'bg-brand-500/10' : 'bg-black/60 group-hover:bg-black/20'}`}>
                          {isActive && (
                            <div className="bg-brand-500 text-white p-1 rounded-full shadow-lg">
                              <Check size={16} />
                            </div>
                          )}
                        </div>

                        {/* Label */}
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">{plat.label}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── COLUNA DIREITA: PREVIEW AO VIVO ─────────────────── */}
        <div className="space-y-4">

          {/* Mockup TV */}
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-4 shadow-xl">
            <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <span>📺</span> Preview — Android TV
            </h3>

            {/* Frame TV */}
            <div className="relative">
              <div className="rounded-xl overflow-hidden border-4 border-zinc-700 shadow-2xl" style={{ aspectRatio: '16/9' }}>
                {/* Conteúdo da TV */}
                <div
                  className="w-full h-full relative flex flex-col"
                  style={{ backgroundColor: formData.background_color }}
                >
                  {/* Topbar */}
                  <div className="px-4 py-2 flex items-center gap-3 border-b"
                    style={{ borderColor: formData.primary_color + '30' }}>
                    {formData.logo_url ? (
                      <img src={formData.logo_url} alt="Logo" className="h-6 object-contain" onError={e => e.target.style.display='none'} />
                    ) : (
                      <div className="h-6 px-3 rounded flex items-center font-black text-xs"
                        style={{ backgroundColor: formData.primary_color, color: formData.text_color }}>
                        {formData.app_name?.slice(0, 8)}
                      </div>
                    )}
                    <div className="flex gap-2 ml-auto">
                      {['Home', 'Séries', 'Filmes', 'AO VIVO'].map((m, i) => (
                        <div key={i} className="text-[8px] font-bold px-2 py-0.5 rounded"
                          style={{
                            color: i === 0 ? formData.background_color : formData.text_color + '80',
                            backgroundColor: i === 0 ? formData.primary_color : 'transparent',
                          }}>
                          {m}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hero area */}
                  <div className="flex-1 relative overflow-hidden">
                    {formData.hero_banner_url ? (
                      <img src={formData.hero_banner_url} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-60"
                        onError={e => e.target.style.display='none'} />
                    ) : (
                      <div className="absolute inset-0 opacity-20"
                        style={{ background: `linear-gradient(135deg, ${formData.primary_color}, ${formData.secondary_color})` }} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 space-y-1">
                      <div className="h-3 rounded text-[8px] font-black px-2 flex items-center"
                        style={{ backgroundColor: formData.primary_color, color: formData.background_color }}>
                        EM DESTAQUE
                      </div>
                      <div className="text-[10px] font-black" style={{ color: formData.text_color }}>
                        {formData.app_name || 'TV Maxx'}
                      </div>
                      <div className="text-[7px]" style={{ color: formData.text_color + '99' }}>
                        O melhor streaming IPTV
                      </div>
                      <div className="flex gap-1 mt-1">
                        <div className="text-[7px] font-bold px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: formData.primary_color, color: formData.background_color }}>
                          ▶ Assistir
                        </div>
                        <div className="text-[7px] font-bold px-1.5 py-0.5 rounded border"
                          style={{ color: formData.text_color, borderColor: formData.text_color + '40' }}>
                          + Lista
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cards de conteúdo */}
                  <div className="px-3 py-2">
                    <div className="text-[7px] font-bold mb-1.5" style={{ color: formData.text_color + '80' }}>
                      CONTINUAR ASSISTINDO
                    </div>
                    <div className="flex gap-1.5">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex-1 aspect-[16/10] rounded overflow-hidden relative"
                          style={{ backgroundColor: formData.primary_color + '20', border: `1px solid ${formData.primary_color}30` }}>
                          {i === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-3 h-3 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: formData.primary_color }}>
                                <span className="text-[5px]" style={{ color: formData.background_color }}>▶</span>
                              </div>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 h-0.5"
                            style={{ backgroundColor: formData.primary_color, width: `${30 + i * 10}%` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pé da TV (base) */}
              <div className="flex flex-col items-center mt-1">
                <div className="w-12 h-1.5 bg-zinc-700 rounded-t" />
                <div className="w-20 h-1 bg-zinc-600 rounded" />
              </div>
            </div>

            {/* Legenda de cores */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { label: 'Primária',  val: formData.primary_color },
                { label: 'Fundo',     val: formData.background_color },
                { label: 'Destaque',  val: formData.accent_color },
              ].map(c => (
                <div key={c.label} className="flex items-center gap-2 bg-dark-900 rounded-lg px-2 py-1.5 border border-dark-600">
                  <div className="w-4 h-4 rounded border border-white/10 shrink-0" style={{ backgroundColor: c.val }} />
                  <div className="min-w-0">
                    <p className="text-[8px] text-zinc-500">{c.label}</p>
                    <p className="text-[9px] font-mono text-white truncate">{c.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info do Branding Selecionado */}
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span>ℹ️</span> Editor de Tema
              </h3>
              {branding?.id && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-2 text-zinc-500 hover:text-red-500 transition"
                  title="Excluir Tema"
                >
                  🗑️
                </button>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-dark-700">
                <span className="text-zinc-500">Status no Sistema</span>
                {branding?.ativo ? (
                   <span className="text-green-400 font-bold flex items-center gap-1 uppercase text-[10px]">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Tema Ativo
                  </span>
                ) : (
                  <span className="text-zinc-600 font-bold uppercase text-[10px]">Inativo</span>
                )}
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dark-700">
                <span className="text-zinc-500">ID do Tema</span>
                <span className="text-white font-mono">{branding?.id || 'NOVO'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dark-700">
                <span className="text-zinc-500">Cor Primária</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: formData.primary_color }} />
                  <span className="font-mono text-white">{formData.primary_color}</span>
                </div>
              </div>
              {branding?.atualizado_em && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-zinc-500">Última Edição</span>
                  <span className="text-zinc-300">{new Date(branding.atualizado_em).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2 mt-2">
              {!branding?.ativo && branding?.id && (
                <button
                  type="button"
                  onClick={handleActivate}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-green-500/20 text-[11px] active:scale-95"
                >
                  🚀 ATIVAR ESTE TEMA
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-orange-500 hover:from-brand-400 hover:to-orange-400 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-brand-500/20 text-[11px] active:scale-95"
              >
                {saving ? '⏳ SALVANDO...' : saved ? '✅ SALVO!' : '💾 SALVAR AS ALTERAÇÕES'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </form>
  )
}

export default Branding
