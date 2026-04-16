import { useState, useEffect } from 'react';
import api from '../services/api';
import axios from 'axios';
import { 
  Plus, Trash2, Play, Globe, Users, Settings, Server, List, 
  CheckCircle, Loader, Search, XCircle, TreePine, RefreshCcw, 
  Tv, MonitorPlay, Box, Cast, Radio 
} from 'lucide-react';
import IptvTreeViewer from './IptvTreeViewer';

// ─── Tab: Limpar qPanel (Plugin 1) ───────────────────────────────────────────
const CleanQpanelTab = () => {
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');
  const [useRelay, setUseRelay] = useState(false); // Alternar entre API Direta ou Plugin de Navegador

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchUsername) return;
    setIsSearching(true);
    setSearchStatus('Buscando cliente nos painéis...');
    
    try {
      const endpoint = useRelay ? '/api/iptv-plugin/relay-fetch-qpanel' : '/api/iptv-plugin/fetch-qpanel-direct';
      const res = await api.post(endpoint, {
        username: searchUsername,
        method: 'search'
      });
      
      if (res.data.success) {
        setSearchResults(res.data.servers || []);
        setSearchStatus(`Encontrado(s) ${res.data.servers?.length || 0} servidor(es).`);
      } else {
        setSearchStatus('Nenhum resultado encontrado.');
      }
    } catch (err) {
      console.error(err);
      setSearchStatus('Erro ao buscar cliente.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#111] border border-orange-500/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-orange-500 mb-4 flex items-center gap-2">
          <Search size={20} /> Localizar Cliente (qPanel)
        </h3>
        
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            className="flex-1 bg-black border border-white/10 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
            placeholder="Digite o usuário do cliente..."
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
          />
          <div className="flex items-center gap-2 px-4">
            <input 
              type="checkbox" 
              id="useRelay" 
              checked={useRelay} 
              onChange={() => setUseRelay(!useRelay)}
              className="accent-orange-500"
            />
            <label htmlFor="useRelay" className="text-sm text-gray-400">Usar Relay (Plugin Chrome)</label>
          </div>
          <button 
            type="submit"
            disabled={isSearching}
            className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-lg flex items-center justify-center gap-2 transition-all font-bold disabled:opacity-50"
          >
            {isSearching ? <Loader className="animate-spin" /> : <Search size={18} />}
            BUSCAR
          </button>
        </form>
        {searchStatus && <p className="mt-2 text-sm text-gray-400 italic">{searchStatus}</p>}
      </div>

      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map((server, idx) => (
            <div key={idx} className="bg-[#111] border border-white/5 rounded-xl p-5 hover:border-orange-500/40 transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                  <Server size={20} />
                </div>
                <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-1 rounded-full border border-green-500/20">
                  ATIVO
                </span>
              </div>
              <h4 className="font-bold text-white mb-1">{server.server_name || 'Servidor Desconhecido'}</h4>
              <p className="text-xs text-gray-500 mb-4 font-mono truncate">{server.server_dns}</p>
              
              <div className="flex gap-2">
                <button className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-xs font-bold transition-all border border-white/10">
                  RENOVAR
                </button>
                <button className="flex-1 bg-red-600/10 hover:bg-red-600/20 text-red-500 py-2 rounded-lg text-xs font-bold transition-all border border-red-500/10">
                  DELETAR
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Página Principal ────────────────────────────────────────────────────────
const IptvServersManager = () => {
  const [activeTab, setActiveTab] = useState('tree'); // 'tree', 'clean', 'sync', 'qpanel'
  const [stats, setStats] = useState({ servers: 0, playlists: 0, clients: 0 });

  useEffect(() => {
    // Carregar estatísticas básicas
    api.get('/api/iptv-plugin/check-tables').then(res => {
      if (res.data.success) {
        setStats({
          servers: res.data.tables.iptv_servers.count,
          playlists: res.data.tables.iptv_playlists.count,
          clients: res.data.tables.qpanel_accounts?.count || 0
        });
      }
    }).catch(console.error);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Estilo TV MAXX PRO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
            <div className="p-2 bg-orange-600 rounded-lg shadow-[0_0_20px_rgba(255,165,0,0.4)]">
              <Tv size={28} />
            </div>
            IPTV <span className="text-orange-500">MULTIMANAGER</span>
          </h1>
          <p className="text-gray-500 mt-1">Gerenciamento centralizado de painéis e servidores Xtream.</p>
        </div>

        <div className="flex gap-3">
          <div className="bg-[#111] border border-white/5 rounded-xl p-3 flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Servidores</p>
              <p className="text-lg font-black text-white italic">{stats.servers}</p>
            </div>
            <div className="h-8 w-[1px] bg-white/10"></div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Clientes</p>
              <p className="text-lg font-black text-white italic">{stats.clients}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
        {[
          { id: 'tree', label: 'MAPA DE CONTEÚDO', icon: TreePine },
          { id: 'clean', label: 'LIMPEZA QPANEL', icon: Trash2 },
          { id: 'sync', label: 'SINCRONIZAÇÃO', icon: RefreshCcw },
          { id: 'qpanel', label: 'CONECTAR PAINEL', icon: Plus },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap border
              ${activeTab === tab.id 
                ? 'bg-orange-600 border-orange-500 text-white shadow-[0_0_15px_rgba(255,165,0,0.3)]' 
                : 'bg-[#111] border-white/5 text-gray-500 hover:text-white hover:border-white/20'}
            `}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Renderização das Telas */}
      <div className="animate-in fade-in duration-500">
        {activeTab === 'tree' && <IptvTreeViewer />}
        {activeTab === 'clean' && <CleanQpanelTab />}
        {activeTab === 'qpanel' && (
          <div className="bg-[#111] border border-white/5 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-orange-600/10 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Adicionar Novo Servidor/Painel</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Conecte um painel Xtream UI, qPanel ou servidor REST para gerenciar seus clientes de forma unificada.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
               <button className="bg-orange-600 hover:bg-orange-500 text-white p-4 rounded-xl font-bold transition-all">
                  XTREAM UI / CODES
               </button>
               <button className="bg-[#222] hover:bg-[#333] text-white p-4 rounded-xl font-bold transition-all border border-white/10">
                  API QPANEL
               </button>
            </div>
          </div>
        )}
        {activeTab === 'sync' && (
          <div className="bg-[#111] border border-white/5 rounded-2xl p-12 text-center">
            <RefreshCcw className="mx-auto mb-4 text-orange-500 animate-spin-slow" size={48} />
            <h3 className="text-xl font-bold text-white">Sincronização em Lote</h3>
            <p className="text-gray-400 mt-2">Em breve: Sincronize todos os seus painéis automaticamente com o MaxxControl.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IptvServersManager;
