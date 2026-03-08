# Visão Geral do Produto

MaxxControl X é um sistema web de gerenciamento e monitoramento remoto para dispositivos Android TV rodando o app TV MAXX PRO. Permite controle centralizado de múltiplos dispositivos através de um painel administrativo.

## Funcionalidades Principais

### Gerenciamento de Dispositivos
- **Registro Automático**: Dispositivos se registram via MAC address ao iniciar o app
- **Status em Tempo Real**: Monitoramento online/offline via WebSocket
- **Bloqueio/Desbloqueio**: Controle remoto de acesso aos dispositivos
- **Informações Detalhadas**: Modelo, versão Android, versão do app, IP, último acesso

### Configuração Remota
- **Servidor IPTV**: Configuração global ou por dispositivo (Xtream Codes)
- **Branding Dinâmico**: Logos, cores, splash screen sem recompilar o app
- **Config do App**: URLs de APIs, versão mínima, forçar atualização
- **API de Teste**: URL customizada para testes por dispositivo

### Gerenciamento de Apps
- **Listar Apps**: Visualizar apps instalados (sistema e usuário)
- **Instalar APK**: Enviar APK via URL para instalação remota
- **Desinstalar Apps**: Remover apps do usuário remotamente
- **Comandos Assíncronos**: Sistema de fila com polling a cada 30s

### Monitoramento
- **Logs de Atividade**: Registro de eventos do app
- **Relatórios de Bugs**: Crash reports com stack trace
- **Relatórios de Performance**: Métricas de player, sync, imagens, APIs
- **Dashboard**: Estatísticas e visão geral do sistema

### Geração de Conteúdo
- **Galeria de Banners**: Integração com TMDB para importar filmes/séries
- **Gerador de Banners**: 6 tamanhos diferentes (cartaz, banner, stories, etc)
- **Templates**: Banners profissionais gerados automaticamente

## Arquitetura

### Backend
- Node.js + Express
- PostgreSQL (Supabase) ou SQLite
- WebSocket para tempo real
- JWT para autenticação

### Frontend
- React 18 com Vite
- TailwindCSS para estilização
- React Router para navegação
- Axios para requisições HTTP
- Lucide React para ícones

### Integração com App Android
- REST API para comunicação
- Polling a cada 30s para comandos
- Autenticação via token fixo (X-Device-Token)
- MAC address como identificador único

## Usuários do Sistema

### Administradores
- Acesso total ao painel
- Gerenciam dispositivos, configurações e conteúdo
- Visualizam logs, bugs e performance

### Dispositivos (TV Boxes)
- Registram-se automaticamente
- Recebem configurações remotas
- Executam comandos do painel
- Reportam status e métricas

## Fluxos Principais

1. **Registro de Dispositivo**: App inicia → Registra MAC → Recebe configurações
2. **Configuração IPTV**: Admin configura no painel → App busca → Aplica credenciais
3. **Bloqueio Remoto**: Admin bloqueia → App recebe comando → Mostra tela de bloqueio
4. **Instalação de App**: Admin envia APK → App baixa → Instala → Reporta status
5. **Branding**: Admin altera cores/logos → App busca → Aplica sem recompilar

## Deploy

- **Backend**: Render.com (https://maxxcontrol-x-sistema.onrender.com)
- **Frontend**: Render.com (https://maxxcontrol-frontend.onrender.com)
- **Banco de Dados**: Supabase (PostgreSQL)
- **CI/CD**: GitHub Actions para deploy automático
