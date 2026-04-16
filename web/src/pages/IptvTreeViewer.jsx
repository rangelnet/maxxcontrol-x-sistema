import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Tv, Film, Clapperboard, RefreshCw, Search, Copy, ChevronRight,
  ChevronDown, X, Loader, List, CheckCircle, ClipboardList
} from 'lucide-react';

// ─── Estilos base ───────────────────────────────────────────
const inputStyle = {
  padding:'9px 14px', background:'rgba(5,5,5,0.6)',
  border:'1px solid rgba(255,255,255,0.08)', borderRadius:10,
  color:'#fff', fontSize:13, outline:'none', boxSizing:'border-box',
};

const IptvTreeViewer = () => {
  const [configSource, setConfigSource] = useState('global');
  const [devices, setDevices]           = useState([]);
  const [credentials, setCredentials]   = useState(null);
  const [treeData, setTreeData]         = useState([]);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [selectedStream, setSelectedStream] = useState(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [activeTab, setActiveTab]       = useState('live');
  const [showTestLists, setShowTestLists] = useState(false);
  const [testingList, setTestingList]   = useState(null);
  const [manualConfig, setManualConfig] = useState({ url:'', username:'', password:'' });
  const [loadingManual, setLoadingManual] = useState(false);
  const [expandingAll, setExpandingAll] = useState(false);
  const [copied, setCopied]             = useState(false);

  const testLists = [
    { id:1, name:'Servidor Teste 1', url:'http://xtream.swiftiptv.com:8080',    username:'test', password:'test', description:'Servidor público de teste com canais internacionais' },
    { id:2, name:'Servidor Teste 2', url:'http://pro.xviptv.com:25443',         username:'test', password:'test', description:'Servidor de demonstração com múltiplas categorias' },
    { id:3, name:'Servidor Teste 3', url:'http://iptv.allkaicerteam.com:8080',  username:'test', password:'test', description:'Servidor teste com VOD e séries' },
  ];

  useEffect(() => { loadConfig(); }, []);
  useEffect(() => { if (credentials) loadCategories(activeTab); }, [configSource, activeTab, credentials]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const configRes  = await api.get('/api/iptv-server/config');
      setCredentials(configRes.data);
      const devicesRes = await api.get('/api/device/list-all');
      setDevices(Array.isArray(devicesRes.data) ? devicesRes.data : []);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar configuração. Configure o servidor IPTV primeiro.');
      setDevices([]); setCredentials(null);
    } finally { setLoading(false); }
  };

  const loadCategories = async (type) => {
    try {
      setLoading(true); setError(null);
      const response = await api.get(`/api/iptv-tree/categories/${type}`, { params:{ source:configSource } });
      if (response.data.success) setTreeData(buildHierarchy(response.data.data || [], type));
    } catch (err) {
      if (err.response?.status===401)      setError('Credenciais inválidas. Verifique a configuração.');
      else if (err.response?.status===400) setError('Configure o servidor IPTV primeiro.');
      else if (err.response?.status===504) setError('Timeout na conexão.');
      else                                 setError('Erro ao carregar categorias. Tente novamente.');
    } finally { setLoading(false); }
  };

  const buildHierarchy = (categories, contentType) => {
    const map = new Map(); const roots = [];
    categories.forEach(cat => {
      const name = cat.category_name || cat.name || cat.title || cat.category_id || 'Sem nome';
      const node = { id:`${contentType}-cat-${cat.category_id}`, type:'category', contentType, name:String(name), parent_id:cat.parent_id, category_id:cat.category_id, children:[], loaded:false, metadata:cat };
      map.set(cat.category_id, node);
    });
    map.forEach(node => {
      if (node.parent_id===0 || node.parent_id==='0') roots.push(node);
      else { const parent = map.get(node.parent_id) || map.get(String(node.parent_id)); if (parent) parent.children.push(node); else roots.push(node); }
    });
    return roots;
  };

  const loadStreams = async (node) => {
    try {
      const type = node.contentType;
      const endpoint = type==='series' ? `/api/iptv-tree/series/${node.category_id}` : `/api/iptv-tree/streams/${type}/${node.category_id}`;
      const response = await api.get(endpoint, { params:{ source:configSource } });
      if (response.data.success) {
        const streamNodes = (response.data.data||[]).map(stream => ({
          id:`${type}-stream-${stream.stream_id||stream.series_id}`, type:'stream', contentType:type,
          name:stream.name||stream.title||stream.stream_display_name||String(stream.stream_id||stream.series_id),
          parent_id:node.id, children:type==='series'?[]:null, loaded:type!=='series', metadata:stream
        }));
        updateNodeChildren(node.id, streamNodes);
      }
    } catch { setError('Erro ao carregar conteúdo da categoria.'); }
  };

  const loadSeriesInfo = async (node) => {
    try {
      const response = await api.get(`/api/iptv-tree/series-info/${node.metadata.series_id}`, { params:{ source:configSource } });
      if (response.data.success) {
        const seasonNodes = (response.data.data.seasons||[]).map(season => ({
          id:`series-season-${season.season_number}`, type:'season', contentType:'series',
          name:season.name||`Temporada ${season.season_number}`, parent_id:node.id,
          children:(season.episodes||[]).map(ep => ({
            id:`series-ep-${ep.id}`, type:'episode', contentType:'series',
            name:`${ep.episode_num}. ${ep.title}`, parent_id:`series-season-${season.season_number}`,
            children:null, loaded:true, metadata:ep
          })), loaded:true, metadata:season
        }));
        updateNodeChildren(node.id, seasonNodes);
      }
    } catch { setError('Erro ao carregar episódios.'); }
  };

  const updateNodeChildren = (nodeId, children) => {
    const updateTree = nodes => nodes.map(node => {
      if (node.id===nodeId) return { ...node, children, loaded:true };
      if (node.children?.length>0) return { ...node, children:updateTree(node.children) };
      return node;
    });
    setTreeData(prev => updateTree(prev));
  };

  const handleToggle = async (node) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(node.id)) { newExpanded.delete(node.id); }
    else {
      newExpanded.add(node.id);
      if (!node.loaded && node.type==='category') await loadStreams(node);
      else if (!node.loaded && node.type==='stream' && node.contentType==='series') await loadSeriesInfo(node);
      setTimeout(() => { const el = document.querySelector(`[data-node-id="${node.id}"]`); el?.scrollIntoView({ behavior:'smooth', block:'start' }); }, 100);
    }
    setExpandedNodes(newExpanded);
  };

  const handleConfigChange = (newSource) => {
    setConfigSource(newSource); setTreeData([]); setExpandedNodes(new Set());
    setSelectedStream(null); setSearchQuery('');
  };

  const handleRefresh = async () => {
    try { await api.post('/api/iptv-tree/clear-cache', { source:configSource }); setTreeData([]); setExpandedNodes(new Set()); await loadCategories(activeTab); }
    catch { setError('Erro ao atualizar cache.'); }
  };

  const handleCopyUrl = async (url) => {
    await navigator.clipboard.writeText(url);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  const handleExpandAll = async () => {
    setExpandingAll(true);
    try {
      const newExpanded = new Set(expandedNodes); const toLoad = [];
      const collect = (nodes) => { nodes.forEach(node => { newExpanded.add(node.id); if (!node.loaded && node.type==='category') toLoad.push(node); if (node.children?.length>0) collect(node.children); }); };
      collect(treeData); setExpandedNodes(new Set(newExpanded));
      if (toLoad.length===0) return;
      const CONCURRENCY=3; let index=0;
      const runNext = async () => { if (index>=toLoad.length) return; const node=toLoad[index++]; await loadStreams(node); await runNext(); };
      await Promise.all(Array.from({ length:Math.min(CONCURRENCY,toLoad.length) }, runNext));
    } finally { setExpandingAll(false); }
  };

  const handleCollapseAll = () => setExpandedNodes(new Set());

  const collectAllNames = (nodes, expanded, result=[]) => {
    nodes.forEach(node => {
      const id = node.metadata?.stream_id || node.metadata?.series_id || node.metadata?.id || null;
      result.push(id ? `${node.name||'(sem nome)'} | ID: ${id}` : (node.name||'(sem nome)'));
      if (expanded.has(node.id) && node.children?.length>0) collectAllNames(node.children, expanded, result);
    });
    return result;
  };

  const handleCopyAll = async () => {
    const names = collectAllNames(filteredTree, expandedNodes);
    if (!names.length) return;
    await navigator.clipboard.writeText(names.join('\n'));
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  const handleLoadManualList = async () => {
    setLoadingManual(true);
    try {
      const testResponse = await api.post('/api/iptv-server/test', { xtream_url:manualConfig.url, xtream_username:manualConfig.username, xtream_password:manualConfig.password });
      if (testResponse.data.success) {
        await api.post('/api/iptv-server/config', { xtream_url:manualConfig.url, xtream_username:manualConfig.username, xtream_password:manualConfig.password });
        await loadConfig(); await loadCategories(activeTab);
        setManualConfig({ url:'', username:'', password:'' });
      } else { alert(`❌ ${testResponse.data.message}`); }
    } catch (err) { alert(`❌ ${err.response?.data?.message||'Erro ao testar conexão'}`); }
    finally { setLoadingManual(false); }
  };

  const handleTestList = async (testList) => {
    setTestingList(testList.id); setShowTestLists(false);
    try {
      const r = await api.post('/api/iptv-server/test', { xtream_url:testList.url, xtream_username:testList.username, xtream_password:testList.password });
      if (r.data.success) {
        await api.post('/api/iptv-server/config', { xtream_url:testList.url, xtream_username:testList.username, xtream_password:testList.password });
        await loadConfig(); await loadCategories(activeTab);
      } else { alert(`❌ ${r.data.message}`); }
    } catch { alert('❌ Erro ao testar conexão'); }
    finally { setTestingList(null); }
  };

  const formatStreamUrl = (stream, creds) => {
    if (!creds) return '';
    const { xtream_url, xtream_username, xtream_password } = creds;
    if (stream.contentType==='live') return `${xtream_url}/${xtream_username}/${xtream_password}/${stream.metadata.stream_id}`;
    if (stream.contentType==='vod')  return `${xtream_url}/movie/${xtream_username}/${xtream_password}/${stream.metadata.stream_id}.${stream.metadata.container_extension||'mp4'}`;
    if (stream.type==='episode')     return `${xtream_url}/series/${xtream_username}/${xtream_password}/${stream.metadata.id}.${stream.metadata.container_extension||'mkv'}`;
    return '';
  };

  const filterTree = (nodes, query) => {
    if (!query) return nodes;
    const lq = query.toLowerCase();
    const filter = (node) => {
      const match = (node.name||'').toLowerCase().includes(lq);
      if (node.children?.length>0) {
        const fc = node.children.map(filter).filter(Boolean);
        if (fc.length>0) { expandedNodes.add(node.id); return { ...node, children:fc }; }
      }
      return match ? node : null;
    };
    return nodes.map(filter).filter(Boolean);
  };

  // ─── TreeNode Component ─────────────────────────────────────
  const getNodeColor = (node) => {
    if (node.type==='category')          return '#FFA500';
    if (node.contentType==='live')       return '#34d399';
    if (node.contentType==='vod')        return '#a78bfa';
    if (node.contentType==='series')     return '#60a5fa';
    return '#71717a';
  };

  const getNodeIcon = (node) => {
    if (node.type==='category') return '📁';
    if (node.contentType==='live')   return '📡';
    if (node.contentType==='vod')    return '🎬';
    if (node.contentType==='series') return '📺';
    return '▶️';
  };

  const TreeNode = ({ node, level }) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children?.length > 0;
    const canExpand = node.type==='category' || (node.type==='stream' && node.contentType==='series') || node.type==='season';
    const displayName = node.name || node.metadata?.category_name || node.metadata?.name || '(sem nome)';
    const isSelected  = selectedStream?.id === node.id;
    const nodeColor   = getNodeColor(node);

    return (
      <div>
        <div
          data-node-id={node.id}
          onClick={() => { if (canExpand) handleToggle(node); else if (node.type==='stream'||node.type==='episode') setSelectedStream(node); }}
          style={{
            display:'flex', alignItems:'center', gap:6, padding:'5px 10px',
            paddingLeft:`${level*18+10}px`, cursor:'pointer', borderRadius:7,
            background: isSelected ? 'rgba(255,165,0,0.12)' : 'transparent',
            border: isSelected ? '1px solid rgba(255,165,0,0.25)' : '1px solid transparent',
            transition:'all .1s',
          }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.04)'}
          onMouseLeave={e => e.currentTarget.style.background=isSelected?'rgba(255,165,0,0.12)':'transparent'}
        >
          <span style={{ flexShrink:0, width:14, display:'flex' }}>
            {canExpand ? (isExpanded ? <ChevronDown size={12} color='#71717a'/> : <ChevronRight size={12} color='#71717a'/>) : null}
          </span>
          <span style={{ fontSize:12, flexShrink:0 }}>{getNodeIcon(node)}</span>
          <span style={{ flex:1, fontSize:12, color:'#a1a1aa', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {searchQuery && displayName.toLowerCase().includes(searchQuery.toLowerCase()) ? (
              <span dangerouslySetInnerHTML={{ __html: displayName.replace(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi'), '<mark style="background:rgba(255,165,0,0.3);color:#FFA500;border-radius:3px;padding:0 2px">$1</mark>') }}/>
            ) : displayName}
          </span>
          {node.type==='category' && hasChildren && (
            <span style={{ fontSize:10, padding:'1px 7px', borderRadius:999, background:`${nodeColor}18`, border:`1px solid ${nodeColor}30`, color:nodeColor, fontWeight:800, flexShrink:0 }}>{node.children.length}</span>
          )}
          {node.type==='stream' && node.metadata?.num && (
            <span style={{ fontSize:10, color:'#3f3f46', flexShrink:0 }}>#{node.metadata.num}</span>
          )}
        </div>
        {isExpanded && hasChildren && (
          <div>{node.children.map(child => <TreeNode key={child.id} node={child} level={level+1}/>)}</div>
        )}
        {isExpanded && !hasChildren && node.loaded && (
          <div style={{ paddingLeft:`${(level+1)*18+10}px`, fontSize:11, color:'#3f3f46', padding:'4px', fontStyle:'italic' }}>Nenhum conteúdo</div>
        )}
      </div>
    );
  };

  const filteredTree = filterTree(treeData, searchQuery);

  const tabs = [
    { key:'live',   label:'TV ao Vivo', Icon:Tv          },
    { key:'vod',    label:'Filmes',     Icon:Film        },
    { key:'series', label:'Séries',     Icon:Clapperboard },
  ];

  const btnPrimary = { display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', background:'linear-gradient(135deg,#FFA500,#FF6B00)', border:'none', borderRadius:9, color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' };
  const btnGhost   = { display:'inline-flex', alignItems:'center', gap:6, padding:'8px 12px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:9, color:'#71717a', fontSize:12, cursor:'pointer', whiteSpace:'nowrap' };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:26, fontWeight:900, color:'#fff', display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
          <Tv size={26} color='#FFA500'/> Visualizar Árvore IPTV
        </h1>
        <p style={{ fontSize:12, color:'#52525b' }}>Explore categorias e conteúdo do servidor Xtream Codes</p>
      </div>

      {/* Adicionar Lista Manualmente */}
      <div style={{ background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)', border:'1px solid rgba(255,165,0,0.1)', borderRadius:14, padding:20, marginBottom:16 }}>
        <p style={{ fontSize:12, fontWeight:700, color:'#71717a', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Adicionar Lista IPTV</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 140px 140px auto', gap:10, alignItems:'start' }}>
          <input type='text' placeholder='URL do servidor (http://...)' value={manualConfig.url} onChange={e=>setManualConfig({...manualConfig,url:e.target.value})} style={inputStyle}/>
          <input type='text' placeholder='Usuário' value={manualConfig.username} onChange={e=>setManualConfig({...manualConfig,username:e.target.value})} style={inputStyle}/>
          <input type='text' placeholder='Senha' value={manualConfig.password} onChange={e=>setManualConfig({...manualConfig,password:e.target.value})} style={inputStyle}/>
          <button onClick={handleLoadManualList} disabled={loadingManual||!manualConfig.url||!manualConfig.username||!manualConfig.password}
            style={{ ...btnPrimary, padding:'10px 16px', opacity:(loadingManual||!manualConfig.url)?0.6:1 }}>
            {loadingManual ? <><Loader size={13} style={{animation:'spin 1s linear infinite'}}/>Carregando</> : <><CheckCircle size={13}/>Carregar</>}
          </button>
        </div>
        <p style={{ fontSize:11, color:'#52525b', marginTop:8 }}>💡 Digite as credenciais e clique em "Carregar" para visualizar a árvore automaticamente</p>
      </div>

      {/* Controles */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', marginBottom:16 }}>
        {/* Servidor carregado */}
        {credentials?.xtream_url && (
          <div style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 12px', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:9 }}>
            <CheckCircle size={13} color='#34d399'/>
            <span style={{ fontSize:12, color:'#34d399', fontWeight:600 }}>{credentials.server_name||credentials.xtream_url}</span>
            {credentials.xtream_username && <span style={{ fontSize:11, color:'#52525b' }}>({credentials.xtream_username})</span>}
          </div>
        )}

        {/* Config Selector */}
        <select value={configSource} onChange={e=>handleConfigChange(e.target.value)} style={{ ...inputStyle, width:'auto', padding:'8px 12px' }}>
          <option value='global'>Configuração Global</option>
          {Array.isArray(devices) && devices.map(d => <option key={d.id} value={d.id}>{d.modelo||d.mac_address}</option>)}
        </select>

        <button onClick={() => setShowTestLists(!showTestLists)} style={btnGhost}><List size={13}/> Listas de Teste</button>
        <button onClick={handleRefresh} style={btnGhost}><RefreshCw size={13}/> Atualizar</button>
        <button onClick={handleExpandAll} disabled={expandingAll} style={{ ...btnGhost, opacity:expandingAll?0.6:1 }}>
          {expandingAll ? <><Loader size={13} style={{animation:'spin 1s linear infinite'}}/>Expandindo...</> : <><ChevronDown size={13}/>Expandir Tudo</>}
        </button>
        <button onClick={handleCollapseAll} style={btnGhost}><ChevronRight size={13}/> Recolher</button>
        <button onClick={handleCopyAll} style={{ ...btnGhost, color:copied?'#34d399':'#71717a', borderColor:copied?'rgba(16,185,129,0.3)':'rgba(255,255,255,0.08)' }}>
          <ClipboardList size={13}/> {copied?'Copiado!':'Copiar Tudo'}
        </button>

        {/* Busca */}
        <div style={{ flex:1, minWidth:180, position:'relative' }}>
          <Search size={13} color='#52525b' style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
          <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder='Buscar...'
            style={{ ...inputStyle, paddingLeft:30, paddingRight:searchQuery?30:14, width:'100%' }}/>
          {searchQuery && (
            <button onClick={()=>setSearchQuery('')} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#71717a', cursor:'pointer', display:'flex' }}>
              <X size={12}/>
            </button>
          )}
        </div>
      </div>

      {/* Modal Listas de Teste */}
      {showTestLists && (
        <div style={{ background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)', border:'1px solid rgba(255,165,0,0.15)', borderRadius:14, padding:20, marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <p style={{ fontSize:14, fontWeight:800, color:'#fff' }}>Listas IPTV de Teste Públicas</p>
            <button onClick={()=>setShowTestLists(false)} style={{ background:'none', border:'none', color:'#52525b', cursor:'pointer', display:'flex' }}><X size={16}/></button>
          </div>
          <p style={{ fontSize:11, color:'#71717a', marginBottom:12 }}>⚠️ Listas públicas de teste. Podem estar offline ou lentas.</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {testLists.map(list => (
              <div key={list.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:10 }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:'#e4e4e7', marginBottom:2 }}>{list.name}</p>
                  <p style={{ fontSize:11, color:'#52525b', marginBottom:4 }}>{list.description}</p>
                  <p style={{ fontFamily:'monospace', fontSize:11, color:'#FFA500' }}>{list.url}</p>
                </div>
                <button onClick={()=>handleTestList(list)} disabled={testingList===list.id}
                  style={{ ...btnPrimary, marginLeft:14, opacity:testingList===list.id?0.6:1 }}>
                  {testingList===list.id ? <><Loader size={12} style={{animation:'spin 1s linear infinite'}}/>Testando...</> : <><CheckCircle size={12}/>Usar</>}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:16, background:'rgba(17,17,17,0.6)', padding:5, borderRadius:12, width:'fit-content', border:'1px solid rgba(255,255,255,0.06)' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => { setActiveTab(tab.key); setTreeData([]); setExpandedNodes(new Set()); }}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 18px', borderRadius:9, border:'none', cursor:'pointer', fontSize:13, fontWeight:700, transition:'all .2s', background:activeTab===tab.key?'rgba(255,165,0,0.15)':'transparent', color:activeTab===tab.key?'#FFA500':'#71717a' }}>
            <tab.Icon size={14}/> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ display:'flex', gap:16 }}>
        {/* Tree Panel */}
        <div style={{ flex:1, background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)', border:'1px solid rgba(255,165,0,0.08)', borderRadius:14, maxHeight:560, overflow:'auto', boxShadow:'0 8px 32px rgba(0,0,0,0.35)' }}>
          {loading && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:40, gap:10, color:'#52525b' }}>
              <Loader size={20} color='#FFA500' style={{ animation:'spin 1s linear infinite' }}/>
              <span style={{ fontSize:13 }}>Carregando...</span>
            </div>
          )}
          {error && (
            <div style={{ margin:16, padding:'12px 16px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10 }}>
              <p style={{ fontSize:12, color:'#f87171', marginBottom:10 }}>{error}</p>
              <button onClick={()=>loadCategories(activeTab)} style={{ padding:'6px 14px', background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:8, color:'#f87171', fontSize:12, cursor:'pointer' }}>Tentar Novamente</button>
            </div>
          )}
          {!loading && !error && filteredTree.length===0 && (
            <div style={{ padding:40, textAlign:'center', color:'#52525b', fontSize:13 }}>
              {searchQuery ? 'Nenhum resultado encontrado' : 'Nenhuma categoria disponível'}
            </div>
          )}
          {!loading && !error && filteredTree.map(node => <TreeNode key={node.id} node={node} level={0}/>)}
        </div>

        {/* Detail Panel */}
        {selectedStream && (
          <div style={{ width:300, background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)', border:'1px solid rgba(255,165,0,0.12)', borderRadius:14, padding:18, flexShrink:0, boxShadow:'0 8px 32px rgba(0,0,0,0.35)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <h3 style={{ fontSize:14, fontWeight:800, color:'#fff' }}>Detalhes</h3>
              <button onClick={()=>setSelectedStream(null)} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:7, width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', color:'#71717a', cursor:'pointer' }}><X size={13}/></button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                { label:'Nome',          value:selectedStream.name },
                { label:'Stream ID',     value:selectedStream.metadata.stream_id },
                { label:'Nº do Canal',   value:selectedStream.metadata.num },
                { label:'EPG Channel',   value:selectedStream.metadata.epg_channel_id },
                { label:'Formato',       value:selectedStream.metadata.container_extension },
              ].filter(i=>i.value).map(item => (
                <div key={item.label}>
                  <p style={{ fontSize:10, fontWeight:700, color:'#52525b', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:3 }}>{item.label}</p>
                  <p style={{ fontSize:12, color:'#a1a1aa' }}>{String(item.value)}</p>
                </div>
              ))}

              <div>
                <p style={{ fontSize:10, fontWeight:700, color:'#52525b', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>URL do Stream</p>
                <div style={{ display:'flex', gap:6 }}>
                  <input type='text' value={formatStreamUrl(selectedStream, credentials)} readOnly
                    style={{ flex:1, padding:'7px 10px', background:'rgba(5,5,5,0.6)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, color:'#71717a', fontFamily:'monospace', fontSize:10, outline:'none' }}/>
                  <button onClick={()=>handleCopyUrl(formatStreamUrl(selectedStream, credentials))}
                    style={{ padding:'7px 10px', background:copied?'rgba(16,185,129,0.15)':'rgba(255,165,0,0.12)', border:`1px solid ${copied?'rgba(16,185,129,0.3)':'rgba(255,165,0,0.25)'}`, borderRadius:8, color:copied?'#34d399':'#FFA500', cursor:'pointer', display:'flex', alignItems:'center' }}>
                    <Copy size={13}/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default IptvTreeViewer;
