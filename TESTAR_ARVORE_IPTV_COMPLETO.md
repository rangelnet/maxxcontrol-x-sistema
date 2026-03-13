# Guia Completo de Testes - Árvore IPTV

## Objetivo

Testar a funcionalidade "Visualizar Árvore IPTV" do painel MaxxControl com diferentes configurações de servidores Xtream Codes IPTV.

## Pré-requisitos

- Acesso ao painel: https://maxxcontrol-frontend.onrender.com
- Credenciais: admin@maxxcontrol.com / Admin@123
- Pelo menos 1 servidor Xtream Codes válido para testes
- Navegador com DevTools (Chrome/Edge recomendado)

---

## Cenário 1: Teste com Configuração Global

### Objetivo
Testar visualização da árvore usando a configuração IPTV global (padrão para todos os dispositivos).

### Passos

1. **Acessar o painel**
   ```
   URL: https://maxxcontrol-frontend.onrender.com
   Login: admin@maxxcontrol.com
   Senha: Admin@123
   ```

2. **Configurar servidor IPTV global**
   - Clique em "Servidor IPTV" no menu lateral
   - Preencha os campos:
     - **URL do Servidor**: `http://seu-servidor.com:8080`
     - **Usuário**: `seu_usuario`
     - **Senha**: `sua_senha`
   - Clique em "Salvar Configuração"
   - Aguarde mensagem de sucesso

3. **Acessar Árvore IPTV**
   - Clique em "Árvore IPTV" no menu lateral
   - Aguarde carregamento (spinner deve aparecer)

4. **Verificar seletor de configuração**
   - No topo da página, deve aparecer dropdown
   - Opção selecionada: "Configuração Global"
   - Ícone: 🌐

5. **Verificar abas de tipo de conteúdo**
   - Deve haver 3 abas:
     - 📺 Live TV
     - 🎬 VOD (Filmes)
     - 📺 Séries

6. **Testar Live TV**
   - Clique na aba "Live TV"
   - Deve carregar lista de categorias
   - Cada categoria deve mostrar:
     - Ícone de pasta 📁
     - Nome da categoria
     - Badge com número de canais (ex: "15")
   - Clique em uma categoria para expandir
   - Deve carregar lista de canais
   - Cada canal deve mostrar:
     - Ícone de TV 📺
     - Número do canal (ex: "001")
     - Nome do canal

7. **Testar seleção de canal**
   - Clique em um canal
   - Deve abrir painel lateral à direita (DetailPanel)
   - Verificar informações exibidas:
     - Nome do canal
     - Stream ID
     - Category ID
     - Número do canal
     - EPG Channel ID (se disponível)
   - Verificar URL do stream formatado:
     - Formato: `http://servidor:porta/usuario/senha/stream_id`
   - Clicar no botão "Copiar URL"
   - Verificar mensagem "Copiado!"

8. **Testar busca**
   - No campo de busca, digite parte do nome de um canal (ex: "ESPN")
   - Aguardar 300ms (debounce)
   - Árvore deve filtrar mostrando apenas resultados correspondentes
   - Categorias com resultados devem expandir automaticamente
   - Clicar no X para limpar busca
   - Árvore deve voltar ao estado completo

9. **Testar VOD**
   - Clicar na aba "VOD (Filmes)"
   - Repetir passos 6-8 para filmes
   - Verificar URL formatado:
     - Formato: `http://servidor:porta/movie/usuario/senha/stream_id.ext`

10. **Testar Séries**
    - Clicar na aba "Séries"
    - Expandir uma categoria
    - Clicar em uma série
    - Deve expandir mostrando temporadas
    - Clicar em uma temporada
    - Deve expandir mostrando episódios
    - Clicar em um episódio
    - Verificar URL formatado:
      - Formato: `http://servidor:porta/series/usuario/senha/episode_id.ext`

11. **Testar cache**
    - Clicar no botão "Atualizar" (ícone de refresh)
    - Deve limpar cache e recarregar categorias
    - Verificar que dados são recarregados

### Resultados Esperados

