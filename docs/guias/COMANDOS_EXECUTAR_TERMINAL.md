# 🚀 COMANDOS PARA EXECUTAR NO SEU TERMINAL

## ✅ VOCÊ JÁ TEM GIT INSTALADO!

O problema é que você estava no diretório System32 como administrador.

## 📋 OPÇÃO 1: USAR O ARQUIVO .BAT (MAIS FÁCIL)

1. Vá até a pasta do projeto no Windows Explorer:
   ```
   R:\Users\Usuario\Documents\MaxxControl\maxxcontrol-x-sistema
   ```

2. Dê duplo clique no arquivo:
   ```
   EXECUTAR_PUSH_AGORA.bat
   ```

3. Pronto! Ele vai fazer tudo automaticamente.

---

## 📋 OPÇÃO 2: COPIAR E COLAR NO TERMINAL

Abra um PowerShell NORMAL (não como administrador) e cole estes comandos:

```powershell
cd "R:\Users\Usuario\Documents\MaxxControl\maxxcontrol-x-sistema"

git status

git add .

git commit -m "Implementar sistema completo de revendedores e clientes IPTV"

git push origin main
```

---

## 📋 OPÇÃO 3: LINHA POR LINHA

Se preferir executar um por vez:

### 1. Navegar para a pasta:
```powershell
cd "R:\Users\Usuario\Documents\MaxxControl\maxxcontrol-x-sistema"
```

### 2. Ver o que mudou:
```powershell
git status
```

### 3. Adicionar todos os arquivos:
```powershell
git add .
```

### 4. Criar o commit:
```powershell
git commit -m "Implementar sistema completo de revendedores e clientes IPTV"
```

### 5. Enviar para o GitHub:
```powershell
git push origin main
```

---

## ✅ O QUE VAI ACONTECER DEPOIS

1. ✅ Arquivos enviados para GitHub
2. ✅ Render detecta mudanças automaticamente
3. ✅ Deploy do backend inicia
4. ✅ Deploy do frontend inicia
5. ✅ Sistema atualizado em produção!

---

## 🎯 ARQUIVOS QUE SERÃO ENVIADOS

### Backend:
- `database/resellers-schema.sql`
- `database/setup-sqlite.js`
- `modules/resellers/resellersController.js`
- `modules/resellers/resellersRoutes.js`
- `modules/clients/clientsController.js`
- `modules/clients/clientsRoutes.js`
- `server.js`

### Frontend:
- `web/src/pages/Resellers.jsx`
- `web/src/pages/Clients.jsx`
- `web/src/App.jsx`
- `web/src/components/Layout.jsx`

---

## 🔥 SISTEMA COMPLETO DE REVENDEDORES

✅ Criar/editar/deletar revendedores
✅ Adicionar/remover créditos
✅ Modo créditos ilimitados
✅ Criar clientes (consome crédito)
✅ Validação de MAC address
✅ Controle de validade
✅ API para verificação do app IPTV

---

## 📞 PRECISA DE AJUDA?

Me avise se aparecer algum erro!
