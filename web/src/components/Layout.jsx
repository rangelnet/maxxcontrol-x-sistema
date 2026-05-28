import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWhatsApp } from '../context/WhatsAppContext'
import { 
  LayoutDashboard, Smartphone, Package, Activity, Palette, 
  Server, Tv, Zap, DollarSign, Search, Bell, FolderOpen,
  Menu, X, LogOut, Sparkles, Shield, Trophy, Store, Settings2, Image,
  MessageSquare, MessageCircle, Crown, Wallet, Sun, Globe
} from 'lucide-react'
import Logo from './Logo'
import { useState } from 'react'

const Layout = () => {
  const { user, logout } = useAuth()
  const { waStatus } = useWhatsApp()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const isActive = (path) => location.pathname === path

  // Navegação organizada por seções (estilo Gerador Premium)
  const navSections = [
    {
      label: 'Principal',
      items: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', permission: 'perm_dashboard' },
        { path: '/devices', icon: Smartphone, label: 'Dispositivos', permission: 'perm_dispositivos' },
        { path: '/wallet', icon: Wallet, label: 'Minha Carteira', badge: 'NOVO', permission: 'perm_carteira' },
        { path: '/resale', icon: DollarSign, label: 'Revenda', badge: 'NOVO', permission: 'perm_revenda' },
        { path: '/finance-plans', icon: DollarSign, label: 'Planos & Receitas', badge: 'NOVO', permission: 'perm_planos' },
        { path: '/subscribe-plans', icon: Crown, label: 'Assinar Painel', badge: 'PRO', permission: 'perm_assinatura' },
        { path: '/game-schedule', icon: Trophy, label: 'Grade de Jogos', badge: 'NOVO', permission: 'perm_jogos' },
        { path: '/banner-generator', icon: Image, label: 'Gerador de Banners', badge: 'NOVO', permission: 'perm_banners' },
        { path: '/whatsapp-auto?tab=livechat', icon: MessageSquare, label: 'Chat Ao Vivo', badge: 'NOVO', permission: 'perm_chat' },
        { path: '/agents', icon: Sparkles, label: 'Agentes IA', badge: 'PRO', permission: 'perm_agentes' },
      ]
    },
    {
      label: 'IPTV & Servidores',
      items: [
        { path: '/iptv-server', icon: Server, label: 'IPTV', permission: 'perm_iptv' },
        { path: '/iptv-plugin', icon: Zap, label: 'Plugin IPTV Unificado', permission: 'perm_plugin' },
        { path: '/iptv-tree', icon: Tv, label: 'Árvore IPTV', permission: 'perm_arvore' },
      ]
    },
    {
      label: 'Ferramentas',
      items: [
        { path: '/api-config', icon: Activity, label: 'APIs', permission: 'perm_api' },
        { path: '/branding-banners', icon: Palette, label: 'Branding & Banners', badge: 'NOVO', permission: 'perm_branding' },
        { path: '/gallery', icon: FolderOpen, label: 'Minha Galeria', permission: 'perm_galeria' },
        { path: '/white-label', icon: Store, label: 'Minha Loja White Label', badge: 'NOVO', permission: 'perm_whitelabel' },
        { path: '/whatsapp-auto', icon: MessageCircle, label: 'Automação WhatsApp', badge: 'NOVO', permission: 'perm_whatsapp' },
        { path: '/versions', icon: Package, label: 'Versões', permission: 'perm_versoes' },
        { path: '/settings', icon: Settings2, label: 'Configurações', permission: 'perm_config' },
        { path: '/tickets', icon: MessageSquare, label: 'Tickets de Suporte', permission: 'perm_tickets' },
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
            <img src="/logo-maxx.svg" alt="Maxx Control" className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(252, 95, 22,0.4)]" />
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
            {section.items.filter(item => {
              // Se o item for restrito apenas a admin
              if (item.adminOnly && user && user.tipo === 'revendedor') {
                return false;
              }
              // Se for um revendedor, valida suas permissões dinâmicas
              if (user && user.tipo === 'revendedor' && item.permission) {
                if (user[item.permission] !== undefined) {
                  return !!user[item.permission];
                }
                // Fallback robusto se a chave for undefined na sessão (evita sidebar em branco)
                const defaults = {
                  perm_dashboard: true,
                  perm_dispositivos: true,
                  perm_iptv: true,
                  perm_plugin: true,
                  perm_tickets: true
                };
                return !!defaults[item.permission];
              }
              return true;
            }).map((item) => (
              <NavLink key={item.path} item={item} onClick={onNavClick} />
            ))}
          </div>
        ))}
      </nav>

      {/* Widget Fixo de Carteira */}
      {user && (!user.plano || !String(user.plano).toLowerCase().includes('ilimitado')) && (
        <div className="p-4 border-t border-dark-700 bg-dark-900/50 shrink-0">
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                <Wallet className="h-4 w-4 text-green-500" />
                <span>Saldo Atual</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {user?.creditos !== undefined ? user.creditos : '0'} <span className="text-sm font-normal text-zinc-500">créditos</span>
            </div>
            <Link
              to="/resale#shop"
              onClick={onNavClick}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-600"
            >
              Adicionar Créditos
            </Link>
          </div>
        </div>
      )}

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

            {/* Seletores de Tema e Idioma (Placeholders) */}
            <div className="hidden md:flex items-center gap-2 mr-1 border-r border-dark-700 pr-3">
              <button 
                onClick={() => showToast('Troca de Tema em Desenvolvimento', 'info')}
                className="flex items-center gap-2 bg-dark-900 hover:bg-dark-700 border border-dark-600 px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
              >
                <Sun size={14} className="text-yellow-500" />
                <span className="hidden lg:block font-medium">Tema</span>
              </button>
              <button 
                onClick={() => showToast('Múltiplos Idiomas em Desenvolvimento', 'info')}
                className="flex items-center gap-2 bg-dark-900 hover:bg-dark-700 border border-dark-600 px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
              >
                <Globe size={14} className="text-blue-500" />
                <span className="hidden lg:block font-medium">Idioma</span>
              </button>
            </div>

            {/* Notificações */}
            <button className="relative p-2 hover:bg-dark-700 rounded-lg transition-colors group">
              <Bell size={20} className="text-zinc-400 group-hover:text-white transition-colors" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full animate-pulse"></span>
            </button>

            {/* Créditos e Plano */}
            <div className="hidden md:flex items-center gap-2">
              <Link to="/subscribe-plans" className="flex items-center gap-2 bg-dark-900 hover:bg-dark-700 border border-dark-600 px-3 py-1.5 rounded-lg text-sm no-underline transition-all">
                  <span className="font-bold text-zinc-400">Plano:</span>
                  <div className="flex items-center gap-1.5 text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 border border-yellow-500/20 rounded-md">
                     <Crown size={12} /> {user?.plano || 'ILIMITADO'}
                  </div>
              </Link>
              
              {(!user?.plano || !String(user.plano).toLowerCase().includes('ilimitado')) && (
                <Link to="/wallet" className="flex items-center gap-2 bg-dark-900 hover:bg-dark-700 border border-dark-600 px-3 py-1.5 rounded-lg text-sm no-underline transition-all group">
                    <span className="font-bold text-zinc-400">Saldo:</span>
                    <div className="flex items-center gap-1.5 text-green-500 font-bold bg-green-500/10 group-hover:bg-green-500/20 px-2 py-0.5 border border-green-500/20 rounded-md transition-colors">
                       <Wallet size={12} /> {user?.creditos !== undefined ? user.creditos : '0'}
                    </div>
                </Link>
              )}
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
                <p className="text-sm font-medium text-white">{user?.nome || 'Admin'}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{user?.empresa || 'Maxx Control'}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-brand-500 to-orange-600 flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-brand-500/20 border border-white/10">
                {(user?.nome || 'A').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* ════════════ CONTEÚDO SCROLLÁVEL ════════════ */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <Outlet />
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:24, right:24, zIndex:200, background:toast.type==='error'?'rgba(239,68,68,0.95)': toast.type==='info' ? 'rgba(59,130,246,0.95)' : 'rgba(16,185,129,0.95)', backdropFilter:'blur(12px)', borderRadius:12, padding:'12px 20px', color:'#fff', fontSize:13, fontWeight:700, boxShadow:'0 12px 30px rgba(0,0,0,0.4)', display:'flex', alignItems:'center', gap:8 }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

export default Layout