✅ Configuração global salva com sucesso
✅ Árvore carrega categorias de todos os tipos
✅ Expansão de categorias funciona
✅ Seleção de streams abre DetailPanel
✅ URLs são formatados corretamente
✅ Busca filtra resultados
✅ Cache é limpo ao clicar em Atualizar

### Possíveis Problemas

❌ **Tela preta**: Limpar cache do navegador (Ctrl+F5)
❌ **Erro 401**: Credenciais Xtream inválidas
❌ **Erro 504**: Timeout - servidor Xtream não responde
❌ **Categorias vazias**: Servidor não tem conteúdo nessa categoria

---

## Cenário 2: Teste com Configuração por Dispositivo

### Objetivo
Testar visualização da árvore usando configuração IPTV específica de um dispositivo.

### Pré-requisitos
- Pelo menos 1 dispositivo registrado no painel
- Dispositivo deve ter configuração IPTV própria

### Passos

1. **Registrar dispositivo (se necessário)**
   - Abra o app TV MAXX PRO em um TV Box
   - Faça login
   - O dispositivo será registrado automaticamente
   - OU use a API:
     ```bash
     curl -X POST https://maxxcontrol-x-sistema.onrender.com/api/device/register \
       -H "Content-Type: application/json" \
       -H "X-Device-Token: seu_token" \
       -d '{
         "mac_address": "AA:BB:CC:DD:EE:FF",
         "modelo": "Samsung TV",
         "android_version": "11",
         "app_version": "1.0.0",
         "ip": "192.168.1.100"
       }'
     ```

2. **Configurar IPTV para o dispositivo**
   - No painel, vá para "Dispositivos"
   - Clique no dispositivo desejado
   - Na seção "Configuração IPTV", preencha:
     - **URL do Servidor**: `http://servidor-device.com:8080`
     - **Usuário**: `usuario_device`
     - **Senha**: `senha_device`
   - Clique em "Salvar"

3. **Acessar Árvore IPTV**
   - Clique em "Árvore IPTV" no menu

4. **Selecionar dispositivo**
   - No dropdown de configuração, selecione o dispositivo
   - Formato: "📱 [Modelo] - [MAC]"
   - Exemplo: "📱 Samsung TV - AA:BB:CC:DD:EE:FF"

5. **Verificar carregamento**
   - Árvore deve recarregar com dados do servidor do dispositivo
   - Categorias devem ser diferentes da configuração global

6. **Testar funcionalidades**
   - Repetir todos os testes do Cenário 1
   - Verificar que URLs usam credenciais do dispositivo

7. **Alternar entre configurações**
   - Selecionar "Configuração Global"
   - Árvore deve recarregar
   - Selecionar dispositivo novamente
   - Árvore deve recarregar com dados do dispositivo

### Resultados Esperados

✅ Dropdown lista dispositivos cadastrados
✅ Seleção de dispositivo recarrega árvore
✅ URLs usam credenciais do dispositivo selecionado
✅ Alternância entre global e dispositivo funciona

---

## Cenário 3: Teste com Múltiplos Dispositivos

### Objetivo
Testar alternância entre múltiplos dispositivos com configurações diferentes.

### Pré-requisitos
- Pelo menos 3 dispositivos registrados
- Cada dispositivo com configuração IPTV diferente

### Passos

1. **Preparar dispositivos**
   - Dispositivo 1: Servidor A
   - Dispositivo 2: Servidor B
   - Dispositivo 3: Servidor C

2. **Testar alternância rápida**
   - Selecionar Dispositivo 1
   - Aguardar carregamento
   - Expandir uma categoria
   - Selecionar Dispositivo 2
   - Verificar que árvore é limpa e recarregada
   - Selecionar Dispositivo 3
   - Verificar que árvore é limpa e recarregada

3. **Verificar cache independente**
   - Selecionar Dispositivo 1
   - Expandir categoria "Esportes"
   - Selecionar Dispositivo 2
   - Selecionar Dispositivo 1 novamente
   - Categoria "Esportes" deve estar expandida (cache mantido)

### Resultados Esperados

✅ Alternância entre dispositivos funciona
✅ Cache é mantido por dispositivo
✅ Não há mistura de dados entre dispositivos

---

## Cenário 4: Teste de Erros e Edge Cases

