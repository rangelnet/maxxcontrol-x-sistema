# Sistema de MAC Address - Como Funciona

## O que é MAC Address?

MAC (Media Access Control) Address é um identificador único de hardware de rede. Cada dispositivo tem um MAC único, como uma "impressão digital".

Exemplo: `A4:5E:60:E8:5F:9D`

## Como o Mesh TV e TV MAXX PRO Usam

Ambos os apps usam o MAC Address para:
1. **Identificar o dispositivo** de forma única
2. **Controlar licenças** (quantos dispositivos podem usar)
3. **Bloquear/Desbloquear** dispositivos específicos
4. **Rastrear uso** (último acesso, IP, etc)

## Fluxo Completo no TV MAXX PRO

### 1. App Obtém o MAC

**Arquivo**: `DeviceUtils.kt`

```kotlin
fun getMacAddress(): String {
    try {
        val all = Collections.list(NetworkInterface.getNetworkInterfaces())
        for (nif in all) {
            // Procura por wlan0 (WiFi) ou eth0 (Ethernet)
            if (!nif.name.equals("wlan0", ignoreCase = true) && 
                !nif.name.equals("eth0", ignoreCase = true)) continue

            val macBytes = nif.hardwareAddress ?: return ""
            val mac = StringBuilder()
            for (b in macBytes) {
                mac.append(String.format("%02X:", b))
            }
            
            if (mac.isNotEmpty()) {
                mac.deleteCharAt(mac.length - 1) // Remove último ":"
            }
            return mac.toString() // Ex: A4:5E:60:E8:5F:9D
        }
    } catch (ex: Exception) {
        // Erro ao obter MAC
    }
    return "02:00:00:00:00:00" // MAC padrão (fallback)
}
```

### 2. App Registra o Dispositivo

**Quando**: Ao fazer login pela primeira vez

**Endpoint**: `POST /api/device/register`

**Dados Enviados**:
```json
{
  "mac_address": "A4:5E:60:E8:5F:9D",
  "modelo": "Xiaomi Mi Box S",
  "android_version": "9.0",
  "app_version": "1.0.0",
  "ip": "192.168.1.34"
}
```

**Backend** (`macController.js`):
```javascript
// Verifica se o MAC já existe
const existing = await pool.query(
  'SELECT * FROM devices WHERE mac_address = $1', 
  [mac_address]
);

if (existing.rows.length > 0) {
  // Atualiza dispositivo existente
  UPDATE devices SET ultimo_acesso = NOW() WHERE mac_address = ...
} else {
  // Cria novo dispositivo
  INSERT INTO devices (mac_address, modelo, ...) VALUES (...)
}
```

### 3. App Verifica Permissão

**Quando**: Toda vez que o app abre

**Endpoint**: `POST /api/device/check`

**Dados Enviados**:
```json
{
  "mac_address": "A4:5E:60:E8:5F:9D"
}
```

**Resposta**:
```json
{
  "allowed": true,
  "device": {
    "id": 1,
    "mac_address": "A4:5E:60:E8:5F:9D",
    "status": "ativo",
    "ultimo_acesso": "2026-02-27T18:30:00Z"
  }
}
```

Se `status = "bloqueado"`:
```json
{
  "allowed": false,
  "error": "Dispositivo bloqueado"
}
```

### 4. Painel Gerencia Dispositivos

**Página**: `/devices`

O administrador pode:
- ✅ Ver todos os dispositivos cadastrados
- ✅ Ver último acesso de cada um
- ✅ Bloquear dispositivos
- ✅ Desbloquear dispositivos
- ✅ Ver modelo, Android, IP

## Banco de Dados

**Tabela**: `devices`

```sql
CREATE TABLE devices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  mac_address VARCHAR(17) UNIQUE NOT NULL,  -- A4:5E:60:E8:5F:9D
  modelo VARCHAR(100),                       -- Xiaomi Mi Box S
  android_version VARCHAR(20),               -- 9.0
  app_version VARCHAR(20),                   -- 1.0.0
  ip VARCHAR(45),                            -- 192.168.1.34
  ultimo_acesso TIMESTAMP,                   -- 2026-02-27 18:30:00
  status VARCHAR(20) DEFAULT 'ativo'         -- ativo / bloqueado
);
```

