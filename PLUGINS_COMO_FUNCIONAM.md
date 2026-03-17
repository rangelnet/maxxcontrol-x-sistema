# Como os Plugins Funcionam - Explicação Completa

## 📌 Resumo Geral

Os plugins são **extensões do Chrome** que automatizam o cadastro de playlists em painéis IPTV externos (SmartOne, IBOPro, IBOCast, VU Player). Eles **NÃO dependem do seu painel MaxxControl**, funcionam de forma independente.

---

## 🔌 Plugin 2 - SmartOne Manager (Licenciado)

### O que faz?
Gerencia e exclui registros no **SmartOne IPTV** por MAC address.

### Como funciona?
```
Você abre o painel SmartOne
    ↓
Plugin detecta a página
    ↓
Injeta interface no painel
    ↓
Você clica em "Deletar por MAC"
    ↓
Plugin envia requisição para SmartOne
    ↓
Registro é deletado
```

### Arquivos principais:
- **manifest.json** - Configuração da extensão
- **popup.html/popup.js** - Interface do usuário
- **content.js** - Injeta código na página do SmartOne
- **background.js** - Processa requisições em background
- **license-check.js** - Valida licença

### Permissões:
```json
"host_permissions": [
  "https://smartone-iptv.com/*",
  "http://134.255.177.180:3500/*"
]
```

### Fluxo de dados:
```
SmartOne (painel externo)
    ↓
Plugin 2 (Chrome Extension)
    ↓
Seu navegador
```

**Não se conecta com MaxxControl!**

---

## 🔌 Plugin 3 - IPTV Manager PRO + SmartOne Integration

### O que faz?
Gerenciamento completo de painéis **qPanel** e cadastro automático no **SmartOne**.

### Como funciona?
```
Você abre qPanel ou SmartOne
    ↓
Plugin detecta a página
    ↓
Injeta interface de gerenciamento
    ↓
Você configura credenciais
    ↓
Plugin automatiza cadastro
    ↓
Dados salvos no SmartOne
```

### Arquivos principais:
- **manifest.json** - Configuração
- **popup-licensed.html** - Interface licenciada
- **smartone-content.js** - Injeta código no SmartOne
- **license-check.js** - Validação de licença
- **license-ui.js** - Interface de licenciamento

### Permissões:
```json
"host_permissions": [
  "https://*/*",
  "*://smartone-iptv.com/*"
]
```

### Fluxo de dados:
```
qPanel ou SmartOne (painéis externos)
    ↓
Plugin 3 (Chrome Extension)
    ↓
Seu navegador
```

**Não se conecta com MaxxControl!**

---

## 🔌 Plugin 4 - Playlist Manager 4-in-1

### O que faz?
Cadastro automático de playlists em **4 painéis diferentes**:
1. SmartOne
2. IBOPro
3. IBOCast
4. VU Player

### Como funciona?
```
Você abre um dos 4 painéis
    ↓
Plugin detecta qual painel é
    ↓
Injeta script específico para aquele painel
    ↓
Você cola a URL da playlist
    ↓
Plugin automatiza o cadastro
    ↓
Playlist fica disponível no painel
```

### Arquivos principais:
- **manifest.json** - Configuração
- **popup.html/popup.js** - Interface principal
- **smartone-content.js** - Script para SmartOne
- **ibocast-content.js** - Script para IBOCast
- **ibopro-content-v3.js** - Script para IBOPro
- **vuplayer-content.js** - Script para VU Player
- **license-check.js** - Validação de licença

### Permissões:
```json
"host_permissions": [
  "https://*/*",
  "*://smartone-iptv.com/*",
  "*://ibocast.com/*",
  "*://ibopro.tv/*",
  "*://ibopro.com/*",
  "*://iboproapp.com/*",
  "*://api.iboproapp.com/*",
  "*://vuplayer.com/*"
]
```

### Fluxo de dados:
```
SmartOne / IBOPro / IBOCast / VU Player (painéis externos)
    ↓
Plugin 4 (Chrome Extension)
    ↓
Seu navegador
```

**Não se conecta com MaxxControl!**

---

## 🔄 Arquitetura Geral dos Plugins

