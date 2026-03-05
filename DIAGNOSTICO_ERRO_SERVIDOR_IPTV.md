# 🔍 Diagnóstico: Erro ao Salvar Configuração do Servidor IPTV

## ❌ Problema
Ao tentar configurar um servidor IPTV customizado para um dispositivo no painel, aparece o erro:
```
maxxcontrol-x-sistema.onrender.com diz
Erro ao salvar configuração
```

## 🎯 Causa Provável
A tabela `device_iptv_config` pode não existir no banco de dados Supabase.

## ✅ Solução: Criar a Tabela no Supabase

### Passo 1: Abrir o Supabase SQL Editor
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em **SQL Editor** no menu lateral

### Passo 2: Executar o SQL de Criação da Tabela

Cole e execute este SQL:

```sql
-- Criar tabela de configuração IPTV global (se não existir)
CREATE TABLE IF NOT EXISTS iptv_server_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  xtream_url TEXT NOT NULL,
  xtream_username TEXT NOT NULL,
  xtream_password TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Criar tabela de configuração IPTV por dispositivo (se não existir)
CREATE TABLE IF NOT EXISTS device_iptv_config (
  id SERIAL PRIMARY KEY,
  device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  xtream_url TEXT NOT NULL,
  xtream_username TEXT NOT NULL,
  xtream_password TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(device_id)
);

-- Adicionar colunas de cache na tabela devices (se não existirem)
ALTER TABLE devices 
ADD COLUMN IF NOT EXISTS current_iptv_server_url TEXT,
ADD COLUMN IF NOT EXISTS current_iptv_username TEXT;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_device_iptv_config_device_id ON device_iptv_config(device_id);

-- Inserir configuração global padrão (se não existir)
INSERT INTO iptv_server_config (id, xtream_url, xtream_username, xtream_password)
VALUES (1, 'http://newoneblack.site', '', '')
ON CONFLICT (id) DO NOTHING;
```

### Passo 3: Verificar se as Tabelas Foram Criadas

Execute este SQL para verificar:

```sql
-- Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('iptv_server_config', 'device_iptv_config');

-- Verificar estrutura da tabela device_iptv_config
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'device_iptv_config';

-- Verificar se as colunas de cache existem na tabela devices
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'devices' 
AND column_name IN ('current_iptv_server_url', 'current_iptv_username');
```

**Resultado esperado:**
- Deve mostrar as 2 tabelas: `iptv_server_config` e `device_iptv_config`
- Deve mostrar as colunas: `id`, `device_id`, `xtream_url`, `xtream_username`, `xtream_password`, `updated_at`
- Deve mostrar as colunas de cache na tabela `devices`

## 🧪 Testar Novamente

Depois de executar o SQL:

1. **Recarregue a página do painel** (F5)
2. Vá em **Dispositivos**
3. Clique no ícone **⚙ Servidor IPTV** de um dispositivo
4. Preencha os campos:
   - **URL de Servidor**: `http://five-stars.site:80`
   - **Usuário**: `383984600`
   - **Senha**: `••••••••` (sua senha)
5. Clique em **💾 Salvar**

**Resultado esperado:**
- ✅ Mensagem: "Configuração salva com sucesso!"
- ✅ O dispositivo agora tem servidor IPTV customizado
- ✅ O app Android vai usar esse servidor ao invés do global

## 🔍 Verificar Logs do Backend (Se Ainda Não Funcionar)

Se o erro persistir, verifique os logs do Render:

1. Acesse: https://dashboard.render.com
2. Selecione seu serviço **maxxcontrol-x-sistema**
3. Clique em **Logs**
4. Procure por mensagens de erro como:
   - `❌ Erro ao salvar configuração IPTV:`
   - `relation "device_iptv_config" does not exist`
   - `column "current_iptv_server_url" does not exist`

## 📊 Verificar Configuração Salva

Depois de salvar com sucesso, execute este SQL para verificar:

```sql
-- Ver configuração global
SELECT * FROM iptv_server_config;

-- Ver configurações por dispositivo
SELECT 
  d.mac_address,
  d.model,
  dic.xtream_url,
  dic.xtream_username,
  dic.updated_at
FROM device_iptv_config dic
JOIN devices d ON d.id = dic.device_id;

-- Ver cache na tabela devices
SELECT 
  mac_address,
  model,
  current_iptv_server_url,
  current_iptv_username
FROM devices
WHERE current_iptv_server_url IS NOT NULL;
```

## 🎯 Como Funciona

### Fluxo de Configuração:

1. **Painel Web** → Você configura servidor IPTV para um dispositivo específico
2. **Backend** → Salva em `device_iptv_config` e atualiza cache em `devices`
3. **WebSocket** → Notifica em tempo real que a configuração mudou
4. **App Android** → Ao iniciar, busca configuração via `/api/iptv-server/config/:mac`
5. **Prioridade**: Configuração específica > Configuração global

### Exemplo de Resposta da API:

```json
{
  "xtream_url": "http://five-stars.site:80",
  "xtream_username": "383984600",
  "xtream_password": "sua_senha"
}
```

## ✅ Checklist de Verificação

- [ ] Tabela `iptv_server_config` existe
- [ ] Tabela `device_iptv_config` existe
- [ ] Colunas `current_iptv_server_url` e `current_iptv_username` existem em `devices`
- [ ] SQL de criação executado sem erros
- [ ] Página do painel recarregada
- [ ] Configuração salva com sucesso
- [ ] Logs do Render não mostram erros

## 🚀 Próximos Passos

Depois de corrigir:

1. **Teste no App Android**: Compile e instale o app
2. **Verifique os Logs**: O app deve buscar a configuração customizada
3. **Teste o Login IPTV**: Use as credenciais configuradas
4. **Monitore o Painel**: Veja se o dispositivo aparece online

## 📝 Notas Importantes

- **Configuração Global**: Usada quando o dispositivo não tem configuração específica
- **Configuração Específica**: Sobrescreve a global para aquele dispositivo
- **Cache**: As colunas `current_iptv_*` em `devices` são para exibição rápida no painel
- **WebSocket**: Atualiza o painel em tempo real quando a configuração muda
- **Segurança**: As senhas são armazenadas em texto plano (considere criptografar em produção)

---

**Status**: 🔧 Aguardando execução do SQL no Supabase
