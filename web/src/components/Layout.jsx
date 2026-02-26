import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Smartphone, Bug, Package, FileText, LogOut, Activity, Settings } from 'lucide-react'
import Logo from './Logo'

const Layout = () => {
  const { logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/devices', icon: Smartphone, label: 'Dispositivos' },
    { path: '/api-monitor', icon: Activity, label: 'Monitor de APIs' },
    { path: '/api-config', icon: Settings, label: 'Configurar APIs' },
    { path: '/bugs', icon: Bug, label: 'Bugs' },
    { path: '/versions', icon: Package, label: 'Versões' },
    { path: '/logs', icon: FileText, label: 'Logs' },
  ]

  return (
    <div className="min-h-screen bg-dark">
      <nav className="bg-card border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo size={35} showText={true} />
            </div>
            <button onClick={logout} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <LogOut size={20} />
              Sair
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 min-h-screen bg-card border-r border-gray-800 p-4">
          <nav className="space-y-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(path)
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
