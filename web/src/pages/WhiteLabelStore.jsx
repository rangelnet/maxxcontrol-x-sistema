import { useState } from 'react'
import { Store, Save, Eye, EyeOff, Upload, Palette, Globe, CreditCard, ToggleLeft, ToggleRight, Link2, ShoppingBag, Sparkles } from 'lucide-react'

export default function WhiteLabelStore() {
  const [storeActive, setStoreActive] = useState(false)
  const [saving, setSaving] = useState(false)
  const [storeName, setStoreName] = useState('')
  const [storeSlug, setStoreSlug] = useState('')
  const [monthlyPrice, setMonthlyPrice] = useState('29.90')
  const [quarterlyPrice, setQuarterlyPrice] = useState('69.90')
  const [semiannualPrice, setSemiannualPrice] = useState('119.90')
  const [annualPrice, setAnnualPrice] = useState('199.90')
  const [pixKey, setPixKey] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#6366f1')
  const [logoPreview, setLogoPreview] = useState(null)
  const [activeTab, setActiveTab] = useState('general')

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => setSaving(false), 1500)
  }

  const tabs = [
    { id: 'general', label: 'Geral', icon: Store },
    { id: 'plans', label: 'Planos', icon: CreditCard },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'payment', label: 'Pagamento', icon: ShoppingBag },
  ]

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
          <p className="text-zinc-400 text-sm mt-1">Configure sua loja própria de revenda automatizada.</p>
        </div>
        
        {/* Toggle Ativo */}
        <div 
          onClick={() => setStoreActive(!storeActive)}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl border cursor-pointer transition-all duration-300 ${
            storeActive 
              ? 'bg-green-500/10 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.15)]' 
              : 'bg-dark-800 border-dark-700 hover:border-zinc-500'
          }`}
        >
          {storeActive ? <ToggleRight className="h-6 w-6 text-green-500" /> : <ToggleLeft className="h-6 w-6 text-zinc-500" />}
          <div>
            <p className={`text-sm font-bold ${storeActive ? 'text-green-400' : 'text-zinc-400'}`}>
              {storeActive ? 'Loja Online' : 'Loja Desativada'}
            </p>
            <p className="text-[10px] text-zinc-500">Ligar / Desligar</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-yellow-900/20 to-dark-800 border border-yellow-500/20 rounded-xl p-5 flex gap-4 items-start shadow-lg">
        <div className="h-12 w-12 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500 shrink-0">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Venda no Automático</h3>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
            Configure sua loja com seus planos, logo e forma de pagamento. Seus clientes poderão comprar e renovar o acesso de forma 100% automática via PIX.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
              activeTab === tab.id 
                ? 'bg-maxx/10 text-maxx border-maxx/30 shadow-lg shadow-maxx/10' 
                : 'bg-dark-800 text-zinc-400 border-dark-700 hover:border-zinc-500'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 shadow-xl overflow-hidden">
        
        {/* GERAL */}
        {activeTab === 'general' && (
          <div className="p-6 space-y-6 animate-fadeIn">
            <div className="border-b border-dark-700 pb-4 mb-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Store className="h-5 w-5 text-maxx" /> Informações da Loja
              </h2>
              <p className="text-sm text-zinc-400">Dados básicos que aparecerão para seus clientes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Nome da Loja</label>
                <div className="relative">
                  <Store className="absolute left-3 top-3.5 h-4 w-4 text-zinc-600" />
                  <input 
                    type="text" value={storeName} onChange={e => setStoreName(e.target.value)}
                    placeholder="Minha TV Premium" 
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg py-3 pl-10 pr-4 text-white text-sm focus:border-maxx outline-none transition"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">URL Personalizada</label>
                <div className="flex rounded-lg overflow-hidden border border-dark-600 focus-within:border-maxx transition">
                  <span className="bg-dark-900 text-zinc-500 px-3 py-3 text-xs border-r border-dark-700 flex items-center shrink-0">
                    seusite.com/loja/
                  </span>
                  <input 
                    type="text" value={storeSlug} onChange={e => setStoreSlug(e.target.value)}
                    placeholder="suamarca" 
                    className="w-full bg-dark-900 px-3 py-3 text-white text-sm outline-none font-bold"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1.5">
                  <Globe className="inline h-3 w-3 mr-1" />Apenas letras minúsculas e sem espaços.
                </p>
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Logo da Loja</label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="w-full sm:w-40 h-32 bg-dark-900 rounded-xl border border-dashed border-dark-600 flex items-center justify-center overflow-hidden group hover:border-maxx/50 transition">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Preview" className="max-w-full max-h-full object-contain p-2" />
                  ) : (
                    <div className="text-center">
                      <Upload className="h-6 w-6 text-zinc-600 mx-auto mb-1" />
                      <p className="text-[10px] text-zinc-500">PNG ou JPG</p>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="block w-full bg-dark-700 hover:bg-dark-600 border border-dark-600 text-zinc-300 font-semibold py-3 rounded-lg transition cursor-pointer text-center text-sm">
                    <Upload className="inline h-4 w-4 mr-2" />Selecionar Arquivo
                    <input type="file" className="hidden" accept="image/png,image/jpeg" onChange={e => {
                      const f = e.target.files[0]
                      if (f) setLogoPreview(URL.createObjectURL(f))
                    }} />
                  </label>
                  <p className="text-[10px] text-zinc-500">Recomendado: 400×200px com fundo transparente</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PLANOS */}
        {activeTab === 'plans' && (
          <div className="p-6 space-y-6 animate-fadeIn">
            <div className="border-b border-dark-700 pb-4 mb-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-maxx" /> Planos e Preços
              </h2>
              <p className="text-sm text-zinc-400">Configure os planos que seus clientes poderão comprar.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Mensal', days: '30 dias', value: monthlyPrice, setter: setMonthlyPrice, color: 'blue' },
                { label: 'Trimestral', days: '90 dias', value: quarterlyPrice, setter: setQuarterlyPrice, color: 'indigo' },
                { label: 'Semestral', days: '180 dias', value: semiannualPrice, setter: setSemiannualPrice, color: 'purple' },
                { label: 'Anual', days: '365 dias', value: annualPrice, setter: setAnnualPrice, color: 'green', popular: true },
              ].map((plan) => (
                <div key={plan.label} className={`bg-dark-900 rounded-xl border p-5 relative overflow-hidden transition-all hover:border-zinc-500 ${
                  plan.popular ? 'border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-dark-600'
                }`}>
                  {plan.popular && (
                    <span className="absolute -top-0 right-3 text-[8px] font-black bg-green-500 text-white px-2 py-0.5 rounded-b uppercase tracking-wider">
                      Popular
                    </span>
                  )}
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">{plan.label}</p>
                  <p className="text-[10px] text-zinc-600 mb-3">{plan.days}</p>
                  <div className="flex items-center bg-dark-800 border border-dark-700 rounded-lg px-3 py-2">
                    <span className="text-zinc-500 font-bold mr-2 text-sm">R$</span>
                    <input 
                      type="number" value={plan.value} onChange={e => plan.setter(e.target.value)}
                      className="bg-transparent border-none outline-none text-white font-bold w-full text-lg"
                      step="0.01"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APARÊNCIA */}
        {activeTab === 'appearance' && (
          <div className="p-6 space-y-6 animate-fadeIn">
            <div className="border-b border-dark-700 pb-4 mb-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Palette className="h-5 w-5 text-maxx" /> Personalização Visual
              </h2>
              <p className="text-sm text-zinc-400">Customize as cores e o visual da sua loja.</p>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block">Cor Principal</label>
              <div className="flex flex-wrap gap-3">
                {['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4'].map(color => (
                  <button 
                    key={color}
                    onClick={() => setPrimaryColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all shadow-md flex items-center justify-center ${
                      primaryColor === color ? 'border-white scale-110 shadow-lg' : 'border-white/20 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {primaryColor === color && <span className="text-white text-xs">✓</span>}
                  </button>
                ))}
                <div className="relative">
                  <input 
                    type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-full cursor-pointer border-2 border-dashed border-zinc-600"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block">Pré-Visualização</label>
              <div className="bg-dark-900 rounded-xl border border-dark-600 p-6 text-center">
                <div className="h-12 w-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: primaryColor + '20' }}>
                  <Store className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{storeName || 'Sua Loja'}</h3>
                <p className="text-xs text-zinc-500 mb-4">Escolha seu plano e comece agora</p>
                <button className="text-white font-bold py-2.5 px-6 rounded-lg text-sm" style={{ backgroundColor: primaryColor }}>
                  Assinar Agora
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAGAMENTO */}
        {activeTab === 'payment' && (
          <div className="p-6 space-y-6 animate-fadeIn">
            <div className="border-b border-dark-700 pb-4 mb-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-maxx" /> Forma de Pagamento
              </h2>
              <p className="text-sm text-zinc-400">Cadastre sua chave PIX para receber pagamentos automáticos.</p>
            </div>

            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 flex gap-4 items-start">
              <div className="h-10 w-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 shrink-0">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-green-400 font-bold text-sm mb-1">Pagamento 100% PIX</h4>
                <p className="text-xs text-zinc-400">O valor das vendas cai direto na sua conta. Sem intermediários.</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Chave PIX</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3.5 h-4 w-4 text-zinc-600" />
                <input 
                  type="text" value={pixKey} onChange={e => setPixKey(e.target.value)}
                  placeholder="CPF, Email, Telefone ou Chave Aleatória" 
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg py-3 pl-10 pr-4 text-white text-sm focus:border-green-500 outline-none transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="p-6 border-t border-dark-700 flex justify-end gap-3">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-maxx hover:bg-maxx/90 text-white font-bold py-3 px-8 rounded-xl transition shadow-lg shadow-maxx/20 flex items-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {saving ? (
              <><span className="animate-spin">⏳</span> Salvando...</>
            ) : (
              <><Save className="h-4 w-4" /> Salvar Configurações</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
