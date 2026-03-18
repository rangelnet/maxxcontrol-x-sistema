# Sistema de Revenda - Guia Completo

## 📋 Visão Geral

Sistema completo de gerenciamento de créditos e revenda para o MaxxControl X, permitindo que administradores distribuam créditos para revendedores que podem criar usuários.

## 🎯 Funcionalidades Implementadas

### 💰 Para Administradores

1. **Créditos Ilimitados**
   - Admin possui créditos ilimitados (exibido como ∞)
   - Sem limitações para enviar créditos

2. **Envio de Créditos**
   - Selecionar revendedor via dropdown
   - Quantidade mínima: 20 créditos
   - Validação automática
   - Histórico completo de envios

3. **Gerenciamento de Preços**
   - Definir preço personalizado por crédito para cada revendedor
   - Cálculo automático de lucro

4. **Planos de Revenda**
   - Bronze: 0% desconto
   - Prata: 10% desconto (mínimo 100 créditos)
   - Ouro: 20% desconto (mínimo 500 créditos)
   - Alterar plano de qualquer revendedor

5. **Relatório de Lucro**
   - Visualizar lucro por revendedor
   - Créditos usados vs. preço definido
   - Ordenação por lucro total

### 📊 Para Revendedores

1. **Dashboard Personalizado**
   - Saldo de créditos atual
   - Créditos usados
   - Usuários ativos
   - Plano atual

2. **Criar Usuários**
   - Descontar 1 crédito automaticamente
   - Definir validade (dias)
   - Validação de créditos antes de criar

3. **Alertas**
   - Notificação quando créditos estão baixos
   - Avisos de vencimento próximo

## 🗄️ Estrutura do Banco de Dados

### Tabelas Criadas

1. **creditos_historico**
   - Registro de todas as movimentações de créditos
   - Tipos: recebido, usado, devolvido

2. **creditos_transacoes**
   - Transações de envio do admin para revendedores
   - Rastreamento completo

3. **planos_revenda**
   - Definição dos planos (Bronze, Prata, Ouro)
   - Descontos e requisitos

4. **creditos_alertas**
   - Sistema de notificações
   - Alertas de crédito baixo e vencimentos

5. **revenda_logs**
   - Log de todas as ações do sistema
   - Auditoria completa

### Colunas Adicionadas em `users`

- `tipo`: admin, revendedor, usuario
- `creditos`: Saldo de créditos
- `plano_revenda`: bronze, prata, ouro
- `preco_credito`: Preço personalizado
- `revendedor_id`: FK para o revendedor que criou o usuário

## 🚀 Como Usar

### 1. Executar Migration

```bash
cd maxxcontrol-x-sistema
node database/migrations/run-resale-migration.js
```

### 2. Acessar o Painel

1. Faça login como administrador
2. Acesse o menu "Revenda"
3. Visualize o dashboard com suas estatísticas

### 3. Enviar Créditos

1. Selecione um revendedor no dropdown
2. Digite a quantidade (mínimo 20)
3. Clique em "Enviar Créditos"
4. Confirme o envio

### 4. Gerenciar Revendedores

**Definir Preço:**
- Clique no botão "Preço" na linha do revendedor
- Digite o novo preço por crédito
- Confirme

**Alterar Plano:**
- Clique no botão "Plano" na linha do revendedor
- Digite o novo plano (bronze/prata/ouro)
- Confirme

### 5. Visualizar Lucro

- Acesse a seção "Lucro por Revendedor"
- Veja créditos usados e lucro total
- Ordenado por maior lucro

## 📡 Endpoints da API

### Dashboard
```
GET /api/resale/dashboard/stats
```
Retorna estatísticas do usuário logado (admin ou revendedor)

### Listar Revendedores (Admin)
```
GET /api/resale/resellers
```

### Enviar Créditos (Admin)
```
POST /api/resale/credits/send
Body: {
  "revendedor_id": 1,
  "quantidade": 50
}
```

### Definir Preço (Admin)
```
POST /api/resale/credits/set-price
Body: {
  "revendedor_id": 1,
  "preco": 5.50
}
```

### Alterar Plano (Admin)
```
POST /api/resale/resellers/change-plan
Body: {
  "revendedor_id": 1,
  "plano": "ouro"
}
```

