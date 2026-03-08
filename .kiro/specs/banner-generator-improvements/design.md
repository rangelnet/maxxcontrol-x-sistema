# Design Document: Banner Generator Improvements

## Overview

This design transforms the MaxxControl X Banner Generator from a basic tool into a professional-grade graphic design solution. The system will enable administrators to create high-quality promotional banners quickly and efficiently through professional templates, an advanced visual editor, robust organization system, and social media integrations.

### Current State

The existing banner generator provides:
- Basic banner creation for movies/series and football events
- Simple database storage (banners table with id, type, title, data, template, image_url)
- Frontend-only canvas rendering
- No advanced editing capabilities
- No organization or versioning

### Target State

The enhanced system will provide:
- 15+ professional pre-configured templates across 8 categories
- Advanced text editor with 20+ fonts, shadows, strokes, gradients
- Layer system with drag-and-drop positioning and z-index control
- Image filters and effects (blur, brightness, contrast, saturation, etc)
- Asset library with 50+ overlays, 100+ icons, 30+ shapes
- Batch generation of 50+ banners simultaneously
- Folder hierarchy and tag-based organization
- Version history with 50+ snapshots per banner
- Social media integration (Facebook, Instagram, Twitter)
- Public API for external integrations
- Webhook notifications
- Server-side rendering with Node Canvas + Sharp
- CDN integration for optimized delivery
- Multi-format export (PNG, JPG, WebP, AVIF)


## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Gallery    │  │    Editor    │  │  Templates   │          │
│  │  Component   │  │  Component   │  │  Component   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Canvas    │  │    Layers    │  │   Toolbar    │          │
│  │  Component   │  │    Panel     │  │  Component   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Assets    │  │   Folders    │  │    Social    │          │
│  │   Library    │  │     Tree     │  │  Integration │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Node.js/Express)                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Banner     │  │   Template   │  │    Asset     │          │
│  │  Controller  │  │  Controller  │  │  Controller  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Folder     │  │   Version    │  │    Social    │          │
│  │  Controller  │  │  Controller  │  │  Controller  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Webhook    │  │  Public API  │  │    Cache     │          │
│  │  Controller  │  │  Controller  │  │   Manager    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────────────────────────────────────────┐          │
│  │         Banner Generation Engine                 │          │
│  │  (Node Canvas + Sharp + Worker Threads)          │          │
│  └──────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ SQL Queries
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Database (PostgreSQL/Supabase)                  │
├─────────────────────────────────────────────────────────────────┤
│  banners │ banner_templates │ banner_folders │ banner_tags      │
│  banner_tag_relations │ banner_versions │ banner_assets        │
│  social_accounts │ api_keys │ webhooks │ banner_cache          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ File Storage
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CDN (Cloudflare/AWS)                          │
├─────────────────────────────────────────────────────────────────┤
│  Generated Banners │ Assets │ Thumbnails │ Cached Images        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ External APIs
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              External Services                                   │
├─────────────────────────────────────────────────────────────────┤
│  Facebook Graph API │ Instagram API │ Twitter API │ TMDB API    │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Banner Creation Flow:**
   - User selects template → Frontend loads template config
   - User customizes in editor → State updates in React
   - User saves → POST /api/banners/create → Database insert
   - Background job generates images → Node Canvas renders → CDN upload

2. **Batch Generation Flow:**
   - User selects multiple contents → Frontend sends batch request
   - Backend creates worker threads → Parallel generation
   - Progress updates via WebSocket → Frontend shows progress bar
   - Completion → Webhook notification → ZIP download ready

3. **Social Publishing Flow:**
   - User connects account → OAuth 2.0 flow → Token storage
   - User publishes banner → Backend uploads to social API
   - Success/failure → Webhook notification → Frontend feedback


## Components and Interfaces

### Frontend Components (React)

#### 1. BannerGallery Component
**Purpose:** Display grid of banners with filtering, search, and organization

**Props:**
```typescript
interface BannerGalleryProps {
  currentFolder: Folder | null;
  selectedTags: string[];
  searchQuery: string;
  viewMode: 'grid' | 'list';
  onBannerSelect: (banner: Banner) => void;
  onBannerEdit: (bannerId: string) => void;
  onBannerDelete: (bannerId: string) => void;
  onBannerDuplicate: (bannerId: string) => void;
}
```

**State:**
- banners: Banner[]
- loading: boolean
- page: number
- hasMore: boolean

**Key Methods:**
- loadBanners(): Promise<void>
- handleScroll(): void (infinite scroll)
- handleDragDrop(bannerId: string, folderId: string): void

#### 2. BannerEditor Component
**Purpose:** Main editing interface with canvas, layers, and toolbars

**Props:**
```typescript
interface BannerEditorProps {
  bannerId?: string; // undefined for new banner
  templateId?: string;
  onSave: (banner: Banner) => void;
  onClose: () => void;
}
```

**State:**
```typescript
interface EditorState {
  config: BannerConfig;
  selectedLayerId: string | null;
  history: BannerConfig[];
  historyIndex: number;
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
}
```

**Key Methods:**
- addLayer(type: LayerType): void
- updateLayer(layerId: string, props: Partial<Layer>): void
- deleteLayer(layerId: string): void
- reorderLayers(fromIndex: number, toIndex: number): void
- undo(): void
- redo(): void
- exportBanner(format: ExportFormat): Promise<Blob>

#### 3. CanvasRenderer Component
**Purpose:** Render banner preview using HTML5 Canvas API

**Props:**
```typescript
interface CanvasRendererProps {
  config: BannerConfig;
  width: number;
  height: number;
  selectedLayerId?: string;
  onLayerSelect: (layerId: string) => void;
  onLayerTransform: (layerId: string, transform: Transform) => void;
}
```

**Key Methods:**
- renderLayers(): void
- handleMouseDown(e: MouseEvent): void
- handleMouseMove(e: MouseEvent): void
- handleMouseUp(e: MouseEvent): void
- exportToBlob(format: string): Promise<Blob>

#### 4. LayersPanel Component
**Purpose:** Sidebar showing layer hierarchy with drag-drop reordering

**Props:**
```typescript
interface LayersPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onLayerSelect: (layerId: string) => void;
  onLayerReorder: (fromIndex: number, toIndex: number) => void;
  onLayerToggleVisibility: (layerId: string) => void;
  onLayerToggleLock: (layerId: string) => void;
  onLayerRename: (layerId: string, name: string) => void;
  onLayerDuplicate: (layerId: string) => void;
  onLayerDelete: (layerId: string) => void;
}
```

#### 5. PropertiesPanel Component
**Purpose:** Edit properties of selected layer (text, image, filters)

**Props:**
```typescript
interface PropertiesPanelProps {
  layer: Layer | null;
  onUpdate: (props: Partial<Layer>) => void;
}
```

**Sub-components:**
- TextProperties: font, size, color, shadow, stroke
- ImageProperties: filters, crop, rotation, opacity
- PositionProperties: x, y, width, height, rotation
- AnimationProperties: type, duration, delay, easing

#### 6. TemplateSelector Component
**Purpose:** Modal to browse and select templates

**Props:**
```typescript
interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
}
```

**State:**
- templates: Template[]
- selectedCategory: string
- searchQuery: string

#### 7. AssetLibrary Component
**Purpose:** Browse and add assets (overlays, icons, shapes)

**Props:**
```typescript
interface AssetLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetSelect: (asset: Asset) => void;
}
```

**State:**
- assets: Asset[]
- selectedCategory: string
- favorites: string[]

#### 8. FolderTree Component
**Purpose:** Hierarchical folder navigation

**Props:**
```typescript
interface FolderTreeProps {
  folders: Folder[];
  currentFolderId: string | null;
  onFolderSelect: (folderId: string) => void;
  onFolderCreate: (parentId: string, name: string) => void;
  onFolderRename: (folderId: string, name: string) => void;
  onFolderDelete: (folderId: string) => void;
  onFolderMove: (folderId: string, newParentId: string) => void;
}
```

#### 9. BatchGenerator Component
**Purpose:** Generate multiple banners at once

**Props:**
```typescript
interface BatchGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**State:**
- selectedContents: Content[]
- selectedTemplate: Template | null
- selectedSizes: BannerSize[]
- progress: number
- status: 'idle' | 'generating' | 'complete' | 'error'

#### 10. SocialPublisher Component
**Purpose:** Publish banners to social media

**Props:**
```typescript
interface SocialPublisherProps {
  banner: Banner;
  isOpen: boolean;
  onClose: () => void;
}
```

**State:**
- connectedAccounts: SocialAccount[]
- selectedPlatforms: string[]
- caption: string
- hashtags: string[]
- scheduledTime: Date | null


### Backend API Endpoints

#### Banner Management

```
GET    /api/banners/list
       Query: ?folder_id=X&tags=tag1,tag2&search=query&page=1&limit=50
       Response: { banners: Banner[], total: number, hasMore: boolean }

GET    /api/banners/:id
       Response: Banner

POST   /api/banners/create
       Body: { type, title, config, template_id, folder_id, tags }
       Response: { success: true, banner: Banner }

PUT    /api/banners/:id
       Body: { title, config, folder_id, tags }
       Response: { success: true, banner: Banner }

DELETE /api/banners/:id
       Response: { success: true }

POST   /api/banners/:id/duplicate
       Response: { success: true, banner: Banner }

POST   /api/banners/:id/favorite
       Response: { success: true }
```

#### Template Management

```
GET    /api/templates/list
       Query: ?category=X
       Response: { templates: Template[] }

GET    /api/templates/:id
       Response: Template

POST   /api/templates/create
       Body: { name, category, config, preview_url }
       Response: { success: true, template: Template }

PUT    /api/templates/:id
       Body: { name, category, config }
       Response: { success: true, template: Template }

DELETE /api/templates/:id
       Response: { success: true }

POST   /api/templates/import
       Body: { json: string } or { url: string }
       Response: { success: true, template: Template }

GET    /api/templates/:id/export
       Response: JSON file download
```

#### Asset Management

```
GET    /api/assets/list
       Query: ?category=X&type=overlay|icon|shape
       Response: { assets: Asset[] }

