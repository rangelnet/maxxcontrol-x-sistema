# ✅ Checklist de Implementação: Conexão Painel ↔ App

## 📋 Fase 1: Análise e Planejamento

### Análise
- [x] Analisar MESH TV (AndroidManifest.xml)
- [x] Identificar fluxos de comunicação
- [x] Documentar endpoints
- [x] Comparar com TV-MAXX-PRO
- [x] Criar diagramas

### Documentação
- [x] Criar análise completa
- [x] Criar guia prático
- [x] Criar diagramas visuais
- [x] Criar índice
- [x] Criar sumário executivo

### Decisão
- [ ] Ler documentação completa
- [ ] Decidir opção (1, 2 ou 3)
- [ ] Documentar decisão
- [ ] Preparar plano de implementação

---

## 📋 Fase 2: Implementação (Opção 1 - Manter Atual)

### Status: ✅ JÁ IMPLEMENTADA

- [x] Backend retorna config em `/api/app-config/config`
- [x] Backend retorna branding em `/api/branding/active`
- [x] Backend retorna credenciais em `/api/iptv-server/config`
- [x] App busca config ao iniciar
- [x] App armazena credenciais localmente
- [x] App usa credenciais para carregar canais
- [x] Dashboard MESH TV implementado

### Validação
- [ ] Compilar APK
- [ ] Testar em TV Box
- [ ] Verificar se config é buscada
- [ ] Verificar se canais carregam
- [ ] Verificar se reproduz

---

## 📋 Fase 3: Implementação (Opção 2 - Login)

### Status: ⏳ PENDENTE

#### Backend

- [ ] Criar endpoint POST `/auth/login`
  - [ ] Validar credenciais
  - [ ] Gerar JWT token
  - [ ] Retornar token + user + config
  - [ ] Testar com Postman

- [ ] Criar endpoint DELETE `/auth/logout`
  - [ ] Invalidar token
  - [ ] Retornar sucesso
  - [ ] Testar com Postman

- [ ] Criar endpoint GET `/auth/validate`
  - [ ] Validar token
  - [ ] Retornar user + expires_in
  - [ ] Testar com Postman

- [ ] Criar middleware de autenticação
  - [ ] Validar header Authorization
  - [ ] Extrair token
  - [ ] Validar assinatura JWT
  - [ ] Verificar expiração
  - [ ] Testar com Postman

#### App Android

- [ ] Criar LoginScreen.kt
  - [ ] Layout com campos de entrada
  - [ ] Validação de campos
  - [ ] Chamada à API
  - [ ] Tratamento de erros
  - [ ] Indicador de carregamento

- [ ] Criar AuthViewModel.kt
  - [ ] Função login()
  - [ ] Função logout()
  - [ ] Função validateToken()
  - [ ] StateFlow para estado
  - [ ] Tratamento de erros

- [ ] Criar AuthRepository.kt
  - [ ] Função login()
  - [ ] Função logout()
  - [ ] Função validateToken()
  - [ ] Chamadas à API
  - [ ] Tratamento de erros

- [ ] Atualizar ApiService.kt
  - [ ] Adicionar endpoint POST /auth/login
  - [ ] Adicionar endpoint DELETE /auth/logout
  - [ ] Adicionar endpoint GET /auth/validate
  - [ ] Adicionar header Authorization

- [ ] Criar SharedPreferencesManager.kt
  - [ ] Função saveToken()
  - [ ] Função getToken()
  - [ ] Função clearToken()
  - [ ] Função saveUser()
  - [ ] Função getUser()
  - [ ] Função clearUser()

- [ ] Atualizar MainActivity.kt
  - [ ] Verificar se token existe
  - [ ] Validar token com backend
  - [ ] Navegar para login ou home
  - [ ] Tratamento de erros

#### Testes

- [ ] Teste 1: Login com credenciais válidas
  - [ ] Digitar credenciais
  - [ ] Clicar "Entrar"
  - [ ] Verificar se token foi armazenado
  - [ ] Verificar se foi para home