## Casos de Uso

### Caso 1: Limitar Dispositivos por Usuário

```javascript
// Verificar quantos dispositivos o usuário tem
const devices = await pool.query(
  'SELECT COUNT(*) FROM devices WHERE user_id = $1 AND status = $2',
  [userId, 'ativo']
);

if (devices.rows[0].count >= 3) {
  return res.status(403).json({ 
    error: 'Limite de 3 dispositivos atingido' 
  });
}
```

### Caso 2: Bloquear Dispositivo Roubado

1. Usuário reporta roubo
2. Admin acessa painel `/devices`
3. Encontra o dispositivo pelo MAC
4. Clica em "Bloquear"
5. Próxima vez que o app abrir, será bloqueado

### Caso 3: Rastrear Uso

```javascript
// Dispositivos ativos nas últimas 24h
SELECT * FROM devices 
WHERE ultimo_acesso > NOW() - INTERVAL '24 hours'
ORDER BY ultimo_acesso DESC;
```

## Limitações do MAC Address

### Android 10+ (Restrições de Privacidade)

Em smartphones modernos, o Android retorna um MAC fixo:
- `02:00:00:00:00:00` (MAC aleatório)

**Solução**: Usar Android ID como fallback

```kotlin
fun getDeviceId(context: Context): String {
    val androidId = Settings.Secure.getString(
        context.contentResolver, 
        Settings.Secure.ANDROID_ID
    )
    return androidId ?: getMacAddress()
}
```

### TV Boxes (Funciona Normalmente)

Em TV Boxes e dispositivos Android TV, o MAC real ainda é acessível:
- ✅ Xiaomi Mi Box
- ✅ Fire TV Stick
- ✅ Chromecast com Google TV
- ✅ TV Boxes genéricos

## Comparação: Mesh TV vs TV MAXX PRO

| Recurso | Mesh TV | TV MAXX PRO |
|---------|---------|-------------|
| Obtém MAC | ✅ Sim | ✅ Sim |
| Registra no servidor | ✅ Sim | ✅ Sim |
| Verifica permissão | ✅ Sim | ✅ Sim |
| Painel de gerenciamento | ✅ Sim | ✅ Sim |
| Bloquear dispositivo | ✅ Sim | ✅ Sim |
| Fallback (Android ID) | ❌ Não | ✅ Sim |

## Melhorias Possíveis

### 1. Notificação de Novo Dispositivo

Quando um novo MAC é detectado, enviar email/push:
```
"Novo dispositivo detectado:
Modelo: Xiaomi Mi Box S
IP: 192.168.1.34
MAC: A4:5E:60:E8:5F:9D

Se não foi você, bloqueie imediatamente."
```

### 2. Limite Automático

Configurar no painel quantos dispositivos cada plano permite:
- Free: 1 dispositivo
- Basic: 2 dispositivos
- Premium: 5 dispositivos

### 3. Histórico de Acessos

Salvar cada acesso em uma tabela de logs:
```sql
CREATE TABLE device_access_log (
  id SERIAL PRIMARY KEY,
  device_id INTEGER,
  ip VARCHAR(45),
  timestamp TIMESTAMP DEFAULT NOW()
);
```

### 4. Detecção de Clonagem

Se o mesmo MAC aparecer em IPs muito diferentes:
```javascript
// Detectar se o MAC está sendo usado em locais diferentes
const ips = await pool.query(
  'SELECT DISTINCT ip FROM device_access_log WHERE device_id = $1',
  [deviceId]
);

if (ips.rows.length > 3) {
  // Possível clonagem de MAC
  sendAlert('MAC suspeito de clonagem');
}
```

## Resumo

O sistema de MAC Address funciona assim:

1. **App pega o MAC** do dispositivo (WiFi ou Ethernet)
2. **App registra** no servidor ao fazer login
3. **Servidor salva** no banco de dados
4. **App verifica** permissão toda vez que abre
5. **Painel permite** bloquear/desbloquear dispositivos
6. **Sistema rastreia** último acesso, IP, modelo

É como uma "carteirinha de identidade" do dispositivo que permite controlar quem pode usar o app!
