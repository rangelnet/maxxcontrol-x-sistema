import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { Users, Smartphone, TrendingUp, DollarSign, UserPlus, Tv, Wifi, Zap, Server, Activity, Image, ShoppingBag } from 'lucide-react'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [online, setOnline] = useState(0)

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      const [statsRes, onlineRes] = await Promise.all([
        api.get('/api/monitor/dashboard'),
        api.get('/api/monitor/online')
      ])
      setStats(statsRes.data)
      setOnline(onlineRes.data.online)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const metricCards = [
    {
      title: 'Receita do Mês',
      value: 'R$ 25.430',
      icon: DollarSign,
      color: 'from-brand-500/20 to-transparent',
      iconColor: 'text-brand-500',
      iconBg: 'bg-brand-500/10 border-brand-500/20',
    },
    {
      title: 'Usuários Ativos',
      value: stats?.usuarios_ativos?.toLocaleString() || '8.120',
      icon: Users,
      color: 'from-blue-500/20 to-transparent',
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Dispositivos Online',
      value: online?.toLocaleString() || '2.345',
      icon: Smartphone,
      color: 'from-green-500/20 to-transparent',
      iconColor: 'text-green-400',
      iconBg: 'bg-green-500/10 border-green-500/20',
    },
    {
      title: 'Crescimento',
      value: '+12.5%',
      icon: TrendingUp,
      color: 'from-purple-500/20 to-transparent',
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10 border-purple-500/20',
    },
  ]

  // Grid de ferramentas estilo Gerador Premium
  const toolCards = [
    {
      title: 'Dispositivos',
      description: 'Gerencie e monitore todos os dispositivos conectados com logs em tempo real.',
      icon: Smartphone,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      hoverBorder: 'hover:border-blue-500/50',
      hoverShadow: 'hover:shadow-blue-500/10',
      textColor: 'text-blue-400',
      cta: 'Gerenciar →',
      path: '/devices',
      badge: null,
    },
    {
      title: 'IPTV & Servidores',
      description: 'Configure e gerencie servidores IPTV, playlists e estrutura em árvore.',
      icon: Tv,
      iconColor: 'text-green-400',
      iconBg: 'bg-green-500/10 border-green-500/20',
      hoverBorder: 'hover:border-green-500/50',
      hoverShadow: 'hover:shadow-green-500/10',
      textColor: 'text-green-400',
      cta: 'Acessar →',
      path: '/iptv-server',
      badge: null,
    },
    {
      title: 'Plugin IPTV Unificado',
      description: 'Gerencie múltiplos servidores IPTV com o plugin unificado de alto desempenho.',
      icon: Zap,
      iconColor: 'text-yellow-400',
      iconBg: 'bg-yellow-500/10 border-yellow-500/20',
      hoverBorder: 'hover:border-yellow-500/50',
      hoverShadow: 'hover:shadow-yellow-500/10',
      textColor: 'text-yellow-400',
      cta: 'Configurar →',
      path: '/iptv-plugin',
      badge: 'NOVO',
      badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    },
    {
      title: 'Branding & Banners',
      description: 'Crie banners personalizados, materiais de divulgação e identidade visual.',
      icon: Image,
      iconColor: 'text-pink-400',
      iconBg: 'bg-pink-500/10 border-pink-500/20',
      hoverBorder: 'hover:border-pink-500/50',
      hoverShadow: 'hover:shadow-pink-500/10',
      textColor: 'text-pink-400',
      cta: 'Criar →',
      path: '/branding-banners',
      badge: 'NOVO',
      badgeColor: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    },
    {
      title: 'Painel de APIs',
      description: 'Configure e monitore as APIs do sistema, tokens e integrações externas.',
      icon: Activity,
      iconColor: 'text-brand-400',
      iconBg: 'bg-brand-500/10 border-brand-500/20',
      hoverBorder: 'hover:border-brand-500/50',
      hoverShadow: 'hover:shadow-brand-500/10',
      textColor: 'text-brand-400',
      cta: 'Configurar →',
      path: '/api-config',
      badge: null,
    },
    {
      title: 'Painel de Revenda',
      description: 'Gerencie revendedores, planos e comissões. Controle total do negócio.',
      icon: ShoppingBag,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      hoverBorder: 'hover:border-emerald-500/50',
      hoverShadow: 'hover:shadow-emerald-500/10',
      textColor: 'text-emerald-400',
      cta: 'Acessar Painel →',
      path: '/resale',
      badge: null,
    },
    {
      title: 'Versões do App',
      description: 'Controle versões do aplicativo, forçar atualizações e changelog.',
      icon: Server,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/20',
      hoverBorder: 'hover:border-cyan-500/50',
      hoverShadow: 'hover:shadow-cyan-500/10',
      textColor: 'text-cyan-400',
      cta: 'Ver Versões →',
      path: '/versions',
      badge: null,
    },
    {
      title: 'Árvore IPTV',
      description: 'Visualize e explore a estrutura hierárquica completa do seu servidor IPTV.',
      icon: Wifi,
      iconColor: 'text-orange-400',
      iconBg: 'bg-orange-500/10 border-orange-500/20',
      hoverBorder: 'hover:border-orange-500/50',
      hoverShadow: 'hover:shadow-orange-500/10',
      textColor: 'text-orange-400',
      cta: 'Explorar →',
      path: '/iptv-tree',
      badge: null,
    },
  ]

  // Dados do gráfico
  const chartData = [
    { month: 'Jan', value: 250 },
    { month: 'Fev', value: 280 },
    { month: 'Mar', value: 320 },
    { month: 'Abr', value: 380 },
    { month: 'Mai', value: 420 },
    { month: 'Jun', value: 480 },
    { month: 'Jul', value: 520 },
  ]
  const maxValue = Math.max(...chartData.map(d => d.value))

  return (
    <div className="space-y-8">

      {/* ══════ CABEÇALHO ══════ */}
      <div className="mb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Painel de Controle</h1>
        <p className="text-zinc-400 text-sm md:text-base">Bem-vindo ao MaxxControl X. Selecione uma ferramenta para começar.</p>
      </div>

      {/* ══════ CARDS DE MÉTRICAS ══════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, index) => (
          <div
            key={index}
            className="relative bg-dark-800 rounded-2xl p-6 overflow-hidden group hover:scale-[1.02] transition-all duration-300 border border-dark-700 hover:border-dark-600"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
          >
            {/* Glow base */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
            {/* Gradiente bg */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-60`} />
            {/* Conteúdo */}
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl border ${card.iconBg}`}>
                  <card.icon className={card.iconColor} size={22} />
                </div>
              </div>
              <p className="text-zinc-400 text-sm mb-1">{card.title}</p>
              <p className="text-3xl font-bold text-white">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ══════ GRID DE FERRAMENTAS (ESTILO GERADOR PREMIUM) ══════ */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-brand-500 rounded-full inline-block" />
          Ferramentas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {toolCards.map((tool, index) => (
            <Link
              key={index}
              to={tool.path}
              className={`glass-effect p-5 rounded-2xl cursor-pointer group relative overflow-hidden border border-dark-700 ${tool.hoverBorder} transition-all duration-300 hover:shadow-xl ${tool.hoverShadow} hover:-translate-y-1`}
            >
              {/* Ícone de fundo decorativo */}
              <div className="absolute top-0 right-0 p-4 opacity-[0.04] group-hover:opacity-[0.08] transition transform group-hover:scale-110 duration-500">
                <tool.icon size={80} />
              </div>

              {/* Header do card */}
              <div className="flex justify-between items-start mb-3">
                <div className={`h-11 w-11 rounded-xl border flex items-center justify-center text-lg ${tool.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                  <tool.icon size={20} className={tool.iconColor} />
                </div>
                {tool.badge && (
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border animate-pulse ${tool.badgeColor}`}>
                    {tool.badge}
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold mb-1 text-zinc-100">{tool.title}</h3>
              <p className="text-xs text-zinc-500 mb-4 leading-relaxed">{tool.description}</p>

              <span className={`${tool.textColor} text-xs font-semibold flex items-center group-hover:translate-x-1 transition-transform duration-200`}>
                {tool.cta}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ══════ GRÁFICO DE VENDAS ══════ */}
      <div className="bg-dark-800 rounded-2xl p-6 md:p-8 relative overflow-hidden border border-dark-700" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-white">Evolução das Vendas</h2>
              <p className="text-zinc-500 text-xs mt-1">Últimos 7 meses</p>
            </div>
            <Link
              to="/resale"
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-all duration-300 font-semibold text-sm shadow-lg shadow-brand-500/20 hover:scale-105"
            >
              <UserPlus size={16} />
              Criar Usuário
            </Link>
          </div>

          {/* Gráfico SVG */}
          <div className="relative h-64">
            {/* Grid */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[500, 400, 300, 200, 100, 0].map((value) => (
                <div key={value} className="flex items-center">
                  <span className="text-zinc-600 text-xs w-10 font-mono">{value}</span>
                  <div className="flex-1 h-px bg-dark-700/60" />
                </div>
              ))}
            </div>

            {/* SVG Chart */}
            <svg className="absolute inset-0 w-full h-full" style={{ paddingLeft: '40px' }}>
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FC5F16" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#FC5F16" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`M 0 ${256 - (chartData[0].value / maxValue) * 220} ${chartData.map((d, i) =>
                  `L ${(i / (chartData.length - 1)) * 100}% ${256 - (d.value / maxValue) * 220}`
                ).join(' ')} L 100% 256 L 0 256 Z`}
                fill="url(#lineGradient)"
              />
              <path
                d={`M 0 ${256 - (chartData[0].value / maxValue) * 220} ${chartData.map((d, i) =>
                  `L ${(i / (chartData.length - 1)) * 100}% ${256 - (d.value / maxValue) * 220}`
                ).join('')}`}
                fill="none"
                stroke="#FC5F16"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {chartData.map((d, i) => (
                <g key={i}>
                  <circle cx={`${(i / (chartData.length - 1)) * 100}%`} cy={256 - (d.value / maxValue) * 220} r="5" fill="#FC5F16" />
                  <circle cx={`${(i / (chartData.length - 1)) * 100}%`} cy={256 - (d.value / maxValue) * 220} r="2.5" fill="white" />
                </g>
              ))}
            </svg>

            {/* Labels dos meses */}
            <div className="absolute bottom-0 left-10 right-0 flex justify-between pt-2">
              {chartData.map((d, i) => (
                <span key={i} className="text-zinc-500 text-xs">{d.month}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Dashboard
