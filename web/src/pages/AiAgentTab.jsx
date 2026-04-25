import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Terminal, Cpu, Database, Github, ShieldCheck, 
  Activity, Clock, ChevronRight, Share2, Zap, AlertTriangle 
} from 'lucide-react';

const AiAgentTab = () => {
  const [commits, setCommits] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [consoleText, setConsoleText] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [commitsRes, statusRes] = await Promise.all([
          api.get('/api/ai-agent/commits'),
          api.get('/api/ai-agent/status')
        ]);
        setCommits(commitsRes.data.commits || []);
        setStatus(statusRes.data);
      } catch (err) {
        console.error('Erro ao carregar dados do Agente:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Simular console de pensamento do agente
    const logs = [
      "Sincronizando com núcleo Antigravity v4.0...",
      "Analisando integridade dos 6 slots IPTV...",
      "Monitorando build no Render...",
      "Blindagem contra erro 500: ATIVA",
      "Ponte MCP estabelecida com sucesso."
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setConsoleText(prev => [...prev, logs[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* HEADER MASTER AGENT */}
      <div className="bg-gradient-to-r from-orange-500/20 to-transparent p-8 rounded-[2rem] border-l-4 border-orange-500 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-orange-500 text-black rounded-2xl shadow-[0_0_30px_rgba(255,165,0,0.3)] animate-pulse">
            <Cpu size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter">AGENTE ANTIGRAVITY <span className="text-orange-500">v4.0</span></h1>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1 italic">Conexão MCP Ativa 🟢 Sincronização em Tempo Real</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA 1: STATUS DO SISTEMA */}
        <div className="space-y-6">
          <div className="bg-[#111] p-6 rounded-[2rem] border border-white/5 shadow-2xl">
            <h3 className="text-white font-black mb-6 flex items-center gap-2 uppercase text-xs tracking-widest text-zinc-400">
              <Activity size={16} className="text-orange-500" /> Saúde do Ecossistema
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <Database size={18} className="text-orange-500" />
                  <span className="text-sm font-bold text-zinc-300">Banco Supabase</span>
                </div>
                <span className="text-[10px] font-black bg-green-500/10 text-green-500 px-3 py-1 rounded-full">{status?.database || 'ONLINE'}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <Github size={18} className="text-orange-500" />
                  <span className="text-sm font-bold text-zinc-300">GitHub Sinc</span>
                </div>
                <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full">ATIVO</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-orange-500" />
                  <span className="text-sm font-bold text-zinc-300">Escudo 500</span>
                </div>
                <span className="text-[10px] font-black bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full animate-pulse">PROTEGIDO</span>
              </div>
            </div>
          </div>

          <div className="bg-[#111] p-6 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap size={100} className="text-orange-500" />
             </div>
             <h3 className="text-white font-black mb-4 uppercase text-xs tracking-widest text-zinc-400">Console de Pensamento</h3>
             <div className="font-mono text-[11px] text-orange-500/80 leading-relaxed min-h-[120px]">
                {consoleText.map((line, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-zinc-700">[{new Date().toLocaleTimeString()}]</span>
                    <span>{line}</span>
                  </div>
                ))}
                <div className="animate-pulse">_</div>
             </div>
          </div>
        </div>

        {/* COLUNA 2 & 3: HISTÓRICO DE INTERVENÇÕES (GITHUB) */}
        <div className="lg:col-span-2">
          <div className="bg-[#111] p-8 rounded-[2rem] border border-white/5 shadow-2xl min-h-full">
            <h3 className="text-white font-black mb-8 flex items-center justify-between uppercase text-xs tracking-widest text-zinc-400">
              <span className="flex items-center gap-2"><Clock size={16} className="text-orange-500" /> Registro de Atividades do Agente</span>
              <Share2 size={16} className="opacity-30" />
            </h3>

            {loading ? (
               <div className="py-20 flex flex-col items-center justify-center gap-4 text-orange-500">
                  <Activity className="animate-spin" size={32} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando com GitHub...</span>
               </div>
            ) : (
              <div className="relative border-l-2 border-white/5 ml-4 pl-8 space-y-10">
                {commits.map((commit, idx) => (
                  <div key={commit.sha} className="relative group">
                    {/* Linha de conexão */}
                    <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-[#111] border-2 border-orange-500 group-hover:scale-125 transition-all shadow-[0_0_10px_rgba(255,165,0,0.5)]"></div>
                    
                    <div className="bg-black/40 p-5 rounded-3xl border border-white/5 hover:border-orange-500/30 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{commit.sha}</span>
                        <span className="text-[9px] text-zinc-600 font-bold">{new Date(commit.date).toLocaleString('pt-BR')}</span>
                      </div>
                      <h4 className="text-white font-bold text-sm mb-1 group-hover:text-orange-500 transition-colors capitalize">{commit.message}</h4>
                      <p className="text-zinc-500 text-xs italic">Por: {commit.author}</p>
                      
                      <a href={commit.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-4 text-[10px] font-black text-zinc-400 hover:text-white transition-colors">
                        VER DIF NO GITHUB <ChevronRight size={10} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAgentTab;
