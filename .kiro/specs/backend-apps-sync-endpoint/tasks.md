# Implementation Plan: Backend Apps Sync Endpoint

## Overview

Este plano implementa o endpoint `/api/apps/sync` no backend MaxxControl X para receber e armazenar listas completas de apps instalados enviadas pelos dispositivos Android. A implementação inclui validação de dados, busca de dispositivo por MAC, transação atômica PostgreSQL, e logging completo.

**Tecnologias:** Node.js, Express, PostgreSQL, pg (node-postgres)

**Componentes principais:**
- syncInstalledApps em appsController.js
- Rota POST /sync em appsRoutes.js
- Validação de entrada
- Transação PostgreSQL
- Logging e tratamento de erros

## Tasks

- [ ] 1. Implementar função syncInstalledApps no controller
  - [ ] 1.1 Criar estrutura base da função
    - Abrir arquivo `modules/apps/appsController.js`
    - Adicionar função `exports.syncInstalledApps = async (req, res) => {}`
    - Extrair `mac_address` e `apps` de `req.body`
    - Adicionar bloco try-catch principal
    - _Requirements: 1.1, 1.2_

  - [ ] 1.2 Implementar validação de dados de entrada
    - Validar que `mac_address` está presente e não é vazio
    - Validar que `apps` é um array e não está vazio
    - Se validação falhar, retornar status 400 com mensagem de erro
    - Adicionar log de início com MAC e número de apps
    - _Requirements: 2.1, 2.2, 2.3, 2.9, 8.1_

  - [ ] 1.3 Implementar busca de dispositivo por MAC
    - Executar query `SELECT id FROM devices WHERE mac_address = $1`
    - Verificar se resultado contém dispositivo
    - Se não encontrado, retornar status 404 com erro
    - Se não encontrado, logar warning com MAC address
    - Se encontrado, extrair `device_id` do resultado
    - Logar sucesso com device_id encontrado
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ] 1.4 Implementar transação PostgreSQL
    - Obter client dedicado com `const client = await pool.connect()`
    - Adicionar bloco try-catch-finally para transação
    - Executar `await client.query('BEGIN')` no início
    - Adicionar `client.release()` no bloco finally
    - _Requirements: 4.1, 4.2, 4.5, 4.6_

  - [ ] 1.5 Implementar limpeza de apps antigos
    - Dentro da transação, executar DELETE de apps do dispositivo
    - Query: `DELETE FROM device_apps WHERE device_id = $1`
    - Capturar `rowCount` do resultado
    - Logar número de apps removidos
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 1.6 Implementar inserção de novos apps
    - Criar loop `for (const app of apps)`
    - Para cada app, validar campos obrigatórios (package_name, app_name, version_code, version_name)
    - Se validação falhar, lançar erro (vai fazer rollback)
    - Executar INSERT com campos: device_id, package_name, app_name, version_code, version_name, is_system, installed_at
    - Usar `NOW()` para installed_at
    - Usar `app.is_system || false` como default
    - Incrementar contador de apps inseridos
    - _Requirements: 2.4, 2.5, 2.6, 2.7, 2.8, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 1.7 Implementar commit da transação
    - Após loop de inserção, executar `await client.query('COMMIT')`
    - Logar sucesso com total de apps sincronizados
    - _Requirements: 4.4, 6.7, 8.5_

  - [ ] 1.8 Implementar resposta de sucesso
    - Retornar status 200 com `res.json()`
    - Incluir campo `success: true`
    - Incluir campo `message` com texto descritivo
    - Incluir campo `device_id` com ID do dispositivo
    - Incluir campo `total_apps` com número de apps sincronizados
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ] 1.9 Implementar tratamento de erro na transação
    - No bloco catch da transação, executar `await client.query('ROLLBACK')`
    - Lançar erro novamente para ser capturado pelo catch principal
    - _Requirements: 4.3, 5.5, 6.6, 9.2_

  - [ ] 1.10 Implementar tratamento de erro geral
    - No bloco catch principal, logar erro completo com stack trace
    - Retornar status 500 com `{error: 'Erro ao sincronizar apps'}`
    - _Requirements: 9.1, 9.3, 9.4, 9.5, 9.7, 8.6_

  - [ ] 1.11 Garantir liberação de client
    - Verificar que `client.release()` está no bloco finally
    - Garantir que será executado mesmo se erro ocorrer
    - _Requirements: 4.6, 9.6_

- [ ] 2. Adicionar rota no arquivo de rotas
  - Abrir arquivo `modules/apps/appsRoutes.js`
  - Adicionar linha: `router.post('/sync', deviceAuthMiddleware, appsController.syncInstalledApps);`
  - Verificar que imports estão corretos (appsController, deviceAuthMiddleware)
  - Posicionar rota junto com outras rotas de apps
  - _Requirements: 1.1, 1.2, 10.2, 10.3_

- [ ] 3. Verificar integração com código existente
  - Verificar que `pool` está importado de `../../config/database`
  - Verificar que estilo de código está consistente com outras funções
  - Verificar que nomenclatura segue padrão (exports.syncInstalledApps)
  - _Requirements: 10.1, 10.4, 10.5, 10.6_

- [ ] 4. Adicionar logging completo
  - Revisar todos os pontos de log adicionados
  - Verificar que logs de sucesso usam console.log
  - Verificar que logs de erro usam console.error
  - Verificar que logs incluem emojis (🔄, ✅, ❌, 🗑️)
  - Verificar que logs incluem contexto (MAC, device_id, contadores)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

- [ ] 5. Testar endpoint manualmente
  - Iniciar servidor backend
  - Obter token JWT válido de dispositivo
  - Enviar requisição POST para `/api/apps/sync` com dados de teste
  - Verificar resposta 200 com campos corretos
  - Verificar no banco que apps foram inseridos
  - Testar com MAC inválido (deve retornar 404)
  - Testar com dados inválidos (deve retornar 400)
  - Verificar logs no console

- [ ] 6. Testar integração com app Android
  - Compilar e instalar app Android em dispositivo de teste
  - Registrar dispositivo no painel
  - Aguardar sincronização automática de apps
  - Verificar logs do backend
  - Abrir painel web e verificar modal "Gerenciar Apps"
  - Confirmar que apps aparecem na lista
  - Verificar que contadores (sistema/usuário) estão corretos

- [ ] 7. Documentar endpoint (opcional)
  - Criar ou atualizar documentação da API
  - Incluir exemplo de requisição
  - Incluir exemplo de resposta de sucesso
  - Incluir exemplos de respostas de erro
  - Documentar códigos de status HTTP

## Notes

- A implementação usa transação PostgreSQL para garantir atomicidade
- DELETE + INSERT é mais simples que UPSERT para lista completa
- Validação de cada app ocorre durante inserção (fail-fast)
- Logs com emojis facilitam identificação visual no console
- deviceAuthMiddleware já existe e valida JWT do dispositivo
- Tabela device_apps já existe com estrutura correta
- Endpoint será chamado automaticamente pelo app Android após registro e a cada 1 hora
- Sincronização também ocorre após instalação/desinstalação de apps
- Resposta de sucesso permite ao Android validar que sincronização funcionou
