# Requirements Document

## Introduction

Este documento define os requisitos para a funcionalidade de visualização da estrutura hierárquica (árvore) das listas IPTV do servidor Xtream Codes no painel MaxxControl. A funcionalidade permitirá aos administradores visualizar e navegar pela estrutura completa de categorias, canais, filmes e séries disponíveis no servidor IPTV configurado, facilitando o entendimento da organização do conteúdo e auxiliando na configuração e troubleshooting.

## Glossary

- **Xtream_Codes**: Protocolo e API padrão para servidores IPTV que fornece streams de TV ao vivo, filmes e séries
- **IPTV_Tree_Viewer**: Componente do painel MaxxControl que exibe a estrutura hierárquica do servidor Xtream Codes
- **Category**: Agrupamento lógico de conteúdo no servidor Xtream (ex: "Esportes", "Filmes", "Séries")
- **Stream**: Conteúdo individual (canal de TV, filme ou série) disponível no servidor IPTV
- **Parent_Category**: Categoria que contém subcategorias (parent_id = 0 para categorias raiz)
- **Tree_Node**: Elemento individual na árvore (pode ser categoria ou stream)
- **Xtream_API**: API REST do servidor Xtream Codes acessada via player_api.php
- **Admin_Panel**: Interface web do MaxxControl acessada por administradores autenticados
- **Connection_Config**: Credenciais do servidor Xtream (URL, username, password)

## Requirements

### Requirement 1: Buscar Estrutura de Categorias Live TV

**User Story:** Como administrador, quero visualizar todas as categorias de TV ao vivo do servidor Xtream, para que eu possa entender a organização dos canais disponíveis.

#### Acceptance Criteria

1. WHEN o administrador acessa a página IPTV Tree Viewer, THE IPTV_Tree_Viewer SHALL buscar as categorias via endpoint `get_live_categories` da Xtream_API
2. THE IPTV_Tree_Viewer SHALL usar as credenciais da Connection_Config global ou de um dispositivo específico selecionado
3. WHEN a Xtream_API retorna categorias, THE IPTV_Tree_Viewer SHALL armazenar category_id, category_name e parent_id de cada Category
4. IF a conexão com Xtream_API falhar, THEN THE IPTV_Tree_Viewer SHALL exibir mensagem de erro descritiva
5. THE IPTV_Tree_Viewer SHALL construir hierarquia identificando Parent_Category (parent_id = 0) e subcategorias

### Requirement 2: Buscar Canais por Categoria

**User Story:** Como administrador, quero visualizar os canais dentro de cada categoria, para que eu possa verificar o conteúdo disponível.

#### Acceptance Criteria

1. WHEN o administrador expande uma Category de live TV, THE IPTV_Tree_Viewer SHALL buscar streams via endpoint `get_live_streams` da Xtream_API
2. THE IPTV_Tree_Viewer SHALL filtrar streams pelo category_id da Category expandida
3. FOR EACH stream retornado, THE IPTV_Tree_Viewer SHALL exibir stream_id, name e num (número do canal)
4. THE IPTV_Tree_Viewer SHALL ordenar streams por num em ordem crescente quando disponível
5. WHEN uma Category não possui streams, THE IPTV_Tree_Viewer SHALL exibir indicação visual de categoria vazia

### Requirement 3: Buscar Estrutura de Filmes (VOD)

**User Story:** Como administrador, quero visualizar as categorias de filmes do servidor Xtream, para que eu possa entender a organização do conteúdo VOD.

#### Acceptance Criteria

1. THE IPTV_Tree_Viewer SHALL buscar categorias de filmes via endpoint `get_vod_categories` da Xtream_API
2. THE IPTV_Tree_Viewer SHALL exibir categorias de filmes em seção separada das categorias de live TV
3. WHEN o administrador expande uma categoria de filme, THE IPTV_Tree_Viewer SHALL buscar filmes via endpoint `get_vod_streams`
4. FOR EACH filme, THE IPTV_Tree_Viewer SHALL exibir stream_id, name e container_extension
5. THE IPTV_Tree_Viewer SHALL construir hierarquia de categorias de filmes usando parent_id

