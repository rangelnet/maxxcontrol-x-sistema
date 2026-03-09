# Implementation Plan: IPTV Tree Viewer

## Overview

Este plano de implementação detalha as tarefas necessárias para criar a funcionalidade IPTV Tree Viewer no painel MaxxControl. A implementação seguirá uma abordagem incremental, começando pelo backend (endpoints proxy e cache), depois frontend (componentes React), e finalmente integração e testes.

A funcionalidade permitirá aos administradores visualizar a estrutura hierárquica completa de servidores Xtream Codes IPTV, incluindo categorias, canais de TV ao vivo, filmes (VOD) e séries com temporadas e episódios.

## Tasks

- [x] 1. Setup do módulo backend iptv-tree
  - Criar estrutura de diretórios `/modules/iptv-tree/`
  - Criar arquivo `cache.js` com classe CacheManager
  - Configurar exports e imports necessários
  - _Requirements: 11.1, 11.2, 12.4_

- [x] 2. Implementar sistema de cache em memória
  - [x] 2.1 Criar classe CacheManager em `cache.js`
    - Implementar métodos `get(key)`, `set(key, value, ttl)`, `clear(key)`, `clearAll()`
    - Usar Map para armazenamento em memória
    - Implementar expiração automática baseada em TTL
    - _Requirements: 11.1, 11.2, 11.3_
  
  - [ ]* 2.2 Escrever testes unitários para CacheManager
    - Testar set e get de valores
    - Testar expiração por TTL
    - Testar clear de chaves específicas e clearAll
    - _Requirements: 11.1, 11.2_

- [x] 3. Implementar controller de proxy Xtream API
  - [x] 3.1 Criar `iptvTreeController.js` com função auxiliar `getXtreamConfig`
    - Buscar configuração global da tabela `iptv_server_config`
    - Buscar configuração de dispositivo da tabela `device_iptv_config`
    - Implementar fallback para global quando device não tem config
    - Validar presença de credenciais (url, username, password)
    - _Requirements: 1.2, 6.2, 6.3, 6.4, 12.1, 12.2_
  
  - [x] 3.2 Implementar função auxiliar `buildXtreamUrl`
    - Construir URL com formato: `{url}/player_api.php?username={user}&password={pass}&action={action}`
    - Adicionar parâmetros adicionais quando necessário (category_id, series_id)
    - _Requirements: 1.1, 3.1, 4.1_
  
  - [x] 3.3 Implementar função auxiliar `fetchFromXtream`
    - Fazer requisição HTTP com timeout de 10 segundos
    - Tratar erros 401/403 como credenciais inválidas
    - Tratar timeout com mensagem específica
    - Retornar dados JSON parseados
    - _Requirements: 1.4, 10.2, 10.3_

- [x] 4. Implementar endpoint de categorias
  - [x] 4.1 Criar método `getCategories` no controller
    - Validar parâmetro `type` (live, vod, series)
    - Obter configuração via `getXtreamConfig`
    - Verificar cache com chave `${source}-categories-${type}`
    - Se não cached, buscar via `fetchFromXtream` com action `get_${type}_categories`
    - Armazenar em cache com TTL de 5 minutos (300s)
    - Retornar JSON com `{success, data, cached, timestamp}`
    - _Requirements: 1.1, 1.2, 1.3, 3.1, 4.1, 11.1_
  
  - [ ]* 4.2 Escrever testes unitários para getCategories
    - Testar retorno de cache quando disponível
    - Testar chamada à API Xtream quando cache vazio
    - Testar erro 400 quando configuração não encontrada
    - Testar erro 401 para credenciais inválidas
    - _Requirements: 1.4, 10.2, 10.4_

- [ ] 5. Checkpoint - Validar backend básico
  - Garantir que todos os testes passem
  - Testar manualmente endpoint de categorias com curl
  - Perguntar ao usuário se há dúvidas ou ajustes necessários

