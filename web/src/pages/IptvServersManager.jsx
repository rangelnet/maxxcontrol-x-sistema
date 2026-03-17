import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Play, AlertCircle } from 'lucide-react';

const IptvServersManager = () => {
  const [servers, setServers] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);
  const [showAddServer, setShowAddServer] = useState(false);
  const [showAddPlaylist, setShowAddPlaylist] = useState(false);

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

  // Carregar servidores
  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/iptv-plugin/servers');
      setServers(response.data.servers || []);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar servidores:', err);
      setError('Erro ao carregar servidores');
    } finally {
      setLoading(false);
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

  const handleAddPlaylist = async (e) => {
    e.preventDefault();
    if (!selectedServer) {
      alert('Selecione um servidor primeiro');
      return;
    }
    try {
      await api.post('/api/iptv-plugin/add-playlist', {
        server_id: selectedServer.id,
        ...playlistForm
      });
      alert('Playlist adicionada com sucesso!');
      setPlaylistForm({
        playlist_name: '',
        playlist_url: '',
        playlist_type: 'custom'
      });
      setShowAddPlaylist(false);
      loadPlaylists(selectedServer.id);
    } catch (err) {
      alert('Erro ao adicionar playlist: ' + err.response?.data?.error);
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

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm('Tem certeza que deseja deletar esta playlist?')) return;
    try {
      await api.delete(`/api/iptv-plugin/playlist/${playlistId}`);
      alert('Playlist deletada com sucesso!');
      if (selectedServer) {
        loadPlaylists(selectedServer.id);
      }
    } catch (err) {
      alert('Erro ao deletar playlist: ' + err.response?.data?.error);
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

  const handleSelectServer = (server) => {
    setSelectedServer(server);
    loadPlaylists(server.id);
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
          <p className="text-gray-400">Gerencie servidores IPTV e playlists para seu app TV MAXX PRO</p>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6 flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna 1: Lista de Servidores */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Servidores IPTV</h2>
                <button
                  onClick={() => setShowAddServer(!showAddServer)}
                  className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition"
                  title="Adicionar servidor"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Form Adicionar Servidor */}
              {showAddServer && (
                <form onSubmit={handleAddServer} className="mb-6 p-4 bg-gray-700 rounded-lg">
                  <input
                    type="text"
                    placeholder="Nome do servidor"
                    value={serverForm.server_name}
                    onChange={(e) => setServerForm({ ...serverForm, server_name: e.target.value })}
                    className="w-full bg-gray-600 text-white p-2 rounded mb-2 placeholder-gray-400"
                    required
                  />
                  <input
                    type="url"
                    placeholder="URL Xtream"
                    value={serverForm.xtream_url}
                    onChange={(e) => setServerForm({ ...serverForm, xtream_url: e.target.value })}
                    className="w-full bg-gray-600 text-white p-2 rounded mb-2 placeholder-gray-400"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Usuário"
                    value={serverForm.xtream_username}
                    onChange={(e) => setServerForm({ ...serverForm, xtream_username: e.target.value })}
                    className="w-full bg-gray-600 text-white p-2 rounded mb-2 placeholder-gray-400"
                  />
                  <input
                    type="password"
                    placeholder="Senha"
                    value={serverForm.xtream_password}
                    onChange={(e) => setServerForm({ ...serverForm, xtream_password: e.target.value })}
                    className="w-full bg-gray-600 text-white p-2 rounded mb-2 placeholder-gray-400"
                  />
                  <select
                    value={serverForm.server_type}
                    onChange={(e) => setServerForm({ ...serverForm, server_type: e.target.value })}
                    className="w-full bg-gray-600 text-white p-2 rounded mb-3"
                  >
                    <option value="custom">Custom</option>
                    <option value="ibopro">IBOPro</option>
                    <option value="ibocast">IBOCast</option>
                    <option value="vuplayer">VU Player</option>
                  </select>
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 p-2 rounded transition"
                  >
                    Adicionar
                  </button>
                </form>
              )}

              {/* Lista de Servidores */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {servers.length === 0 ? (
                  <p className="text-gray-400 text-sm">Nenhum servidor cadastrado</p>
                ) : (
                  servers.map((server) => (
                    <div
                      key={server.id}
                      onClick={() => handleSelectServer(server)}
                      className={`p-3 rounded-lg cursor-pointer transition ${
                        selectedServer?.id === server.id
                          ? 'bg-blue-600'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      <div className="font-semibold text-sm">{server.server_name}</div>
                      <div className="text-xs text-gray-300 truncate">{server.xtream_url}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Tipo: {server.server_type}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Coluna 2 e 3: Detalhes do Servidor e Playlists */}
          <div className="lg:col-span-2">
            {selectedServer ? (
              <div className="space-y-6">
                {/* Detalhes do Servidor */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedServer.server_name}</h2>
                      <p className="text-gray-400 text-sm mt-1">{selectedServer.xtream_url}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTestServer(selectedServer.id)}
                        className="bg-green-600 hover:bg-green-700 p-2 rounded-lg transition flex items-center gap-2"
                        title="Testar conexão"
                      >
                        <Play size={16} />
                        Testar
                      </button>
                      <button
                        onClick={() => handleDeleteServer(selectedServer.id)}
                        className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition"
                        title="Deletar servidor"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Tipo:</span>
                      <p className="font-semibold">{selectedServer.server_type}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <p className="font-semibold text-green-400">{selectedServer.status}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Usuário:</span>
                      <p className="font-semibold">{selectedServer.xtream_username || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Criado em:</span>
                      <p className="font-semibold">
                        {new Date(selectedServer.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Playlists */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Playlists</h3>
                    <button
                      onClick={() => setShowAddPlaylist(!showAddPlaylist)}
                      className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition"
                      title="Adicionar playlist"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  {/* Form Adicionar Playlist */}
                  {showAddPlaylist && (
                    <form onSubmit={handleAddPlaylist} className="mb-6 p-4 bg-gray-700 rounded-lg">
                      <input
                        type="text"
                        placeholder="Nome da playlist"
                        value={playlistForm.playlist_name}
                        onChange={(e) => setPlaylistForm({ ...playlistForm, playlist_name: e.target.value })}
                        className="w-full bg-gray-600 text-white p-2 rounded mb-2 placeholder-gray-400"
                        required
                      />
                      <input
                        type="url"
                        placeholder="URL da playlist"
                        value={playlistForm.playlist_url}
                        onChange={(e) => setPlaylistForm({ ...playlistForm, playlist_url: e.target.value })}
                        className="w-full bg-gray-600 text-white p-2 rounded mb-2 placeholder-gray-400"
                        required
                      />
                      <select
                        value={playlistForm.playlist_type}
                        onChange={(e) => setPlaylistForm({ ...playlistForm, playlist_type: e.target.value })}
                        className="w-full bg-gray-600 text-white p-2 rounded mb-3"
                      >
                        <option value="custom">Custom</option>
                        <option value="m3u">M3U</option>
                        <option value="xtream">Xtream</option>
                      </select>
                      <button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 p-2 rounded transition"
                      >
                        Adicionar
                      </button>
                    </form>
                  )}

                  {/* Lista de Playlists */}
                  <div className="space-y-2">
                    {playlists.length === 0 ? (
                      <p className="text-gray-400 text-sm">Nenhuma playlist neste servidor</p>
                    ) : (
                      playlists.map((playlist) => (
                        <div
                          key={playlist.id}
                          className="p-3 bg-gray-700 rounded-lg flex justify-between items-start"
                        >
                          <div className="flex-1">
                            <div className="font-semibold">{playlist.playlist_name}</div>
                            <div className="text-xs text-gray-400 truncate">{playlist.playlist_url}</div>
                            <div className="text-xs text-gray-500 mt-1">Tipo: {playlist.playlist_type}</div>
                          </div>
                          <button
                            onClick={() => handleDeletePlaylist(playlist.id)}
                            className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition ml-2"
                            title="Deletar playlist"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-12 text-center">
                <p className="text-gray-400">Selecione um servidor para ver detalhes e playlists</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IptvServersManager;
