# 🚀 Executar Migrations - Free Test e IPTV Display

## ✅ Status da Implementação

### Backend APIs - COMPLETO ✅
- ✅ GET /api/device/test-api-url/:mac - Buscar URL de teste por MAC
- ✅ POST /api/device/test-api-url - Configurar URL de teste
- ✅ GET /api/device/list-all - Incluindo campos IPTV (current_iptv_server_url, current_iptv_username)
- ✅ POST /api/iptv-server/device/:deviceId - Atualiza cache IPTV
- ✅ DELETE /api/iptv-server/device/:deviceId - Limpa cache IPTV
- ✅ WebSocket broadcasts para atualizações em tempo real

### Admin Panel - COMPLETO ✅
- ✅ TestApiModal component criado
- ✅ Coluna "IPTV Server" adicionada na lista de dispositivos
- ✅ Botão "Test API" adicionado nas ações
- ✅ URL truncation (40 caracteres) com tooltip
- ✅ WebSocket listeners para atualizações em tempo real

### Android App - VERIFICADO ✅
- ✅ LoginViewModel.generateTest() já implementado
- ✅ MaxxControlRepository.getTestApiUrl() já implementado
- ✅ Lógica de precedência: custom URL > default URL > fallback

---

## 📋 Passo 1: Executar Migrations SQL

### Migration 1: Adicionar coluna test_api_url

**Arquivo:** `MaxxControl/maxxcontrol-x-sistema/database/migrations/add_test_api_url_column.sql`

```sql
-- Adicionar coluna test_api_url na tabela devices
ALTER TABLE devices 
ADD COLUMN IF NOT EXISTS test_api_url TEXT NULL;

COMMENT ON COLUMN devices.test_api_url IS 'URL personalizada da API de teste grátis (chatbot) para este dispositivo';
```

**Como executar:**

**Opção A - Supabase Dashboard:**
1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em "SQL Editor"
4. Cole o SQL acima
5. Clique em "Run"

**Opção B - psql (linha de comando):**
```bash
psql "postgresql://postgres:[SUA-SENHA]@[SEU-HOST]:5432/postgres" -f maxxcontrol-x-sistema/database/migrations/add_test_api_url_column.sql
```

---

### Migration 2: Adicionar colunas de cache IPTV

**Arquivo:** `MaxxControl/maxxcontrol-x-sistema/database/migrations/add_iptv_cache_columns.sql`

```sql
-- Adicionar colunas de cache IPTV na tabela devices
ALTER TABLE devices 
ADD COLUMN IF NOT EXISTS current_iptv_server_url TEXT NULL,
ADD COLUMN IF NOT EXISTS current_iptv_username TEXT NULL;

COMMENT ON COLUMN devices.current_iptv_server_url IS 'Cache do servidor IPTV atual (para exibição rápida na lista)';
COMMENT ON COLUMN devices.current_iptv_username IS 'Cache do usuário IPTV atual (para exibição rápida na lista)';

-- Popular cache com dados existentes da tabela device_iptv_config
UPDATE devices d
SET 
  current_iptv_server_url = dic.xtream_url,
  current_iptv_username = dic.xtream_username
FROM device_iptv_config dic
WHERE d.id = dic.device_id;
```

**Como executar:**

**Opção A - Supabase Dashboard:**
1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em "SQL Editor"
4. Cole o SQL acima
5. Clique em "Run"

**Opção B - psql (linha de comando):**
```bash
psql "postgresql://postgres:[SUA-SENHA]@[SEU-HOST]:5432/postgres" -f maxxcontrol-x-sistema/database/migrations/add_iptv_cache_columns.sql
```

---

## 🧪 Passo 2: Testar Backend APIs

### Teste 1: GET /api/device/test-api-url/:mac

```bash
# Substitua MAC_ADDRESS pelo MAC de um dispositivo existente
curl -X GET "http://localhost:3000/api/device/test-api-url/AA:BB:CC:DD:EE:FF"
```

**Resposta esperada:**
```json
{
  "test_api_url": null,
  "has_custom_url": false
}
```

---

### Teste 2: POST /api/device/test-api-url

```bash
# Substitua TOKEN pelo seu token JWT
# Substitua MAC_ADDRESS pelo MAC de um dispositivo existente
curl -X POST "http://localhost:3000/api/device/test-api-url" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "mac_address": "AA:BB:CC:DD:EE:FF",
    "test_api_url": "https://painel.masterbins.com/api/chatbot/CUSTOM123/TOKEN456"
  }'
```

**Resposta esperada:**
```json
{
  "device": { ... },
  "message": "URL configurada com sucesso"
}
```

---

### Teste 3: GET /api/device/list-all (verificar campos IPTV)

