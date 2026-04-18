import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { Tv, Film, Clapperboard, RefreshCw, Search, Copy, ChevronRight, ChevronDown, X, Loader, List, CheckCircle, ClipboardList, Settings, Monitor } from 'lucide-react';

const IptvTreeViewer = () => {
  const [providers, setProviders] = useState([]);
  const [activeSlot, setActiveSlot] = useState(1);
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [showConfig, setShowConfig] = useState(false);
  const [editProvider, setEditProvider] = useState(null);

  const fetchProviders = useCallback(async () => {
    try { const res = await api.get('/iptv-server/providers'); setProviders(res.data); } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  const currentProvider = useMemo(() => providers.find(p => p.slot_index === activeSlot) || { name:`Slot ${activeSlot}`, url:'', username:'', password:'' }, [providers, activeSlot]);

  const loadRoot = async () => {
    if (!currentProvider.url) return;
    setLoading(true);
    try {
      const res = await api.get('/iptv-tree/categories', { params: { url:currentProvider.url, username:currentProvider.username, password:currentProvider.password } });
      setTreeData(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadRoot(); }, [activeSlot, currentProvider.url]);

  const addToCuration = async (item) => {
    try {
      await api.post('/iptv-server/curation', {
        type: item.type === 'movie' ? 'vod' : item.type,
        title: item.name,
        external_id: item.id,
        tmdb_id: item.tmdb_id,
        poster_path: item.stream_icon || item.cover,
        provider_id: currentProvider.id
      });
      alert('🎬 Adicionado à Curadoria!');
    } catch (err) { alert('Erro ao adicionar'); }
  };

  return (
    <div style={{ padding:25, background:'#050505', minHeight:'100vh', color:'#fff' }}>
      <div style={{ display:'flex', gap:10, marginBottom:20 }}>
        {[1,2,3,4,5,6].map(i => (
          <button key={i} onClick={()=>setActiveSlot(i)} style={{ padding:'10px 20px', borderRadius:10, background:activeSlot===i?'#FFA500':'#111', border:'none', color:activeSlot===i?'#000':'#fff', cursor:'pointer' }}>
            Slot {i}
          </button>
        ))}
        <button onClick={()=>{setEditProvider(currentProvider); setShowConfig(true)}} style={{ padding:10, borderRadius:10, background:'#222', border:'none', color:'#fff', cursor:'pointer' }}><Settings size={20}/></button>
      </div>
      <h1 style={{ color:'#FFA500' }}>Curadoria IPTV Master</h1>
      {loading ? <Loader className="animate-spin" /> : (
        <div style={{ background:'#111', borderRadius:15, padding:20 }}>
          {treeData.map(node => (
            <div key={node.id}>
              <div style={{ display:'flex', alignItems:'center', padding:10, borderBottom:'1px solid #222' }}>
                <span style={{ flex:1 }}>{node.name}</span>
                <button onClick={()=>addToCuration(node)} style={{ background:'#FFA500', border:'none', padding:'5px 15px', borderRadius:5, cursor:'pointer', fontWeight:'bold' }}>🎬 BANNER</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default IptvTreeViewer;
