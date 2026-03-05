# 🧪 Guia de Testes: Login com JWT

## 📋 Testes de API (Postman)

### Teste 1: Login com Credenciais Válidas

**Endpoint**: `POST https://maxxcontrol-x-sistema.onrender.com/api/auth/login`

**Headers**:
```
Content-Type: application/json
Accept: application/json
```

**Body**:
```json
{
  "email": "admin@maxxcontrol.com",
  "password": "sua_senha_aqui",
  "device_id": "AA:BB:CC:DD:EE:FF",
  "device_model": "Xiaomi Mi Box S",
  "app_version": "1.0.0"
}
```

**Resposta Esperada** (200 OK):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "nome": "Admin",
    "email": "admin@maxxcontrol.com",
    "plano": "premium",
    "status": "ativo"
  },
  "config": {
    "server_url": "https://...",
    "api_base_url": "https://...",
    "iptv_url": "http://...",
    "iptv_user": "user123",
    "iptv_pass": "pass456"
  }
}
```

---

### Teste 2: Login com Credenciais Inválidas

**Endpoint**: `POST https://maxxcontrol-x-sistema.onrender.com/api/auth/login`

**Body**:
```json
{
  "email": "admin@maxxcontrol.com",
  "password": "senha_errada",
  "device_id": "AA:BB:CC:DD:EE:FF",
  "device_model": "Xiaomi Mi Box S",
  "app_version": "1.0.0"
}
```

**Resposta Esperada** (401 Unauthorized):
```json
{
  "error": "Credenciais inválidas"
}
```

---

### Teste 3: Validar Token

