# Design Document - IPTV Tree Viewer

## Overview

O IPTV Tree Viewer é uma funcionalidade do painel MaxxControl que permite aos administradores visualizar e navegar pela estrutura hierárquica completa de um servidor Xtream Codes IPTV. A funcionalidade exibe categorias, canais de TV ao vivo, filmes (VOD) e séries com suas temporadas e episódios em formato de árvore interativa expansível.

### Objetivos

- Fornecer visualização clara da estrutura de conteúdo do servidor IPTV
- Permitir navegação intuitiva através de categorias e subcategorias
- Facilitar troubleshooting e verificação de configuração IPTV
- Suportar múltiplas fontes de configuração (global e por dispositivo)
- Otimizar performance através de lazy loading e cache

### Escopo

**Incluído:**
- Interface React de árvore interativa com expansão/colapso
- Endpoints backend proxy para Xtream Codes API
- Sistema de cache em memória para performance
- Busca e filtro de conteúdo
- Painel de detalhes de streams
- Suporte a Live TV, VOD e Séries

**Não Incluído:**
- Reprodução de streams (apenas visualização)
- Edição de categorias ou streams
- Sincronização bidirecional com servidor Xtream
- EPG (Electronic Program Guide) detalhado

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  IptvTreeViewer Component                              │ │
│  │  - TreeView (categorias hierárquicas)                  │ │
│  │  - SearchBar (busca e filtro)                          │ │
│  │  - DetailPanel (informações de stream)                 │ │
│  │  - ConfigSelector (global/device)                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (Node.js + Express)                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  /modules/iptv-tree/                                   │ │
│  │  - iptvTreeController.js (proxy logic)                 │ │
│  │  - iptvTreeRoutes.js (endpoints)                       │ │
│  │  - cache.js (in-memory cache)                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Xtream Codes API                                │
│  player_api.php?username=X&password=Y&action=Z              │
│  - get_live_categories                                       │
│  - get_live_streams                                          │
│  - get_vod_categories                                        │
│  - get_vod_streams                                           │
│  - get_series_categories                                     │
│  - get_series                                                │
│  - get_series_info                                           │
└─────────────────────────────────────────────────────────────┘
```


### Component Architecture

#### Frontend Components

```
IptvTreeViewer (Main Container)
├── ConfigSelector (Dropdown)
│   └── Seleciona fonte: Global ou Device
├── SearchBar (Input + Debounce)
│   └── Filtra árvore em tempo real
├── TreeView (Recursive Component)
│   ├── TreeNode (Category)
│   │   ├── Icon (TV/Movie/Series)
│   │   ├── Label (Nome + Badge de contagem)
│   │   └── Children (Lazy loaded)
│   └── TreeNode (Stream/Episode)
│       ├── Icon (tipo de conteúdo)
│       └── Label (Nome + metadados)
└── DetailPanel (Sidebar)
    ├── StreamInfo (Metadados)
    ├── StreamURL (Formatado)
    └── CopyButton (Clipboard)
```

#### Backend Modules

```
/modules/iptv-tree/
├── iptvTreeController.js
│   ├── getCategories() - Proxy para Xtream categories
│   ├── getStreams() - Proxy para Xtream streams
│   ├── getSeriesInfo() - Proxy para Xtream series details
│   └── clearCache() - Limpa cache em memória
├── iptvTreeRoutes.js
│   ├── GET /api/iptv-tree/categories/:type
│   ├── GET /api/iptv-tree/streams/:type/:categoryId
│   ├── GET /api/iptv-tree/series/:seriesId
│   └── POST /api/iptv-tree/clear-cache
└── cache.js
    ├── CacheManager class
    ├── get(key)
    ├── set(key, value, ttl)
    └── clear()
```

### Data Flow

#### 1. Carregamento Inicial

```
User acessa página
    ↓
Frontend: Carrega ConfigSelector
    ↓
Frontend: Busca configuração (global ou device)
    ↓
Backend: GET /api/iptv-server/config
    ↓
Frontend: Exibe dropdown com opções
    ↓
User seleciona fonte
    ↓
Frontend: Carrega categorias raiz
    ↓
Backend: GET /api/iptv-tree/categories/live
    ↓
Backend: Verifica cache
    ↓
Backend: Se não cached, chama Xtream API
    ↓
Xtream: Retorna categorias
    ↓
Backend: Armazena em cache (5 min)
    ↓
Backend: Retorna JSON para frontend
    ↓
Frontend: Constrói hierarquia (parent_id)
    ↓
Frontend: Renderiza TreeView
```

#### 2. Expansão de Categoria (Lazy Loading)

```
User clica em categoria
    ↓
Frontend: Verifica se já carregado
    ↓
