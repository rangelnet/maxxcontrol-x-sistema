# 🔐 TOKENS TMDB SEPARADOS - CONFIGURAÇÃO FINAL

## ✅ CONFIGURAÇÃO ATUAL

### 🖥️ PAINEL (Backend)
**Token:** `7bc56e27708a9d2069fc999d44a6be0a`

**Onde está:**
- Arquivo: `MaxxControl/maxxcontrol-x-sistema/.env`
- Linha: `TMDB_API_KEY=7bc56e27708a9d2069fc999d44a6be0a`

**Usado para:**
- ✅ Popular conteúdos no banco
- ✅ Buscar filmes/séries no TMDB
- ✅ Gerar banners
- ✅ API do painel

---

### 📱 APP ANDROID
**Token:** `c1869e578c74a007f3521d9609a56285`

**Onde está:**
- Arquivo: `TV-MAXX-PRO-Android/app/src/main/java/com/tvmaxx/pro/core/constants/NetworkConstants.kt`
- Linha: `?: "c1869e578c74a007f3521d9609a56285"`

**Usado para:**
- ✅ Fallback do app
- ✅ Buscar informações de filmes/séries
- ✅ Independente do painel

---

## 🎯 SEPARAÇÃO GARANTIDA

```
┌─────────────────────────────────────────┐
│           PAINEL (Backend)              │
│                                         │
│  Token: 7bc56e27708a9d2069fc999d44a6be0a│
│                                         │
│  • Popular conteúdos                    │
│  • Buscar no TMDB                       │
│  • Gerar banners                        │
└─────────────────────────────────────────┘
                  ↕️
         NÃO SE COMUNICAM
                  ↕️
┌─────────────────────────────────────────┐
│          APP ANDROID                    │
│                                         │
│  Token: c1869e578c74a007f3521d9609a56285│
│                                         │
│  • Buscar filmes/séries                 │
│  • Fallback independente                │
└─────────────────────────────────────────┘
```

---

## 🚀 EXECUTAR AGORA

Agora que os tokens estão separados, execute o script para popular os conteúdos:

```bash
cd MaxxControl/maxxcontrol-x-sistema
npm install axios @supabase/supabase-js dotenv
node scripts/popular-conteudos-automatico.js
```

O script vai usar **APENAS o token do painel** (`7bc56e27708a9d2069fc999d44a6be0a`)

---

## 📊 VERIFICAÇÃO

### Verificar token do PAINEL:
```bash
cd MaxxControl/maxxcontrol-x-sistema
cat .env | grep TMDB_API_KEY
```

Deve mostrar:
```
TMDB_API_KEY=7bc56e27708a9d2069fc999d44a6be0a
```

### Verificar token do APP:
```bash
cd TV-MAXX-PRO-Android
grep -r "c1869e578c74a007f3521d9609a56285" app/src/main/java/com/tvmaxx/pro/core/constants/
```

Deve encontrar o arquivo `NetworkConstants.kt`

---

## 🔒 SEGURANÇA

### ✅ Vantagens dessa configuração:

1. **Tokens separados** - Cada um tem seu próprio token
2. **Sem conflito** - Painel não usa token do app
3. **Independência** - App funciona mesmo se painel cair
4. **Segurança** - Se um token vazar, o outro continua seguro
5. **Controle** - Pode revogar um sem afetar o outro

### ⚠️ Importante:

- **NÃO** compartilhe os tokens publicamente
- **NÃO** commite o `.env` no Git (já está no `.gitignore`)
- **NÃO** exponha os tokens no frontend
- **SIM** mantenha os tokens apenas no backend/app

---

## 📝 RESUMO

| Item | Painel | App |
|------|--------|-----|
| Token | `7bc56e27...` | `c1869e57...` |
| Arquivo | `.env` | `NetworkConstants.kt` |
| Uso | Popular conteúdos | Buscar filmes |
| Exposto | ❌ Não (backend) | ⚠️ Sim (fallback) |
| Pode mudar | ✅ Sim (no .env) | ⚠️ Precisa recompilar |

---

## 🎉 PRONTO!

Sua configuração está perfeita:

✅ Tokens separados
✅ Painel com seu token
✅ App com seu token
✅ Sem conflitos
✅ Seguro

**Agora é só executar o script e popular os conteúdos!** 🚀

```bash
cd MaxxControl/maxxcontrol-x-sistema
node scripts/popular-conteudos-automatico.js
```
