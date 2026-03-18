import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Play, AlertCircle, Globe, Users, Settings, Server, List, CheckCircle, Loader } from 'lucide-react';

// ─── Tab: Playlist Manager (Plugin 4) ────────────────────────────────────────
const PlaylistManagerTab = () => {
  const [servers, setServers] = useState([]);
  const [selectedServers, setSelectedServers] = useState([]);
  const [currentPlatform, setCurrentPlatform] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [serverForm, setServerForm] = useState({ name: '', dns: '' });
  const [registerForm, setRegisterForm] = useState({ mac: '', username: '', password: '' });
  const [activityLog, setActivityLog] = useState([]);
  const [stats, setStats] = useState({ total: 0, success: 0, error: 0 });

  const platforms = [
    { id: 'smartone', name: 'SmartOne', icon: '📺', color: 'bg-blue-500' },
    { id: 'ibocast', name: 'IBOCast', icon: '🎥', color: 'bg-purple-500' },
    { id: 'ibopro', name: 'IBOPro', icon: '⚡', color: 'bg-green-500' },
    { id: 'vuplayer', name: 'VU Player', icon: '🎬', color: 'bg-red-500' },
  ];

  useEffect(() => { loadServers(); }, []);

  const loadServers = async () => {
    try {
      const response = await api.get('/api/playlist-manager/servers');
      setServers(response.data);
    } catch (error) {
      addLog('❌ Erro ao carregar servidores');
    } finally {
      setLoading(false);
    }
  };

  const addServer = async () => {
    if (!serverForm.name.trim() || !serverForm.dns.trim()) { alert('Nome e DNS são obrigatórios'); return; }
    try {
      await api.post('/api/playlist-manager/servers', serverForm);
      addLog(`✅ Servidor "${serverForm.name}" adicionado`);
      setServerForm({ name: '', dns: '' });
      setShowAddModal(false);
      loadServers();
    } catch { alert('Erro ao adicionar servidor'); }
  };

  const deleteServer = async (id, name) => {
    if (!confirm(`Deseja remover o servidor "${name}"?`)) return;
    try {
      await api.delete(`/api/playlist-manager/servers/${id}`);
      addLog(`🗑️ Servidor "${name}" removido`);
      setSelectedServers(prev => prev.filter(sid => sid !== id));
      loadServers();
    } catch { alert('Erro ao deletar servidor'); }
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
    panel_name: '', panel_url: '', panel_username: '', panel_password: ''
  });

  const [accountForm, setAccountForm] = useState({
    username: '', password: '', device_mac: '', selected_packages: []
  });

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
      setQpanelForm({ panel_name: '', panel_url: '', panel_username: '', panel_password: '' });
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
    try {
      let servers = [];
      let fetchError = null;
      try {
        const response = await fetch(`${qpanel.panel_url.replace(/\/$/, '')}/api/servers`, {
          headers: { 'Accept': 'application/json' },
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          const raw = data.data || data.servers || [];
          servers = raw.map(server => {
            let dns = new URL(qpanel.panel_url).hostname;
            if (server.dns) dns = server.dns;
            else if (server.domain) dns = server.domain;
            else if (server.url) { try { dns = new URL(server.url).hostname; } catch {} }
            return { ...server, dns, packages: (server.packages || []).filter(p => !p.name?.toLowerCase().includes('test')) };
          });
        } else { fetchError = `HTTP ${response.status}`; }
      } catch (e) { fetchError = e.message; }

      if (fetchError && !servers.length) {
        alert(`⚠️ Não foi possível buscar servidores automaticamente.\n\nMotivo: ${fetchError}\n\nO painel qPanel requer que você esteja logado nele no browser.\n\nO painel foi salvo e você pode usar "Criar Contas" normalmente.`);
        return;
      }

      const saveResponse = await api.post('/api/iptv-plugin/qpanel-load-servers', { panel_id: qpanel.id, servers });
      alert(`✅ ${saveResponse.data.total} servidor(es) carregado(s)!`);
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
  };

  const handleCreateAccounts = async (e) => {
    e.preventDefault();
    if (accountForm.password.length < 9) { alert('A senha deve ter no mínimo 9 caracteres'); return; }
    try {
      const response = await api.post('/api/iptv-plugin/qpanel-create-accounts', accountForm);
      if (response.data.success) {
        alert(`✅ ${response.data.total_created} conta(s) criada(s)!`);
        if (response.data.extracted_dns?.length > 0) {
          await api.post('/api/iptv-plugin/register-dns-to-device', {
            device_mac: accountForm.device_mac,
            dns_list: response.data.extracted_dns,
            username: accountForm.username,
            password: accountForm.password
          });
          alert(`✅ ${response.data.extracted_dns.length} DNS(s) registrada(s) no dispositivo!`);
        }
        setShowCreateAccounts(false);
        setAccountForm({ username: '', password: '', device_mac: '', selected_packages: [] });
      }
    } catch (err) { alert('Erro: ' + err.response?.data?.error); }
  };

  const tabs = [
    { id: 'servers', label: 'Servidores IPTV', icon: Settings },
    { id: 'qpanel', label: 'Painéis qPanel', icon: Globe },
    { id: 'playlist', label: 'Playlist Manager', icon: List },
  ];

  if (loading) return <div className="p-8 text-center text-gray-400">Carregando...</div>;

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Plugin IPTV Unificado</h1>
        <p className="text-gray-400">Gerencie servidores IPTV, painéis qPanel e playlists em um só lugar</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 border-b border-gray-800">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-6 py-3 rounded-t-lg font-medium transition flex items-center gap-2 ${
              activeTab === id
                ? 'bg-primary text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab: Servidores IPTV ── */}
      {activeTab === 'servers' && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold">Servidores IPTV</h2>
                <p className="text-gray-400 text-sm">Gerencie seus servidores Xtream Codes</p>
              </div>
              <button
                onClick={() => setShowAddServer(!showAddServer)}
                className="bg-primary hover:bg-orange-600 px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                <Plus size={20} /> Adicionar Servidor
              </button>
            </div>

            {showAddServer && (
              <form onSubmit={handleAddServer} className="mb-6 p-4 bg-gray-700 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Nome do servidor" value={serverForm.server_name}
                    onChange={e => setServerForm({ ...serverForm, server_name: e.target.value })}
                    className="bg-gray-600 text-white p-2 rounded placeholder-gray-400" required />
                  <input type="url" placeholder="URL Xtream (ex: http://servidor.com)" value={serverForm.xtream_url}
                    onChange={e => setServerForm({ ...serverForm, xtream_url: e.target.value })}
                    className="bg-gray-600 text-white p-2 rounded placeholder-gray-400" required />
                  <input type="text" placeholder="Usuário Xtream" value={serverForm.xtream_username}
                    onChange={e => setServerForm({ ...serverForm, xtream_username: e.target.value })}
                    className="bg-gray-600 text-white p-2 rounded placeholder-gray-400" />
                  <input type="password" placeholder="Senha Xtream" value={serverForm.xtream_password}
                    onChange={e => setServerForm({ ...serverForm, xtream_password: e.target.value })}
                    className="bg-gray-600 text-white p-2 rounded placeholder-gray-400" />
                  <select value={serverForm.server_type} onChange={e => setServerForm({ ...serverForm, server_type: e.target.value })}
                    className="bg-gray-600 text-white p-2 rounded col-span-2">
                    <option value="custom">Custom</option>
                    <option value="ibopro">IboPro</option>
                    <option value="ibocast">IboCast</option>
                    <option value="vuplayer">VuPlayer</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 p-2 rounded transition mt-4">
                  Adicionar Servidor
                </button>
              </form>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servers.length === 0 ? (
              <div className="col-span-full bg-gray-800 rounded-lg p-12 text-center">
                <Settings size={48} className="mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400">Nenhum servidor IPTV configurado</p>
                <p className="text-gray-500 text-sm mt-2">Adicione um servidor para começar</p>
              </div>
            ) : servers.map(server => (
              <div key={server.id} className="bg-gray-800 rounded-lg p-6 border-2 border-transparent hover:border-gray-600 transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{server.server_name}</h3>
                    <p className="text-gray-400 text-sm truncate">{server.xtream_url}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleTestServer(server.id)} className="bg-green-600 hover:bg-green-700 p-2 rounded-lg transition" title="Testar">
                      <Play size={16} />
                    </button>
                    <button onClick={() => handleDeleteServer(server.id)} className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition" title="Deletar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  <span className="capitalize">{server.server_type}</span>
                  {server.test_status && (
                    <span className={`ml-2 font-semibold ${server.test_status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
                      • {server.test_status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: qPanel ── */}
      {activeTab === 'qpanel' && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold">Painéis qPanel</h2>
                <p className="text-gray-400 text-sm">Gerencie múltiplos painéis e crie contas IPTV em massa</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAddQpanel(!showAddQpanel)}
                  className="bg-primary hover:bg-orange-600 px-4 py-2 rounded-lg transition flex items-center gap-2">
                  <Plus size={20} /> Adicionar Painel
                </button>
                <button onClick={() => setShowCreateAccounts(!showCreateAccounts)}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition flex items-center gap-2">
                  <Users size={20} /> Criar Contas
                </button>
              </div>
            </div>

            {showAddQpanel && (
              <form onSubmit={handleAddQpanel} className="mb-6 p-4 bg-gray-700 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Nome do painel" value={qpanelForm.panel_name}
                    onChange={e => setQpanelForm({ ...qpanelForm, panel_name: e.target.value })}
                    className="bg-gray-600 text-white p-2 rounded placeholder-gray-400" required />
                  <input type="url" placeholder="URL do painel" value={qpanelForm.panel_url}
                    onChange={e => setQpanelForm({ ...qpanelForm, panel_url: e.target.value })}
                    className="bg-gray-600 text-white p-2 rounded placeholder-gray-400" required />
                  <input type="text" placeholder="Usuário (opcional)" value={qpanelForm.panel_username}
                    onChange={e => setQpanelForm({ ...qpanelForm, panel_username: e.target.value })}
                    className="bg-gray-600 text-white p-2 rounded placeholder-gray-400" />
                  <input type="password" placeholder="Senha (opcional)" value={qpanelForm.panel_password}
                    onChange={e => setQpanelForm({ ...qpanelForm, panel_password: e.target.value })}
                    className="bg-gray-600 text-white p-2 rounded placeholder-gray-400" />
                </div>
                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 p-2 rounded transition mt-4">
                  Adicionar Painel qPanel
                </button>
              </form>
            )}

            {showCreateAccounts && (
              <form onSubmit={handleCreateAccounts} className="mb-6 p-4 bg-gray-700 rounded-lg">
                <h3 className="text-lg font-bold mb-4">🎯 Criar Contas IPTV em Massa</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input type="text" placeholder="Nome de usuário" value={accountForm.username}
                    onChange={e => setAccountForm({ ...accountForm, username: e.target.value })}
                    className="bg-gray-600 text-white p-2 rounded placeholder-gray-400" required />
                  <input type="password" placeholder="Senha (mín. 9 caracteres)" value={accountForm.password}
                    onChange={e => setAccountForm({ ...accountForm, password: e.target.value })}
                    className="bg-gray-600 text-white p-2 rounded placeholder-gray-400" required />
                </div>
                <input type="text" placeholder="MAC do dispositivo (ex: AA:BB:CC:DD:EE:FF)" value={accountForm.device_mac}
                  onChange={e => setAccountForm({ ...accountForm, device_mac: e.target.value })}
                  className="w-full bg-gray-600 text-white p-2 rounded placeholder-gray-400 mb-4" required />
                <div className="bg-blue-900/50 border border-blue-700 rounded p-3 mb-4 text-sm">
                  <h4 className="font-bold mb-2">🚀 Como funciona:</h4>
                  <ul className="space-y-1 text-blue-200">
                    <li>• Cria contas em TODOS os painéis qPanel configurados</li>
                    <li>• Extrai DNS automaticamente das respostas</li>
                    <li>• Registra DNS no dispositivo TV MAXX PRO</li>
                  </ul>
                </div>
                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 p-3 rounded transition font-bold">
                  🎯 Criar Contas + Registrar no App TV MAXX PRO
                </button>
              </form>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qpanels.length === 0 ? (
              <div className="col-span-full bg-gray-800 rounded-lg p-12 text-center">
                <Globe size={48} className="mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400">Nenhum painel qPanel configurado</p>
                <p className="text-gray-500 text-sm mt-2">Adicione um painel para começar</p>
              </div>
            ) : qpanels.map(qpanel => (
              <div key={qpanel.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{qpanel.panel_name}</h3>
                    <p className="text-gray-400 text-sm truncate">{qpanel.panel_url}</p>
                  </div>
                  <button onClick={() => handleDeleteQpanel(qpanel.id)} className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  <span>Status: </span><span className="text-green-400 font-semibold">{qpanel.status}</span>
                  <span className="ml-4">Criado: {new Date(qpanel.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <button onClick={() => handleLoadQpanelServers(qpanel)}
                  className="w-full bg-primary hover:bg-orange-600 p-2 rounded transition text-sm">
                  🔄 Carregar Servidores
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: Playlist Manager ── */}
      {activeTab === 'playlist' && <PlaylistManagerTab />}
    </div>
  );
};

export default IptvServersManager;
