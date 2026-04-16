# Debug - Dispositivo Não Aparece no Painel

## Seu MAC
```
3C:E5:B4:1B:FB:1C
```

## Checklist de Debug

### ✅ Passo 1: Executar Migração (IMPORTANTE!)
**Arquivo**: `EXECUTAR_MIGRACAO_AGORA.md`

Você PRECISA executar o SQL no Supabase para adicionar a coluna `test_api_url`.

### ✅ Passo 2: Verificar se o Dispositivo Está no Banco
**Arquivo**: `TESTAR_API_DISPOSITIVO.md`

Cole o código JavaScript no console do navegador para testar a API.

### ✅ Passo 3: Verificar os Logs do Backend
1. Vá para https://dashboard.render.com
2. Selecione "maxxcontrol-x-sistema"
3. Vá para "Logs"
4. Procure por "Listando TODOS os dispositivos"
5. Procure por seu MAC: `3C:E5:B4:1B:FB:1C`

### ✅ Passo 4: Testar o App Novamente
1. Abra o app no dispositivo
2. Faça login
3. Volte para o painel
4. Atualize a página

## Ordem de Execução

1. **PRIMEIRO**: Executar migração no Supabase
2. **DEPOIS**: Testar a API no console
3. **DEPOIS**: Verificar os logs
4. **DEPOIS**: Testar o app novamente

## Se Ainda Não Funcionar

Me avise qual foi o resultado de cada passo:
- ✅ Migração executada com sucesso?
- ✅ API retornou dispositivos?
- ✅ Logs mostram o MAC?
- ✅ App conseguiu registrar?

Vou debugar mais a fundo!
