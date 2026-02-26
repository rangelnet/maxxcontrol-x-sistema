# 🎨 BRANDING - FAQ E REFERÊNCIA RÁPIDA

## ❓ PERGUNTAS FREQUENTES

### P1: Como alterar o branding sem fazer republish do app?

**R:** O sistema foi feito exatamente para isso! Você altera no painel e o Android busca automaticamente via API.

```
Painel → Alterar cores → Salvar → Android busca → Cores aplicadas
```

Sem precisar republish!

---

### P2: Quantos brandings posso ter?

**R:** Ilimitado! Você pode ter histórico completo de todas as alterações.

```bash
# Listar todos
GET /api/branding
```

---

### P3: Posso reverter para um branding anterior?

**R:** Sim! Todos os brandings são salvos no histórico. Você pode atualizar para qualquer um anterior.

```bash
# Listar histórico
GET /api/branding

# Atualizar para um anterior
PUT /api/branding/{id_anterior}
```

---

### P4: O branding é compartilhado entre todos os usuários?

**R:** Sim! Existe apenas um branding ativo por vez. Todos os usuários veem o mesmo.

Se você quer múltiplas marcas, você precisa de múltiplas instâncias do app.

---

### P5: Posso agendar mudanças de branding?

**R:** Não nativamente, mas você pode:
1. Criar um script que faz requisição PUT em horário específico
2. Usar um serviço como IFTTT ou Zapier
3. Criar um endpoint customizado

---

### P6: Como fazer branding dinâmico por usuário?

**R:** Atualmente o branding é global. Para fazer por usuário, você precisaria:
1. Modificar o banco de dados para adicionar `user_id`
2. Modificar o endpoint para retornar branding do usuário
3. Modificar o Android para enviar `user_id`

---

### P7: Posso usar imagens em vez de cores?

**R:** Sim! Use os campos `logo_url` e `splash_url` para imagens.

Para fundo, você pode:
1. Usar cor sólida (campo `banner_cor_fundo`)
2. Ou modificar o Android para usar `splash_url` como fundo

---

### P8: Qual é o tamanho máximo da URL?

**R:** 500 caracteres (definido no banco de dados).

Se precisar de URLs maiores, modifique o schema:
```sql
ALTER TABLE branding_settings MODIFY logo_url VARCHAR(1000);
```

---

### P9: Posso usar cores RGB em vez de Hex?

