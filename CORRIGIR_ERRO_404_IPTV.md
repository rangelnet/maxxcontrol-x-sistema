# 🔧 Corrigir Erro 404 - Servidores IPTV

## ❌ Problema
```
GET https://maxxcontrol-frontend.onrender.com/api/iptv-server/config 404 (Not Found)
```

## ✅ Soluções

### Solução 1: Usar a Nova Integração qPanel (RECOMENDADO)

1. **Clique na aba "Painéis qPanel"** no painel MaxxControl
2. Esta é a nova integração que:
   - ✅ Conecta com painéis qPanel reais
   - ✅ Cria contas IPTV automaticamente
   - ✅ Extrai DNS automaticamente
   - ✅ Registra direto no app TV MAXX PRO

### Solução 2: Corrigir a Aba Antiga "Servidores IPTV"

Execute no Supabase SQL Editor:

```sql
-- Criar configuração IPTV padrão
INSERT INTO iptv_server_config (id, xtream_url, xtream_username, xtream_password, updated_at)
VALUES (1, '', '', '', NOW())
ON CONFLICT (id) DO NOTHING;
```

## 🎯 Diferença Entre as Abas

### "Servidores IPTV" (Aba Antiga)
- ❌ Configuração manual de servidor único
- ❌ Não cria contas automaticamente
- ❌ Não extrai DNS

### "Painéis qPanel" (Nova Integração)
- ✅ Múltiplos painéis qPanel
- ✅ Criação automática de contas
- ✅ Extração automática de DNS
- ✅ Integração direta com TV MAXX PRO
- ✅ Substitui SmartOne IPTV

## 🚀 Recomendação

**Use a aba "Painéis qPanel"** - é a integração completa que você precisa!

---

**Data:** 17 de março de 2026  
**Status:** Soluções disponíveis