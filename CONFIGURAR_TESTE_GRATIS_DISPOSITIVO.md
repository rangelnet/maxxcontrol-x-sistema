# ✏ CONFIGURAR TESTE GRÁTIS POR DISPOSITIVO

## O QUE FOI IMPLEMENTADO

Sistema completo para configurar URL da API de "Teste Grátis" individualmente para cada dispositivo no painel.

---

## COMO FUNCIONA

### NO PAINEL

1. **Acesse**: https://maxxcontrol-frontend.onrender.com/devices

2. **Clique** no ícone ✏ (lápis verde) do dispositivo

3. **Configure** a URL da API de teste:
   ```
   https://painel.masterbins.com/api/chatbot/bOxLAQLZ7a/ANKWPKDPRq
   ```

4. **Salve**

### NO APP ANDROID

Quando o usuário clicar em "TESTE GRÁTIS":

1. App busca a URL configurada no painel para aquele MAC
2. Se tiver URL configurada, usa ela
3. Se não tiver, usa a URL padrão do app

---

## EXECUTAR MIGRAÇÃO SQL

Antes de usar, execute este SQL no Supabase:

```sql
ALTER TABLE devices 
ADD COLUMN IF NOT EXISTS test_api_url TEXT;
```

**Como executar**:
1. Acesse: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/sql/new
2. Cole o SQL acima
3. Clique em "Run"

---

## API ENDPOINTS

### Configurar URL (Painel)
```
POST /api/device/test-api-url
Authorization: Bearer {token}

Body:
{
  "device_id": 1,
  "test_api_url": "https://painel.masterbins.com/api/chatbot/..."
}
```

### Buscar URL (App)
```
GET /api/device/test-api-url/:mac_address

Response:
{
  "test_api_url": "https://...",
  "has_custom_url": true
}
```

---

## EXEMPLO DE USO

### Dispositivo 1 (MAC: 3C:E5:B4:18:FB:1C)
- URL: `https://painel.masterbins.com/api/chatbot/ABC123`
- Quando clicar em "TESTE GRÁTIS", usa essa URL

### Dispositivo 2 (MAC: AA:BB:CC:DD:EE:FF)
- URL: (vazio)
- Quando clicar em "TESTE GRÁTIS", usa URL padrão do app

---

## PRÓXIMOS PASSOS

1. ✅ Backend implementado (commit 750ada8)
2. ✅ Frontend implementado (painel)
3. ⏳ Executar migração SQL no Supabase
4. ⏳ Atualizar app Android para buscar URL do painel
5. ⏳ Testar no dispositivo

---

**EXECUTE A MIGRAÇÃO SQL AGORA!** 🚀
