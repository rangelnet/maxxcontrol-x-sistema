# Design Técnico — Documentação Completa Maxxcontrol

## Abordagem
Documentação gerada a partir de análise estática do código-fonte, organizada em formato Markdown dentro da pasta `docs/` do projeto.

## Estrutura de Saída

```
docs/
├── README.md                    # Índice geral da documentação
├── architecture.md              # Arquitetura e visão geral do sistema
├── api-reference.md             # Referência completa da API REST
├── database-schema.md           # Schema completo do banco PostgreSQL
├── modules/                     # Documentação por módulo backend
│   ├── auth.md
│   ├── mac-devices.md
│   ├── iptv-servers.md
│   ├── whatsapp.md
│   ├── finance.md
│   ├── branding.md
│   ├── tv-manager.md
│   └── ...
├── frontend/                    # Documentação do frontend
│   ├── pages.md
│   ├── components.md
│   └── routing.md
├── integrations.md              # Integrações externas
├── deployment.md                # Deploy e infraestrutura
└── dev-guide.md                 # Guia do desenvolvedor
```

## Convenções
- Markdown puro (compatível com GitHub, Obsidian, e agentes IA)
- Diagramas em Mermaid quando aplicável
- Exemplos de request/response para cada endpoint
- Tabelas para schemas do banco
- Links internos entre documentos
