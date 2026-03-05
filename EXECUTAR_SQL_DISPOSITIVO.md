# 📝 ADICIONAR DISPOSITIVO NO SUPABASE

## PASSO 1: Abrir SQL Editor

1. **Acesse**: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/sql/new

2. **Cole** este SQL:

```sql
INSERT INTO devices (
  mac_address,
  modelo,
  android_version,
  app_version,
  ip,
  status,
  connection_status,
  ultimo_acesso
) VALUES (
  '3C:E5:B4:18:FB:1C',
  'TV Box',
  '11',
  '1.0.0',
  '192.168.1.100',
  'ativo',
  'offline',
  NOW()
)
ON CONFLICT (mac_address) 
DO UPDATE SET
  ultimo_acesso = NOW(),
  status = 'ativo';
```

3. **Clique** em "Run" (ou pressione Ctrl+Enter)

---

## PASSO 2: Verificar

Execute este SQL para confirmar:

```sql
SELECT * FROM devices WHERE mac_address = '3C:E5:B4:18:FB:1C';
```

Deve retornar 1 linha com o dispositivo.

---

## PASSO 3: Atualizar Painel

1. **Volte** para o painel: https://maxxcontrol-frontend.onrender.com/devices

2. **Atualize** a página (F5)

3. **Verifique** se o MAC `3C:E5:B4:18:FB:1C` aparece agora

---

## ✅ RESULTADO ESPERADO

Você deve ver na lista:
- MAC: 3C:E5:B4:18:FB:1C
- Modelo: TV Box
- Status: ATIVO
- Conexão: OFFLINE

---

**EXECUTE O SQL AGORA!** 🚀
