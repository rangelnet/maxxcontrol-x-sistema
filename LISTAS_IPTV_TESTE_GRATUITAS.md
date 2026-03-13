# Listas IPTV de Teste Gratuitas

## Problema

A página "Servidor IPTV" do painel MaxxControl não tem um botão para adicionar listas de teste automaticamente. Você precisa configurar manualmente.

## Solução: Usar Listas IPTV Públicas de Teste

Aqui estão listas IPTV públicas e gratuitas que você pode usar para testar a funcionalidade "Árvore IPTV":

---

## Opção 1: IPTV-Org (Recomendado)

### Características
- ✅ Gratuito e público
- ✅ Milhares de canais
- ✅ Atualizado regularmente
- ✅ Funciona com Xtream API

### Como Usar

**Método 1: Via M3U (Mais Simples)**

1. Acesse: https://iptv-org.github.io/iptv/
2. Copie a URL da playlist M3U
3. Use em players IPTV

**Método 2: Servidores Xtream Públicos**

Infelizmente, o IPTV-Org não fornece API Xtream diretamente. Você precisa de um servidor Xtream Codes real.

---

## Opção 2: Servidores Xtream de Teste Públicos

### ⚠️ Aviso Importante

Servidores Xtream Codes públicos e gratuitos são **raros** e geralmente:
- Ficam offline rapidamente
- Têm credenciais que mudam frequentemente
- São usados para testes temporários

### Onde Encontrar

1. **Fóruns IPTV**
   - Reddit: r/IPTV
   - Fóruns especializados em IPTV

2. **Grupos Telegram**
   - Grupos de IPTV gratuito
   - Canais de teste

3. **Sites de Teste**
   - Alguns provedores oferecem teste de 24h grátis

---

## Opção 3: Criar Seu Próprio Servidor Xtream Local

### Usando Xtream UI (Docker)

```bash
# 1. Instalar Docker
# Windows: https://docs.docker.com/desktop/install/windows-install/

# 2. Baixar Xtream UI
git clone https://github.com/amidevous/xtream-ui-ubuntu20.04.git

# 3. Executar
cd xtream-ui-ubuntu20.04
docker-compose up -d

# 4. Acessar
# URL: http://localhost:8080
# Usuário padrão: admin
# Senha padrão: admin
```

### Configurar no Painel

```
URL do Servidor: http://localhost:8080
Usuário: admin
Senha: admin
```

---

## Opção 4: Usar Lista M3U Convertida

### Passo 1: Baixar Lista M3U Gratuita

```bash
# Lista de canais brasileiros
https://raw.githubusercontent.com/guiworldtv/MEU-IPTV-FULL/main/BRASIL.m3u

# Lista internacional
https://iptv-org.github.io/iptv/index.m3u
```

### Passo 2: Converter M3U para Xtream

Use ferramentas online:
- https://m3u4u.com/
- https://m3u-playlist-proxy.herokuapp.com/

### Passo 3: Obter Credenciais Xtream

Após conversão, você receberá:
```
URL: http://servidor.com:porta
Usuário: seu_usuario
Senha: sua_senha
```

---

## Opção 5: Teste com Dados Mockados (Desenvolvimento)

Se você só quer testar a interface, pode criar um servidor mock local.

### Criar Servidor Mock Node.js