**Endpoint**: `GET https://maxxcontrol-x-sistema.onrender.com/api/auth/validate-token`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Accept: application/json
```

**Resposta Esperada** (200 OK):
```json
{
  "valid": true,
  "userId": 1
}
```

---

### Teste 4: Logout

**Endpoint**: `DELETE https://maxxcontrol-x-sistema.onrender.com/api/auth/logout`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
Accept: application/json
```

**Resposta Esperada** (200 OK):
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

---

## 📱 Testes de App (Android)

### Teste 1: Login com Credenciais Válidas

**Passos**:
1. Abrir app
2. Ir para tela de login
3. Digitar email: `admin@maxxcontrol.com`
4. Digitar senha: `sua_senha_aqui`
5. Clicar "ENTRAR ▶"

**Resultado Esperado**:
- ✅ Indicador de carregamento aparece
- ✅ Token é armazenado em SharedPreferences
- ✅ App navega para home
- ✅ Canais carregam normalmente

**Verificação**:
```kotlin
// Verificar se token foi armazenado
val token = SessionManager.getToken()
Log.d("Test", "Token: $token")
```

---

### Teste 2: Login com Credenciais Inválidas

**Passos**:
1. Abrir app
2. Ir para tela de login
3. Digitar email: `admin@maxxcontrol.com`
4. Digitar senha: `senha_errada`
5. Clicar "ENTRAR ▶"

**Resultado Esperado**:
- ✅ Indicador de carregamento aparece
- ✅ Mensagem de erro aparece: "Credenciais inválidas"
- ✅ App continua na tela de login
- ✅ Nenhum token é armazenado

---

### Teste 3: Persistência de Token

**Passos**:
1. Fazer login com credenciais válidas
2. Fechar app completamente
3. Abrir app novamente

**Resultado Esperado**:
- ✅ App vai direto para home (sem tela de login)
- ✅ Canais carregam normalmente
- ✅ Token foi recuperado do SharedPreferences

---

### Teste 4: Token Expirado

**Passos**:
1. Fazer login com credenciais válidas
2. Esperar token expirar (ou simular expiração)
3. Tentar usar app

**Resultado Esperado**:
- ✅ App detecta token expirado
- ✅ App navega para tela de login
- ✅ Usuário precisa fazer login novamente

---

### Teste 5: Logout

**Passos**:
1. Estar logado
2. Ir para configurações
3. Clicar "Sair" (quando implementado)
4. Confirmar logout

**Resultado Esperado**:
- ✅ DELETE /api/auth/logout é chamado
- ✅ Token é removido do SharedPreferences
- ✅ App navega para tela de login
- ✅ Usuário precisa fazer login novamente

---

## 🔍 Verificações de Segurança

### Teste 1: Token Não Pode Ser Falsificado

**Passos**:
1. Obter um token válido
2. Modificar um caractere do token
3. Tentar usar o token modificado

**Resultado Esperado**:
- ✅ Backend retorna erro 401 (Unauthorized)
- ✅ App detecta token inválido
- ✅ App navega para tela de login

---

### Teste 2: Senha Não É Armazenada

**Passos**:
1. Fazer login
2. Verificar SharedPreferences

**Resultado Esperado**:
- ✅ Apenas token é armazenado
- ✅ Senha NÃO é armazenada
- ✅ Email do usuário é armazenado (opcional)

---

### Teste 3: Token Não Pode Ser Reutilizado Após Logout

**Passos**:
1. Fazer login
2. Copiar token
3. Fazer logout
4. Tentar usar token antigo

**Resultado Esperado**:
- ✅ Backend retorna erro 401 (Unauthorized)
- ✅ App detecta token inválido
- ✅ App navega para tela de login

---

## 📊 Checklist de Testes

### Testes de API
- [ ] Login com credenciais válidas
- [ ] Login com credenciais inválidas
- [ ] Validar token válido
- [ ] Validar token inválido
- [ ] Logout com token válido
- [ ] Logout com token inválido

### Testes de App
- [ ] Login com credenciais válidas
- [ ] Login com credenciais inválidas
- [ ] Persistência de token
- [ ] Token expirado
- [ ] Logout
- [ ] Navegação após login
- [ ] Navegação após logout

### Testes de Segurança
- [ ] Token não pode ser falsificado
- [ ] Senha não é armazenada
- [ ] Token não pode ser reutilizado após logout
- [ ] Token é transmitido via HTTPS
- [ ] Token expira corretamente

### Testes de Performance
- [ ] Tempo de login < 5 segundos
- [ ] Tempo de logout < 2 segundos
- [ ] Tempo de validação de token < 2 segundos

---

## 🐛 Troubleshooting

### Problema: Login não funciona

**Possíveis Causas**:
1. Backend não está rodando
2. Credenciais estão erradas
3. Banco de dados não está conectado
4. Erro de CORS

**Solução**:
1. Verificar se backend está rodando: `curl https://maxxcontrol-x-sistema.onrender.com/health`
2. Verificar credenciais no banco de dados
3. Verificar logs do backend
4. Verificar CORS no server.js

---

### Problema: Token não é armazenado

**Possíveis Causas**:
1. SessionManager não está funcionando
2. SharedPreferences não tem permissão
3. Erro ao salvar token

**Solução**:
1. Verificar logs do app
2. Verificar permissões no AndroidManifest.xml
3. Verificar implementação de SessionManager

---

### Problema: App não navega para home após login

**Possíveis Causas**:
1. onLoginSuccess não está sendo chamado
2. Erro ao navegar
3. Erro ao carregar config

**Solução**:
1. Verificar logs do app
2. Verificar implementação de LoginViewModel
3. Verificar se config está sendo buscada

---

## 📝 Logs Importantes

### Backend
```
✅ Login bem-sucedido
❌ Credenciais inválidas
❌ Usuário bloqueado
❌ Erro ao conectar no banco
```

### App
```
🔐 Iniciando login JWT para: usuario@email.com
✅ Login JWT bem-sucedido!
❌ Falha no login JWT: Credenciais inválidas
✔ Validando token JWT
✅ Token válido
❌ Token inválido ou expirado
🚪 Iniciando logout
✅ Logout bem-sucedido
```

---

**Data**: 1º de Março de 2026  
**Status**: ✅ Guia de Testes Completo  
**Próximo**: Executar testes

