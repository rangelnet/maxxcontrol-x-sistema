# 🎨 SISTEMA DE BRANDING - DOCUMENTAÇÃO COMPLETA

## 📌 VISÃO GERAL

O sistema de branding permite customizar dinamicamente a aparência do painel e do app Android sem precisar editar código ou fazer republish. Tudo é gerenciado através de APIs e um painel visual intuitivo.

---

## 🏗️ ARQUITETURA DO SISTEMA

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  web/src/pages/Branding.jsx                          │   │
│  │  - Formulário de customização                        │   │
│  │  - Color picker                                      │   │
│  │  - Preview em tempo real                             │   │
│  │  - Templates rápidos                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  modules/branding/brandingController.js              │   │
│  │  - obterBrandingAtivo()                              │   │
│  │  - obterBranding()                                   │   │
│  │  - atualizarBranding()                               │   │
│  │  - listarTemplates()                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  modules/branding/brandingRoutes.js                  │   │
│  │  - GET /api/branding/current                         │   │
│  │  - GET /api/branding                                 │   │
│  │  - PUT /api/branding/:id                             │   │
│  │  - GET /api/branding/templates                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ SQL
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (SQLite)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  branding_settings                                   │   │
│  │  - id (PK)                                           │   │
│  │  - banner_titulo                                     │   │
│  │  - banner_subtitulo                                  │   │
│  │  - banner_cor_fundo                                  │   │
│  │  - banner_cor_texto                                  │   │
│  │  - logo_url                                          │   │
│  │  - splash_url                                        │   │
│  │  - tema                                              │   │
│  │  - ativo                                             │   │
│  │  - criado_em                                         │   │
│  │  - atualizado_em                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 ARQUIVOS IMPLEMENTADOS

### 1. Backend - Controller
**Arquivo:** `modules/branding/brandingController.js`

Funções implementadas:
- `obterBrandingAtivo()` - Retorna o branding ativo
- `obterBranding()` - Lista todos os brandings
- `atualizarBranding()` - Atualiza branding existente
- `listarTemplates()` - Retorna templates pré-configurados

### 2. Backend - Rotas
**Arquivo:** `modules/branding/brandingRoutes.js`

Endpoints:
- `GET /api/branding/current` - Público (sem autenticação)
- `GET /api/branding` - Protegido
- `PUT /api/branding/:id` - Protegido
- `GET /api/branding/templates` - Protegido

### 3. Frontend - Página
**Arquivo:** `web/src/pages/Branding.jsx`

Componentes:
- Formulário de edição
- Color picker para cores
- Preview em tempo real
- Templates rápidos
- Informações de atualização

### 4. Frontend - Integração
**Arquivo:** `web/src/App.jsx`
- Import do componente Branding
- Rota `/branding` protegida por autenticação

**Arquivo:** `web/src/components/Layout.jsx`
- Menu item "Branding" com ícone Palette
- Link para `/branding`

### 5. Banco de Dados
**Arquivo:** `database/setup-sqlite.js`
- Tabela `branding_settings` criada automaticamente
- Dados iniciais inseridos
- Índices para performance

---

## 🔌 ENDPOINTS DA API

### GET /api/branding/current
**Descrição:** Obter branding ativo (público, sem autenticação)

**Resposta (200):**
```json
{
  "id": 1,
  "banner_titulo": "TV Maxx",
  "banner_subtitulo": "Seu Entretenimento",
  "banner_cor_fundo": "#000000",
  "banner_cor_texto": "#FF6A00",
  "logo_url": "https://exemplo.com/logo.png",
  "splash_url": "https://exemplo.com/splash.png",
  "tema": "dark",
  "ativo": 1,
  "criado_em": "2026-02-26T22:10:21.628081",
  "atualizado_em": "2026-02-26T22:10:21.628081"
}
```

