# Script para configurar Git no PATH do Windows

Write-Host "🔍 Procurando instalação do Git..." -ForegroundColor Cyan

# Locais comuns de instalação do Git
$possiveisCaminhos = @(
    "C:\Program Files\Git\cmd",
    "C:\Program Files\Git\bin",
    "C:\Program Files (x86)\Git\cmd",
    "C:\Program Files (x86)\Git\bin",
    "$env:LOCALAPPDATA\Programs\Git\cmd",
    "$env:LOCALAPPDATA\Programs\Git\bin"
)

$gitEncontrado = $false
$caminhoGit = ""

foreach ($caminho in $possiveisCaminhos) {
    if (Test-Path "$caminho\git.exe") {
        Write-Host "✅ Git encontrado em: $caminho" -ForegroundColor Green
        $gitEncontrado = $true
        $caminhoGit = $caminho
        break
    }
}

if (-not $gitEncontrado) {
    Write-Host "❌ Git não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 INSTALE O GIT:" -ForegroundColor Yellow
    Write-Host "1. Acesse: https://git-scm.com/download/windows"
    Write-Host "2. Baixe e instale"
    Write-Host "3. IMPORTANTE: Na instalação, selecione 'Git from the command line and also from 3rd-party software'"
    Write-Host "4. Após instalar, REINICIE o terminal"
    Write-Host ""
    exit 1
}

# Verificar se já está no PATH
$pathAtual = [Environment]::GetEnvironmentVariable("Path", "User")

if ($pathAtual -like "*$caminhoGit*") {
    Write-Host "✅ Git já está no PATH!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔄 REINICIE o terminal para usar o Git" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Depois execute:" -ForegroundColor Cyan
    Write-Host "git --version"
    exit 0
}

# Adicionar ao PATH do usuário
Write-Host "➕ Adicionando Git ao PATH..." -ForegroundColor Yellow

try {
    $novoPath = "$pathAtual;$caminhoGit"
    [Environment]::SetEnvironmentVariable("Path", $novoPath, "User")
    
    Write-Host "✅ Git adicionado ao PATH com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔄 IMPORTANTE: REINICIE o terminal para as mudanças terem efeito" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Depois execute:" -ForegroundColor Cyan
    Write-Host "git --version"
    Write-Host ""
    Write-Host "Se funcionar, execute os comandos de push:" -ForegroundColor Cyan
    Write-Host "cd `"R:\Users\Usuario\Documents\MaxxControl\maxxcontrol-x-sistema`""
    Write-Host "git status"
    Write-Host "git add ."
    Write-Host "git commit -m `"Implementar sistema completo de revendedores e clientes IPTV`""
    Write-Host "git push origin main"
    
} catch {
    Write-Host "❌ Erro ao adicionar ao PATH: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Tente adicionar manualmente:" -ForegroundColor Yellow
    Write-Host "1. Pressione Windows + R"
    Write-Host "2. Digite: sysdm.cpl"
    Write-Host "3. Aba 'Avançado' > 'Variáveis de Ambiente'"
    Write-Host "4. Em 'Variáveis do usuário', edite 'Path'"
    Write-Host "5. Adicione: $caminhoGit"
    Write-Host "6. Reinicie o terminal"
}
