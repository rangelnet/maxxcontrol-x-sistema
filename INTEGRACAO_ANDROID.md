# 📱 INTEGRAÇÃO DO APP ANDROID COM MAXXCONTROL X

## 🎯 OBJETIVO

Conectar o TV-MAXX-PRO-Android com o backend MaxxControl X para:
- ✅ Autenticação
- ✅ Registro de dispositivo (MAC)
- ✅ Envio de logs
- ✅ Recebimento de atualizações
- ✅ Monitoramento em tempo real

---

## 🔌 CONFIGURAÇÃO DA API

### URL Base do Backend
```
https://maxxcontrol-x-sistema.onrender.com
```

### Headers Padrão
```
Content-Type: application/json
Authorization: Bearer {token_jwt}
```

---

## 📋 PASSO 1: CRIAR CLASSE DE CONFIGURAÇÃO

**Arquivo:** `app/src/main/java/com/tvmaxx/config/ApiConfig.java`

```java
package com.tvmaxx.config;

public class ApiConfig {
    // URL Base da API
    public static final String BASE_URL = "https://maxxcontrol-x-sistema.onrender.com";
    
    // Endpoints
    public static final String LOGIN = "/api/auth/login";
    public static final String REGISTER = "/api/auth/register";
    public static final String VALIDATE_TOKEN = "/api/auth/validate-token";
    
    public static final String DEVICE_REGISTER = "/api/device/register";
    public static final String DEVICE_CHECK = "/api/device/check";
    public static final String DEVICE_LIST = "/api/device/list";
    
    public static final String LOG_CREATE = "/api/log";
    public static final String LOG_LIST = "/api/log";
    
    public static final String BUG_REPORT = "/api/bug";
    public static final String BUG_LIST = "/api/bug";
    
    public static final String VERSION_CHECK = "/api/app/version";
    public static final String VERSION_LIST = "/api/app/versions";
    
    public static final String MONITOR_ONLINE = "/api/monitor/online";
    public static final String MONITOR_DASHBOARD = "/api/monitor/dashboard";
    
    // WebSocket
    public static final String WS_URL = "wss://maxxcontrol-x-sistema.onrender.com";
}
```

---

## 🔐 PASSO 2: SERVIÇO DE AUTENTICAÇÃO

**Arquivo:** `app/src/main/java/com/tvmaxx/service/AuthService.java`

```java
package com.tvmaxx.service;

import android.content.Context;
import android.content.SharedPreferences;
import com.tvmaxx.config.ApiConfig;
import org.json.JSONObject;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class AuthService {
    private Context context;
    private SharedPreferences prefs;
    
    public AuthService(Context context) {
        this.context = context;
        this.prefs = context.getSharedPreferences("maxxcontrol", Context.MODE_PRIVATE);
    }
    
    // Login
    public boolean login(String email, String senha) {
        try {
            URL url = new URL(ApiConfig.BASE_URL + ApiConfig.LOGIN);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            
            JSONObject body = new JSONObject();
            body.put("email", email);
            body.put("senha", senha);
            
            OutputStream os = conn.getOutputStream();
            os.write(body.toString().getBytes());
            os.close();
            
            int responseCode = conn.getResponseCode();
            if (responseCode == 200) {
                // Ler resposta e salvar token
                String response = readResponse(conn);
                JSONObject json = new JSONObject(response);
                String token = json.getString("token");
                
                // Salvar token
                prefs.edit().putString("token", token).apply();
                prefs.edit().putString("email", email).apply();
                
                return true;
            }
            return false;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    // Obter token salvo
    public String getToken() {
        return prefs.getString("token", null);
    }
    
    // Logout
    public void logout() {
        prefs.edit().remove("token").apply();
        prefs.edit().remove("email").apply();
    }
    
    // Ler resposta
    private String readResponse(HttpURLConnection conn) throws Exception {
        java.io.BufferedReader br = new java.io.BufferedReader(
            new java.io.InputStreamReader(conn.getInputStream())
        );
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) {
            sb.append(line);
        }
        br.close();
        return sb.toString();
    }
}
```

---

## 📱 PASSO 3: SERVIÇO DE DISPOSITIVO

**Arquivo:** `app/src/main/java/com/tvmaxx/service/DeviceService.java`

