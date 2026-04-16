# Diagnóstico: Tela Preta em /banners

## Problema Identificado

Quando o usuário acessa `https://maxxcontrol-x-sistema.onrender.com/banners`, a tela fica preta devido a dois erros críticos:

### 1. Erro de API (500 Internal Server Error)
- **Endpoint**: `GET /api/banners/list`
- **Causa**: A tabela `banners` não existe no banco de dados
- **Impacto**: O frontend não consegue carregar a lista de banners

### 2. Erro de JavaScript (TypeError)
- **Erro**: `TypeError: C.toFixed is not a function`
- **Causa**: O campo `nota` (rating) está `null` ou `undefined` em alguns conteúdos
- **Localizações**: Múltiplas chamadas de `.toFixed()` sem verificação de null

## Correções Aplicadas

### ✅ Frontend - BannerGenerator.jsx

Corrigidos TODOS os 5 locais com chamadas `.toFixed()`:

1. **Linha ~661-670** (Seção de conteúdos recentes) - ✅ CORRIGIDO
2. **Linha ~719-729** (Seção de todos os conteúdos) - ✅ CORRIGIDO  
3. **Linha ~742** (Cabeçalho do modal) - ✅ CORRIGIDO
4. **Linha ~950** (Lista de conteúdos no modal) - ✅ CORRIGIDO
5. **Linha ~1001** (Lista filtrada de conteúdos) - ✅ CORRIGIDO

**Padrão de correção aplicado:**
```javascript
// ANTES (causava erro)
{content.nota?.toFixed(1)}

// DEPOIS (seguro)
{content.nota ? content.nota.toFixed(1) : 'N/A'}
```

### ✅ Backend - Tabela Banners

**Problema**: A tabela `banners` não existe no banco de dados, causando erro 500 no endpoint `/api/banners/list`

**Solução**: 
1. Migration já existe em: `database/migrations/create_banners_table.sql`
2. Criado script de execução: `database/migrations/run-banners-migration.js`

**Para executar a migration:**
```bash
cd maxxcontrol-x-sistema
node database/migrations/run-banners-migration.js
```

## Estrutura da Tabela Banners

```sql
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
```

## Próximos Passos

1. ✅ Correções de frontend aplicadas
2. ⏳ Executar migration no servidor de produção (Render.com)
3. ⏳ Testar a página /banners após as correções

## Como Testar

1. Fazer deploy das correções do frontend
2. Executar a migration no servidor:
   ```bash
   node database/migrations/run-banners-migration.js
   ```
3. Acessar: `https://maxxcontrol-x-sistema.onrender.com/banners`
4. Verificar se a página carrega sem erros
5. Verificar console do navegador (F12) para confirmar ausência de erros

## Arquivos Modificados

- ✅ `web/src/pages/BannerGenerator.jsx` - Corrigidos 5 locais com `.toFixed()`
- ✅ `database/migrations/run-banners-migration.js` - Criado script de migration

## Status

- **Frontend**: ✅ CORRIGIDO (todos os erros de `.toFixed()` resolvidos)
- **Backend**: ⏳ PENDENTE (aguardando execução da migration no servidor)
- **Teste**: ⏳ PENDENTE (aguardando deploy e migration)