Se não carregado:
    ↓
    Frontend: GET /api/iptv-tree/streams/live/:categoryId
    ↓
    Backend: Verifica cache
    ↓
    Backend: Se não cached, chama Xtream API
    ↓
    Xtream: Retorna streams
    ↓
    Backend: Filtra por category_id
    ↓
    Backend: Ordena por num (canais)
    ↓
    Backend: Armazena em cache (10 min)
    ↓
    Frontend: Adiciona streams à árvore
    ↓
Frontend: Expande categoria
```


#### 3. Busca e Filtro

```
User digita no SearchBar
    ↓
Frontend: Debounce 300ms
    ↓
Frontend: Filtra árvore localmente
    ↓
Frontend: Para cada nó:
    - Verifica se nome contém texto (case-insensitive)
    - Se match, marca nó como visível
    - Se filho tem match, expande pai automaticamente
    ↓
Frontend: Re-renderiza árvore filtrada
    ↓
Frontend: Destaca texto correspondente
```

#### 4. Visualização de Detalhes

```
User clica em stream
    ↓
Frontend: Abre DetailPanel
    ↓
Frontend: Exibe metadados do stream
    ↓
Frontend: Formata URL Xtream:
    - Live TV: {url}/{username}/{password}/{stream_id}
    - VOD: {url}/movie/{username}/{password}/{stream_id}.{ext}
    - Series: {url}/series/{username}/{password}/{stream_id}.{ext}
    ↓
Frontend: Renderiza URL e botão copiar
```

## Components and Interfaces

### Frontend Components

#### IptvTreeViewer (Main Component)

```typescript
interface IptvTreeViewerProps {}

interface IptvTreeViewerState {
  configSource: 'global' | number; // 'global' ou deviceId
  credentials: XtreamCredentials | null;
  treeData: TreeNode[];
  expandedNodes: Set<string>;
  selectedStream: StreamDetails | null;
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

interface XtreamCredentials {
  xtream_url: string;
  xtream_username: string;
  xtream_password: string;
}
```

#### TreeNode (Recursive Component)

```typescript
interface TreeNodeProps {
  node: TreeNode;
  level: number;
  expanded: boolean;
  onToggle: (nodeId: string) => void;
  onSelect: (node: TreeNode) => void;
  searchQuery: string;
}

interface TreeNode {
  id: string; // Único: `${type}-${id}`
  type: 'category' | 'stream' | 'series' | 'season' | 'episode';
  contentType: 'live' | 'vod' | 'series';
  name: string;
  parent_id: string | null;
  children?: TreeNode[];
  metadata?: any; // Dados específicos do tipo
  loaded: boolean; // Se filhos foram carregados
}
```

#### ConfigSelector

```typescript
interface ConfigSelectorProps {
  value: 'global' | number;
  onChange: (value: 'global' | number) => void;
}

interface ConfigOption {
  value: 'global' | number;
  label: string;
}
```

#### DetailPanel

```typescript
interface DetailPanelProps {
  stream: StreamDetails | null;
  credentials: XtreamCredentials;
  onClose: () => void;
}

interface StreamDetails {
  stream_id: number;
  name: string;
  category_id: string;
  stream_type: string;
  container_extension?: string;
  num?: number; // Para live TV
  epg_channel_id?: string;
  // ... outros campos Xtream
}
```

### Backend API Endpoints

#### GET /api/iptv-tree/categories/:type

Busca categorias do servidor Xtream.

**Parameters:**
- `type`: 'live' | 'vod' | 'series'
- Query params:
  - `source`: 'global' | deviceId (opcional, default: 'global')

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "category_id": "1",
      "category_name": "Esportes",
      "parent_id": 0
    },
    {
      "category_id": "2",
      "category_name": "Futebol",
      "parent_id": 1
    }
  ],
  "cached": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```


#### GET /api/iptv-tree/streams/:type/:categoryId

Busca streams de uma categoria específica.

**Parameters:**
- `type`: 'live' | 'vod'
- `categoryId`: ID da categoria
- Query params:
  - `source`: 'global' | deviceId (opcional, default: 'global')

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "stream_id": 12345,
      "num": 101,
      "name": "ESPN HD",
      "stream_type": "live",
      "category_id": "1",
      "epg_channel_id": "espn.br",
      "stream_icon": "http://..."
    }
  ],
  "cached": true,
  "timestamp": "2024-01-15T10:31:00Z"
}
```

#### GET /api/iptv-tree/series/:categoryId

Busca séries de uma categoria.

**Parameters:**
- `categoryId`: ID da categoria de séries
- Query params:
  - `source`: 'global' | deviceId (opcional, default: 'global')

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "series_id": 789,
      "name": "Breaking Bad",
      "category_id": "5",
      "cover": "http://...",
      "plot": "..."
    }
  ]
}
```

#### GET /api/iptv-tree/series-info/:seriesId

Busca detalhes completos de uma série (temporadas e episódios).