POST   /api/assets/upload
       Body: FormData with file
       Response: { success: true, asset: Asset }

DELETE /api/assets/:id
       Response: { success: true }

POST   /api/assets/:id/favorite
       Response: { success: true }
```

#### Folder Management

```
GET    /api/folders/tree
       Response: { folders: Folder[] }

POST   /api/folders/create
       Body: { name, parent_id }
       Response: { success: true, folder: Folder }

PUT    /api/folders/:id
       Body: { name, parent_id }
       Response: { success: true, folder: Folder }

DELETE /api/folders/:id
       Response: { success: true }
```

#### Version Management

```
GET    /api/banners/:id/versions
       Response: { versions: Version[] }

POST   /api/banners/:id/versions/create
       Body: { config, comment }
       Response: { success: true, version: Version }

POST   /api/banners/:id/versions/:versionId/restore
       Response: { success: true, banner: Banner }

GET    /api/banners/:id/versions/:versionId
       Response: Version
```

#### Generation

```
POST   /api/banners/generate
       Body: { banner_id, sizes: ['1920x1080', ...], format: 'png' }
       Response: { success: true, urls: { size: url } }

POST   /api/banners/batch-generate
       Body: { template_id, content_ids: [], sizes: [], format: 'png' }
       Response: { success: true, job_id: string }

GET    /api/banners/batch-generate/:jobId/status
       Response: { status: 'pending'|'processing'|'complete', progress: number, urls: [] }

GET    /api/banners/batch-generate/:jobId/download
       Response: ZIP file download
```

#### Social Media Integration

```
GET    /api/social/accounts
       Response: { accounts: SocialAccount[] }

POST   /api/social/connect/:platform
       Body: { code: string } (OAuth callback)
       Response: { success: true, account: SocialAccount }

DELETE /api/social/accounts/:id
       Response: { success: true }

POST   /api/social/publish
       Body: { banner_id, platforms: [], caption, hashtags, scheduled_time }
       Response: { success: true, publications: Publication[] }

GET    /api/social/publications
       Response: { publications: Publication[] }
```

#### Public API

```
POST   /api/public/banners/generate
       Headers: X-API-Key: xxx
       Body: { template_id, content_data, size, format }
       Response: { success: true, url: string }

POST   /api/public/banners/batch-generate
       Headers: X-API-Key: xxx
       Body: { template_id, contents: [], sizes: [], format, webhook_url }
       Response: { success: true, job_id: string }
```

#### Webhooks

```
GET    /api/webhooks/list
       Response: { webhooks: Webhook[] }

POST   /api/webhooks/create
       Body: { url, events: ['banner.created', ...] }
       Response: { success: true, webhook: Webhook }

DELETE /api/webhooks/:id
       Response: { success: true }

POST   /api/webhooks/:id/test
       Response: { success: true, response: any }
```

#### Cache Management

```
POST   /api/banners/:id/invalidate-cache
       Response: { success: true }

GET    /api/cache/stats
       Response: { hits: number, misses: number, size: string }

DELETE /api/cache/clear
       Response: { success: true }
```


## Data Models

### Banner Configuration Schema

```typescript
interface BannerConfig {
  version: string; // Schema version (e.g., "1.0")
  type: 'movie' | 'series' | 'football' | 'custom';
  size: BannerSize;
  layers: Layer[];
  metadata: {
    created_at: string;
    updated_at: string;
    author: string;
  };
}

interface Layer {
  id: string;
  type: 'image' | 'text' | 'shape' | 'gradient';
  name: string;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number; // degrees
  };
  opacity: number; // 0-1
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay';
  
  // Type-specific properties
  image?: ImageLayerProps;
  text?: TextLayerProps;
  shape?: ShapeLayerProps;
  gradient?: GradientLayerProps;
  
  // Animation (preview only)
  animation?: AnimationProps;
}

interface ImageLayerProps {
  src: string;
  filters: {
    blur?: number; // 0-50
    brightness?: number; // -100 to 100
    contrast?: number; // -100 to 100
    saturation?: number; // -100 to 100
    hue?: number; // -180 to 180
    grayscale?: number; // 0-100
    sepia?: number; // 0-100
    invert?: boolean;
  };
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  flipHorizontal?: boolean;
  flipVertical?: boolean;
}

interface TextLayerProps {
  content: string;
  font: string;
  fontSize: number; // 8-200
  color: string; // hex or rgba
  align: 'left' | 'center' | 'right' | 'justify';
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  lineHeight?: number; // multiplier
  letterSpacing?: number; // px
  shadow?: {
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
  };
  stroke?: {
    width: number;
    color: string;
  };
  gradient?: {
    type: 'linear' | 'radial';
    colors: Array<{ offset: number; color: string }>;
    angle?: number; // for linear
  };
}

interface ShapeLayerProps {
  shape: 'rectangle' | 'circle' | 'triangle' | 'star' | 'polygon';
  fill: string; // color or gradient
  stroke?: {
    width: number;
    color: string;
  };
  cornerRadius?: number; // for rectangle
  points?: number; // for star/polygon
}

interface GradientLayerProps {
  type: 'linear' | 'radial';
  colors: Array<{ offset: number; color: string }>;
  angle?: number; // for linear (0-360)
  centerX?: number; // for radial (0-1)
  centerY?: number; // for radial (0-1)
}

