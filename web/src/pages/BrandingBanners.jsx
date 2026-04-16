import { useState } from 'react'
import Branding from './Branding'
import BannerGenerator from './BannerGenerator'

const TABS = [
  {
    id: 'branding',
    label: 'Gerenciar Branding',
    icon: '🎨',
    badge: null,
    desc: 'Cores, logos e identidade visual',
  },
  {
    id: 'banners',
    label: 'Gerador de Banners',
    icon: '🖼️',
    badge: 'NOVO',
    desc: 'Futebol, Filmes, Basquete, UFC',
  },
]

const BrandingBanners = () => {
  const [activeTab, setActiveTab] = useState('branding')

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xl">
          🎨
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Branding & Banners</h1>
          <p className="text-zinc-400 text-sm">Identidade visual e gerador de artes premium</p>
        </div>
      </div>

      {/* Abas */}
      <div className="grid grid-cols-2 gap-3">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-200 group
              ${activeTab === tab.id
                ? 'bg-dark-800 border-brand-500 shadow-lg shadow-brand-500/10'
                : 'bg-dark-800 border-dark-700 hover:border-dark-600 hover:bg-dark-700/50'
              }`}
          >
            {/* Ícone */}
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-colors
              ${activeTab === tab.id ? 'bg-brand-500/20 border border-brand-500/30' : 'bg-dark-900 border border-dark-600'}`}>
              {tab.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-bold text-sm ${activeTab === tab.id ? 'text-white' : 'text-zinc-300'}`}>
                  {tab.label}
                </span>
                {tab.badge && (
                  <span className="text-[8px] font-black bg-brand-500 text-white px-1.5 py-0.5 rounded uppercase">
                    {tab.badge}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{tab.desc}</p>
            </div>

            {/* Indicador ativo */}
            {activeTab === tab.id && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-brand-500 rounded-full shadow-lg shadow-brand-500/50" />
            )}

            {/* Barra bottom ativa */}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-brand-500 to-transparent rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Divisor */}
      <div className="h-px bg-gradient-to-r from-transparent via-dark-600 to-transparent" />

      {/* Conteúdo com transição */}
      <div key={activeTab} className="animate-fadeIn">
        {activeTab === 'branding' && <Branding />}
        {activeTab === 'banners'  && <BannerGenerator />}
      </div>
    </div>
  )
}

export default BrandingBanners