```javascript
// mock-xtream-server.js
const express = require('express');
const app = express();

// Categorias Live TV
app.get('/player_api.php', (req, res) => {
  const action = req.query.action;
  
  if (action === 'get_live_categories') {
    res.json([
      { category_id: "1", category_name: "BRASIL", parent_id: 0 },
      { category_id: "2", category_name: "ESPORTES", parent_id: 0 },
      { category_id: "21", category_name: "FUTEBOL", parent_id: 2 },
      { category_id: "3", category_name: "FILMES", parent_id: 0 }
    ]);
  }
  
  else if (action === 'get_live_streams') {
    res.json([
      {
        num: 1,
        name: "Globo SP",
        stream_type: "live",
        stream_id: 1001,
        stream_icon: "https://example.com/globo.png",
        category_id: "1"
      },
      {
        num: 2,
        name: "SBT SP",
        stream_type: "live",
        stream_id: 1002,
        stream_icon: "https://example.com/sbt.png",
        category_id: "1"
      },
      {
        num: 3,
        name: "ESPN Brasil",
        stream_type: "live",
        stream_id: 2001,
        stream_icon: "https://example.com/espn.png",
        category_id: "21"
      }
    ]);
  }
  
  else if (action === 'get_vod_categories') {
    res.json([
      { category_id: "10", category_name: "AÇÃO", parent_id: 0 },
      { category_id: "11", category_name: "COMÉDIA", parent_id: 0 }
    ]);
  }
  
  else if (action === 'get_vod_streams') {
    res.json([
      {
        name: "Filme de Ação 1",
        stream_type: "movie",
        stream_id: 5001,
        stream_icon: "https://example.com/movie1.jpg",
        category_id: "10",
        container_extension: "mp4"
      }
    ]);
  }
  
  else if (action === 'get_series_categories') {
    res.json([
      { category_id: "20", category_name: "DRAMA", parent_id: 0 }
    ]);
  }
  
  else if (action === 'get_series') {
    res.json([
      {
        name: "Série Drama 1",
        series_id: 3001,
        cover: "https://example.com/serie1.jpg",
        category_id: "20"
      }
    ]);
  }
  
  else if (action === 'get_series_info') {
    res.json({
      info: {
        name: "Série Drama 1",
        cover: "https://example.com/serie1.jpg"
      },
      seasons: [
        {
          season_number: 1,
          name: "Temporada 1",
          episodes: [
            {
              id: "30011",
              episode_num: 1,
              title: "Episódio 1",
              container_extension: "mp4"
            },
            {
              id: "30012",
              episode_num: 2,
              title: "Episódio 2",
              container_extension: "mp4"
            }
          ]
        }
      ]
    });
  }
  
  else {
    res.json({ error: "Action not supported" });
  }
});

app.listen(8080, () => {
  console.log('Mock Xtream Server rodando em http://localhost:8080');
  console.log('');
  console.log('Configure no painel:');
  console.log('URL: http://localhost:8080');
  console.log('Usuário: teste');
  console.log('Senha: teste123');
});
```

### Executar o Mock

```bash
# 1. Salvar o código acima em mock-xtream-server.js

# 2. Instalar Express
npm install express

# 3. Executar
node mock-xtream-server.js

# 4. Configurar no painel
URL: http://localhost:8080
Usuário: teste
Senha: teste123
```

---

## Configuração Recomendada para Testes

### Opção Mais Rápida: Mock Server Local

1. **Criar o servidor mock** (código acima)
2. **Executar**: `node mock-xtream-server.js`
3. **Configurar no painel**:
   - URL: `http://localhost:8080`
   - Usuário: `teste`
   - Senha: `teste123`
4. **Testar Árvore IPTV**

### Vantagens
- ✅ Funciona offline
- ✅ Dados controlados
- ✅ Rápido para testes
- ✅ Não depende de servidores externos

---

## Listas IPTV Brasileiras Gratuitas (M3U)

Se você quiser apenas testar com M3U (não Xtream):

```
# Canais Brasileiros
https://raw.githubusercontent.com/guiworldtv/MEU-IPTV-FULL/main/BRASIL.m3u

# Canais Abertos
https://raw.githubusercontent.com/Free-IPTV/Countries/master/BR01_BRAZIL.m3u

# Canais Internacionais
https://iptv-org.github.io/iptv/countries/br.m3u
```

---

## Próximos Passos

1. **Escolha uma opção** acima
2. **Configure no painel** (Servidor IPTV)
3. **Teste a Árvore IPTV**
4. **Reporte problemas** se houver

---

## Sugestão de Melhoria

Seria útil adicionar um **botão "Usar Lista de Teste"** na página "Servidor IPTV" que:

1. Inicia automaticamente o mock server local
2. Configura as credenciais automaticamente
3. Permite testar a funcionalidade sem configuração manual

Quer que eu crie um spec para essa melhoria?

---

**Última atualização**: 2026-03-12
