import { useState, useEffect } from 'react'
import { 
  Zap, Shield, Search, Activity, Cpu, 
  MessageSquare, Terminal, CheckCircle2, AlertCircle, Save, Play, RefreshCw, X 
} from 'lucide-react'
import api from '../services/api'

const NexusAgent = () => {
  const [logs, setLogs] = useState([])
  const [activeProtocols, setActiveProtocols] = useState(8)
  const [aiLoad, setAiLoad] = useState(12)

  // Configs do Agente VOD
  const [showConfig, setShowConfig] = useState(false)
  const [config, setConfig] = useState({
    dns_list: '',
    cron_schedule: '0 3 * * *',
    is_active: false,
    auto_approve_words: false
  })
  const [saving, setSaving] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [message, setMessage] = useState(null)

  // TMDB Dirty Words
  const [dirtyWords, setDirtyWords] = useState([])
  const [processingWords, setProcessingWords] = useState(false)

  useEffect(() => {
    loadConfig();
    fetchLogs();

    // Atualização em tempo real do load fake do sistema
    const loadInterval = setInterval(() => {
      setAiLoad(Math.floor(Math.random() * 15) + 5)
    }, 3000)

    // Polling de logs e palavras a cada 5s
    const logsInterval = setInterval(() => {
      fetchLogs();
      fetchDirtyWords();
    }, 5000)


    return () => {
      clearInterval(loadInterval)
      clearInterval(logsInterval)
    }
  }, [])

  const fetchDirtyWords = async () => {
    try {
      const res = await api.get('/api/agents/dirty-words');
      if (res.data && res.data.words) {
        setDirtyWords(res.data.words);
      }
    } catch(e) {}
  }

  const loadConfig = async () => {
    try {
      const res = await api.get('/api/agents/config');
      if (res.data && res.data.config) {
        setConfig(res.data.config)
        setActiveProtocols(res.data.config.is_active ? 12 : 8)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchLogs = async () => {
    try {
      const res = await api.get('/api/agents/logs');
      if (res.data && res.data.logs) {
        setLogs(res.data.logs)
      }
    } catch (e) {}
  }

  const handleSaveConfig = async () => {
    setSaving(true)
    try {
      await api.post('/api/agents/config', config);
      setMessage({ type: 'success', text: 'Configurações de Agente salvas com sucesso!' })
      setShowConfig(false)
      loadConfig()
      setTimeout(() => setMessage(null), 3000)
    } catch (e) {
      setMessage({ type: 'error', text: 'Falha ao salvar configurações.' })
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleForceScan = async () => {
    if(!window.confirm('Iniciar varredura intensiva agora? Isso forçará todas as requisições API!')) return;
    setScanning(true)
    try {
      await api.post('/api/agents/scan-now');
      setMessage({ type: 'success', text: 'Comando de Varredura enviado ao Kernel. Acompanhe os logs abaixo!' })
      setTimeout(() => setMessage(null), 4000)
    } catch (e) {
      setMessage({ type: 'error', text: 'Erro ao disparar varredura manual.' })
    } finally {
      setScanning(false)
    }
  }

  const handleClearLogs = async () => {
    if(!window.confirm('Limpar banco de logs do agente?')) return;
    try {
      await api.delete('/api/agents/logs');
      fetchLogs();
    } catch(e) {}
  }

  const handleUpdateWordStatus = async (id, status) => {
    try {
      await api.post(`/api/agents/dirty-words/${id}/status`, { status });
      setMessage({ type: 'success', text: `Palavra ${status === 'approved' ? 'Aprovada' : 'Ignorada'} com sucesso!` });
      setTimeout(() => setMessage(null), 3000);
      fetchDirtyWords();
    } catch (e) {
      setMessage({ type: 'error', text: 'Erro ao atualizar palavra.' });
    }
  }

  const handleApproveAllWords = async () => {
    if (!window.confirm('Deseja aprovar todas as palavras detectadas? Elas serão adicionadas ao Filtro Global do TMDB.')) return;
    setProcessingWords(true);
    try {
      const res = await api.post('/api/agents/dirty-words/approve-all');
      setMessage({ type: 'success', text: `${res.data.count} palavras aprovadas e enviadas ao Filtro Global!` });
      setTimeout(() => setMessage(null), 4000);
      fetchDirtyWords();
    } catch (e) {
      setMessage({ type: 'error', text: 'Erro ao aprovar todas as palavras.' });
    } finally {
      setProcessingWords(false);
    }
  }

  const agents = [
    {
      id: 'nexus_ai',
      name: 'Nexus AI (VOD Scanner)',
      role: 'Orquestrador Inteligente',
      description: 'Varre e cruza listas M3U ou bases Xtream em múltiplos servidores para detectar lançamentos de filmes e séries de forma automatizada.',
      status: config.is_active ? 'Online' : 'Inativo',
      icon: Cpu,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10 border-orange-500/20',
      action: () => setShowConfig(true)
    },
    {
      id: 'sentinela',
      name: 'Sentinela PRO',
      role: 'Guardião de Sistemas',
      description: 'Monitora a saúde do banco de dados, limpa logs antigos e protege contra injeções e falhas de conexão Xtream.',
      status: 'Patrulhando',
      icon: Shield,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10 border-blue-500/20',
      action: () => alert('A Configuração do Sentinela é automática pelo Kernel.')
    },
    {
      id: 'maxxchat',
      name: 'MaxxChat Bot',
      role: 'Agente de Atendimento',
      description: 'Gerencia fluxos de conversa no WhatsApp e automação de vendas via PIX 24/7.',
      status: 'Ativo',
      icon: MessageSquare,
      color: 'text-green-500',
      bg: 'bg-green-500/10 border-green-500/20',
      action: () => window.location.href = '/whatsapp-auto'
    }
  ]

  return (
    <div className="space-y-2 animate-fadeIn relative">
      
      {message && (
        <div className={`fixed top-2 right-4 z-50 flex items-center gap-2 px-2 py-1 rounded-md shadow-2xl border ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        } backdrop-blur-md`}>
          <CheckCircle2 className="h-5 w-5" />
          <p className="font-medium text-sm">{message.text}</p>
        </div>
      )}

      {/* ══ HEADER PREMIUM ══ */}
      <div className="relative p-6 rounded-3xl bg-dark-800 border border-dark-700 overflow-hidden shadow-xl shadow-black/20">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Zap size={120} className="text-orange-500 animate-pulse" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
             <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-md">
                <Cpu className="text-orange-500" size={32} />
             </div>
             <div>
                <h1 className="text-sm font-bold text-white">Centro de Agentes Nexus</h1>
                <p className="text-zinc-400">Inteligência Artificial e Automação Gerenciada</p>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
             <div className="bg-dark-900/50 p-2 rounded-md border border-dark-700 shadow-inner">
                <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Carga de Processamento</p>
                <div className="flex items-end gap-2">
                   <span className="text-sm font-bold text-white">{aiLoad}%</span>
                   <div className="flex-1 h-2 bg-dark-700 rounded-full mb-2 overflow-hidden">
                      <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: aiLoad + '%' }} />
                   </div>
                </div>
             </div>
             <div className="bg-dark-900/50 p-2 rounded-md border border-dark-700 shadow-inner">
                <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Protocolos Ativos</p>
                <div className="flex items-center gap-2">
                   <span className="text-sm font-bold text-white">{activeProtocols}</span>
                   <div className="flex gap-1">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className={`w-1 h-4 rounded-full ${i < activeProtocols ? 'bg-orange-500' : 'bg-dark-700'}`} />
                      ))}
                   </div>
                </div>
             </div>
             <div className="bg-dark-900/50 p-2 rounded-md border border-dark-700 shadow-inner">
                <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Status de Segurança</p>
                <div className="flex items-center gap-2 text-green-500">
                   <CheckCircle2 size={24} />
                   <span className="text-sm font-bold uppercase tracking-tight">Impenetrável</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* ══ CONFIGURAÇÃO CONDICIONAL (MODAL) ══ */}
      {showConfig && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2">
          <div className="bg-dark-800 border border-dark-600 rounded-md w-full max-w-3xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-dark-600 flex items-center justify-between bg-dark-850">
              <div className="flex items-center gap-2">
                <Cpu className="text-orange-500" />
                <h2 className="text-sm font-bold text-white">Setup: Varredura VOD Nexus</h2>
              </div>
              <button onClick={() => setShowConfig(false)} className="text-zinc-500 hover:text-white">
                <X />
              </button>
            </div>

            <div className="p-5 space-y-2">
              <div className="flex items-center gap-2 bg-dark-900 p-2 rounded-md border border-dark-700">
                <button 
                  onClick={() => setConfig({...config, is_active: !config.is_active})}
                  className={`w-9 h-6 rounded-full relative transition-colors ${config.is_active ? 'bg-orange-500' : 'bg-dark-600'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${config.is_active ? 'left-7' : 'left-1'}`} />
                </button>
                <div>
                  <h3 className="text-sm font-bold text-white">Ativar Robô Varredor</h3>
                  <p className="text-xs text-zinc-400">Permite que o Nexus AI rode rotinas automáticas de varredura.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-dark-900 p-2 rounded-md border border-dark-700">
                <button 
                  onClick={() => setConfig({...config, auto_approve_words: !config.auto_approve_words})}
                  className={`w-9 h-6 rounded-full relative transition-colors ${config.auto_approve_words ? 'bg-green-500' : 'bg-dark-600'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${config.auto_approve_words ? 'left-7' : 'left-1'}`} />
                </button>
                <div>
                  <h3 className="text-sm font-bold text-white">Auto-Aprovar Palavras Sujas (TMDB)</h3>
                  <p className="text-xs text-zinc-400">Todas as sujeiras e tags detectadas irão automaticamente para o filtro global, sem precisar aprovar manualmente.</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase mb-2 block">CRON Schedule (Frequência de Varredura)</label>
                <div className="flex gap-2">
                  <select 
                    value={config.cron_schedule}
                    onChange={(e) => setConfig({...config, cron_schedule: e.target.value})}
                    className="flex-1 bg-dark-900 border border-dark-600 text-white rounded-md p-2 text-sm focus:border-orange-500 outline-none"
                  >
                    <option value="0 3 * * *">Diário (Todo dia às 03:00 AM)</option>
                    <option value="0 */12 * * *">A cada 12 horas</option>
                    <option value="0 */6 * * *">A cada 6 horas</option>
                    <option value="0 * * * *">A cada hora (Exige muito do servidor)</option>
                  </select>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">O formato é baseado em Unix CRON. Use sabiamente para não sobrecarregar sua internet e CPU.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase mb-2 block">Endpoints de Varredura (DNS ou Chatbot API)</label>
                <textarea 
                  value={config.dns_list || ''}
                  onChange={(e) => setConfig({...config, dns_list: e.target.value})}
                  className="w-full bg-dark-900 border border-dark-600 text-white rounded-md p-2 text-sm focus:border-orange-500 outline-none font-mono resize-none h-32"
                  placeholder="Ex: https://megga99.shop/api/chatbot/xxxx, https://painel.primelux.cloud/api/chatbot/yyyy"
                />
                <p className="text-[11px] text-zinc-500 mt-1">Insira as URLs dos provedores, chatbots ou API de teste Xtream (Separadas por vírgula). O bot detectará as credenciais automaticamente e extrairá o Catálogo!</p>
              </div>
            </div>

            <div className="p-5 border-t border-dark-600 bg-dark-850 flex justify-end gap-2">
              <button onClick={() => setShowConfig(false)} className="px-5 py-1.5 text-sm font-bold text-zinc-400 hover:text-white transition">Cancelar</button>
              <button onClick={handleForceScan} disabled={scanning} className="px-5 py-1.5 bg-dark-700 border border-dark-600 text-white text-sm font-bold rounded-md hover:bg-dark-600 transition flex items-center gap-2">
                <Play size={16} className="text-green-500" /> {scanning ? 'Processando...' : 'Varrer Agora!'}
              </button>
              <button onClick={handleSaveConfig} disabled={saving} className="px-5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-md transition flex items-center gap-2">
                {saving ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save size={16} />} Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ AGENTES ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-dark-800 border border-dark-700 p-5 rounded-3xl hover:border-orange-500/30 transition-all group flex flex-col">
             <div className={`w-14 h-14 rounded-md flex items-center justify-center mb-2 border ${agent.bg}`}>
                <agent.icon className={agent.color} size={28} />
             </div>
             <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-bold text-white">{agent.name}</h3>
                <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-full ${agent.status === 'Online' || agent.status === 'Ativo' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                   {agent.status}
                </span>
             </div>
             <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">{agent.role}</p>
             <p className="text-xs text-zinc-400 leading-relaxed mb-2 flex-1">
                {agent.description}
             </p>
             <button onClick={agent.action} className="w-full py-1.5 bg-dark-900 border border-dark-700 rounded-md text-xs font-bold hover:bg-orange-500 hover:text-white transition-all mt-auto">
                Configurar Agente
             </button>
          </div>
        ))}
      </div>

      {/* ══ PALAVRAS DETECTADAS (TMDB FILTER) ══ */}
      <div className="bg-dark-800 border border-dark-700 rounded-3xl overflow-hidden shadow-xl shadow-black/20">
        <div className="p-5 border-b border-dark-700 flex justify-between items-center bg-dark-900/30">
           <div className="flex items-center gap-2">
              <Search className="text-orange-500" size={20} />
              <h2 className="text-sm font-bold text-white">Palavras detectadas pelo Scanner</h2>
           </div>
           <button 
              onClick={handleApproveAllWords} 
              disabled={processingWords || dirtyWords.filter(w => w.status === 'new').length === 0}
              className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold rounded-md transition"
           >
              {processingWords ? 'Processando...' : 'Adicionar Tudo'}
           </button>
        </div>
        <div className="p-0 overflow-x-auto max-h-80 overflow-y-auto custom-scrollbar">
           <table className="w-full text-left border-collapse">
              <thead className="bg-dark-900 text-[10px] uppercase text-zinc-500 font-bold sticky top-0 z-10">
                 <tr>
                    <th className="p-2 border-b border-dark-700">Palavra Detectada</th>
                    <th className="p-2 border-b border-dark-700">Qtd</th>
                    <th className="p-2 border-b border-dark-700">Exemplo de Título</th>
                    <th className="p-2 border-b border-dark-700">Origem</th>
                    <th className="p-2 border-b border-dark-700">Status</th>
                    <th className="p-2 border-b border-dark-700 text-right">Ação</th>
                 </tr>
              </thead>
              <tbody className="text-sm divide-y divide-dark-700">
                 {dirtyWords.length === 0 ? (
                   <tr><td colSpan="6" className="p-8 text-center text-zinc-500">Nenhuma palavra detectada ainda.</td></tr>
                 ) : dirtyWords.map(word => (
                   <tr key={word.id} className="hover:bg-dark-900/50 transition-colors">
                      <td className="p-2 font-mono text-orange-400 font-bold">{word.word}</td>
                      <td className="p-2 text-zinc-300 font-bold">{word.occurrences}</td>
                      <td className="p-2 text-zinc-400 text-xs truncate max-w-[200px]">{word.example_title}</td>
                      <td className="p-2 text-zinc-500 text-xs truncate max-w-[150px]">{word.source_dns}</td>
                      <td className="p-2">
                         <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                           word.status === 'new' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                           word.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                         }`}>
                            {word.status === 'new' ? 'Nova' : word.status === 'approved' ? 'Aprovada' : 'Ignorada'}
                         </span>
                      </td>
                      <td className="p-2 text-right flex justify-end gap-2">
                         {word.status === 'new' && (
                           <>
                              <button onClick={() => handleUpdateWordStatus(word.id, 'approved')} className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 hover:border-green-500/40 rounded-md transition" title="Aprovar">
                                 <CheckCircle2 size={16} />
                              </button>
                              <button onClick={() => handleUpdateWordStatus(word.id, 'ignored')} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/40 rounded-md transition" title="Ignorar">
                                 <X size={16} />
                              </button>
                           </>
                         )}
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>

      {/* ══ LOGS DO SISTEMA ══ */}
      <div className="bg-dark-800 border border-dark-700 rounded-3xl overflow-hidden shadow-xl shadow-black/20">
        <div className="p-5 border-b border-dark-700 flex justify-between items-center bg-dark-900/30">
           <div className="flex items-center gap-2">
              <Terminal className="text-orange-500" size={20} />
              <h2 className="text-sm font-bold text-white">Monitor de Operações Globais</h2>
           </div>
           <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-mono">sys.nexus.kernel_2.0</span>
              <button onClick={handleClearLogs} className="text-xs text-red-500 hover:text-red-400 font-bold bg-red-500/10 px-2 py-1 rounded">Limpar</button>
           </div>
        </div>
        <div className="p-2 bg-black/50 font-mono text-sm h-72 overflow-y-auto space-y-1 custom-scrollbar flex flex-col-reverse">
           {/* Mostrar input aguardando no fim (que como é reverse, fica no topo) */}
           <div className="flex gap-2 opacity-50 py-1.5">
              <span className="text-zinc-600">[{new Date().toLocaleTimeString()}]</span>
              <span className="text-orange-500 animate-pulse">_</span>
              <span className="text-zinc-500 italic">Aguardando comando operacional...</span>
           </div>

           {logs.map(log => (
             <div key={log.id} className="flex gap-2 animate-fadeIn py-1 border-b border-zinc-800/50 last:border-0 hover:bg-white/5 transition-colors">
                <span className="text-zinc-600 shrink-0">[{new Date(log.created_at).toLocaleTimeString()}]</span>
                <span className={`shrink-0 ${log.log_level === 'success' ? 'text-green-500' : log.log_level === 'error' ? 'text-red-500' : 'text-blue-400'}`}>
                   {log.log_level === 'success' ? '✔' : log.log_level === 'error' ? '✖' : 'ℹ'}
                </span>
                <span className="text-zinc-300">
                  {log.message}
                  {log.dns_source && log.dns_source !== 'N/A' && log.dns_source !== 'System' && (
                    <span className="text-xs text-zinc-600 ml-2">({log.dns_source.slice(0, 40)}...)</span>
                  )}
                </span>
             </div>
           ))}
        </div>
      </div>
    </div>
  )
}

export default NexusAgent
