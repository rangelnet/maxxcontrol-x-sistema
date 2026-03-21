# ⚡ EXECUTAR MIGRATION IPTV - GUIA RÁPIDO

## 🎯 Problema
As colunas **Servidor, Usuário, Senha, Ping, Qualidade** não aparecem no painel porque as colunas não existem no banco de dados.

## ✅ Solução em 3 Passos

### Passo 1: Verificar se Colunas Existem
```bash
cd maxxcontrol-x-sistema
node database/migrations/check-iptv-columns.js
```

**Se aparecer "❌ NÃO EXISTE"**, continue para o Passo 2.

### Passo 2: Executar Migration
```bash
node database/migrations/run-iptv-multi-server-migrations.js
```

**Resultado esperado**:
```
✅ Migration add-iptv-multi-server-columns executada com sucesso
✅ Migration create-servers-table executada com sucesso
✅ Processo de migrations concluído!
```

### Passo 3: Verificar Novamente
```bash
node database/migrations/check-iptv-columns.js
```

**Agora deve aparecer**:
```
✅ server EXISTE
✅ username EXISTE
✅ password EXISTE
✅ ping EXISTE
✅ quality EXISTE
✅ stream_status EXISTE
```

## 🧪 Testar no Painel

1. Abrir painel: https://maxxcontrol-frontend.onrender.com
2. Ir em "Dispositivos"
3. Verificar se as colunas aparecem (mesmo que com "N/A")
4. Abrir o app no TV Box
5. Assistir um canal por 30 segundos
6. Atualizar o painel
7. Os dados devem aparecer!

## ⚠️ Se Não Funcionar

Execute o teste manual do endpoint:

```bash
curl -X POST https://maxxcontrol-x-sistema.onrender.com/api/iptv/monitor-status \
  -H "Content-Type: application/json" \
  -d '{
    "mac_address": "SEU_MAC_ADDRESS_AQUI",
    "server": "http://teste.com:8080",
    "ping": 50,
    "quality": "excelente",
    "stream_status": "playing"
  }'
```

**Resultado esperado**: `{"success": true}`

## 📋 Colunas que Serão Criadas

- `server` - URL do servidor IPTV atual
- `username` - Username IPTV do dispositivo
- `password` - Password IPTV do dispositivo
- `ping` - Tempo de resposta em ms
- `quality` - Qualidade (excelente, boa, regular, ruim)
- `stream_status` - Status (playing, buffering, error, stopped)
- `server_mode` - Modo (auto, manual)
- `api_test_url` - URL customizada para API de teste

## 🔍 Arquivos Relacionados

- **Migration**: `database/migrations/add-iptv-multi-server-columns.sql`
- **Script de execução**: `database/migrations/run-iptv-multi-server-migrations.js`
- **Script de verificação**: `database/migrations/check-iptv-columns.js`
- **Diagnóstico completo**: `DIAGNOSTICO_MONITORAMENTO_IPTV.md`

## ✨ Depois da Migration

O sistema funcionará assim:

1. **App Android** envia métricas a cada 30 segundos quando um canal está sendo reproduzido
2. **Backend** recebe e salva na tabela `devices`
3. **Painel Web** exibe os dados em tempo real

**Pronto!** 🎉
