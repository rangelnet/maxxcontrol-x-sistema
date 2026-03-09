# Testar Produção no Render

## URLs de Produção

- **Backend**: https://maxxcontrol-x-sistema.onrender.com
- **Frontend**: https://maxxcontrol-frontend.onrender.com
- **Banners**: https://maxxcontrol-x-sistema.onrender.com/banners

## Teste Rápido

### 1. Health Check
```bash
curl https://maxxcontrol-x-sistema.onrender.com/health
```

### 2. API de Conteúdos
```bash
curl https://maxxcontrol-x-sistema.onrender.com/api/content/list?limit=5
```

### 3. Acessar no Navegador

Abra: **https://maxxcontrol-x-sistema.onrender.com/banners**

Se ainda estiver com tela preta:
1. Abra o Console do navegador (F12)
2. Vá na aba Console
3. Copie TODOS os erros
4. Me envie os erros

## Sobre a Lista de IPTV

Para ver a estrutura da lista de IPTV em árvore, preciso saber:

1. Onde está armazenada a lista de IPTV?
   - No banco de dados Supabase?
   - Em arquivo JSON?
   - Via API Xtream Codes?

2. Qual formato você quer visualizar?
   - Categorias → Canais?
   - Grupos → Subgrupos → Canais?

Me diga onde está a lista de IPTV que eu crio um visualizador em árvore para você!
