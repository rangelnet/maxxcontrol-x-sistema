import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { Tv, Film, Clapperboard, RefreshCw, Search, ChevronRight, ChevronDown, Loader, Settings, Monitor, ClipboardList, Star } from 'lucide-react';

const IptvTreeViewer = () => {
  const [providers, setProviders] = useState([]);
  const [activeSlot, setActiveSlot] = useState(1);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [showConfig, setShowConfig] = useState(false);
  const [editProvider, setEditProvider] = useState(null);

  const fetchProviders = useCallback(async () => {
    try {
      setLoadingProviders(true);
      const res = await api.get('/iptv-server/providers');
      setProviders(res.data || []);
    } catch (err) { console.error('Erro provedores:', err); }
    finally { setLoadingProviders(false); }
  }, []);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  const currentProvider = useMemo(() => 
    providers.find(p => p.slot_index === activeSlot) || { name: `Slot ${activeSlot}`, url: '', username: '', password: '' },
    [providers, activeSlot]
  );

  const loadRoot = async () => {
    if (!currentProvider.id) return;
    setLoading(true);
    setTreeData([]);
    try {
      const res = await api.get('/iptv-tree/categories/live', { params: { provider_id: currentProvider.id } });
      if (res.data && res.data.success) setTreeData(res.data.data);
    } catch (err) { console.error('Erro categorias:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadRoot(); }, [activeSlot, currentProvider.id]);

  const toggleNode = async (node) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(node.id)) { newExpanded.delete(node.id); setExpandedNodes(newExpanded); return; }
    newExpanded.add(node.id); setExpandedNodes(newExpanded);
    if (!node.children || node.children.length === 0) {
      try {
        const res = await api.get(`/iptv-tree/streams/live/${node.category_id}`, { params: { provider_id: currentProvider.id } });
        if (res.data && res.data.success) {
          setTreeData(prev => prev.map(n => n.id === node.id ? { ...n, children: res.data.data } : n));
        }
      } catch (err) { console.error('Erro conteúdo:', err); }
    }
  };

  const addToCuration = async (item) => {
    try {
      await api.post('/iptv-server/curation', {
        type: 'vod',
        title: item.name,
        external_id: item.stream_id || item.id,
        poster_path: item.stream_icon,
        provider_id: currentProvider.id
      });
      alert('🎬 Adicionado à Fábrica de Banners!');
    } catch (err) { alert('Erro na curadoria'); }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      if (!editProvider.id) {
         await api.post('/iptv-server/providers', editProvider);
      } else {
         await api.put(`/iptv-server/providers/${editProvider.id}`, editProvider);
      }
      setShowConfig(false);
      fetchProviders();
    } catch (err) { alert('Erro ao salvar'); }
  };

  return (
    <div className="p-6 bg-[#050505] min-h-screen text-white">
      <div className="flex gap-4 mb-8 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-orange-500/20">
        {[1,2,3,4,5,6].map(i => {
          const p = providers.find(x => x.slot_index === i);
          const active = activeSlot === i;
          return (
            <button key={i} onClick={() => setActiveSlot(i)} className={`flex-shrink-0 w-44 p-5 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center gap-2 group ${active ? 'bg-orange-500/10 border-orange-500 text-orange-500 shadow-[0_0_25px_rgba(255,165,0,0.15)] scale-105' : 'bg-[#111] border-white/5 text-zinc-500 hover:border-white/10'}`}>
              <div className={`p-3 rounded-2xl ${active ? 'bg-orange-500 text-black' : 'bg-[#222] group-hover:bg-[#333]'}`}><Monitor size={24} /></div>
              <div className="font-black text-[12px] uppercase tracking-wider">{p?.name || `SERVIDOR ${i}`}</div>
              {active && <div className="text-[9px] font-black bg-orange-500 text-black px-2 py-0.5 rounded-full animate-pulse">MASTER ACTIVE</div>}
            </button>
          )
        })}
        <button onClick={() => { setEditProvider(currentProvider); setShowConfig(true); }} className="flex-shrink-0 w-16 bg-[#181818] border border-white/5 rounded-3xl flex items-center justify-center hover:bg-orange-500 hover:text-black transition-all"><Settings size={22} /></button>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-4">
            <span className="p-3 bg-orange-500 text-black rounded-2xl shadow-[0_0_20px_rgba(255,165,0,0.3)]"><Star size={24} fill="currentColor" /></span>
            CURADORIA MASTER <span className="text-orange-500">IPTV</span>
          </h1>
          <p className="text-zinc-500 mt-2 font-medium">Selecione um dos 6 provedores e escolha conteúdos para o marketing.</p>
        </div>
        <button onClick={loadRoot} className="px-6 py-3 bg-[#111] border border-white/10 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-white/5 transition-colors">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> ATUALIZAR LISTA
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
        <div className="lg:col-span-12">
          <div className="bg-[#111] rounded-[2rem] p-6 border border-white/5 shadow-2xl relative overflow-hidden group">
            {loadingProviders ? (
              <div className="py-40 flex flex-col items-center justify-center gap-4">
                <Loader className="animate-spin text-orange-500" size={48} />
                <p className="text-zinc-500 font-bold animate-pulse">SINCRONIZANDO AGENTES...</p>
              </div>
            ) : (
              <div className="space-y-2 relative z-10">
                {treeData.length === 0 && !loading && (
                   <div className="py-20 text-center">
                      <Tv size={48} className="text-orange-500/20 mx-auto mb-4" />
                      <h3 className="text-white font-bold text-lg">Nenhum canal encontrado</h3>
                      <p className="text-zinc-500">Configure os dados do servidor clicando na engrenagem no topo.</p>
                   </div>
                )}
                {loading ? (
                   <div className="py-40 text-center flex flex-col items-center gap-4">
                      <Loader className="animate-spin text-orange-500" size={32} />
                      <p className="text-sm font-black text-orange-500 uppercase tracking-widest">Acessando Servidor {activeSlot}...</p>
                   </div>
                ) : (
                  treeData.map(node => (
                    <div key={node.id} className="border-b border-white/5 last:border-0 pb-1">
                      <div onClick={() => toggleNode(node)} className={`flex items-center p-4 cursor-pointer hover:bg-white/5 rounded-2xl transition-all group ${expandedNodes.has(node.id) ? 'bg-white/5' : ''}`}>
                        <div className={`p-2 rounded-lg mr-4 ${expandedNodes.has(node.id) ? 'bg-orange-500 text-black' : 'bg-[#222] text-zinc-500'}`}>{expandedNodes.has(node.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</div>
                        <span className="flex-1 font-bold text-zinc-200 group-hover:text-white transition-colors">{node.category_name || node.name}</span>
                        <div className="px-3 py-1 bg-zinc-800 text-zinc-500 text-[10px] font-bold rounded-lg uppercase">Categoria</div>
                      </div>
                      {expandedNodes.has(node.id) && node.children && (
                        <div className="ml-12 py-4 mr-4 grid grid-cols-1 md:grid-cols-2 gap-3 border-l-2 border-orange-500/20 pl-6">
                          {node.children.map(child => (
                            <div key={child.id} className="flex items-center p-3 bg-white/5 hover:bg-white/10 rounded-2xl gap-4 border border-transparent hover:border-orange-500/20 transition-all group/item">
                              <div className="w-10 h-10 rounded-xl bg-black/40 overflow-hidden flex-shrink-0 border border-white/10">{child.stream_icon ? <img src={child.stream_icon} className="w-full h-full object-cover" alt="" /> : <Film size={20} className="m-2.5 text-zinc-600" />}</div>
                              <span className="flex-1 text-zinc-300 text-sm font-bold truncate group-hover/item:text-white">{child.name}</span>
                              <button onClick={(e) => { e.stopPropagation(); addToCuration(child); }} className="px-4 py-2 bg-orange-500 text-black text-[10px] font-black rounded-xl uppercase hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-500/10">🎬 + Banner</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showConfig && editProvider && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center z-50 p-6">
          <form onSubmit={handleSaveConfig} className="bg-[#111] p-10 rounded-[2.5rem] border-2 border-orange-500/30 w-full max-w-lg space-y-6 shadow-[0_0_100px_rgba(255,165,0,0.1)] relative">
            <h2 className="text-white font-black text-3xl uppercase tracking-tighter">Configurar Slot {activeSlot}</h2>
            <div className="space-y-4">
               <input className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-orange-500 transition-colors font-bold" value={editProvider.name || ''} onChange={e=>setEditProvider({...editProvider, name: e.target.value})} placeholder="Ex: Servidor VIP" />
               <input className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-orange-500 transition-colors font-mono text-sm" value={editProvider.url || ''} onChange={e=>setEditProvider({...editProvider, url: e.target.value})} placeholder="http://dominio.com:8080" />
               <div className="grid grid-cols-2 gap-4">
                  <input className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-orange-500 transition-colors font-bold" value={editProvider.username || ''} onChange={e=>setEditProvider({...editProvider, username: e.target.value})} placeholder="Username" />
                  <input className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-orange-500 transition-colors font-bold" value={editProvider.password || ''} onChange={e=>setEditProvider({...editProvider, password: e.target.value})} placeholder="Password" type="password" />
               </div>
            </div>
            <div className="flex gap-4 pt-6">
              <button type="submit" className="flex-1 bg-orange-500 text-black font-black p-5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-sm">SALVAR CONFIGURAÇÃO</button>
              <button type="button" onClick={()=>setShowConfig(false)} className="px-8 bg-zinc-800 text-white font-bold p-5 rounded-2xl hover:bg-zinc-700 transition-all uppercase tracking-widest text-xs">CANCELAR</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default IptvTreeViewer;
