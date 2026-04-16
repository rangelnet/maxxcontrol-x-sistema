# 🧪 Guia de Testes - Integração JWT Painel + App

## 📋 Resumo

Este guia descreve como testar a integração JWT entre o painel MaxxControl e o app TV-MAXX-PRO-Android.

---

## 🔧 Pré-requisitos

- ✅ Backend rodando em `http://localhost:3000`
- ✅ Frontend rodando em `http://localhost:5173`
- ✅ Banco de dados configurado
- ✅ Variáveis de ambiente configuradas (JWT_SECRET, JWT_EXPIRES_IN)
- ✅ App Android compilado e rodando em emulador/TV Box

---

## 🧪 Testes Backend

### Teste 1: Login com device_id

**Objetivo:** Verificar se o endpoint de login registra o device_id

**Ferramenta:** Postman ou curl

**Request:**
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "senha": "senha123",
  "device_id": "AA:BB:CC:DD:EE:FF",
  "modelo": "TV Box X96",
  "android_version": "11",
  "app_version": "1.0.0"
}
```

**Response Esperado:**
```json
{
  "user": {
    "id": 1,
    "nome": "Usuário Teste",
    "email": "user@example.com",
    "plano": "free",
    "status": "ativo"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "config": {
    "painel_url": "http://localhost:3000",
    "api_url": "http://localhost:3000/api",
    "device_id": 1,
    "mac_address": "AA:BB:CC:DD:EE:FF",
    "iptv_config": {
      "url": "http://iptv.example.com",
      "username": "user",
      "password": "pass"
    }
  }
}
```

**Validação:**
- [ ] Status 200
- [ ] Token retornado
- [ ] device_id retornado
- [ ] config retornada

---

### Teste 2: Validar Token

**Objetivo:** Verificar se o endpoint de validação funciona

**Request:**
```bash
GET http://localhost:3000/api/auth/validate-token
Authorization: Bearer <TOKEN_DO_TESTE_1>
```

**Response Esperado:**
```json
{
  "valid": true,
  "userId": 1
}
```

**Validação:**
- [ ] Status 200
- [ ] valid: true
- [ ] userId retornado

---

### Teste 3: Logout

**Objetivo:** Verificar se o endpoint de logout funciona

**Request:**
```bash
DELETE http://localhost:3000/api/auth/logout
Authorization: Bearer <TOKEN_DO_TESTE_1>
```

**Response Esperado:**
```json
{
  "message": "Logout realizado com sucesso"
}
```

**Validação:**
- [ ] Status 200
- [ ] Mensagem de sucesso

---

### Teste 4: Verificar Device Registrado

**Objetivo:** Verificar se o device foi registrado no banco

**Query SQL:**
```sql
SELECT * FROM devices WHERE mac_address = 'AA:BB:CC:DD:EE:FF';
```

**Resultado Esperado:**
```
id | user_id | mac_address | modelo | android_version | app_version | status | connection_status
1  | 1       | AA:BB:CC:DD:EE:FF | TV Box X96 | 11 | 1.0.0 | ativo | online
```

**Validação:**
- [ ] Device registrado
- [ ] user_id correto
- [ ] mac_address correto
- [ ] status = 'ativo'
- [ ] connection_status = 'online'

---

## 🌐 Testes Frontend (Painel)

### Teste 5: Login no Painel

**Objetivo:** Verificar se o login funciona no painel

**Passos:**
1. Abrir `http://localhost:5173`
2. Preencher email e senha
3. Clicar em "Entrar"

**Validação:**
- [ ] Redirecionado para Dashboard
- [ ] Token salvo em localStorage
- [ ] Usuário exibido no painel

**Verificar no Console:**
```javascript
localStorage.getItem('token')
// Deve retornar o JWT token
```

---

### Teste 6: Persistência de Token

**Objetivo:** Verificar se o token persiste após recarregar a página

**Passos:**
1. Fazer login (Teste 5)
2. Recarregar a página (F5)
3. Verificar se mantém login

**Validação:**
- [ ] Mantém login após recarregar
- [ ] Não redireciona para login
- [ ] Dashboard carrega normalmente

---

### Teste 7: Proteção de Rotas

**Objetivo:** Verificar se rotas protegidas redirecionam para login

**Passos:**
1. Fazer logout
2. Tentar acessar `http://localhost:5173/devices` diretamente
3. Verificar redirecionamento

**Validação:**
- [ ] Redirecionado para login
- [ ] Não consegue acessar rota protegida

---

### Teste 8: Logout no Painel

**Objetivo:** Verificar se o logout funciona

**Passos:**
1. Fazer login (Teste 5)
2. Clicar em "Sair" (botão no topo)
3. Verificar redirecionamento

**Validação:**
- [ ] Redirecionado para login
- [ ] Token removido de localStorage
- [ ] Não consegue acessar Dashboard

**Verificar no Console:**
```javascript
localStorage.getItem('token')
// Deve retornar null
```

---

## 📱 Testes App Android

### Teste 9: Login no App

**Objetivo:** Verificar se o login funciona no app

**Passos:**
1. Abrir app TV-MAXX-PRO-Android
2. Preencher email e senha (mesma conta do painel)
3. Clicar em "TESTE GRÁTIS"

**Validação:**
- [ ] Login bem-sucedido
- [ ] Redirecionado para Dashboard
- [ ] Token salvo em SharedPreferences

**Verificar no Logcat:**
```
AuthRepository: Login bem-sucedido
SessionManager: Token salvo
```

---

### Teste 10: Validação de Token na Inicialização

**Objetivo:** Verificar se o app valida token ao iniciar

**Passos:**
1. Fazer login no app (Teste 9)
2. Fechar app completamente
3. Reabrir app
4. Verificar se mantém login

**Validação:**
- [ ] Mantém login após fechar/reabrir
- [ ] Não pede para fazer login novamente
- [ ] Dashboard carrega normalmente

**Verificar no Logcat:**
```
SplashViewModel: Token encontrado
AuthRepository: Validando token
SplashViewModel: Token válido, navegando para Home
```

---

### Teste 11: Logout no App

**Objetivo:** Verificar se o logout funciona no app

**Passos:**
1. Fazer login no app (Teste 9)
2. Navegar para menu de configurações
3. Clicar em "Logout"
4. Verificar redirecionamento

**Validação:**
- [ ] Redirecionado para login
- [ ] Token removido de SharedPreferences
- [ ] Não consegue acessar Dashboard

**Verificar no Logcat:**
```
AuthRepository: Logout bem-sucedido
SessionManager: Token removido
```

---

## 🔄 Testes de Integração

### Teste 12: Mesma Conta em Painel e App

**Objetivo:** Verificar se a mesma conta funciona em ambos

**Passos:**
1. Fazer login no painel com `user@example.com`
2. Fazer login no app com `user@example.com`
3. Verificar se ambos têm acesso

**Validação:**
- [ ] Login bem-sucedido em ambos
- [ ] Tokens diferentes (esperado)
- [ ] Ambos conseguem acessar APIs

---

### Teste 13: Device Registrado em Ambos

**Objetivo:** Verificar se o device é registrado corretamente

**Passos:**
1. Fazer login no app (Teste 9)
2. Fazer login no painel (Teste 5)
3. Ir para "Dispositivos" no painel
4. Verificar se o device do app aparece

**Validação:**
- [ ] Device aparece na lista
- [ ] MAC address correto
- [ ] Modelo correto
- [ ] Status = 'ativo'

---

### Teste 14: Logout em Um Não Afeta o Outro

**Objetivo:** Verificar se logout em um não afeta o outro

**Passos:**
1. Fazer login no painel (Teste 5)
2. Fazer login no app (Teste 9)
3. Fazer logout no app
4. Verificar se painel ainda funciona

**Validação:**
- [ ] App redirecionado para login
- [ ] Painel continua funcionando
- [ ] Painel não foi afetado

---

## ✅ Checklist de Testes

### Backend
- [ ] Teste 1: Login com device_id
- [ ] Teste 2: Validar Token
- [ ] Teste 3: Logout
- [ ] Teste 4: Verificar Device Registrado

### Frontend (Painel)
- [ ] Teste 5: Login no Painel
- [ ] Teste 6: Persistência de Token
- [ ] Teste 7: Proteção de Rotas
- [ ] Teste 8: Logout no Painel

### App Android
- [ ] Teste 9: Login no App
- [ ] Teste 10: Validação de Token na Inicialização
- [ ] Teste 11: Logout no App

### Integração
- [ ] Teste 12: Mesma Conta em Painel e App
- [ ] Teste 13: Device Registrado em Ambos
- [ ] Teste 14: Logout em Um Não Afeta o Outro

---

## 🐛 Troubleshooting

### Problema: Token inválido após login

**Solução:**
1. Verificar se JWT_SECRET está configurado
2. Verificar se JWT_EXPIRES_IN está configurado
3. Verificar se o token não expirou

### Problema: Device não registrado

**Solução:**
1. Verificar se device_id foi enviado no login
2. Verificar se a tabela devices existe
3. Verificar se há erro no console do backend

### Problema: Logout não funciona

**Solução:**
1. Verificar se o token é válido
2. Verificar se o middleware de autenticação está funcionando
3. Verificar se localStorage está sendo limpo

### Problema: Rotas protegidas não funcionam

**Solução:**
1. Verificar se PrivateRoute está importado corretamente
2. Verificar se AuthProvider está envolvendo o App
3. Verificar se o token está sendo salvo em localStorage

---

## 📞 Próximos Passos

1. ✅ Executar todos os testes
2. ✅ Documentar resultados
3. ✅ Corrigir problemas encontrados
4. ✅ Deploy em produção