- [x] 6. Implementar endpoint de streams
  - [x] 6.1 Criar método `getStreams` no controller
    - Validar parâmetros `type` (live, vod) e `categoryId`
    - Obter configuração via `getXtreamConfig`
    - Verificar cache com chave `${source}-streams-${type}-${categoryId}`
    - Se não cached, buscar via `fetchFromXtream` com action `get_${type}_streams`
    - Filtrar streams por `category_id` igual ao `categoryId` fornecido
    - Para live TV, ordenar por campo `num` em ordem crescente
    - Armazenar em cache com TTL de 10 minutos (600s)
    - Retornar JSON com `{success, data, cached, timestamp}`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.3, 11.2_
  
  - [ ]* 6.2 Escrever testes unitários para getStreams
    - Testar filtragem por category_id
    - Testar ordenação por num para live TV
    - Testar retorno de array vazio para categoria sem streams
    - Testar uso de cache
    - _Requirements: 2.2, 2.4, 2.5_

- [x] 7. Implementar endpoints de séries
  - [x] 7.1 Criar método `getSeries` no controller
    - Validar parâmetro `categoryId`
    - Obter configuração via `getXtreamConfig`
    - Verificar cache com chave `${source}-series-${categoryId}`
    - Se não cached, buscar via `fetchFromXtream` com action `get_series`
    - Filtrar séries por `category_id`
    - Armazenar em cache com TTL de 10 minutos
    - _Requirements: 4.2_
  
  - [x] 7.2 Criar método `getSeriesInfo` no controller
    - Validar parâmetro `seriesId`
    - Obter configuração via `getXtreamConfig`
    - Verificar cache com chave `${source}-series-info-${seriesId}`
    - Se não cached, buscar via `fetchFromXtream` com action `get_series_info&series_id=${seriesId}`
    - Armazenar em cache com TTL de 15 minutos (900s)
    - Retornar objeto com `info`, `seasons` (array com `episodes`)
    - _Requirements: 4.3, 4.4, 4.5_
  
  - [ ]* 7.3 Escrever testes unitários para endpoints de séries
    - Testar getSeries com filtragem por categoria
    - Testar getSeriesInfo com estrutura de temporadas e episódios
    - Testar cache para ambos os métodos
    - _Requirements: 4.2, 4.3_

- [x] 8. Implementar endpoint de limpeza de cache
  - [x] 8.1 Criar método `clearCache` no controller
    - Validar parâmetro `source` do body
    - Limpar todas as chaves que começam com `${source}-`
    - Retornar `{success: true, message: 'Cache limpo com sucesso'}`
    - _Requirements: 11.4_
  
  - [ ]* 8.2 Escrever teste unitário para clearCache
    - Testar limpeza de cache para fonte específica
    - Verificar que outras fontes não são afetadas
    - _Requirements: 11.4_

- [x] 9. Criar rotas do módulo iptv-tree
  - [x] 9.1 Criar arquivo `iptvTreeRoutes.js`
    - Importar Express Router e controller
    - Definir rota `GET /api/iptv-tree/categories/:type` → `getCategories`
    - Definir rota `GET /api/iptv-tree/streams/:type/:categoryId` → `getStreams`
    - Definir rota `GET /api/iptv-tree/series/:categoryId` → `getSeries`
    - Definir rota `GET /api/iptv-tree/series-info/:seriesId` → `getSeriesInfo`
    - Definir rota `POST /api/iptv-tree/clear-cache` → `clearCache`
    - Aplicar middleware `authMiddleware` em todas as rotas
    - Exportar router
    - _Requirements: 12.4, 12.5_
  
  - [x] 9.2 Registrar rotas no `server.js`
    - Importar `iptvTreeRoutes`
    - Adicionar `app.use(iptvTreeRoutes)`
    - _Requirements: 12.4_

- [ ] 10. Checkpoint - Backend completo
  - Garantir que todos os testes passem
  - Testar todos os endpoints manualmente
  - Verificar que cache está funcionando corretamente
  - Perguntar ao usuário se há dúvidas