- [ ] Teste 2: Login com credenciais inválidas
  - [ ] Digitar credenciais erradas
  - [ ] Clicar "Entrar"
  - [ ] Verificar se mostra erro
  - [ ] Verificar se continua na tela de login

- [ ] Teste 3: Logout
  - [ ] Estar logado
  - [ ] Ir para configurações
  - [ ] Clicar "Sair"
  - [ ] Verificar se token foi removido
  - [ ] Verificar se foi para login

- [ ] Teste 4: Token expirado
  - [ ] Fazer login
  - [ ] Esperar token expirar
  - [ ] Tentar usar app
  - [ ] Verificar se vai para login

- [ ] Teste 5: Validação de token ao iniciar
  - [ ] Fazer login
  - [ ] Fechar app
  - [ ] Abrir app novamente
  - [ ] Verificar se foi direto para home

---

## 📋 Fase 4: Implementação (Opção 3 - Híbrida)

### Status: ⏳ PENDENTE

#### Backend

- [ ] Implementar tudo de Opção 2
- [ ] Manter endpoints de Opção 1

#### App Android

- [ ] Implementar tudo de Opção 2
- [ ] Criar SplashScreen.kt
  - [ ] Verificar se JWT token existe
  - [ ] Validar JWT com backend
  - [ ] Se válido → Ir para home
  - [ ] Se inválido → Ir para login
  - [ ] Se não existe → Oferecer opções

- [ ] Criar AuthOptionsScreen.kt
  - [ ] Botão "Entrar com Credenciais"
  - [ ] Botão "Usar Token Fixo"
  - [ ] Navegar para tela apropriada

- [ ] Atualizar MainActivity.kt
  - [ ] Mostrar SplashScreen
  - [ ] Oferecer opções de autenticação
  - [ ] Suportar ambos os fluxos

#### Testes

- [ ] Teste 1: Fluxo com JWT
  - [ ] Fazer login
  - [ ] Verificar se foi para home
  - [ ] Fechar app
  - [ ] Abrir app
  - [ ] Verificar se foi direto para home

- [ ] Teste 2: Fluxo com Token Fixo
  - [ ] Clicar "Usar Token Fixo"
  - [ ] Verificar se foi para home
  - [ ] Fechar app
  - [ ] Abrir app
  - [ ] Verificar se foi direto para home

- [ ] Teste 3: Transição entre fluxos
  - [ ] Fazer login com JWT
  - [ ] Fazer logout
  - [ ] Clicar "Usar Token Fixo"
  - [ ] Verificar se funciona

---

## 📋 Fase 5: Testes Integrados

### Testes de API

- [ ] Teste 1: POST /auth/login
  - [ ] Credenciais válidas → Retorna token
  - [ ] Credenciais inválidas → Retorna erro
  - [ ] Campos vazios → Retorna erro

- [ ] Teste 2: DELETE /auth/logout
  - [ ] Token válido → Retorna sucesso
  - [ ] Token inválido → Retorna erro
  - [ ] Sem token → Retorna erro

- [ ] Teste 3: GET /auth/validate
  - [ ] Token válido → Retorna user
  - [ ] Token inválido → Retorna erro
  - [ ] Token expirado → Retorna erro

- [ ] Teste 4: GET /api/channels
  - [ ] Com token válido → Retorna canais
  - [ ] Com token inválido → Retorna erro
  - [ ] Sem token → Retorna erro

### Testes de App

- [ ] Teste 1: Fluxo completo de login
  - [ ] Abrir app
  - [ ] Fazer login
  - [ ] Verificar se canais carregam
  - [ ] Selecionar canal
  - [ ] Verificar se reproduz

- [ ] Teste 2: Fluxo completo de logout
  - [ ] Estar logado
  - [ ] Fazer logout
  - [ ] Verificar se foi para login
  - [ ] Fazer login novamente

- [ ] Teste 3: Persistência de token
  - [ ] Fazer login
  - [ ] Fechar app
  - [ ] Abrir app
  - [ ] Verificar se foi direto para home