```
┌─────────────────────────────────────────────────────────┐
│                    SEU NAVEGADOR CHROME                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         PLUGIN (Extensão Chrome)                │  │
│  │                                                  │  │
│  │  ┌─────────────────────────────────────────┐   │  │
│  │  │ popup.html/popup.js (Interface)         │   │  │
│  │  │ - Botões e formulários                  │   │  │
│  │  │ - Entrada de dados do usuário           │   │  │
│  │  └─────────────────────────────────────────┘   │  │
│  │                      ↓                          │  │
│  │  ┌─────────────────────────────────────────┐   │  │
│  │  │ content.js (Injeta na página)           │   │  │
│  │  │ - Modifica DOM do painel externo        │   │  │
│  │  │ - Intercepta requisições                │   │  │
│  │  │ - Automatiza ações                      │   │  │
│  │  └─────────────────────────────────────────┘   │  │
│  │                      ↓                          │  │
│  │  ┌─────────────────────────────────────────┐   │  │
│  │  │ background.js (Processa em background)  │   │  │
│  │  │ - Valida dados                          │   │  │
│  │  │ - Envia requisições HTTP                │   │  │
│  │  │ - Armazena dados localmente             │   │  │
│  │  └─────────────────────────────────────────┘   │  │
│  │                      ↓                          │  │
│  │  ┌─────────────────────────────────────────┐   │  │
│  │  │ license-check.js (Validação)            │   │  │
│  │  │ - Verifica se plugin está licenciado    │   │  │
│  │  │ - Bloqueia se não tiver licença         │   │  │
│  │  └─────────────────────────────────────────┘   │  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                      ↓                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │  PAINÉIS EXTERNOS (SmartOne, IBOPro, etc)       │  │
│  │  - Recebem requisições do plugin                │  │
│  │  - Processam dados                             │  │
│  │  - Retornam resposta                           │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Comparação dos 3 Plugins

| Aspecto | Plugin 2 | Plugin 3 | Plugin 4 |
|---------|----------|----------|----------|
| **Nome** | SmartOne Manager | IPTV Manager PRO | Playlist Manager 4-in-1 |
| **Função** | Deletar registros | Gerenciar qPanel | Cadastrar playlists |
| **Painéis suportados** | SmartOne | qPanel + SmartOne | SmartOne + IBOPro + IBOCast + VU Player |
| **Licença** | Sim | Sim | Sim |
| **Conecta com MaxxControl?** | NÃO | NÃO | NÃO |
| **Funciona offline?** | NÃO (precisa do painel) | NÃO (precisa do painel) | NÃO (precisa do painel) |

---

## 🔐 Sistema de Licenciamento

Todos os 3 plugins têm **validação de licença**:

### Como funciona:
```
Você instala o plugin
    ↓
Plugin verifica se tem licença
    ↓
Se não tiver → Mostra tela de registro
    ↓
Você insere código de licença
    ↓
Plugin valida com servidor de licenças
    ↓
Se válido → Plugin ativa
    ↓
Se inválido → Plugin bloqueia
```

### Arquivo: `license-check.js`
```javascript
// Verifica se plugin está licenciado
function checkLicense() {
  const license = localStorage.getItem('plugin_license');
  
  if (!license) {
    showLicenseUI(); // Mostra tela de registro
    return false;
  }
  
  // Valida licença com servidor
  validateLicenseWithServer(license);
}
```

---

## 🚀 Como Usar os Plugins

### Instalação:
1. Abra Chrome
2. Vá para `chrome://extensions/`
3. Ative "Modo de desenvolvedor"
4. Clique "Carregar extensão não empacotada"
5. Selecione a pasta do plugin

### Uso:
1. Abra o painel externo (SmartOne, IBOPro, etc)
2. Clique no ícone do plugin no Chrome
3. Insira os dados (URL, MAC, credenciais)
4. Clique em "Executar" ou "Cadastrar"
5. Plugin automatiza a ação

---

## ⚠️ Importante: Plugins NÃO se conectam com MaxxControl

Os plugins funcionam **independentemente** do seu painel MaxxControl:

```
MaxxControl X (seu painel)
├── Gerencia dispositivos
├── Armazena configurações
└── Controla app Android

Plugins (Chrome Extensions)
├── Gerenciam painéis externos
├── Automatizam cadastros
└── Funcionam no navegador
```

**Eles não compartilham dados!**

---

## 📝 Resumo Final

- **Plugin 2**: Deleta registros no SmartOne
- **Plugin 3**: Gerencia qPanel e SmartOne
- **Plugin 4**: Cadastra playlists em 4 painéis

Todos são **extensões do Chrome** que funcionam **no seu navegador**, não no servidor.

Se você quer que os plugins se conectem com MaxxControl, seria necessário:
1. Criar API no MaxxControl para receber dados dos plugins
2. Modificar os plugins para enviar dados para MaxxControl
3. Armazenar dados no banco do MaxxControl

Quer que eu faça isso?
