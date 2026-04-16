# Servidor IPTV no Painel

## ✅ Implementação Completa

A página de Servidor IPTV foi adicionada ao painel MaxxControl X com sucesso!

### Arquivos Criados

1. **Frontend**: `web/src/pages/IptvServer.jsx`
   - Formulário para configurar URL, usuário e senha Xtream
   - Botão "Testar Conexão" para validar credenciais
   - Preview em tempo real
   - Mensagens de sucesso/erro

2. **Backend**: `modules/iptv-server/`
   - `iptvServerController.js` - Controller com 3 endpoints:
     - GET `/api/iptv-server/config` - Buscar configuração
     - POST `/api/iptv-server/config` - Salvar configuração
     - POST `/api/iptv-server/test` - Testar conexão
   - `iptvServerRoutes.js` - Rotas da API

3. **Banco de Dados**: `database/schema.sql`
   - Tabela `iptv_server_config` com campos:
     - `xtream_url` - URL do servidor
     - `xtream_username` - Usuário
     - `xtream_password` - Senha
     - `updated_at` - Data da última atualização

4. **Integração**:
   - Rota `/iptv-server` adicionada no `App.jsx`
   - Menu "Servidor IPTV" com ícone Server no `Layout.jsx`
   - Rota `/api/iptv-server` registrada no `server.js`

### Como Usar

1. Acesse o painel: https://maxxcontrol-frontend.onrender.com/
2. Faça login
3. Clique em "Servidor IPTV" no menu lateral
4. Preencha os campos:
   - URL do Servidor (ex: http://exemplo.com:8080)
   - Usuário
   - Senha
5. Clique em "Testar Conexão" para validar
6. Clique em "Salvar" para armazenar

### Status do Deploy

✅ Commit feito: `7845a1c`
✅ Push para GitHub realizado
⏳ Aguardando rebuild do Render (automático)

### Próximos Passos

Após o Render fazer o rebuild (leva alguns minutos):
1. A página estará disponível em: https://maxxcontrol-frontend.onrender.com/iptv-server
2. Você poderá configurar o servidor IPTV pelo painel
3. O app Android buscará essas credenciais automaticamente

### Integração com o App

O app já está preparado para buscar as credenciais do painel:
- `BrandingManager.kt` tem a função `initializeXtream()`
- Falta apenas descomentar a chamada da API
- Ver documentação em: `TV-MAXX-PRO-Android/SERVIDOR_IPTV_DINAMICO.md`