- [ ] Teste 4: Expiração de token
  - [ ] Fazer login
  - [ ] Esperar token expirar
  - [ ] Tentar usar app
  - [ ] Verificar se vai para login

### Testes de Segurança

- [ ] Teste 1: Token não pode ser falsificado
  - [ ] Tentar usar token falso
  - [ ] Verificar se retorna erro

- [ ] Teste 2: Token não pode ser reutilizado após logout
  - [ ] Fazer login
  - [ ] Fazer logout
  - [ ] Tentar usar token antigo
  - [ ] Verificar se retorna erro

- [ ] Teste 3: Credenciais não são armazenadas
  - [ ] Fazer login
  - [ ] Verificar SharedPreferences
  - [ ] Confirmar que senha não está lá

---

## 📋 Fase 6: Validação e Deploy

### Validação

- [ ] Compilar APK sem erros
- [ ] Testar em múltiplos TV Boxes
- [ ] Testar em múltiplas resoluções
- [ ] Testar com múltiplas velocidades de internet
- [ ] Testar com internet lenta
- [ ] Testar com internet offline

### Performance

- [ ] Medir tempo de login
- [ ] Medir tempo de carregamento de canais
- [ ] Medir tempo de reprodução
- [ ] Otimizar se necessário

### Segurança

- [ ] Validar que token é transmitido via HTTPS
- [ ] Validar que senha não é armazenada
- [ ] Validar que token expira
- [ ] Validar que token não pode ser falsificado

### Deploy

- [ ] Fazer backup do código atual
- [ ] Fazer commit no Git
- [ ] Criar tag de versão
- [ ] Gerar APK de produção
- [ ] Testar APK de produção
- [ ] Fazer deploy

---

## 📋 Fase 7: Documentação

### Documentação de Código

- [ ] Adicionar comentários no código
- [ ] Adicionar docstrings nas funções
- [ ] Adicionar exemplos de uso
- [ ] Adicionar tratamento de erros

### Documentação de Usuário

- [ ] Criar guia de uso
- [ ] Criar FAQ
- [ ] Criar troubleshooting
- [ ] Criar vídeo tutorial

### Documentação de Desenvolvedor

- [ ] Criar guia de arquitetura
- [ ] Criar guia de contribuição
- [ ] Criar guia de testes
- [ ] Criar guia de deploy

---

## 📋 Fase 8: Monitoramento

### Logs

- [ ] Implementar logging de login
- [ ] Implementar logging de logout
- [ ] Implementar logging de erros
- [ ] Implementar logging de performance

### Métricas

- [ ] Contar logins por dia
- [ ] Contar logouts por dia
- [ ] Contar erros por dia
- [ ] Medir tempo médio de login
- [ ] Medir tempo médio de carregamento de canais

### Alertas

- [ ] Alerta se muitos erros de login
- [ ] Alerta se muitos tokens expirados
- [ ] Alerta se performance degradada
- [ ] Alerta se app crasheia

---

## 📊 Resumo de Status

| Fase | Opção 1 | Opção 2 | Opção 3 |
|------|---------|---------|---------|
| Análise | ✅ | ✅ | ✅ |
| Planejamento | ✅ | ✅ | ✅ |
| Implementação | ✅ | ⏳ | ⏳ |
| Testes | ⏳ | ⏳ | ⏳ |
| Validação | ⏳ | ⏳ | ⏳ |
| Deploy | ⏳ | ⏳ | ⏳ |
| Documentação | ⏳ | ⏳ | ⏳ |
| Monitoramento | ⏳ | ⏳ | ⏳ |

---

## 🚀 Próximos Passos

1. **Hoje**: Revisar este checklist
2. **Amanhã**: Decidir opção
3. **Esta Semana**: Começar implementação
4. **Próximas Semanas**: Completar implementação
5. **Próximos Meses**: Deploy e monitoramento

---

**Data**: 1º de Março de 2026  
**Status**: ✅ Checklist Completo  
**Próximo**: Escolher opção e começar implementação

