import { useState, useEffect } from 'react'
import { 
  Zap, Shield, Search, Activity, Cpu, 
  MessageSquare, Terminal, CheckCircle2, AlertCircle 
} from 'lucide-react'
import api from '../services/api'

const NexusAgent = () => {
  const [logs, setLogs] = useState([
    { id: 1, type: 'info', msg: 'Protocolo Nexus ativado.', time: 'Agora' },
    { id: 2, type: 'success', msg: 'Monitoramento de latência iniciado.', time: '1m atrás' },
    { id: 3, type: 'info', msg: 'Agente Sentinela em patrulha (Módulo DB).', time: '5m atrás' }
  ])
  const [activeProtocols, setActiveProtocols] = useState(8)
  const [aiLoad, setAiLoad] = useState(12)

  useEffect(() => {
    const interval = setInterval(() => {
      setAiLoad(Math.floor(Math.random() * 15) + 5)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const agents = [
    {
      name: 'Nexus AI',
      role: 'Orquestrador Inteligente',
      description: 'Responsável pela integração global, análise de dados em tempo real e auxílio ao administrador.',
      status: 'Online',
      icon: Cpu,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10 border-orange-500/20'
    },
    {
      name: 'Sentinela PRO',
      role: 'Guardião de Sistemas',
      description: 'Monitora a saúde do banco de dados, limpa logs antigos e protege contra injeções e falhas.',
      status: 'Patrulhando',
      icon: Shield,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      name: 'MaxxChat Bot',
      role: 'Agente de Atendimento',
      description: 'Gerencia fluxos de conversa no WhatsApp e automação de vendas via PIX.',
      status: 'Standby',
      icon: MessageSquare,
      color: 'text-green-500',
      bg: 'bg-green-500/10 border-green-500/20'
    }
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ══ HEADER PREMIUM ══ */}
      <div className="relative p-8 rounded-3xl bg-dark-800 border border-dark-700 overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Zap size={120} className="text-orange-500 animate-pulse" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                <Cpu className="text-orange-500" size={32} />
             </div>
             <div>
                <h1 className="text-3xl font-bold text-white">Centro de Agentes Nexus</h1>
                <p className="text-zinc-400">Inteligência Artificial e Automação Gerenciada</p>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
             <div className="bg-dark-900/50 p-4 rounded-2xl border border-dark-700">
                <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Carga de Processamento</p>
                <div className="flex items-end gap-2">
                   <span className="text-2xl font-bold text-white">{aiLoad}%</span>
                   <div className="flex-1 h-2 bg-dark-700 rounded-full mb-2 overflow-hidden">
                      <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${aiLoad}%` }} />
                   </div>
                </div>
             </div>
             <div className="bg-dark-900/50 p-4 rounded-2xl border border-dark-700">
                <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Protocolos Ativos</p>
                <div className="flex items-center gap-2">
                   <span className="text-2xl font-bold text-white">{activeProtocols}</span>
                   <div className="flex gap-1">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className={`w-1 h-4 rounded-full ${i < activeProtocols ? 'bg-orange-500' : 'bg-dark-700'}`} />
                      ))}
                   </div>
                </div>
             </div>
             <div className="bg-dark-900/50 p-4 rounded-2xl border border-dark-700">
                <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Status de Segurança</p>
                <div className="flex items-center gap-2 text-green-500">
                   <CheckCircle2 size={24} />
                   <span className="text-xl font-bold uppercase tracking-tight">Impenetrável</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* ══ AGENTES ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {agents.map((agent, i) => (
          <div key={i} className="bg-dark-800 border border-dark-700 p-6 rounded-3xl hover:border-orange-500/30 transition-all group">
             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border ${agent.bg}`}>
                <agent.icon className={agent.color} size={28} />
             </div>
             <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white">{agent.name}</h3>
                <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-bold border border-green-500/20 rounded-full">
                   {agent.status}
                </span>
             </div>
             <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-3">{agent.role}</p>
             <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                {agent.description}
             </p>
             <button className="w-full py-3 bg-dark-900 border border-dark-700 rounded-2xl text-xs font-bold hover:bg-orange-500 hover:text-white transition-all">
                Configurar Agente
             </button>
          </div>
        ))}
      </div>

      {/* ══ LOGS DO SISTEMA ══ */}
      <div className="bg-dark-800 border border-dark-700 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-dark-700 flex justify-between items-center bg-dark-900/30">
           <div className="flex items-center gap-2">
              <Terminal className="text-orange-500" size={20} />
              <h2 className="text-lg font-bold text-white">Monitor de Operações</h2>
           </div>
           <span className="text-xs text-zinc-500 font-mono">system.agent_nexus.v1.0.4</span>
        </div>
        <div className="p-4 bg-black/40 font-mono text-sm h-64 overflow-y-auto space-y-2 custom-scrollbar">
           {logs.map(log => (
             <div key={log.id} className="flex gap-3 animate-in slide-in-from-left-2 duration-300">
                <span className="text-zinc-600">[{log.time}]</span>
                <span className={log.type === 'success' ? 'text-green-500' : 'text-blue-400'}>
                   {log.type === 'success' ? '✔' : 'ℹ'}
                </span>
                <span className="text-zinc-300">{log.msg}</span>
             </div>
           ))}
           <div className="flex gap-3 opacity-50">
              <span className="text-zinc-600">[{new Date().toLocaleTimeString()}]</span>
              <span className="text-orange-500 animate-pulse">_</span>
              <span className="text-zinc-500 italic">Aguardando comando operacional...</span>
           </div>
        </div>
      </div>
    </div>
  )
}

export default NexusAgent
