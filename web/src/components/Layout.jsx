import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Smartphone, Package, FileText, Activity, Palette, Server, Tv, Zap, Search, Bell, User, DollarSign } from 'lucide-react'
import Logo from './Logo'

const Layout = () => {
  const { logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/devices', icon: Smartphone, label: 'Dispositivos' },
    { path: '/resale', icon: DollarSign, label: 'Revenda' },
    { path: '/api-config', icon: Activity, label: 'APIs' },
    { path: '/branding-banners', icon: Palette, label: 'Branding & Banners' },
    { path: '/iptv-server', icon: Server, label: 'IPTV' },
    { path: '/iptv-plugin', icon: Zap, label: 'Plugin IPTV Unificado' },
    { path: '/iptv-tree', icon: Tv, label: 'Árvore IPTV' },
    { path: '/logs', icon: FileText, label: 'Logs' },
    { path: '/versions', icon: Package, label: 'Versões' },
  ]

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Topbar Moderna */}
      <nav className="bg-[#1A1A1A] border-b border-gray-800/50 sticky top-0 z-50 backdrop-blur-lg bg-opacity-95">
        <div className="px-6 h-20">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <div className="flex items-center">
              <Logo size={40} showText={true} />
            </div>

            {/* Barra de Busca */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-full bg-[#0F0F0F] border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF4D33] transition-colors"
                />
              </div>
            </div>

            {/* Ícones da Direita */}
            <div className="flex items-center gap-4">
              {/* Notificações */}
              <button className="relative p-3 hover:bg-gray-800 rounded-xl transition-colors group">
                <Bell size={22} className="text-gray-400 group-hover:text-white transition-colors" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF4D33] rounded-full"></span>
              </button>

              {/* Avatar do Usuário */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF4D33] to-orange-600 rounded-xl flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <button 
                  onClick={logout}
                  className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar Aprimorada */}
        <aside className="w-72 min-h-screen bg-[#1A1A1A] border-r border-gray-800/50 p-6">
          {/* Logo MAXX no topo da sidebar */}
          <div className="mb-8 pb-6 border-b border-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF4D33] to-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">MAXX</h2>
                <p className="text-gray-500 text-xs">Control Panel</p>
              </div>
            </div>
          </div>

          {/* Menu de Navegação */}
          <nav className="space-y-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                  isActive(path)
                    ? 'bg-[#FF4D33] text-white shadow-lg shadow-orange-500/20'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive(path) ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Conteúdo Principal */}
        <main className="flex-1 p-8 bg-[#0F0F0F]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
