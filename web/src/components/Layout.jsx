import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWhatsApp } from '../context/WhatsAppContext'
import { 
  LayoutDashboard, Smartphone, Package, Activity, Palette, 
  Server, Tv, Zap, DollarSign, Search, Bell, FolderOpen,
  Menu, X, LogOut, Sparkles, Shield, Trophy, Store, Settings2, Image,
  MessageSquare, MessageCircle
} from 'lucide-react'
import Logo from './Logo'
import { useState } from 'react'

const Layout = () => {
  const { user, logout } = useAuth()
  const { waStatus } = useWhatsApp()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  // Navegação organizada por seções (estilo Gerador Premium)
  const navSections = [
    {
      label: 'Principal',
      items: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/devices', icon: Smartphone, label: 'Dispositivos' },
        { path: '/resale', icon: DollarSign, label: 'Revenda', badge: 'NOVO' },
        { path: '/game-schedule', icon: Trophy, label: 'Grade de Jogos', badge: 'NOVO' },
        { path: '/banner-generator', icon: Image, label: 'Gerador de Banners', badge: 'NOVO' },
        { path: '/whatsapp-auto?tab=livechat', icon: MessageSquare, label: 'Chat Ao Vivo', badge: 'NOVO' },
      ]
    },
    {
      label: 'IPTV & Servidores',
      items: [
        { path: '/iptv-server', icon: Server, label: 'IPTV' },
        { path: '/iptv-plugin', icon: Zap, label: 'Plugin IPTV Unificado' },
        { path: '/iptv-tree', icon: Tv, label: 'Árvore IPTV' },
      ]
    },
    {
      label: 'Ferramentas',
      items: [
        { path: '/api-config', icon: Activity, label: 'APIs' },
        { path: '/branding-banners', icon: Palette, label: 'Branding & Banners', badge: 'NOVO' },
        { path: '/gallery', icon: FolderOpen, label: 'Minha Galeria' },
        { path: '/white-label', icon: Store, label: 'Minha Loja White Label', badge: 'NOVO' },
        { path: '/whatsapp-auto', icon: MessageCircle, label: 'Automação WhatsApp', badge: 'NOVO' },
        { path: '/versions', icon: Package, label: 'Versões' },
        { path: '/settings', icon: Settings2, label: 'Configurações' },
        { path: '/admin-templates', icon: Sparkles, label: 'Fábrica de Temas', badge: 'MASTER', adminOnly: true },
        { path: '/tickets', icon: MessageSquare, label: 'Tickets de Suporte' },
      ]
    },
  ]

  // Pega o título da página atual
  const getCurrentTitle = () => {
    for (const section of navSections) {
      for (const item of section.items) {
        if (isActive(item.path)) return item.label
      }
    }
    return 'Dashboard'
  }

  const NavLink = ({ item, onClick }) => (
    <Link
      to={item.path}
      onClick={onClick}
      className={`group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-r-lg transition-all duration-200 border-l-2 ${
        isActive(item.path)
          ? 'bg-brand-500/10 text-brand-500 border-l-brand-500 shadow-[inset_4px_0_0_0_rgba(252,95,22,0.5)]'
          : 'text-zinc-400 hover:bg-dark-700 hover:text-white border-l-transparent'
      }`}
    >
      <item.icon size={18} className={`w-5 text-center ${isActive(item.path) ? 'text-brand-500' : 'text-zinc-500 group-hover:text-white'}`} />
      <span className="flex-1">{item.label}</span>
      {item.badge === 'NOVO' && (
        <span className="badge-new">NOVO</span>
      )}
      {item.badge === 'BETA' && (
        <span className="badge-beta">BETA</span>
      )}
      {item.badge === 'EM BREVE' && (
        <span className="badge-soon">EM BREVE</span>
      )}
    </Link>
  )

  const SidebarContent = ({ onNavClick }) => (
    <div className="flex flex-col h-full">
      {/* Logo e Título */}
      <div className="h-36 flex items-center justify-center px-4 border-b border-dark-700 bg-dark-900/50 py-4 shrink-0">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center transition hover:scale-105">
            <img src="/logo-maxx.svg" alt="Maxx Control" className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(255,165,0,0.4)]" />
          </div>
          <div className="text-center">
            <h2 className="text-white font-bold text-lg tracking-tight">MAXX Control</h2>
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Painel Premium</p>
          </div>
        </div>
      </div>

      {/* Navegação com Seções */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {navSections.map((section, idx) => (
          <div key={idx}>
            <p className="px-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 mt-5 first:mt-0">
              {section.label}
            </p>
            {section.items.filter(item => !item.adminOnly || (user && (user.role === 'admin' || user.plano === 'premium' || user.plano === 'master' || user.plano === 'ILIMITADO'))).map((item) => (
              <NavLink key={item.path} item={item} onClick={onNavClick} />
            ))}
          </div>
        ))}
      </nav>

      {/* Área de Logout */}
      <div className="p-4 border-t border-dark-700 bg-dark-900/30 shrink-0">
        <button
          onClick={logout}
          className="flex items-center w-full gap-3 px-3 py-2.5 text-sm font-medium text-zinc-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut size={18} className="text-zinc-500" />
          <span>Sair da Conta</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="h-screen flex overflow-hidden bg-dark-900 text-zinc-100 antialiased">

      {/* ════════════ OVERLAY MOBILE ════════════ */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ════════════ SIDEBAR DESKTOP ════════════ */}
      <aside className="hidden md:flex w-64 bg-dark-800 border-r border-dark-700 flex-col shrink-0 h-full">
        <SidebarContent onNavClick={() => {}} />
      </aside>

      {/* ════════════ SIDEBAR MOBILE (DRAWER) ════════════ */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-dark-800 border-r border-dark-700 flex flex-col z-[100] transition-transform duration-300 h-full md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Botão Fechar */}
        <div className="absolute top-4 right-4 z-50">
          <button onClick={() => setSidebarOpen(false)} className="text-zinc-400 hover:text-white p-2 hover:bg-dark-700 rounded-lg transition-colors">
            <X size={22} />
          </button>
        </div>
        <SidebarContent onNavClick={() => setSidebarOpen(false)} />
      </aside>

      {/* ════════════ ÁREA PRINCIPAL ════════════ */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* ════════════ HEADER TOP BAR ════════════ */}
        <header className="h-16 bg-dark-800/80 backdrop-blur-md border-b border-dark-700 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3">
            {/* Botão Hamburger (Mobile) */}
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="md:hidden text-zinc-400 hover:text-white focus:outline-none p-1.5 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>

            {/* Título da Página */}
            <h2 className="text-lg font-semibold text-zinc-200 flex items-center">
              <span className="w-2 h-6 bg-brand-500 rounded-full mr-3 hidden md:block"></span>
              <span>{getCurrentTitle()}</span>
            </h2>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Barra de Busca (Desktop) */}
            <div className="hidden lg:flex relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={16} />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-64 bg-dark-900 border border-dark-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            {/* Notificações */}
            <button className="relative p-2 hover:bg-dark-700 rounded-lg transition-colors group">
              <Bell size={20} className="text-zinc-400 group-hover:text-white transition-colors" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full animate-pulse"></span>
            </button>

            {/* Créditos do Master/Revendedor */}
            <div className="hidden md:flex items-center gap-2 bg-dark-900 border border-dark-600 px-3 py-1.5 rounded-lg text-sm ml-2">
                <span className="font-bold text-zinc-400">Plano Atual:</span>
                <div className="flex items-center gap-1.5 text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 border border-yellow-500/20 rounded-md">
                   <i className="fas fa-infinity text-[11px]"></i> ILIMITADO
                </div>
            </div>

            {/* Status WhatsApp Global */}
            <div className="hidden md:flex items-center gap-2 bg-dark-900 border border-dark-600 px-3 py-1.5 rounded-lg text-sm">
                <span className="font-bold text-zinc-400">WhatsApp:</span>
                <div className={`flex items-center gap-1.5 font-bold px-2 py-0.5 border rounded-md ${
                  waStatus === 'connected' 
                    ? 'text-green-500 bg-green-500/10 border-green-500/20' 
                    : waStatus === 'loading'
                      ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
                      : 'text-red-500 bg-red-500/10 border-red-500/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    waStatus === 'connected' ? 'bg-green-500 animate-pulse' : waStatus === 'loading' ? 'bg-yellow-500 animate-spin' : 'bg-red-500'
                  }`} />
                  {waStatus === 'connected' ? 'ONLINE' : waStatus === 'loading' ? 'CONECTANDO...' : 'OFFLINE'}
                </div>
            </div>

            {/* Separador */}
            <div className="hidden md:block w-px h-8 bg-dark-700 ml-2"></div>

            {/* Perfil */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-white">Admin</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Maxx Control</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-brand-500 to-orange-600 flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-brand-500/20 border border-white/10">
                A
              </div>
            </div>
          </div>
        </header>

        {/* ════════════ CONTEÚDO SCROLLÁVEL ════════════ */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
