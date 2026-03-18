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
    <div>
      {/* Abas */}
      <div className="flex gap-2 mb-8 border-b border-gray-800">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {activeTab === 'branding' && <Branding />}
      {activeTab === 'banners' && <BannerGenerator />}
    </div>
  )
}

export default BrandingBanners
