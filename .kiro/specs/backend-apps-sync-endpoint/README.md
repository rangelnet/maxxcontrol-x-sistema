# Spec: Backend Apps Sync Endpoint

## 📋 Visão Geral

Este spec implementa o endpoint `/api/apps/sync` no backend MaxxControl X para receber e armazenar listas completas de apps instalados enviadas pelos dispositivos Android TV-MAXX-PRO.

## 🎯 Problema

O painel web mostra "Nenhum app encontrado" no modal "Gerenciar Apps" porque:
- ✅ App Android está pronto para enviar apps
- ❌ Backend não tem endpoint `/api/apps/sync`

## ✨ Solução

Implementar endpoint que:
1. Recebe MAC address + array de apps
2. Busca device_id pelo MAC
3. Remove apps antigos (DELETE)
4. Insere todos os novos apps (INSERT)
5. Usa transação PostgreSQL para atomicidade
6. Retorna sucesso com total de apps

## 📁 Arquivos do Spec

- **requirements.md** - Requisitos funcionais detalhados
- **design.md** - Design técnico e arquitetura
- **tasks.md** - Plano de implementação passo a passo
- **.config.kiro** - Configuração do spec (feature, requirements-first)

## 🚀 Como Implementar

1. Abra o arquivo `tasks.md`
2. Siga as tasks na ordem (1.1 → 1.11 → 2 → 3 → 4)
3. Teste manualmente (task 5)
4. Teste integração com Android (task 6)

## 📊 Status Atual

- [x] Requirements definidos
- [x] Design completo
- [x] Tasks criadas
- [ ] Implementação pendente
- [ ] Testes pendentes

## 🔗 Arquivos Relacionados

**Backend:**
- `modules/apps/appsController.js` - Adicionar syncInstalledApps
- `modules/apps/appsRoutes.js` - Adicionar rota POST /sync

**Android (já implementado):**
- `AppSyncService.kt` - Envia apps para backend
- `MaxxControlRepository.kt` - Chama API /api/apps/sync

**Web Panel (já implementado):**
- `Devices.jsx` - Modal "Gerenciar Apps"

## 📝 Exemplo de Requisição

```bash
POST /api/apps/sync
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "mac_address": "9C:00:D3:21:E0:3B",
  "apps": [
    {
      "package_name": "com.netflix.mediaclient",
      "app_name": "Netflix",
      "version_code": 123456,
      "version_name": "8.95.0",
      "is_system": false
    }
  ]
}
```

## ✅ Exemplo de Resposta

```json
{
  "success": true,
  "message": "1 apps sincronizados",
  "device_id": 1,
  "total_apps": 1
}
```

## 🎓 Conceitos Importantes

- **Transação PostgreSQL**: Garante que DELETE + INSERTs são atômicos
- **deviceAuthMiddleware**: Valida JWT do dispositivo
- **Sincronização Atômica**: Tudo ou nada (rollback em caso de erro)
- **MAC Address**: Usado para identificar dispositivo

## 📞 Próximos Passos

Após implementar este endpoint:
1. ✅ App Android vai sincronizar apps automaticamente
2. ✅ Painel web vai mostrar apps no modal "Gerenciar Apps"
3. ✅ Administradores poderão ver inventário de apps de cada dispositivo
