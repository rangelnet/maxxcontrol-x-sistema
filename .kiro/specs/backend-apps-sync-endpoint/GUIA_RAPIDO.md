# 🚀 Guia Rápido: Implementar Endpoint /api/apps/sync

## 📍 Você está aqui

```
Backend MaxxControl X
└── modules/apps/
    ├── appsController.js  ← ADICIONAR syncInstalledApps aqui
    └── appsRoutes.js      ← ADICIONAR rota aqui
```

## ⚡ Implementação Rápida (15 minutos)

### Passo 1: Adicionar função no Controller (10 min)

Abra `modules/apps/appsController.js` e adicione no final:

```javascript
// Sincronizar lista completa de apps (chamado pelo app Android)
exports.syncInstalledApps = async (req, res) => {
  const { mac_address, apps } = req.body;

  try {
    // 1. Validar entrada
    if (!mac_address || !apps || !Array.isArray(apps) || apps.length === 0) {
      return res.status(400).json({ 
        error: 'MAC address e lista de apps são obrigatórios' 
      });
    }

    console.log(`🔄 Sincronizando ${apps.length} apps do dispositivo ${mac_address}...`);
    
    // 2. Buscar device_id pelo MAC
    const deviceResult = await pool.query(
      'SELECT id FROM devices WHERE mac_address = $1',
      [mac_address]
    );
    
    if (deviceResult.rows.length === 0) {
      console.log(`❌ Dispositivo não encontrado: ${mac_address}`);
      return res.status(404).json({ error: 'Dispositivo não encontrado' });
    }
    
    const device_id = deviceResult.rows[0].id;
    console.log(`✅ Device ID encontrado: ${device_id}`);
    
    // 3. Iniciar transação
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 4. Limpar apps antigos
      const deleteResult = await client.query(
        'DELETE FROM device_apps WHERE device_id = $1',
        [device_id]
      );
      console.log(`🗑️ ${deleteResult.rowCount} apps antigos removidos`);
      
      // 5. Inserir novos apps
      let insertedCount = 0;
      for (const app of apps) {
        // Validar campos obrigatórios
        if (!app.package_name || !app.app_name || 
            app.version_code === undefined || !app.version_name) {
          throw new Error(`App inválido: ${JSON.stringify(app)}`);
        }
        
        await client.query(
          `INSERT INTO device_apps 
           (device_id, package_name, app_name, version_code, version_name, is_system, installed_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [
            device_id,
            app.package_name,
            app.app_name,
            app.version_code,
            app.version_name,
            app.is_system || false
          ]
        );
        insertedCount++;
      }
      
      // 6. Commit
      await client.query('COMMIT');
      console.log(`✅ ${insertedCount} apps sincronizados com sucesso`);
      
      // 7. Resposta de sucesso
      res.json({ 
        success: true,
        message: `${insertedCount} apps sincronizados`,
        device_id: device_id,
        total_apps: insertedCount
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Erro ao sincronizar apps:', error);
    res.status(500).json({ error: 'Erro ao sincronizar apps' });
  }
};
```

### Passo 2: Adicionar rota (2 min)

Abra `modules/apps/appsRoutes.js` e adicione:

```javascript
// Sincronizar lista completa de apps (do app Android)
router.post('/sync', deviceAuthMiddleware, appsController.syncInstalledApps);
```

### Passo 3: Testar (3 min)

```bash
# 1. Reiniciar servidor backend
npm start

# 2. Testar com curl (substitua TOKEN e MAC)
curl -X POST http://localhost:3000/api/apps/sync \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "mac_address": "9C:00:D3:21:E0:3B",
    "apps": [
      {
        "package_name": "com.test.app",
        "app_name": "Test App",
        "version_code": 1,
        "version_name": "1.0",
        "is_system": false
      }
    ]
  }'

# 3. Verificar resposta (deve ser 200 OK)
```

## ✅ Checklist de Validação

- [ ] Função `syncInstalledApps` adicionada em `appsController.js`
- [ ] Rota POST `/sync` adicionada em `appsRoutes.js`
- [ ] Servidor reiniciado sem erros
- [ ] Teste manual retorna 200 OK
- [ ] Apps aparecem no banco de dados
- [ ] Logs aparecem no console com emojis
- [ ] Painel web mostra apps no modal "Gerenciar Apps"

## 🎯 Resultado Esperado

Após implementação:

**Antes:**
```
Modal "Gerenciar Apps"
┌─────────────────────────┐
│ Nenhum app encontrado   │
└─────────────────────────┘
```

**Depois:**
```
Modal "Gerenciar Apps"
┌─────────────────────────┐
│ ✅ Netflix (8.95.0)     │
│ ✅ YouTube (2.15.4)     │
│ ✅ Chrome (120.0.6099)  │
│ ... (25 apps total)     │
└─────────────────────────┘
```

## 🐛 Troubleshooting

### Erro 404 "Dispositivo não encontrado"
- Verificar se MAC address está correto
- Verificar se dispositivo está registrado na tabela `devices`

### Erro 400 "MAC address e lista de apps são obrigatórios"
- Verificar formato da requisição JSON
- Verificar que `apps` é um array não vazio

### Erro 500 "Erro ao sincronizar apps"
- Verificar logs do servidor para detalhes
- Verificar conexão com PostgreSQL
- Verificar que tabela `device_apps` existe

## 📚 Documentos Relacionados

- `requirements.md` - Requisitos completos
- `design.md` - Design técnico detalhado
- `tasks.md` - Plano de implementação passo a passo
- `README.md` - Visão geral do spec
