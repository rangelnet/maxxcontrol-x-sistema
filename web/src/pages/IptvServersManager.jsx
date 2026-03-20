import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Play, Globe, Users, Settings, Server, List, CheckCircle, Loader, Search, XCircle } from 'lucide-react';

// ─── Tab: Limpar qPanel (Plugin 1) ───────────────────────────────────────────
const CleanQpanelTab = () => {
  const [searchUsername, setSearchUsername] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [activityLog, setActivityLog] = useState([]);
  const [searched, setSearched] = useState(false);
  const [relayMode, setRelayMode] = useState(false);

  const addLog = (message) => {
    const time = new Date().toLocaleTimeString('pt-BR');
    setActivityLog(prev => [{ time, message }, ...prev.slice(0, 49)]);
  };

  // Aguarda resultado de um comando relay com polling
  const waitRelayResult = async (commandId, timeoutMs = 30000) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      await new Promise(r => setTimeout(r, 1500));
      try {
        const res = await api.get(`/api/iptv-plugin/relay-result/${commandId}`);
        const { status, result, error_message } = res.data;
        if (status === 'done') return { success: true, result };
        if (status === 'error') return { success: false, error: error_message };
        // pending ou executing: continua aguardando
      } catch (e) {
        return { success: false, error: e.message };
      }
    }
    return { success: false, error: 'Timeout: plugin Chrome não respondeu em 30s. Verifique se o plugin está aberto e conectado.' };
  };

  const handleSearch = async () => {
    if (!searchUsername.trim()) { alert('Digite um username para buscar'); return; }
    setSearching(true);
    setResults([]);
    setSelected([]);
    setSearched(false);

    if (relayMode) {
      // Modo relay: plugin Chrome executa no qPanel
      addLog(`🔌 [Relay] Enviando busca de "${searchUsername}" para o plugin Chrome...`);
      try {
        const cmdRes = await api.post('/api/iptv-plugin/relay-command', {
          command_type: 'search_user',
          payload: { username: searchUsername.trim() }
        });
        const commandId = cmdRes.data.command_id;
        addLog(`⏳ Aguardando plugin Chrome executar (ID: ${commandId})...`);

        const relayResult = await waitRelayResult(commandId);
        if (relayResult.success) {
          const data = relayResult.result;
          setResults(data.results || []);
          setSearched(true);
          const found = (data.results || []).filter(r => !r.error);
          addLog(found.length > 0 ? `✅ Encontrado em ${found.length} painel(is)` : `ℹ️ Usuário não encontrado`);
        } else {
          addLog(`❌ ${relayResult.error}`);
          setSearched(true);
        }
      } catch (err) {
        addLog(`❌ Erro: ${err.response?.data?.error || err.message}`);
      }
    } else {
      // Modo direto (legado — pode falhar se qPanel exigir sessão do browser)
      addLog(`🔍 Buscando "${searchUsername}" em todos os painéis...`);
      try {
        const response = await api.post('/api/iptv-plugin/qpanel-search-user', { username: searchUsername.trim() });
        const data = response.data;
        setResults(data.results || []);
        setSearched(true);
        const found = (data.results || []).filter(r => !r.error);
        const errors = (data.results || []).filter(r => r.error);
        if (found.length > 0) addLog(`✅ Encontrado em ${found.length} painel(is)`);
        if (errors.length > 0) addLog(`⚠️ ${errors.length} painel(is) com erro de conexão`);
        if (found.length === 0 && errors.length === 0) addLog(`ℹ️ Usuário não encontrado em nenhum painel`);
      } catch (err) {
        addLog(`❌ Erro: ${err.response?.data?.error || err.message}`);
      }
    }
    setSearching(false);
  };

  const toggleSelect = (key) => setSelected(prev =>
    prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
  );

  const selectAll = () => {
    const validResults = results.filter(r => !r.error && r.customer_id);
    const allKeys = validResults.map(r => `${r.panel_id}-${r.customer_id}`);
    setSelected(selected.length === allKeys.length ? [] : allKeys);
  };

  const handleDeleteSelected = async () => {
    if (!selected.length) { alert('Selecione pelo menos um usuário para deletar'); return; }
    if (!window.confirm(`Tem certeza que deseja deletar ${selected.length} usuário(s)? Esta ação não pode ser desfeita.`)) return;

    setDeleting(true);
    let success = 0;
    let failed = 0;

    for (const key of selected) {
      const [panelId, customerId] = key.split('-');
      const result = results.find(r => r.panel_id == panelId && r.customer_id == customerId);
      if (!result) continue;

      if (relayMode) {
        // Modo relay
        addLog(`🔌 [Relay] Deletando "${result.username}" via plugin Chrome...`);
        try {
          const cmdRes = await api.post('/api/iptv-plugin/relay-command', {
            panel_id: result.panel_id,
            command_type: 'delete_user',
            payload: { panel_id: result.panel_id, customer_id: result.customer_id, username: result.username, panel_url: result.panel_url }
          });
          const relayResult = await waitRelayResult(cmdRes.data.command_id, 20000);
          if (relayResult.success) {
            addLog(`🗑️ Deletado: "${result.username}" do painel "${result.panel_name}"`);
            success++;
          } else {
            addLog(`❌ Falha ao deletar de "${result.panel_name}": ${relayResult.error}`);
            failed++;
          }
        } catch (err) {
          addLog(`❌ Erro relay: ${err.message}`);
          failed++;
        }
      } else {
        // Modo direto
        try {
          await api.post('/api/iptv-plugin/qpanel-delete-user', {
            panel_id: result.panel_id,
            customer_id: result.customer_id,
            username: result.username
          });
          addLog(`🗑️ Deletado: "${result.username}" do painel "${result.panel_name}"`);
          success++;
        } catch (err) {
          addLog(`❌ Falha ao deletar de "${result.panel_name}": ${err.response?.data?.error || err.message}`);
          failed++;
        }
        await new Promise(r => setTimeout(r, 300));
      }
    }

    addLog(`🎉 Concluído! Deletados: ${success} | Falhas: ${failed}`);
    setResults(prev => prev.filter(r => !selected.includes(`${r.panel_id}-${r.customer_id}`)));
    setSelected([]);
    setDeleting(false);
  };

  const validResults = results.filter(r => !r.error && r.customer_id);
  const errorResults = results.filter(r => r.error);

  return (
    <div className="space-y-6">
      {/* Modo de operação */}
      <div className="bg-card rounded-lg p-4 border border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Modo de Operação</h3>
            <p className="text-sm text-gray-400 mt-1">
              {relayMode
                ? '🔌 Relay via Plugin Chrome — o plugin executa as ações no qPanel usando a sessão do browser'
                : '🌐 Direto — o backend tenta acessar o qPanel diretamente (pode falhar se exigir sessão)'}
            </p>
          </div>
          <button
            onClick={() => setRelayMode(!relayMode)}
            className={`px-4 py-2 rounded-lg font-medium transition ${relayMode ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            {relayMode ? '✅ Relay Ativo' : '⚡ Ativar Relay'}
          </button>
        </div>
        {relayMode && (
          <div className="mt-3 p-3 bg-green-900/30 border border-green-700 rounded-lg text-sm text-green-300">
            ℹ️ Com o relay ativo, o plugin Chrome precisa estar aberto e conectado ao painel. O plugin faz polling a cada 3s para buscar comandos.
          </div>
        )}
      </div>

      {/* Busca */}
      <div className="bg-card rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-bold mb-2">Buscar Usuário nos Painéis</h2>
        <p className="text-gray-400 text-sm mb-4">Busca o username em todos os painéis qPanel configurados e permite deletar em massa.</p>
        <div className="flex gap-3">
          <input
            type="text"
            value={searchUsername}
            onChange={e => setSearchUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Digite o username para buscar..."
            className="flex-1 px-4 py-2 bg-dark border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition"
          >
            {searching ? <Loader className="animate-spin" size={18} /> : <Search size={18} />}
            {searching ? (relayMode ? 'Aguardando plugin...' : 'Buscando...') : 'Buscar'}
          </button>
        </div>
      </div>

      {/* Resultados */}
      {searched && (
        <div className="bg-card rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              Resultados {validResults.length > 0 && <span className="text-primary">({validResults.length} encontrado{validResults.length !== 1 ? 's' : ''})</span>}
            </h2>
            {validResults.length > 0 && (
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" checked={selected.length === validResults.length && validResults.length > 0}
                    onChange={selectAll} className="w-4 h-4" />
                  Selecionar todos
                </label>
                <button
                  onClick={handleDeleteSelected}
                  disabled={!selected.length || deleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
                >
                  {deleting ? <Loader className="animate-spin" size={16} /> : <Trash2 size={16} />}
                  {deleting ? (relayMode ? 'Aguardando plugin...' : 'Deletando...') : `Deletar ${selected.length > 0 ? `(${selected.length})` : 'Selecionados'}`}
                </button>
              </div>
            )}
          </div>

          {validResults.length === 0 && errorResults.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <XCircle size={40} className="mx-auto mb-3 text-gray-600" />
              <p>Usuário "<strong>{searchUsername}</strong>" não encontrado em nenhum painel.</p>
            </div>
          )}

          <div className="space-y-2">
            {validResults.map(r => {
              const key = `${r.panel_id}-${r.customer_id}`;
              return (
                <div key={key}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                    selected.includes(key) ? 'border-red-500 bg-red-500/10' : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <input type="checkbox" checked={selected.includes(key)} onChange={() => toggleSelect(key)} className="w-5 h-5" />
                  <Globe className="text-primary shrink-0" size={20} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{r.username}</div>
                    <div className="text-sm text-gray-400">{r.panel_name} — ID: {r.customer_id}</div>
                  </div>
                  <div className="text-right text-sm text-gray-400 shrink-0">
                    {r.expiry && <div>Expira: {r.expiry}</div>}
                    <div className={r.status === 1 || r.status === 'active' ? 'text-green-400' : 'text-yellow-400'}>
                      {r.status === 1 || r.status === 'active' ? 'Ativo' : String(r.status)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {errorResults.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
              <p className="text-yellow-400 text-sm font-semibold mb-1">⚠️ Painéis com erro de conexão:</p>
              {errorResults.map(r => (
                <p key={r.panel_id} className="text-yellow-300 text-xs">{r.panel_name}: {r.error}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Log */}
      <div className="bg-card rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-bold mb-4">Log de Atividades</h2>
        <div className="bg-dark rounded-lg p-4 h-40 overflow-y-auto font-mono text-sm">
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
    </div>
  );
};

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
    panel_name: '', panel_url: ''
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
      setQpanelForm({ panel_name: '', panel_url: '' });
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
      setStatus('⏳ Enviando comando para o plugin...');

      const cmdRes = await api.post('/api/iptv-plugin/relay-command', {
        panel_id: id,
        command_type: 'get_servers',
        payload: { panel_url: qpanel.panel_url }
      });

      const commandId = cmdRes.data.command_id;
      setStatus('⏳ Aguardando o plugin Chrome buscar os servidores...');

      // Polling até 30s
      const start = Date.now();
      let relayResult = null;
      while (Date.now() - start < 30000) {
        await new Promise(r => setTimeout(r, 2000));
        const res = await api.get(`/api/iptv-plugin/relay-result/${commandId}`);
        const { status, result, error_message } = res.data;
        if (status === 'done') {
          // result já vem parseado do backend
          relayResult = result;
          break;
        }
        if (status === 'error') {
          setStatus(`❌ Erro: ${error_message}`);
          setLoadState('error');
          return;
        }
        const elapsed = Math.round((Date.now() - start) / 1000);
        setStatus(`⏳ Aguardando resposta do plugin... (${elapsed}s)`);
      }

      if (!relayResult) {
        setStatus('⏰ Timeout: plugin não respondeu em 30s. Verifique se está aberto e conectado.');
        setLoadState('error');
        return;
      }

      const fetchedServers = relayResult.servers || [];
      console.log('[qPanel Debug] Servidores recebidos do relay:', JSON.stringify(fetchedServers, null, 2));
      if (fetchedServers.length === 0) {
        setStatus('ℹ️ Nenhum servidor encontrado no painel.');
        setLoadState('done');
        return;
      }

      setStatus(`💾 Salvando ${fetchedServers.length} servidor(es)...`);
      const saveResponse = await api.post('/api/iptv-plugin/qpanel-load-servers', { panel_id: id, servers: fetchedServers });
      const total = saveResponse.data.total || fetchedServers.length;
      setStatus(`✅ ${total} servidor(es) carregado(s) com sucesso!`);
      setLoadState('done');

      // Recarregar lista de painéis para refletir os servidores salvos
      await loadQpanels();
    } catch (err) {
      setStatus('❌ Erro: ' + (err.response?.data?.error || err.message));
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
        alert(`✅ ${response.data.total_created} conta(s) criada(s)!`);
        if (response.data.extracted_dns?.length > 0) {
          await api.post('/api/iptv-plugin/register-dns-to-device', {
            device_mac, dns_list: response.data.extracted_dns, username, password
          });
          alert(`✅ ${response.data.extracted_dns.length} DNS(s) registrada(s) no dispositivo!`);
        }
        setShowCreateFromPackages(false);
        setSelectedPackages([]);
        setCreateFromPkgForm({ username: '', password: '', device_mac: '' });
      }
    } catch (err) { alert('Erro: ' + (err.response?.data?.error || err.message)); }
    finally { setCreatingAccounts(false); }
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
    { id: 'clean', label: 'Limpar qPanel', icon: Trash2 },
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
                  <input type="url" placeholder="URL do painel (ex: http://meupainel.com)" value={qpanelForm.panel_url}
                    onChange={e => setQpanelForm({ ...qpanelForm, panel_url: e.target.value })}
                    className="bg-gray-600 text-white p-2 rounded placeholder-gray-400" required />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  ℹ️ O plugin Chrome usa a sessão do seu browser para autenticar — não é necessário usuário/senha aqui.
                </p>
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
                  onBlur={e => handleMacLookup(e.target.value, setAccountForm)}
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

          {/* Painel de pacotes selecionados */}
          {selectedPackages.length > 0 && (
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-green-300">✅ {selectedPackages.length} pacote(s) selecionado(s)</h3>
                  <p className="text-xs text-green-400 mt-0.5">
                    {selectedPackages.map(p => `${p.panel_name} › ${p.server_name} › ${p.package_name}`).join(' | ')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedPackages([])} className="text-xs px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded transition">
                    Limpar
                  </button>
                  <button
                    onClick={() => setShowCreateFromPackages(!showCreateFromPackages)}
                    className="text-sm px-4 py-1.5 bg-green-600 hover:bg-green-700 rounded transition font-semibold flex items-center gap-2"
                  >
                    <Users size={16} /> Criar Contas
                  </button>
                </div>
              </div>

              {showCreateFromPackages && (
                <form onSubmit={handleCreateFromPackages} className="mt-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <h4 className="font-bold mb-3">🎯 Criar contas nos pacotes selecionados</h4>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input type="text" placeholder="Usuário" value={createFromPkgForm.username}
                      onChange={e => setCreateFromPkgForm({ ...createFromPkgForm, username: e.target.value })}
                      className="bg-gray-700 text-white p-2 rounded placeholder-gray-400 text-sm" required />
                    <input type="password" placeholder="Senha (mín. 9 caracteres)" value={createFromPkgForm.password}
                      onChange={e => setCreateFromPkgForm({ ...createFromPkgForm, password: e.target.value })}
                      className="bg-gray-700 text-white p-2 rounded placeholder-gray-400 text-sm" required />
                  </div>
                  <input type="text" placeholder="MAC do dispositivo (ex: AA:BB:CC:DD:EE:FF)" value={createFromPkgForm.device_mac}
                    onChange={e => setCreateFromPkgForm({ ...createFromPkgForm, device_mac: e.target.value })}
                    onBlur={e => handleMacLookup(e.target.value, setCreateFromPkgForm)}
                    className="w-full bg-gray-700 text-white p-2 rounded placeholder-gray-400 text-sm mb-3" required />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowCreateFromPackages(false)}
                      className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded transition text-sm">
                      Cancelar
                    </button>
                    <button type="submit" disabled={creatingAccounts}
                      className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded transition text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                      {creatingAccounts ? <><Loader className="animate-spin" size={16} /> Criando...</> : '🎯 Criar Contas'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qpanels.length === 0 ? (
              <div className="col-span-full bg-gray-800 rounded-lg p-12 text-center">
                <Globe size={48} className="mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400">Nenhum painel qPanel configurado</p>
                <p className="text-gray-500 text-sm mt-2">Adicione um painel para começar</p>
              </div>
            ) : qpanels.map(qpanel => {
              const panelLoadState = loadingPanels[qpanel.id];
              const statusMsg = panelStatus[qpanel.id];
              const isLoading = panelLoadState === 'waiting';
              const loadedServers = qpanel.servers || [];
              console.log(`[qPanel Debug] Painel "${qpanel.panel_name}" - servidores:`, loadedServers);

              return (
                <div key={qpanel.id} className="bg-gray-800 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0 mr-2">
                      <h3 className="text-lg font-bold">{qpanel.panel_name}</h3>
                      <p className="text-gray-400 text-sm truncate">{qpanel.panel_url}</p>
                    </div>
                    <button onClick={() => handleDeleteQpanel(qpanel.id)} className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition flex-shrink-0">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="text-sm text-gray-400 mb-3">
                    <span>Status: </span><span className="text-green-400 font-semibold">{qpanel.status}</span>
                    <span className="ml-4">Criado: {new Date(qpanel.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>

                  {/* Servidores já carregados */}
                  {loadedServers.length > 0 && (
                    <div className="mb-3 p-3 bg-gray-700 rounded-lg">
                      <p className="text-xs text-gray-400 mb-2 font-semibold">🖥️ {loadedServers.length} servidor(es) — marque os pacotes desejados:</p>
                      <div className="space-y-2 max-h-52 overflow-y-auto">
                        {loadedServers.map((s, i) => {
                          // server_data pode vir espalhado no objeto ou como campo separado
                          const serverData = s.server_data
                            ? (typeof s.server_data === 'string' ? JSON.parse(s.server_data) : s.server_data)
                            : s;
                          const packages = s.packages || serverData.packages || [];
                          const serverId = s.id || serverData.id || i;
                          return (
                            <div key={i}>
                              <div className="text-xs text-gray-300 flex items-center gap-2 font-semibold mb-1">
                                <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"></span>
                                <span className="truncate">{s.name || s.server_name}</span>
                                {s.dns && <span className="text-gray-500 truncate">· {s.dns}</span>}
                              </div>
                              {packages.length > 0 ? (
                                <div className="ml-4 space-y-1">
                                  {packages.map((pkg, pi) => {
                                    const pkgId = pkg.id || pkg.package_id || pi;
                                    const selected = isPackageSelected(qpanel.id, serverId, pkgId);
                                    return (
                                      <label key={pi} className={`flex items-center gap-2 cursor-pointer rounded px-2 py-1 transition ${selected ? 'bg-primary/20 text-white' : 'hover:bg-gray-600 text-gray-400'}`}>
                                        <input
                                          type="checkbox"
                                          checked={selected}
                                          onChange={() => togglePackage({
                                            panel_id: qpanel.id,
                                            panel_name: qpanel.panel_name,
                                            server_id: serverId,
                                            server_name: s.name || s.server_name,
                                            package_id: pkgId,
                                            package_name: pkg.name
                                          })}
                                          className="w-3.5 h-3.5 accent-orange-500"
                                        />
                                        <span className="text-xs truncate">{pkg.name}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="ml-4 text-xs text-gray-600">Sem pacotes</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Status do carregamento */}
                  {statusMsg && (
                    <div className={`mb-3 p-2 rounded text-xs font-medium ${
                      panelLoadState === 'error' ? 'bg-red-900/50 text-red-300' :
                      panelLoadState === 'done'  ? 'bg-green-900/50 text-green-300' :
                                                   'bg-blue-900/50 text-blue-300'
                    }`}>
                      {statusMsg}
                    </div>
                  )}

                  <button
                    onClick={() => handleLoadQpanelServers(qpanel)}
                    disabled={isLoading}
                    className={`w-full p-2 rounded transition text-sm flex items-center justify-center gap-2 ${
                      isLoading
                        ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                        : 'bg-primary hover:bg-orange-600 text-white'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Carregando...
                      </>
                    ) : (
                      <>🔄 {loadedServers.length > 0 ? 'Recarregar Servidores' : 'Carregar Servidores'}</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Log de Debug */}
          <div className="bg-card rounded-lg p-6 border border-gray-800 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                📋 Log de Atividades
              </h2>
              <button
                onClick={() => setDebugLog([])}
                className="text-sm px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded transition"
              >
                Limpar Log
              </button>
            </div>
            <div className="bg-dark rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm">
              {debugLog.length === 0 ? (
                <p className="text-gray-500">Nenhuma atividade ainda...</p>
              ) : (
                debugLog.map((log, i) => (
                  <div key={i} className={`mb-1 ${
                    log.type === 'error' ? 'text-red-400' :
                    log.type === 'warning' ? 'text-yellow-400' :
                    log.type === 'success' ? 'text-green-400' :
                    'text-gray-300'
                  }`}>
                    <span className="text-gray-500">[{log.time}]</span> <span>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Playlist Manager ── */}
      {activeTab === 'playlist' && <PlaylistManagerTab />}

      {/* ── Tab: Limpar qPanel ── */}
      {activeTab === 'clean' && <CleanQpanelTab />}
    </div>
  );
};

export default IptvServersManager;
