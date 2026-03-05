# 📱 Gerenciar Apps Instalados no TV Box

## O que foi implementado

Sistema completo para gerenciar apps instalados no TV Box através do painel:

✅ **Listar apps instalados** - Ver todos os apps (sistema e usuário)
✅ **Desinstalar apps** - Remover apps do usuário
✅ **Enviar APKs** - Instalar novos apps via URL
✅ **Separação de apps** - Apps do sistema vs apps do usuário
✅ **Histórico de comandos** - Rastrear instalações/desinstalações

---

## 🎯 Como Usar no Painel

### 1. Acessar Gerenciar Apps
- Clique em **"Gerenciar Apps"** no menu lateral
- Selecione um dispositivo na lista

### 2. Ver Apps Instalados
- **Apps Instalados** - Apps que você pode desinstalar
- **Apps do Sistema** - Apps pré-instalados (não podem ser removidos)

### 3. Desinstalar um App
- Clique no ícone de lixeira ❌ ao lado do app
- Confirme a desinstalação
- O comando será enviado para o dispositivo

### 4. Enviar um Novo APK
- Clique em **"Enviar APK"**
- Preencha:
  - **Nome do App**: Ex: YouTube
  - **URL do APK**: Link direto para o arquivo .apk
- Clique em **"Enviar"**
- O dispositivo receberá o comando de instalação

---

## 🔧 Implementação no App Android

### 1. Adicionar Permissões (AndroidManifest.xml)

```xml
<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />
<uses-permission android:name="android.permission.GET_PACKAGE_SIZE" />
<uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />
<uses-permission android:name="android.permission.REQUEST_DELETE_PACKAGES" />
```

### 2. Criar Serviço de Apps (AppManagerService.kt)

```kotlin
package com.tvmaxx.pro.services

import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.http.*

interface AppManagerApi {
    @POST("/api/apps/register")
    suspend fun registerApp(@Body app: InstalledApp)

    @GET("/api/apps/commands/{device_id}")
    suspend fun getPendingCommands(@Path("device_id") deviceId: Int): CommandsResponse

    @POST("/api/apps/commands/status")
    suspend fun updateCommandStatus(@Body status: CommandStatus)
}

data class InstalledApp(
    val device_id: Int,
    val package_name: String,
    val app_name: String,
    val version_code: Int,
    val version_name: String,
    val is_system: Boolean
)

data class CommandsResponse(
    val commands: List<DeviceCommand>
)

data class DeviceCommand(
    val id: Int,
    val command_type: String,
    val command_data: Map<String, Any>,
    val status: String
)

data class CommandStatus(
    val command_id: Int,
    val status: String,
    val result: String? = null
)

class AppManagerService(private val context: Context) {
    private val packageManager = context.packageManager
    private val api = RetrofitClient.appManagerApi

    // Listar todos os apps instalados
    suspend fun listInstalledApps(): List<InstalledApp> = withContext(Dispatchers.Default) {
        val apps = mutableListOf<InstalledApp>()
        val packages = packageManager.getInstalledApplications(PackageManager.GET_META_DATA)

        for (appInfo in packages) {
            val isSystem = (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0
            val appName = packageManager.getApplicationLabel(appInfo).toString()
            val packageInfo = packageManager.getPackageInfo(appInfo.packageName, 0)

            apps.add(
                InstalledApp(
                    device_id = getDeviceId(),
                    package_name = appInfo.packageName,
                    app_name = appName,
                    version_code = packageInfo.versionCode,
                    version_name = packageInfo.versionName ?: "1.0",
                    is_system = isSystem
                )
            )
        }

        return@withContext apps
    }

    // Registrar apps no servidor
    suspend fun syncAppsToServer() {
        try {
            val apps = listInstalledApps()
            for (app in apps) {
                api.registerApp(app)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    // Buscar comandos pendentes
    suspend fun checkPendingCommands(): List<DeviceCommand> {
        return try {
            val response = api.getPendingCommands(getDeviceId())
            response.commands
        } catch (e: Exception) {
            emptyList()
        }
    }

    // Executar comando de desinstalação
    suspend fun uninstallApp(packageName: String, commandId: Int) {
        try {
            val intent = android.content.Intent(
                android.content.Intent.ACTION_DELETE,
                android.net.Uri.parse("package:$packageName")
            )
            context.startActivity(intent)

            // Notificar servidor
            api.updateCommandStatus(
                CommandStatus(
                    command_id = commandId,
                    status = "completed",
                    result = "App desinstalado"
                )
            )
        } catch (e: Exception) {
            api.updateCommandStatus(
                CommandStatus(
                    command_id = commandId,
                    status = "failed",
                    result = e.message
                )
            )
        }
    }

    // Executar comando de instalação
    suspend fun installApp(appUrl: String, commandId: Int) {
        try {
            // Baixar APK
            val apkFile = downloadApk(appUrl)

            // Instalar APK
            val intent = android.content.Intent(
                android.content.Intent.ACTION_VIEW
            ).apply {
                setDataAndType(
                    android.net.Uri.fromFile(apkFile),
                    "application/vnd.android.package-archive"
                )
                flags = android.content.Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)

            // Notificar servidor
            api.updateCommandStatus(
                CommandStatus(
                    command_id = commandId,
                    status = "completed",
                    result = "App instalado"
                )
            )
        } catch (e: Exception) {
            api.updateCommandStatus(
                CommandStatus(
                    command_id = commandId,
                    status = "failed",
                    result = e.message
                )
            )
        }
    }

    private suspend fun downloadApk(url: String): java.io.File {
        // Implementar download do APK
        // Usar OkHttp ou Retrofit para baixar
        return java.io.File(context.cacheDir, "temp.apk")
    }

    private fun getDeviceId(): Int {
        // Retornar o ID do dispositivo armazenado
        return android.provider.Settings.Secure.getString(
            context.contentResolver,
            android.provider.Settings.Secure.ANDROID_ID
        ).hashCode()
    }
}
```