```java
package com.tvmaxx.service;

import android.content.Context;
import android.net.wifi.WifiManager;
import android.os.Build;
import com.tvmaxx.config.ApiConfig;
import org.json.JSONObject;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class DeviceService {
    private Context context;
    private AuthService authService;
    
    public DeviceService(Context context) {
        this.context = context;
        this.authService = new AuthService(context);
    }
    
    // Obter MAC Address
    public String getMacAddress() {
        try {
            WifiManager wifiManager = (WifiManager) context.getSystemService(Context.WIFI_SERVICE);
            return wifiManager.getConnectionInfo().getMacAddress();
        } catch (Exception e) {
            e.printStackTrace();
            return "00:00:00:00:00:00";
        }
    }
    
    // Registrar dispositivo
    public boolean registerDevice() {
        try {
            URL url = new URL(ApiConfig.BASE_URL + ApiConfig.DEVICE_REGISTER);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Authorization", "Bearer " + authService.getToken());
            
            JSONObject body = new JSONObject();
            body.put("mac_address", getMacAddress());
            body.put("modelo", Build.MODEL);
            body.put("android_version", Build.VERSION.RELEASE);
            body.put("app_version", "1.0.0");
            
            OutputStream os = conn.getOutputStream();
            os.write(body.toString().getBytes());
            os.close();
            
            return conn.getResponseCode() == 200 || conn.getResponseCode() == 201;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    // Verificar dispositivo
    public boolean checkDevice() {
        try {
            URL url = new URL(ApiConfig.BASE_URL + ApiConfig.DEVICE_CHECK);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Authorization", "Bearer " + authService.getToken());
            
            JSONObject body = new JSONObject();
            body.put("mac_address", getMacAddress());
            
            OutputStream os = conn.getOutputStream();
            os.write(body.toString().getBytes());
            os.close();
            
            return conn.getResponseCode() == 200;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
```

---

## 📊 PASSO 4: SERVIÇO DE LOGS

**Arquivo:** `app/src/main/java/com/tvmaxx/service/LogService.java`

```java
package com.tvmaxx.service;

import android.content.Context;
import com.tvmaxx.config.ApiConfig;
import org.json.JSONObject;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class LogService {
    private Context context;
    private AuthService authService;
    
    public LogService(Context context) {
        this.context = context;
        this.authService = new AuthService(context);
    }
    
    // Enviar log
    public void sendLog(String tipo, String descricao) {
        new Thread(() -> {
            try {
                URL url = new URL(ApiConfig.BASE_URL + ApiConfig.LOG_CREATE);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("Authorization", "Bearer " + authService.getToken());
                
                JSONObject body = new JSONObject();
                body.put("tipo", tipo); // "login", "erro", "player", "api"
                body.put("descricao", descricao);
                body.put("data", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(new Date()));
                
                OutputStream os = conn.getOutputStream();
                os.write(body.toString().getBytes());
                os.close();
                
                conn.getResponseCode();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
    }
    
    // Log de erro
    public void logError(String erro) {
        sendLog("erro", erro);
    }
    
    // Log de login
    public void logLogin() {
        sendLog("login", "Usuário fez login");
    }
    
    // Log de player
    public void logPlayer(String acao) {
        sendLog("player", "Player: " + acao);
    }
}
```

---

## 🐛 PASSO 5: SERVIÇO DE BUGS

**Arquivo:** `app/src/main/java/com/tvmaxx/service/BugService.java`

```java
package com.tvmaxx.service;

import android.content.Context;
import android.os.Build;
import com.tvmaxx.config.ApiConfig;
import org.json.JSONObject;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class BugService {
    private Context context;
    private AuthService authService;
    
    public BugService(Context context) {
        this.context = context;
        this.authService = new AuthService(context);
    }
    
    // Reportar bug
    public void reportBug(String stackTrace, String descricao) {
        new Thread(() -> {
            try {
                URL url = new URL(ApiConfig.BASE_URL + ApiConfig.BUG_REPORT);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("Authorization", "Bearer " + authService.getToken());
                
                JSONObject body = new JSONObject();
                body.put("stack_trace", stackTrace);
                body.put("descricao", descricao);
                body.put("modelo", Build.MODEL);
                body.put("app_version", "1.0.0");
                
                OutputStream os = conn.getOutputStream();
                os.write(body.toString().getBytes());
                os.close();
                
                conn.getResponseCode();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
    }
}
```

---

## 🔄 PASSO 6: VERIFICAR ATUALIZAÇÕES

**Arquivo:** `app/src/main/java/com/tvmaxx/service/UpdateService.java`

```java
package com.tvmaxx.service;

import android.content.Context;
import com.tvmaxx.config.ApiConfig;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class UpdateService {
    private Context context;
    private AuthService authService;
    
    public UpdateService(Context context) {
        this.context = context;
        this.authService = new AuthService(context);
    }
    
    // Verificar versão
    public JSONObject checkVersion() {
        try {
            URL url = new URL(ApiConfig.BASE_URL + ApiConfig.VERSION_CHECK);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Authorization", "Bearer " + authService.getToken());
            
            if (conn.getResponseCode() == 200) {
                BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = br.readLine()) != null) {
                    sb.append(line);
                }
                br.close();
                return new JSONObject(sb.toString());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
```

---

## 🔌 PASSO 7: WEBSOCKET PARA TEMPO REAL

**Arquivo:** `app/src/main/java/com/tvmaxx/service/WebSocketService.java`

