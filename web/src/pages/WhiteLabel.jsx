import { useState } from 'react'
import {
  Store, Upload, Palette, Globe, Phone, MessageCircle, Link, Copy, CheckCircle,
  Eye, Loader2, Star, Zap, ShoppingCart, Package, Users, BadgeCheck, ChevronRight,
  Plus, Edit2, Trash2, X
} from 'lucide-react'

const TEMAS = [
  { id: 'dark_orange', name: 'Dark Orange', primary: '#FC5F16', bg: '#09090b', preview: 'from-orange-500 to-red-600' },
  { id: 'dark_blue', name: 'Dark Blue', primary: '#3b82f6', bg: '#09090b', preview: 'from-blue-500 to-indigo-600' },
  { id: 'dark_green', name: 'Dark Green', primary: '#22c55e', bg: '#09090b', preview: 'from-green-500 to-emerald-600' },
  { id: 'dark_purple', name: 'Dark Purple', primary: '#a855f7', bg: '#09090b', preview: 'from-purple-500 to-fuchsia-600' },
  { id: 'dark_cyan', name: 'Dark Cyan', primary: '#06b6d4', bg: '#09090b', preview: 'from-cyan-500 to-blue-500' },
  { id: 'dark_red', name: 'Dark Red', primary: '#ef4444', bg: '#09090b', preview: 'from-red-500 to-rose-600' },
]

const PLANOS_LOJA = [
  {
    id: 'mensal',
    nome: 'Plano Mensal',
    preco: 'R$ 29,90',
    descricao: 'Acesso completo por 30 dias',
    features: ['HD e Full HD', 'Canais ao vivo', 'Series e Filmes', 'Suporte WhatsApp'],
    cor: 'blue',
    badge: null
  },
  {
    id: 'trimestral',
    nome: 'Plano Trimestral',
    preco: 'R$ 69,90',
    descricao: 'Acesso completo por 90 dias',
    features: ['HD, Full HD e 4K', 'Canais ao vivo', 'Series e Filmes', 'Suporte prioritário', 'Economia de 22%'],
    cor: 'brand',
    badge: 'MAIS VENDIDO'
  },
  {
    id: 'semestral',
    nome: 'Plano Semestral',
    preco: 'R$ 119,90',
    descricao: 'Acesso completo por 180 dias',
    features: ['HD, Full HD e 4K', 'Canais ao vivo', 'Series, Filmes e Animes', 'Suporte VIP', 'Economia de 33%'],
    cor: 'purple',
    badge: 'MELHOR CUSTO'
  }
]

