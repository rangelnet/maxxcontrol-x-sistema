# 🧪 TESTAR API RÁPIDO

## TESTE 1: API Está Online?

**Abra no navegador**:
```
https://maxxcontrol-x-sistema.onrender.com/health
```

**Deve retornar**:
```json
{
  "status": "online",
  "timestamp": "2026-02-28T...",
  "service": "MaxxControl X API"
}
```

---

## TESTE 2: Listar Dispositivos

**Abra no navegador**:
```
https://maxxcontrol-x-sistema.onrender.com/api/device/list-all
```

**Se pedir login**: A API está funcionando, mas precisa autenticação

**Se retornar erro 500**: Problema de conexão com banco

---

## TESTE 3: Verificar Banco de Dados

**Abra**: https://supabase.com/dashboard/project/mmfbirjrhrhobbnzfffe/editor

**Execute este SQL**:
```sql
SELECT * FROM devices WHERE mac_address = '3C:E5:B4:18:FB:1C';
```

**Deve retornar**: 1 linha com o dispositivo

---

## 🎯 RESULTADO ESPERADO

- ✅ API online (teste 1)
- ✅ Dispositivo no banco (teste 3)
- ✅ Dispositivo aparece no painel

---

**FAÇA OS TESTES AGORA!** 🚀
