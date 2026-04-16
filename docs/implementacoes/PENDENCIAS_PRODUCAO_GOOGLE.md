# 🚀 PENDÊNCIAS DE PRODUÇÃO - INTEGRAÇÃO GOOGLE

Este documento serve como um lembrete obrigatório para a fase de **Deploy em Produção** da integração Google (Google Drive e Contacts).

## 1. Configurar Variáveis de Ambiente no Servidor (Render)

Quando o backend for implantado definitivamente no Render (ou servidor similar), você obrigatóriamente deverá ir no painel do Render nas **Environment Variables** e adicionar as configurações copiando do seu `.env` local. 

**O detalhe crucial é o REDIRECT**, que não será mais localhost:

```env
GOOGLE_CLIENT_ID=SEU_CLIENT_ID_DO_GOOGLE_AQUI
GOOGLE_CLIENT_SECRET=SEU_CLIENT_SECRET_DO_GOOGLE_AQUI
GOOGLE_REDIRECT_URI=https://<SUA-URL-DO-BACKEND-AQUI>.onrender.com/api/integrations/google/callback
```

## 2. Atualizar URL no Google Cloud Console

O Google não enviará informações para a sua URL nova até que você avise ele que aquela URL existe e está autorizada a receber dados.

1. Acesse o [Google Cloud Console](https://console.cloud.google.com).
2. Vá em **APIs e Serviços** > **Credenciais**.
3. Clique sobre o seu **ID do Cliente OAuth**.
4. Em **URIs de redirecionamento autorizados**, adicione a mesma URL que você colocou no Render:
  `https://<SUA-URL-DO-BACKEND-AQUI>.onrender.com/api/integrations/google/callback`
5. Salve as alterações.

## 3. Construir o Botão no Frontend Mxxcontrol

Na interface UI/UX (Frontend React ou HTML), será necessário:
1. Criar um botão "Conectar Google".
2. Ao clicar, o botão fará um GET via Fetch/Axios para `https://<SUA-URL-DO-BACKEND-AQUI>.onrender.com/api/integrations/google/auth`.
3. O retorno da API será um objeto `{ "url": "https://accounts.google.com/..." }`.
4. Abrir essa `url` em uma nova aba do navegador para o usuário logar. 
5. O painel cuidará do resto!