- [x] 11. Criar componente React principal IptvTreeViewer
  - [x] 11.1 Criar arquivo `web/src/pages/IptvTreeViewer.jsx`
    - Importar React, useState, useEffect, useCallback
    - Importar axios via `services/api.js`
    - Importar ícones do lucide-react (Tv, Film, Clapperboard, RefreshCw, Search, Copy)
    - Definir estado inicial: `configSource`, `credentials`, `treeData`, `expandedNodes`, `selectedStream`, `searchQuery`, `loading`, `error`
    - _Requirements: 5.1, 6.1, 8.1, 9.1, 10.1_
  
  - [x] 11.2 Implementar função `loadConfig`
    - Buscar configuração via `GET /api/iptv-server/config` (global)
    - Buscar lista de dispositivos via `GET /api/device/list-all`
    - Armazenar em estado
    - Validar presença de credenciais
    - _Requirements: 6.2, 6.3, 12.1, 12.2_
  
  - [x] 11.3 Implementar função `loadCategories`
    - Buscar categorias via `GET /api/iptv-tree/categories/:type?source=${configSource}`
    - Construir hierarquia usando `parent_id` (raiz = 0)
    - Adicionar contagem de filhos em badge
    - Atualizar `treeData` no estado
    - Tratar erros e exibir mensagens apropriadas
    - _Requirements: 1.1, 1.3, 1.5, 3.5, 10.2, 10.3, 10.4_
  
  - [x] 11.4 Implementar função `loadStreams`
    - Buscar streams via `GET /api/iptv-tree/streams/:type/:categoryId?source=${configSource}`
    - Adicionar streams como filhos da categoria expandida
    - Marcar categoria como `loaded: true`
    - _Requirements: 2.1, 2.2, 2.3, 5.4_
  
  - [x] 11.5 Implementar função `loadSeriesInfo`
    - Buscar detalhes via `GET /api/iptv-tree/series-info/:seriesId?source=${configSource}`
    - Construir nós para temporadas e episódios
    - Adicionar como filhos da série expandida
    - _Requirements: 4.3, 4.4, 4.5_

- [x] 12. Implementar componente ConfigSelector
  - [x] 12.1 Criar subcomponente ConfigSelector dentro de IptvTreeViewer.jsx
    - Renderizar dropdown com opção "Configuração Global"
    - Listar dispositivos cadastrados como opções
    - Chamar `onChange` quando seleção mudar
    - _Requirements: 6.1, 6.2_
  
  - [x] 12.2 Implementar handler `handleConfigChange`
    - Limpar `treeData` e `expandedNodes`
    - Atualizar `configSource`
    - Recarregar categorias
    - _Requirements: 6.5_

- [x] 13. Implementar componente TreeNode recursivo
  - [x] 13.1 Criar subcomponente TreeNode
    - Receber props: `node`, `level`, `expanded`, `onToggle`, `onSelect`, `searchQuery`
    - Renderizar indentação proporcional ao `level` (ex: `paddingLeft: ${level * 20}px`)
    - Exibir ícone baseado em `node.type` e `node.contentType`
    - Exibir nome do nó com highlighting se `searchQuery` presente
    - Exibir badge com contagem se `node.badge` existe
    - Exibir ícone de expansão (ChevronRight/ChevronDown) se `node.children` existe
    - Renderizar filhos recursivamente quando expandido
    - _Requirements: 5.1, 5.2, 7.1, 7.2, 7.3, 7.4, 7.5, 8.4_
  
  - [x] 13.2 Implementar handler `handleToggle`
    - Alternar estado expandido/colapsado
    - Se expandindo pela primeira vez e `!node.loaded`, chamar `loadStreams` ou `loadSeriesInfo`
    - Atualizar `expandedNodes` no estado
    - _Requirements: 5.3, 5.4, 5.5_
  
  - [x] 13.3 Implementar handler `handleSelect`
    - Atualizar `selectedStream` no estado
    - Abrir DetailPanel
    - _Requirements: 9.1_

- [x] 14. Implementar componente SearchBar
  - [x] 14.1 Criar subcomponente SearchBar
    - Renderizar input de texto com ícone de busca
    - Implementar debounce de 300ms usando useCallback e setTimeout
    - Atualizar `searchQuery` no estado após debounce
    - _Requirements: 8.1, 8.2, 11.5_
  
  - [x] 14.2 Implementar função `filterTree`
    - Filtrar nós cujo nome contém `searchQuery` (case-insensitive)
    - Expandir automaticamente categorias que contêm resultados
    - Retornar árvore filtrada
    - _Requirements: 8.2, 8.3_
  
  - [x] 14.3 Implementar botão de limpar busca
    - Limpar `searchQuery`
    - Restaurar visualização completa da árvore
    - _Requirements: 8.5_

- [ ] 15. Checkpoint - Frontend básico
  - Garantir que componentes renderizam sem erros
  - Testar carregamento de categorias
  - Testar expansão de categorias
  - Perguntar ao usuário se há dúvidas

