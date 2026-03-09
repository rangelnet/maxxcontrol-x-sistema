# 🔥 SOLUÇÃO PARA TELA PRETA - GERADOR DE BANNERS

## ❌ PROBLEMA IDENTIFICADO

**O SERVIDOR NÃO ESTÁ RODANDO!**

Por isso a página fica preta - o frontend React não consegue buscar os dados da API.

---

## ✅ SOLUÇÃO RÁPIDA (3 PASSOS)

### 1️⃣ INICIAR O SERVIDOR BACKEND

Abra um terminal PowerShell na pasta `maxxcontrol-x-sistema` e execute:

```powershell
npm start
```

**OU** se quiser modo desenvolvimento com auto-reload:

```powershell
npm run dev
```

Aguarde até ver estas mensagens:
```
🚀 MaxxControl X API rodando na porta 3000
🌐 http://localhost:3000
✅ Banco de dados PostgreSQL conectado
```

### 2️⃣ VERIFICAR SE FUNCIONOU

Abra outro terminal e execute:

```powershell
curl http://localhost:3000/health
```

Deve retornar:
```json
{"status":"online","timestamp":"...","service":"MaxxControl X API"}
```

### 3️⃣ TESTAR NO NAVEGADOR

1. Abra: http://localhost:3000/banners
2. A página deve carregar normalmente agora!

---

## 🔍 SE AINDA NÃO FUNCIONAR

Execute o script de diagnóstico completo:

```powershell
.\testar-banners-completo.ps1
```

Este script vai verificar:
- ✅ Se o servidor está rodando
- ✅ Se a API está respondendo
- ✅ Se há conteúdos no banco
- ✅ Se o build do frontend existe

---

## 📝 NOTAS IMPORTANTES

### Servidor precisa estar SEMPRE rodando

O servidor backend precisa estar rodando para o painel funcionar. Existem 2 formas:

**Opção 1: Desenvolvimento Local**
```powershell
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend (opcional, só se quiser editar)
cd web
npm run dev
```

**Opção 2: Produção (Render.com)**
- O servidor roda automaticamente no Render
- URL: https://maxxcontrol-x-sistema.onrender.com
- Acesse: https://maxxcontrol-x-sistema.onrender.com/banners

### Se o banco estiver vazio

Execute para popular com conteúdos do TMDB:

```powershell
node scripts/popular-conteudos-automatico.js
```

---

## 🎯 RESUMO

**PROBLEMA**: Servidor não estava rodando
**SOLUÇÃO**: Execute `npm start` e acesse http://localhost:3000/banners

A correção do `.toFixed()` já foi aplicada e commitada, mas o problema real era o servidor não estar rodando!
