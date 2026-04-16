<<<<<<< HEAD
import { useState, useEffect } from 'react';
import api from '../services/api';
import axios from 'axios';
import { Plus, Trash2, Play, Globe, Users, Settings, Server, List, CheckCircle, Loader, Search, XCircle, TreePine } from 'lucide-react';
import IptvTreeViewer from './IptvTreeViewer';
=======
import React, { useState, useEffect } from 'react';
import { Settings, Server, Plus, Trash2, Globe, CheckCircle, RefreshCcw, Loader, Tv, MonitorPlay, Box, Cast, RadioGroup, List, Play, TreePine, Users } from 'lucide-react';
import api from '../../api/axios';
>>>>>>> 3c3854e05362c2ac37a66ad27250b54f25088cad

// ─── Tab: Limpar qPanel (Plugin 1) ───────────────────────────────────────────
const CleanQpanelTab = () => {
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');
  const [useRelay, setUseRelay] = useState(false); // Alternar entre API Direta ou Plugin de Navegador

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchUsername.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    setSearchStatus('⏳ Iniciando busca em todos os painéis...');

    try {
      if (useRelay) {
        // Modo relay: plugin Chrome executa no qPanel
        setSearchStatus('⏳ Enviando comando para o plugin Chrome...');
        const cmdRes = await api.post('/api/iptv-plugin/relay-command', {
          command_type: 'search_user',
          payload: { username: searchUsername.trim() }
        });

        const commandId = cmdRes.data.command_id;
        setSearchStatus('⏳ Aguardando plugin pesquisar nos painéis...');

        let attempts = 0;
        const maxAttempts = 30; // 60 segundos
        const pollInterval = setInterval(async () => {
          attempts++;
          try {
            const res = await api.get(`/api/iptv-plugin/relay-result/${commandId}`);
            if (res.data.status === 'done' || res.data.status === 'error') {
              clearInterval(pollInterval);
              setIsSearching(false);
              
              if (res.data.status === 'error') {
                setSearchStatus(`❌ Erro no plugin: ${res.data.error_message}`);
              } else {
                const results = res.data.result?.results || [];
                setSearchResults(results);
                setSearchStatus(results.length > 0 
                  ? `✅ Encontrado em ${results.length} painel(is).` 
                  : `ℹ️ Usuário '${searchUsername}' não encontrado em nenhum painel.`);
              }
            }
          } catch (pollErr) {
            console.error('Erro no polling', pollErr);
          }

          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setIsSearching(false);
            setSearchStatus('⏰ Timeout: plugin não respondeu.');
          }
        }, 2000);

      } else {
        // Modo direto (legado — pode falhar se qPanel exigir sessão do browser)
        setSearchStatus('⏳ Buscando diretamente via servidor...');
        const response = await api.post('/api/iptv-plugin/qpanel-search-user', { username: searchUsername.trim() });
        setSearchResults(response.data.results || []);
        setIsSearching(false);
        setSearchStatus(response.data.results.length > 0 
          ? `✅ Encontrado em ${response.data.results.length} painel(is).` 
          : `ℹ️ Usuário '${searchUsername}' não encontrado em nenhum painel.`);
      }

    } catch (err) {
      setIsSearching(false);
      setSearchStatus(`❌ Erro: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleDelete = async (panelId, customerId, panelName) => {
    if (!window.confirm(`Tem certeza que deseja apagar ${searchUsername} de ${panelName}?`)) return;

    try {
      if (useRelay) {
        alert('Modo plugin: o comando de apagar ainda precisa ser processado pelo painel.');
        // Opcional: implementar delete_user no relay
        const cmdRes = await api.post('/api/iptv-plugin/relay-command', {
          panel_id: panelId,
          command_type: 'delete_user',
          payload: { customer_id: customerId, username: searchUsername }
        });
        alert('Comando enviado para o plugin Chrome! Verifique no qPanel depois.');
      } else {
        const btn = document.getElementById(`btn-del-${panelId}`);
        if(btn) btn.innerHTML = 'Apagando...';
        
        try {
          await api.post('/api/iptv-plugin/qpanel-delete-user', {
            panel_id: panelId,
            customer_id: customerId,
            username: searchUsername
          });
          alert(`✅ Apagado com sucesso de ${panelName}`);
          setSearchResults(prev => prev.filter(r => r.panel_id !== panelId));
        } catch (delErr) {
          alert(`❌ Erro ao apagar em ${panelName}: ${delErr.response?.data?.error || delErr.message}`);
          if(btn) btn.innerHTML = 'Deletar';
        }
      }
    } catch (err) {
      alert(`Erro geral: ${err.message}`);
    }
  };

  const btnSt  = { padding:'10px 20px', background:'linear-gradient(135deg,#ef4444,#dc2626)', border:'none', borderRadius:10, color:'#fff', fontWeight:700, cursor:'pointer' };
  const inputSt = { width:'100%', padding:'12px 16px', background:'rgba(5,5,5,0.6)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'#fff', outline:'none' };

  return (
    <div style={{ background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:16, padding:24 }}>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontSize:18, fontWeight:800, color:'#f87171', display:'flex', alignItems:'center', gap:8 }}>
          <Trash2 size={24}/> Limpar Acesso no qPanel
        </h2>
        <p className="text-gray-400 text-sm mb-4">Busca o username em todos os painéis qPanel configurados e permite deletar em massa.</p>
        
        {/* Toggle para Relay Chrome */}
        <div style={{ padding:12, background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:10, marginBottom:20, display:'inline-block' }}>
          <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', color:'#93c5fd', fontSize:13 }}>
            <input type="checkbox" checked={useRelay} onChange={(e)=>setUseRelay(e.target.checked)} style={{ width:16, height:16, accentColor:'#3b82f6' }}/>
            Usar Relay via Plugin do Chrome
          </label>
        </div>
      </div>

      <form onSubmit={handleSearch} style={{ display:'flex', gap:12, marginBottom:20 }}>
        <input style={inputSt} type="text" placeholder="Digite o username exato do cliente" value={searchUsername} onChange={e=>setSearchUsername(e.target.value)} required />
        <button type="submit" disabled={isSearching} style={{ ...btnSt, background:isSearching?'#52525b':'linear-gradient(135deg,#34d399,#10b981)', opacity:isSearching?0.7:1, display:'flex', alignItems:'center', gap:8 }}>
          {isSearching ? <><Loader size={16} style={{animation:'spin 1s linear infinite'}}/> Buscando...</> : 'Buscar em Todos'}
        </button>
      </form>

      {searchStatus && (
        <div style={{ padding:14, background:'rgba(255,255,255,0.05)', borderRadius:10, color:'#e4e4e7', fontSize:13, marginBottom:20, borderLeft:'4px solid #FFA500' }}>
          {searchStatus}
        </div>
      )}

      {searchResults.length > 0 && (
        <div>
          <h3 style={{ fontSize:14, fontWeight:700, color:'#34d399', marginBottom:12 }}>Resultados ({searchResults.length}):</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {searchResults.map((res, i) => (
              <div key={i} style={{ padding:16, background:'rgba(5,5,5,0.5)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <p style={{ fontSize:15, fontWeight:800, color:'#fff' }}>{res.panel_name}</p>
                  <p style={{ fontSize:12, color:'#a1a1aa', marginTop:4 }}>
                    <span style={{ color:'#34d399' }}>● Encontrado: {res.username}</span> | 
                    Status: <strong style={{ color:res.status==='Active'?'#34d399':'#fbbf24' }}>{res.status}</strong> | 
                    Expira: {res.expiry}
                  </p>
                  {res.error && <p style={{ color:'#f87171', fontSize:11, mt:4 }}>Erro nesta API: {res.error}</p>}
                </div>
                {!res.error && (
                  <button 
                    id={`btn-del-${res.panel_id}`}
                    onClick={()=>handleDelete(res.panel_id, res.customer_id, res.panel_name)}
                    style={{ padding:'8px 16px', background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, color:'#f87171', fontSize:12, fontWeight:700, cursor:'pointer' }}
                    onMouseOver={e=>e.currentTarget.style.background='rgba(239,68,68,0.25)'}
                    onMouseOut={e=>e.currentTarget.style.background='rgba(239,68,68,0.15)'}>
                    Deletar Usuário
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Novo Tab: Gerenciador de Árvore IPTV (Categorias) ─────────────────────────
const IptvTreeTab = () => {
  const [servers, setServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState('');
  const [categories, setCategories] = useState([]);
  const [channels, setChannels] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedCats, setExpandedCats] = useState({});
  const [loadingCats, setLoadingCats] = useState({});

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    try {
      const response = await api.get('/api/iptv-tree/servers');
      setServers(response.data.servers || []);
    } catch (err) { console.error('Erro ao listar servidores na árvore', err); }
  };

  const handleServerSelect = async (e) => {
    const srvId = e.target.value;
    setSelectedServer(srvId);
    setCategories([]);
    setChannels({});
    setExpandedCats({});
    
    if (!srvId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/api/iptv-tree/categories/${srvId}`);
      setCategories(response.data.categories || []);
    } catch (err) {
      alert('Erro ao carregar categorias: ' + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  const toggleCategory = async (categoryId) => {
    const isExpanded = !!expandedCats[categoryId];
    
    setExpandedCats(prev => ({ ...prev, [categoryId]: !isExpanded }));

    // Se vai expandir e ainda não tem os canais em memória, busca na API
    if (!isExpanded && !channels[categoryId]) {
      setLoadingCats(prev => ({ ...prev, [categoryId]: true }));
      try {
        const res = await api.get(`/api/iptv-tree/channels/${selectedServer}/${categoryId}`);
        setChannels(prev => ({ ...prev, [categoryId]: res.data.channels }));
      } catch (err) {
        alert('Erro ao carregar canais desta categoria.');
        setExpandedCats(prev => ({ ...prev, [categoryId]: false }));
      }
      setLoadingCats(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  const inputSt = { width:'100%', padding:'12px 16px', background:'rgba(5,5,5,0.6)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'#fff', outline:'none', fontSize:14 };

  return (
    <div style={{ background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)', border:'1px solid rgba(255,165,0,0.2)', borderRadius:16, padding:24 }}>
      <h2 style={{ fontSize:18, fontWeight:800, color:'#fff', display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
        <TreePine size={24} color="#FFA500"/> Explorador de Árvore IPTV
      </h2>
      <p style={{ color:'#a1a1aa', fontSize:13, marginBottom:24 }}>Explore as categorias e visualize todos os canais, filmes e séries contidos em cada servidor.</p>

      <div style={{ marginBottom:20 }}>
        <select style={inputSt} value={selectedServer} onChange={handleServerSelect}>
          <option value="">Selecione um Servidor IPTV...</option>
          {servers.map(s => (
             <option key={s.id} value={s.id}>{s.server_name} ({s.xtream_url})</option>
          ))}
        </select>
      </div>

      {loading && (
        <div style={{ padding:20, textAlign:'center', color:'#FFA500' }}>
          <Loader size={24} style={{ animation:'spin 1s linear infinite', margin:'0 auto 10px' }}/>
          <p>Buscando lista na API do servidor...</p>
        </div>
      )}

      {!loading && selectedServer && categories.length > 0 && (
        <div style={{ background:'rgba(5,5,5,0.4)', borderRadius:12, padding:16, border:'1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:'#34d399', marginBottom:16 }}>📁 {categories.length} Categorias encontradas</h3>
          
          <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:'500px', overflowY:'auto', paddingRight:10 }}>
            {categories.map(cat => (
              <div key={cat.category_id} style={{ border:'1px solid rgba(255,255,255,0.05)', borderRadius:8, overflow:'hidden' }}>
                {/* Header (Categoria) */}
                <div 
                  onClick={() => toggleCategory(cat.category_id)}
                  style={{ 
                    padding:'12px 16px', background:'rgba(255,255,255,0.02)', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'space-between'
                  }}
                  onMouseOver={e=>e.currentTarget.style.background='rgba(255,165,0,0.1)'}
                  onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                >
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:16 }}>{expandedCats[cat.category_id] ? '📂' : '📁'}</span>
                    <span style={{ fontSize:14, fontWeight:700, color:'#e4e4e7' }}>{cat.category_name}</span>
                  </div>
                  {loadingCats[cat.category_id] ? (
                    <Loader size={14} color="#FFA500" style={{ animation:'spin 1s linear infinite' }}/>
                  ) : (
                    <span style={{ fontSize:11, color:'#71717a' }}>ID {cat.category_id}</span>
                  )}
                </div>

                {/* Body (Canais) */}
                {expandedCats[cat.category_id] && (
                  <div style={{ padding:'10px 16px', background:'rgba(0,0,0,0.3)', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                    {channels[cat.category_id] ? (
                      channels[cat.category_id].length > 0 ? (
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:8 }}>
                          {channels[cat.category_id].map(ch => (
                            <div key={ch.stream_id} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', background:'rgba(255,255,255,0.03)', borderRadius:6 }}>
                              {ch.stream_icon ? (
                                <img src={ch.stream_icon} alt="" style={{ width:24, height:24, borderRadius:4, objectFit:'cover', background:'#000' }} onError={e=>{e.target.src='https://via.placeholder.com/24?text=TV'}}/>
                              ) : (
                                <div style={{ width:24, height:24, borderRadius:4, background:'#27272a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10 }}>📺</div>
                              )}
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ fontSize:12, fontWeight:600, color:'#d4d4d8', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }} title={ch.name}>{ch.name}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize:12, color:'#71717a', padding:'8px 0' }}>Nenhum canal ativo nesta categoria.</p>
                      )
                    ) : (
                      <p style={{ fontSize:12, color:'#71717a', padding:'8px 0' }}>Aguardando...</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && selectedServer && categories.length === 0 && (
         <div style={{ padding:20, textAlign:'center', color:'#f87171', background:'rgba(239,68,68,0.1)', borderRadius:10 }}>
           Nenhuma categoria encontrada ou erro na conexão com a API.
         </div>
      )}
    </div>
  );
};

// ─── Componente do Playlist Manager ───────────────────────────────────────────
const PlaylistManagerComponent = () => {
  const [platforms, setPlatforms] = useState([
    { id: 'iboplro', name: 'IBO Pro', icon: '📺', color: 'bg-blue-500' },
    { id: 'smartone', name: 'SmartOne', icon: '🖥️', color: 'bg-purple-500' },
    { id: 'ibocast', name: 'IboCast', icon: '📱', color: 'bg-indigo-500' },
    { id: 'vuplayer', name: 'VuPlayer', icon: '🎮', color: 'bg-orange-500' }
  ]);
  const [currentPlatform, setCurrentPlatform] = useState('');
  
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedServers, setSelectedServers] = useState([]);
  
  const [serverForm, setServerForm] = useState({ name: '', dns: '' });
  const [registerForm, setRegisterForm] = useState({ mac: '', username: '', password: '' });
  
  const [activityLog, setActivityLog] = useState([]);
  const [stats, setStats] = useState({ total: 0, success: 0, error: 0 });
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      const response = await api.get('/api/playlist-manager/servers');
      setServers(response.data.servers || []);
    } catch (error) {
      console.error('Erro ao buscar servidores:', error);
      addLog('❌ Falha ao carregar servidores.');
    } finally {
      setLoading(false);
    }
  };

  const addServer = async () => {
    if (!serverForm.name || !serverForm.dns) { alert('Preencha nome e DNS'); return; }
    try {
      await api.post('/api/playlist-manager/add-server', serverForm);
      addLog(`Servidor adicionado: ${serverForm.name} (${serverForm.dns})`);
      setServerForm({ name: '', dns: '' });
      setShowAddModal(false);
      fetchServers();
    } catch (error) {
      alert('Erro ao adicionar servidor');
    }
  };

  const deleteServer = async (id, name) => {
    if (!window.confirm(`Deseja deletar ${name}?`)) return;
    try {
      await api.delete(`/api/playlist-manager/server/${id}`);
      addLog(`🗑️ Servidor deletado: ${name}`);
      fetchServers();
      setSelectedServers(prev => prev.filter(sid => sid !== id));
    } catch (error) {
      alert('Erro ao deletar servidor');
    }
  };

  const toggleServer = (id) => setSelectedServers(prev =>
    prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
  );

  const selectAll = () => setSelectedServers(
    selectedServers.length === servers.length ? [] : servers.map(s => s.id)
  );

  const openRegisterModal = () => {
    if (!selectedServers.length) { alert('Selecione pelo menos um servidor!'); return; }
    if (!currentPlatform) { alert('Selecione uma plataforma primeiro!'); return; }
    setShowRegisterModal(true);
  };

  const registerPlaylists = async () => {
    const { mac, username, password } = registerForm;
    if (!mac || !username || !password) { alert('Preencha todos os campos'); return; }
    if (!/^[0-9A-Fa-f:]{17}$/.test(mac)) { alert('Formato de MAC inválido. Use: 00:1A:79:XX:XX:XX'); return; }
    setRegistering(true);
    addLog(`⏳ Iniciando registro em lote: ${selectedServers.length} servidor(es)`);
    try {
      const response = await api.post('/api/playlist-manager/register', {
        platform: currentPlatform, serverIds: selectedServers, mac, username, password
      });
      response.data.results.forEach(r =>
        addLog(r.success ? `✅ ${r.server} - ${r.message}` : `❌ ${r.server} - ${r.error}`)
      );
      setStats(prev => ({
        total: prev.total + response.data.summary.total,
        success: prev.success + response.data.summary.success,
        error: prev.error + response.data.summary.error,
      }));
      addLog(`🎉 Finalizado! Sucesso: ${response.data.summary.success} | Erros: ${response.data.summary.error}`);
      setShowRegisterModal(false);
      setRegisterForm({ mac: '', username: '', password: '' });
    } catch (error) {
      addLog(`❌ Erro: ${error.response?.data?.error || error.message}`);
      alert('Erro no registro em lote');
    } finally {
      setRegistering(false);
    }
  };

  const addLog = (message) => {
    const time = new Date().toLocaleTimeString('pt-BR');
    setActivityLog(prev => [{ time, message }, ...prev.slice(0, 49)]);
  };

  if (loading) return (
    <div className="text-center py-12">
      <Loader className="inline-block animate-spin mb-4 text-primary" size={32} />
      <p className="text-gray-400">Carregando...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Seleção de Plataforma */}
      <div className="bg-card rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-bold mb-4">1. Selecione a Plataforma</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {platforms.map(p => (
            <button
              key={p.id}
              onClick={() => { setCurrentPlatform(p.id); addLog(`🎯 Plataforma: ${p.name}`); }}
              className={`p-4 rounded-lg border-2 transition-all ${
                currentPlatform === p.id
                  ? `${p.color} border-white text-white`
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="text-3xl mb-2">{p.icon}</div>
              <div className="font-semibold">{p.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Gerenciamento de Servidores */}
      <div className="bg-card rounded-lg p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">2. Gerenciar Servidores</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 transition"
          >
            <Plus size={18} /> Adicionar Servidor
          </button>
        </div>

        {servers.length > 0 && (
          <div className="mb-4 flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={selectedServers.length === servers.length} onChange={selectAll} className="w-4 h-4" />
              <span className="text-sm">Selecionar Todos</span>
            </label>
            <span className="text-sm text-gray-400">{selectedServers.length} de {servers.length} selecionado(s)</span>
          </div>
        )}

        <div className="space-y-2">
          {servers.map(server => (
            <div
              key={server.id}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                selectedServers.includes(server.id) ? 'border-primary bg-primary/10' : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <input type="checkbox" checked={selectedServers.includes(server.id)} onChange={() => toggleServer(server.id)} className="w-5 h-5" />
              <Server className="text-primary" size={20} />
              <div className="flex-1">
                <div className="font-semibold">{server.name}</div>
                <div className="text-sm text-gray-400">{server.dns}</div>
              </div>
              <button onClick={() => deleteServer(server.id, server.name)} className="text-red-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {servers.length === 0 && <p className="text-center text-gray-400 py-8">Nenhum servidor cadastrado. Adicione um acima! 👆</p>}
        </div>

        {servers.length > 0 && (
          <button
            onClick={openRegisterModal}
            disabled={!selectedServers.length || !currentPlatform}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Play size={20} />
            {selectedServers.length > 0 && currentPlatform
              ? `Registrar ${selectedServers.length} Servidor(es)`
              : 'Registrar Selecionados'}
          </button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Cadastrado', value: stats.total, color: 'text-blue-400' },
          { label: 'Sucesso', value: stats.success, color: 'text-green-400' },
          { label: 'Erros', value: stats.error, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-lg p-4 border border-gray-800 text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Log */}
      <div className="bg-card rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-bold mb-4">Log de Atividades</h2>
        <div className="bg-dark rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm">
          {activityLog.length === 0
            ? <p className="text-gray-500">Nenhuma atividade ainda...</p>
            : activityLog.map((log, i) => (
              <div key={i} className="mb-1">
                <span className="text-gray-500">[{log.time}]</span> <span>{log.message}</span>
              </div>
            ))
          }
        </div>
      </div>

      {/* Modal: Adicionar Servidor */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Adicionar Servidor</h2>
            <div className="space-y-4">
              <input type="text" value={serverForm.name} onChange={e => setServerForm({ ...serverForm, name: e.target.value })}
                placeholder="Nome do servidor" className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white" />
              <div>
                <input type="text" value={serverForm.dns} onChange={e => setServerForm({ ...serverForm, dns: e.target.value })}
                  placeholder="DNS (ex: ultraflex.top)" className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white" />
                <p className="text-xs text-gray-500 mt-1">Apenas o domínio, sem http://</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">Cancelar</button>
                <button onClick={addServer} className="flex-1 px-4 py-2 bg-primary rounded-lg hover:bg-orange-600">Adicionar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Registro em Lote */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Registro em Lote</h2>
            <div className="mb-4 p-4 bg-dark rounded-lg text-sm text-gray-400">
              <div><strong>Plataforma:</strong> {platforms.find(p => p.id === currentPlatform)?.name}</div>
              <div><strong>Servidores:</strong> {selectedServers.length}</div>
              <div className="text-xs text-gray-500 mt-1">{servers.filter(s => selectedServers.includes(s.id)).map(s => s.name).join(', ')}</div>
            </div>
            <div className="space-y-4">
              <input type="text" value={registerForm.mac} onChange={e => setRegisterForm({ ...registerForm, mac: e.target.value })}
                placeholder="MAC Address (00:1A:79:XX:XX:XX)" className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white" />
              <input type="text" value={registerForm.username} onChange={e => setRegisterForm({ ...registerForm, username: e.target.value })}
                placeholder="Usuário" className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white" />
              <input type="password" value={registerForm.password} onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                placeholder="Senha" className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white" />
              <div className="flex gap-2">
                <button onClick={() => setShowRegisterModal(false)} disabled={registering} className="flex-1 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50">Cancelar</button>
                <button onClick={registerPlaylists} disabled={registering} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
                  {registering ? <><Loader className="animate-spin" size={18} /> Registrando...</> : <><CheckCircle size={18} /> Registrar</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Componente Principal ─────────────────────────────────────────────────────
const IptvServersManager = () => {
  const [activeTab, setActiveTab] = useState('servers');
  const [servers, setServers] = useState([]);
  const [qpanels, setQpanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddServer, setShowAddServer] = useState(false);
  const [showAddQpanel, setShowAddQpanel] = useState(false);
  const [showCreateAccounts, setShowCreateAccounts] = useState(false);

  const [serverForm, setServerForm] = useState({
    server_name: '', xtream_url: '', xtream_username: '', xtream_password: '', server_type: 'custom'
  });

  const [qpanelForm, setQpanelForm] = useState({
<<<<<<< HEAD
    panel_name: '', panel_url: '', panel_username: '', panel_password: ''
=======
    panel_name: '', panel_url: '', panel_username: ''
>>>>>>> 3c3854e05362c2ac37a66ad27250b54f25088cad
  });

  const [accountForm, setAccountForm] = useState({
    username: '', password: '', device_mac: '', selected_packages: []
  });

  // Log de atividades para debug
  const [debugLog, setDebugLog] = useState([]);
  
  const addDebugLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString('pt-BR');
    setDebugLog(prev => [{ time, message, type }, ...prev.slice(0, 49)]);
  };

  // Função para buscar dispositivo pelo MAC e preencher credenciais
  const handleMacLookup = async (mac, setForm) => {
    addDebugLog(`🔍 Buscando dispositivo com MAC: ${mac}`, 'info');
    console.log('🔍 handleMacLookup chamada com MAC:', mac);
    
    if (!mac || mac.length < 17) {
      addDebugLog('⚠️ MAC incompleto ou vazio, ignorando busca', 'warning');
      console.log('⚠️ MAC incompleto ou vazio, ignorando busca');
      return;
    }
    
    try {
      addDebugLog('📡 Buscando dispositivos na API...', 'info');
      console.log('📡 Buscando dispositivos...');
      const response = await api.get(`/api/device/list-all`);
      console.log('📦 Resposta da API:', response.data);
      
      const device = response.data.devices?.find(d => d.mac_address === mac);
      console.log('🔎 Dispositivo encontrado:', device);
      
      if (device && device.current_iptv_username && device.current_iptv_password) {
        addDebugLog(`✅ Dispositivo encontrado! Usuário: ${device.current_iptv_username}`, 'success');
        console.log('✅ Preenchendo credenciais:', {
          username: device.current_iptv_username,
          password: '***'
        });
        
        setForm(prev => ({
          ...prev,
          username: device.current_iptv_username,
          password: device.current_iptv_password
        }));
        
        alert(`✅ Credenciais preenchidas automaticamente!\nUsuário: ${device.current_iptv_username}`);
      } else {
        addDebugLog('⚠️ Dispositivo não encontrado ou sem credenciais IPTV', 'warning');
        console.log('⚠️ Dispositivo não encontrado ou sem credenciais IPTV');
        alert('⚠️ Dispositivo não encontrado ou não possui credenciais IPTV cadastradas');
      }
    } catch (err) {
      addDebugLog(`❌ Erro ao buscar dispositivo: ${err.message}`, 'error');
      console.error('❌ Erro ao buscar dispositivo:', err);
      alert('❌ Erro ao buscar dispositivo: ' + err.message);
    }
  };

  const [loadingPanels, setLoadingPanels] = useState({}); // { [panelId]: 'idle' | 'waiting' | 'done' | 'error' }
  const [panelStatus, setPanelStatus] = useState({});     // { [panelId]: string } mensagem de status
  const [selectedPackages, setSelectedPackages] = useState([]); // [{panel_id, panel_name, server_id, server_name, package_id, package_name}]
  const [showCreateFromPackages, setShowCreateFromPackages] = useState(false);
  const [createFromPkgForm, setCreateFromPkgForm] = useState({ username: '', password: '', device_mac: '' });
  const [creatingAccounts, setCreatingAccounts] = useState(false);

  useEffect(() => {
    Promise.all([loadServers(), loadQpanels()]).finally(() => setLoading(false));
  }, []);

  const loadServers = async () => {
    try {
      const response = await api.get('/api/iptv-plugin/servers');
      setServers(response.data.servers || []);
    } catch { setServers([]); }
  };

  const loadQpanels = async () => {
    try {
      const response = await api.get('/api/iptv-plugin/qpanels');
      setQpanels(response.data.panels || []);
    } catch { setQpanels([]); }
  };

  const handleAddServer = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/iptv-plugin/add-server', serverForm);
      alert('Servidor adicionado com sucesso!');
      setServerForm({ server_name: '', xtream_url: '', xtream_username: '', xtream_password: '', server_type: 'custom' });
      setShowAddServer(false);
      loadServers();
    } catch (err) { alert('Erro ao adicionar servidor: ' + err.response?.data?.error); }
  };

  const handleDeleteServer = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este servidor?')) return;
    try {
      await api.delete(`/api/iptv-plugin/server/${id}`);
      loadServers();
    } catch (err) { alert('Erro ao deletar: ' + err.response?.data?.error); }
  };

  const handleTestServer = async (id) => {
    try {
      const response = await api.post('/api/iptv-plugin/test-server', { server_id: id });
      alert(response.data.success ? '✅ Servidor online!' : '❌ Servidor offline');
    } catch (err) { alert('Erro ao testar: ' + err.response?.data?.error); }
  };

  const handleAddQpanel = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/iptv-plugin/add-qpanel', qpanelForm);
      alert('Painel qPanel adicionado!');
<<<<<<< HEAD
      setQpanelForm({ panel_name: '', panel_url: '', panel_username: '', panel_password: '' });
=======
      setQpanelForm({ panel_name: '', panel_url: '', panel_username: '' });
>>>>>>> 3c3854e05362c2ac37a66ad27250b54f25088cad
      setShowAddQpanel(false);
      loadQpanels();
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const handleDeleteQpanel = async (id) => {
    if (!window.confirm('Tem certeza?')) return;
    try {
      await api.delete(`/api/iptv-plugin/qpanel/${id}`);
      loadQpanels();
    } catch (err) { alert('Erro: ' + err.response?.data?.error); }
  };

  const handleLoadQpanelServers = async (qpanel) => {
    const id = qpanel.id;
    const setStatus = (msg) => setPanelStatus(prev => ({ ...prev, [id]: msg }));
    const setLoadState = (state) => setLoadingPanels(prev => ({ ...prev, [id]: state }));

    try {
      setLoadState('waiting');
<<<<<<< HEAD
      setStatus('⏳ Conectando diretamente ao backend...');

      let finalServers = [];
      let message = '';
      
      try {
        const saveResponse = await api.post('/api/iptv-plugin/qpanel-fetch-direct-servers', { 
          panel_id: id 
        });
        
        if (saveResponse.data.total > 0) {
          finalServers = saveResponse.data.servers;
          message = saveResponse.data.message;
        }
      } catch (backendErr) {
        console.warn("Backend fetch error, going to fallback...", backendErr);
      }

      // ==========================================
      // FALLBACK CLIENT-SIDE (BYPASS CLOUDFLARE)
      // ==========================================
      if (finalServers.length === 0) {
        setStatus('Bloqueio CF detectado. Tentando via Navegador (Client-Side)...');
        const baseUrl = qpanel.panel_url.replace(/\/$/, '');
        
        try {
          // Fase 1: Auth (Sigma usa POST /api/auth/login)
          const authRes = await axios.post(`${baseUrl}/api/auth/login`, {
            username: qpanel.panel_username,
            password: qpanel.panel_password
          }, { timeout: 10000 });
          
          const token = authRes.data?.token || authRes.data?.access_token || authRes.data?.data?.token;

          if (token) {
            // Fase 2: Pega servers e packages
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            const [srvRes, pkgRes] = await Promise.allSettled([
              axios.get(`${baseUrl}/api/servers`, config),
              axios.get(`${baseUrl}/api/packages`, config)
            ]);

            const rawSrv = srvRes.status === 'fulfilled' ? (srvRes.value.data?.data || srvRes.value.data || []) : [];
            const rawPkg = pkgRes.status === 'fulfilled' ? (pkgRes.value.data?.data || pkgRes.value.data || []) : [];

            if (rawSrv.length > 0) {
              finalServers = rawSrv.map(s => ({
                id: s.id || s.server_id,
                name: s.server_name || s.name || `Servidor ${s.id}`,
                dns: s.server_dns || s.dns || s.url || '',
                packages: rawPkg.filter(p => !p.server_id || Number(p.server_id) === Number(s.id))
              }));

              message = `✅ ${finalServers.length} servidor(es) carregado(s) via Navegador/Sigma`;
              
              // Fase 3: Envia os resultados pro backend para salvar
              await api.post('/api/iptv-plugin/qpanel-sync-arrays', {
                panel_id: id,
                servers: finalServers
              });
            }
          }
        } catch (clientErr) {
          console.error("Client fallback error:", clientErr);
        }
      }

      if (finalServers.length === 0) {
        setStatus(`❌ Falha: Ocorreu um erro no backend e o bypass do navegador também falhou.`);
        setLoadState('error');
      } else {
        setStatus(message);
        setLoadState('done');
      }

      // Recarregar os painéis para renderizar a nova lista
      await loadQpanels();
    } catch (err) {
      console.error(err);
      setStatus('❌ Erro Fatal: ' + (err.response?.data?.error || err.message));
=======
      setStatus('⏳ Conectando diretamente ao qPanel...');

      const saveResponse = await api.post('/api/iptv-plugin/qpanel-fetch-direct-servers', { 
        panel_id: id 
      });
      
      const { servers, total, message } = saveResponse.data;

      if (total === 0) {
        setStatus(`ℹ️ ${message || 'Nenhum servidor encontrado no painel.'}`);
        setLoadState('done');
      } else {
        setStatus(`✅ ${total} servidor(es) carregado(s) com sucesso!`);
        setLoadState('done');
      }

      // Recarregar lista de painéis para refletir os servidores salvos
      await loadQpanels();
    } catch (err) {
      console.error(err);
      setStatus('❌ Erro: ' + (err.response?.data?.error || err.message));
>>>>>>> 3c3854e05362c2ac37a66ad27250b54f25088cad
      setLoadState('error');
    }
  };

  const togglePackage = (pkg) => {
    const key = `${pkg.panel_id}-${pkg.server_id}-${pkg.package_id}`;
    setSelectedPackages(prev => {
      const exists = prev.find(p => `${p.panel_id}-${p.server_id}-${p.package_id}` === key);
      if (exists) return prev.filter(p => `${p.panel_id}-${p.server_id}-${p.package_id}` !== key);
      return [...prev, pkg];
    });
  };

  const isPackageSelected = (panel_id, server_id, package_id) => {
    return selectedPackages.some(p => p.panel_id === panel_id && p.server_id === server_id && p.package_id === package_id);
  };

  const handleCreateFromPackages = async (e) => {
    e.preventDefault();
    const { username, password, device_mac } = createFromPkgForm;
    if (password.length < 9) { alert('A senha deve ter no mínimo 9 caracteres'); return; }
    
    addDebugLog(`🚀 Iniciando criação de contas em ${selectedPackages.length} pacote(s) selecionado(s)`, 'info');
    addDebugLog(`👤 Usuário: ${username} | MAC: ${device_mac}`, 'info');
    
    setCreatingAccounts(true);
    try {
      const response = await api.post('/api/iptv-plugin/qpanel-create-accounts', {
        username, password, device_mac,
        selected_packages: selectedPackages.map(p => ({
          panel_id: p.panel_id,
          server_id: p.server_id,
          package_id: p.package_id,
          server_name: p.server_name
        }))
      });
      if (response.data.success) {
        const totalCreated = response.data.total_created || 0;
        addDebugLog(`✅ Sucesso! ${totalCreated} conta(s) criada(s) nos pacotes selecionados`, 'success');
        alert(`✅ ${totalCreated} conta(s) criada(s)!`);
        
        if (response.data.extracted_dns?.length > 0) {
          addDebugLog(`📡 Registrando ${response.data.extracted_dns.length} DNS(s) no dispositivo...`, 'info');
          await api.post('/api/iptv-plugin/register-dns-to-device', {
            device_mac, dns_list: response.data.extracted_dns, username, password
          });
          addDebugLog(`✅ ${response.data.extracted_dns.length} DNS(s) registrada(s) com sucesso!`, 'success');
          alert(`✅ ${response.data.extracted_dns.length} DNS(s) registrada(s) no dispositivo!`);
        }
        setShowCreateFromPackages(false);
        setSelectedPackages([]);
        setCreateFromPkgForm({ username: '', password: '', device_mac: '' });
      }
    } catch (err) {
      addDebugLog(`❌ Erro ao criar contas: ${err.response?.data?.error || err.message}`, 'error');
      alert('Erro: ' + (err.response?.data?.error || err.message));
    }
    finally { setCreatingAccounts(false); }
  };

  const handleCreateAccounts = async (e) => {
    e.preventDefault();
    if (accountForm.password.length < 9) { alert('A senha deve ter no mínimo 9 caracteres'); return; }
    
    addDebugLog(`🚀 Iniciando criação de contas em TODOS os painéis qPanel`, 'info');
    addDebugLog(`👤 Usuário: ${accountForm.username} | MAC: ${accountForm.device_mac}`, 'info');
    
    try {
      const response = await api.post('/api/iptv-plugin/qpanel-create-accounts', accountForm);
      if (response.data.success) {
        const totalCreated = response.data.total_created || 0;
        addDebugLog(`✅ Sucesso! ${totalCreated} conta(s) criada(s) em todos os painéis`, 'success');
        alert(`✅ ${totalCreated} conta(s) criada(s)!`);
        
        if (response.data.extracted_dns?.length > 0) {
          addDebugLog(`📡 Registrando ${response.data.extracted_dns.length} DNS(s) no dispositivo...`, 'info');
          await api.post('/api/iptv-plugin/register-dns-to-device', {
            device_mac: accountForm.device_mac,
            dns_list: response.data.extracted_dns,
            username: accountForm.username,
            password: accountForm.password
          });
          addDebugLog(`✅ ${response.data.extracted_dns.length} DNS(s) registrada(s) com sucesso!`, 'success');
          alert(`✅ ${response.data.extracted_dns.length} DNS(s) registrada(s) no dispositivo!`);
        }
        setShowCreateAccounts(false);
        setAccountForm({ username: '', password: '', device_mac: '', selected_packages: [] });
      }
    } catch (err) {
      addDebugLog(`❌ Erro ao criar contas: ${err.response?.data?.error || err.message}`, 'error');
      alert('Erro: ' + err.response?.data?.error);
    }
  };

  const tabs = [
    { id: 'servers', label: 'Servidores IPTV', icon: Settings },
    { id: 'qpanel', label: 'Painéis qPanel', icon: Globe },
    { id: 'playlist', label: 'Playlist Manager', icon: List },
    { id: 'tree', label: 'Árvore IPTV', icon: TreePine },
    { id: 'clean', label: 'Limpar qPanel', icon: Trash2 },
  ];

  const inputSt = { width:'100%', padding:'10px 14px', background:'rgba(5,5,5,0.6)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'#fff', fontSize:13, outline:'none', boxSizing:'border-box' };
  const btnPri  = { display:'inline-flex', alignItems:'center', gap:7, padding:'9px 18px', background:'linear-gradient(135deg,#FFA500,#FF6B00)', border:'none', borderRadius:10, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 12px rgba(255,165,0,0.3)' };
  const btnGh   = { display:'inline-flex', alignItems:'center', gap:7, padding:'9px 14px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'#a1a1aa', fontSize:13, fontWeight:600, cursor:'pointer' };
  const cardSt  = { background:'rgba(17,17,17,0.7)', backdropFilter:'blur(14px)', border:'1px solid rgba(255,165,0,0.1)', borderRadius:16, padding:24, boxShadow:'0 8px 32px rgba(0,0,0,0.35)' };
  const logColor = (type) => ({ error:'#f87171', warning:'#facc15', success:'#34d399', info:'#a1a1aa' }[type]||'#a1a1aa');

  if (loading) return (
    <div style={{ textAlign:'center', padding:48, color:'#52525b' }}>
      <Loader size={28} color='#FFA500' style={{ animation:'spin 1s linear infinite', display:'block', margin:'0 auto 12px' }}/>
      Carregando...
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:26, fontWeight:900, color:'#fff', display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
          <Settings size={26} color='#FFA500'/> Plugin IPTV Unificado
        </h1>
        <p style={{ fontSize:12, color:'#52525b' }}>Gerenciar servidores IPTV, painéis qPanel e playlists em um só lugar</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:24, background:'rgba(17,17,17,0.6)', padding:5, borderRadius:14, flexWrap:'wrap', border:'1px solid rgba(255,255,255,0.06)', width:'fit-content' }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:10, border:'none', cursor:'pointer', fontSize:12, fontWeight:700, transition:'all .2s', background:activeTab===id?'rgba(255,165,0,0.15)':'transparent', color:activeTab===id?'#FFA500':'#71717a', boxShadow:activeTab===id?'0 2px 10px rgba(255,165,0,0.15)':'none' }}>
            <Icon size={14}/> {label}
          </button>
        ))}
      </div>

      {/* ── Tab: Servidores IPTV ── */}
      {activeTab === 'servers' && (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div style={cardSt}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
              <div>
                <h2 style={{ fontSize:16, fontWeight:800, color:'#fff', marginBottom:2 }}>Servidores IPTV</h2>
                <p style={{ fontSize:12, color:'#52525b' }}>Gerencie seus servidores Xtream Codes</p>
              </div>
              <button onClick={() => setShowAddServer(!showAddServer)} style={btnPri}><Plus size={15}/> Adicionar Servidor</button>
            </div>

            {showAddServer && (
              <form onSubmit={handleAddServer} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:20, marginBottom:16 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                  <input style={inputSt} type='text' placeholder='Nome do servidor' value={serverForm.server_name} onChange={e=>setServerForm({...serverForm,server_name:e.target.value})} required/>
                  <input style={inputSt} type='url' placeholder='URL Xtream (http://...)' value={serverForm.xtream_url} onChange={e=>setServerForm({...serverForm,xtream_url:e.target.value})} required/>
                  <input style={inputSt} type='text' placeholder='Usuário Xtream' value={serverForm.xtream_username} onChange={e=>setServerForm({...serverForm,xtream_username:e.target.value})}/>
                  <input style={inputSt} type='password' placeholder='Senha Xtream' value={serverForm.xtream_password} onChange={e=>setServerForm({...serverForm,xtream_password:e.target.value})}/>
                  <select style={{ ...inputSt, gridColumn:'span 2' }} value={serverForm.server_type} onChange={e=>setServerForm({...serverForm,server_type:e.target.value})}>
                    <option value='custom'>Custom</option><option value='ibopro'>IboPro</option><option value='ibocast'>IboCast</option><option value='vuplayer'>VuPlayer</option>
                  </select>
                </div>
                <button type='submit' style={{ ...btnPri, width:'100%', justifyContent:'center' }}>Adicionar Servidor</button>
              </form>
            )}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
            {servers.length === 0 ? (
              <div style={{ gridColumn:'1/-1', textAlign:'center', padding:48, background:'rgba(17,17,17,0.5)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:14, color:'#52525b' }}>
                <Settings size={40} color='#27272a' style={{ display:'block', margin:'0 auto 12px' }}/>
                <p>Nenhum servidor IPTV configurado</p>
              </div>
            ) : servers.map(server => (
              <div key={server.id} style={{ ...cardSt, padding:18, transition:'border-color .2s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(255,165,0,0.2)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,165,0,0.1)'}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <h3 style={{ fontSize:14, fontWeight:700, color:'#e4e4e7', marginBottom:3 }}>{server.server_name}</h3>
                    <p style={{ fontFamily:'monospace', fontSize:11, color:'#52525b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{server.xtream_url}</p>
                  </div>
                  <div style={{ display:'flex', gap:6, marginLeft:8 }}>
                    <button onClick={()=>handleTestServer(server.id)} title='Testar'
                      style={{ width:30, height:30, borderRadius:8, background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.2)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#34d399' }}>
                      <Play size={13}/>
                    </button>
                    <button onClick={()=>handleDeleteServer(server.id)} title='Deletar'
                      style={{ width:30, height:30, borderRadius:8, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#f87171' }}>
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:11, color:'#52525b', textTransform:'capitalize' }}>{server.server_type}</span>
                  {server.test_status && (
                    <span style={{ fontSize:11, fontWeight:700, color:server.test_status==='online'?'#34d399':'#f87171' }}>● {server.test_status}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: qPanel ── */}
      {activeTab === 'qpanel' && (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div style={cardSt}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
              <div>
                <h2 style={{ fontSize:16, fontWeight:800, color:'#fff', marginBottom:2 }}>Painéis qPanel</h2>
                <p style={{ fontSize:12, color:'#52525b' }}>Gerencie múltiplos painéis e crie contas IPTV em massa</p>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={()=>setShowAddQpanel(!showAddQpanel)} style={btnPri}><Plus size={15}/> Adicionar Painel</button>
                <button onClick={()=>setShowCreateAccounts(!showCreateAccounts)} style={{ ...btnGh, color:'#34d399', borderColor:'rgba(16,185,129,0.25)' }}><Users size={15}/> Criar Contas</button>
              </div>
            </div>

            {showAddQpanel && (
              <form onSubmit={handleAddQpanel} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:18, marginBottom:16 }}>
<<<<<<< HEAD
                <h4 style={{ fontSize:13, fontWeight:800, color:'#fff', marginBottom:12 }}>📡 Conectar Painel qPanel</h4>
                <div style={{ background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:9, padding:'10px 14px', marginBottom:12, fontSize:11, color:'#93c5fd' }}>
                  ✅ <strong>Sem API key!</strong> O sistema usa seu <strong>usuário + senha</strong> de admin e tenta conectar automaticamente via:<br/>
                  &nbsp;&nbsp;① <code>panel_api.php</code> (Xtream UI — mais comum no Brasil)<br/>
                  &nbsp;&nbsp;② <code>player_api.php</code> (Xtream Codes)<br/>
                  &nbsp;&nbsp;③ REST API com autenticação por sessão
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                  <input style={inputSt} type='text' placeholder='Nome do painel (ex: Meu qPanel)' value={qpanelForm.panel_name} onChange={e=>setQpanelForm({...qpanelForm,panel_name:e.target.value})} required/>
                  <input style={inputSt} type='url' placeholder='URL do painel (http://painel.com)' value={qpanelForm.panel_url} onChange={e=>setQpanelForm({...qpanelForm,panel_url:e.target.value})} required/>
                  <input style={inputSt} type='text' placeholder='Usuário admin do painel' value={qpanelForm.panel_username} onChange={e=>setQpanelForm({...qpanelForm,panel_username:e.target.value})} required/>
                  <input style={inputSt} type='password' placeholder='Senha do admin' value={qpanelForm.panel_password} onChange={e=>setQpanelForm({...qpanelForm,panel_password:e.target.value})} required/>
                </div>
                <button type='submit' style={{ ...btnPri, width:'100%', justifyContent:'center' }}>🔗 Adicionar Painel</button>
=======
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                  <input style={inputSt} type='text' placeholder='Nome do painel' value={qpanelForm.panel_name} onChange={e=>setQpanelForm({...qpanelForm,panel_name:e.target.value})} required/>
                  <input style={inputSt} type='url' placeholder='URL do painel (http://...)' value={qpanelForm.panel_url} onChange={e=>setQpanelForm({...qpanelForm,panel_url:e.target.value})} required/>
                  <input style={{ ...inputSt, gridColumn:'span 2' }} type='text' placeholder='Token API / Chave de Acesso (Ex: NDM4NTh12...)' value={qpanelForm.panel_username} onChange={e=>setQpanelForm({...qpanelForm,panel_username:e.target.value})} title="Necessário para acessar o painel via backend sem plugin"/>
                </div>
                <p style={{ fontSize:11, color:'#52525b', marginBottom:10 }}>ℹ️ Conexão direta segura API-to-API sem necessidade de Plugins locais.</p>
                <button type='submit' style={{ ...btnPri, width:'100%', justifyContent:'center' }}>Adicionar Painel qPanel</button>
>>>>>>> 3c3854e05362c2ac37a66ad27250b54f25088cad
              </form>
            )}

            {showCreateAccounts && (
              <form onSubmit={handleCreateAccounts} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:18, marginBottom:16 }}>
                <h3 style={{ fontSize:14, fontWeight:800, color:'#fff', marginBottom:14 }}>🎯 Criar Contas IPTV em Massa</h3>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                  <input style={inputSt} type='text' placeholder='Nome de usuário' value={accountForm.username} onChange={e=>setAccountForm({...accountForm,username:e.target.value})} required/>
                  <input style={inputSt} type='password' placeholder='Senha (mín. 9 caracteres)' value={accountForm.password} onChange={e=>setAccountForm({...accountForm,password:e.target.value})} required/>
                </div>
                <input style={{ ...inputSt, marginBottom:10 }} type='text' placeholder='MAC do dispositivo (AA:BB:CC:DD:EE:FF)' value={accountForm.device_mac} onChange={e=>setAccountForm({...accountForm,device_mac:e.target.value})} onBlur={e=>handleMacLookup(e.target.value,setAccountForm)} required/>
                <div style={{ background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:10, padding:'10px 14px', marginBottom:12, fontSize:12, color:'#93c5fd' }}>
                  <strong>🚀 Como funciona:</strong><br/>
                  • Cria contas em TODOS os painéis qPanel configurados<br/>
                  • Extrai DNS automaticamente • Registra no dispositivo TV MAXX PRO
                </div>
                <button type='submit' style={{ ...btnPri, width:'100%', justifyContent:'center' }}>🎯 Criar Contas + Registrar no App</button>
              </form>
            )}
          </div>

          {/* Pacotes selecionados */}
          {selectedPackages.length > 0 && (
            <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:14, padding:18 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, flexWrap:'wrap', gap:8 }}>
                <div>
                  <h3 style={{ fontSize:14, fontWeight:800, color:'#34d399', marginBottom:3 }}>✅ {selectedPackages.length} pacote(s) selecionado(s)</h3>
                  <p style={{ fontSize:11, color:'#94a3b8' }}>{selectedPackages.map(p=>`${p.panel_name} › ${p.server_name} › ${p.package_name}`).join(' | ')}</p>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={()=>setSelectedPackages([])} style={btnGh}>Limpar</button>
                  <button onClick={()=>setShowCreateFromPackages(!showCreateFromPackages)} style={{ ...btnGh, color:'#34d399', borderColor:'rgba(16,185,129,0.25)' }}><Users size={14}/> Criar Contas</button>
                </div>
              </div>

              {showCreateFromPackages && (
                <form onSubmit={handleCreateFromPackages} style={{ background:'rgba(5,5,5,0.5)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:16, marginTop:10 }}>
                  <h4 style={{ fontSize:13, fontWeight:800, color:'#fff', marginBottom:12 }}>🎯 Criar contas nos pacotes selecionados</h4>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                    <input style={inputSt} type='text' placeholder='Usuário' value={createFromPkgForm.username} onChange={e=>setCreateFromPkgForm({...createFromPkgForm,username:e.target.value})} required/>
                    <input style={inputSt} type='password' placeholder='Senha (mín. 9 caracteres)' value={createFromPkgForm.password} onChange={e=>setCreateFromPkgForm({...createFromPkgForm,password:e.target.value})} required/>
                  </div>
                  <input style={{ ...inputSt, marginBottom:12 }} type='text' placeholder='MAC do dispositivo' value={createFromPkgForm.device_mac} onChange={e=>setCreateFromPkgForm({...createFromPkgForm,device_mac:e.target.value})} onBlur={e=>handleMacLookup(e.target.value,setCreateFromPkgForm)} required/>
                  <div style={{ display:'flex', gap:8 }}>
                    <button type='button' onClick={()=>setShowCreateFromPackages(false)} style={{ ...btnGh, flex:1, justifyContent:'center' }}>Cancelar</button>
                    <button type='submit' disabled={creatingAccounts} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'10px', background:'linear-gradient(135deg,#22c55e,#16a34a)', border:'none', borderRadius:10, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', opacity:creatingAccounts?0.7:1 }}>
                      {creatingAccounts ? <><Loader size={14} style={{animation:'spin 1s linear infinite'}}/> Criando...</> : '🎯 Criar Contas'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
            {qpanels.length === 0 ? (
              <div style={{ gridColumn:'1/-1', textAlign:'center', padding:48, background:'rgba(17,17,17,0.5)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:14, color:'#52525b' }}>
                <Globe size={40} color='#27272a' style={{ display:'block', margin:'0 auto 12px' }}/>
                <p>Nenhum painel qPanel configurado</p>
              </div>
            ) : qpanels.map(qpanel => {
              const panelLoadState = loadingPanels[qpanel.id];
              const statusMsg = panelStatus[qpanel.id];
              const isLoading = panelLoadState === 'waiting';
              const loadedServers = qpanel.servers || [];
              const stColor = panelLoadState==='error'?'rgba(239,68,68,0.1)':panelLoadState==='done'?'rgba(16,185,129,0.1)':'rgba(59,130,246,0.1)';
              const stTxt   = panelLoadState==='error'?'#f87171':panelLoadState==='done'?'#34d399':'#60a5fa';
              return (
                <div key={qpanel.id} style={{ ...cardSt, padding:18 }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <h3 style={{ fontSize:14, fontWeight:700, color:'#e4e4e7', marginBottom:3 }}>{qpanel.panel_name}</h3>
                      <p style={{ fontFamily:'monospace', fontSize:11, color:'#52525b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{qpanel.panel_url}</p>
                    </div>
                    <button onClick={()=>handleDeleteQpanel(qpanel.id)} style={{ width:28, height:28, borderRadius:7, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#f87171', flexShrink:0, marginLeft:8 }}><Trash2 size={12}/></button>
                  </div>

                  <div style={{ display:'flex', gap:10, marginBottom:10 }}>
                    <span style={{ fontSize:11, color:'#52525b' }}>Status: <strong style={{ color:'#34d399' }}>{qpanel.status}</strong></span>
                    <span style={{ fontSize:11, color:'#52525b' }}>· {new Date(qpanel.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>

                  {loadedServers.length > 0 && (
                    <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, padding:10, marginBottom:10, maxHeight:210, overflowY:'auto' }}>
                      <p style={{ fontSize:10, color:'#71717a', fontWeight:700, marginBottom:8 }}>🖥️ {loadedServers.length} servidor(es):</p>
                      {loadedServers.map((s, i) => {
                        const serverData = s.server_data ? (typeof s.server_data==='string'?JSON.parse(s.server_data):s.server_data) : s;
                        const packages = s.packages || serverData.packages || [];
                        const serverId = s.id || serverData.id || i;
                        return (
                          <div key={i} style={{ marginBottom:8 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                              <span style={{ width:6, height:6, borderRadius:'50%', background:'#34d399', flexShrink:0 }}/>
                              <span style={{ fontSize:11, fontWeight:700, color:'#a1a1aa', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name||s.server_name}</span>
                              {s.dns && <span style={{ fontSize:10, color:'#52525b' }}>· {s.dns}</span>}
                            </div>
                            {packages.length > 0 ? (
                              <div style={{ paddingLeft:14 }}>
                                {packages.map((pkg, pi) => {
                                  const pkgId = pkg.id || pkg.package_id || pi;
                                  const sel = isPackageSelected(qpanel.id, serverId, pkgId);
                                  return (
                                    <label key={pi} style={{ display:'flex', alignItems:'center', gap:7, cursor:'pointer', padding:'3px 6px', borderRadius:6, background:sel?'rgba(255,165,0,0.1)':'transparent', marginBottom:2 }}>
                                      <input type='checkbox' checked={sel}
                                        onChange={()=>togglePackage({ panel_id:qpanel.id, panel_name:qpanel.panel_name, server_id:serverId, server_name:s.name||s.server_name, package_id:pkgId, package_name:pkg.name })}
                                        style={{ accentColor:'#FFA500', width:12, height:12 }}/>
                                      <span style={{ fontSize:11, color:sel?'#FFA500':'#71717a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{pkg.name}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            ) : <p style={{ paddingLeft:14, fontSize:10, color:'#3f3f46' }}>Sem pacotes</p>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {statusMsg && (
<<<<<<< HEAD
                    <div style={{ marginBottom:10, padding:'8px 12px', borderRadius:9, background:stColor, fontSize:11, fontWeight:600, color:stTxt, lineHeight:1.5 }}>{statusMsg}</div>
                  )}

                  {loadedServers.length === 0 && !statusMsg && (
                    <div style={{ marginBottom:8, padding:'6px 10px', borderRadius:8, background:'rgba(255,255,255,0.03)', fontSize:10, color:'#52525b' }}>
                      🔑 Usa usuário + senha · Tenta panel_api.php → player_api.php → REST automaticamente
                    </div>
=======
                    <div style={{ marginBottom:10, padding:'8px 12px', borderRadius:9, background:stColor, fontSize:11, fontWeight:600, color:stTxt }}>{statusMsg}</div>
>>>>>>> 3c3854e05362c2ac37a66ad27250b54f25088cad
                  )}

                  <button onClick={()=>handleLoadQpanelServers(qpanel)} disabled={isLoading}
                    style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'9px', background:isLoading?'rgba(255,255,255,0.04)':'linear-gradient(135deg,#FFA500,#FF6B00)', border:isLoading?'1px solid rgba(255,255,255,0.08)':'none', borderRadius:10, color:isLoading?'#52525b':'#fff', fontSize:12, fontWeight:700, cursor:isLoading?'not-allowed':'pointer', opacity:isLoading?0.7:1 }}>
<<<<<<< HEAD
                    {isLoading ? <><Loader size={13} style={{animation:'spin 1s linear infinite'}}/>Conectando ao painel...</> : <>{loadedServers.length>0?'🔄 Recarregar':'🔌 Carregar'} Servidores</> }
=======
                    {isLoading ? <><Loader size={13} style={{animation:'spin 1s linear infinite'}}/>Carregando...</> : <>🔄 {loadedServers.length>0?'Recarregar':'Carregar'} Servidores</>}
>>>>>>> 3c3854e05362c2ac37a66ad27250b54f25088cad
                  </button>
                </div>
              );
            })}
          </div>

          {/* Log */}
          <div style={{ ...cardSt, marginTop:4 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <p style={{ fontSize:14, fontWeight:800, color:'#fff' }}>📋 Log de Atividades</p>
              <button onClick={()=>setDebugLog([])} style={btnGh}>Limpar Log</button>
            </div>
            <div style={{ background:'rgba(5,5,5,0.7)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:10, padding:'12px 14px', maxHeight:200, overflowY:'auto', fontFamily:'monospace', fontSize:11 }}>
              {debugLog.length===0
                ? <p style={{ color:'#3f3f46' }}>Nenhuma atividade ainda...</p>
                : debugLog.map((log,i) => (
                  <div key={i} style={{ marginBottom:4, color:logColor(log.type) }}>
                    <span style={{ color:'#52525b' }}>[{log.time}]</span> {log.message}
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Playlist Manager ── */}
      {activeTab === 'playlist' && <PlaylistManagerComponent />}

      {/* ── Tab: Árvore IPTV ── */}
      {activeTab === 'tree' && <IptvTreeTab />}

      {/* ── Tab: Limpar qPanel ── */}
      {activeTab === 'clean' && <CleanQpanelTab />}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default IptvServersManager;
