# Documentação Completa do Painel Maxxcontrol

## Resumo
Criar documentação técnica e operacional completa do sistema **Maxxcontrol X** — o painel de gestão IPTV que controla dispositivos, credenciais, pagamentos, WhatsApp Bot e branding para revendedores.

## Motivação
O projeto cresceu de forma orgânica e atualmente possui **32 módulos backend**, **38 páginas frontend** e **25+ tabelas no banco** sem documentação centralizada. Isso dificulta:
- Onboarding de novos desenvolvedores/agentes IA
- Manutenção e debugging
- Planejamento de novas features
- Entendimento das integrações entre módulos

## O que será documentado
1. **Arquitetura Geral** — Visão macro do sistema (backend, frontend, banco, deploy)
2. **API Reference** — Todos os 30+ endpoints REST documentados
3. **Schema do Banco de Dados** — Todas as tabelas, relações e migrações
4. **Módulos Backend** — Cada um dos 32 módulos com sua função
5. **Páginas Frontend** — Todas as 38 páginas e seus componentes
6. **Integrações Externas** — WhatsApp, Telegram, Google, TMDB, Sports, Stripe/PIX
7. **Deploy & Infraestrutura** — Render.com, variáveis de ambiente, health checks
8. **WebSocket & Tempo Real** — Sistema de comunicação em tempo real
9. **Guia de Desenvolvimento** — Como rodar, contribuir e debugar

## Impacto
- **Zero breaking changes** — É documentação, não altera código
- **Benefício imediato** — Agentes IA terão contexto completo do projeto
- **Manutenibilidade** — Facilita localizar bugs e planejar features
