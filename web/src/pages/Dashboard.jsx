import { useState, useEffect } from 'react'
import api from '../services/api'
import { Users, Smartphone, TrendingUp, DollarSign, UserPlus } from 'lucide-react'

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

  // Dados simulados para o gráfico (em produção, viriam da API)
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

  const cards = [
    { 
      title: 'Receita do Mês', 
      value: 'R$ 25.430', 
      icon: DollarSign, 
      gradient: 'from-orange-500/20 to-transparent'
    },
    { 
      title: 'Usuários Ativos', 
      value: stats?.usuarios_ativos || 8120, 
      icon: Users, 
      gradient: 'from-orange-500/20 to-transparent'
    },
    { 
      title: 'Dispositivos Conectados', 
      value: online || 2345, 
      icon: Smartphone, 
      gradient: 'from-orange-500/20 to-transparent'
    },
    { 
      title: 'Crescimento', 
      value: '+12.5%', 
      icon: TrendingUp, 
      gradient: 'from-orange-500/20 to-transparent'
    },
  ]

  return (
    <div className="space-y-8">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div 
            key={index}
            className="relative bg-[#1A1A1A] rounded-2xl p-6 overflow-hidden group hover:scale-105 transition-transform duration-300"
            style={{
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Glow laranja na base */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF4D33] to-transparent opacity-60"></div>
            
            {/* Gradiente de fundo */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50`}></div>
            
            {/* Conteúdo */}
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-[#FF4D33]/10 rounded-xl">
                  <card.icon className="text-[#FF4D33]" size={24} />
                </div>
              </div>
              
              <p className="text-gray-400 text-sm mb-2">{card.title}</p>
              <p className="text-4xl font-bold text-white">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico de Evolução das Vendas */}
      <div className="bg-[#1A1A1A] rounded-2xl p-8 relative overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}>
        {/* Gradiente de fundo */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent"></div>
        
        <div className="relative z-10">
          {/* Header do Gráfico */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Evolução das Vendas</h2>
            <button className="flex items-center gap-2 px-6 py-3 bg-[#FF4D33] hover:bg-[#ff6347] text-white rounded-xl transition-colors duration-300 font-semibold shadow-lg shadow-orange-500/20">
              <UserPlus size={20} />
              Criar Usuário
            </button>
          </div>

          {/* Gráfico */}
          <div className="relative h-80">
            {/* Grid de fundo */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[500, 400, 300, 200, 100, 0].map((value) => (
                <div key={value} className="flex items-center">
                  <span className="text-gray-500 text-sm w-12">{value}</span>
                  <div className="flex-1 h-px bg-gray-800/50"></div>
                </div>
              ))}
            </div>

            {/* Linha do gráfico */}
            <svg className="absolute inset-0 w-full h-full" style={{ paddingLeft: '48px' }}>
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FF4D33" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#FF4D33" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Área preenchida */}
              <path
                d={`M 0 ${320 - (chartData[0].value / maxValue) * 280} ${chartData.map((d, i) => 
                  `L ${(i / (chartData.length - 1)) * 100}% ${320 - (d.value / maxValue) * 280}`
                ).join(' ')} L 100% 320 L 0 320 Z`}
                fill="url(#lineGradient)"
              />
              
              {/* Linha */}
              <path
                d={`M 0 ${320 - (chartData[0].value / maxValue) * 280} ${chartData.map((d, i) => 
                  `L ${(i / (chartData.length - 1)) * 100}% ${320 - (d.value / maxValue) * 280}`
                ).join(' ')}`}
                fill="none"
                stroke="#FF4D33"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Pontos */}
              {chartData.map((d, i) => (
                <g key={i}>
                  <circle
                    cx={`${(i / (chartData.length - 1)) * 100}%`}
                    cy={320 - (d.value / maxValue) * 280}
                    r="6"
                    fill="#FF4D33"
                    className="drop-shadow-lg"
                  />
                  <circle
                    cx={`${(i / (chartData.length - 1)) * 100}%`}
                    cy={320 - (d.value / maxValue) * 280}
                    r="3"
                    fill="white"
                  />
                </g>
              ))}
            </svg>

            {/* Labels dos meses */}
            <div className="absolute bottom-0 left-12 right-0 flex justify-between pt-4">
              {chartData.map((d, i) => (
                <span key={i} className="text-gray-400 text-sm">{d.month}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
