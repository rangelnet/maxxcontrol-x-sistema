# Teste de Dispositivo - Debug

## MAC do Dispositivo
```
3C:E5:B4:1B:FB:1C
```

## Teste 1: Verificar se o dispositivo está no banco
```bash
# No Supabase, execute:
SELECT * FROM devices WHERE mac_address = '3C:E5:B4:1B:FB:1C';
```

## Teste 2: Chamar a API de listagem
```bash
# Abra o navegador e acesse (com token JWT):
https://maxxcontrol-x-sistema.onrender.com/api/device/list-all

# Ou via curl:
curl -H "Authorization: Bearer SEU_TOKEN_JWT" \
  https://maxxcontrol-x-sistema.onrender.com/api/device/list-all
```

## Teste 3: Verificar o console do navegador
1. Abra o painel em https://maxxcontrol-frontend.onrender.com
2. Faça login
3. Vá para Dispositivos
4. Abra DevTools (F12)
5. Vá para Console
6. Procure por erros de rede

## Teste 4: Verificar logs do backend
```bash
# No Render, veja os logs da aplicação
# Procure por erros ao chamar /api/device/list-all
```

## Possíveis Problemas

### 1. Dispositivo não está no banco
- O app não conseguiu registrar
- Verifique se o app está enviando o MAC correto

### 2. Middleware de autenticação está bloqueando
- Token JWT inválido ou expirado
- Faça login novamente no painel

### 3. Resposta vazia
- Banco está vazio
- Dispositivo foi registrado mas com dados diferentes

## Próximos Passos
1. Verifique o banco de dados
2. Verifique os logs do backend
3. Verifique o console do navegador
