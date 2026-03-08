# Convenções e Boas Práticas

## Padrões de Código

### Backend (Node.js)

#### Estrutura de Controllers
```javascript
// Sempre usar try-catch e retornar JSON padronizado
exports.nomeDoMetodo = async (req, res) => {
  try {
    const { parametro } = req.body;
    
    // Validação
    if (!parametro) {
      return res.status(400).json({ error: 'Parâmetro obrigatório' });
    }
    
    // Lógica de negócio
    const resultado = await pool.query('SELECT ...');
    
    // Resposta de sucesso
    res.json({ 
      success: true,
      data: resultado.rows 
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
```

#### Estrutura de Routes
```javascript
const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authMiddleware } = require('../../middlewares/auth');

// Rotas públicas (sem autenticação)
router.get('/public-endpoint', controller.metodoPublico);

// Rotas protegidas (com autenticação)
router.get('/protected-endpoint', authMiddleware, controller.metodoProtegido);

module.exports = router;
```

#### Queries SQL
```javascript
// Usar prepared statements para prevenir SQL injection
const query = 'SELECT * FROM devices WHERE mac_address = $1';
const values = [macAddress];
const result = await pool.query(query, values);

// Para SQLite, usar ? ao invés de $1
const query = 'SELECT * FROM devices WHERE mac_address = ?';
```

### Frontend (React)

#### Estrutura de Componentes
```javascript
import { useState, useEffect } from 'react';
import api from '../services/api';
import { IconName } from 'lucide-react';

const ComponentName = () => {
  // State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Effects
  useEffect(() => {
    loadData();
  }, []);
  
  // Handlers
  const loadData = async () => {
    try {
      const response = await api.get('/api/endpoint');
      setData(response.data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Render
  if (loading) return <div>Carregando...</div>;
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

#### Chamadas de API
```javascript
// Sempre usar try-catch
try {
  const response = await api.post('/api/endpoint', data);
  alert('Sucesso!');
} catch (error) {
  console.error('Erro:', error);
  alert('Erro ao processar');
}
```

## Segurança

### Autenticação

#### JWT para Admins
```javascript
// Middleware de autenticação
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};
```

#### Token Fixo para Dispositivos
```javascript
// Middleware de autenticação de dispositivos
const deviceAuthMiddleware = (req, res, next) => {
  const token = req.headers['x-device-token'];
  
  if (token !== process.env.DEVICE_TOKEN) {
    return res.status(403).json({ error: 'Não autorizado' });
  }
  
  next();
};
```

### Validação de Dados
```javascript
// Sempre validar entrada do usuário
if (!email || !senha) {
  return res.status(400).json({ error: 'Campos obrigatórios' });
}

// Validar formato de email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return res.status(400).json({ error: 'Email inválido' });
}

// Validar MAC address
const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
if (!macRegex.test(macAddress)) {
  return res.status(400).json({ error: 'MAC address inválido' });
}
```

### Senhas
```javascript
// Sempre usar bcrypt para hash
const bcrypt = require('bcryptjs');

// Criar hash
const senhaHash = await bcrypt.hash(senha, 10);

// Verificar senha
const senhaValida = await bcrypt.compare(senhaFornecida, senhaHash);
```

## WebSocket

### Estrutura de Mensagens
```javascript
// Formato padrão de mensagens
{
  type: 'event:action',  // Ex: 'device:iptv-updated'
  data: {
    // Dados do evento
  },
  timestamp: new Date().toISOString()
}
```

### Broadcast de Eventos
```javascript
// Enviar para todos os clientes conectados
wss.clients.forEach(client => {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({
      type: 'device:updated',
      data: deviceData
    }));
  }
});
```

## Banco de Dados

### Timestamps
```sql
-- Sempre incluir created_at e updated_at
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Índices
```sql
-- Criar índices em colunas frequentemente consultadas
CREATE INDEX idx_devices_mac ON devices(mac_address);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_logs_device ON logs(device_id);
```

### Foreign Keys
```sql
-- Sempre usar foreign keys para integridade referencial
device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE
```

## Tratamento de Erros

### Backend
```javascript
// Logs detalhados no console
console.error('❌ Erro ao processar:', error.message);
console.error('Stack:', error.stack);

// Resposta genérica para o cliente (não expor detalhes internos)
res.status(500).json({ error: 'Erro interno do servidor' });
```

### Frontend
```javascript
// Mostrar mensagens amigáveis
catch (error) {
  console.error('Erro:', error);
  const message = error.response?.data?.error || 'Erro ao processar requisição';
  alert(message);
}
```

## Performance

### Backend
- Rate limiting em todas as rotas públicas
- Cache de configurações em memória quando possível
- Índices em colunas de busca frequente
- Paginação para listagens grandes

### Frontend
- Lazy loading de componentes pesados
- Debounce em campos de busca
- Otimização de re-renders (React.memo quando necessário)
- Carregar dados apenas quando necessário

### WebSocket
- Reconexão automática em caso de queda
- Heartbeat para manter conexão viva
- Throttle de eventos para evitar spam

## Documentação