- [x] 16. Implementar componente DetailPanel
  - [x] 16.1 Criar subcomponente DetailPanel
    - Receber props: `stream`, `credentials`, `onClose`
    - Renderizar painel lateral (sidebar) com informações do stream
    - Exibir todos os metadados disponíveis (stream_id, name, category_id, etc)
    - Para live TV, exibir `num` e `epg_channel_id`
    - Para VOD/séries, exibir `container_extension`
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [x] 16.2 Implementar formatação de URL do stream
    - Live TV: `{url}/{username}/{password}/{stream_id}`
    - VOD: `{url}/movie/{username}/{password}/{stream_id}.{ext}`
    - Episódio: `{url}/series/{username}/{password}/{episode_id}.{ext}`
    - Exibir URL formatado em campo de texto readonly
    - _Requirements: 9.4_
  
  - [x] 16.3 Implementar botão de copiar URL
    - Usar `navigator.clipboard.writeText(url)`
    - Exibir feedback visual (ex: "Copiado!")
    - _Requirements: 9.5_

- [x] 17. Implementar indicadores visuais e estados de carregamento
  - [x] 17.1 Adicionar spinner de carregamento
    - Exibir durante chamadas de API
    - Usar estado `loading` para controlar visibilidade
    - _Requirements: 10.1_
  
  - [x] 17.2 Implementar exibição de mensagens de erro
    - Renderizar mensagem de erro quando `error` não é null
    - Incluir botão "Tentar Novamente" que recarrega dados
    - _Requirements: 1.4, 10.2, 10.3, 10.4, 10.5_
  
  - [x] 17.3 Implementar estado vazio para categorias
    - Quando categoria expandida não tem filhos, exibir "Nenhum conteúdo disponível"
    - _Requirements: 2.5_

- [x] 18. Implementar botão de atualizar cache
  - [x] 18.1 Adicionar botão "Atualizar" no topo da página
    - Ícone RefreshCw do lucide-react
    - Chamar `POST /api/iptv-tree/clear-cache` com `source` atual
    - Recarregar categorias após limpar cache
    - _Requirements: 11.4_

- [x] 19. Adicionar estilização com TailwindCSS
  - [x] 19.1 Estilizar layout principal
    - Container com padding e max-width
    - Grid ou flex para organizar ConfigSelector, SearchBar e TreeView
    - DetailPanel como sidebar fixa à direita
    - _Requirements: 5.1_
  
  - [x] 19.2 Estilizar TreeNode
    - Hover effects para interatividade
    - Cores diferentes para categorias (azul) e conteúdo (cinza)
    - Ícones com tamanho e cor apropriados
    - Badge com background e padding
    - _Requirements: 7.4, 7.5_
  
  - [x] 19.3 Estilizar DetailPanel
    - Background branco com sombra
    - Padding e espaçamento adequados
    - Botão de fechar no topo
    - Campos de metadados organizados
    - _Requirements: 9.1_

- [x] 20. Integrar IptvTreeViewer no painel
  - [x] 20.1 Adicionar rota no `web/src/App.jsx`
    - Importar IptvTreeViewer
    - Adicionar rota `/iptv-tree` com componente IptvTreeViewer
    - Proteger rota com autenticação
    - _Requirements: 12.4_
  
  - [x] 20.2 Adicionar link no menu Sidebar
    - Adicionar item "Visualizar Árvore IPTV" no menu
    - Ícone Tv do lucide-react
    - Link para `/iptv-tree`
    - _Requirements: 12.4_

- [ ] 21. Checkpoint - Integração completa
  - Testar fluxo completo no navegador
  - Verificar que todas as funcionalidades estão operacionais
  - Testar com diferentes configurações (global e dispositivos)
  - Perguntar ao usuário se há ajustes necessários

