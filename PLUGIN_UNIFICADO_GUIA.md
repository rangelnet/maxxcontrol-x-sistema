# Plugin IPTV Unificado - Guia Completo

## 📌 O que é?

Um **único plugin** que substitui os 3 plugins antigos (Plugin 2, 3 e 4) e se integra com seu painel MaxxControl para gerenciar IPTV automaticamente.

**Sem SmartOne** - Funciona apenas para seu app TV MAXX PRO.

---

## 🎯 Funcionalidades

### ✅ Plugin 2 (SmartOne Manager)
- ❌ Deletar registros no SmartOne
- ✅ **Deletar servidores IPTV do painel**

### ✅ Plugin 3 (IPTV Manager PRO)
- ❌ Gerenciar qPanel
- ✅ **Gerenciar servidores IPTV do painel**

### ✅ Plugin 4 (Playlist Manager 4-in-1)
- ❌ Cadastrar em SmartOne, IBOPro, IBOCast, VU Player
- ✅ **Cadastrar playlists no painel**

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    SEU PAINEL MAXXCONTROL               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  PLUGIN IPTV UNIFICADO (Backend)                │  │
│  │  /modules/iptv-servers/iptv-plugin-unified.js  │  │
│  │                                                  │  │
│  │  ✅ Gerenciar Servidores IPTV                  │  │
│  │  ✅ Gerenciar Playlists                        │  │
│  │  ✅ Atribuir a Dispositivos                    │  │
│  │  ✅ Testar Conexão                             │  │
│  │  ✅ Sincronizar Automaticamente                │  │
│  └──────────────────────────────────────────────────┘  │
│                      ↓                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  BANCO DE DADOS                                 │  │
│  │  - iptv_servers (servidores IPTV)             │  │
│  │  - iptv_playlists (playlists)                 │  │
│  │  - device_iptv_sync (sincronização)           │  │
│  └──────────────────────────────────────────────────┘  │
│                      ↓                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  INTERFACE WEB (React)                          │  │
│  │  /web/src/pages/IptvServersManager.jsx         │  │
│  │                                                  │  │
│  │  - Adicionar Servidor                          │  │
│  │  - Listar Servidores                           │  │
│  │  - Deletar Servidor                            │  │
│  │  - Adicionar Playlist                          │  │
│  │  - Atribuir a Dispositivo                      │  │
│  │  - Testar Conexão                              │  │
│  └──────────────────────────────────────────────────┘  │
│                      ↓                                  │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│                    APP TV MAXX PRO                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  IptvRepository.kt                              │  │
│  │  - Busca servidor IPTV do painel               │  │
│  │  - Busca playlists                             │  │
│  │  - Sincroniza automaticamente                  │  │
│  └──────────────────────────────────────────────────┘  │
│                      ↓                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  LiveTvScreen.kt                                │  │
│  │  - Exibe canais da playlist                    │  │
│  │  - Reproduz streams                            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📡 Endpoints da API

### Gerenciar Servidores

```bash
# Adicionar servidor
POST /api/iptv-plugin/add-server
{
  "server_name": "Meu Servidor",
  "xtream_url": "http://servidor.com:8080",
  "xtream_username": "usuario",
  "xtream_password": "senha",
  "server_type": "custom"
}

# Listar servidores
GET /api/iptv-plugin/servers

# Deletar servidor
DELETE /api/iptv-plugin/server/:id

# Testar conexão
POST /api/iptv-plugin/test-server
{
  "server_id": 1
}
```

### Gerenciar Playlists

```bash
# Adicionar playlist
POST /api/iptv-plugin/add-playlist
{
  "server_id": 1,
  "playlist_name": "Canais Brasileiros",
  "playlist_url": "http://servidor.com/playlist.m3u",
  "playlist_type": "m3u"
}

# Listar playlists
GET /api/iptv-plugin/playlists/:server_id

# Deletar playlist
DELETE /api/iptv-plugin/playlist/:id
```

### Gerenciar Dispositivos

```bash
# Atribuir servidor a dispositivo
POST /api/iptv-plugin/assign-server-to-device
{
  "device_id": 1,
  "server_id": 1
}

# Listar servidores do dispositivo
GET /api/iptv-plugin/device-servers/:device_id

# Sincronizar todos
POST /api/iptv-plugin/sync-all
```

---

## 🔧 Instalação

### 1. Criar Tabelas no Banco

```bash
# Execute a migração
node database/migrations/create-iptv-plugin-tables.sql
```

### 2. Registrar Rotas no Backend

Adicione ao `server.js`:

```javascript
// Adicionar após outras rotas
app.use('/api/iptv-plugin', require('./modules/iptv-servers/iptv-plugin-unified'));
```

### 3. Criar Interface Web