### Comentários em Código
```javascript
// Comentar apenas lógica complexa ou não óbvia
// Evitar comentários redundantes

// ❌ Ruim
// Incrementa contador
contador++;

// ✅ Bom
// Polling a cada 30s para evitar sobrecarga no servidor
// e economizar bateria do dispositivo
setInterval(checkCommands, 30000);
```

### Documentação de APIs
- Manter API_ENDPOINTS.md atualizado
- Documentar parâmetros obrigatórios e opcionais
- Incluir exemplos de requisição/resposta

### Documentação de Features
- Criar arquivo .md na raiz para features grandes
- Incluir diagramas visuais quando útil
- Manter COMECE_AQUI.md como ponto de entrada

## Git

### Commits Automáticos

**REGRA CRÍTICA**: Sempre fazer commit e push de TODAS as alterações após completar uma tarefa ou correção.

```bash
# Após fazer alterações, SEMPRE executar:
git add .
git commit -m "tipo: descrição clara da alteração"
git push origin main
```

**Quando fazer commit:**
- ✅ Após corrigir bugs
- ✅ Após implementar features
- ✅ Após criar/atualizar documentação
- ✅ Após fazer qualquer alteração em código
- ✅ Sempre que o usuário pedir para "fazer commit"
- ✅ Ao final de cada tarefa completada

**Nunca:**
- ❌ Deixar alterações sem commit
- ❌ Pedir ao usuário para fazer commit manualmente
- ❌ Esquecer de fazer push após commit

### Formato de Commits
```bash
# Usar conventional commits
feat: adiciona endpoint de bloqueio de dispositivo
fix: corrige erro ao salvar branding
fix: corrige tela preta na página de banners
docs: atualiza documentação de API
refactor: reorganiza estrutura de módulos
test: adiciona testes para apps controller
```

### Branches
```bash
main          # Produção (deploy automático)
develop       # Desenvolvimento
feature/nome  # Features novas
fix/nome      # Correções de bugs
```

### Exemplo de Workflow Completo
```bash
# 1. Fazer alterações no código
# 2. Testar localmente
# 3. SEMPRE fazer commit e push:
git add .
git commit -m "fix: corrige problema X"
git push origin main
# 4. Aguardar deploy automático no Render
```

## Testes

### Backend
```javascript
// Testar endpoints manualmente
curl -X POST http://localhost:3000/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"campo": "valor"}'
```

### Frontend
- Testar em navegador (Chrome DevTools)
- Verificar console para erros
- Testar responsividade

### Integração
- Testar fluxo completo: Painel → API → App Android
- Verificar WebSocket funcionando
- Validar comandos sendo executados

## Deploy

### Checklist Pré-Deploy
- [ ] Testar localmente
- [ ] Verificar .env configurado
- [ ] Executar migrações necessárias
- [ ] Testar build do frontend (`npm run build`)
- [ ] Verificar logs de erro
- [ ] Commit e push

### Pós-Deploy
- [ ] Verificar health check: /health
- [ ] Testar login no painel
- [ ] Verificar WebSocket conectando
- [ ] Testar um endpoint de cada módulo
- [ ] Monitorar logs do Render

## Variáveis de Ambiente

### Nunca Commitar
- Senhas de banco de dados
- JWT secrets
- API keys
- Tokens de autenticação

### Usar .env.example
```bash
# Criar template sem valores sensíveis
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=seu_secret_aqui
DEVICE_TOKEN=seu_token_aqui
```

## Logs

### Níveis de Log
```javascript
console.log('ℹ️ Info:', message);      // Informação geral
console.warn('⚠️ Warning:', message);   // Avisos
console.error('❌ Error:', message);    // Erros
console.debug('🔍 Debug:', message);    // Debug (dev only)
```

### Logs Estruturados
```javascript
// Incluir contexto útil
console.log('✅ Dispositivo registrado:', {
  mac: device.mac_address,
  modelo: device.modelo,
  ip: device.ip
});
```

## Integração App ↔ Painel

### Headers Obrigatórios
```javascript
// Do App para API
{
  'Content-Type': 'application/json',
  'X-Device-Token': 'token_fixo'
}

// Do Painel para API
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer jwt_token'
}
```

### Identificação de Dispositivo
- Sempre usar MAC address como identificador único
- Nunca usar IP (pode mudar)
- Validar formato do MAC antes de processar

### Polling
- App faz polling a cada 30s (não menos para economizar bateria)
- Backend retorna apenas comandos pendentes
- App reporta status após executar

## Manutenção

### Limpeza de Dados
```sql
-- Limpar logs antigos (> 30 dias)
DELETE FROM logs WHERE created_at < NOW() - INTERVAL '30 days';

-- Limpar comandos completados (> 7 dias)
DELETE FROM device_commands 
WHERE status IN ('completed', 'failed') 
AND completed_at < NOW() - INTERVAL '7 days';
```

### Backup
- Backup diário do banco de dados
- Manter últimos 30 dias
- Testar restore semanalmente

### Monitoramento
- Verificar logs de erro diariamente
- Monitorar uso de CPU/memória
- Alertas para downtime > 5 minutos