**Uso no Android:**
```java
// Buscar branding
GET https://maxxcontrol-x-sistema.onrender.com/api/branding/current

// Aplicar cores
String backgroundColor = response.banner_cor_fundo;
String textColor = response.banner_cor_texto;
String title = response.banner_titulo;
```

---

## 🎨 CAMPOS DO BRANDING

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `banner_titulo` | String | Título principal | "TV Maxx" |
| `banner_subtitulo` | String | Subtítulo | "Seu Entretenimento" |
| `banner_cor_fundo` | String (Hex) | Cor de fundo | "#000000" |
| `banner_cor_texto` | String (Hex) | Cor do texto | "#FF6A00" |
| `logo_url` | String (URL) | URL da logo | "https://..." |
| `splash_url` | String (URL) | URL da splash screen | "https://..." |
| `tema` | String | Tema (dark/light/auto) | "dark" |
| `ativo` | Integer | Status (1=ativo, 0=inativo) | 1 |

---

## 🚀 COMO USAR NO PAINEL

### Passo 1: Acessar a Página
1. Acesse: https://maxxcontrol-frontend.onrender.com
2. Faça login com:
   - Email: `admin@maxxcontrol.com`
   - Senha: `Admin@123`

### Passo 2: Navegar para Branding
1. No menu lateral, clique em "🎨 Branding"
2. Você verá o formulário de customização

### Passo 3: Customizar
1. **Título:** Digite o novo título do banner
2. **Subtítulo:** Digite o novo subtítulo
3. **Cores:**
   - Clique no quadrado colorido para abrir color picker
   - Ou digite o código hex manualmente
4. **URLs:**
   - Cole a URL da logo
   - Cole a URL do splash screen
5. **Tema:** Selecione dark, light ou auto

### Passo 4: Preview
- Veja o preview em tempo real enquanto edita
- As cores são aplicadas instantaneamente

### Passo 5: Salvar
- Clique em "💾 Salvar Branding"
- Aguarde a confirmação
- Pronto! Alterações salvas

---

## 📱 COMO USAR NO ANDROID

### Integração Básica

```java
// 1. Fazer requisição
String url = "https://maxxcontrol-x-sistema.onrender.com/api/branding/current";
OkHttpClient client = new OkHttpClient();
Request request = new Request.Builder()
    .url(url)
    .build();

// 2. Processar resposta
client.newCall(request).enqueue(new Callback() {
    @Override
    public void onResponse(Call call, Response response) throws IOException {
        String json = response.body().string();
        JSONObject branding = new JSONObject(json);
        
        // 3. Extrair dados
        String titulo = branding.getString("banner_titulo");
        String subtitulo = branding.getString("banner_subtitulo");
        String corFundo = branding.getString("banner_cor_fundo");
        String corTexto = branding.getString("banner_cor_texto");
        String logoUrl = branding.getString("logo_url");
        String tema = branding.getString("tema");
        
        // 4. Aplicar no UI
        runOnUiThread(() -> {
            bannerView.setBackgroundColor(Color.parseColor(corFundo));
            titleView.setTextColor(Color.parseColor(corTexto));
            titleView.setText(titulo);
            subtitleView.setText(subtitulo);
            
            // Carregar logo
            Picasso.get().load(logoUrl).into(logoView);
        });
    }
});
```

### Serviço Android Completo

