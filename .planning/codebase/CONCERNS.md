# ⚠️ CONCERNS.md — Preocupações Técnicas MaxxControl

> Mapeado em: 2026-05-05

---

## 1. Dívida Técnica Crítica

### 🔴 `server.js` Monolítico (944 linhas)
- **Problema:** Migrações SQL (~700 linhas), configuração e rotas, tudo no mesmo arquivo
- **Impacto:** Difícil de manter, revisar e testar
- **Recomendação:** Extrair migrações para `database/migrations/`, setup para `config/setup.js`

### 🔴 Sem Testes Automatizados
- **Problema:** Zero testes (ver TESTING.md)
- **Impacto:** Regressões não detectadas, deploy arriscado
- **Recomendação:** Vitest + Supertest como mínimo

### 🔴 Páginas React Gigantes
- **Problema:** Vários componentes com 50-120KB:
  - `Devices.jsx` — 121KB
  - `WhatsAppAuto.jsx` — 97KB
  - `Landing.jsx` — 95KB
  - `BannerGenerator.jsx` — 88KB
  - `Resale.jsx` — 77KB
  - `FinancePlans.jsx` — 77KB
- **Impacto:** Manutenção difícil, bundle size alto, re-renders desnecessários
- **Recomendação:** Quebrar em sub-componentes modulares

---

## 2. Segurança

### 🔴 Secrets no `.env` Exposto
- **Problema:** Arquivo `.env` contém API keys, JWT secret, database password em texto
- **Evidência:** TMDB, Supabase, Google, API-Football keys visíveis
- **Impacto:** Se commitado, todas as credenciais ficam expostas
- **Status:** `.gitignore` inclui `.env` ✅, mas `.env.example` não deve conter valores reais

### 🟡 CORS Aberto (`cors()`)
- **Problema:** CORS configurado sem restrição de origin (`cors()` sem parâmetros)
- **Impacto:** Qualquer domínio pode fazer requisições à API
- **Recomendação:** Whitelist de origins em produção

### 🟡 SSL sem Verificação
- **Problema:** PostgreSQL com `rejectUnauthorized: false`
- **Impacto:** Vulnerável a MITM (man-in-the-middle)
- **Mitigação:** Aceitável para Supabase managed, mas não ideal

### 🟡 Chrome Plugin com Permissões Universais
- **Problema:** `host_permissions: ["*://*/*"]` — acesso a todos os sites
- **Impacto:** Superfície de ataque ampla se o plugin for comprometido
- **Mitigação:** É necessário para funcionar em qualquer painel IPTV

### 🟡 JWT Secret Fraco em Dev
- **Problema:** `JWT_SECRET=maxxcontrol_x_super_secret_key_2024_change_in_production`
- **Impacto:** Deve ser trocado em produção (nome sugere isso)

---

## 3. Performance

### 🟡 Migrações no Startup
- **Problema:** `runPendingMigrations()` roda ~50+ queries SQL a cada restart do servidor
- **Impacto:** Startup lento, desnecessário em produção após primeira execução
- **Recomendação:** Flag para pular migrações ou usar framework dedicado (Knex, Prisma)

### 🟡 Cache Apenas em Memória
- **Problema:** Sports e TMDB usam cache `const cache = {}` (in-process)
- **Impacto:** Cache perdido a cada restart, sem compartilhamento entre instâncias
- **Recomendação:** Redis ou SQLite cache para dados frequentes

### 🟡 WhatsApp Debug Log (4MB+)
- **Problema:** `whatsapp_debug.log` com 4.1MB e crescendo
- **Impacto:** Consumo de disco, sem rotação de logs
- **Recomendação:** Implementar log rotation ou usar serviço externo

### 🟡 Rate Limit Alto para IPTV Tree
- **Problema:** 5000 req/15min em `/api/iptv-tree/`
- **Impacto:** Pode sobrecarregar com muitos clientes simultâneos
- **Mitigação:** Necessário para "Expandir Tudo" com muitas categorias

---

## 4. Arquitetura

### 🟡 Sem ORM
- **Problema:** SQL raw em todos os módulos
- **Impacto:** Queries duplicadas, sem type safety, propenso a erros
- **Trade-off:** Mais controle e performance vs. manutenção

### 🟡 Dual Database sem Abstração Completa
- **Problema:** PostgreSQL e SQLite tem sintaxes diferentes (ex: `gen_random_uuid()`, `SERIAL`)
- **Impacto:** Algumas migrações podem falhar no SQLite
- **Mitigação:** SQLite é usado apenas em dev local

### 🟡 Sem Estado Global no Frontend
- **Problema:** Context API para auth e WhatsApp, mas sem gestão de estado para dados
- **Impacto:** Prop drilling extensivo, re-fetches redundantes
- **Recomendação:** Zustand ou React Query para estado de servidor

### 🟡 Módulos IPTV Fragmentados
- **Problema:** 6 módulos separados para IPTV:
  - `iptv-server/`, `iptv-servers/`, `iptv-credentials/`
  - `iptv-monitoring/`, `iptv-tree/`, `playlist-manager/`
- **Impacto:** Lógica espalhada, sobreposição de responsabilidades
- **Recomendação:** Consolidar em 2-3 módulos coesos

---

## 5. Build & Deploy

### 🟡 Render Free Tier
- **Problema:** Plano gratuito do Render tem limitações (sleep após inatividade, resources limitados)
- **Impacto:** Primeira requisição após sleep é lenta (~30s cold start)
- **Recomendação:** Upgrade para plano pago para produção real

### 🟡 Build sem Cache Efetivo
- **Problema:** Build command faz `rm -rf web/dist` + reinstala deps a cada deploy
- **Impacto:** Builds lentos (~3-5min)
- **Recomendação:** Usar cache de node_modules do Render

### 🟡 Arquivo `.bak` no Repositório
- **Problema:** `BannerGenerator.jsx.bak` (82KB) no diretório de páginas
- **Impacto:** Poluição do repositório
- **Recomendação:** Remover e adicionar `*.bak` ao `.gitignore`

---

## 6. Áreas Frágeis

### `remote-index.js` (464KB)
- **Problema:** Arquivo de ~464KB na raiz do projeto, propósito não claro
- **Impacto:** Possível bundle/build artifact abandonado
- **Recomendação:** Verificar se é necessário ou remover

### Migrações Duplicadas
- **Problema:** `banner_templates` é criada duas vezes no `server.js` (linhas ~57 e ~414)
- **Impacto:** Redundância, confusão sobre qual é a "fonte verdadeira"
- **Recomendação:** Consolidar migrações

### Scripts Python Scratch
- **Problema:** `scratch_inject_elite.py`, `scratch_patch_banner.py`, `scratch_repair_banner.py`
- **Impacto:** Scripts de manutenção ad-hoc sem documentação
- **Recomendação:** Mover para `scripts/` ou `scratch/` com README

---

## 7. Resumo de Riscos

| Severidade | Qtd | Tipo |
|:-----------|:----|:-----|
| 🔴 Crítico | 3 | Server monolítico, sem testes, componentes enormes |
| 🟡 Moderado | 12 | Segurança, performance, arquitetura |
| 🟢 Baixo | 3 | Cleanup de arquivos, build optimization |