- [ ]* 22. Escrever testes de propriedades (Property-Based Tests)
  - [ ]* 22.1 Escrever property test para construção de hierarquia
    - **Property 5: Hierarchy Construction**
    - **Validates: Requirements 1.5, 3.5**
    - Gerar arrays aleatórios de categorias com parent_id
    - Verificar que hierarquia é construída corretamente
    - Verificar que nós raiz têm parent_id = 0
    - Verificar que filhos estão aninhados sob pais corretos
  
  - [ ]* 22.2 Escrever property test para ordenação de streams
    - **Property 9: Stream Sorting**
    - **Validates: Requirements 2.4**
    - Gerar arrays aleatórios de streams com campo num
    - Verificar que ordenação é sempre crescente por num
  
  - [ ]* 22.3 Escrever property test para filtragem de busca
    - **Property 19: Search Filtering**
    - **Validates: Requirements 8.2**
    - Gerar arrays aleatórios de nós e queries de busca
    - Verificar que apenas nós correspondentes são retornados
    - Verificar que nenhum nó não correspondente está nos resultados
  
  - [ ]* 22.4 Escrever property test para filtragem de streams por categoria
    - **Property 7: Stream Filtering**
    - **Validates: Requirements 2.2**
    - Gerar arrays aleatórios de streams com category_id
    - Verificar que apenas streams da categoria correta são retornados
  
  - [ ]* 22.5 Escrever property test para comportamento de cache
    - **Property 28: Cache Hit Behavior**
    - **Validates: Requirements 11.1, 11.2, 11.3**
    - Verificar que dados em cache são usados sem novas chamadas de API
    - Verificar que cache expira após TTL

- [ ]* 23. Escrever testes de integração
  - [ ]* 23.1 Escrever teste de fluxo completo do usuário
    - Selecionar configuração global
    - Carregar categorias de Live TV
    - Expandir categoria "Esportes"
    - Carregar canais da categoria
    - Clicar em canal
    - Verificar DetailPanel exibe informações
    - Copiar URL do stream
    - Verificar URL na área de transferência
  
  - [ ]* 23.2 Escrever teste de busca e filtro
    - Carregar árvore completa
    - Digitar query de busca
    - Verificar que apenas resultados correspondentes são exibidos
    - Verificar que categorias com resultados são expandidas automaticamente
    - Limpar busca
    - Verificar que árvore completa é restaurada

- [ ] 24. Otimizações de performance
  - [ ] 24.1 Adicionar React.memo em TreeNode
    - Evitar re-renders desnecessários de nós não alterados
    - _Requirements: 11.1_
  
  - [ ] 24.2 Implementar virtualização para árvores grandes (opcional)
    - Se árvore tiver >1000 nós, considerar react-window
    - Renderizar apenas nós visíveis no viewport
    - _Requirements: 11.1_

- [ ] 25. Adicionar acessibilidade
  - [ ] 25.1 Adicionar suporte a navegação por teclado
    - Tab para navegar entre nós
    - Enter para expandir/colapsar
    - Arrow keys para navegar na hierarquia
  
  - [ ] 25.2 Adicionar ARIA labels
    - aria-label em ícones e botões
    - aria-expanded em nós expansíveis
    - role="tree" e role="treeitem" apropriados

- [ ] 26. Documentação
  - [ ] 26.1 Atualizar API_ENDPOINTS.md
    - Documentar todos os novos endpoints `/api/iptv-tree/*`
    - Incluir exemplos de requisição e resposta
  
  - [ ] 26.2 Criar guia de uso (opcional)
    - Como acessar a funcionalidade
    - Como interpretar a árvore
    - Como usar busca e filtros

- [ ] 27. Checkpoint final - Garantir que tudo está funcionando
  - Executar todos os testes (unitários, propriedades, integração)
  - Testar manualmente todos os fluxos
  - Verificar performance e responsividade
  - Confirmar com usuário que implementação está completa

## Notes

- Tasks marcadas com `*` são opcionais e podem ser puladas para MVP mais rápido
- Cada task referencia os requirements específicos que valida
- Checkpoints garantem validação incremental e oportunidade para feedback
- Property tests validam propriedades universais através de múltiplas entradas geradas
- Unit tests validam casos específicos e edge cases
- A implementação segue padrão MVC usado no resto do projeto MaxxControl
- Backend usa Node.js/Express com cache em memória
- Frontend usa React 18 com Hooks e TailwindCSS
- Todos os endpoints requerem autenticação JWT (middleware já existente)
- Cache tem TTLs diferentes: 5min (categorias), 10min (streams), 15min (séries)
- Lazy loading garante que dados são carregados apenas quando necessário
- Debounce de 300ms na busca evita filtros excessivos