```java
public class BrandingService {
    private static final String API_URL = 
        "https://maxxcontrol-x-sistema.onrender.com/api/branding/current";
    
    public interface BrandingCallback {
        void onSuccess(BrandingData branding);
        void onError(String error);
    }
    
    public static void fetchBranding(BrandingCallback callback) {
        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder()
            .url(API_URL)
            .build();
        
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onResponse(Call call, Response response) {
                try {
                    String json = response.body().string();
                    JSONObject obj = new JSONObject(json);
                    
                    BrandingData data = new BrandingData(
                        obj.getString("banner_titulo"),
                        obj.getString("banner_subtitulo"),
                        obj.getString("banner_cor_fundo"),
                        obj.getString("banner_cor_texto"),
                        obj.getString("logo_url"),
                        obj.getString("splash_url"),
                        obj.getString("tema")
                    );
                    
                    callback.onSuccess(data);
                } catch (Exception e) {
                    callback.onError(e.getMessage());
                }
            }
            
            @Override
            public void onFailure(Call call, IOException e) {
                callback.onError(e.getMessage());
            }
        });
    }
}

// Classe de dados
public class BrandingData {
    public String titulo;
    public String subtitulo;
    public String corFundo;
    public String corTexto;
    public String logoUrl;
    public String splashUrl;
    public String tema;
    
    public BrandingData(String titulo, String subtitulo, 
                       String corFundo, String corTexto,
                       String logoUrl, String splashUrl, String tema) {
        this.titulo = titulo;
        this.subtitulo = subtitulo;
        this.corFundo = corFundo;
        this.corTexto = corTexto;
        this.logoUrl = logoUrl;
        this.splashUrl = splashUrl;
        this.tema = tema;
    }
}
```

### Usar no MainActivity

```java
public class MainActivity extends AppCompatActivity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        // Carregar branding
        BrandingService.fetchBranding(new BrandingService.BrandingCallback() {
            @Override
            public void onSuccess(BrandingData branding) {
                applyBranding(branding);
            }
            
            @Override
            public void onError(String error) {
                Log.e("Branding", "Erro: " + error);
            }
        });
    }
    
    private void applyBranding(BrandingData branding) {
        // Aplicar cores
        View banner = findViewById(R.id.banner);
        banner.setBackgroundColor(Color.parseColor(branding.corFundo));
        
        TextView title = findViewById(R.id.title);
        title.setTextColor(Color.parseColor(branding.corTexto));
        title.setText(branding.titulo);
        
        TextView subtitle = findViewById(R.id.subtitle);
        subtitle.setTextColor(Color.parseColor(branding.corTexto));
        subtitle.setText(branding.subtitulo);
        
        // Carregar logo
        ImageView logo = findViewById(R.id.logo);
        Picasso.get().load(branding.logoUrl).into(logo);
    }
}
```

---

## 🎯 TEMPLATES PRÉ-CONFIGURADOS

O sistema vem com 3 templates rápidos:

### Template 1: TV Maxx Padrão
```json
{
  "nome": "TV Maxx Padrão",
  "descricao": "Template padrão com cores da TV Maxx",
  "banner_cor_fundo": "#000000",
  "banner_cor_texto": "#FF6A00",
  "tema": "dark"
}
```

### Template 2: Claro
```json
{
  "nome": "Claro",
  "descricao": "Template com tema claro",
  "banner_cor_fundo": "#FFFFFF",
  "banner_cor_texto": "#000000",
  "tema": "light"
}
```

### Template 3: Azul Premium
```json
{
  "nome": "Azul Premium",
  "descricao": "Template premium com tons de azul",
  "banner_cor_fundo": "#001F3F",
  "banner_cor_texto": "#00D4FF",
  "tema": "dark"
}
```

---

## 🔐 AUTENTICAÇÃO

### Endpoints Públicos (sem token)
- `GET /api/branding/current` - Qualquer um pode acessar

### Endpoints Protegidos (requer token)
- `GET /api/branding`
- `PUT /api/branding/:id`
- `GET /api/branding/templates`

### Como Obter Token

```bash
# 1. Fazer login
curl -X POST https://maxxcontrol-x-sistema.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@maxxcontrol.com",
    "senha": "Admin@123"
  }'

# Resposta:
{
  "user": {
    "id": 4,
    "nome": "Administrador",
    "email": "admin@maxxcontrol.com",
    "plano": "premium",
    "status": "ativo"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# 2. Usar token em requisições protegidas
curl -X GET https://maxxcontrol-x-sistema.onrender.com/api/branding \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 💾 BANCO DE DADOS - ESTRUTURA

### Tabela: branding_settings

```sql
CREATE TABLE branding_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  banner_titulo TEXT DEFAULT 'TV Maxx',
  banner_subtitulo TEXT DEFAULT 'Seu Entretenimento',
  banner_cor_fundo TEXT DEFAULT '#000000',
  banner_cor_texto TEXT DEFAULT '#FF6A00',
  logo_url TEXT,
  splash_url TEXT,
  tema TEXT DEFAULT 'dark',
  ativo INTEGER DEFAULT 1,
  criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Dados Iniciais

