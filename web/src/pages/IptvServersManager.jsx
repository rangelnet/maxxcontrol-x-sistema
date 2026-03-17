import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Play, AlertCircle, Globe, Users, Settings } from 'lucide-react';

const IptvServersManager = () => {
  const [activeTab, setActiveTab] = useState('servers'); // 'servers', 'qpanel'
  const [servers, setServers] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [qpanels, setQpanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedQpanel, setSelectedQpanel] = useState(null);
  const [showAddServer, setShowAddServer] = useState(false);
  const [showAddPlaylist, setShowAddPlaylist] = useState(false);
  const [showAddQpanel, setShowAddQpanel] = useState(false);
  const [showCreateAccounts, setShowCreateAccounts] = useState(false);

  // Form states
  const [serverForm, setServerForm] = useState({
    server_name: '',
    xtream_url: '',
    xtream_username: '',
    xtream_password: '',
    server_type: 'custom'
  });

  const [playlistForm, setPlaylistForm] = useState({
    playlist_name: '',
    playlist_url: '',
    playlist_type: 'custom'
  });

  const [qpanelForm, setQpanelForm] = useState({
    panel_name: '',
    panel_url: '',
    panel_username: '',
    panel_password: ''
  });

  const [accountForm, setAccountForm] = useState({
    username: '',
    password: '',
    device_mac: '',
    selected_packages: []
  });

  // Carregar dados iniciais
  useEffect(() => {
    loadServers();
    loadQpanels();
  }, []);

  const loadServers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/iptv-plugin/servers');
      setServers(response.data.servers || []);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar servidores:', err);
      // Não bloquear a tela - apenas mostrar lista vazia
      setServers([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const loadQpanels = async () => {
    try {
      const response = await api.get('/api/iptv-plugin/qpanels');
      setQpanels(response.data.panels || []);
    } catch (err) {
      console.error('Erro ao carregar painéis qPanel:', err);
      setQpanels([]);
    }
  };

  const loadPlaylists = async (serverId) => {
    try {
      const response = await api.get(`/api/iptv-plugin/playlists/${serverId}`);
      setPlaylists(response.data.playlists || []);
    } catch (err) {
      console.error('Erro ao carregar playlists:', err);
    }
  };

  // Handlers para servidores IPTV
  const handleAddServer = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/iptv-plugin/add-server', serverForm);
      alert('Servidor adicionado com sucesso!');
      setServerForm({
        server_name: '',
        xtream_url: '',
        xtream_username: '',
        xtream_password: '',
        server_type: 'custom'
      });
      setShowAddServer(false);
      loadServers();
    } catch (err) {
      alert('Erro ao adicionar servidor: ' + err.response?.data?.error);
    }
  };

  const handleDeleteServer = async (serverId) => {
    if (!window.confirm('Tem certeza que deseja deletar este servidor?')) return;
    try {
      await api.delete(`/api/iptv-plugin/server/${serverId}`);
      alert('Servidor deletado com sucesso!');
      loadServers();
      setSelectedServer(null);
      setPlaylists([]);
    } catch (err) {
      alert('Erro ao deletar servidor: ' + err.response?.data?.error);
    }
  };

  const handleTestServer = async (serverId) => {
    try {
      const response = await api.post('/api/iptv-plugin/test-server', { server_id: serverId });
      if (response.data.success) {
        alert('✅ Servidor online e respondendo!');
      } else {
        alert('❌ Servidor offline ou não respondeu');
      }
    } catch (err) {
      alert('Erro ao testar servidor: ' + err.response?.data?.error);
    }
  };
  // Handlers para qPanel
  const handleAddQpanel = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/iptv-plugin/add-qpanel', qpanelForm);
      alert('Painel qPanel adicionado com sucesso!');
      setQpanelForm({
        panel_name: '',
        panel_url: '',
        panel_username: '',
        panel_password: ''
      });
      setShowAddQpanel(false);
      loadQpanels();
    } catch (err) {
      alert('Erro ao adicionar painel qPanel: ' + err.response?.data?.error);
    }
  };

  const handleDeleteQpanel = async (qpanelId) => {
    if (!window.confirm('Tem certeza que deseja deletar este painel qPanel?')) return;
    try {
      await api.delete(`/api/iptv-plugin/qpanel/${qpanelId}`);
      alert('Painel qPanel deletado com sucesso!');
      loadQpanels();
      setSelectedQpanel(null);
    } catch (err) {
      alert('Erro ao deletar painel qPanel: ' + err.response?.data?.error);
    }
  };

  const handleLoadQpanelServers = async (qpanelId) => {
    try {
      const response = await api.post('/api/iptv-plugin/qpanel-load-servers', { panel_id: qpanelId });
      alert(`✅ ${response.data.total} servidores carregados do painel qPanel!`);
    } catch (err) {
      alert('Erro ao carregar servidores do qPanel: ' + err.response?.data?.error);
    }
  };

  const handleCreateAccounts = async (e) => {
    e.preventDefault();
    try {
      if (accountForm.password.length < 9) {
        alert('A senha deve ter no mínimo 9 caracteres');
        return;
      }

      const response = await api.post('/api/iptv-plugin/qpanel-create-accounts', accountForm);
      
      if (response.data.success) {
        alert(`✅ ${response.data.total_created} conta(s) criada(s) com sucesso!`);
        
        // Se DNS foram extraídas, registrar no dispositivo
        if (response.data.extracted_dns && response.data.extracted_dns.length > 0) {
          await api.post('/api/iptv-plugin/register-dns-to-device', {
            device_mac: accountForm.device_mac,
            dns_list: response.data.extracted_dns,
            username: accountForm.username,
            password: accountForm.password
          });
          
          alert(`✅ ${response.data.extracted_dns.length} DNS(s) registrada(s) no dispositivo TV MAXX PRO!`);
        }
        
        setShowCreateAccounts(false);
        setAccountForm({
          username: '',
          password: '',
          device_mac: '',
          selected_packages: []
        });
      }
    } catch (err) {
      alert('Erro ao criar contas: ' + err.response?.data?.error);
    }
  };
  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gerenciador IPTV Unificado</h1>
          <p className="text-gray-400">Gerencie servidores IPTV, painéis qPanel e integre com seu app TV MAXX PRO</p>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6 flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('servers')}
            className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
              activeTab === 'servers'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Settings size={20} />
            Servidores IPTV
          </button>
          <button
            onClick={() => setActiveTab('qpanel')}
            className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
              activeTab === 'qpanel'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Globe size={20} />
            Painéis qPanel
          </button>
        </div>
        {/* Tab qPanel - NOVA FUNCIONALIDADE */}
        {activeTab === 'qpanel' && (
          <div className="space-y-8">
            {/* Header qPanel */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Painéis qPanel</h2>
                  <p className="text-gray-400 text-sm">Gerencie múltiplos painéis qPanel e crie contas IPTV em massa</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddQpanel(!showAddQpanel)}
                    className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Adicionar Painel
                  </button>
                  <button
                    onClick={() => setShowCreateAccounts(!showCreateAccounts)}
                    className="bg-green-600 hover:bg-green-700 p-2 rounded-lg transition flex items-center gap-2"
                  >
                    <Users size={20} />
                    Criar Contas
                  </button>
                </div>
              </div>

              {/* Form Adicionar qPanel */}
              {showAddQpanel && (
                <form onSubmit={handleAddQpanel} className="mb-6 p-4 bg-gray-700 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nome do painel"
                      value={qpanelForm.panel_name}
                      onChange={(e) => setQpanelForm({ ...qpanelForm, panel_name: e.target.value })}
                      className="bg-gray-600 text-white p-2 rounded placeholder-gray-400"
                      required
                    />
                    <input
                      type="url"
                      placeholder="URL do painel"
                      value={qpanelForm.panel_url}
                      onChange={(e) => setQpanelForm({ ...qpanelForm, panel_url: e.target.value })}
                      className="bg-gray-600 text-white p-2 rounded placeholder-gray-400"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Usuário (opcional)"
                      value={qpanelForm.panel_username}
                      onChange={(e) => setQpanelForm({ ...qpanelForm, panel_username: e.target.value })}
                      className="bg-gray-600 text-white p-2 rounded placeholder-gray-400"
                    />
                    <input
                      type="password"
                      placeholder="Senha (opcional)"
                      value={qpanelForm.panel_password}
                      onChange={(e) => setQpanelForm({ ...qpanelForm, panel_password: e.target.value })}
                      className="bg-gray-600 text-white p-2 rounded placeholder-gray-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 p-2 rounded transition mt-4"
                  >
                    Adicionar Painel qPanel
                  </button>
                </form>
              )}
              {/* Form Criar Contas - FUNCIONALIDADE PRINCIPAL */}
              {showCreateAccounts && (
                <form onSubmit={handleCreateAccounts} className="mb-6 p-4 bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-bold mb-4">🎯 Criar Contas IPTV em Massa</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Nome de usuário"
                      value={accountForm.username}
                      onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value })}
                      className="bg-gray-600 text-white p-2 rounded placeholder-gray-400"
                      required
                    />
                    <input
                      type="password"
                      placeholder="Senha (mín. 9 caracteres)"
                      value={accountForm.password}
                      onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                      className="bg-gray-600 text-white p-2 rounded placeholder-gray-400"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="MAC do dispositivo TV MAXX PRO (ex: AA:BB:CC:DD:EE:FF)"
                    value={accountForm.device_mac}
                    onChange={(e) => setAccountForm({ ...accountForm, device_mac: e.target.value })}
                    className="w-full bg-gray-600 text-white p-2 rounded placeholder-gray-400 mb-4"
                    required
                  />
                  <div className="bg-blue-900 border border-blue-700 rounded p-3 mb-4 text-sm">
                    <h4 className="font-bold mb-2">🚀 Como funciona:</h4>
                    <ul className="space-y-1 text-blue-200">
                      <li>• Cria contas em TODOS os painéis qPanel configurados</li>
                      <li>• Extrai DNS automaticamente das respostas</li>
                      <li>• Registra DNS no dispositivo TV MAXX PRO</li>
                      <li>• Substitui a integração com SmartOne</li>
                    </ul>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 p-3 rounded transition font-bold"
                  >
                    🎯 Criar Contas + Registrar no App TV MAXX PRO
                  </button>
                </form>
              )}
            </div>

            {/* Lista de Painéis qPanel */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {qpanels.length === 0 ? (
                <div className="col-span-full bg-gray-800 rounded-lg p-12 text-center">
                  <Globe size={48} className="mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400">Nenhum painel qPanel configurado</p>
                  <p className="text-gray-500 text-sm mt-2">Adicione um painel para começar</p>
                </div>
              ) : (
                qpanels.map((qpanel) => (
                  <div key={qpanel.id} className="bg-gray-800 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold">{qpanel.panel_name}</h3>
                        <p className="text-gray-400 text-sm truncate">{qpanel.panel_url}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteQpanel(qpanel.id)}
                        className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition"
                        title="Deletar painel"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Status:</span>
                        <span className="ml-2 text-green-400 font-semibold">{qpanel.status}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Criado em:</span>
                        <span className="ml-2">{new Date(qpanel.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleLoadQpanelServers(qpanel.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 p-2 rounded transition text-sm"
                      >
                        🔄 Carregar Servidores
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IptvServersManager;