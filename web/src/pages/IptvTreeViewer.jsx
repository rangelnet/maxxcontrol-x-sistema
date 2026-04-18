import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { Tv, Film, Clapperboard, RefreshCw, Search, ChevronRight, ChevronDown, Loader, Settings, Monitor, ClipboardList } from 'lucide-react';

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
      setProviders(res.data);
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
      await api.put(`/iptv-server/providers/${editProvider.id}`, editProvider);
      setShowConfig(false);
      fetchProviders();
    } catch (err) { alert('Erro ao salvar'); }
  };

  if (loadingProviders) return <div className="p-10 text-center"><Loader className="animate-spin mx-auto" color="#FFA500" /></div>;

  return (
    <div className="p-6 bg-[#050505] min-h-screen text-white">
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {[1,2,3,4,5,6].map(i => {
          const p = providers.find(x => x.slot_index === i);
          const active = activeSlot === i;
          return (
            <button key={i} onClick={() => setActiveSlot(i)} className={`flex-shrink-0 w-40 p-4 rounded-2xl border transition-all ${active ? 'bg-orange-500/20 border-orange-500 text-orange-500 shadow-[0_0_20px_rgba(255,165,0,0.2)]' : 'bg-[#111] border-white/5 text-zinc-500'}`}>
              <Monitor className="mb-2" size={20} />
              <div className="font-bold text-sm truncate">{p?.name || `Slot ${i}`}</div>
            </button>
          );
        })}
        <button onClick={() => { setEditProvider(currentProvider); setShowConfig(true); }} className="p-4 bg-[#222] rounded-2xl"><Settings size={20} /></button>
      </div>

      <h1 className="text-2xl font-black text-orange-500 mb-2 uppercase tracking-tighter">Curadoria Master TV MAXX</h1>
      
      <div className="bg-[#111] rounded-3xl p-4 border border-white/5">
        {loading ? <div className="p-20 text-center"><Loader className="animate-spin mx-auto" color="#FFA500" /></div> : (
          treeData.map(node => (
            <div key={node.id} className="border-b border-white/5 last:border-0">
              <div onClick={() => toggleNode(node)} className="flex items-center p-3 cursor-pointer hover:bg-white/5 rounded-xl">
                {expandedNodes.has(node.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                <ClipboardList className="mx-2 text-orange-500" size={18} />
                <span className="flex-1 font-medium">{node.category_name || node.name}</span>
              </div>
              {expandedNodes.has(node.id) && node.children && (
                <div className="ml-8 py-2 border-l border-white/5 pl-4">
                  {node.children.map(child => (
                    <div key={child.id} className="flex items-center p-2 gap-4">
                      <Film size={14} className="text-zinc-500" />
                      <span className="flex-1 text-zinc-300 text-sm">{child.name}</span>
                      <button onClick={() => addToCuration(child)} className="px-4 py-1.5 bg-orange-500 text-black text-[10px] font-black rounded-full uppercase">🎬 + Banner</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showConfig && editProvider && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50">
          <form onSubmit={handleSaveConfig} className="bg-[#111] p-8 rounded-3xl border border-orange-500 w-full max-w-md space-y-4">
            <h2 className="text-orange-500 font-bold text-xl">Configurar Slot {activeSlot}</h2>
            <input className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-orange-500" value={editProvider.name} onChange={e=>setEditProvider({...editProvider, name: e.target.value})} placeholder="Nome" />
            <input className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-orange-500" value={editProvider.url} onChange={e=>setEditProvider({...editProvider, url: e.target.value})} placeholder="DNS/URL" />
            <input className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-orange-500" value={editProvider.username} onChange={e=>setEditProvider({...editProvider, username: e.target.value})} placeholder="User" />
            <input className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-orange-500" value={editProvider.password} onChange={e=>setEditProvider({...editProvider, password: e.target.value})} placeholder="Pass" type="password" />
            <div className="flex gap-4 pt-4">
              <button type="submit" className="flex-1 bg-orange-500 text-black font-bold p-3 rounded-xl">SALVAR</button>
              <button onClick={()=>setShowConfig(false)} className="flex-1 bg-white/5 text-white p-3 rounded-xl">CANCELAR</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default IptvTreeViewer;