interface AnimationProps {
  type: 'fade-in' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'zoom' | 'rotate';
  duration: number; // seconds (0.1-5)
  delay: number; // seconds
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

type BannerSize = 
  | '1920x1080' // Banner horizontal
  | '1080x1920' // Stories vertical
  | '1080x1080' // Post quadrado
  | '1200x628'  // Facebook share
  | '1280x720'  // YouTube thumbnail
  | '800x450';  // Cartaz pequeno
```

### Database Tables

#### banners
```sql
CREATE TABLE banners (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  config JSONB NOT NULL,
  template_id INTEGER REFERENCES banner_templates(id) ON DELETE SET NULL,
  folder_id INTEGER REFERENCES banner_folders(id) ON DELETE SET NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_banners_folder ON banners(folder_id);
CREATE INDEX idx_banners_template ON banners(template_id);
CREATE INDEX idx_banners_favorite ON banners(is_favorite);
CREATE INDEX idx_banners_created_at ON banners(created_at DESC);
```

#### banner_templates
```sql
CREATE TABLE banner_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  config JSONB NOT NULL,
  preview_url VARCHAR(500),
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_templates_category ON banner_templates(category);
CREATE INDEX idx_templates_system ON banner_templates(is_system);
```

#### banner_folders
```sql
CREATE TABLE banner_folders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_id INTEGER REFERENCES banner_folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_folders_parent ON banner_folders(parent_id);
```

#### banner_tags
```sql
CREATE TABLE banner_tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tags_name ON banner_tags(name);
```

#### banner_tag_relations
```sql
CREATE TABLE banner_tag_relations (
  banner_id INTEGER REFERENCES banners(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES banner_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (banner_id, tag_id)
);

CREATE INDEX idx_tag_relations_banner ON banner_tag_relations(banner_id);
CREATE INDEX idx_tag_relations_tag ON banner_tag_relations(tag_id);
```

#### banner_versions
```sql
CREATE TABLE banner_versions (
  id SERIAL PRIMARY KEY,
  banner_id INTEGER REFERENCES banners(id) ON DELETE CASCADE,
  config JSONB NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_versions_banner ON banner_versions(banner_id);
CREATE INDEX idx_versions_created_at ON banner_versions(created_at DESC);
```

#### banner_assets
```sql
CREATE TABLE banner_assets (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'overlay', 'icon', 'shape', 'texture'
  category VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_assets_type ON banner_assets(type);
CREATE INDEX idx_assets_category ON banner_assets(category);
CREATE INDEX idx_assets_favorite ON banner_assets(is_favorite);
```

#### social_accounts
```sql
CREATE TABLE social_accounts (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(50) NOT NULL, -- 'facebook', 'instagram', 'twitter'
  account_name VARCHAR(255),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_social_platform ON social_accounts(platform);
CREATE INDEX idx_social_user ON social_accounts(created_by);
```

#### social_publications
```sql
CREATE TABLE social_publications (
  id SERIAL PRIMARY KEY,
  banner_id INTEGER REFERENCES banners(id) ON DELETE SET NULL,
  account_id INTEGER REFERENCES social_accounts(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  post_id VARCHAR(255),
  post_url TEXT,
  caption TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'published', 'failed'
  error_message TEXT,
  scheduled_at TIMESTAMP,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_publications_banner ON social_publications(banner_id);
CREATE INDEX idx_publications_account ON social_publications(account_id);
CREATE INDEX idx_publications_status ON social_publications(status);
```

#### api_keys
```sql
CREATE TABLE api_keys (
  id SERIAL PRIMARY KEY,
  key VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(255),
  rate_limit INTEGER DEFAULT 100, -- requests per hour
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_api_keys_key ON api_keys(key);
CREATE INDEX idx_api_keys_active ON api_keys(is_active);
```

#### webhooks
```sql
CREATE TABLE webhooks (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL, -- ['banner.created', 'banner.updated', ...]
  secret VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_webhooks_active ON webhooks(is_active);
```

#### webhook_logs
```sql
CREATE TABLE webhook_logs (
  id SERIAL PRIMARY KEY,
  webhook_id INTEGER REFERENCES webhooks(id) ON DELETE CASCADE,
  event VARCHAR(100) NOT NULL,
  payload JSONB,
  response_status INTEGER,
  response_body TEXT,
  attempt INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhook_logs_webhook ON webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at DESC);
```

#### banner_cache
```sql
CREATE TABLE banner_cache (
  id SERIAL PRIMARY KEY,
  banner_id INTEGER REFERENCES banners(id) ON DELETE CASCADE,
  size VARCHAR(50) NOT NULL,
  format VARCHAR(10) NOT NULL,
  url TEXT NOT NULL,
  cdn_url TEXT,
  file_size INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  UNIQUE(banner_id, size, format)
);

CREATE INDEX idx_cache_banner ON banner_cache(banner_id);
CREATE INDEX idx_cache_expires ON banner_cache(expires_at);
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Template Application Completeness

*For any* template and any banner size, when a template is applied, all template configuration properties (layout, colors, fonts, layers) SHALL be correctly applied to the banner configuration.

**Validates: Requirements 1.3, 1.5**

### Property 2: Template Responsiveness

*For any* template, the template SHALL render correctly in all 6 banner sizes (1920x1080, 1080x1920, 1080x1080, 1200x628, 1280x720, 800x450) without layout breakage.

**Validates: Requirements 1.5**

### Property 3: Layer Customization Preservation

*For any* layer in a banner, all editable properties (position, size, rotation, opacity, filters, text content, styles) SHALL be modifiable and the modifications SHALL persist when the banner is saved and reloaded.

**Validates: Requirements 1.6**

### Property 4: Text Style Application

*For any* text layer, applying any combination of text styles (font, size, color, shadow, stroke, alignment, bold, italic, underline, line-height, letter-spacing, gradient) SHALL produce the expected visual result in the rendered banner.

**Validates: Requirements 2.2-2.12**

### Property 5: Layer Z-Index Ordering

*For any* set of layers in a banner, the visual rendering order SHALL match the z-index order, where higher z-index layers appear in front of lower z-index layers.

**Validates: Requirements 3.1**

### Property 6: Layer Operations Integrity

*For any* layer operation (reorder, rename, hide, lock, duplicate, delete), the operation SHALL complete successfully and the banner configuration SHALL remain valid with all other layers unaffected.

**Validates: Requirements 3.3-3.9**

### Property 7: Canvas Transformation Accuracy

*For any* element on the canvas, applying transformations (position, resize, rotate) SHALL update the layer configuration with accurate numerical values that reproduce the visual transformation when rendered.

**Validates: Requirements 3.10-3.15**

### Property 8: Image Filter Composition

*For any* image layer, applying multiple filters simultaneously SHALL produce a visual result equivalent to applying each filter in sequence, and the filter values SHALL be independently adjustable.

**Validates: Requirements 4.1-4.13**

### Property 9: Image Transformation Reversibility

*For any* image layer, applying transformations (crop, rotate, flip) and then resetting SHALL restore the original image state.

**Validates: Requirements 5.1-5.10**

### Property 10: Asset Addition Integrity

*For any* asset from the library (overlay, icon, shape), adding it to the canvas SHALL create a new layer with the asset correctly positioned and all properties editable.

**Validates: Requirements 6.1-6.10**

### Property 11: Batch Generation Consistency

*For any* template and any set of content items, batch generation SHALL apply the template to each content item independently, producing banners with consistent styling but unique content.

**Validates: Requirements 7.2**

### Property 12: Batch Size Generation Completeness

*For any* content item in batch generation, the system SHALL generate banners in all requested sizes, and each size SHALL be independently accessible.

**Validates: Requirements 7.3**

### Property 13: Folder Hierarchy Integrity

*For any* folder operation (create, rename, move, delete), the folder tree structure SHALL remain valid with no orphaned folders or circular references.

**Validates: Requirements 8.1-8.4**

### Property 14: Tag Filtering Accuracy

*For any* set of tags, filtering banners by those tags SHALL return only banners that have ALL specified tags (AND operation), and the result set SHALL be complete (no false negatives).

**Validates: Requirements 8.5-8.8**

### Property 15: Version Snapshot Completeness

*For any* banner version, the version SHALL contain a complete snapshot of the banner configuration at that point in time, and restoring the version SHALL reproduce the exact banner state.

**Validates: Requirements 9.1, 9.5**

### Property 16: Undo/Redo Consistency

*For any* sequence of edit operations, applying undo SHALL reverse the last operation, and applying redo SHALL reapply it, maintaining a consistent history stack.

**Validates: Requirements 9.9**

### Property 17: Cache Invalidation Correctness

*For any* banner that is edited, the cache entries for that banner SHALL be invalidated, and subsequent requests SHALL generate fresh images reflecting the changes.

**Validates: Requirements 10.1, 10.11**

### Property 18: Format Optimization Selection

*For any* banner request, the system SHALL serve the most optimized format (WebP, AVIF, PNG, JPG) based on browser support, with fallback to universally supported formats.

**Validates: Requirements 10.2, 10.3**

### Property 19: Social OAuth Token Security

*For any* social media account connection, the OAuth tokens SHALL be stored encrypted, and SHALL only be accessible by the user who connected the account.

**Validates: Requirements 11.4, 11.5**

### Property 20: Social Publishing Atomicity

*For any* social media publication request, either the banner SHALL be successfully posted to ALL selected platforms, or appropriate error messages SHALL be returned for each failed platform without affecting successful posts.

**Validates: Requirements 11.7-11.10**

### Property 21: API Rate Limiting Enforcement

*For any* API key, the system SHALL enforce the configured rate limit (requests per hour), rejecting requests that exceed the limit with HTTP 429 status.

**Validates: Requirements 12.5**

### Property 22: API Authentication Requirement

*For any* public API endpoint request without a valid API key, the system SHALL reject the request with HTTP 401 status.

**Validates: Requirements 12.2**

### Property 23: Webhook Delivery Reliability

*For any* webhook event, the system SHALL attempt delivery with exponential backoff retry (up to 5 attempts), and SHALL log all delivery attempts with status codes.

**Validates: Requirements 13.7-13.9**

### Property 24: Export Format Fidelity

*For any* banner and any export format (PNG, JPG, WebP, AVIF), the exported image SHALL accurately represent the banner configuration with all layers, filters, and effects applied.

**Validates: Requirements 14.1-14.4**

### Property 25: Multi-Size Export Consistency

*For any* banner exported in multiple sizes simultaneously, each size SHALL maintain the same visual proportions and styling, with only dimensions differing.

**Validates: Requirements 14.5**

### Property 26: Configuration Round-Trip Property

*For any* valid banner configuration, serializing to JSON and then parsing back SHALL produce an equivalent configuration: `parse(serialize(config)) ≡ config`.

**Validates: Requirements 17.6**

### Property 27: Configuration Validation Rejection

*For any* invalid banner configuration JSON, the parser SHALL reject it with a descriptive error message indicating the specific validation failure.

**Validates: Requirements 17.2, 17.7**

### Property 28: Banner Duplication Completeness

*For any* banner, duplicating it SHALL create a new banner with identical configuration, layers, and properties, but with a unique ID and modified title.

**Validates: Requirements 18.1-18.6**

### Property 29: Template Import/Export Round-Trip

*For any* template, exporting to JSON and then importing SHALL produce a template with equivalent configuration: `import(export(template)) ≡ template`.

**Validates: Requirements 19.1-19.7**

### Property 30: Animation Configuration Persistence

*For any* layer with animation properties, the animation configuration (type, duration, delay, easing) SHALL persist when the banner is saved and SHALL be playable in preview mode.

**Validates: Requirements 20.1-20.8**

### Property Reflection

After reviewing all properties, the following consolidations were identified:

- **Properties 6 and 28** both test operation integrity but for different scopes (layers vs banners). Both are kept as they validate different requirements.
- **Properties 26 and 29** both test round-trip serialization but for different entities (banners vs templates). Both are kept as they validate different data structures.
- **Properties 3 and 15** both test persistence but at different granularities (individual edits vs complete snapshots). Both are kept as they serve different purposes.

All 30 properties provide unique validation value and should be implemented as property-based tests.


## Error Handling

### Frontend Error Handling

#### Network Errors
```typescript
async function handleApiCall<T>(
  apiCall: () => Promise<T>,
  errorMessage: string
): Promise<T | null> {
  try {
    return await apiCall();
  } catch (error) {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      window.location.href = '/login';
      return null;
    } else if (error.response?.status === 429) {
      // Rate limited
      showNotification('Muitas requisições. Aguarde um momento.', 'warning');
      return null;
    } else if (error.response?.status >= 500) {
      // Server error
      showNotification('Erro no servidor. Tente novamente.', 'error');
      return null;
    } else {
      // Other errors
      showNotification(errorMessage, 'error');
      console.error(error);
      return null;
    }
  }
}
```

#### Canvas Rendering Errors
```typescript
function handleCanvasError(error: Error, layerId: string): void {
  console.error(`Canvas rendering error for layer ${layerId}:`, error);
  
  // Mark layer as having error
  updateLayerState(layerId, { hasError: true, errorMessage: error.message });
  
  // Show notification
  showNotification(
    `Erro ao renderizar camada. Verifique as propriedades.`,
    'warning'
  );
  
  // Continue rendering other layers
}
```

#### File Upload Errors
```typescript
function validateFileUpload(file: File): string | null {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
  
  if (file.size > maxSize) {
    return 'Arquivo muito grande. Máximo: 10MB';
  }
  
  if (!allowedTypes.includes(file.type)) {
    return 'Formato não suportado. Use PNG, JPG, WebP ou SVG';
  }
  
  return null;
}
```

### Backend Error Handling

#### Request Validation
```javascript
function validateBannerConfig(config) {
  if (!config.version) {
    throw new ValidationError('Campo "version" obrigatório');
  }
  
  if (!config.type || !['movie', 'series', 'football', 'custom'].includes(config.type)) {
    throw new ValidationError('Campo "type" inválido');
  }
  
  if (!config.layers || !Array.isArray(config.layers)) {
    throw new ValidationError('Campo "layers" deve ser um array');
  }
  
  // Validate each layer
  config.layers.forEach((layer, index) => {
    if (!layer.id || !layer.type) {
      throw new ValidationError(`Layer ${index}: campos "id" e "type" obrigatórios`);
    }
    
    if (!['image', 'text', 'shape', 'gradient'].includes(layer.type)) {
      throw new ValidationError(`Layer ${index}: tipo "${layer.type}" inválido`);
    }
  });
  
  return true;
}
```

#### Database Errors
```javascript
async function handleDatabaseError(error, operation) {
  console.error(`Database error during ${operation}:`, error);
  
  if (error.code === '23505') {
    // Unique constraint violation
    throw new ConflictError('Registro duplicado');
  } else if (error.code === '23503') {
    // Foreign key violation
    throw new ValidationError('Referência inválida');
  } else if (error.code === '23502') {
    // Not null violation
    throw new ValidationError('Campo obrigatório não fornecido');
  } else {
    // Generic database error
    throw new DatabaseError('Erro ao acessar banco de dados');
  }
}
```

#### Generation Errors
```javascript
async function handleGenerationError(error, bannerId, size) {
  console.error(`Generation error for banner ${bannerId}, size ${size}:`, error);
  
  // Log error to database
  await pool.query(
    `INSERT INTO generation_errors (banner_id, size, error_message, stack_trace, created_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [bannerId, size, error.message, error.stack]
  );
  
  // Send webhook notification if configured
  await sendWebhookNotification('banner.generation.failed', {
    banner_id: bannerId,
    size: size,
    error: error.message
  });
  
  throw new GenerationError(`Falha ao gerar banner: ${error.message}`);
}
```

#### External API Errors
```javascript
async function handleSocialApiError(error, platform) {
  console.error(`Social API error for ${platform}:`, error);
  
  if (error.response?.status === 401) {
    // Token expired - mark account as needing reconnection
    await pool.query(
      `UPDATE social_accounts SET needs_reconnect = true WHERE platform = $1`,
      [platform]
    );
    throw new AuthenticationError('Token expirado. Reconecte sua conta.');
  } else if (error.response?.status === 429) {
    // Rate limited by social platform
    throw new RateLimitError('Limite de publicações atingido. Tente mais tarde.');
  } else {
    throw new ExternalApiError(`Erro ao publicar no ${platform}: ${error.message}`);
  }
}
```

### Error Response Format

All API errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Descrição legível do erro",
    "details": {
      "field": "nome_do_campo",
      "reason": "motivo_especifico"
    }
  }
}
```

Error codes:
- `VALIDATION_ERROR`: Invalid input data
- `AUTHENTICATION_ERROR`: Invalid or missing credentials
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND_ERROR`: Resource not found
- `CONFLICT_ERROR`: Duplicate or conflicting resource
- `RATE_LIMIT_ERROR`: Too many requests
- `GENERATION_ERROR`: Banner generation failed
- `EXTERNAL_API_ERROR`: External service error
- `DATABASE_ERROR`: Database operation failed
- `INTERNAL_ERROR`: Unexpected server error


## Testing Strategy

### Dual Testing Approach

The banner generator improvements require both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, error conditions, and integration points
- **Property-Based Tests**: Verify universal properties across all inputs through randomization

Both testing approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Unit Testing Strategy

#### Frontend Unit Tests (Jest + React Testing Library)

**Component Tests:**
- BannerGallery: rendering, filtering, pagination, infinite scroll
- BannerEditor: initialization, state management, keyboard shortcuts
- CanvasRenderer: layer rendering, mouse interactions, export
- LayersPanel: drag-drop reordering, visibility toggles, layer operations
- PropertiesPanel: property updates, validation, real-time preview

**Example Unit Test:**
```javascript
describe('BannerEditor', () => {
  it('should add a new text layer when toolbar button is clicked', () => {
    const { getByTestId } = render(<BannerEditor />);
    const addTextButton = getByTestId('add-text-layer');
    
    fireEvent.click(addTextButton);
    
    const layersPanel = getByTestId('layers-panel');
    expect(layersPanel).toHaveTextContent('Text Layer 1');
  });
  
  it('should handle empty banner configuration gracefully', () => {
    const { container } = render(<BannerEditor bannerId={null} />);
    expect(container).toHaveTextContent('Selecione um template');
  });
});
```

**Service Tests:**
- API client: request formatting, error handling, retry logic
- Configuration parser: JSON serialization, validation
- Cache manager: cache hits/misses, invalidation

#### Backend Unit Tests (Jest + Supertest)

**Controller Tests:**
- Banner CRUD operations
- Template management
- Folder operations
- Version management
- Social media integration
- Webhook delivery

**Example Unit Test:**
```javascript
describe('POST /api/banners/create', () => {
  it('should create a banner with valid configuration', async () => {
    const response = await request(app)
      .post('/api/banners/create')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        type: 'movie',
        title: 'Test Banner',
        config: validBannerConfig,
        template_id: 1
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.banner).toHaveProperty('id');
  });
  
  it('should reject banner with invalid configuration', async () => {
    const response = await request(app)
      .post('/api/banners/create')
      .send({
        type: 'movie',
        title: 'Test Banner',
        config: { invalid: 'config' }
      });
    
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
```

**Generation Engine Tests:**
- Node Canvas rendering
- Sharp image processing
- Filter application
- Text rendering with custom fonts
- Layer composition

**Integration Tests:**
- Database operations
- File system operations
- CDN upload
- External API calls (mocked)

### Property-Based Testing Strategy

Property-based tests will use **fast-check** library for JavaScript/TypeScript. Each test will run a minimum of 100 iterations with randomized inputs.

#### Configuration Library

**Property Test Configuration:**
```javascript
const fc = require('fast-check');

// Arbitraries for generating random banner configurations
const layerArbitrary = fc.record({
  id: fc.uuid(),
  type: fc.constantFrom('image', 'text', 'shape', 'gradient'),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  visible: fc.boolean(),
  locked: fc.boolean(),
  zIndex: fc.integer({ min: 0, max: 100 }),
  position: fc.record({
    x: fc.integer({ min: 0, max: 1920 }),
    y: fc.integer({ min: 0, max: 1080 }),
    width: fc.integer({ min: 10, max: 1920 }),
    height: fc.integer({ min: 10, max: 1080 }),
    rotation: fc.integer({ min: -180, max: 180 })
  }),
  opacity: fc.double({ min: 0, max: 1 })
});

const bannerConfigArbitrary = fc.record({
  version: fc.constant('1.0'),
  type: fc.constantFrom('movie', 'series', 'football', 'custom'),
  size: fc.constantFrom('1920x1080', '1080x1920', '1080x1080'),
  layers: fc.array(layerArbitrary, { minLength: 1, maxLength: 20 }),
  metadata: fc.record({
    created_at: fc.date().map(d => d.toISOString()),
    updated_at: fc.date().map(d => d.toISOString()),
    author: fc.string()
  })
});
```

#### Property Test Examples

**Property 1: Template Application Completeness**
```javascript
describe('Property 1: Template Application Completeness', () => {
  it('should apply all template properties to banner', () => {
    fc.assert(
      fc.property(
        templateArbitrary,
        bannerSizeArbitrary,
        (template, size) => {
          const banner = applyTemplate(template, size);
          
          // Verify all template layers are present
          expect(banner.layers.length).toBe(template.config.layers.length);
          
          // Verify template colors are applied
          template.config.layers.forEach((templateLayer, index) => {
            const bannerLayer = banner.layers[index];
            if (templateLayer.text) {
              expect(bannerLayer.text.color).toBe(templateLayer.text.color);
              expect(bannerLayer.text.font).toBe(templateLayer.text.font);
            }
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: banner-generator-improvements, Property 1: Template Application Completeness
```

**Property 26: Configuration Round-Trip**
```javascript
describe('Property 26: Configuration Round-Trip', () => {
  it('should preserve configuration through serialize/parse cycle', () => {
    fc.assert(
      fc.property(
        bannerConfigArbitrary,
        (config) => {
          const serialized = serializeConfig(config);
          const parsed = parseConfig(serialized);
          
          // Deep equality check
          expect(parsed).toEqual(config);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: banner-generator-improvements, Property 26: Configuration Round-Trip Property
```

**Property 5: Layer Z-Index Ordering**
```javascript
describe('Property 5: Layer Z-Index Ordering', () => {
  it('should render layers in z-index order', () => {
    fc.assert(
      fc.property(
        fc.array(layerArbitrary, { minLength: 2, maxLength: 10 }),
        (layers) => {
          // Sort layers by z-index
          const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);
          
          // Render banner
          const canvas = renderBanner({ layers: sortedLayers });
          
          // Verify rendering order matches z-index order
          const renderOrder = extractRenderOrder(canvas);
          expect(renderOrder).toEqual(sortedLayers.map(l => l.id));
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: banner-generator-improvements, Property 5: Layer Z-Index Ordering
```

**Property 11: Batch Generation Consistency**
```javascript
describe('Property 11: Batch Generation Consistency', () => {
  it('should apply template consistently to all content items', () => {
    fc.assert(
      fc.property(
        templateArbitrary,
        fc.array(contentItemArbitrary, { minLength: 2, maxLength: 10 }),
        async (template, contentItems) => {
          const banners = await batchGenerate(template, contentItems);
          
          // Verify all banners have same template structure
          const firstBannerLayers = banners[0].layers.map(l => l.type);
          banners.forEach(banner => {
            const layerTypes = banner.layers.map(l => l.type);
            expect(layerTypes).toEqual(firstBannerLayers);
          });
          
          // Verify each banner has unique content
          const titles = banners.map(b => b.title);
          expect(new Set(titles).size).toBe(contentItems.length);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: banner-generator-improvements, Property 11: Batch Generation Consistency
```

### Test Coverage Goals

- **Unit Test Coverage**: Minimum 80% code coverage
- **Property Test Coverage**: All 30 correctness properties implemented
- **Integration Test Coverage**: All critical user flows (create, edit, save, generate, publish)
- **E2E Test Coverage**: Key workflows (template selection → editing → export → social publish)

### Testing Tools

**Frontend:**
- Jest: Test runner
- React Testing Library: Component testing
- fast-check: Property-based testing
- MSW (Mock Service Worker): API mocking

**Backend:**
- Jest: Test runner
- Supertest: HTTP testing
- fast-check: Property-based testing
- Sinon: Mocking and stubbing
- node-canvas-mock: Canvas mocking for tests

### Continuous Integration

All tests run automatically on:
- Pull request creation
- Push to main branch
- Scheduled daily runs

CI pipeline fails if:
- Any test fails
- Code coverage drops below 80%
- Property tests find counterexamples


## Implementation Details

### Frontend Architecture

#### State Management

Use React Context API for global state management:

```typescript
// BannerContext.tsx
interface BannerContextState {
  currentBanner: Banner | null;
  config: BannerConfig;
  selectedLayerId: string | null;
  history: BannerConfig[];
  historyIndex: number;
  isDirty: boolean;
}

interface BannerContextActions {
  loadBanner: (id: string) => Promise<void>;
  saveBanner: () => Promise<void>;
  updateConfig: (config: Partial<BannerConfig>) => void;
  addLayer: (layer: Layer) => void;
  updateLayer: (layerId: string, props: Partial<Layer>) => void;
  deleteLayer: (layerId: string) => void;
  undo: () => void;
  redo: () => void;
}

const BannerContext = createContext<BannerContextState & BannerContextActions>(null);
```

#### Canvas Rendering Strategy

Use **Fabric.js** or **Konva.js** for advanced canvas manipulation:

**Why Fabric.js:**
- Built-in support for drag-drop, resize, rotate
- Layer management with z-index
- Event handling for mouse/touch
- Export to PNG/JPG/SVG
- Text rendering with custom fonts
- Image filters and effects

**Alternative: Konva.js**
- React integration via react-konva
- Better performance for many objects
- Built-in animation support
- Layer and group management

**Recommendation:** Use **Fabric.js** for its comprehensive feature set and easier integration with existing Canvas API code.

```typescript
// CanvasRenderer.tsx using Fabric.js
import { fabric } from 'fabric';

function CanvasRenderer({ config, onLayerSelect, onLayerTransform }) {
  const canvasRef = useRef<fabric.Canvas>(null);
  
  useEffect(() => {
    const canvas = new fabric.Canvas('banner-canvas', {
      width: config.size.width,
      height: config.size.height,
      backgroundColor: '#ffffff'
    });
    
    canvasRef.current = canvas;
    
    // Render layers
    config.layers.forEach(layer => {
      const fabricObject = createFabricObject(layer);
      canvas.add(fabricObject);
    });
    
    // Event handlers
    canvas.on('selection:created', (e) => {
      onLayerSelect(e.selected[0].data.layerId);
    });
    
    canvas.on('object:modified', (e) => {
      const obj = e.target;
      onLayerTransform(obj.data.layerId, {
        x: obj.left,
        y: obj.top,
        width: obj.width * obj.scaleX,
        height: obj.height * obj.scaleY,
        rotation: obj.angle
      });
    });
    
    return () => canvas.dispose();
  }, [config]);
  
  return <canvas id="banner-canvas" />;
}
```

#### Drag-and-Drop Implementation

Use **react-dnd** for folder/layer drag-drop:

```typescript
import { useDrag, useDrop } from 'react-dnd';

function LayerItem({ layer, index, onReorder }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'LAYER',
    item: { id: layer.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });
  
  const [, drop] = useDrop({
    accept: 'LAYER',
    hover: (item: { id: string; index: number }) => {
      if (item.index !== index) {
        onReorder(item.index, index);
        item.index = index;
      }
    }
  });
  
  return (
    <div ref={(node) => drag(drop(node))} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {layer.name}
    </div>
  );
}
```

### Backend Architecture

#### Server-Side Rendering with Node Canvas

```javascript
const { createCanvas, loadImage, registerFont } = require('canvas');
const sharp = require('sharp');

// Register custom fonts
registerFont('fonts/Montserrat-Bold.ttf', { family: 'Montserrat', weight: 'bold' });
registerFont('fonts/Roboto-Regular.ttf', { family: 'Roboto' });
// ... register all 20+ fonts

async function generateBanner(config) {
  const [width, height] = config.size.split('x').map(Number);
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Sort layers by z-index
  const sortedLayers = [...config.layers].sort((a, b) => a.zIndex - b.zIndex);
  
  // Render each layer
  for (const layer of sortedLayers) {
    if (!layer.visible) continue;
    
    ctx.save();
    
    // Apply transformations
    ctx.translate(layer.position.x, layer.position.y);
    ctx.rotate((layer.position.rotation * Math.PI) / 180);
    ctx.globalAlpha = layer.opacity;
    
    // Render based on type
    switch (layer.type) {
      case 'image':
        await renderImageLayer(ctx, layer);
        break;
      case 'text':
        renderTextLayer(ctx, layer);
        break;
      case 'shape':
        renderShapeLayer(ctx, layer);
        break;
      case 'gradient':
        renderGradientLayer(ctx, layer);
        break;
    }
    
    ctx.restore();
  }
  
  return canvas.toBuffer('image/png');
}

async function renderImageLayer(ctx, layer) {
  const image = await loadImage(layer.image.src);
  
  // Apply filters using Sharp
  let buffer = await sharp(layer.image.src)
    .blur(layer.image.filters.blur || 0)
    .modulate({
      brightness: 1 + (layer.image.filters.brightness || 0) / 100,
      saturation: 1 + (layer.image.filters.saturation || 0) / 100
    })
    .toBuffer();
  
  const filteredImage = await loadImage(buffer);
  
  // Apply crop if specified
  if (layer.image.crop) {
    ctx.drawImage(
      filteredImage,
      layer.image.crop.x,
      layer.image.crop.y,
      layer.image.crop.width,
      layer.image.crop.height,
      0,
      0,
      layer.position.width,
      layer.position.height
    );
  } else {
    ctx.drawImage(filteredImage, 0, 0, layer.position.width, layer.position.height);
  }
}

function renderTextLayer(ctx, layer) {
  const text = layer.text;
  
  // Set font
  let fontStyle = '';
  if (text.bold) fontStyle += 'bold ';
  if (text.italic) fontStyle += 'italic ';
  ctx.font = `${fontStyle}${text.fontSize}px ${text.font}`;
  
  // Set alignment
  ctx.textAlign = text.align;
  ctx.textBaseline = 'top';
  
  // Apply shadow
  if (text.shadow) {
    ctx.shadowOffsetX = text.shadow.offsetX;
    ctx.shadowOffsetY = text.shadow.offsetY;
    ctx.shadowBlur = text.shadow.blur;
    ctx.shadowColor = text.shadow.color;
  }
  
  // Apply stroke
  if (text.stroke) {
    ctx.strokeStyle = text.stroke.color;
    ctx.lineWidth = text.stroke.width;
    ctx.strokeText(text.content, 0, 0);
  }
  
  // Fill text
  ctx.fillStyle = text.color;
  ctx.fillText(text.content, 0, 0);
}
```

#### Worker Threads for Batch Generation

```javascript
const { Worker } = require('worker_threads');
const path = require('path');

async function batchGenerate(templateId, contentIds, sizes) {
  const workerCount = Math.min(contentIds.length, 4); // Max 4 workers
  const workers = [];
  const results = [];
  
  // Create worker pool
  for (let i = 0; i < workerCount; i++) {
    const worker = new Worker(path.join(__dirname, 'banner-worker.js'));
    workers.push(worker);
  }
  
  // Distribute work
  const workItems = contentIds.flatMap(contentId =>
    sizes.map(size => ({ templateId, contentId, size }))
  );
  
  let workIndex = 0;
  
  return new Promise((resolve, reject) => {
    workers.forEach((worker, workerIndex) => {
      worker.on('message', (result) => {
        results.push(result);
        
        // Send next work item
        if (workIndex < workItems.length) {
          worker.postMessage(workItems[workIndex++]);
        } else {
          // No more work, terminate worker
          worker.terminate();
          
          // Check if all workers done
          if (results.length === workItems.length) {
            resolve(results);
          }
        }
      });
      
      worker.on('error', reject);
      
      // Send initial work
      if (workIndex < workItems.length) {
        worker.postMessage(workItems[workIndex++]);
      }
    });
  });
}
```

#### Cache Implementation

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 86400 }); // 24 hours

async function getCachedBanner(bannerId, size, format) {
  const cacheKey = `banner:${bannerId}:${size}:${format}`;
  
  // Check memory cache
  let cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Check database cache
  const result = await pool.query(
    `SELECT url, cdn_url FROM banner_cache 
     WHERE banner_id = $1 AND size = $2 AND format = $3 
     AND expires_at > NOW()`,
    [bannerId, size, format]
  );
  
  if (result.rows.length > 0) {
    cached = result.rows[0].cdn_url || result.rows[0].url;
    cache.set(cacheKey, cached);
    return cached;
  }
  
  return null;
}

async function setCachedBanner(bannerId, size, format, url, cdnUrl) {
  const cacheKey = `banner:${bannerId}:${size}:${format}`;
  
  // Set memory cache
  cache.set(cacheKey, cdnUrl || url);
  
  // Set database cache
  await pool.query(
    `INSERT INTO banner_cache (banner_id, size, format, url, cdn_url, expires_at)
     VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '24 hours')
     ON CONFLICT (banner_id, size, format) 
     DO UPDATE SET url = $4, cdn_url = $5, expires_at = NOW() + INTERVAL '24 hours'`,
    [bannerId, size, format, url, cdnUrl]
  );
}

async function invalidateBannerCache(bannerId) {
  // Clear memory cache
  const keys = cache.keys();
  keys.forEach(key => {
    if (key.startsWith(`banner:${bannerId}:`)) {
      cache.del(key);
    }
  });
  
  // Clear database cache
  await pool.query('DELETE FROM banner_cache WHERE banner_id = $1', [bannerId]);
}
```

#### CDN Integration (Cloudflare)

```javascript
const FormData = require('form-data');
const axios = require('axios');

async function uploadToCDN(buffer, filename) {
  const formData = new FormData();
  formData.append('file', buffer, filename);
  
  const response = await axios.post(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`,
    formData,
    {
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        ...formData.getHeaders()
      }
    }
  );
  
  return response.data.result.variants[0]; // CDN URL
}

async function invalidateCDNCache(urls) {
  await axios.post(
    `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`,
    { files: urls },
    {
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );
}
```

### Social Media Integration

#### OAuth 2.0 Flow

```javascript
// Facebook OAuth
app.get('/api/social/connect/facebook', (req, res) => {
  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
    `client_id=${FACEBOOK_APP_ID}` +
    `&redirect_uri=${REDIRECT_URI}` +
    `&scope=pages_manage_posts,pages_read_engagement`;
  
  res.redirect(authUrl);
});

app.get('/api/social/callback/facebook', async (req, res) => {
  const { code } = req.query;
  
  // Exchange code for access token
  const tokenResponse = await axios.get(
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
    `client_id=${FACEBOOK_APP_ID}` +
    `&client_secret=${FACEBOOK_APP_SECRET}` +
    `&code=${code}` +
    `&redirect_uri=${REDIRECT_URI}`
  );
  
  const { access_token } = tokenResponse.data;
  
  // Store encrypted token
  await pool.query(
    `INSERT INTO social_accounts (platform, access_token, created_by)
     VALUES ('facebook', $1, $2)`,
    [encrypt(access_token), req.user.id]
  );
  
  res.redirect('/banner-generator?social=connected');
});
```

#### Publishing to Social Media

```javascript
async function publishToFacebook(bannerId, accountId, caption, hashtags) {
  // Get account
  const account = await pool.query(
    'SELECT access_token FROM social_accounts WHERE id = $1',
    [accountId]
  );
  
  const accessToken = decrypt(account.rows[0].access_token);
  
  // Get banner URL
  const bannerUrl = await getCachedBanner(bannerId, '1200x628', 'jpg');
  
  // Upload photo to Facebook
  const response = await axios.post(
    `https://graph.facebook.com/v18.0/me/photos`,
    {
      url: bannerUrl,
      caption: `${caption}\n\n${hashtags.join(' ')}`,
      access_token: accessToken
    }
  );
  
  // Store publication record
  await pool.query(
    `INSERT INTO social_publications 
     (banner_id, account_id, platform, post_id, post_url, caption, status, published_at)
     VALUES ($1, $2, 'facebook', $3, $4, $5, 'published', NOW())`,
    [
      bannerId,
      accountId,
      response.data.id,
      `https://facebook.com/${response.data.id}`,
      caption
    ]
  );
  
  return response.data;
}
```

### Webhook Implementation

```javascript
async function sendWebhook(event, payload) {
  const webhooks = await pool.query(
    `SELECT id, url, secret FROM webhooks 
     WHERE is_active = true AND $1 = ANY(events)`,
    [event]
  );
  
  for (const webhook of webhooks.rows) {
    await sendWebhookWithRetry(webhook, event, payload);
  }
}

async function sendWebhookWithRetry(webhook, event, payload, attempt = 1) {
  const maxAttempts = 5;
  const backoffMs = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
  
  try {
    const response = await axios.post(
      webhook.url,
      {
        event,
        payload,
        timestamp: new Date().toISOString()
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': generateSignature(payload, webhook.secret)
        },
        timeout: 10000
      }
    );
    
    // Log success
    await pool.query(
      `INSERT INTO webhook_logs (webhook_id, event, payload, response_status, attempt)
       VALUES ($1, $2, $3, $4, $5)`,
      [webhook.id, event, payload, response.status, attempt]
    );
    
  } catch (error) {
    // Log failure
    await pool.query(
      `INSERT INTO webhook_logs (webhook_id, event, payload, response_status, response_body, attempt)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [webhook.id, event, payload, error.response?.status, error.message, attempt]
    );
    
    // Retry with backoff
    if (attempt < maxAttempts) {
      setTimeout(() => {
        sendWebhookWithRetry(webhook, event, payload, attempt + 1);
      }, backoffMs);
    }
  }
}

function generateSignature(payload, secret) {
  const crypto = require('crypto');
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
}
```


## Performance Optimization

### Frontend Optimizations

#### 1. Lazy Loading and Code Splitting

```typescript
// Lazy load heavy components
const BannerEditor = lazy(() => import('./components/BannerEditor'));
const BatchGenerator = lazy(() => import('./components/BatchGenerator'));
const SocialPublisher = lazy(() => import('./components/SocialPublisher'));

// Route-based code splitting
<Routes>
  <Route path="/banners" element={
    <Suspense fallback={<LoadingSpinner />}>
      <BannerGallery />
    </Suspense>
  } />
  <Route path="/banners/edit/:id" element={
    <Suspense fallback={<LoadingSpinner />}>
      <BannerEditor />
    </Suspense>
  } />
</Routes>
```

#### 2. Virtual Scrolling for Large Lists

```typescript
import { FixedSizeGrid } from 'react-window';

function BannerGallery({ banners }) {
  return (
    <FixedSizeGrid
      columnCount={4}
      columnWidth={300}
      height={800}
      rowCount={Math.ceil(banners.length / 4)}
      rowHeight={250}
      width={1200}
    >
      {({ columnIndex, rowIndex, style }) => {
        const index = rowIndex * 4 + columnIndex;
        const banner = banners[index];
        return banner ? (
          <div style={style}>
            <BannerCard banner={banner} />
          </div>
        ) : null;
      }}
    </FixedSizeGrid>
  );
}
```

#### 3. Debounced Search and Filters

```typescript
import { useDebouncedCallback } from 'use-debounce';

function SearchBar({ onSearch }) {
  const debouncedSearch = useDebouncedCallback(
    (value) => onSearch(value),
    500 // 500ms delay
  );
  
  return (
    <input
      type="text"
      onChange={(e) => debouncedSearch(e.target.value)}
      placeholder="Buscar banners..."
    />
  );
}
```

#### 4. Memoization of Expensive Computations

```typescript
import { useMemo } from 'react';

function LayersPanel({ layers, selectedLayerId }) {
  // Memoize sorted layers
  const sortedLayers = useMemo(() => {
    return [...layers].sort((a, b) => b.zIndex - a.zIndex);
  }, [layers]);
  
  // Memoize filtered layers
  const visibleLayers = useMemo(() => {
    return sortedLayers.filter(layer => layer.visible);
  }, [sortedLayers]);
  
  return (
    <div>
      {visibleLayers.map(layer => (
        <LayerItem key={layer.id} layer={layer} />
      ))}
    </div>
  );
}
```

#### 5. Canvas Rendering Optimization

```typescript
// Only re-render canvas when config changes
const CanvasRenderer = memo(({ config }) => {
  // ... rendering logic
}, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.config) === JSON.stringify(nextProps.config);
});

// Use requestAnimationFrame for smooth animations
function animateLayer(layer, animation) {
  let startTime = null;
  
  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = (timestamp - startTime) / (animation.duration * 1000);
    
    if (progress < 1) {
      updateLayerPosition(layer, progress);
      requestAnimationFrame(animate);
    } else {
      updateLayerPosition(layer, 1);
    }
  }
  
  requestAnimationFrame(animate);
}
```

### Backend Optimizations

#### 1. Database Query Optimization

```sql
-- Create composite indexes for common queries
CREATE INDEX idx_banners_folder_created ON banners(folder_id, created_at DESC);
CREATE INDEX idx_banners_favorite_created ON banners(is_favorite, created_at DESC) WHERE is_favorite = true;

-- Use JSONB indexes for config queries
CREATE INDEX idx_banners_config_type ON banners USING GIN ((config -> 'type'));

-- Optimize tag queries with GIN index
CREATE INDEX idx_banner_tags_gin ON banner_tag_relations USING GIN (tag_id);
```

```javascript
// Use pagination with cursor-based approach for better performance
async function getBanners(folderId, lastId, limit = 50) {
  const query = `
    SELECT b.*, 
           array_agg(t.name) as tags
    FROM banners b
    LEFT JOIN banner_tag_relations btr ON b.id = btr.banner_id
    LEFT JOIN banner_tags t ON btr.tag_id = t.id
    WHERE b.folder_id = $1
      AND ($2::integer IS NULL OR b.id < $2)
    GROUP BY b.id
    ORDER BY b.created_at DESC
    LIMIT $3
  `;
  
  return await pool.query(query, [folderId, lastId, limit]);
}
```

#### 2. Connection Pooling

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

#### 3. Image Processing Optimization

```javascript
const sharp = require('sharp');

async function optimizeImage(buffer, format, quality = 85) {
  let pipeline = sharp(buffer);
  
  // Resize if too large
  const metadata = await pipeline.metadata();
  if (metadata.width > 4096 || metadata.height > 4096) {
    pipeline = pipeline.resize(4096, 4096, {
      fit: 'inside',
      withoutEnlargement: true
    });
  }
  
  // Convert to target format with optimization
  switch (format) {
    case 'webp':
      pipeline = pipeline.webp({ quality, effort: 4 });
      break;
    case 'avif':
      pipeline = pipeline.avif({ quality, effort: 4 });
      break;
    case 'jpg':
      pipeline = pipeline.jpeg({ quality, progressive: true, mozjpeg: true });
      break;
    case 'png':
      pipeline = pipeline.png({ compressionLevel: 9, adaptiveFiltering: true });
      break;
  }
  
  return await pipeline.toBuffer();
}
```

#### 4. Caching Strategy

```javascript
// Multi-level caching: Memory → Redis → Database → CDN

const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

async function getCachedData(key) {
  // Level 1: Memory cache (fastest)
  let data = memoryCache.get(key);
  if (data) return data;
  
  // Level 2: Redis cache (fast)
  data = await redis.get(key);
  if (data) {
    memoryCache.set(key, data);
    return JSON.parse(data);
  }
  
  // Level 3: Database cache (slower)
  const result = await pool.query(
    'SELECT data FROM cache WHERE key = $1 AND expires_at > NOW()',
    [key]
  );
  
  if (result.rows.length > 0) {
    data = result.rows[0].data;
    await redis.setex(key, 3600, JSON.stringify(data));
    memoryCache.set(key, data);
    return data;
  }
  
  return null;
}

async function setCachedData(key, data, ttl = 3600) {
  // Set all cache levels
  memoryCache.set(key, data);
  await redis.setex(key, ttl, JSON.stringify(data));
  await pool.query(
    `INSERT INTO cache (key, data, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '${ttl} seconds')
     ON CONFLICT (key) DO UPDATE SET data = $2, expires_at = NOW() + INTERVAL '${ttl} seconds'`,
    [key, data]
  );
}
```

#### 5. Worker Thread Pool

```javascript
const { Worker } = require('worker_threads');
const os = require('os');

class WorkerPool {
  constructor(workerScript, poolSize = os.cpus().length) {
    this.workerScript = workerScript;
    this.poolSize = poolSize;
    this.workers = [];
    this.queue = [];
    
    // Initialize workers
    for (let i = 0; i < poolSize; i++) {
      this.addWorker();
    }
  }
  
  addWorker() {
    const worker = new Worker(this.workerScript);
    worker.isAvailable = true;
    
    worker.on('message', (result) => {
      worker.currentTask.resolve(result);
      worker.isAvailable = true;
      this.processQueue();
    });
    
    worker.on('error', (error) => {
      worker.currentTask.reject(error);
      worker.isAvailable = true;
      this.processQueue();
    });
    
    this.workers.push(worker);
  }
  
  async execute(data) {
    return new Promise((resolve, reject) => {
      this.queue.push({ data, resolve, reject });
      this.processQueue();
    });
  }
  
  processQueue() {
    if (this.queue.length === 0) return;
    
    const availableWorker = this.workers.find(w => w.isAvailable);
    if (!availableWorker) return;
    
    const task = this.queue.shift();
    availableWorker.isAvailable = false;
    availableWorker.currentTask = task;
    availableWorker.postMessage(task.data);
  }
  
  terminate() {
    this.workers.forEach(worker => worker.terminate());
  }
}

// Usage
const bannerWorkerPool = new WorkerPool('./workers/banner-generator.js', 4);

async function generateBannerAsync(config) {
  return await bannerWorkerPool.execute(config);
}
```

### Database Optimization

#### 1. Partitioning for Large Tables

```sql
-- Partition banner_versions by date for better performance
CREATE TABLE banner_versions_2024_01 PARTITION OF banner_versions
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE banner_versions_2024_02 PARTITION OF banner_versions
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Automatic partition creation via cron job
```

#### 2. Materialized Views for Analytics

```sql
-- Create materialized view for banner statistics
CREATE MATERIALIZED VIEW banner_stats AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  type,
  COUNT(*) as count,
  COUNT(DISTINCT created_by) as unique_users
FROM banners
GROUP BY DATE_TRUNC('day', created_at), type;

CREATE INDEX idx_banner_stats_date ON banner_stats(date DESC);

-- Refresh periodically
REFRESH MATERIALIZED VIEW CONCURRENTLY banner_stats;
```

#### 3. Cleanup Jobs

```javascript
// Scheduled cleanup of old data
const cron = require('node-cron');

// Clean old versions (keep last 50 per banner)
cron.schedule('0 2 * * *', async () => {
  await pool.query(`
    DELETE FROM banner_versions
    WHERE id IN (
      SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY banner_id ORDER BY created_at DESC) as rn
        FROM banner_versions
      ) t
      WHERE rn > 50
    )
  `);
});

// Clean expired cache entries
cron.schedule('0 3 * * *', async () => {
  await pool.query('DELETE FROM banner_cache WHERE expires_at < NOW()');
  await pool.query('DELETE FROM cache WHERE expires_at < NOW()');
});

// Clean old webhook logs (keep last 30 days)
cron.schedule('0 4 * * *', async () => {
  await pool.query(`
    DELETE FROM webhook_logs 
    WHERE created_at < NOW() - INTERVAL '30 days'
  `);
});
```

### CDN and Asset Delivery

#### 1. Responsive Images

```javascript
// Generate multiple sizes for responsive delivery
async function generateResponsiveSizes(buffer) {
  const sizes = [400, 800, 1200, 1920];
  const formats = ['webp', 'jpg'];
  const results = [];
  
  for (const size of sizes) {
    for (const format of formats) {
      const resized = await sharp(buffer)
        .resize(size, null, { withoutEnlargement: true })
        [format]({ quality: 85 })
        .toBuffer();
      
      const url = await uploadToCDN(resized, `banner-${size}w.${format}`);
      results.push({ size, format, url });
    }
  }
  
  return results;
}

// HTML srcset generation
function generateSrcSet(responsiveSizes) {
  const webpSizes = responsiveSizes.filter(s => s.format === 'webp');
  const jpgSizes = responsiveSizes.filter(s => s.format === 'jpg');
  
  return {
    webp: webpSizes.map(s => `${s.url} ${s.size}w`).join(', '),
    jpg: jpgSizes.map(s => `${s.url} ${s.size}w`).join(', ')
  };
}
```

#### 2. Lazy Loading with Intersection Observer

```typescript
function LazyImage({ src, alt, placeholder }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsLoaded(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <img
      ref={imgRef}
      src={isLoaded ? src : placeholder}
      alt={alt}
      loading="lazy"
    />
  );
}
```

### Monitoring and Metrics

```javascript
// Performance monitoring middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
    
    // Send metrics to monitoring service
    metrics.timing('http.request.duration', duration, {
      method: req.method,
      path: req.path,
      status: res.statusCode
    });
  });
  
  next();
});

// Track banner generation performance
async function generateBannerWithMetrics(config) {
  const start = Date.now();
  
  try {
    const result = await generateBanner(config);
    const duration = Date.now() - start;
    
    metrics.timing('banner.generation.duration', duration, {
      type: config.type,
      layers: config.layers.length
    });
    
    return result;
  } catch (error) {
    metrics.increment('banner.generation.error', {
      type: config.type,
      error: error.message
    });
    throw error;
  }
}
```


## Security Considerations

### Authentication and Authorization

#### 1. JWT Token Management

```javascript
const jwt = require('jsonwebtoken');

// Generate token with appropriate expiration
function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Verify token middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: { code: 'AUTHENTICATION_ERROR', message: 'Token não fornecido' } });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: { code: 'AUTHENTICATION_ERROR', message: 'Token inválido ou expirado' } });
  }
}
```

#### 2. API Key Authentication

```javascript
const crypto = require('crypto');

// Generate secure API key
function generateApiKey() {
  return crypto.randomBytes(32).toString('hex');
}

// API key middleware
async function apiKeyMiddleware(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: { code: 'AUTHENTICATION_ERROR', message: 'API key não fornecida' } });
  }
  
  // Check if key exists and is active
  const result = await pool.query(
    'SELECT id, rate_limit, created_by FROM api_keys WHERE key = $1 AND is_active = true',
    [apiKey]
  );
  
  if (result.rows.length === 0) {
    return res.status(401).json({ error: { code: 'AUTHENTICATION_ERROR', message: 'API key inválida' } });
  }
  
  req.apiKey = result.rows[0];
  next();
}
```

#### 3. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL);

// General rate limiter
const generalLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:general:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: { code: 'RATE_LIMIT_ERROR', message: 'Muitas requisições. Tente novamente mais tarde.' } }
});

// API key specific rate limiter
async function apiKeyRateLimiter(req, res, next) {
  const apiKey = req.apiKey;
  const key = `rl:api:${apiKey.id}`;
  
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, 3600); // 1 hour window
  }
  
  if (current > apiKey.rate_limit) {
    return res.status(429).json({ 
      error: { 
        code: 'RATE_LIMIT_ERROR', 
        message: `Limite de ${apiKey.rate_limit} requisições por hora excedido` 
      } 
    });
  }
  
  res.setHeader('X-RateLimit-Limit', apiKey.rate_limit);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, apiKey.rate_limit - current));
  
  next();
}

// Apply rate limiters
app.use('/api/', generalLimiter);
app.use('/api/public/', apiKeyMiddleware, apiKeyRateLimiter);
```

### Data Protection

#### 1. Input Validation and Sanitization

```javascript
const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const validateBannerCreate = [
  body('type').isIn(['movie', 'series', 'football', 'custom']),
  body('title').trim().isLength({ min: 1, max: 255 }).escape(),
  body('config').isObject(),
  body('config.version').isString(),
  body('config.layers').isArray({ min: 0, max: 100 }),
  body('folder_id').optional().isInt(),
  body('tags').optional().isArray({ max: 20 }),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: { 
          code: 'VALIDATION_ERROR', 
          message: 'Dados inválidos',
          details: errors.array() 
        } 
      });
    }
    next();
  }
];

app.post('/api/banners/create', authMiddleware, validateBannerCreate, bannerController.create);
```

#### 2. SQL Injection Prevention

```javascript
// Always use parameterized queries
async function getBanner(id) {
  // GOOD: Parameterized query
  const result = await pool.query('SELECT * FROM banners WHERE id = $1', [id]);
  
  // BAD: String concatenation (vulnerable to SQL injection)
  // const result = await pool.query(`SELECT * FROM banners WHERE id = ${id}`);
  
  return result.rows[0];
}

// Use prepared statements for repeated queries
const getBannerStatement = {
  name: 'get-banner',
  text: 'SELECT * FROM banners WHERE id = $1',
};

async function getBannerOptimized(id) {
  const result = await pool.query(getBannerStatement, [id]);
  return result.rows[0];
}
```

#### 3. XSS Prevention

```javascript
const xss = require('xss');

// Sanitize user input before storing
function sanitizeInput(input) {
  if (typeof input === 'string') {
    return xss(input, {
      whiteList: {}, // No HTML tags allowed
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script']
    });
  }
  return input;
}

// Sanitize banner configuration
function sanitizeBannerConfig(config) {
  return {
    ...config,
    layers: config.layers.map(layer => ({
      ...layer,
      name: sanitizeInput(layer.name),
      text: layer.text ? {
        ...layer.text,
        content: sanitizeInput(layer.text.content)
      } : undefined
    }))
  };
}
```

#### 4. Encryption of Sensitive Data

```javascript
const crypto = require('crypto');

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Store encrypted social tokens
async function storeSocialToken(platform, accessToken, userId) {
  const encrypted = encrypt(accessToken);
  
  await pool.query(
    `INSERT INTO social_accounts (platform, access_token, created_by)
     VALUES ($1, $2, $3)`,
    [platform, encrypted, userId]
  );
}
```

### File Upload Security

#### 1. File Type Validation

```javascript
const fileType = require('file-type');
const sharp = require('sharp');

async function validateImageUpload(buffer) {
  // Check file type by magic bytes (not just extension)
  const type = await fileType.fromBuffer(buffer);
  
  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
  
  if (!type || !allowedTypes.includes(type.mime)) {
    throw new ValidationError('Tipo de arquivo não permitido');
  }
  
  // Additional validation for images
  try {
    const metadata = await sharp(buffer).metadata();
    
    // Check dimensions
    if (metadata.width > 10000 || metadata.height > 10000) {
      throw new ValidationError('Imagem muito grande. Máximo: 10000x10000px');
    }
    
    // Check file size
    if (buffer.length > 10 * 1024 * 1024) {
      throw new ValidationError('Arquivo muito grande. Máximo: 10MB');
    }
    
  } catch (error) {
    throw new ValidationError('Arquivo de imagem inválido');
  }
  
  return true;
}
```

#### 2. Secure File Storage

```javascript
const path = require('path');
const fs = require('fs').promises;

async function saveUploadedFile(buffer, originalName) {
  // Generate secure filename
  const ext = path.extname(originalName);
  const filename = `${crypto.randomBytes(16).toString('hex')}${ext}`;
  
  // Store in organized directory structure
  const date = new Date();
  const dir = path.join(
    'uploads',
    date.getFullYear().toString(),
    (date.getMonth() + 1).toString().padStart(2, '0')
  );
  
  // Create directory if it doesn't exist
  await fs.mkdir(dir, { recursive: true });
  
  const filepath = path.join(dir, filename);
  
  // Write file
  await fs.writeFile(filepath, buffer);
  
  return filepath;
}
```

### CORS Configuration

```javascript
const cors = require('cors');

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://maxxcontrol-frontend.onrender.com',
      'http://localhost:5173'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
};

app.use(cors(corsOptions));
```

### Security Headers

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.cloudflare.com'],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### Audit Logging

```javascript
async function logAuditEvent(userId, action, resource, details) {
  await pool.query(
    `INSERT INTO audit_logs (user_id, action, resource, details, ip_address, user_agent, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
    [
      userId,
      action,
      resource,
      JSON.stringify(details),
      req.ip,
      req.headers['user-agent']
    ]
  );
}

// Log sensitive operations
app.post('/api/banners/:id', authMiddleware, async (req, res) => {
  // ... update banner logic
  
  await logAuditEvent(
    req.user.id,
    'banner.update',
    `banner:${req.params.id}`,
    { changes: req.body }
  );
  
  res.json({ success: true });
});
```


## Deployment Strategy

### Environment Configuration

#### Development Environment
```bash
# .env.development
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://localhost:5432/maxxcontrol_dev
USE_SQLITE=true

# JWT
JWT_SECRET=dev_secret_key_change_in_production

# Redis (optional in dev)
REDIS_URL=redis://localhost:6379

# CDN (use local storage in dev)
USE_CDN=false
UPLOAD_DIR=./public/uploads

# External APIs
TMDB_API_KEY=your_tmdb_key
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Feature Flags
ENABLE_BATCH_GENERATION=true
ENABLE_SOCIAL_INTEGRATION=true
ENABLE_PUBLIC_API=true
```

#### Production Environment
```bash
# .env.production
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@supabase.co:5432/maxxcontrol

# JWT (use strong secret)
JWT_SECRET=<generate-with-openssl-rand-base64-32>

# Redis (required in production)
REDIS_URL=redis://redis.render.com:6379

# CDN
USE_CDN=true
CDN_PROVIDER=cloudflare
CLOUDFLARE_ACCOUNT_ID=xxx
CLOUDFLARE_API_TOKEN=xxx
CLOUDFLARE_ZONE_ID=xxx

# External APIs
TMDB_API_KEY=production_tmdb_key
FACEBOOK_APP_ID=production_facebook_app_id
FACEBOOK_APP_SECRET=production_facebook_app_secret
INSTAGRAM_APP_ID=production_instagram_app_id
INSTAGRAM_APP_SECRET=production_instagram_app_secret
TWITTER_API_KEY=production_twitter_key
TWITTER_API_SECRET=production_twitter_secret

# Feature Flags
ENABLE_BATCH_GENERATION=true
ENABLE_SOCIAL_INTEGRATION=true
ENABLE_PUBLIC_API=true

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Database Migrations

```javascript
// database/migrations/001-create-banner-tables.js
module.exports = {
  up: async (pool) => {
    // Create banner_templates table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS banner_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        config JSONB NOT NULL,
        preview_url VARCHAR(500),
        is_system BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    
    // Create banner_folders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS banner_folders (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        parent_id INTEGER REFERENCES banner_folders(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    
    // Update existing banners table
    await pool.query(`
      ALTER TABLE banners 
      ADD COLUMN IF NOT EXISTS template_id INTEGER REFERENCES banner_templates(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS folder_id INTEGER REFERENCES banner_folders(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
    `);
    
    // Create remaining tables...
    // (banner_tags, banner_tag_relations, banner_versions, etc.)
  },
  
  down: async (pool) => {
    await pool.query('DROP TABLE IF EXISTS banner_cache CASCADE');
    await pool.query('DROP TABLE IF EXISTS webhook_logs CASCADE');
    await pool.query('DROP TABLE IF EXISTS webhooks CASCADE');
    await pool.query('DROP TABLE IF EXISTS social_publications CASCADE');
    await pool.query('DROP TABLE IF EXISTS social_accounts CASCADE');
    await pool.query('DROP TABLE IF EXISTS banner_assets CASCADE');
    await pool.query('DROP TABLE IF EXISTS banner_versions CASCADE');
    await pool.query('DROP TABLE IF EXISTS banner_tag_relations CASCADE');
    await pool.query('DROP TABLE IF EXISTS banner_tags CASCADE');
    await pool.query('DROP TABLE IF EXISTS banner_folders CASCADE');
    await pool.query('DROP TABLE IF EXISTS banner_templates CASCADE');
  }
};

// Run migrations
const migrations = require('./migrations');
async function runMigrations() {
  for (const migration of migrations) {
    console.log(`Running migration: ${migration.name}`);
    await migration.up(pool);
  }
}
```

### Seed Data

```javascript
// database/seeds/001-default-templates.js
const defaultTemplates = [
  {
    name: 'Lançamento Moderno',
    category: 'Lançamento',
    config: {
      version: '1.0',
      type: 'movie',
      layers: [
        {
          id: 'bg',
          type: 'gradient',
          gradient: {
            type: 'linear',
            angle: 135,
            colors: [
              { offset: 0, color: '#1a1a2e' },
              { offset: 1, color: '#0f0f1e' }
            ]
          }
        },
        {
          id: 'poster',
          type: 'image',
          position: { x: 1200, y: 100, width: 600, height: 900 }
        },
        {
          id: 'title',
          type: 'text',
          text: {
            content: '{{title}}',
            font: 'Montserrat',
            fontSize: 80,
            color: '#FF6A00',
            bold: true,
            shadow: { offsetX: 2, offsetY: 2, blur: 4, color: '#000000' }
          },
          position: { x: 100, y: 200 }
        }
      ]
    }
  },
  // ... 14 more templates
];

async function seedTemplates(pool) {
  for (const template of defaultTemplates) {
    await pool.query(
      `INSERT INTO banner_templates (name, category, config, is_system)
       VALUES ($1, $2, $3, true)
       ON CONFLICT DO NOTHING`,
      [template.name, template.category, JSON.stringify(template.config)]
    );
  }
}
```

### Build Process

```json
// package.json
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "build:frontend": "cd web && npm run build",
    "build": "npm run build:frontend",
    "migrate": "node database/migrations/run-migrations.js",
    "seed": "node database/seeds/run-seeds.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

# Install dependencies for node-canvas
RUN apk add --no-cache \
    build-base \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY web/package*.json ./web/

# Install dependencies
RUN npm ci --only=production
RUN cd web && npm ci --only=production

# Copy application files
COPY . .

# Build frontend
RUN npm run build:frontend

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/maxxcontrol
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=maxxcontrol
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm ci
          cd web && npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Check coverage
        run: npm run test:coverage
      
      - name: Lint
        run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Render
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
        run: |
          curl -X POST \
            -H "Authorization: Bearer $RENDER_API_KEY" \
            https://api.render.com/v1/services/${{ secrets.RENDER_SERVICE_ID }}/deploys
```

### Monitoring and Logging

```javascript
// Setup logging with Winston
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Setup error tracking with Sentry
const Sentry = require('@sentry/node');

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1
  });
  
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.errorHandler());
}
```

### Health Checks

```javascript
// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {}
  };
  
  // Check database
  try {
    await pool.query('SELECT 1');
    health.checks.database = 'ok';
  } catch (error) {
    health.checks.database = 'error';
    health.status = 'degraded';
  }
  
  // Check Redis
  try {
    await redis.ping();
    health.checks.redis = 'ok';
  } catch (error) {
    health.checks.redis = 'error';
    health.status = 'degraded';
  }
  
  // Check CDN
  if (process.env.USE_CDN === 'true') {
    try {
      await axios.get('https://api.cloudflare.com/client/v4/user', {
        headers: { 'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` }
      });
      health.checks.cdn = 'ok';
    } catch (error) {
      health.checks.cdn = 'error';
    }
  }
  
  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

### Backup Strategy

```javascript
// Automated database backups
const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');

// Daily backup at 2 AM
cron.schedule('0 2 * * *', async () => {
  const timestamp = new Date().toISOString().split('T')[0];
  const backupFile = path.join('backups', `maxxcontrol-${timestamp}.sql`);
  
  const command = `pg_dump ${process.env.DATABASE_URL} > ${backupFile}`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      logger.error('Backup failed:', error);
      return;
    }
    
    logger.info(`Backup created: ${backupFile}`);
    
    // Upload to S3 or other storage
    uploadBackupToStorage(backupFile);
    
    // Clean old backups (keep last 30 days)
    cleanOldBackups(30);
  });
});
```

## Conclusion

This design document provides a comprehensive blueprint for transforming the MaxxControl X Banner Generator into a professional-grade graphic design solution. The implementation follows industry best practices for:

- **Architecture**: Modular, scalable design with clear separation of concerns
- **Data Models**: Well-structured schemas with proper relationships and indexes
- **API Design**: RESTful endpoints with consistent patterns and error handling
- **Security**: Multi-layered security with authentication, authorization, encryption, and input validation
- **Performance**: Optimized rendering, caching, CDN integration, and worker threads
- **Testing**: Comprehensive dual testing approach with unit and property-based tests
- **Deployment**: Production-ready configuration with CI/CD, monitoring, and backups

The system is designed to handle the 20 requirements specified in the requirements document, with 30 correctness properties ensuring reliability and correctness across all features.

