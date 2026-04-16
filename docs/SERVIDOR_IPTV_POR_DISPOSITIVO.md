# Servidor IPTV por Dispositivo

## ✅ Sistema Implementado

Agora você pode configurar um servidor IPTV diferente para cada dispositivo!

### Como Funciona

**Configuração em 2 Níveis:**

1. **Global** (padrão para todos)
   - Página: "Servidor IPTV"
   - Usado quando o dispositivo não tem configuração específica

2. **Por Dispositivo** (sobrescreve o global)
   - Página: "Dispositivos" → Botão do ícone Server
   - Cada dispositivo pode ter seu próprio servidor

### Estrutura do Banco de Dados

```sql
-- Configuração global (1 registro apenas)
CREATE TABLE iptv_server_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  xtream_url VARCHAR(255),
  xtream_username VARCHAR(100),
  xtream_password VARCHAR(100),
  updated_at TIMESTAMP
);

-- Configuração por dispositivo (múltiplos registros)
CREATE TABLE device_iptv_config (
  id SERIAL PRIMARY KEY,
  device_id INTEGER REFERENCES devices(id),
  xtream_url VARCHAR(255),
  xtream_username VARCHAR(100),
  xtream_password VARCHAR(100),
  updated_at TIMESTAMP,
  UNIQUE(device_id)
);
```

### Endpoints da API

**Global:**
- `GET /api/iptv-server/config` - Buscar configuração global
- `POST /api/iptv-server/config` - Salvar configuração global
- `POST /api/iptv-server/test` - Testar conexão

**Por Dispositivo:**
- `GET /api/iptv-server/config/:mac` - App busca por MAC (retorna específico ou global)
- `GET /api/iptv-server/device/:deviceId` - Buscar config de um dispositivo
- `POST /api/iptv-server/device/:deviceId` - Salvar config de um dispositivo
- `DELETE /api/iptv-server/device/:deviceId` - Remover config (volta para global)

### Como Usar no Painel

**1. Configurar Servidor Global:**
   - Acesse "Servidor IPTV" no menu
   - Preencha URL, usuário e senha
   - Clique em "Salvar"
   - Todos os dispositivos sem configuração específica usarão este

**2. Configurar Servidor por Dispositivo:**
   - Acesse "Dispositivos" no menu
   - Clique no ícone Server (🖥️) do dispositivo
   - Preencha URL, usuário e senha específicos
   - Clique em "Salvar"
   - Este dispositivo usará esta configuração

**3. Remover Configuração Específica:**
   - No modal do dispositivo, clique no ícone da lixeira
   - O dispositivo voltará a usar a configuração global

### Lógica no App Android

Quando o app buscar a configuração:

```kotlin
// BrandingManager.kt
val response = api.getXtreamConfig(macAddress)

// API retorna:
// 1. Se dispositivo tem config específica → retorna ela
// 2. Se não tem → retorna a global
// 3. Se nenhuma configurada → retorna vazio
```

### Vantagens

✅ Flexibilidade total
✅ Configuração global como fallback
✅ Fácil gerenciamento por dispositivo
✅ Pode remover config específica a qualquer momento
✅ Interface intuitiva com modal

### Status do Deploy

✅ Commit: `b9b3d9a`
✅ Push realizado
⏳ Aguardando rebuild do Render

### Exemplo de Uso

**Cenário 1: Todos com mesmo servidor**
- Configure apenas o servidor global
- Todos os dispositivos usarão ele

**Cenário 2: Alguns dispositivos diferentes**
- Configure servidor global para maioria
- Configure servidores específicos para alguns dispositivos
- Cada um usará sua configuração

**Cenário 3: Teste em um dispositivo**
- Configure servidor de teste em um dispositivo específico
- Outros continuam com servidor de produção
