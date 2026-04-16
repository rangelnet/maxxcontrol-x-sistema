# 🔧 Correção do Erro na Página de Banners

## ❌ Problema Identificado

Quando você acessava a página de banners no painel, ocorria um erro porque:

1. **Rota não registrada**: A rota `/api/banners` não estava registrada no `server.js`
2. **Tabela não criada**: A tabela `banners` pode não existir no banco de dados

## ✅ Solução Implementada

### 1. Rota de Banners Adicionada

**Arquivo**: `MaxxControl/server.js`

```javascript
app.use('/api/banners', require('./modules/banners/bannerRoutes'));
```

A rota foi adicionada entre `content` e `branding` para manter a organização.

### 2. Migration Criada

**Arquivo**: `MaxxControl/maxxcontrol-x-sistema/database/migrations/create_banners_table.sql`

Esta migration cria a tabela `banners` com todos os campos necessários:

- `id` - Identificador único
- `type` - Tipo do banner (movie, series, football, etc)
- `title` - Título do banner
- `data` - Dados do banner em formato JSON
- `template` - Template usado
- `image_url` - URL da imagem gerada
- `created_at` - Data de criação
- `updated_at` - Data de atualização

## 🚀 Como Aplicar a Correção

### Passo 1: Executar a Migration no Supabase

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Copie e execute o conteúdo de `create_banners_table.sql`

### Passo 2: Reiniciar o Servidor

Se estiver rodando localmente:
```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm start
```

Se estiver no Render:
- O deploy automático vai reiniciar o servidor
- Ou faça um redeploy manual

### Passo 3: Testar a Página de Banners

1. Acesse o painel: `https://maxxcontrol-x-sistema.onrender.com`
2. Faça login
3. Clique em **Banners** no menu lateral
4. A página deve carregar sem erros

## 📋 Endpoints Disponíveis

Agora os seguintes endpoints estão funcionando:

- `GET /api/banners/list` - Listar todos os banners
- `GET /api/banners/:id` - Buscar banner específico
- `POST /api/banners/create` - Criar novo banner
- `PUT /api/banners/:id` - Atualizar banner
- `DELETE /api/banners/:id` - Deletar banner
- `POST /api/banners/generate` - Gerar imagem do banner

## 🎨 Funcionalidades da Página de Banners

A página permite:

1. **Criar banners personalizados** para filmes, séries e eventos
2. **Visualizar preview** do banner antes de salvar
3. **Escolher tamanhos** (1920x1080, 1280x720, etc)
4. **Selecionar conteúdo** da biblioteca TMDB
5. **Gerar imagens** automaticamente (frontend)

## 🔍 Verificação

Para verificar se está tudo funcionando:

```bash
# Testar endpoint de listagem
curl https://maxxcontrol-x-sistema.onrender.com/api/banners/list

# Deve retornar:
# {"banners": []}
```

## 📝 Observações

- A geração de imagens é feita no **frontend** usando Canvas API
- O backend armazena apenas os **dados e configurações** do banner
- A biblioteca `canvas` do Node.js foi comentada porque requer dependências nativas

## ✨ Status

- ✅ Rota registrada no server.js
- ✅ Migration criada
- ✅ Controller funcionando
- ✅ Frontend pronto
- ⏳ Aguardando execução da migration no banco

## 🎯 Próximos Passos

1. Execute a migration no Supabase
2. Reinicie o servidor
3. Teste a página de banners
4. Crie seu primeiro banner!