**R:** Não diretamente. O sistema usa Hex (#RRGGBB).

Mas você pode converter:
- RGB(255, 106, 0) = #FF6A00
- RGB(0, 0, 0) = #000000

---

### P10: O que acontece se a URL da logo estiver quebrada?

**R:** O Android tentará carregar e falhará silenciosamente. Você pode:
1. Adicionar tratamento de erro no Android
2. Usar uma imagem padrão como fallback
3. Verificar a URL antes de salvar

---

## 🔗 REFERÊNCIA RÁPIDA DE ENDPOINTS

### Endpoints Públicos

```bash
# Obter branding ativo
GET /api/branding/current
```

### Endpoints Protegidos (requer token)

```bash
# Listar todos os brandings
GET /api/branding

# Atualizar branding
PUT /api/branding/:id

# Listar templates
GET /api/branding/templates
```

---

## 🎨 REFERÊNCIA DE CORES

### Cores Padrão

| Nome | Hex | RGB | Uso |
|------|-----|-----|-----|
| Preto | #000000 | 0,0,0 | Fundo padrão |
| Branco | #FFFFFF | 255,255,255 | Texto claro |
| Laranja TV Maxx | #FF6A00 | 255,106,0 | Destaque |
| Vermelho | #FF0000 | 255,0,0 | Alerta |
| Verde | #00AA00 | 0,170,0 | Sucesso |
| Azul | #0000FF | 0,0,255 | Info |
| Amarelo | #FFFF00 | 255,255,0 | Aviso |

---

## 📱 REFERÊNCIA RÁPIDA ANDROID

### Importar Serviço

```java
import com.example.app.services.BrandingService;
import com.example.app.models.BrandingData;
```

### Usar Serviço

```java
BrandingService.fetchBranding(new BrandingService.BrandingCallback() {
    @Override
    public void onSuccess(BrandingData branding) {
        // Aplicar branding
    }
    
    @Override
    public void onError(String error) {
        // Tratar erro
    }
});
```

### Aplicar Cores

```java
// Fundo
view.setBackgroundColor(Color.parseColor(branding.corFundo));

// Texto
textView.setTextColor(Color.parseColor(branding.corTexto));

// Logo
Picasso.get().load(branding.logoUrl).into(imageView);
```

---

## 💻 REFERÊNCIA RÁPIDA JAVASCRIPT

### Importar Serviço

```javascript
import BrandingService from '../services/brandingService';
```

### Usar Serviço

```javascript
// Obter branding
const branding = await BrandingService.getCurrent();

// Atualizar branding
await BrandingService.update(1, data, token);

// Listar templates
const templates = await BrandingService.getTemplates(token);
```

### Aplicar Estilos

```javascript
// Fundo
element.style.backgroundColor = branding.banner_cor_fundo;

// Texto
element.style.color = branding.banner_cor_texto;

// Imagem
image.src = branding.logo_url;
```

---

## 🔐 REFERÊNCIA DE AUTENTICAÇÃO

### Obter Token

```bash
curl -X POST https://maxxcontrol-x-sistema.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@maxxcontrol.com",
    "senha": "Admin@123"
  }'
```

### Usar Token

```bash
curl -H "Authorization: Bearer {token}" \
  https://maxxcontrol-x-sistema.onrender.com/api/branding
```

### Token Expira Em

7 dias (configurável em `.env` com `JWT_EXPIRES_IN`)

---

## 📊 REFERÊNCIA DE CAMPOS

### Campos Obrigatórios

- `banner_titulo` - Título do banner
- `banner_cor_fundo` - Cor de fundo (hex)
- `banner_cor_texto` - Cor do texto (hex)

### Campos Opcionais

- `banner_subtitulo` - Subtítulo
- `logo_url` - URL da logo
- `splash_url` - URL do splash
- `tema` - Tema (dark/light/auto)

### Campos Automáticos

- `id` - ID único
- `ativo` - Status (1=ativo, 0=inativo)
- `criado_em` - Data de criação
- `atualizado_em` - Data de atualização

---

## 🚀 REFERÊNCIA DE DEPLOYMENT

### Fazer Push

```bash
git add .
git commit -m "Mensagem do commit"
git push origin main
```

### Monitorar Deploy

1. Acessar https://dashboard.render.com
2. Selecionar projeto
3. Clicar em "Logs"
4. Aguardar "Your service is live 🎉"

### Testar Após Deploy

```bash
# Backend
curl https://maxxcontrol-x-sistema.onrender.com/api/branding/current

# Frontend
https://maxxcontrol-frontend.onrender.com
```

---

## 🐛 REFERÊNCIA DE ERROS

### Erro 401 - Não Autorizado

```json
{"error": "Token não fornecido"}
```

**Solução:** Adicionar header `Authorization: Bearer {token}`

---

### Erro 404 - Não Encontrado

```json
{"error": "Branding não encontrado"}
```

**Solução:** Verificar se ID existe ou se URL está correta

---

### Erro 500 - Erro Interno

```json
{"error": "Erro ao atualizar branding"}
```

**Solução:** Verificar logs do servidor

---

### Erro de Conexão

```
Failed to fetch
```

**Solução:** Verificar se URL está correta e servidor está online

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

- ✅ Backend implementado
- ✅ Frontend implementado
- ✅ Banco de dados configurado
- ✅ Rotas registradas
- ✅ Menu adicionado
- ✅ Autenticação configurada
- ✅ Testes locais passando
- ✅ Push para GitHub
- ✅ Deploy automático
- ✅ Testes em produção
- ✅ Testes no Android
- ✅ Documentação completa

---

## 📚 DOCUMENTAÇÃO RELACIONADA

- `BRANDING_SISTEMA_DETALHADO.md` - Documentação completa
- `BRANDING_EXEMPLOS_PRATICOS.md` - Exemplos de código
- `BRANDING_DEPLOYMENT_GUIA.md` - Guia de deployment
- `GERENCIAR_BANNER_PAINEL.md` - Guia original
- `INTEGRACAO_ANDROID.md` - Integração Android

---

## 🔗 LINKS ÚTEIS

| Recurso | URL |
|---------|-----|
| Backend | https://maxxcontrol-x-sistema.onrender.com |
| Frontend | https://maxxcontrol-frontend.onrender.com |
| GitHub | https://github.com/rangelnet/maxxcontrol-x-sistema |
| Render Dashboard | https://dashboard.render.com |
| API Docs | `/api/branding/current` |

---

## 💡 DICAS E TRUQUES

### Dica 1: Testar Cores Rapidamente

```bash
# Criar um script que alterna cores
for color in "#FF0000" "#00FF00" "#0000FF"; do
  curl -X PUT https://maxxcontrol-x-sistema.onrender.com/api/branding/1 \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"banner_cor_fundo\": \"$color\"}"
  sleep 2
done
```

---

### Dica 2: Backup de Branding

```bash
# Salvar branding atual
curl https://maxxcontrol-x-sistema.onrender.com/api/branding/current > branding_backup.json

# Restaurar depois
curl -X PUT https://maxxcontrol-x-sistema.onrender.com/api/branding/1 \
  -H "Authorization: Bearer $TOKEN" \
  -d @branding_backup.json
```

---

### Dica 3: Validar Cores Hex

```javascript
function isValidHex(hex) {
  return /^#[0-9A-F]{6}$/i.test(hex);
}

// Uso
console.log(isValidHex("#FF6A00")); // true
console.log(isValidHex("FF6A00"));  // false
```

---

### Dica 4: Converter RGB para Hex

```javascript
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("").toUpperCase();
}

// Uso
console.log(rgbToHex(255, 106, 0)); // #FF6A00
```

---

### Dica 5: Converter Hex para RGB

```javascript
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Uso
console.log(hexToRgb("#FF6A00")); // {r: 255, g: 106, b: 0}
```

---

## 🎯 CASOS DE USO RÁPIDOS

### Caso 1: Mudar para Tema Claro

```bash
curl -X PUT https://maxxcontrol-x-sistema.onrender.com/api/branding/1 \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "banner_cor_fundo": "#FFFFFF",
    "banner_cor_texto": "#000000",
    "tema": "light"
  }'
```

---

### Caso 2: Voltar para Padrão

```bash
curl -X PUT https://maxxcontrol-x-sistema.onrender.com/api/branding/1 \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "banner_titulo": "TV Maxx",
    "banner_subtitulo": "Seu Entretenimento",
    "banner_cor_fundo": "#000000",
    "banner_cor_texto": "#FF6A00",
    "tema": "dark"
  }'
```

---

### Caso 3: Modo Noturno

```bash
curl -X PUT https://maxxcontrol-x-sistema.onrender.com/api/branding/1 \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "banner_cor_fundo": "#1a1a1a",
    "banner_cor_texto": "#e0e0e0",
    "tema": "dark"
  }'
```

---

## 📞 CONTATO E SUPORTE

**Problemas?**
1. Verificar FAQ acima
2. Consultar documentação relacionada
3. Verificar logs do servidor
4. Verificar console do navegador

---

**Última atualização:** 26/02/2026
**Versão:** 1.0.0
**Status:** ✅ COMPLETO
