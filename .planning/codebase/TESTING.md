# 🧪 TESTING.md — Testes e Qualidade MaxxControl

> Mapeado em: 2026-05-05

---

## 1. Estado Atual dos Testes

### ⚠️ NENHUM FRAMEWORK DE TESTES CONFIGURADO

O projeto **não possui** testes automatizados. Não há:
- Nenhum test runner (Jest, Mocha, Vitest, etc.)
- Nenhum arquivo `*.test.js` ou `*.spec.js`
- Nenhum script `test` no `package.json`
- Nenhuma configuração de CI/CD com testes

---

## 2. Testes Manuais Existentes

### Arquivos de Teste Ad-Hoc
| Arquivo | Propósito |
|:--------|:----------|
| `test-db.js` | Verifica conexão com o banco de dados |
| `test_relay.js` | Testa o sistema de relay do plugin Chrome |
| `test_sports.js` | Testa a integração com API de esportes |

Estes são scripts standalone rodados manualmente (`node test-db.js`), não testes automatizados.

### Health Check
- **Endpoint:** `GET /health`
- **Valida:** Conexão com banco de dados + status do serviço
- **Usado por:** Render.com como health check de deploy

### Debug Endpoint
- **Endpoint:** `GET /api/debug/dist`
- **Valida:** Build do frontend (qual index.html e assets estão no disco)

---

## 3. Validação de Dados

### Backend
- **Zod** (`^3.22.4`) — Disponível mas uso não verificado amplamente
- **Validação inline** — Maioria dos handlers faz validação manual
- **SQL constraints** — `UNIQUE`, `NOT NULL`, `REFERENCES`, `CHECK`

### Frontend
- **Validação manual** em formulários (verificação de campos antes de submit)
- **Sem biblioteca de forms** (sem Formik, React Hook Form, etc.)

---

## 4. Estratégia de Migrações como "Testes"

O `server.js` roda migrações automaticamente no startup com tratamento idempotente:
```javascript
const IGNORE_CODES = ['42P07', '42701', '42P11', '42710'];
// CREATE TABLE IF NOT EXISTS...
// ALTER TABLE ADD COLUMN IF NOT EXISTS...
```

Isso funciona como um "teste de schema" — se o banco não tem as tabelas/colunas esperadas, elas são criadas automaticamente.

---

## 5. Monitoramento (Substituto de Testes)

### Sentinela Maxx
- Background health monitoring
- Endpoint: `/api/sentinela/status`

### API Monitor
- Módulo `modules/api-monitor/`
- Monitora uptime e latência de APIs externas

### Logging Extensivo
- Console logs com emojis para cada operação
- Debug logs de migrações
- WhatsApp debug log (`whatsapp_debug.log` — 4MB+)

---

## 6. Recomendações para Implementação

### Prioridade Alta
1. **Vitest** para testes unitários do frontend (já usa Vite)
2. **Supertest** para testes de API endpoints
3. Script `npm test` no `package.json`

### Prioridade Média
4. Testes de integração para fluxos críticos (DNS Bridge, Plugin Relay)
5. Testes de migrações SQL
6. Validação com Zod em todos os endpoints

### Prioridade Baixa
7. CI/CD pipeline com GitHub Actions
8. Cobertura de código
9. E2E com Playwright/Cypress