### Objetivo
Testar comportamento da árvore em situações de erro.

### Teste 4.1: Sem Configuração IPTV

1. **Remover configuração global**
   - Vá para "Servidor IPTV"
   - Limpe todos os campos
   - Salve

2. **Acessar Árvore IPTV**
   - Deve exibir mensagem de erro
   - Mensagem: "Configure o servidor IPTV primeiro"
   - Botão "Ir para Configuração"

### Teste 4.2: Credenciais Inválidas

1. **Configurar credenciais erradas**
   - URL: `http://servidor.com:8080`
   - Usuário: `usuario_errado`
   - Senha: `senha_errada`

2. **Acessar Árvore IPTV**
   - Deve exibir erro 401
   - Mensagem: "Credenciais inválidas"

### Teste 4.3: Servidor Offline

1. **Configurar servidor inexistente**
   - URL: `http://servidor-inexistente.com:8080`

2. **Acessar Árvore IPTV**
   - Deve exibir erro de timeout
   - Mensagem: "Servidor não responde"

### Teste 4.4: Categoria Vazia

1. **Expandir categoria sem conteúdo**
   - Deve exibir mensagem
   - "Nenhum conteúdo disponível"

### Teste 4.5: Busca sem Resultados

1. **Buscar termo inexistente**
   - Digite: "XYZABC123"
   - Deve exibir mensagem
   - "Nenhum resultado encontrado"

### Resultados Esperados

✅ Erros são tratados graciosamente
✅ Mensagens de erro são claras
✅ Usuário pode tentar novamente

---

## Cenário 5: Teste de Performance

### Objetivo
Testar performance com grandes volumes de dados.

### Teste 5.1: Muitas Categorias

1. **Usar servidor com 50+ categorias**
2. **Verificar tempo de carregamento**
   - Deve carregar em < 3 segundos
3. **Verificar scroll**
   - Scroll deve ser suave

### Teste 5.2: Muitos Canais

1. **Expandir categoria com 100+ canais**
2. **Verificar tempo de carregamento**
   - Deve carregar em < 2 segundos
3. **Verificar renderização**
   - Todos os canais devem aparecer

### Teste 5.3: Busca em Grande Volume

1. **Buscar termo comum (ex: "HD")**
2. **Verificar tempo de filtro**
   - Deve filtrar em < 500ms
3. **Verificar resultados**
   - Todos os resultados devem aparecer

### Resultados Esperados

✅ Carregamento rápido mesmo com muitos dados
✅ Scroll suave
✅ Busca responsiva

---

## Cenário 6: Teste de Cache

### Objetivo
Verificar funcionamento do sistema de cache.

### Teste 6.1: Cache de Categorias

1. **Carregar categorias Live TV**
2. **Abrir DevTools → Network**
3. **Alternar para VOD e voltar para Live TV**
4. **Verificar Network**
   - Não deve haver nova requisição
   - Dados vêm do cache

### Teste 6.2: Expiração de Cache

1. **Carregar categorias**
2. **Aguardar 6 minutos** (TTL = 5 min)
3. **Alternar abas**
4. **Verificar Network**
   - Deve haver nova requisição
   - Cache expirou

### Teste 6.3: Limpeza Manual de Cache

1. **Carregar categorias**
2. **Clicar em "Atualizar"**
3. **Verificar Network**
   - Deve haver nova requisição
   - Cache foi limpo

### Resultados Esperados

✅ Cache funciona corretamente
✅ TTL é respeitado
✅ Limpeza manual funciona

---

## Checklist de Testes

### Funcionalidades Básicas
- [ ] Login no painel funciona
- [ ] Menu "Árvore IPTV" está visível
- [ ] Página carrega sem erros

### Configuração Global
- [ ] Salvar configuração global funciona
- [ ] Árvore carrega com config global
- [ ] URLs usam credenciais globais

### Configuração por Dispositivo
- [ ] Dropdown lista dispositivos
- [ ] Seleção de dispositivo funciona
- [ ] URLs usam credenciais do dispositivo

### Tipos de Conteúdo
- [ ] Live TV carrega categorias
- [ ] Live TV carrega canais
- [ ] VOD carrega categorias
- [ ] VOD carrega filmes
- [ ] Séries carrega categorias
- [ ] Séries carrega séries
- [ ] Séries carrega temporadas
- [ ] Séries carrega episódios

