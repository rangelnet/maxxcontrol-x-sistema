# 🔗 ADICIONAR APIs DO APP ANDROID NO PAINEL

## 📊 APIs IDENTIFICADAS DO TV MAXX

Baseado no arquivo `TV_MAXX_APIS.md`, estas são as APIs que o app usa:

### 🔴 APIs CRÍTICAS (Essenciais para o app funcionar)

1. **Auth API** - Autenticação
   - URL: `https://auth.novomundo.live/v1/`
   - Categoria: autenticacao
   - Crítica: SIM

2. **Painel API** - Controle e relatórios
   - URL: `https://painel.tvmaxx.pro/api/`
   - Categoria: painel
   - Crítica: SIM

3. **Cache API** - CDN e cache de conteúdo
   - URL: `https://api1.novomundo.live/cache/`
   - Categoria: cache
   - Crítica: SIM

### 🟡 APIs IMPORTANTES (Conteúdo e funcionalidades)

4. **TMDB API** - Metadados de filmes/séries
   - URL: `https://api.themoviedb.org/3/`
   - Categoria: conteudo
   - Crítica: NÃO

5. **TMDB Images** - Posters e banners
   - URL: `https://image.tmdb.org/t/p/`
   - Categoria: imagens
   - Crítica: NÃO

### 🟢 APIs OPCIONAIS (Extras)

6. **SportsData MMA** - Dados de MMA
   - URL: `https://api.sportsdata.io/v3/mma/`
   - Categoria: esportes
   - Crítica: NÃO

7. **SportsData Soccer** - Dados de Futebol
   - URL: `https://api.sportsdata.io/v3/soccer/`
   - Categoria: esportes
   - Crítica: NÃO

8. **Meteoblue** - Previsão do tempo
   - URL: `https://my.meteoblue.com/packages/`
   - Categoria: clima
   - Crítica: NÃO

9. **Chatbot API** - Suporte ao usuário
   - URL: `https://painel.masterbins.com/api/chatbot/`
   - Categoria: suporte
   - Crítica: NÃO

10. **PostImg CDN** - Hospedagem de imagens
    - URL: `https://i.postimg.cc/`
    - Categoria: cdn
    - Crítica: NÃO

## ✅ JÁ CONFIGURADAS NO BANCO

Estas APIs já foram adicionadas automaticamente no `setup-sqlite.js`:

```javascript
const apis = [
  ['Auth API', 'API de autenticação principal', 'https://auth.novomundo.live/v1/', 'autenticacao', 1],
  ['Painel API', 'API do painel de controle', 'https://painel.tvmaxx.pro/api/', 'painel', 1],
  ['Cache API', 'API de cache e CDN', 'https://api1.novomundo.live/cache/', 'cache', 1],
  ['TMDB API', 'The Movie Database', 'https://api.themoviedb.org/3/', 'conteudo', 0],
  ['SportsData MMA', 'API de dados de MMA', 'https://api.sportsdata.io/v3/mma/', 'esportes', 0],
  ['SportsData Soccer', 'API de dados de Futebol', 'https://api.sportsdata.io/v3/soccer/', 'esportes', 0],
  ['Meteoblue', 'API de previsão do tempo', 'https://my.meteoblue.com/packages/', 'clima', 0],
  ['Chatbot API', 'API do chatbot de suporte', 'https://painel.masterbins.com/api/chatbot/', 'suporte', 0]
];
```

## 🎯 COMO USAR NO PAINEL

### 1. Acessar o Painel
```
URL: https://maxxcontrol-frontend.onrender.com
Login: admin@maxxcontrol.com
Senha: Admin@123
```

### 2. Ir para "Monitor de APIs"
- Veja o status de todas as APIs
- Verifique latência e disponibilidade
- Veja histórico de uptime

### 3. Ir para "Configurar APIs"
- Adicione novas APIs
- Edite URLs existentes
- Ative/desative APIs
- Configure timeout e headers

## 🔧 ADICIONAR NOVAS APIs

Se precisar adicionar mais APIs do app Android:

### Pelo Painel (Interface)
1. Acesse "Configurar APIs"
2. Clique em "Nova API"
3. Preencha:
   - Nome
   - Descrição
   - URL
   - Categoria
   - Marque "Crítica" se for essencial
4. Salve

### Pelo Banco de Dados (SQL)
```sql
INSERT INTO api_configs (nome, descricao, url, categoria, critica, ativa)
VALUES ('Nome da API', 'Descrição', 'https://api.exemplo.com/', 'categoria', 1, 1);
```

## 📱 CONFIGURAR NO APP ANDROID

Para o app usar o MaxxControl X:

### 1. Endpoint de Verificação de MAC
```
URL: https://maxxcontrol-x-sistema.onrender.com/api/clients/verify/{mac_address}
Método: GET
```

### 2. Endpoint de Registro de Device
```
URL: https://maxxcontrol-x-sistema.onrender.com/api/device/register
Método: POST
Body: {
  "mac_address": "00:00:00:00:00:00",
  "modelo": "Samsung TV",
  "android_version": "11",
  "app_version": "1.0.0"
}
```

### 3. Endpoint de Logs
```
URL: https://maxxcontrol-x-sistema.onrender.com/api/log/create
Método: POST
Body: {
  "device_id": 1,
  "tipo": "info",
  "descricao": "App iniciado"
}
```

### 4. Endpoint de Bugs
```
URL: https://maxxcontrol-x-sistema.onrender.com/api/bug/report
Método: POST
Body: {
  "device_id": 1,
  "stack_trace": "Error...",
  "modelo": "Samsung TV",
  "app_version": "1.0.0"
}
```

### 5. Endpoint de Versão
```
URL: https://maxxcontrol-x-sistema.onrender.com/api/app/check-version
Método: POST
Body: {
  "versao_atual": "1.0.0"
}
```

## 🔐 AUTENTICAÇÃO NO APP

O app deve enviar o token JWT em todas as requisições:

```
Headers: {
  "Authorization": "Bearer {token}"
}
```

## 📊 MONITORAMENTO

O painel vai monitorar automaticamente:
- ✅ Quantos dispositivos estão online
- ✅ Quantos MACs estão ativos
- ✅ Bugs reportados
- ✅ Logs de atividade
- ✅ Status das APIs externas

## 🚀 PRÓXIMOS PASSOS

1. ✅ APIs já configuradas no banco
2. ✅ Painel funcionando
3. ⏳ Configurar app Android para usar o MaxxControl X
4. ⏳ Testar verificação de MAC
5. ⏳ Testar logs e bugs

## 💡 DICA

Se você quiser que eu configure o app Android para usar o MaxxControl X, me envie os arquivos de configuração do app (Constants.java, ApiConfig.java, etc) e eu faço a integração completa!
