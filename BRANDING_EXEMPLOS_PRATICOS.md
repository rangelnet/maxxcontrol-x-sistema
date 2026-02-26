# 🎨 BRANDING - EXEMPLOS PRÁTICOS

## 📚 ÍNDICE
1. [Exemplos cURL](#exemplos-curl)
2. [Exemplos JavaScript](#exemplos-javascript)
3. [Exemplos Android](#exemplos-android)
4. [Casos de Uso Reais](#casos-de-uso-reais)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 EXEMPLOS cURL

### Exemplo 1: Obter Branding Ativo (Público)

```bash
curl -X GET https://maxxcontrol-x-sistema.onrender.com/api/branding/current
```

**Resposta:**
```json
{
  "id": 1,
  "banner_titulo": "TV Maxx",
  "banner_subtitulo": "Seu Entretenimento",
  "banner_cor_fundo": "#000000",
  "banner_cor_texto": "#FF6A00",
  "logo_url": null,
  "splash_url": null,
  "tema": "dark",
  "ativo": 1,
  "criado_em": "2026-02-26 22:10:21",
  "atualizado_em": "2026-02-26 22:10:21"
}
```

---

### Exemplo 2: Fazer Login e Obter Token

```bash
curl -X POST https://maxxcontrol-x-sistema.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@maxxcontrol.com",
    "senha": "Admin@123"
  }'
```

**Resposta:**
```json
{
  "user": {
    "id": 4,
    "nome": "Administrador",
    "email": "admin@maxxcontrol.com",
    "plano": "premium",
    "status": "ativo"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJhZG1pbkBtYXh4Y29udHJvbC5jb20iLCJpYXQiOjE3NDU4MzI0MjEsImV4cCI6MTc0NjQzNzIyMX0.abc123..."
}
```

**Salvar o token:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Exemplo 3: Atualizar Branding (Cores Vermelhas)

```bash
TOKEN="seu_token_aqui"

curl -X PUT https://maxxcontrol-x-sistema.onrender.com/api/branding/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "banner_titulo": "Promoção Especial",
    "banner_subtitulo": "Desconto de 50%",
    "banner_cor_fundo": "#FF0000",
    "banner_cor_texto": "#FFFFFF",
    "logo_url": "https://exemplo.com/logo-promo.png",
    "splash_url": "https://exemplo.com/splash-promo.png",
    "tema": "dark"
  }'
```

**Resposta:**
```json
{
  "message": "Branding atualizado com sucesso"
}
```

---

### Exemplo 4: Atualizar para Tema Claro

```bash
TOKEN="seu_token_aqui"

curl -X PUT https://maxxcontrol-x-sistema.onrender.com/api/branding/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "banner_titulo": "TV Maxx",
    "banner_subtitulo": "Seu Entretenimento",
    "banner_cor_fundo": "#FFFFFF",
    "banner_cor_texto": "#000000",
    "tema": "light"
  }'
```

---

### Exemplo 5: Listar Templates

```bash
TOKEN="seu_token_aqui"

curl -X GET https://maxxcontrol-x-sistema.onrender.com/api/branding/templates \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta:**
```json
[
  {
    "id": 1,
    "nome": "TV Maxx Padrão",
    "descricao": "Template padrão com cores da TV Maxx",
    "banner_cor_fundo": "#000000",
    "banner_cor_texto": "#FF6A00",
    "tema": "dark"
  },
  {
    "id": 2,
    "nome": "Claro",
    "descricao": "Template com tema claro",
    "banner_cor_fundo": "#FFFFFF",
    "banner_cor_texto": "#000000",
    "tema": "light"
  },
  {
    "id": 3,
    "nome": "Azul Premium",
    "descricao": "Template premium com tons de azul",
    "banner_cor_fundo": "#001F3F",
    "banner_cor_texto": "#00D4FF",
    "tema": "dark"
  }
]
```

---

## 💻 EXEMPLOS JAVASCRIPT

### Exemplo 1: Fetch Branding (Vanilla JS)

```javascript
// Obter branding ativo
async function getBranding() {
  try {
    const response = await fetch(
      'https://maxxcontrol-x-sistema.onrender.com/api/branding/current'
    );
    const branding = await response.json();
    
    console.log('Branding:', branding);
    
    // Aplicar no DOM
    document.getElementById('banner').style.backgroundColor = branding.banner_cor_fundo;
    document.getElementById('title').style.color = branding.banner_cor_texto;
    document.getElementById('title').textContent = branding.banner_titulo;
    
    return branding;
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Chamar
getBranding();
```

---

### Exemplo 2: Login e Atualizar Branding

```javascript
async function loginAndUpdateBranding() {
  try {
    // 1. Fazer login
    const loginResponse = await fetch(
      'https://maxxcontrol-x-sistema.onrender.com/api/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@maxxcontrol.com',
          senha: 'Admin@123'
        })
      }
    );
    
    const { token } = await loginResponse.json();
    console.log('Token:', token);
    
    // 2. Atualizar branding
    const updateResponse = await fetch(
      'https://maxxcontrol-x-sistema.onrender.com/api/branding/1',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          banner_titulo: 'Novo Título',
          banner_subtitulo: 'Novo Subtítulo',
          banner_cor_fundo: '#FF0000',
          banner_cor_texto: '#FFFFFF',
          tema: 'dark'
        })
      }
    );
    
    const result = await updateResponse.json();
    console.log('Resultado:', result);
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Chamar
loginAndUpdateBranding();
```

---

### Exemplo 3: Classe BrandingService (React)

```javascript
// services/brandingService.js

class BrandingService {
  static API_URL = 'https://maxxcontrol-x-sistema.onrender.com/api/branding';
  
  // Obter branding ativo (público)
  static async getCurrent() {
    const response = await fetch(`${this.API_URL}/current`);
    if (!response.ok) throw new Error('Erro ao obter branding');
    return response.json();
  }
  
  // Listar todos os brandings (protegido)
  static async getAll(token) {
    const response = await fetch(this.API_URL, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erro ao listar brandings');
    return response.json();
  }
  
  // Atualizar branding (protegido)
  static async update(id, data, token) {
    const response = await fetch(`${this.API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro ao atualizar branding');
    return response.json();
  }
  
  // Listar templates (protegido)
  static async getTemplates(token) {
    const response = await fetch(`${this.API_URL}/templates`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erro ao listar templates');
    return response.json();
  }
}

export default BrandingService;
```

---

### Exemplo 4: Hook React para Branding

```javascript
// hooks/useBranding.js

import { useState, useEffect } from 'react';
import BrandingService from '../services/brandingService';

export function useBranding() {
  const [branding, setBranding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    loadBranding();
  }, []);
  
  const loadBranding = async () => {
    try {
      setLoading(true);
      const data = await BrandingService.getCurrent();
      setBranding(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const updateBranding = async (id, data, token) => {
    try {
      const result = await BrandingService.update(id, data, token);
      await loadBranding();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  return { branding, loading, error, updateBranding, reload: loadBranding };
}
```

---

### Exemplo 5: Componente React com Branding

```javascript
// components/BrandingBanner.jsx

import { useBranding } from '../hooks/useBranding';

export default function BrandingBanner() {
  const { branding, loading } = useBranding();
  
  if (loading) return <div>Carregando...</div>;
  if (!branding) return <div>Erro ao carregar branding</div>;
  
  return (
    <div
      style={{
        backgroundColor: branding.banner_cor_fundo,
        color: branding.banner_cor_texto,
        padding: '20px',
        borderRadius: '8px'
      }}
    >
      <h1>{branding.banner_titulo}</h1>
      <p>{branding.banner_subtitulo}</p>
      
      {branding.logo_url && (
        <img 
          src={branding.logo_url} 
          alt="Logo"
          style={{ maxWidth: '200px' }}
        />
      )}
    </div>
  );
}
```

---

## 📱 EXEMPLOS ANDROID

### Exemplo 1: Serviço Básico

```java
// BrandingService.java

import okhttp3.*;
import org.json.JSONObject;
import java.io.IOException;

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
            public void onResponse(Call call, Response response) throws IOException {
                try {
                    String json = response.body().string();
                    JSONObject obj = new JSONObject(json);
                    
                    BrandingData data = new BrandingData(
                        obj.getString("banner_titulo"),
                        obj.getString("banner_subtitulo"),
                        obj.getString("banner_cor_fundo"),
                        obj.getString("banner_cor_texto"),
                        obj.optString("logo_url", ""),
                        obj.optString("splash_url", ""),
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
```

---

### Exemplo 2: Classe de Dados

```java
// BrandingData.java

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

---

### Exemplo 3: Aplicar no MainActivity

```java
// MainActivity.java

import android.graphics.Color;
import android.widget.TextView;
import android.widget.ImageView;
import android.view.View;
import com.squareup.picasso.Picasso;

public class MainActivity extends AppCompatActivity {
    
    private View bannerView;
    private TextView titleView;
    private TextView subtitleView;
    private ImageView logoView;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        // Inicializar views
        bannerView = findViewById(R.id.banner);
        titleView = findViewById(R.id.title);
        subtitleView = findViewById(R.id.subtitle);
        logoView = findViewById(R.id.logo);
        
        // Carregar branding
        loadBranding();
    }
    
    private void loadBranding() {
        BrandingService.fetchBranding(new BrandingService.BrandingCallback() {
            @Override
            public void onSuccess(BrandingData branding) {
                applyBranding(branding);
            }
            
            @Override
            public void onError(String error) {
                Log.e("Branding", "Erro: " + error);
                // Usar valores padrão
                applyDefaultBranding();
            }
        });
    }
    
    private void applyBranding(BrandingData branding) {
        // Aplicar cores
        bannerView.setBackgroundColor(Color.parseColor(branding.corFundo));
        
        titleView.setTextColor(Color.parseColor(branding.corTexto));
        titleView.setText(branding.titulo);
        
        subtitleView.setTextColor(Color.parseColor(branding.corTexto));
        subtitleView.setText(branding.subtitulo);
        
        // Carregar logo se disponível
        if (branding.logoUrl != null && !branding.logoUrl.isEmpty()) {
            Picasso.get()
                .load(branding.logoUrl)
                .into(logoView);
        }
        
        // Aplicar tema
        if ("light".equals(branding.tema)) {
            // Aplicar tema claro
            getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
            );
        }
    }
    
    private void applyDefaultBranding() {
        // Valores padrão
        bannerView.setBackgroundColor(Color.parseColor("#000000"));
        titleView.setTextColor(Color.parseColor("#FF6A00"));
        titleView.setText("TV Maxx");
        subtitleView.setText("Seu Entretenimento");
    }
}
```

---

### Exemplo 4: Fragment com Branding

```java
// BrandingFragment.java

public class BrandingFragment extends Fragment {
    
    private View bannerView;
    private TextView titleView;
    
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                           Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_branding, container, false);
        
        bannerView = view.findViewById(R.id.banner);
        titleView = view.findViewById(R.id.title);
        
        loadBranding();
        
        return view;
    }
    
    private void loadBranding() {
        BrandingService.fetchBranding(new BrandingService.BrandingCallback() {
            @Override
            public void onSuccess(BrandingData branding) {
                if (isAdded()) {
                    bannerView.setBackgroundColor(
                        Color.parseColor(branding.corFundo)
                    );
                    titleView.setTextColor(
                        Color.parseColor(branding.corTexto)
                    );
                    titleView.setText(branding.titulo);
                }
            }
            
            @Override
            public void onError(String error) {
                Log.e("Branding", error);
            }
        });
    }
}
```

---

## 🎯 CASOS DE USO REAIS

### Caso 1: Promoção Especial (Black Friday)

**Painel:**
1. Acesse Branding
2. Clique em template "Azul Premium"
3. Altere título para "BLACK FRIDAY"
4. Altere subtítulo para "Até 70% OFF"
5. Salve

**Resultado:** Android mostra automaticamente as cores azuis e novo texto

---

### Caso 2: Múltiplas Marcas (White-label)

**Cliente 1 - Marca A:**
```json
{
  "banner_titulo": "Marca A",
  "banner_cor_fundo": "#FF0000",
  "banner_cor_texto": "#FFFFFF"
}
```

**Cliente 2 - Marca B:**
```json
{
  "banner_titulo": "Marca B",
  "banner_cor_fundo": "#0000FF",
  "banner_cor_texto": "#FFFFFF"
}
```

Cada cliente vê sua própria marca sem código duplicado!

---

### Caso 3: Tema Sazonal

**Natal:**
```json
{
  "banner_titulo": "Feliz Natal",
  "banner_cor_fundo": "#00AA00",
  "banner_cor_texto": "#FF0000"
}
```

**Ano Novo:**
```json
{
  "banner_titulo": "Feliz Ano Novo",
  "banner_cor_fundo": "#FFD700",
  "banner_cor_texto": "#000000"
}
```

---

### Caso 4: A/B Testing

**Versão A:**
```json
{
  "banner_titulo": "Assine Agora",
  "banner_cor_fundo": "#FF6A00"
}
```

**Versão B:**
```json
{
  "banner_titulo": "Comece Grátis",
  "banner_cor_fundo": "#00AA00"
}
```

Teste qual versão converte mais!

---

## 🐛 TROUBLESHOOTING

### Problema 1: Cores não aparecem no Android

**Causa:** Código hex inválido

**Solução:**
```
✓ Correto: #FF6A00
✗ Errado: FF6A00 (sem #)
✗ Errado: #FF6A (incompleto)
```

---

### Problema 2: Logo não carrega

**Causa:** URL inválida ou inacessível

**Solução:**
```bash
# Testar URL
curl -I https://exemplo.com/logo.png

# Deve retornar 200 OK
```

---

### Problema 3: Token expirado

**Erro:**
```json
{"error": "Token inválido ou expirado"}
```

**Solução:** Fazer login novamente

```bash
curl -X POST https://maxxcontrol-x-sistema.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@maxxcontrol.com","senha":"Admin@123"}'
```

---

### Problema 4: Mudanças não aparecem no Android

**Causa:** Cache do app

**Solução:**
1. Limpar cache do app
2. Forçar atualização: `BrandingService.fetchBranding()`
3. Reiniciar app

---

### Problema 5: Erro 404 no endpoint

**Causa:** URL incorreta

**Solução:** Verificar URL exata
```
✓ Correto: https://maxxcontrol-x-sistema.onrender.com/api/branding/current
✗ Errado: https://maxxcontrol-x-sistema.onrender.com/branding/current
```

---

## 📊 RESUMO DE ENDPOINTS

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/api/branding/current` | Não | Obter branding ativo |
| GET | `/api/branding` | Sim | Listar todos |
| PUT | `/api/branding/:id` | Sim | Atualizar |
| GET | `/api/branding/templates` | Sim | Listar templates |

---

**Última atualização:** 26/02/2026
**Status:** ✅ PRONTO PARA PRODUÇÃO
