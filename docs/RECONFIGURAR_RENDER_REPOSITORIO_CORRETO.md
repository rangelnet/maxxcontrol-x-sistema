# 🔧 RECONFIGURAR RENDER - REPOSITÓRIO CORRETO

## ⚠️ PROBLEMA IDENTIFICADO

O Render está configurado para o repositório **ERRADO**:
- ❌ Repositório atual no Render: `MaxxControl` (antigo)
- ✅ Repositório correto: `maxxcontrol-x-sistema` (novo)

Por isso o build está falhando! O Render está tentando fazer build de um código antigo que não tem a estrutura correta.

---

## 🎯 SOLUÇÃO: RECONFIGURAR O SERVIÇO

### OPÇÃO 1: DELETAR E CRIAR NOVO SERVIÇO (RECOMENDADO)

1. **Acesse o Render**: https://dashboard.render.com

2. **Delete o serviço atual**:
   - Clique no serviço `sistema.maxxcontrol-x`
   - Vá em **Settings** (menu lateral)
   - Role até o final da página
   - Clique em **Delete Web Service**
   - Confirme digitando o nome do serviço

3. **Crie um novo serviço**:
   - Clique em **New +** → **Web Service**
   - Conecte o repositório **`maxxcontrol-x-sistema`**
   - Se não aparecer, clique em **Configure account** e autorize o acesso ao repositório

4. **Configure o novo serviço**:

**Name:**
```
sistema-maxxcontrol-x
```

**Region:**
```
Oregon (US West)
```

**Branch:**
```
main
```

**Root Directory:**
```
.
```
(deixe vazio ou coloque apenas um ponto)

**Build Command:**
```
npm install && cd web && npm install && npm run build && cd ..
```

**Start Command:**
```
npm start
```

**Environment:**
```
Node
```

5. **Adicione as variáveis de ambiente** (copie do guia `COPIAR_E_COLAR_NO_RENDER.md`)

6. **Clique em "Create Web Service"**

---

### OPÇÃO 2: MUDAR O REPOSITÓRIO DO SERVIÇO EXISTENTE

**ATENÇÃO**: Esta opção pode não funcionar bem. É melhor usar a Opção 1.

1. Acesse: https://dashboard.render.com
2. Clique no serviço `sistema.maxxcontrol-x`
3. Vá em **Settings**
4. Procure por **Repository** ou **Source**
5. Clique em **Change Repository**
6. Selecione `maxxcontrol-x-sistema`
7. Salve as alterações

---

## 📋 CONFIGURAÇÕES CORRETAS PARA O NOVO SERVIÇO

### Build & Deploy Settings:

**Root Directory:**
```
.
```
(vazio ou apenas um ponto - o código já está na raiz do repositório)

**Build Command:**
```
npm install && cd web && npm install && npm run build && cd ..
```

**Start Command:**
```
npm start
```

**Environment:**
```
Node
```

### Environment Variables:

Copie TODAS as 12 variáveis do arquivo `COPIAR_E_COLAR_NO_RENDER.md`:

1. NODE_ENV=production
2. PORT=10000
3. USE_SQLITE=false
4. DATABASE_URL=(sua URL do Supabase)
5. SUPABASE_URL=https://mmfbirjrhrhobbnzfffe.supabase.co
6. SUPABASE_KEY=(sua chave anon)
7. SUPABASE_SERVICE_KEY=(sua chave service_role)
8. TMDB_API_KEY=7bc56e27708a9d2069fc999d44a6be0a
9. JWT_SECRET=maxxcontrol_x_super_secret_key_2024_change_in_production
10. JWT_EXPIRES_IN=7d
11. DEVICE_API_TOKEN=tvmaxx_device_api_token_2024_secure_key
12. WS_PORT=10000

---

## ✅ DEPOIS DE RECONFIGURAR

1. O Render vai fazer o build automaticamente
2. Aguarde 3-5 minutos
3. Verifique os logs para confirmar que o build foi bem-sucedido
4. Teste o backend: `https://sistema-maxxcontrol-x.onrender.com/health`
5. Teste o painel: `https://sistema-maxxcontrol-x.onrender.com`

---

## 🎉 PRONTO!

Agora o Render está apontando para o repositório correto e o build deve funcionar!

**ME AVISE QUANDO TERMINAR!**