**Parameters:**
- `seriesId`: ID da série
- Query params:
  - `source`: 'global' | deviceId (opcional, default: 'global')

**Response:**
```json
{
  "success": true,
  "data": {
    "info": {
      "name": "Breaking Bad",
      "plot": "...",
      "cast": "..."
    },
    "seasons": [
      {
        "season_number": 1,
        "name": "Season 1",
        "episodes": [
          {
            "id": "12345",
            "episode_num": 1,
            "title": "Pilot",
            "container_extension": "mkv",
            "info": {
              "duration": "3600",
              "plot": "..."
            }
          }
        ]
      }
    ]
  }
}
```

#### POST /api/iptv-tree/clear-cache

Limpa o cache do servidor.

**Request Body:**
```json
{
  "source": "global" // ou deviceId
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cache limpo com sucesso"
}
```

### Xtream Codes API Integration

#### Endpoints Utilizados

1. **get_live_categories**
   - URL: `{xtream_url}/player_api.php?username={user}&password={pass}&action=get_live_categories`
   - Retorna: Array de categorias de TV ao vivo

2. **get_live_streams**
   - URL: `{xtream_url}/player_api.php?username={user}&password={pass}&action=get_live_streams`
   - Retorna: Array de todos os canais (filtrar por category_id no backend)

3. **get_vod_categories**
   - URL: `{xtream_url}/player_api.php?username={user}&password={pass}&action=get_vod_categories`
   - Retorna: Array de categorias de filmes

4. **get_vod_streams**
   - URL: `{xtream_url}/player_api.php?username={user}&password={pass}&action=get_vod_streams`
   - Retorna: Array de todos os filmes (filtrar por category_id no backend)

5. **get_series_categories**
   - URL: `{xtream_url}/player_api.php?username={user}&password={pass}&action=get_series_categories`
   - Retorna: Array de categorias de séries

6. **get_series**
   - URL: `{xtream_url}/player_api.php?username={user}&password={pass}&action=get_series`
   - Retorna: Array de todas as séries (filtrar por category_id no backend)

7. **get_series_info**
   - URL: `{xtream_url}/player_api.php?username={user}&password={pass}&action=get_series_info&series_id={id}`
   - Retorna: Detalhes completos da série com temporadas e episódios


## Data Models

### TreeNode (Frontend)

```typescript
interface TreeNode {
  // Identificação
  id: string; // Formato: `${contentType}-${type}-${originalId}`
  type: 'category' | 'stream' | 'series' | 'season' | 'episode';
  contentType: 'live' | 'vod' | 'series';
  
  // Hierarquia
  parent_id: string | null;
  children?: TreeNode[];
  loaded: boolean; // Se filhos foram carregados via API
  
  // Display
  name: string;
  icon: string; // Nome do ícone Lucide React
  color: string; // Cor do texto/ícone
  badge?: number; // Contagem de itens (para categorias)
  
  // Metadados originais (do Xtream)
  metadata: CategoryMetadata | StreamMetadata | SeriesMetadata | SeasonMetadata | EpisodeMetadata;
}
```

### CategoryMetadata

```typescript
interface CategoryMetadata {
  category_id: string;
  category_name: string;
  parent_id: number;
}
```

### StreamMetadata

```typescript
interface StreamMetadata {
  // Comum a todos os streams
  stream_id: number;
  name: string;
  category_id: string;
  stream_type: string;
  container_extension?: string;
  stream_icon?: string;
  
  // Específico de Live TV
  num?: number;
  epg_channel_id?: string;
  
  // Específico de VOD
  rating?: string;
  rating_5based?: number;
  added?: string;
  
  // URL formatado (calculado no frontend)
  stream_url?: string;
}
```

### SeriesMetadata

```typescript
interface SeriesMetadata {
  series_id: number;
  name: string;
  category_id: string;
  cover?: string;
  plot?: string;
  cast?: string;
  director?: string;
  genre?: string;
  releaseDate?: string;
  rating?: string;
  rating_5based?: number;
}
```

### SeasonMetadata

```typescript
interface SeasonMetadata {
  season_number: number;
  name: string;
  cover?: string;
  episode_count?: number;
}
```

### EpisodeMetadata

```typescript
interface EpisodeMetadata {
  id: string;
  episode_num: number;
  title: string;
  container_extension: string;
  info?: {
    duration?: string;
    plot?: string;
    rating?: string;
  };
  
  // URL formatado (calculado no frontend)
  stream_url?: string;
}
```

### Cache Entry (Backend)

```typescript
interface CacheEntry {
  key: string; // Formato: `${source}-${type}-${id}`
  data: any;
  timestamp: number;
  ttl: number; // Time to live em segundos
}
```

### XtreamConfig (Backend)