### Histórico de Transações
```
GET /api/resale/transactions
```
Admin vê todas, revendedor vê apenas as suas

### Relatório de Lucro (Admin)
```
GET /api/resale/profit
```

### Criar Usuário com Créditos (Revendedor)
```
POST /api/resale/users/create
Body: {
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "senha123",
  "plano": "premium",
  "dias_validade": 30
}
```

### Verificar Alertas (Revendedor)
```
GET /api/resale/alerts
```

### Marcar Alerta como Lido (Revendedor)
```
POST /api/resale/alerts/read
Body: {
  "alerta_id": 1
}
```

## 🎨 Design

### Tema
- Fundo escuro: #0F0F0F
- Cards: #1A1A1A
- Destaque laranja: #FF4D33
- Bordas: #808080/50

### Componentes
- Cards com glow effect na base
- Badges coloridos por status
- Tabelas modernas com hover
- Formulários com validação visual
- Animações suaves

## 🔒 Segurança

### Autenticação
- JWT obrigatório em todas as rotas
- Middleware `authMiddleware` valida token

### Autorização
- `adminOnly`: Apenas administradores
- `resellerOrAdmin`: Revendedores e administradores
- Validação de tipo de usuário no backend

### Validações
- Quantidade mínima de créditos: 20
- Preço não pode ser negativo
- Planos válidos: bronze, prata, ouro
- Verificação de créditos antes de criar usuário

## 📊 Logs e Auditoria

Todas as ações são registradas em `revenda_logs`:
- Envio de créditos
- Definição de preços
- Alteração de planos
- Criação de usuários

Formato do log:
```json
{
  "user_id": 1,
  "acao": "envio_creditos",
  "detalhes": {
    "revendedor_id": 2,
    "quantidade": 50,
    "revendedor_nome": "João Silva"
  }
}
```

## 🔄 Fluxo Completo

1. **Admin envia créditos**
   - Seleciona revendedor
   - Define quantidade (≥20)
   - Sistema registra transação
   - Atualiza saldo do revendedor

2. **Revendedor cria usuário**
   - Verifica créditos disponíveis
   - Cria usuário no sistema
   - Desconta 1 crédito
   - Registra no histórico

3. **Sistema calcula lucro**
   - Créditos usados × preço definido
   - Exibido no relatório de lucro

## 🚨 Alertas Automáticos

### Crédito Baixo
- Dispara quando créditos < 10
- Notificação no dashboard
- Pode ser marcado como lido

### Vencimento Próximo
- Dispara 7 dias antes do vencimento
- Lista usuários que vão vencer
- Permite renovação antecipada

## 📈 Estatísticas

### Dashboard Admin
- Créditos: Ilimitados (∞)
- Total de revendedores
- Total de créditos distribuídos
- Lucro total do sistema

### Dashboard Revendedor
- Saldo de créditos
- Créditos usados
- Usuários ativos
- Usuários totais
- Plano atual

## 🎯 Próximos Passos

1. **Implementar sistema de alertas automáticos**
   - Worker para verificar créditos baixos
   - Worker para verificar vencimentos

2. **Adicionar relatórios avançados**
   - Gráficos de consumo
   - Previsão de esgotamento
   - Análise de tendências

3. **Implementar sistema de renovação**
   - Renovação automática
   - Renovação em lote
   - Histórico de renovações

4. **Adicionar notificações em tempo real**
   - WebSocket para alertas
   - Push notifications
   - Email notifications

## 🐛 Troubleshooting

### Erro: "Créditos insuficientes"
- Verificar saldo do revendedor
- Admin pode enviar mais créditos

### Erro: "Quantidade mínima é 20 créditos"
- Aumentar quantidade no formulário
- Validação no frontend e backend

### Erro: "Revendedor não encontrado"
- Verificar se o revendedor existe
- Verificar se o tipo é 'revendedor'

### Tabelas não criadas
- Executar migration novamente
- Verificar logs do servidor
- Verificar conexão com banco

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs do servidor
2. Verificar logs do navegador (Console)
3. Verificar tabela `revenda_logs` no banco
4. Consultar documentação da API

---

**Versão:** 1.0.0  
**Data:** 2024  
**Sistema:** MaxxControl X - Sistema de Revenda
