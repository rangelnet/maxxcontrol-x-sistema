import { useState, useEffect } from 'react'
import api from '../services/api'
import { Users, Smartphone, Bug, Activity } from 'lucide-react'

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

  const cards = [
    { title: 'Usuários Ativos', value: stats?.usuarios_ativos || 0, icon: Users, color: 'text-blue-500' },
    { title: 'Dispositivos', value: stats?.dispositivos_ativos || 0, icon: Smartphone, color: 'text-green-500' },
    { title: 'Bugs Pendentes', value: stats?.bugs_pendentes || 0, icon: Bug, color: 'text-red-500' },
    { title: 'Online Agora', value: online, icon: Activity, color: 'text-primary' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div key={card.title} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">{card.title}</p>
                <p className="text-3xl font-bold">{card.value}</p>
              </div>
              <card.icon className={`${card.color}`} size={40} />
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Logs das Últimas 24h</h2>
        <p className="text-gray-400">{stats?.logs_24h || 0} eventos registrados</p>
      </div>
    </div>
  )
}

export default Dashboard