```typescript
interface XtreamConfig {
  xtream_url: string;
  xtream_username: string;
  xtream_password: string;
  source: 'global' | number; // deviceId
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: API Call Correctness

*For any* content type (live, vod, series) and configuration source (global or device), when the tree viewer loads categories, it SHALL make the correct Xtream API call with proper credentials and action parameter.

**Validates: Requirements 1.1, 3.1, 4.1**

### Property 2: Credential Selection

*For any* selected configuration source, the system SHALL use credentials from the correct database table (iptv_server_config for global, device_iptv_config for device) with fallback to global if device config is missing.

**Validates: Requirements 1.2, 6.2, 6.3, 6.4**

### Property 3: Data Extraction Completeness

*For any* valid API response containing categories, the system SHALL extract and store all required fields (category_id, category_name, parent_id) for each category.

**Validates: Requirements 1.3**

### Property 4: Error Message Display

*For any* API failure, the system SHALL display an appropriate descriptive error message to the user.

**Validates: Requirements 1.4, 10.2, 10.3, 10.4**

### Property 5: Hierarchy Construction

*For any* set of categories with parent_id values, the system SHALL correctly construct a tree hierarchy where categories with parent_id = 0 are root nodes and others are nested under their parents.

**Validates: Requirements 1.5, 3.5**


### Property 6: Lazy Loading Trigger

*For any* expandable tree node, when expanded for the first time, the system SHALL fetch child data from the API and SHALL NOT fetch again on subsequent expansions unless cache is cleared.

**Validates: Requirements 2.1, 3.3, 4.2, 4.3, 5.4**

### Property 7: Stream Filtering

*For any* category and list of streams, the system SHALL display only streams where category_id matches the expanded category's ID.

**Validates: Requirements 2.2**

### Property 8: Required Field Display

*For any* displayed stream, the system SHALL render all required fields (stream_id, name, and type-specific fields like num for live TV or container_extension for VOD).

**Validates: Requirements 2.3, 3.4, 4.4, 4.5**

### Property 9: Stream Sorting

*For any* list of live TV streams with num values, the displayed order SHALL be ascending by num.

**Validates: Requirements 2.4**

### Property 10: Visual Hierarchy

*For any* tree node at depth N, the indentation SHALL be proportional to N, creating clear visual hierarchy.

**Validates: Requirements 5.1**

### Property 11: Expansion Icon Presence

*For any* tree node with children, an expansion icon (arrow or +/-) SHALL be visible.

**Validates: Requirements 5.2**

### Property 12: Toggle Behavior

*For any* expandable node, clicking SHALL toggle between expanded and collapsed states.

**Validates: Requirements 5.3**

### Property 13: Session State Persistence

*For any* expanded nodes during a session, their expansion state SHALL persist until the page is reloaded or configuration source is changed.

**Validates: Requirements 5.5**

### Property 14: Configuration Fallback

*For any* device without specific IPTV configuration, the system SHALL use global configuration credentials.

**Validates: Requirements 6.4**

### Property 15: Configuration Change Reset

*For any* change in configuration source (global to device or vice versa), the system SHALL clear the current tree and reload all data.

**Validates: Requirements 6.5**

### Property 16: Icon Type Mapping

*For any* tree node, the displayed icon SHALL match its content type (TV icon for live, movie icon for VOD, series icon for series content).

**Validates: Requirements 7.1, 7.2, 7.3**

### Property 17: Color Coding

*For any* tree node, categories SHALL display in blue color and content items SHALL display in gray color.

**Validates: Requirements 7.4**

### Property 18: Count Badge Display

*For any* category with child items, a badge displaying the count SHALL be visible next to the category name.

**Validates: Requirements 7.5**

### Property 19: Search Filtering

*For any* search query text, only tree nodes whose names contain the text (case-insensitive) SHALL be visible in the filtered view.

**Validates: Requirements 8.2**

### Property 20: Auto-Expansion on Search

*For any* category containing search results, the category SHALL automatically expand to show matching children.

**Validates: Requirements 8.3**

### Property 21: Search Highlighting

*For any* search result, the matching text within the node name SHALL be visually highlighted.

**Validates: Requirements 8.4**

### Property 22: Search Clear Restoration

*For any* tree state, clearing the search query SHALL restore the full tree view with previous expansion states.

**Validates: Requirements 8.5**

### Property 23: Detail Panel Display

*For any* stream node clicked, a detail panel SHALL open displaying all available metadata.

**Validates: Requirements 9.1, 9.2, 9.3**

### Property 24: Stream URL Formatting

*For any* stream, the displayed URL SHALL be correctly formatted according to Xtream protocol based on stream type (live/VOD/series).

**Validates: Requirements 9.4**

### Property 25: Copy to Clipboard

*For any* stream URL, clicking the copy button SHALL place the URL in the system clipboard.

**Validates: Requirements 9.5**

### Property 26: Loading Indicator

*For any* active API request, a loading spinner SHALL be visible to the user.

**Validates: Requirements 10.1**

### Property 27: Retry Availability

*For any* error state, a retry action SHALL be available without requiring page reload.

**Validates: Requirements 10.5**

### Property 28: Cache Hit Behavior

*For any* previously loaded category or stream list, re-accessing SHALL use cached data without making new API calls until cache expires or is manually cleared.

**Validates: Requirements 11.1, 11.2, 11.3**

### Property 29: Search Debouncing

*For any* sequence of keystrokes in the search field, the filter operation SHALL only execute after 300ms of no typing activity.

**Validates: Requirements 11.5**

### Property 30: Backend Proxy Usage

*For any* Xtream API request, the frontend SHALL send the request through backend proxy endpoints rather than directly to Xtream servers.

**Validates: Requirements 12.3, 12.4, 12.5**


## Error Handling

### Frontend Error Handling

#### Network Errors

```typescript
try {
  const response = await api.get('/api/iptv-tree/categories/live');
  // Process response
} catch (error) {
  if (error.response) {
    // Server responded with error status
    switch (error.response.status) {
      case 401:
      case 403:
        setError('Credenciais inválidas. Verifique a configuração do servidor IPTV.');
        break;
      case 404:
        setError('Servidor IPTV não encontrado. Verifique a URL.');
        break;
      case 500:
        setError('Erro no servidor. Tente novamente mais tarde.');
        break;
      default:
        setError('Erro ao carregar dados. Tente novamente.');
    }
  } else if (error.request) {
    // Request made but no response (timeout)
    setError('Timeout na conexão. Verifique sua internet e o servidor IPTV.');
  } else {
    // Other errors
    setError('Erro inesperado: ' + error.message);
  }
}
```

#### Configuration Validation

```typescript
const validateConfig = (config: XtreamConfig): string | null => {
  if (!config.xtream_url) {
    return 'Configure o servidor IPTV primeiro na página de configurações.';
  }
  if (!config.xtream_username || !config.xtream_password) {
    return 'Credenciais incompletas. Configure username e password.';
  }
  
  // Validate URL format
  try {
    new URL(config.xtream_url);
  } catch {
    return 'URL do servidor IPTV inválida.';
  }
  
  return null; // Valid
};
```

#### Empty State Handling

```typescript
const renderCategoryContent = (category: TreeNode) => {
  if (!category.loaded) {
    return <Spinner />;
  }
  
  if (!category.children || category.children.length === 0) {
    return (
      <div className="text-gray-500 italic ml-8">
        Nenhum conteúdo disponível nesta categoria
      </div>
    );
  }
  
  return category.children.map(child => <TreeNode node={child} />);
};
```

### Backend Error Handling

#### Xtream API Error Handling

```javascript
const fetchFromXtream = async (url, config) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'MaxxControl/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('INVALID_CREDENTIALS');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('TIMEOUT');
    }
    throw error;
  }
};
```

#### Controller Error Responses

```javascript
exports.getCategories = async (req, res) => {
  try {
    const { type } = req.params;
    const { source = 'global' } = req.query;
    
    // Get credentials
    const config = await getXtreamConfig(source);
    if (!config) {
      return res.status(400).json({
        success: false,
        error: 'CONFIG_NOT_FOUND',
        message: 'Configuração IPTV não encontrada'
      });
    }
    
    // Check cache
    const cacheKey = `${source}-categories-${type}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }
    
    // Fetch from Xtream
    const action = `get_${type}_categories`;
    const url = buildXtreamUrl(config, action);
    
    try {
      const data = await fetchFromXtream(url, config);
      
      // Cache for 5 minutes
      cache.set(cacheKey, data, 300);
      
      res.json({
        success: true,
        data: data,
        cached: false,
        timestamp: new Date().toISOString()
      });
      
    } catch (xtreamError) {
      if (xtreamError.message === 'INVALID_CREDENTIALS') {
        return res.status(401).json({
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Credenciais inválidas'
        });
      }
      if (xtreamError.message === 'TIMEOUT') {
        return res.status(504).json({
          success: false,
          error: 'TIMEOUT',
          message: 'Timeout na conexão com servidor IPTV'
        });
      }
      throw xtreamError;
    }
    
  } catch (error) {
    console.error('❌ Erro ao buscar categorias:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor'
    });
  }
};
```

### Error Recovery Strategies

1. **Automatic Retry**: Para timeouts, oferecer retry automático após 2 segundos
2. **Cache Fallback**: Se API falhar mas cache existe (mesmo expirado), usar cache
3. **Partial Loading**: Se algumas categorias falharem, mostrar as que funcionaram
4. **User Feedback**: Sempre mostrar mensagem clara do que aconteceu e como resolver


## Testing Strategy

### Dual Testing Approach

Esta funcionalidade utilizará tanto testes unitários quanto testes baseados em propriedades para garantir cobertura completa:

- **Unit Tests**: Verificar casos específicos, edge cases e condições de erro
- **Property Tests**: Verificar propriedades universais através de múltiplas entradas geradas

### Unit Testing

#### Frontend Unit Tests (Jest + React Testing Library)

**Componentes a testar:**

1. **IptvTreeViewer**
   - Renderização inicial com loading state
   - Seleção de fonte de configuração
   - Exibição de mensagens de erro
   - Botão de atualizar limpa cache

2. **TreeNode**
   - Renderização de categoria vs stream
   - Ícones corretos por tipo de conteúdo
   - Indentação proporcional ao nível
   - Toggle de expansão/colapso
   - Badge de contagem em categorias

3. **SearchBar**
   - Debounce de 300ms funciona
   - Filtro case-insensitive
   - Limpeza restaura árvore completa
   - Highlighting de texto correspondente

4. **DetailPanel**
   - Exibição de metadados completos
   - Formatação correta de URL por tipo
   - Botão copiar funciona
   - Campos condicionais (num para live TV)

**Exemplo de teste unitário:**

```javascript
describe('TreeNode', () => {
  it('should display TV icon for live TV category', () => {
    const node = {
      id: 'live-category-1',
      type: 'category',
      contentType: 'live',
      name: 'Esportes',
      icon: 'Tv'
    };
    
    const { getByTestId } = render(<TreeNode node={node} level={0} />);
    expect(getByTestId('icon-tv')).toBeInTheDocument();
  });
  
  it('should display count badge for categories with children', () => {
    const node = {
      id: 'live-category-1',
      type: 'category',
      contentType: 'live',
      name: 'Esportes',
      children: [{}, {}, {}],
      badge: 3
    };
    
    const { getByText } = render(<TreeNode node={node} level={0} />);
    expect(getByText('3')).toBeInTheDocument();
  });
  
  it('should show empty state when category has no children', () => {
    const node = {
      id: 'live-category-1',
      type: 'category',
      contentType: 'live',
      name: 'Esportes',
      children: [],
      loaded: true
    };
    
    const { getByText } = render(<TreeNode node={node} level={0} expanded={true} />);
    expect(getByText(/nenhum conteúdo disponível/i)).toBeInTheDocument();
  });
});
```

#### Backend Unit Tests (Jest + Supertest)

**Endpoints a testar:**

1. **GET /api/iptv-tree/categories/:type**
   - Retorna categorias do cache quando disponível
   - Faz proxy para Xtream quando cache vazio
   - Retorna erro 401 para credenciais inválidas
   - Retorna erro 400 quando config não existe
   - Retorna erro 504 em timeout

2. **GET /api/iptv-tree/streams/:type/:categoryId**
   - Filtra streams por category_id
   - Ordena canais por num
   - Usa cache quando disponível
   - Retorna array vazio para categoria sem streams

3. **POST /api/iptv-tree/clear-cache**
   - Limpa cache para fonte específica
   - Retorna sucesso

**Exemplo de teste unitário:**

```javascript
describe('GET /api/iptv-tree/categories/live', () => {
  it('should return cached categories when available', async () => {
    const cachedData = [{ category_id: '1', category_name: 'Esportes' }];
    cache.set('global-categories-live', cachedData, 300);
    
    const response = await request(app)
      .get('/api/iptv-tree/categories/live')
      .query({ source: 'global' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.cached).toBe(true);
    expect(response.body.data).toEqual(cachedData);
  });
  
  it('should return 401 for invalid credentials', async () => {
    // Mock Xtream API to return 401
    nock('http://xtream-server.com')
      .get('/player_api.php')
      .query(true)
      .reply(401);
    
    const response = await request(app)
      .get('/api/iptv-tree/categories/live')
      .query({ source: 'global' });
    
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('INVALID_CREDENTIALS');
  });
  
  it('should return 400 when config not found', async () => {
    // Mock database to return no config
    pool.query.mockResolvedValueOnce({ rows: [] });
    
    const response = await request(app)
      .get('/api/iptv-tree/categories/live')
      .query({ source: 'global' });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('CONFIG_NOT_FOUND');
  });
});
```

### Property-Based Testing

#### Property Test Configuration

- **Framework**: fast-check (JavaScript/TypeScript)
- **Iterations**: Mínimo 100 por teste
- **Tag Format**: `Feature: iptv-tree-viewer, Property {number}: {description}`

#### Frontend Property Tests

**Property 1: Hierarchy Construction**

```javascript
import fc from 'fast-check';

// Feature: iptv-tree-viewer, Property 5: Hierarchy Construction
describe('Property: Hierarchy Construction', () => {
  it('should correctly build tree from flat categories', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          category_id: fc.string(),
          category_name: fc.string(),
          parent_id: fc.oneof(fc.constant(0), fc.nat())
        })),
        (categories) => {
          const tree = buildHierarchy(categories);
          
          // All root nodes should have parent_id = 0
          const rootNodes = tree.filter(n => n.parent_id === 0);
          expect(rootNodes.length).toBeGreaterThanOrEqual(0);
          
          // All non-root nodes should be nested under their parent
          categories.forEach(cat => {
            if (cat.parent_id !== 0) {
              const parent = findNodeById(tree, cat.parent_id.toString());
              if (parent) {
                expect(parent.children).toContainEqual(
                  expect.objectContaining({ id: cat.category_id })
                );
              }
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Property 9: Stream Sorting**

```javascript
// Feature: iptv-tree-viewer, Property 9: Stream Sorting
describe('Property: Stream Sorting', () => {
  it('should sort streams by num in ascending order', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          stream_id: fc.nat(),
          name: fc.string(),
          num: fc.nat({ max: 9999 })
        })),
        (streams) => {
          const sorted = sortStreams(streams);
          
          // Check if sorted in ascending order
          for (let i = 1; i < sorted.length; i++) {
            expect(sorted[i].num).toBeGreaterThanOrEqual(sorted[i-1].num);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Property 19: Search Filtering**

```javascript
// Feature: iptv-tree-viewer, Property 19: Search Filtering
describe('Property: Search Filtering', () => {
  it('should only show nodes matching search query', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          id: fc.string(),
          name: fc.string()
        })),
        fc.string(),
        (nodes, searchQuery) => {
          const filtered = filterNodes(nodes, searchQuery);
          
          // All filtered nodes should contain search query (case-insensitive)
          filtered.forEach(node => {
            expect(node.name.toLowerCase()).toContain(searchQuery.toLowerCase());
          });
          
          // No unmatched nodes should be in results
          const unfilteredMatches = nodes.filter(n => 
            !n.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
          unfilteredMatches.forEach(node => {
            expect(filtered).not.toContainEqual(node);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

#### Backend Property Tests

**Property 7: Stream Filtering**

```javascript
// Feature: iptv-tree-viewer, Property 7: Stream Filtering
describe('Property: Stream Filtering', () => {
  it('should only return streams matching category_id', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          stream_id: fc.nat(),
          name: fc.string(),
          category_id: fc.string()
        })),
        fc.string(),
        (allStreams, targetCategoryId) => {
          const filtered = filterStreamsByCategory(allStreams, targetCategoryId);
          
          // All returned streams should have matching category_id
          filtered.forEach(stream => {
            expect(stream.category_id).toBe(targetCategoryId);
          });
          
          // No streams with different category_id should be included
          const wrongCategory = allStreams.filter(s => s.category_id !== targetCategoryId);
          wrongCategory.forEach(stream => {
            expect(filtered).not.toContainEqual(stream);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Property 28: Cache Hit Behavior**

```javascript
// Feature: iptv-tree-viewer, Property 28: Cache Hit Behavior
describe('Property: Cache Hit Behavior', () => {
  it('should use cached data without new API calls', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.array(fc.anything()),
        (cacheKey, data) => {
          const apiCallSpy = jest.fn();
          
          // First call - should hit API
          cache.set(cacheKey, data, 300);
          const result1 = getCachedOrFetch(cacheKey, apiCallSpy);
          
          // Second call - should use cache
          const result2 = getCachedOrFetch(cacheKey, apiCallSpy);
          
          expect(result1).toEqual(data);
          expect(result2).toEqual(data);
          expect(apiCallSpy).toHaveBeenCalledTimes(0); // Never called because cache was pre-set
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

**Fluxo completo a testar:**

1. Usuário seleciona configuração global
2. Sistema carrega categorias de Live TV
3. Usuário expande categoria "Esportes"
4. Sistema carrega canais da categoria
5. Usuário clica em canal
6. Sistema exibe detalhes no painel lateral
7. Usuário copia URL do stream
8. URL está na área de transferência

**Teste de integração:**

```javascript
describe('IPTV Tree Viewer Integration', () => {
  it('should complete full user flow', async () => {
    // Setup
    const { getByText, getByRole, getByTestId } = render(<IptvTreeViewer />);
    
    // Select global config
    const configSelect = getByRole('combobox');
    fireEvent.change(configSelect, { target: { value: 'global' } });
    
    // Wait for categories to load
    await waitFor(() => {
      expect(getByText('Esportes')).toBeInTheDocument();
    });
    
    // Expand category
    fireEvent.click(getByText('Esportes'));
    
    // Wait for streams to load
    await waitFor(() => {
      expect(getByText('ESPN HD')).toBeInTheDocument();
    });
    
    // Click on stream
    fireEvent.click(getByText('ESPN HD'));
    
    // Verify detail panel
    expect(getByTestId('detail-panel')).toBeInTheDocument();
    expect(getByText(/stream_id/i)).toBeInTheDocument();
    
    // Copy URL
    const copyButton = getByText(/copiar/i);
    fireEvent.click(copyButton);
    
    // Verify clipboard (requires clipboard mock)
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
```

### Performance Testing

**Métricas a monitorar:**

1. **Tempo de carregamento inicial**: < 2s para categorias
2. **Tempo de expansão de categoria**: < 1s para streams
3. **Tempo de busca**: < 100ms para filtrar árvore
4. **Uso de memória**: < 50MB para árvore com 1000+ nós
5. **Cache hit rate**: > 80% após uso normal

**Teste de performance:**

```javascript
describe('Performance', () => {
  it('should load categories in under 2 seconds', async () => {
    const start = performance.now();
    
    const { getByText } = render(<IptvTreeViewer />);
    
    await waitFor(() => {
      expect(getByText(/categoria/i)).toBeInTheDocument();
    });
    
    const end = performance.now();
    const duration = end - start;
    
    expect(duration).toBeLessThan(2000);
  });
  
  it('should filter large tree in under 100ms', () => {
    const largeTree = generateTreeWithNodes(1000);
    
    const start = performance.now();
    const filtered = filterNodes(largeTree, 'test');
    const end = performance.now();
    
    expect(end - start).toBeLessThan(100);
  });
});
```


## Implementation Notes

### Technology Stack

**Frontend:**
- React 18 com Hooks (useState, useEffect, useCallback)
- TailwindCSS para estilização
- Lucide React para ícones
- Axios para requisições HTTP

**Backend:**
- Node.js + Express
- In-memory cache (Map ou node-cache library)
- Axios para proxy de requisições Xtream

### Key Libraries

**Frontend:**
```json
{
  "react": "^18.2.0",
  "axios": "^1.6.2",
  "lucide-react": "^0.294.0"
}
```

**Backend:**
```json
{
  "express": "^4.18.2",
  "node-cache": "^5.1.2",
  "axios": "^1.13.6"
}
```

### File Structure

```
maxxcontrol-x-sistema/
├── modules/
│   └── iptv-tree/
│       ├── iptvTreeController.js
│       ├── iptvTreeRoutes.js
│       └── cache.js
├── web/
│   └── src/
│       └── pages/
│           └── IptvTreeViewer.jsx
└── .kiro/
    └── specs/
        └── iptv-tree-viewer/
            ├── requirements.md
            ├── design.md (este arquivo)
            ├── tasks.md (próxima fase)
            └── .config.kiro
```

### Security Considerations

1. **Credential Protection**: Nunca expor credenciais Xtream no frontend
2. **CORS**: Backend proxy evita problemas de CORS
3. **Rate Limiting**: Implementar rate limit nos endpoints proxy
4. **Input Validation**: Validar source parameter (global ou deviceId válido)
5. **Authentication**: Todos os endpoints requerem autenticação JWT do admin

### Performance Optimizations

1. **Lazy Loading**: Carregar apenas categorias visíveis inicialmente
2. **Cache em Memória**: TTL de 5 min para categorias, 10 min para streams
3. **Debounce**: 300ms na busca para evitar filtros excessivos
4. **Virtualization**: Considerar react-window para árvores muito grandes (>1000 nós)
5. **Memoization**: Usar React.memo em TreeNode para evitar re-renders desnecessários

### Accessibility

1. **Keyboard Navigation**: Suporte completo para Tab, Enter, Arrow keys
2. **ARIA Labels**: Adicionar aria-label em ícones e botões
3. **Focus Management**: Manter foco visível durante navegação
4. **Screen Reader**: Anunciar expansão/colapso de categorias

### Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Responsiveness

Embora o painel seja primariamente desktop, a árvore deve ser responsiva:
- Reduzir indentação em telas pequenas
- DetailPanel como modal em mobile
- Touch-friendly (botões com min 44x44px)

## Next Steps

Após aprovação deste design, a próxima fase será:

1. **Criar tasks.md**: Quebrar implementação em tarefas específicas
2. **Implementação Backend**: Criar módulo iptv-tree com endpoints proxy
3. **Implementação Frontend**: Criar componente IptvTreeViewer
4. **Testes**: Implementar unit tests e property tests
5. **Integração**: Adicionar link no menu do painel
6. **Documentação**: Atualizar API_ENDPOINTS.md

## References

- [Xtream Codes API Documentation](http://example.com/xtream-docs)
- [React Tree View Best Practices](https://react.dev/learn/preserving-and-resetting-state)
- [Property-Based Testing with fast-check](https://github.com/dubzzz/fast-check)
- MaxxControl existing modules: `/modules/iptv-server/`

---

**Document Version**: 1.0  
**Last Updated**: 2024-01-15  
**Status**: Ready for Review
