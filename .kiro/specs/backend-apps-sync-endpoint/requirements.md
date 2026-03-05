# Requirements Document: Backend Apps Sync Endpoint

## Introduction

Esta especificação define a implementação do endpoint `/api/apps/sync` no backend MaxxControl X para receber e armazenar a lista completa de apps instalados enviada pelos dispositivos Android TV-MAXX-PRO. Atualmente, o painel web mostra "Nenhum app encontrado" porque o backend não possui este endpoint, apesar do app Android já estar preparado para enviar os dados.

O endpoint permitirá que o sistema receba listas completas de apps em uma única requisição, substituindo a abordagem atual de registro individual (`/api/apps/register`), garantindo sincronização atômica e eficiente.

## Glossary

- **Apps_Sync_Endpoint**: Endpoint POST /api/apps/sync que recebe lista completa de apps
- **Device_Apps_Table**: Tabela `device_apps` no PostgreSQL que armazena apps por dispositivo
- **Atomic_Sync**: Operação de sincronização que usa transação para garantir consistência
- **Batch_Insert**: Inserção de múltiplos registros em uma única operação
- **MAC_Address**: Identificador único do dispositivo usado para localizar device_id
- **Device_Auth_Middleware**: Middleware que valida token JWT do dispositivo

## Requirements

### Requirement 1: Endpoint de Sincronização em Lote

**User Story:** Como app Android, eu quero enviar a lista completa de apps instalados em uma única requisição, para que a sincronização seja atômica e eficiente.

#### Acceptance Criteria

1. THE endpoint SHALL aceitar requisições POST em `/api/apps/sync`
2. THE endpoint SHALL usar deviceAuthMiddleware para autenticação via JWT
3. THE requisição SHALL conter campo `mac_address` (String) identificando o dispositivo
4. THE requisição SHALL conter campo `apps` (Array) com lista de apps instalados
5. THE endpoint SHALL retornar status 200 com objeto de sucesso quando sincronização completar
6. THE endpoint SHALL retornar status 404 quando dispositivo não for encontrado pelo MAC
7. THE endpoint SHALL retornar status 500 quando ocorrer erro no banco de dados

### Requirement 2: Validação de Dados de Entrada

**User Story:** Como desenvolvedor backend, eu quero validar os dados recebidos, para que apenas requisições válidas sejam processadas.

#### Acceptance Criteria

1. THE endpoint SHALL validar que `mac_address` está presente e não é vazio
2. THE endpoint SHALL validar que `apps` é um array
3. THE endpoint SHALL validar que `apps` não está vazio
4. FOR EACH app no array, THE endpoint SHALL validar presença de `package_name`
5. FOR EACH app no array, THE endpoint SHALL validar presença de `app_name`
6. FOR EACH app no array, THE endpoint SHALL validar presença de `version_code` (Number)
7. FOR EACH app no array, THE endpoint SHALL validar presença de `version_name` (String)
8. FOR EACH app no array, THE endpoint SHALL validar presença de `is_system` (Boolean)
9. IF validação falhar, THE endpoint SHALL retornar status 400 com mensagem de erro descritiva

### Requirement 3: Busca de Dispositivo por MAC Address

**User Story:** Como sistema backend, eu quero localizar o dispositivo pelo MAC address, para que possa associar os apps ao device_id correto.

#### Acceptance Criteria

1. WHEN requisição é recebida, THE endpoint SHALL buscar device_id na tabela `devices` usando `mac_address`
2. THE query SQL SHALL usar `SELECT id FROM devices WHERE mac_address = $1`
3. IF dispositivo não for encontrado, THE endpoint SHALL retornar status 404
4. IF dispositivo não for encontrado, THE endpoint SHALL logar warning com MAC address
5. IF dispositivo for encontrado, THE endpoint SHALL extrair `device_id` do resultado
6. THE endpoint SHALL logar sucesso com device_id encontrado

### Requirement 4: Sincronização Atômica com Transação

**User Story:** Como administrador do sistema, eu quero que a sincronização seja atômica, para que não haja estado inconsistente se ocorrer erro durante o processo.

#### Acceptance Criteria

1. THE endpoint SHALL usar transação PostgreSQL para garantir atomicidade
2. THE endpoint SHALL executar `BEGIN` antes de modificar dados
3. IF qualquer operação falhar, THE endpoint SHALL executar `ROLLBACK`
4. IF todas operações tiverem sucesso, THE endpoint SHALL executar `COMMIT`
5. THE endpoint SHALL usar `pool.connect()` para obter client dedicado
6. THE endpoint SHALL liberar client com `client.release()` no bloco finally
7. THE transação SHALL incluir DELETE e todos os INSERTs

### Requirement 5: Limpeza de Apps Antigos

**User Story:** Como sistema backend, eu quero remover apps antigos antes de inserir novos, para que a lista reflita exatamente o estado atual do dispositivo.

#### Acceptance Criteria