### Requirement 4: Buscar Estrutura de Séries

**User Story:** Como administrador, quero visualizar as séries disponíveis com suas temporadas e episódios, para que eu possa verificar o catálogo completo.

#### Acceptance Criteria

1. THE IPTV_Tree_Viewer SHALL buscar categorias de séries via endpoint `get_series_categories` da Xtream_API
2. WHEN o administrador expande uma categoria de série, THE IPTV_Tree_Viewer SHALL buscar séries via endpoint `get_series`
3. WHEN o administrador expande uma série, THE IPTV_Tree_Viewer SHALL buscar detalhes via endpoint `get_series_info` incluindo temporadas e episódios
4. FOR EACH temporada, THE IPTV_Tree_Viewer SHALL exibir season_number e lista de episódios
5. FOR EACH episódio, THE IPTV_Tree_Viewer SHALL exibir episode_num, title e container_extension

### Requirement 5: Interface de Árvore Interativa

**User Story:** Como administrador, quero navegar pela estrutura em formato de árvore expansível, para que eu possa explorar o conteúdo de forma intuitiva.

#### Acceptance Criteria

1. THE IPTV_Tree_Viewer SHALL exibir Tree_Node em formato hierárquico com indentação visual
2. WHEN um Tree_Node possui filhos, THE IPTV_Tree_Viewer SHALL exibir ícone de expansão (seta ou +/-)
3. WHEN o administrador clica em Tree_Node expansível, THE IPTV_Tree_Viewer SHALL alternar entre estado expandido e colapsado
4. THE IPTV_Tree_Viewer SHALL carregar dados dos filhos apenas quando Tree_Node for expandido pela primeira vez (lazy loading)
5. THE IPTV_Tree_Viewer SHALL manter estado de expansão durante navegação na mesma sessão

### Requirement 6: Seleção de Fonte de Configuração

**User Story:** Como administrador, quero escolher entre visualizar a árvore da configuração global ou de um dispositivo específico, para que eu possa verificar diferentes servidores IPTV.

#### Acceptance Criteria

1. THE IPTV_Tree_Viewer SHALL exibir dropdown para selecionar entre "Configuração Global" e dispositivos cadastrados
2. WHEN o administrador seleciona "Configuração Global", THE IPTV_Tree_Viewer SHALL usar credenciais da tabela iptv_server_config
3. WHEN o administrador seleciona um dispositivo, THE IPTV_Tree_Viewer SHALL usar credenciais da tabela device_iptv_config para aquele dispositivo
4. IF o dispositivo selecionado não possui configuração específica, THEN THE IPTV_Tree_Viewer SHALL usar configuração global como fallback
5. WHEN a fonte de configuração é alterada, THE IPTV_Tree_Viewer SHALL limpar árvore atual e recarregar dados

### Requirement 7: Indicadores Visuais de Tipo de Conteúdo

**User Story:** Como administrador, quero identificar visualmente o tipo de cada item na árvore, para que eu possa distinguir rapidamente categorias, canais, filmes e séries.

#### Acceptance Criteria

1. THE IPTV_Tree_Viewer SHALL exibir ícone de TV para categorias e streams de live TV
2. THE IPTV_Tree_Viewer SHALL exibir ícone de filme para categorias e streams de VOD
3. THE IPTV_Tree_Viewer SHALL exibir ícone de série para categorias, séries, temporadas e episódios
4. THE IPTV_Tree_Viewer SHALL usar cores diferentes para distinguir categorias (azul) de conteúdo (cinza)
5. THE IPTV_Tree_Viewer SHALL exibir badge com contagem de itens ao lado de categorias

### Requirement 8: Busca e Filtro na Árvore

**User Story:** Como administrador, quero buscar por nome de categoria ou conteúdo, para que eu possa encontrar rapidamente itens específicos.

#### Acceptance Criteria