### 3. Integrar no MainActivity

```kotlin
// No onCreate ou em um ViewModel
val appManager = AppManagerService(context)

// Sincronizar apps ao iniciar
lifecycleScope.launch {
    appManager.syncAppsToServer()
}

// Verificar comandos periodicamente
lifecycleScope.launch {
    while (true) {
        val commands = appManager.checkPendingCommands()
        for (command in commands) {
            when (command.command_type) {
                "uninstall_app" -> {
                    val packageName = command.command_data["package_name"] as String
                    appManager.uninstallApp(packageName, command.id)
                }
                "install_app" -> {
                    val appUrl = command.command_data["app_url"] as String
                    appManager.installApp(appUrl, command.id)
                }
            }
        }
        delay(5000) // Verificar a cada 5 segundos
    }
}
```

---

## 📊 Banco de Dados

Duas novas tabelas foram criadas:

### device_apps
```sql
- id: ID único
- device_id: Referência ao dispositivo
- package_name: Nome do pacote (ex: com.google.android.youtube)
- app_name: Nome do app (ex: YouTube)
- version_code: Código da versão
- version_name: Nome da versão (ex: 1.0.0)
- is_system: Se é app do sistema
- installed_at: Data de instalação
- updated_at: Última atualização
```

### device_commands
```sql
- id: ID único
- device_id: Referência ao dispositivo
- command_type: Tipo de comando (install_app, uninstall_app)
- command_data: Dados do comando em JSON
- status: pending, executing, completed, failed
- result: Resultado da execução
- created_at: Data de criação
- completed_at: Data de conclusão
```

---

## 🚀 Próximos Passos

1. **Executar migração SQL** no Supabase:
   ```sql
   -- Copiar conteúdo de: MaxxControl/maxxcontrol-x-sistema/database/migrations/create_apps_tables.sql
   ```

2. **Implementar no App Android** usando o código Kotlin fornecido

3. **Testar no painel**:
   - Acessar "Gerenciar Apps"
   - Selecionar um dispositivo
   - Ver apps listados
   - Tentar desinstalar um app
   - Tentar enviar um APK

---

## 📝 Notas

- Apps do sistema não podem ser desinstalados (apenas listados)
- Comandos são armazenados no banco até serem executados
- O app Android verifica comandos periodicamente
- URLs de APK devem ser acessíveis publicamente

---

## ✅ Status

- ✅ Backend implementado
- ✅ Frontend implementado
- ✅ Banco de dados criado
- ⏳ App Android (aguardando implementação)
- ⏳ Testes em produção
