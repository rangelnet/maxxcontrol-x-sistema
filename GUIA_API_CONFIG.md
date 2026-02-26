# 🔧 Guia de Configuração de APIs - MaxxControl X

## 📋 Visão Geral

O MaxxControl X agora possui um sistema completo para gerenciar e monitorar APIs do seu projeto TV-MAXX!

## ✨ Funcionalidades

### 1. Configurar APIs
- ✅ Adicionar novas APIs para monitorar
- ✅ Editar APIs existentes
- ✅ Ativar/Desativar monitoramento
- ✅ Deletar APIs
- ✅ Organizar por categorias
- ✅ Marcar APIs críticas

### 2. Monitorar APIs
- ✅ Status online/offline em tempo real
- ✅ Medição de latência
- ✅ Alertas para APIs críticas offline
- ✅ Auto-refresh automático
- ✅ Histórico de status

## 🎯 Como Usar

### Acessar o Painel

1. Acesse: `http://localhost:5174`
2. Login: `admin@maxxcontrol.com` / `Admin@123`
3. Menu lateral: **"Configurar APIs"**

### Adicionar Nova API

1. Clique em **"Nova API"**
2. Preencha os campos:

**Campos Obrigatórios:**
- **Nome da API**: Nome descritivo (ex: "Auth API")
- **URL**: Endereço completo da API (ex: "https://api.exemplo.com/")

**Campos Opcionais:**
- **Descrição**: Para que serve esta API
- **Categoria**: Grupo (autenticacao, conteudo, esportes, etc)
- **Método HTTP**: GET, POST, PUT, DELETE, PATCH
- **Timeout**: Tempo máximo de espera (padrão: 5000ms)
- **Headers**: JSON com headers personalizados
- **API Crítica**: Marcar se é essencial para o sistema
- **Ativa**: Se deve ser monitorada

3. Clique em **"Criar"**

### Editar API

1. Clique no ícone de **lápis** (Edit) na API desejada
2. Modifique os campos necessários
3. Clique em **"Atualizar"**

### Ativar/Desativar Monitoramento

- Clique no badge **"Ativa"** ou **"Inativa"** para alternar
- APIs inativas não serão monitoradas

### Deletar API

1. Clique no ícone de **lixeira** (Trash)
2. Confirme a exclusão

## 📊 Categorias Sugeridas

- `autenticacao` - APIs de login e auth
- `conteudo` - APIs de filmes, séries, etc
- `esportes` - APIs de dados esportivos
- `clima` - APIs de previsão do tempo
- `painel` - APIs do painel de controle
- `cache` - APIs de cache e CDN
- `suporte` - APIs de chatbot e suporte

## 🔍 Monitorar APIs

1. Menu lateral: **"Monitor de APIs"**
2. Veja o status de todas as APIs configuradas
3. Auto-refresh a cada 30 segundos
4. Clique em **"Atualizar Agora"** para refresh manual

## 📈 Informações Exibidas

### Dashboard do Monitor
- Total de APIs
- APIs Online
- APIs Offline
- APIs Críticas Offline
- Latência Média

### Por API
- Nome e descrição
- URL completa
- Status (online/offline)
- Código HTTP (200, 404, 500, etc)
- Latência em ms
- Categoria
- Se é crítica
- Método HTTP usado

## 🚨 Alertas

Quando uma API crítica está offline, um alerta vermelho aparece no topo do monitor.

## 💡 Exemplos de Configuração

### API de Autenticação
```
Nome: Auth API
Descrição: API de autenticação principal
URL: https://auth.novomundo.live/v1/
Categoria: autenticacao
Método: GET
Crítica: ✓
Ativa: ✓
```

### API com Headers Personalizados
```
Nome: TMDB API
URL: https://api.themoviedb.org/3/
Headers:
{
  "Authorization": "Bearer seu_token_aqui",
  "Content-Type": "application/json"
}
```

### API com Timeout Maior
```
Nome: API Lenta
URL: https://api-lenta.com/
Timeout: 15000
(15 segundos para APIs mais lentas)
```

## 🗄️ Banco de Dados

As APIs são salvas no Supabase (PostgreSQL) nas tabelas:
- `api_configs` - Configuração das APIs
- `api_status_history` - Histórico de verificações

## 🔄 APIs Padrão Incluídas

O sistema já vem com 8 APIs do TV-MAXX pré-configuradas:
1. Auth API (Crítica)
2. Painel API (Crítica)
3. Cache API (Crítica)
4. TMDB API
5. SportsData MMA
6. SportsData Soccer
7. Meteoblue
8. Chatbot API

## 🎨 Dicas

- Use categorias consistentes para organizar melhor
- Marque apenas APIs realmente essenciais como "Críticas"
- Ajuste o timeout conforme a velocidade esperada da API
- Desative APIs temporariamente em vez de deletar
- Use descrições claras para facilitar manutenção

## 🔧 Troubleshooting

**API sempre aparece offline:**
- Verifique se a URL está correta
- Teste a URL no navegador
- Verifique se precisa de headers de autenticação
- Aumente o timeout se a API for lenta

**Erro ao salvar:**
- Verifique se o JSON dos headers está válido
- Certifique-se de que a URL começa com http:// ou https://

---

**Pronto!** Agora você tem controle total sobre todas as APIs do seu sistema! 🚀👑
