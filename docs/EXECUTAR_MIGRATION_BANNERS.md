# 🚀 Executar Migration da Tabela Banners

## ⚠️ PROBLEMA ATUAL

A página `/banners` está com tela preta porque a tabela `banners` não existe no banco de dados Supabase.

## ✅ SOLUÇÃO RÁPIDA (2 minutos)

### Passo 1: Acessar o SQL Editor do Supabase

1. Abra este link: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/sql/new
2. Faça login se necessário

### Passo 2: Copiar e Colar o SQL

Copie TODO o código abaixo e cole no SQL Editor:

```sql
-- Criar tabela banners
CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  data JSONB NOT NULL,
  template VARCHAR(50),
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_banners_type ON banners(type);
CREATE INDEX IF NOT EXISTS idx_banners_created_at ON banners(created_at DESC);
```

### Passo 3: Executar

1. Clique no botão **"Run"** (ou pressione Ctrl+Enter)
2. Aguarde a mensagem de sucesso

### Passo 4: Verificar

Execute este SQL para confirmar que a tabela foi criada:

```sql
SELECT * FROM information_schema.tables WHERE table_name = 'banners';
```

Deve retornar 1 linha.

### Passo 5: Testar a Página

1. Acesse: https://maxxcontrol-x-sistema.onrender.com/banners
2. A página deve carregar normalmente agora!

## 🎯 Resultado Esperado

- ✅ Tabela `banners` criada no Supabase
- ✅ Página `/banners` carrega sem tela preta
- ✅ Sem erros no console do navegador
- ✅ API `/api/banners/list` retorna 200 OK

## 📸 Screenshots do Processo

### 1. SQL Editor do Supabase
```
┌─────────────────────────────────────────┐
│  Supabase SQL Editor                    │
├─────────────────────────────────────────┤
│  [Cole o SQL aqui]                      │
│                                         │
│  CREATE TABLE IF NOT EXISTS banners (   │
│    id SERIAL PRIMARY KEY,               │
│    ...                                  │
│  );                                     │
│                                         │
│  [▶ Run]                                │
└─────────────────────────────────────────┘
```

### 2. Resultado Esperado
```
✅ Success
Rows: 0
Time: 45ms
```

## ❌ Se der erro

### Erro: "permission denied"
**Solução**: Use a Service Role Key no lugar da Anon Key

### Erro: "relation already exists"
**Solução**: A tabela já existe! Pode testar a página diretamente.

### Erro: "syntax error"
**Solução**: Certifique-se de copiar TODO o SQL, incluindo os ponto-e-vírgulas.

## 🔍 Verificar se Funcionou

Depois de executar a migration, teste:

1. **API de listagem**:
   ```
   GET https://maxxcontrol-x-sistema.onrender.com/api/banners/list
   ```
   Deve retornar: `{"success": true, "data": []}`

2. **Página web**:
   ```
   https://maxxcontrol-x-sistema.onrender.com/banners
   ```
   Deve carregar normalmente (sem tela preta)

3. **Console do navegador** (F12):
   Não deve ter erros de "relation does not exist"

## 📝 Informações Técnicas

### Estrutura da Tabela

| Coluna       | Tipo          | Descrição                    |
|--------------|---------------|------------------------------|
| id           | SERIAL        | ID único (auto-incremento)   |
| type         | VARCHAR(50)   | Tipo do banner               |
| title        | VARCHAR(255)  | Título do conteúdo           |
| data         | JSONB         | Dados do conteúdo (JSON)     |
| template     | VARCHAR(50)   | Template usado               |
| image_url    | VARCHAR(500)  | URL da imagem gerada         |
| created_at   | TIMESTAMP     | Data de criação              |
| updated_at   | TIMESTAMP     | Data de atualização          |

### Índices Criados

- `idx_banners_type`: Índice na coluna `type` para buscas rápidas
- `idx_banners_created_at`: Índice na coluna `created_at` para ordenação

## 🎉 Pronto!

Após executar a migration, a página `/banners` deve funcionar perfeitamente!

Se ainda houver problemas, verifique:
1. Logs do servidor no Render.com
2. Console do navegador (F12)
3. Se a migration foi executada com sucesso no Supabase