const PLANO_COR = {
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', btn: 'bg-blue-600 hover:bg-blue-500', glow: 'shadow-blue-500/20' },
  brand: { bg: 'bg-brand/10', border: 'border-brand/40', text: 'text-brand', btn: 'bg-brand hover:bg-brand/90', glow: 'shadow-brand/25' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', btn: 'bg-purple-600 hover:bg-purple-500', glow: 'shadow-purple-500/20' }
}

export default function WhiteLabel() {
  const [nomeLoja, setNomeLoja] = useState('Minha Loja IPTV')
  const [whatsapp, setWhatsapp] = useState('')
  const [logo, setLogo] = useState(null)
  const [temaSelecionado, setTemaSelecionado] = useState('dark_orange')
  const [linkPersonalizado, setLinkPersonalizado] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [tab, setTab] = useState('identidade')

  // Estado dos Planos
  const [planos, setPlanos] = useState(PLANOS_LOJA)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [planForm, setPlanForm] = useState({ id: null, nome: '', preco: '', descricao: '', features: '', cor: 'blue', badge: '' })

  function handleEditPlan(plano) {
    setPlanForm({
      ...plano,
      features: plano.features.join('\n'),
      badge: plano.badge || ''
    })
    setShowPlanModal(true)
  }

  function handleCreatePlan() {
    setPlanForm({ id: null, nome: '', preco: 'R$ ', descricao: '', features: '', cor: 'blue', badge: '' })
    setShowPlanModal(true)
  }

  function handleSavePlan(e) {
    e.preventDefault()
    const newPlan = {
      ...planForm,
      id: planForm.id || Math.random().toString(36).substr(2, 9),
      features: planForm.features.split('\n').filter(f => f.trim() !== '')
    }
    if (planForm.id) {
      setPlanos(planos.map(p => p.id === newPlan.id ? newPlan : p))
    } else {
      setPlanos([...planos, newPlan])
    }
    setShowPlanModal(false)
  }

  function handleDeletePlan(id) {
    if (window.confirm('Excluir este plano?')) {
      setPlanos(planos.filter(p => p.id !== id))
    }
  }

  const TABS = [
    { id: 'identidade', label: 'Identidade', icon: Palette },
    { id: 'planos', label: 'Planos & Preços', icon: Package },
    { id: 'preview', label: 'Pré-visualizar', icon: Eye },
  ]

  function handleLogoUpload(e) {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setLogo(reader.result)
      reader.readAsDataURL(file)
    }
  }

  async function salvarConfiguracoes() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 1500))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function copiarLink() {
    const link = linkPersonalizado ? `https://loja.mxxcontrol.com/${linkPersonalizado}` : `https://loja.mxxcontrol.com/minha-loja`
    navigator.clipboard?.writeText(link)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 3000)
  }

  const temaSel = TEMAS.find(t => t.id === temaSelecionado) || TEMAS[0]

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
              <Store className="h-5 w-5 text-yellow-500" />
            </div>
            Minha Loja White Label
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Configure sua loja personalizada para vender seus planos IPTV.</p>
        </div>

        {/* Badge Novo */}
        <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-yellow-500/10 text-yellow-400 px-3 py-2 rounded-xl border border-yellow-500/30 animate-pulse">
          <Zap className="h-3.5 w-3.5" /> NOVO RECURSO
        </span>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Vendas Hoje', value: '0', icon: ShoppingCart, cor: 'text-green-400' },
          { label: 'Total Clientes', value: '0', icon: Users, cor: 'text-blue-400' },
          { label: 'Faturamento', value: 'R$ 0,00', icon: Star, cor: 'text-yellow-400' },
          { label: 'Link Ativo', value: 'Sim', icon: BadgeCheck, cor: 'text-brand' },
        ].map((stat, i) => (
          <div key={i} className="glass-effect rounded-xl p-4 border border-white/5">
            <stat.icon className={`h-5 w-5 ${stat.cor} mb-2`} />
            <p className={`text-xl font-black ${stat.cor}`}>{stat.value}</p>
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-0.5">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-t-lg border-b-2 transition-all ${
              tab === t.id
                ? 'text-white border-brand bg-brand/5'
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* === ABA: IDENTIDADE === */}
      {tab === 'identidade' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identidade Visual */}
          <div className="glass-effect rounded-2xl p-6 border border-white/5 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Palette className="h-4 w-4 text-brand" /> Identidade Visual
            </h2>

            {/* Nome da Loja */}
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Nome da Loja</label>
              <input
                type="text"
                value={nomeLoja}
                onChange={e => setNomeLoja(e.target.value)}
                className="w-full bg-dark-900 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:border-brand/50 focus:outline-none transition placeholder-zinc-600"
                placeholder="Ex: Minha IPTV Premium"
              />
            </div>

            {/* Upload de Logo */}
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Logo da Loja</label>
              <label className="cursor-pointer block">
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition ${logo ? 'border-brand/40 bg-brand/5' : 'border-white/10 hover:border-brand/30 hover:bg-brand/5'}`}>
                  {logo ? (
                    <img src={logo} alt="Logo" className="h-16 mx-auto object-contain rounded-lg" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-zinc-600 mb-2" />
                      <p className="text-sm text-zinc-400">Clique para enviar sua logo</p>
                      <p className="text-xs text-zinc-600 mt-1">PNG, JPG até 2MB</p>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            </div>

            {/* Tema de Cor */}
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">Tema de Cor</label>
              <div className="grid grid-cols-3 gap-2">
                {TEMAS.map(tema => (
                  <button
                    key={tema.id}
                    onClick={() => setTemaSelecionado(tema.id)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                      temaSelecionado === tema.id ? 'border-white scale-[1.02]' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className={`h-12 bg-gradient-to-br ${tema.preview} flex items-end p-1.5`}>
                      <span className="text-[9px] text-white font-bold truncate w-full text-center">{tema.name}</span>
                    </div>
                    {temaSelecionado === tema.id && (
                      <div className="absolute top-1 right-1 h-3 w-3 bg-white rounded-full flex items-center justify-center">
                        <CheckCircle className="h-2.5 w-2.5 text-dark-900" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contato e Link */}
          <div className="space-y-6">
            <div className="glass-effect rounded-2xl p-6 border border-white/5 space-y-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-400" /> Contato
              </h2>

              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">WhatsApp de Vendas</label>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:border-green-500/50 focus:outline-none transition placeholder-zinc-600"
                    placeholder="5511999999999"
                  />
                </div>
                <p className="text-[11px] text-zinc-600 mt-1">Formato: código do país + DDD + número (sem espaços)</p>
              </div>
            </div>

            {/* Link Personalizado */}
            <div className="glass-effect rounded-2xl p-6 border border-white/5 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-400" /> Link da Loja
              </h2>

              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Slug Personalizado</label>
                <div className="flex gap-2">
                  <div className="bg-dark-900 border border-white/10 rounded-xl px-3 py-2.5 text-zinc-500 text-sm whitespace-nowrap">
                    loja.mxxcontrol.com/
                  </div>
                  <input
                    type="text"
                    value={linkPersonalizado}
                    onChange={e => setLinkPersonalizado(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="flex-1 bg-dark-900 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:border-brand/50 focus:outline-none transition placeholder-zinc-600"
                    placeholder="minha-loja"
                  />
                </div>
              </div>

              {/* Prévia do Link */}
              <div className="bg-dark-900/50 rounded-xl p-3 border border-white/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Link className="h-3.5 w-3.5 text-brand shrink-0" />
                  <span className="text-xs text-zinc-400 truncate">
                    loja.mxxcontrol.com/{linkPersonalizado || 'minha-loja'}
                  </span>
                </div>
                <button
                  onClick={copiarLink}
                  className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-brand hover:text-white transition"
                >
                  {copiado ? <CheckCircle className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiado ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Botão Salvar */}
            <button
              onClick={salvarConfiguracoes}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm shadow-lg transition transform active:scale-95 bg-brand hover:bg-brand/90 text-white disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle className="h-4 w-4" /> : <Store className="h-4 w-4" />}
              {saving ? 'Salvando...' : saved ? 'Salvo com sucesso!' : 'Salvar Configurações'}
            </button>
          </div>
        </div>
      )}

      {/* === ABA: PLANOS === */}
      {tab === 'planos' && (
        <div className="space-y-6">
          <p className="text-zinc-400 text-sm">Configure os planos que aparecerão na sua loja de vendas.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {planos.map(plano => {
              const cor = PLANO_COR[plano.cor]
              return (
                <div key={plano.id} className={`glass-effect rounded-2xl border-2 p-5 space-y-4 relative transition-all hover:-translate-y-1 ${cor.border}`}>
                  {plano.badge && (
                    <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black tracking-wider px-3 py-1 rounded-full ${cor.btn} text-white shadow-lg ${cor.glow} shadow-md`}>
                      {plano.badge}
                    </span>
                  )}

                  <div className="flex justify-between items-start">
                    <div className={`h-10 w-10 rounded-xl ${cor.bg} flex items-center justify-center border ${cor.border}`}>
                      <Package className={`h-5 w-5 ${cor.text}`} />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditPlan(plano)} className="h-8 w-8 rounded-lg bg-dark-700/50 hover:bg-dark-600 text-zinc-400 hover:text-white flex items-center justify-center transition border border-dark-600"><Edit2 className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDeletePlan(plano.id)} className="h-8 w-8 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center transition border border-red-500/20 hover:border-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{plano.nome}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">{plano.descricao}</p>
                  </div>

                  <div>
                    <span className={`text-3xl font-black ${cor.text}`}>{plano.preco}</span>
                    <span className="text-zinc-500 text-xs">/período</span>
                  </div>

                  <ul className="space-y-2 flex-1">
                    {plano.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                        <CheckCircle className={`h-3.5 w-3.5 ${cor.text} shrink-0`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          <div onClick={handleCreatePlan} className="glass-effect rounded-xl border border-dashed border-white/10 p-6 text-center hover:border-brand/30 hover:bg-brand/5 transition cursor-pointer group flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-dark-800 border border-dark-600 flex items-center justify-center group-hover:bg-brand group-hover:border-brand mb-3 transition shadow-lg">
              <Plus className="h-6 w-6 text-zinc-500 group-hover:text-white transition" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-brand transition">Adicionar Novo Plano</h3>
            <p className="text-xs text-zinc-500 mt-1">Crie um novo pacote de acesso com valores personalizados para sua loja.</p>
          </div>

          {/* Modal Criar/Editar Plano */}
          {showPlanModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
              <div className="glass-effect relative w-full max-w-lg shadow-2xl rounded-2xl border border-dark-700 bg-dark-900/95 p-1 flex flex-col max-h-[90vh]">
                <div className="px-5 py-4 border-b border-dark-700 bg-dark-800/50 flex justify-between items-center rounded-t-2xl shrink-0">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-brand" /> {planForm.id ? 'Editar Plano' : 'Novo Plano'}
                  </h3>
                  <button onClick={() => setShowPlanModal(false)} className="text-zinc-500 hover:text-white bg-dark-700 hover:bg-red-500 rounded-full p-1 transition"><X className="w-4 h-4" /></button>
                </div>
                
                <form onSubmit={handleSavePlan} className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Nome do Plano *</label>
                      <input type="text" required value={planForm.nome} onChange={e => setPlanForm({...planForm, nome: e.target.value})} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:border-brand/50 focus:outline-none" placeholder="Ex: Mensal Básico" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Preço *</label>
                      <input type="text" required value={planForm.preco} onChange={e => setPlanForm({...planForm, preco: e.target.value})} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm font-bold focus:border-brand/50 focus:outline-none" placeholder="R$ 35,00" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Subtítulo (Opcional)</label>
                    <input type="text" value={planForm.descricao} onChange={e => setPlanForm({...planForm, descricao: e.target.value})} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:border-brand/50 focus:outline-none" placeholder="Ex: Acesso completo por 30 dias" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Badge de Destaque</label>
                      <input type="text" value={planForm.badge} onChange={e => setPlanForm({...planForm, badge: e.target.value})} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:border-brand/50 focus:outline-none" placeholder="Ex: Mais Vendido" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Cor Temática</label>
                      <select value={planForm.cor} onChange={e => setPlanForm({...planForm, cor: e.target.value})} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:border-brand/50 focus:outline-none">
                        <option value="blue">Azul / Padrão</option>
                        <option value="brand">Laranja / Destaque</option>
                        <option value="purple">Roxo / Premium</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Recursos Oferecidos (1 por linha) *</label>
                    <textarea required value={planForm.features} onChange={e => setPlanForm({...planForm, features: e.target.value})} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm h-32 focus:border-brand/50 focus:outline-none custom-scrollbar" placeholder="Sinal em 4K&#10;Mais de 100.000 títulos&#10;Suporte VIP 24/7"></textarea>
                  </div>
                  
                  <div className="pt-4 border-t border-dark-700 flex justify-end gap-3 sticky bottom-0 bg-dark-900/95 py-2 backdrop-blur-sm">
                    <button type="button" onClick={() => setShowPlanModal(false)} className="px-4 py-2 bg-dark-700 text-zinc-300 font-bold rounded-lg border border-dark-600 text-sm">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-brand text-white font-bold rounded-lg shadow border border-brand/50 text-sm">Salvar Plano</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* === ABA: PREVIEW === */}
      {tab === 'preview' && (
        <div className="space-y-4">
          <p className="text-zinc-400 text-sm">Prévia de como sua loja ficará para os clientes.</p>

          <div
            className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            style={{ background: temaSel.bg }}
          >
            {/* Navbar da Loja */}
            <div
              className="px-6 py-4 flex items-center justify-between border-b"
              style={{ borderColor: `${temaSel.primary}20`, background: `${temaSel.primary}10` }}
            >
              {logo ? (
                <img src={logo} alt="Logo" className="h-8 object-contain" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: temaSel.primary }}>
                    <Store className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-white text-sm">{nomeLoja}</span>
                </div>
              )}
              <button
                className="px-4 py-1.5 rounded-full text-xs font-bold text-white"
                style={{ background: temaSel.primary }}
              >
                Assinar Agora
              </button>
            </div>

            {/* Hero da Loja */}
            <div className="py-12 px-6 text-center">
              <h1 className="text-2xl md:text-4xl font-black text-white mb-3">{nomeLoja}</h1>
              <p className="text-zinc-400 text-sm max-w-md mx-auto mb-6">
                A melhor plataforma de streaming com canais ao vivo, filmes e séries em HD, Full HD e 4K.
              </p>
              <button
                className="px-8 py-3 rounded-xl font-bold text-white text-sm shadow-lg"
                style={{ background: `linear-gradient(135deg, ${temaSel.primary}, ${temaSel.primary}cc)` }}
              >
                Ver Planos
              </button>
            </div>

            {/* Planos Preview */}
            <div className="px-6 pb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
              {planos.map(plano => (
                <div
                  key={plano.id}
                  className="rounded-xl p-4 border text-center transition hover:-translate-y-1 shadow-lg cursor-pointer"
                  style={{ borderColor: `${temaSel.primary}30`, background: `${temaSel.primary}08` }}
                >
                  {plano.badge && (
                    <span
                      className="inline-block text-[9px] font-black text-white px-2 py-0.5 rounded-full mb-2 shadow"
                      style={{ background: temaSel.primary }}
                    >
                      {plano.badge}
                    </span>
                  )}
                  <p className="font-bold text-white text-sm">{plano.nome}</p>
                  <p className="font-black text-white text-2xl mt-1" style={{ color: temaSel.primary }}>{plano.preco}</p>
                  
                  <ul className="space-y-1.5 mt-4 mb-4 text-left">
                    {plano.features.slice(0,3).map((f, i) => (
                       <li key={i} className="text-[10px] text-zinc-300 flex items-center gap-1.5">
                         <div className="h-1 w-1 rounded-full shrink-0" style={{ background: temaSel.primary }}></div> {f}
                       </li>
                    ))}
                    {plano.features.length > 3 && (
                       <li className="text-[10px] text-zinc-500 text-center italic">+ {plano.features.length - 3} recursos</li>
                    )}
                  </ul>

                  <button
                    className="w-full mt-3 py-2 rounded-lg text-xs font-bold text-white shadow"
                    style={{ background: temaSel.primary }}
                  >
                    Contratar
                  </button>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-zinc-600 text-xs">
            Esta é uma pré-visualização. A aparência final pode variar ligeiramente.
          </p>
        </div>
      )}
    </div>
  )
}