### Interações
- [ ] Expandir/colapsar categorias funciona
- [ ] Seleção de stream abre DetailPanel
- [ ] DetailPanel exibe informações corretas
- [ ] Copiar URL funciona
- [ ] Fechar DetailPanel funciona

### Busca
- [ ] Campo de busca aparece
- [ ] Busca filtra resultados
- [ ] Debounce funciona (300ms)
- [ ] Limpar busca funciona
- [ ] Busca sem resultados exibe mensagem

### Cache
- [ ] Cache armazena dados
- [ ] Cache expira após TTL
- [ ] Botão Atualizar limpa cache
- [ ] Cache é independente por dispositivo

### Tratamento de Erros
- [ ] Sem configuração exibe erro
- [ ] Credenciais inválidas exibe erro 401
- [ ] Servidor offline exibe timeout
- [ ] Categoria vazia exibe mensagem
- [ ] Busca vazia exibe mensagem

### Performance
- [ ] Carregamento é rápido (< 3s)
- [ ] Scroll é suave
- [ ] Busca é responsiva (< 500ms)
- [ ] Não há travamentos

### Responsividade
- [ ] Layout se adapta a diferentes tamanhos
- [ ] DetailPanel não quebra layout
- [ ] Árvore é scrollável

---

## Ferramentas de Diagnóstico

### DevTools - Console

Abra o console (F12 → Console) e verifique:

```javascript
// Verificar erros
// Não deve haver erros em vermelho

// Verificar logs de cache
// Deve aparecer: "Cache hit: global-categories-live"
// Ou: "Cache miss: global-categories-live"
```

### DevTools - Network

Abra Network (F12 → Network) e verifique:

```
Requisições esperadas:
- GET /api/iptv-server/config
- GET /api/device/list-all
- GET /api/iptv-tree/categories/live?source=global
- GET /api/iptv-tree/streams/live/123?source=global
- GET /api/iptv-tree/series/456?source=global
- GET /api/iptv-tree/series-info/789?source=global
- POST /api/iptv-tree/clear-cache
```

### Teste via cURL

```bash
# Testar configuração global
curl https://maxxcontrol-x-sistema.onrender.com/api/iptv-server/config

# Testar categorias
curl "https://maxxcontrol-x-sistema.onrender.com/api/iptv-tree/categories/live?source=global" \
  -H "Authorization: Bearer SEU_TOKEN"

# Testar streams
curl "https://maxxcontrol-x-sistema.onrender.com/api/iptv-tree/streams/live/123?source=global" \
  -H "Authorization: Bearer SEU_TOKEN"

# Limpar cache
curl -X POST https://maxxcontrol-x-sistema.onrender.com/api/iptv-tree/clear-cache \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"source": "global"}'
```

---

## Relatório de Bugs

Se encontrar problemas, documente:

### Template de Bug Report

```markdown
## Bug: [Título curto]

### Descrição
[Descreva o problema]

### Passos para Reproduzir
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

### Resultado Esperado
[O que deveria acontecer]

### Resultado Atual
[O que está acontecendo]

### Screenshots
[Cole screenshots do console/network]

### Ambiente
- Navegador: [Chrome 120]
- Sistema: [Windows 11]
- URL: [https://maxxcontrol-frontend.onrender.com]

### Logs do Console
```
[Cole erros do console aqui]
```

### Requisições Falhadas
```
[Cole detalhes do Network aqui]
```
```

---

## Próximos Passos

Após completar todos os testes:

1. ✅ Marcar tarefas concluídas no checklist
2. 📝 Documentar bugs encontrados
3. 🔧 Criar specs de bugfix se necessário
4. 📊 Avaliar performance
5. 💡 Sugerir melhorias

---

## Contatos e Suporte

- **GitHub**: https://github.com/rangelnet/maxxcontrol-x-sistema
- **Painel**: https://maxxcontrol-frontend.onrender.com
- **Backend**: https://maxxcontrol-x-sistema.onrender.com

---

**Última atualização**: 2026-03-12
