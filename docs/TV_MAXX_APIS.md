# 🎬 TV-MAXX PRO - APIs Documentadas

## 📊 Resumo
- **Total de APIs:** 74
- **Base URLs:** 49
- **Endpoints:** 25

---

## 🔑 APIs Principais

### 1. Autenticação
```
Base: https://auth.novomundo.live/v1/
Endpoint: auth/login
```

### 2. Painel de Controle
```
Base: https://painel.tvmaxx.pro/api/
Endpoints:
  - report/bug_report.php
```

### 3. Chatbot
```
URL: https://painel.masterbins.com/api/chatbot/bOxLAQLZ7a/ANKWPKDPRq
```

### 4. Cache/CDN
```
Base: https://api1.novomundo.live/cache/
Endpoints:
  - aggr/channels
  - aggr/vod
```

### 5. IPTV/Streaming
```
Endpoints:
  - player_api.php
  - portal.php
  - server_url
```

---

## 🎥 APIs de Conteúdo

### TMDB (The Movie Database)
```
Base: https://api.themoviedb.org/3/

Filmes:
  - movie/{movie_id}
  - movie/{movie_id}/credits
  - movie/{movie_id}/images
  - movie/{movie_id}/videos
  - trending/movie/week

Séries:
  - tv/{tv_id}
  - tv/{tv_id}/credits
  - tv/{tv_id}/images
  - tv/{tv_id}/videos
  - trending/tv/week

Imagens:
  - https://image.tmdb.org/t/p/w500{path}
  - https://image.tmdb.org/t/p/w200{path}
  - https://image.tmdb.org/t/p/original{path}
```

---

## 🥊 APIs de Esportes

### SportsData.io - MMA
```
Base: https://api.sportsdata.io/v3/mma/

Scores:
  - scores/json/Competitions
  - scores/json/Fighters
  - scores/json/PlayerPhoto/{fighter.id}

Stats:
  - stats/json/
```

### SportsData.io - Soccer
```
Base: https://api.sportsdata.io/v3/soccer/

Scores:
  - scores/json/Schedule/{league}/{season}
  - scores/json/SchedulesByDate/{date}
  - scores/json/PlayersByTeam/{teamid}
  - scores/json/PlayerPhoto/{player.id}
  - scores/json/TeamLogo/{teamId}

Stats:
  - stats/json/

Ao Vivo:
  - matches/live
```

---

## 🌤️ API de Clima

### Meteoblue
```
Base: https://my.meteoblue.com/packages/
Endpoint: basic-1h_current
```

---

## 🎨 Assets e Imagens

### Logos de Plataformas
```
Netflix: https://i.postimg.cc/VLHGGMSX/netflix.png
Disney+: https://i.postimg.cc/Nf0Ckb08/disney.png
HBO Max: https://i.postimg.cc/X7DHHFZr/hbomax.png
Prime Video: https://i.postimg.cc/c4599YKR/prime.png
Paramount+: https://i.postimg.cc/c4599YKQ/paramount.png
Star+: https://i.postimg.cc/kXh118Vy/star.png
Globoplay: https://i.postimg.cc/02NX0ZNp/globoplay.png
Hulu: https://i.postimg.cc/pX1GG89z/hulu.png
Crunchyroll: https://i.postimg.cc/yYNpynNm/crunchyroll.png

Maxx Brands:
  - MaxxPlay: https://i.postimg.cc/nh3dnH9R/maxxplay.png
  - MaxxGaming: https://i.postimg.cc/CLys0RPM/maxxgaming.png
  - MaxxHot: https://i.postimg.cc/ZKkxmW7J/maxxhot.png
  - Logo Move: https://i.postimg.cc/y8cgrt9t/logomove.png

Banners:
  - Hero Banner: https://i.postimg.cc/FsnWWcfk/hero_banner.jpg
  - Splash Screen: https://i.postimg.cc/8PnKKWFB/splash_screen.jpg
```

---

## 🔗 URLs de Teste

### Streaming
```
Demo HLS: https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8
Exemplo: https://example.com/stream
Template: http://server:port/live/user/pass/id.ts
```

### YouTube
```
Watch: https://www.youtube.com/watch?v=dQw4w9WgXcQ
Short: https://youtube.com/shorts/dQw4w9WgXcQ
Share: https://youtu.be/dQw4w9WgXcQ
API: https://www.youtube.com/iframe_api
```

### Outros
```
Site Principal: https://tvmaxx.app
Servidor Alternativo: http://newoneblue.site
Speed Test: https://ipv4.download.thinkbroadband.com/5mb.zip
Imagem Teste: https://images.unsplash.com/photo-1508098682722-e99c43a406b2
```

---

## 🔧 Configuração Local

### P2P Proxy
```
URL: http://127.0.0.1:$P2P_PROXY_PORT/
```

---

## 📝 Notas de Integração

### Para MaxxControl X:

1. **Monitoramento de APIs**
   - Adicionar health checks para todas as APIs principais
   - Monitorar latência e disponibilidade
   - Alertas quando APIs estiverem offline

2. **Logs de Requisições**
   - Registrar todas as chamadas de API
   - Rastrear erros e timeouts
   - Análise de uso por endpoint

3. **Cache**
   - Implementar cache para TMDB
   - Cache de logos e imagens
   - Invalidação inteligente

4. **Segurança**
   - Validar tokens de autenticação
   - Rate limiting por usuário
   - Proteção contra abuso

---

*Documento gerado automaticamente em: 26/02/2026*
