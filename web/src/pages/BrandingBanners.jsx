import { useState } from 'react'
import { Palette, Image } from 'lucide-react'
import Branding from './Branding'
import BannerGenerator from './BannerGenerator'

const TABS = [
  { id: 'branding', label: 'Gerenciar Branding', icon: Palette },
  { id: 'banners', label: 'Banners', icon: Image },
]

const BrandingBanners = () => {
  const [activeTab, setActiveTab] = useState('branding')

  return (
    <div className="min-h-screen">
      {/* Header com Abas Modernas */}
      <div className="mb-8">
        <div className="flex gap-3 border-b border-gray-800/50">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`
                flex items-center gap-3 px-8 py-4 font-semibold text-sm
                transition-all duration-300 border-b-2 -mb-px relative
                ${
                  activeTab === id
                    ? 'border-[#FF4D33] text-white bg-[#FF4D33]/10'
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-900/30'
                }
              `}
            >
              <Icon size={20} className={activeTab === id ? 'text-[#FF4D33]' : ''} />
              {label}
              
              {/* Glow effect na aba ativa */}
              {activeTab === id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#FF4D33] to-transparent opacity-60" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo com animação suave */}
      <div className="animate-fadeIn">
        {activeTab === 'branding' && <Branding />}
        {activeTab === 'banners' && <BannerGenerator />}
      </div>
    </div>
  )
}

export default BrandingBanners