1. WITHIN transação, THE endpoint SHALL executar DELETE de todos apps do dispositivo
2. THE query SQL SHALL usar `DELETE FROM device_apps WHERE device_id = $1`
3. THE DELETE SHALL ocorrer antes de qualquer INSERT
4. THE endpoint SHALL logar número de apps removidos
5. IF DELETE falhar, THE transação SHALL fazer ROLLBACK

### Requirement 6: Inserção em Lote de Novos Apps

**User Story:** Como sistema backend, eu quero inserir todos os apps de uma vez, para que a operação seja eficiente e rápida.

#### Acceptance Criteria

1. WITHIN transação, THE endpoint SHALL inserir cada app da lista
2. FOR EACH app, THE endpoint SHALL executar INSERT na tabela `device_apps`
3. THE INSERT SHALL incluir campos: device_id, package_name, app_name, version_code, version_name, is_system, installed_at
4. THE campo `installed_at` SHALL usar `NOW()` para timestamp atual
5. THE campo `is_system` SHALL usar valor do app ou `false` como default
6. IF qualquer INSERT falhar, THE transação SHALL fazer ROLLBACK
7. THE endpoint SHALL logar progresso da inserção

### Requirement 7: Resposta de Sucesso

**User Story:** Como app Android, eu quero receber confirmação de sucesso com detalhes, para que possa validar que a sincronização foi bem-sucedida.

#### Acceptance Criteria

1. WHEN sincronização completar com sucesso, THE endpoint SHALL retornar status 200
2. THE resposta SHALL conter campo `success: true`
3. THE resposta SHALL conter campo `message` com texto descritivo
4. THE resposta SHALL conter campo `device_id` com ID do dispositivo
5. THE resposta SHALL conter campo `total_apps` com número de apps sincronizados
6. THE formato da resposta SHALL ser JSON

### Requirement 8: Logging e Monitoramento

**User Story:** Como desenvolvedor do sistema, eu quero ter visibilidade sobre o processo de sincronização, para que possa diagnosticar problemas.

#### Acceptance Criteria

1. WHEN requisição é recebida, THE endpoint SHALL logar início com MAC e número de apps
2. WHEN device_id é encontrado, THE endpoint SHALL logar device_id
3. WHEN apps antigos são removidos, THE endpoint SHALL logar confirmação
4. WHEN apps novos são inseridos, THE endpoint SHALL logar progresso
5. WHEN sincronização completa, THE endpoint SHALL logar sucesso com total de apps
6. WHEN erro ocorrer, THE endpoint SHALL logar erro com stack trace
7. ALL logs SHALL usar console.log para sucesso e console.error para erros
8. ALL logs SHALL incluir emojis para facilitar identificação visual

### Requirement 9: Tratamento de Erros

**User Story:** Como desenvolvedor do sistema, eu quero que erros sejam tratados adequadamente, para que o sistema seja resiliente e forneça feedback útil.

#### Acceptance Criteria

1. THE endpoint SHALL usar try-catch para capturar exceções
2. IF erro ocorrer durante transação, THE endpoint SHALL fazer ROLLBACK
3. IF erro ocorrer, THE endpoint SHALL logar erro completo com stack trace
4. IF erro ocorrer, THE endpoint SHALL retornar status 500
5. THE resposta de erro SHALL conter campo `error` com mensagem descritiva
6. THE endpoint SHALL liberar client mesmo se erro ocorrer (finally block)
7. THE endpoint SHALL não expor detalhes internos do banco na resposta

### Requirement 10: Integração com Roteamento Existente

**User Story:** Como desenvolvedor backend, eu quero que o endpoint se integre com a estrutura existente, para que siga os padrões do projeto.

#### Acceptance Criteria

1. THE endpoint SHALL ser adicionado em `modules/apps/appsController.js`
2. THE rota SHALL ser adicionada em `modules/apps/appsRoutes.js`
3. THE rota SHALL usar `router.post('/sync', deviceAuthMiddleware, appsController.syncInstalledApps)`
4. THE endpoint SHALL seguir padrão de nomenclatura existente (exports.syncInstalledApps)
5. THE endpoint SHALL usar pool de conexões existente (`require('../../config/database')`)
6. THE endpoint SHALL ser consistente com estilo de código existente

## Success Criteria

A implementação será considerada bem-sucedida quando:

1. ✅ Endpoint `/api/apps/sync` aceitar requisições POST com autenticação JWT
2. ✅ Dispositivo for localizado corretamente pelo MAC address
3. ✅ Apps antigos forem removidos e novos inseridos atomicamente
4. ✅ Transação garantir consistência em caso de erro
5. ✅ Resposta de sucesso incluir todos os campos esperados
6. ✅ Logs fornecerem visibilidade completa do processo
7. ✅ Painel web mostrar apps sincronizados corretamente
8. ✅ App Android receber confirmação de sucesso (status 200)

## Out of Scope

- Modificações no app Android (já implementado)
- Modificações no painel web (já implementado)
- Otimizações de performance (bulk insert único)
- Validação de duplicatas de package_name
- Histórico de mudanças de apps
- Notificações de sincronização
- Rate limiting do endpoint