```sql
INSERT INTO branding_settings (
  banner_titulo, 
  banner_subtitulo, 
  banner_cor_fundo, 
  banner_cor_texto, 
  tema, 
  ativo
) VALUES (
  'TV Maxx',
  'Seu Entretenimento',
  '#000000',
  '#FF6A00',
  'dark',
  1
);
```

---

## 🧪 TESTES

### Teste 1: Obter Branding Ativo
```bash
curl https://maxxcontrol-x-sistema.onrender.com/api/branding/current
```

**Esperado:** Retorna JSON com branding ativo

### Teste 2: Atualizar Branding
```bash
curl -X PUT https://maxxcontrol-x-sistema.onrender.com/api/branding/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "banner_titulo": "Novo Título",
    "banner_cor_fundo": "#FF0000",
    "banner_cor_texto": "#FFFFFF"
  }'
```

**Esperado:** Retorna mensagem de sucesso

### Teste 3: Listar Templates
```bash
curl https://maxxcontrol-x-sistema.onrender.com/api/branding/templates \
  -H "Authorization: Bearer {token}"
```

**Esperado:** Retorna array com 3 templates

---

## 🐛 TROUBLESHOOTING

### Problema: "Branding não encontrado"
**Solução:** Execute `database/setup-sqlite.js` para criar dados iniciais

### Problema: Cores não aparecem no Android
**Solução:** Verifique se o código hex está correto (ex: #FF6A00)

### Problema: Logo não carrega
**Solução:** Verifique se a URL é válida e acessível

### Problema: Token expirado
**Solução:** Faça login novamente para obter novo token

---

## 📊 FLUXO COMPLETO

```
1. Usuário acessa painel
   ↓
2. Clica em "Branding"
   ↓
3. Formulário carrega branding atual (GET /api/branding/current)
   ↓
4. Usuário edita cores/textos
   ↓
5. Preview atualiza em tempo real
   ↓
6. Clica "Salvar"
   ↓
7. Requisição PUT /api/branding/:id com dados
   ↓
8. Backend atualiza banco de dados
   ↓
9. Resposta de sucesso
   ↓
10. Android faz GET /api/branding/current
    ↓
11. Recebe dados atualizados
    ↓
12. Aplica cores/textos dinamicamente
    ↓
13. UI atualizada sem republish ✅
```

---

## 🎓 CASOS DE USO

✅ **White-label:** Customize para cada cliente
✅ **Temas sazonais:** Mude cores por época
✅ **Branding dinâmico:** Sem precisar republish
✅ **A/B Testing:** Teste diferentes designs
✅ **Múltiplas marcas:** Gerencie várias identidades
✅ **Promoções:** Altere visual para campanhas

---

## 📞 SUPORTE

**URLs:**
- Backend: https://maxxcontrol-x-sistema.onrender.com
- Frontend: https://maxxcontrol-frontend.onrender.com
- GitHub: https://github.com/rangelnet/maxxcontrol-x-sistema

**Credenciais:**
- Email: admin@maxxcontrol.com
- Senha: Admin@123

**Documentação:**
- `GERENCIAR_BANNER_PAINEL.md` - Guia original
- `INTEGRACAO_ANDROID.md` - Integração Android
- `API_ENDPOINTS.md` - Todos os endpoints

---

**Última atualização:** 26/02/2026
**Status:** ✅ SISTEMA COMPLETO E OPERACIONAL
