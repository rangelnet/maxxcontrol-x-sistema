# Script para testar endpoint de servidores IPTV
# Uso: .\testar-servidores-iptv.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTE DE SERVIDORES IPTV" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"

# Teste 1: Health check
Write-Host "1. Testando health check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "   ✅ API está online" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ API não está respondendo" -ForegroundColor Red
    Write-Host "   Erro: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Teste 2: Verificar banco de dados
Write-Host "2. Verificando servidores no banco..." -ForegroundColor Yellow
try {
    $result = node -e "const pool = require('./config/database'); pool.query('SELECT COUNT(*) as count FROM servers').then(res => { console.log(res.rows[0].count); pool.end(); }).catch(err => { console.error('ERRO'); pool.end(); })"
    
    if ($result -eq "ERRO") {
        Write-Host "   ❌ Erro ao consultar banco de dados" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "   ✅ Servidores cadastrados: $result" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erro ao verificar banco" -ForegroundColor Red
    Write-Host "   Erro: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Teste 3: Endpoint público (sem autenticação)
Write-Host "3. Testando endpoint público /api/iptv/servers..." -ForegroundColor Yellow
try {
    $servers = Invoke-RestMethod -Uri "$baseUrl/api/iptv/servers" -Method Get
    Write-Host "   ✅ Endpoint público funcionando" -ForegroundColor Green
    Write-Host "   Servidores ativos: $($servers.Count)" -ForegroundColor Gray
    
    foreach ($server in $servers) {
        Write-Host "   - $($server.name) (Prioridade: $($server.priority))" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Erro ao acessar endpoint público" -ForegroundColor Red
    Write-Host "   Erro: $_" -ForegroundColor Red
}

Write-Host ""

# Teste 4: Login e obter token
Write-Host "4. Fazendo login para obter token..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@maxxcontrol.com"
    senha = "Admin@123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "   ✅ Login realizado com sucesso" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Erro ao fazer login" -ForegroundColor Red
    Write-Host "   Erro: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Verifique se o usuário admin existe no banco:" -ForegroundColor Yellow
    Write-Host "   node -e `"const pool = require('./config/database'); pool.query('SELECT email FROM users WHERE email = ''admin@maxxcontrol.com''').then(res => { console.log('Usuário encontrado:', res.rows.length > 0); pool.end(); })`"" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# Teste 5: Endpoint protegido (com autenticação)
Write-Host "5. Testando endpoint protegido /api/iptv/servers/all..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $allServers = Invoke-RestMethod -Uri "$baseUrl/api/iptv/servers/all" -Method Get -Headers $headers
    Write-Host "   ✅ Endpoint protegido funcionando" -ForegroundColor Green
    Write-Host "   Total de servidores: $($allServers.Count)" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "   Detalhes dos servidores:" -ForegroundColor Cyan
    foreach ($server in $allServers) {
        Write-Host "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
        Write-Host "   ID: $($server.id)" -ForegroundColor Gray
        Write-Host "   Nome: $($server.name)" -ForegroundColor White
        Write-Host "   URL: $($server.url)" -ForegroundColor Gray
        Write-Host "   Região: $($server.region)" -ForegroundColor Gray
        Write-Host "   Prioridade: $($server.priority)" -ForegroundColor Gray
        Write-Host "   Status: $($server.status)" -ForegroundColor $(if ($server.status -eq "ativo") { "Green" } else { "Yellow" })
        Write-Host "   Usuários: $($server.users)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Erro ao acessar endpoint protegido" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "   Erro: $_" -ForegroundColor Red
    
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host ""
        Write-Host "   ⚠️  Erro 401: Token inválido ou expirado" -ForegroundColor Yellow
        Write-Host "   Verifique se o JWT_SECRET está configurado no .env" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTE CONCLUÍDO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para testar no navegador:" -ForegroundColor Yellow
Write-Host "1. Acesse: http://localhost:3000/login" -ForegroundColor Gray
Write-Host "2. Faça login com admin@maxxcontrol.com / Admin@123" -ForegroundColor Gray
Write-Host "3. Acesse: http://localhost:3000/servers-management" -ForegroundColor Gray
Write-Host "4. Abra o console (F12) para ver os logs detalhados" -ForegroundColor Gray
Write-Host ""
