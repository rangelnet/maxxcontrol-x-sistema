# Script de Teste Completo - Gerador de Banners
# Execute este script para diagnosticar o problema

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DIAGNÓSTICO COMPLETO - GERADOR DE BANNERS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Verificar se o servidor está rodando
Write-Host "1. Testando Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get
    Write-Host "   ✅ Servidor está ONLINE" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
    Write-Host "   Timestamp: $($health.timestamp)`n" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ ERRO: Servidor NÃO está rodando!" -ForegroundColor Red
    Write-Host "   Execute: npm start`n" -ForegroundColor Yellow
    exit 1
}

# 2. Testar API de conteúdos
Write-Host "2. Testando API de Conteúdos..." -ForegroundColor Yellow
try {
    $content = Invoke-RestMethod -Uri "http://localhost:3000/api/content/list?limit=5" -Method Get
    $count = $content.conteudos.Count
    Write-Host "   ✅ API respondeu com sucesso" -ForegroundColor Green
    Write-Host "   Conteúdos retornados: $count`n" -ForegroundColor Gray
    
    if ($count -eq 0) {
        Write-Host "   ⚠️  AVISO: Nenhum conteúdo no banco!" -ForegroundColor Yellow
        Write-Host "   Execute: node scripts/popular-conteudos-automatico.js`n" -ForegroundColor Yellow
    } else {
        Write-Host "   Primeiros conteúdos:" -ForegroundColor Gray
        foreach ($item in $content.conteudos | Select-Object -First 3) {
            Write-Host "   - $($item.titulo) (Nota: $($item.nota))" -ForegroundColor Gray
        }
        Write-Host ""
    }
} catch {
    Write-Host "   ❌ ERRO ao chamar API de conteúdos!" -ForegroundColor Red
    Write-Host "   Erro: $($_.Exception.Message)`n" -ForegroundColor Red
}

# 3. Verificar se há conteúdos com nota null
Write-Host "3. Verificando conteúdos com nota null..." -ForegroundColor Yellow
try {
    $content = Invoke-RestMethod -Uri "http://localhost:3000/api/content/list?limit=100" -Method Get
    $nullNotas = $content.conteudos | Where-Object { $null -eq $_.nota }
    $nullCount = $nullNotas.Count
    
    if ($nullCount -gt 0) {
        Write-Host "   ⚠️  Encontrados $nullCount conteúdos com nota null" -ForegroundColor Yellow
        Write-Host "   Isso pode causar problemas no frontend`n" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ Todos os conteúdos têm nota definida`n" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Não foi possível verificar notas`n" -ForegroundColor Yellow
}

# 4. Verificar se o build do frontend existe
Write-Host "4. Verificando build do frontend..." -ForegroundColor Yellow
if (Test-Path "web/dist/index.html") {
    Write-Host "   ✅ Build do frontend existe" -ForegroundColor Green
    $buildDate = (Get-Item "web/dist/index.html").LastWriteTime
    Write-Host "   Última modificação: $buildDate`n" -ForegroundColor Gray
} else {
    Write-Host "   ❌ Build do frontend NÃO existe!" -ForegroundColor Red
    Write-Host "   Execute: cd web && npm run build`n" -ForegroundColor Yellow
}

# 5. Verificar processos na porta 3000
Write-Host "5. Verificando processos na porta 3000..." -ForegroundColor Yellow
$processes = netstat -ano | Select-String ":3000"
if ($processes) {
    Write-Host "   ✅ Processo encontrado na porta 3000" -ForegroundColor Green
    Write-Host "   $processes`n" -ForegroundColor Gray
} else {
    Write-Host "   ⚠️  Nenhum processo na porta 3000`n" -ForegroundColor Yellow
}

# Resumo
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESUMO DO DIAGNÓSTICO" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Abra o navegador em: http://localhost:3000/banners" -ForegroundColor White
Write-Host "2. Pressione F12 para abrir o Console" -ForegroundColor White
Write-Host "3. Recarregue a página (Ctrl+F5)" -ForegroundColor White
Write-Host "4. Copie TODOS os erros do console" -ForegroundColor White
Write-Host "5. Me envie os erros`n" -ForegroundColor White

Write-Host "Se a tela ainda estiver preta, o problema pode ser:" -ForegroundColor Yellow
Write-Host "- Erro JavaScript no console do navegador" -ForegroundColor Gray
Write-Host "- Cache do navegador (limpe com Ctrl+Shift+Delete)" -ForegroundColor Gray
Write-Host "- Build do frontend desatualizado (execute: cd web && npm run build)`n" -ForegroundColor Gray
