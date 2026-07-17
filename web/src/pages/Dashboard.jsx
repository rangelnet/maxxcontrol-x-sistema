import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Users, Smartphone, TrendingUp, DollarSign, UserPlus, Tv, Wifi, Zap, Server, Activity, Image, ShoppingBag, Sparkles, ShieldAlert, Eye, CheckCircle2 } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [online, setOnline] = useState(0)

  // === MODAL DE SEGURANÇA MANDATÓRIO ===
  const [securityOpen, setSecurityOpen] = useState(false)
  const [securityCountdown, setSecurityCountdown] = useState(15)
  const [securityCanClose, setSecurityCanClose] = useState(false)
  const countdownRef = useRef(null)
  const delayRef = useRef(null)

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  // Protocolo de aviso de segurança
  useEffect(() => {
    if (!user?.id) return
    const storageKey = `security_warning_read_v2_${user.id}`
    const hasRead = localStorage.getItem(storageKey)
    if (!hasRead) {
      delayRef.current = setTimeout(() => {
        setSecurityOpen(true)
        setSecurityCountdown(15)
        setSecurityCanClose(false)
        let count = 15
        countdownRef.current = setInterval(() => {
          count--
          setSecurityCountdown(count)
          if (count <= 0) {
            setSecurityCanClose(true)
            clearInterval(countdownRef.current)
          }
        }, 1000)
      }, 10000) // 10s de delay
    }
    return () => {
      if (delayRef.current) clearTimeout(delayRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [user?.id])

  const confirmSecurityWarning = useCallback(() => {
    if (!securityCanClose) return
    const storageKey = `security_warning_read_v2_${user?.id}`
    localStorage.setItem(storageKey, 'true')
    setSecurityOpen(false)
  }, [securityCanClose, user?.id])

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
      value: stats?.receita_mes !== undefined ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.receita_mes) : 'R$ 0,00',
      icon: DollarSign,
      color: 'from-brand-500/20 to-transparent',
      iconColor: 'text-brand-500',
      iconBg: 'bg-brand-500/10 border-brand-500/20',
      link: '/finance'
    },
    {
      title: 'Usuários Ativos',
      value: stats?.usuarios_ativos !== undefined ? stats.usuarios_ativos.toLocaleString() : '0',
      icon: Users,
      color: 'from-blue-500/20 to-transparent',
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Dispositivos Online',
      value: online !== undefined ? online.toLocaleString() : '0',
      icon: Smartphone,
      color: 'from-green-500/20 to-transparent',
      iconColor: 'text-green-400',
      iconBg: 'bg-green-500/10 border-green-500/20',
    },
    {
      title: 'Crescimento',
      value: stats?.crescimento !== undefined 
        ? `${stats.crescimento >= 0 ? '+' : ''}${stats.crescimento.toFixed(1)}%` 
        : '0.0%',
      icon: TrendingUp,
      color: stats?.crescimento >= 0 ? 'from-emerald-500/20 to-transparent' : 'from-red-500/20 to-transparent',
      iconColor: stats?.crescimento >= 0 ? 'text-emerald-400' : 'text-red-400',
      iconBg: stats?.crescimento >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20',
    },
  ]

  // Grid de ferramentas estilo Gerador Premium
  const toolCards = [
    {
      title: 'Dispositivos',
      description: 'Gerencie e monitore todos os dispositivos e clientes conectados.',
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
      title: 'Versões & Logs',
      description: 'Controle versões do aplicativo e monitore erros e logs do sistema.',
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
    {
      title: 'Centro de Agentes',
      description: 'Monitore a inteligência artificial Nexus e os robôs de automação do sistema.',
      icon: Sparkles,
      iconColor: 'text-orange-400',
      iconBg: 'bg-orange-500/10 border-orange-500/20',
      hoverBorder: 'hover:border-orange-500/50',
      hoverShadow: 'hover:shadow-orange-500/10',
      textColor: 'text-orange-400',
      cta: 'Ver Agentes →',
      path: '/agents',
      badge: 'PRO',
      badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
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
    <div className="space-y-2">

      {/* ══════ CABEÇALHO ══════ */}
      <div className="mb-2">
        <h1 className="text-base md:text-sm font-bold text-white mb-1">Painel de Controle</h1>
        <p className="text-zinc-400 text-sm md:text-base">Bem-vindo ao MaxxControl X. Selecione uma ferramenta para começar.</p>
      </div>

      {/* ══════ AVISO DE SEGURANÇA 2FA ══════ */}
      {user && !user.tfa_enabled && (
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-500/10 via-brand-500/5 to-transparent border border-brand-500/20 rounded-md p-5 flex flex-col md:flex-row items-center justify-between gap-2 backdrop-blur-md shadow-xl animate-in slide-in-from-top-2 duration-500">
          <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
            <Sparkles size={120} className="text-brand-500" />
          </div>
          <div className="flex items-center gap-2 text-center md:text-left flex-col md:flex-row">
            <div className="h-8 w-8 rounded-md bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-500 shrink-0 animate-pulse">
              <Sparkles size={22} className="fill-current" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base flex items-center gap-2 justify-center md:justify-start">
                🔒 Proteja sua Conta com Duas Etapas (2FA)
              </h3>
              <p className="text-zinc-400 text-xs mt-1 max-w-xl">
                Sua conta está desprotegida contra invasões. Habilite a autenticação por código via Telegram em menos de 1 minuto para blindar seus créditos e revendedores.
              </p>
            </div>
          </div>
          <Link
            to="/settings"
            className="w-full md:w-auto px-6 py-1.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white rounded-md text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
          >
            Configurar Segurança Agora
          </Link>
        </div>
      )}

      {/* ══════ CARDS DE MÉTRICAS ══════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {metricCards.map((card, index) => {
          const CardWrapper = card.link ? Link : 'div'
          return (
            <CardWrapper
              key={index}
              to={card.link}
              className="relative bg-dark-800 rounded-md p-5 overflow-hidden group hover:scale-[1.02] transition-all duration-300 border border-dark-700 hover:border-dark-600 block"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
            >
              {/* Glow base */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
              {/* Gradiente bg */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-60`} />
              {/* Conteúdo */}
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-2 rounded-md border ${card.iconBg}`}>
                    <card.icon className={card.iconColor} size={22} />
                  </div>
                </div>
                <p className="text-zinc-400 text-sm mb-1">{card.title}</p>
                <p className="text-sm font-bold text-white">{card.value}</p>
              </div>
            </CardWrapper>
          )
        })}
      </div>

      {/* ══════ GRID DE FERRAMENTAS (ESTILO GERADOR PREMIUM) ══════ */}
      <div>
        <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-brand-500 rounded-full inline-block" />
          Ferramentas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {toolCards.map((tool, index) => (
            <Link
              key={index}
              to={tool.path}
              className={`glass-effect p-5 rounded-md cursor-pointer group relative overflow-hidden border border-dark-700 ${tool.hoverBorder} transition-all duration-300 hover:shadow-xl ${tool.hoverShadow} hover:-translate-y-1`}
            >
              {/* Ícone de fundo decorativo */}
              <div className="absolute top-0 right-0 p-2 opacity-[0.04] group-hover:opacity-[0.08] transition transform group-hover:scale-110 duration-500">
                <tool.icon size={80} />
              </div>

              {/* Header do card */}
              <div className="flex justify-between items-start mb-2">
                <div className={`h-8 w-8 rounded-md border flex items-center justify-center text-base ${tool.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                  <tool.icon size={20} className={tool.iconColor} />
                </div>
                {tool.badge && (
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border animate-pulse ${tool.badgeColor}`}>
                    {tool.badge}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold mb-1 text-zinc-100">{tool.title}</h3>
              <p className="text-xs text-zinc-500 mb-2 leading-relaxed">{tool.description}</p>

              <span className={`${tool.textColor} text-xs font-semibold flex items-center group-hover:translate-x-1 transition-transform duration-200`}>
                {tool.cta}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ══════ GRÁFICO DE VENDAS ══════ */}
      <div className="bg-dark-800 rounded-md p-2.5 md:p-2 relative overflow-hidden border border-dark-700" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2 sm:gap-0">
            <div>
              <h2 className="text-sm font-bold text-white">Evolução das Vendas</h2>
              <p className="text-zinc-500 text-xs mt-1">Últimos 7 meses</p>
            </div>
            <Link
              to="/resale"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-md transition-all duration-300 font-semibold text-sm shadow-lg shadow-brand-500/20 hover:scale-105"
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
                  <span className="text-zinc-600 text-xs w-9 font-mono">{value}</span>
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

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 🔒 MODAL DE SEGURANÇA MANDATÓRIO — NOTIFICAÇÃO DO ADMIN */}
      {/* ═══════════════════════════════════════════════════════ */}
      {securityOpen && createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/95 backdrop-blur-md flex items-center justify-center p-2 animate-in fade-in duration-300">
          <div className="bg-zinc-950 border-2 border-red-600 w-full max-w-lg rounded-md shadow-[0_0_60px_rgba(220,38,38,0.4)] overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-500">
            {/* Faixa Vermelha Piscante no Topo */}
            <div className="h-2 w-full bg-red-600 animate-pulse" />

            <div className="p-2 md:p-2 text-center">
              {/* Ícone Escudo */}
              <div className="mb-2 inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-600/10 border border-red-600/50 mx-auto">
                <ShieldAlert className="h-8 w-8 text-red-500 animate-pulse" />
              </div>

              <h2 className="text-base md:text-sm font-black text-white mb-1 uppercase tracking-tight">
                Notificação do <span className="text-red-500">Administrador</span>
              </h2>

              <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Leitura Obrigatória
              </p>

              {/* Corpo do Aviso */}
              <div className="bg-red-950/30 border border-red-900/50 p-5 rounded-md text-left mb-2">
                <p className="text-zinc-300 text-sm leading-relaxed mb-2">
                  <strong className="text-white flex items-center gap-2 mb-2">
                    <span className="text-red-500">⚠️</span> Aviso Importante:
                  </strong>
                  Qualquer tentativa de <strong>burlar, explorar vulnerabilidades, manipular requisições</strong> ou agir de má-fé dentro deste painel será detectada pelos nossos sistemas de segurança.
                </p>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  Caso qualquer atividade suspeita seja identificada, <strong>sua conta será banida permanentemente e imediatamente</strong>, sem aviso prévio e sem reembolso de créditos.
                </p>
                <p className="text-zinc-400 text-sm leading-relaxed mt-2 italic">
                  Essas medidas existem para garantir a segurança da plataforma e de todos os usuários.
                </p>
                <p className="text-red-400 text-xs font-bold mt-2 border-t border-red-900/50 pt-3 flex items-center gap-2">
                  <Eye className="h-4 w-4" /> O sistema possui logs de monitoramento ativos.
                </p>
              </div>

              {/* Botão com Countdown */}
              <button
                onClick={confirmSecurityWarning}
                disabled={!securityCanClose}
                className={`w-full py-1.5 rounded-md font-black text-sm uppercase tracking-wide transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 ${
                  securityCanClose
                    ? 'bg-white text-black hover:bg-zinc-200 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                }`}
              >
                {!securityCanClose ? (
                  <span>Leia o aviso ({securityCountdown}s)</span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Li e Concordo
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  )
}

export default Dashboard