```bash
# Substitua TOKEN pelo seu token JWT
curl -X GET "http://localhost:3000/api/device/list-all" \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

**Resposta esperada (deve incluir campos IPTV):**
```json
{
  "devices": [
    {
      "id": 1,
      "mac_address": "AA:BB:CC:DD:EE:FF",
      "current_iptv_server_url": "http://exemplo.com:8080",
      "current_iptv_username": "usuario123",
      ...
    }
  ]
}
```

---

## 🖥️ Passo 3: Testar Admin Panel

### 1. Abrir o painel admin
```
http://localhost:5173
```

### 2. Fazer login

### 3. Navegar para "Dispositivos"

### 4. Verificar nova coluna "IPTV Server"
- ✅ Deve mostrar URL do servidor IPTV (truncada em 40 caracteres)
- ✅ Deve mostrar "Não Configurado" se não houver IPTV
- ✅ Deve mostrar usuário IPTV abaixo da URL
- ✅ Clicar na célula deve abrir modal de configuração IPTV

### 5. Testar botão "Test API" (ícone roxo)
- ✅ Clicar deve abrir modal "API de Teste Grátis"
- ✅ Modal deve mostrar MAC e modelo do dispositivo
- ✅ Campo de URL deve aceitar URLs HTTP/HTTPS
- ✅ Botão "Salvar" deve configurar URL
- ✅ Botão "Limpar" (lixeira) deve remover URL personalizada

### 6. Testar atualizações em tempo real
- ✅ Abrir painel em 2 abas diferentes
- ✅ Configurar Test API URL em uma aba
- ✅ Verificar se a outra aba atualiza automaticamente (via WebSocket)

---

## 📱 Passo 4: Testar Android App

### 1. Compilar e instalar app atualizado

### 2. Abrir app e ir para tela de login

### 3. Clicar em "TESTE GRÁTIS"

### 4. Verificar comportamento:
- ✅ App deve chamar GET /api/device/test-api-url/:mac
- ✅ Se houver URL personalizada, deve usar essa URL
- ✅ Se não houver, deve usar URL padrão
- ✅ Se API falhar, deve usar credenciais fallback

### 5. Verificar logs no Logcat:
```
🔍 Buscando test_api_url para MAC: AA:BB:CC:DD:EE:FF
✅ test_api_url encontrado: https://... (has_custom_url: true)
```

---

## 🔍 Validações de Segurança

### URLs Válidas ✅
```
https://painel.masterbins.com/api/chatbot/ABC123/DEF456
http://exemplo.com:8080/api/test
```

### URLs Inválidas ❌ (devem ser rejeitadas)
```
javascript:alert('xss')                    // XSS
ftp://exemplo.com                          // Protocolo inválido
http://exemplo.com/api?id=1 UNION SELECT  // SQL Injection
http://exemplo.com/<script>alert(1)</script>  // XSS
```

---

## 📊 Checklist Final

### Backend
- [ ] Migration 1 executada com sucesso
- [ ] Migration 2 executada com sucesso
- [ ] GET /api/device/test-api-url/:mac retorna dados corretos
- [ ] POST /api/device/test-api-url salva URL corretamente
- [ ] POST /api/device/test-api-url rejeita URLs inválidas
- [ ] GET /api/device/list-all inclui campos IPTV
- [ ] WebSocket broadcasts funcionando

### Admin Panel
- [ ] Coluna "IPTV Server" visível na lista
- [ ] URLs truncadas em 40 caracteres
- [ ] Tooltip mostra URL completa ao passar mouse
- [ ] Botão "Test API" abre modal correto
- [ ] Modal salva URL corretamente
- [ ] Modal limpa URL corretamente
- [ ] Atualizações em tempo real funcionando

### Android App
- [ ] App busca URL personalizada ao clicar "TESTE GRÁTIS"
- [ ] App usa URL personalizada quando configurada
- [ ] App usa URL padrão quando não configurada
- [ ] App usa fallback quando API falha

---

## 🐛 Troubleshooting

### Erro: "coluna test_api_url não existe"
**Solução:** Execute a Migration 1 novamente

### Erro: "coluna current_iptv_server_url não existe"
**Solução:** Execute a Migration 2 novamente

### WebSocket não conecta
**Solução:** Verifique se o servidor WebSocket está rodando na porta correta

### Modal não abre
**Solução:** Verifique console do navegador para erros JavaScript

### App Android não busca URL
**Solução:** Verifique se o endpoint está acessível e se o MAC está correto

---

## 📝 Notas Importantes

1. **Migrations são idempotentes**: Podem ser executadas múltiplas vezes sem problemas (usam `IF NOT EXISTS`)

2. **Cache IPTV**: É atualizado automaticamente quando você salva/deleta configuração IPTV no painel

3. **WebSocket**: Requer autenticação JWT para funcionar

4. **Validação de URL**: Backend valida formato, protocolo, e padrões de injeção

5. **Android App**: Não precisa de alterações, já está implementado

---

## ✅ Próximos Passos

Após executar as migrations e testar:

1. **Configurar URL de teste para alguns dispositivos**
2. **Testar no app Android**
3. **Verificar se IPTV Server aparece na lista**
4. **Monitorar logs para erros**

---

**Implementação completa! 🎉**

Todas as funcionalidades principais foram implementadas:
- ✅ Backend APIs (GET/POST test-api-url)
- ✅ Cache IPTV na tabela devices
- ✅ Admin panel com coluna IPTV e modal Test API
- ✅ WebSocket para atualizações em tempo real
- ✅ Validações de segurança (SQL injection, XSS)
- ✅ Integração com Android app existente