Crie arquivo: `web/src/pages/IptvServersManager.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function IptvServersManager() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    server_name: '',
    xtream_url: '',
    xtream_username: '',
    xtream_password: '',
    server_type: 'custom'
  });

  // Carregar servidores
  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    try {
      const response = await api.get('/api/iptv-plugin/servers');
      setServers(response.data.servers);
    } catch (error) {
      console.error('Erro ao carregar servidores:', error);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar servidor
  const handleAddServer = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/iptv-plugin/add-server', formData);
      alert('Servidor adicionado com sucesso!');
      setFormData({
        server_name: '',
        xtream_url: '',
        xtream_username: '',
        xtream_password: '',
        server_type: 'custom'
      });
      loadServers();
    } catch (error) {
      alert('Erro ao adicionar servidor: ' + error.message);
    }
  };

  // Deletar servidor
  const handleDeleteServer = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este servidor?')) {
      try {
        await api.delete(`/api/iptv-plugin/server/${id}`);
        alert('Servidor deletado com sucesso!');
        loadServers();
      } catch (error) {
        alert('Erro ao deletar servidor: ' + error.message);
      }
    }
  };

  // Testar conexão
  const handleTestServer = async (id) => {
    try {
      const response = await api.post('/api/iptv-plugin/test-server', { server_id: id });
      alert(`Status: ${response.data.status}\n${response.data.message}`);
    } catch (error) {
      alert('Erro ao testar servidor: ' + error.message);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Gerenciar Servidores IPTV</h1>

      {/* Formulário */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Adicionar Novo Servidor</h2>
        <form onSubmit={handleAddServer} className="space-y-4">
          <input
            type="text"
            placeholder="Nome do Servidor"
            value={formData.server_name}
            onChange={(e) => setFormData({ ...formData, server_name: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="url"
            placeholder="URL do Servidor (http://...)"
            value={formData.xtream_url}
            onChange={(e) => setFormData({ ...formData, xtream_url: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Usuário"
            value={formData.xtream_username}
            onChange={(e) => setFormData({ ...formData, xtream_username: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Senha"
            value={formData.xtream_password}
            onChange={(e) => setFormData({ ...formData, xtream_password: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <select
            value={formData.server_type}
            onChange={(e) => setFormData({ ...formData, server_type: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="custom">Customizado</option>
            <option value="ibopro">IBOPro</option>
            <option value="ibocast">IBOCast</option>
            <option value="vuplayer">VU Player</option>
          </select>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Adicionar Servidor
          </button>
        </form>
      </div>

      {/* Lista de Servidores */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Servidores Cadastrados</h2>
        {servers.length === 0 ? (
          <p>Nenhum servidor cadastrado</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Nome</th>
                <th className="text-left p-2">URL</th>
                <th className="text-left p-2">Tipo</th>
                <th className="text-left p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {servers.map((server) => (
                <tr key={server.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{server.server_name}</td>
                  <td className="p-2 text-sm">{server.xtream_url}</td>
                  <td className="p-2">{server.server_type}</td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => handleTestServer(server.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Testar
                    </button>
                    <button
                      onClick={() => handleDeleteServer(server.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
```

### 4. Integrar com App Android

Modifique `IptvRepository.kt`:

```kotlin
class IptvRepository(private val apiService: MaxxControlApiService) {
  
  // Buscar servidor IPTV do painel
  suspend fun getIptvServer(): IptvServer {
    return try {
      val response = apiService.getIptvServer()
      response
    } catch (e: Exception) {
      // Fallback para servidor local
      IptvServer(
        url = "http://seu-servidor-local.com",
        username = "usuario",
        password = "senha"
      )
    }
  }

  // Sincronizar com painel
  suspend fun syncWithPanel(deviceId: String) {
    try {
      apiService.syncIptvDevice(deviceId)
    } catch (e: Exception) {
      Log.e("IptvRepository", "Erro ao sincronizar", e)
    }
  }
}
```

---

## 🚀 Como Usar

### No Painel

1. Acesse: `http://localhost:3000/iptv-servers`
2. Clique em "Adicionar Novo Servidor"
3. Preencha os dados:
   - Nome: "Meu Servidor"
   - URL: "http://servidor.com:8080"
   - Usuário: "usuario"
   - Senha: "senha"
4. Clique em "Adicionar Servidor"
5. Clique em "Testar" para verificar conexão
6. Atribua a um dispositivo

### No App

1. App busca servidor do painel automaticamente
2. Exibe canais da playlist
3. Reproduz streams

---

## ⚙️ Sincronização Automática

O plugin sincroniza automaticamente a cada 30 minutos:

```javascript
// Adicionar ao server.js
setInterval(async () => {
  try {
    await axios.post('http://localhost:3000/api/iptv-plugin/sync-all');
    console.log('✅ Sincronização IPTV concluída');
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
  }
}, 30 * 60 * 1000); // 30 minutos
```

---

## 📊 Fluxo de Dados

```
1. Você adiciona servidor no painel
   ↓
2. Servidor salvo no banco (iptv_servers)
   ↓
3. App busca servidor via API
   ↓
4. App exibe canais da playlist
   ↓
5. Usuário clica em canal
   ↓
6. App reproduz stream
   ↓
7. App reporta performance ao painel
```

---

## 🔐 Segurança

- Credenciais armazenadas no banco (criptografadas)
- Validação de token JWT no painel
- Token fixo para app (X-Device-Token)
- HTTPS em produção

---

## 📝 Resumo

✅ **Um único plugin** que substitui 3 plugins antigos
✅ **Integrado com painel** MaxxControl
✅ **Sem SmartOne** - apenas para seu app
✅ **Sincronização automática**
✅ **Gerenciamento completo** de servidores e playlists
✅ **Funciona offline** com fallback local

Pronto para usar!
