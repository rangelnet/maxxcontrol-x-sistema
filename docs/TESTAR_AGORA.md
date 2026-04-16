# 🚀 TESTE RÁPIDO - 3 MINUTOS

## ⏱️ AGUARDE O DEPLOY (2-3 minutos)

O Render está fazendo deploy automático dos commits:
- ✅ `57810ae` - Galeria de banners pública
- ✅ `87b3891` - Dispositivos sem login aparecem no painel

---

## 🧪 TESTE 1: GALERIA DE BANNERS (1 minuto)

### Passo 1: Abrir Galeria
```
https://maxxcontrol-frontend.onrender.com/banners
```

### Passo 2: O que você deve ver
- ⚡ **ÚLTIMAS SÉRIES ADICIONADAS** (10 capas)
- 📚 **TODOS OS CONTEÚDOS** (20 capas)
- Cada capa mostra: título, ano, nota ⭐

### Passo 3: Gerar Banner
1. **Clique em qualquer capa** (ex: Breaking Bad, Game of Thrones)
2. **Escolha um tamanho**:
   - 📱 Cartaz (1080x1920) - vertical
   - 🖥️ Banner (1920x1080) - horizontal
   - 📲 Stories (1080x1920)
   - ⬛ Post Quadrado (1080x1080)
   - 📘 Capa Facebook (820x312)
   - ▶️ YouTube (1280x720)
3. **Banner é gerado e baixado automaticamente**

### ✅ Resultado Esperado
- Banner PNG baixado com o nome do filme/série
- Imagem em alta qualidade do TMDB
- Formatos verticais usam poster, horizontais usam backdrop

---

## 🧪 TESTE 2: DISPOSITIVOS NO PAINEL (30 segundos)

### Passo 1: Abrir Dispositivos
```
https://maxxcontrol-frontend.onrender.com/devices
```

### Passo 2: O que você deve ver
Tabela com seu dispositivo:

| MAC Address | Modelo | Status | Conexão |
|-------------|--------|--------|---------|
| 3C:E5:B4:18:FB:1C | (seu modelo) | 🔵 Ativo | ⚪ OFFLINE |

### Passo 3: Entender Status
- **Status**: Ativo (azul) ou Bloqueado (vermelho)
- **Conexão**: 
  - ⚪ OFFLINE (cinza) = App instalado mas sem login
  - 🟢 ONLINE (verde) = Usuário logado no app

### ✅ Resultado Esperado
- Dispositivo MAC `3C:E5:B4:18:FB:1C` aparece na lista
- Status: Ativo + OFFLINE

---

## 🧪 TESTE 3: API PÚBLICA (10 segundos)

### Testar API Diretamente
```
https://maxxcontrol-x-api.onrender.com/api/content/list
```

### ✅ Resultado Esperado
JSON com 20 conteúdos:
```json
{
  "conteudos": [
    {
      "id": 1,
      "titulo": "Breaking Bad",
      "ano": "2008",
      "nota": 9.5,
      "poster_path": "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
      ...
    },
    ...
  ]
}
```

---

## 🧪 TESTE 4: LOGIN NO APP (quando quiser)

### Passo 1: Abrir App
No dispositivo MAC `3C:E5:B4:18:FB:1C`

### Passo 2: Fazer Login
- Usuário: (seu usuário)
- Senha: (sua senha)

### Passo 3: Verificar Painel
Volte em: https://maxxcontrol-frontend.onrender.com/devices

### ✅ Resultado Esperado
- Status muda para: Ativo + 🟢 ONLINE (bolinha verde piscando)

---

## ❌ SE NÃO FUNCIONAR

### Problema 1: Galeria vazia
**Causa**: Deploy ainda não terminou
**Solução**: Aguarde mais 1-2 minutos e recarregue (F5)

### Problema 2: Dispositivo não aparece
**Causa**: Rota antiga ainda em cache
**Solução**: 
1. Limpe cache do navegador (Ctrl+Shift+Delete)
2. Recarregue (Ctrl+F5)

### Problema 3: Erro 401 na API
**Causa**: Rota ainda com autenticação
**Solução**: Deploy ainda não aplicou mudanças, aguarde

### Problema 4: Imagens não carregam
**Causa**: TMDB bloqueou requisições
**Solução**: Normal, imagens vêm do TMDB e podem ter rate limit

---

## 📊 VERIFICAR DEPLOY

### Opção 1: Dashboard Render
```
https://dashboard.render.com
```
- Veja se serviço está "Live" (verde)

### Opção 2: Testar API
```
https://maxxcontrol-x-api.onrender.com/health
```
- Deve retornar: `{"status":"ok"}`

---

## 🎯 RESUMO DO QUE TESTAR

1. ✅ Galeria mostra 20 conteúdos
2. ✅ Clicar em capa abre seletor de tamanho
3. ✅ Gerar banner funciona e baixa PNG
4. ✅ Dispositivo MAC aparece no painel
5. ✅ Status mostra Ativo + OFFLINE
6. ✅ API pública retorna JSON sem autenticação

---

**Tempo total**: 3 minutos ⏱️

**Pronto para testar!** 🚀
