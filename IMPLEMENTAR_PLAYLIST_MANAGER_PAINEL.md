# 🎬 IMPLEMENTAR PLAYLIST MANAGER NO PAINEL

## 🎯 OBJETIVO

Integrar as funcionalidades do **Plugin 4: Playlist Manager 4-in-1** diretamente no painel MaxxControl X, sem sistema de licenciamento e usando as cores do painel.

---

## 📋 O QUE SERÁ IMPLEMENTADO

### **Funcionalidades do Plugin 4:**
- ✅ Cadastro de playlists em 4 plataformas (SmartOne, IBOCast, IBOPro, VU Player)
- ✅ Gerenciamento de servidores IPTV
- ✅ Seleção múltipla de servidores
- ✅ Registro em lote (mesmo MAC em vários servidores)
- ✅ Construção automática de URLs Xtream
- ✅ Log de atividades em tempo real
- ✅ Estatísticas visuais

### **Adaptações:**
- ❌ Remover sistema de licenciamento
- ✅ Usar cores do painel MaxxControl
- ✅ Integrar com autenticação JWT existente
- ✅ Salvar servidores no banco de dados
- ✅ Interface consistente com o painel

---

## 🎨 CORES DO PAINEL MAXXCONTROL

```css
/* Cores principais do painel */
--primary: #3b82f6;      /* Azul */
--secondary: #8b5cf6;    /* Roxo claro */
--success: #10b981;      /* Verde */
--danger: #ef4444;       /* Vermelho */
--warning: #f59e0b;      /* Amarelo */
--dark: #1f2937;         /* Cinza escuro */
--light: #f3f4f6;        /* Cinza claro */
```

---

## 📁 ESTRUTURA DE ARQUIVOS

### **Backend**

```
maxxcontrol-x-sistema/
├── modules/
│   └── playlist-manager/
│       ├── playlistManagerController.js
│       └── playlistManagerRoutes.js
│
└── database/
    └── migrations/
        └── create-playlist-servers-table.sql
```

### **Frontend**

```
maxxcontrol-x-sistema/web/src/pages/
└── PlaylistManager.jsx
```

---

## 🗄️ BANCO DE DADOS

### **Nova Tabela: playlist_servers**

```sql
CREATE TABLE IF NOT EXISTS playlist_servers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  dns VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_playlist_servers_name ON playlist_servers(name);
```

---

## 🔧 IMPLEMENTAÇÃO

### **Passo 1: Criar Migration**

Arquivo: `database/migrations/create-playlist-servers-table.sql`

### **Passo 2: Criar Backend**

Arquivo: `modules/playlist-manager/playlistManagerController.js`

**Endpoints:**
- `GET /api/playlist-manager/servers` - Listar servidores
- `POST /api/playlist-manager/servers` - Adicionar servidor
- `DELETE /api/playlist-manager/servers/:id` - Deletar servidor
- `POST /api/playlist-manager/register` - Registrar playlists

### **Passo 3: Criar Frontend**

Arquivo: `web/src/pages/PlaylistManager.jsx`

**Componentes:**
- Seleção de plataforma (4 botões)
- Gerenciamento de servidores
- Formulário de registro em lote
- Log de atividades
- Estatísticas

---

## 🎯 DIFERENÇAS DO PLUGIN

| Característica | Plugin 4 | Painel MaxxControl |
|---------------|----------|-------------------|
| **Licenciamento** | ✅ Sim | ❌ Não (uso interno) |
| **Autenticação** | Hardware ID | JWT (já existente) |
| **Armazenamento** | Chrome Storage | PostgreSQL/SQLite |
| **Cores** | Roxo (#6B46C1) | Azul (#3b82f6) |
| **Deployment** | Extensão Chrome | Página web |
| **Acesso** | Local (navegador) | Online (servidor) |

---

## ⚡ VANTAGENS DA IMPLEMENTAÇÃO NO PAINEL

### **1. Centralização**
- Tudo em um único lugar
- Não precisa instalar extensão
- Acesso de qualquer navegador

### **2. Persistência**
- Servidores salvos no banco de dados
- Histórico de registros
- Backup automático

### **3. Controle de Acesso**
- Autenticação JWT
- Múltiplos usuários
- Logs de auditoria

### **4. Integração**
- Usa mesma infraestrutura
- Compartilha autenticação
- Consistência visual

---

## 🚀 PRÓXIMOS PASSOS

1. **Criar migration** do banco de dados
2. **Implementar backend** (controller + routes)
3. **Criar página frontend** (PlaylistManager.jsx)
4. **Adicionar rota** no menu do painel
5. **Testar funcionalidades**

---

## 📝 NOTAS IMPORTANTES

### **Métodos de Cadastro**

Como é uma página web (não extensão Chrome), os métodos serão diferentes:

**Plugin 4 (Extensão):**
- Abre abas em background
- Injeta content scripts
- Fecha abas automaticamente

**Painel (Web):**
- Faz requisições HTTP diretas
- Usa CORS e proxies se necessário
- Exibe resultados na mesma página

### **Limitações**

1. **SmartOne/IBOCast**: Precisará de proxy ou CORS habilitado
2. **IBOPro**: Pode usar API REST diretamente
3. **VU Player**: Precisará de proxy ou CORS habilitado

### **Solução**

Criar endpoints proxy no backend que fazem as requisições:

```javascript
POST /api/playlist-manager/register-smartone
POST /api/playlist-manager/register-ibocast
POST /api/playlist-manager/register-ibopro
POST /api/playlist-manager/register-vuplayer
```

O backend faz as requisições e retorna os resultados.

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Criar migration do banco de dados
- [ ] Executar migration
- [ ] Criar playlistManagerController.js
- [ ] Criar playlistManagerRoutes.js
- [ ] Registrar rotas no server.js
- [ ] Criar PlaylistManager.jsx
- [ ] Adicionar rota no menu
- [ ] Testar CRUD de servidores
- [ ] Testar registro SmartOne
- [ ] Testar registro IBOCast
- [ ] Testar registro IBOPro
- [ ] Testar registro VU Player
- [ ] Testar log de atividades
- [ ] Testar estatísticas

---

## 🎉 RESULTADO FINAL

Uma página completa no painel MaxxControl X que permite:

- ✅ Gerenciar servidores IPTV
- ✅ Cadastrar playlists em 4 plataformas
- ✅ Registro em lote
- ✅ Log em tempo real
- ✅ Estatísticas visuais
- ✅ Interface consistente com o painel
- ✅ Sem necessidade de extensão Chrome
- ✅ Acesso de qualquer lugar

**🚀 Pronto para começar a implementação!**