1. THE IPTV_Tree_Viewer SHALL exibir campo de busca no topo da interface
2. WHEN o administrador digita no campo de busca, THE IPTV_Tree_Viewer SHALL filtrar Tree_Node cujo nome contenha o texto digitado (case-insensitive)
3. THE IPTV_Tree_Viewer SHALL expandir automaticamente categorias que contêm resultados da busca
4. THE IPTV_Tree_Viewer SHALL destacar visualmente o texto correspondente nos resultados
5. WHEN o campo de busca é limpo, THE IPTV_Tree_Viewer SHALL restaurar visualização completa da árvore

### Requirement 9: Informações Detalhadas de Streams

**User Story:** Como administrador, quero visualizar informações detalhadas de um stream ao selecioná-lo, para que eu possa verificar metadados e URLs.

#### Acceptance Criteria

1. WHEN o administrador clica em um Stream, THE IPTV_Tree_Viewer SHALL exibir painel lateral com detalhes
2. THE IPTV_Tree_Viewer SHALL exibir stream_id, name, category_id, stream_type e container_extension
3. WHERE o stream é de live TV, THE IPTV_Tree_Viewer SHALL exibir num (número do canal) e epg_channel_id
4. THE IPTV_Tree_Viewer SHALL exibir URL completo do stream formatado conforme protocolo Xtream
5. THE IPTV_Tree_Viewer SHALL permitir copiar URL do stream para área de transferência

### Requirement 10: Tratamento de Erros e Estados de Carregamento

**User Story:** Como administrador, quero feedback visual durante carregamento e em caso de erros, para que eu entenda o estado da aplicação.

#### Acceptance Criteria

1. WHILE dados estão sendo carregados da Xtream_API, THE IPTV_Tree_Viewer SHALL exibir indicador de carregamento (spinner)
2. IF a Xtream_API retorna erro 401 ou 403, THEN THE IPTV_Tree_Viewer SHALL exibir mensagem "Credenciais inválidas"
3. IF a Xtream_API não responde em 10 segundos, THEN THE IPTV_Tree_Viewer SHALL exibir mensagem "Timeout na conexão"
4. IF a Connection_Config não está configurada, THEN THE IPTV_Tree_Viewer SHALL exibir mensagem "Configure servidor IPTV primeiro"
5. THE IPTV_Tree_Viewer SHALL permitir tentar novamente após erro sem recarregar página

### Requirement 11: Performance e Cache

**User Story:** Como administrador, quero que a árvore carregue rapidamente, para que eu possa navegar de forma eficiente.

#### Acceptance Criteria

1. THE IPTV_Tree_Viewer SHALL cachear categorias carregadas em memória durante sessão
2. THE IPTV_Tree_Viewer SHALL cachear streams de categorias já expandidas
3. WHEN o administrador reexpande uma Category, THE IPTV_Tree_Viewer SHALL usar dados do cache se disponíveis
4. THE IPTV_Tree_Viewer SHALL exibir botão "Atualizar" para limpar cache e recarregar dados
5. THE IPTV_Tree_Viewer SHALL implementar debounce de 300ms no campo de busca

### Requirement 12: Integração com Backend MaxxControl

**User Story:** Como desenvolvedor, quero que o frontend consuma endpoints do backend MaxxControl, para que a autenticação e configuração sejam centralizadas.

#### Acceptance Criteria

1. THE IPTV_Tree_Viewer SHALL consumir endpoint `/api/iptv-server/config` para obter Connection_Config global
2. THE IPTV_Tree_Viewer SHALL consumir endpoint `/api/iptv-server/device/:deviceId` para obter configuração de dispositivo
3. THE IPTV_Tree_Viewer SHALL enviar requisições à Xtream_API através de proxy no backend para evitar CORS
4. THE Backend SHALL criar endpoint `/api/iptv-tree/categories` que proxy requisições para Xtream_API
5. THE Backend SHALL criar endpoint `/api/iptv-tree/streams` que proxy requisições para Xtream_API com cache opcional