```java
package com.tvmaxx.service;

import android.content.Context;
import com.tvmaxx.config.ApiConfig;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import org.json.JSONObject;
import java.net.URI;

public class WebSocketService extends WebSocketClient {
    private Context context;
    private AuthService authService;
    private WebSocketListener listener;
    
    public interface WebSocketListener {
        void onMessage(JSONObject data);
        void onConnect();
        void onDisconnect();
    }
    
    public WebSocketService(Context context, WebSocketListener listener) {
        super(URI.create(ApiConfig.WS_URL));
        this.context = context;
        this.authService = new AuthService(context);
        this.listener = listener;
    }
    
    @Override
    public void onOpen(ServerHandshake handshakedata) {
        // Autenticar
        try {
            JSONObject auth = new JSONObject();
            auth.put("type", "auth");
            auth.put("token", authService.getToken());
            send(auth.toString());
            
            if (listener != null) {
                listener.onConnect();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    @Override
    public void onMessage(String message) {
        try {
            JSONObject data = new JSONObject(message);
            if (listener != null) {
                listener.onMessage(data);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    @Override
    public void onClose(int code, String reason, boolean remote) {
        if (listener != null) {
            listener.onDisconnect();
        }
    }
    
    @Override
    public void onError(Exception ex) {
        ex.printStackTrace();
    }
}
```

---

## 🎯 PASSO 8: INTEGRAÇÃO NA ACTIVITY PRINCIPAL

**Arquivo:** `app/src/main/java/com/tvmaxx/MainActivity.java`

```java
package com.tvmaxx;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import com.tvmaxx.service.*;

public class MainActivity extends AppCompatActivity {
    private AuthService authService;
    private DeviceService deviceService;
    private LogService logService;
    private BugService bugService;
    private UpdateService updateService;
    private WebSocketService wsService;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        // Inicializar serviços
        authService = new AuthService(this);
        deviceService = new DeviceService(this);
        logService = new LogService(this);
        bugService = new BugService(this);
        updateService = new UpdateService(this);
        
        // Fazer login
        loginUser();
    }
    
    private void loginUser() {
        new Thread(() -> {
            boolean success = authService.login("admin@maxxcontrol.com", "Admin@123");
            if (success) {
                // Registrar dispositivo
                deviceService.registerDevice();
                
                // Log de login
                logService.logLogin();
                
                // Conectar WebSocket
                connectWebSocket();
                
                // Verificar atualizações
                checkUpdates();
            }
        }).start();
    }
    
    private void connectWebSocket() {
        wsService = new WebSocketService(this, new WebSocketService.WebSocketListener() {
            @Override
            public void onMessage(org.json.JSONObject data) {
                // Processar mensagens em tempo real
                handleWebSocketMessage(data);
            }
            
            @Override
            public void onConnect() {
                logService.sendLog("sistema", "WebSocket conectado");
            }
            
            @Override
            public void onDisconnect() {
                logService.sendLog("sistema", "WebSocket desconectado");
            }
        });
        
        try {
            wsService.connect();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    private void handleWebSocketMessage(org.json.JSONObject data) {
        try {
            String type = data.getString("type");
            
            if (type.equals("update")) {
                // Nova versão disponível
                String version = data.getString("version");
                String link = data.getString("link_download");
                // Mostrar notificação de atualização
            } else if (type.equals("alert")) {
                // Alerta do servidor
                String mensagem = data.getString("mensagem");
                // Mostrar alerta
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    private void checkUpdates() {
        new Thread(() -> {
            org.json.JSONObject version = updateService.checkVersion();
            if (version != null) {
                try {
                    boolean obrigatoria = version.getBoolean("obrigatoria");
                    String novaVersao = version.getString("versao");
                    // Verificar se precisa atualizar
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }).start();
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (wsService != null) {
            wsService.close();
        }
    }
}
```

---

## 📦 DEPENDÊNCIAS (build.gradle)

```gradle
dependencies {
    // HTTP
    implementation 'com.squareup.okhttp3:okhttp:4.11.0'
    
    // WebSocket
    implementation 'org.java-websocket:Java-WebSocket:1.5.4'
    
    // JSON
    implementation 'org.json:json:20231013'
    
    // AndroidX
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
}
```

---

## ✅ CHECKLIST DE INTEGRAÇÃO

- [ ] Criar classe ApiConfig
- [ ] Implementar AuthService
- [ ] Implementar DeviceService
- [ ] Implementar LogService
- [ ] Implementar BugService
- [ ] Implementar UpdateService
- [ ] Implementar WebSocketService
- [ ] Integrar na MainActivity
- [ ] Adicionar dependências
- [ ] Testar login
- [ ] Testar registro de dispositivo
- [ ] Testar envio de logs
- [ ] Testar WebSocket
- [ ] Testar verificação de atualizações

---

## 🧪 TESTES

### Teste 1: Login
```
Email: admin@maxxcontrol.com
Senha: Admin@123
Esperado: Token salvo com sucesso
```

### Teste 2: Registro de Dispositivo
```
MAC: (obtido automaticamente)
Modelo: (obtido automaticamente)
Esperado: Dispositivo registrado
```

### Teste 3: Envio de Logs
```
Tipo: login
Descrição: Usuário fez login
Esperado: Log enviado com sucesso
```

### Teste 4: WebSocket
```
Conectar ao servidor
Esperado: Mensagens em tempo real
```

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Copiar código para seu projeto Android
2. ✅ Adicionar dependências
3. ✅ Testar cada serviço
4. ✅ Integrar com UI existente
5. ✅ Publicar app na Play Store

---

**Seu app Android agora está conectado ao MaxxControl X!** 🎉
