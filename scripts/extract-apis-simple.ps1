# Script PowerShell para extrair APIs do projeto Android

$projectPath = "R:\Users\Usuario\Documents\tv-maxx\TV-MAXX-PRO-Android"
$outputFile = "API_ENDPOINTS.txt"

Write-Host "🔍 Procurando APIs no projeto Android..." -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $projectPath)) {
    Write-Host "❌ Projeto não encontrado!" -ForegroundColor Red
    exit 1
}

# Padrões para buscar
$patterns = @(
    'https?://[^\s"'']+',
    'BASE_URL\s*=\s*["'']([^"'']+)["'']',
    '@GET\(["'']([^"'']+)["'']',
    '@POST\(["'']([^"'']+)["'']',
    'endpoint\s*=\s*["'']([^"'']+)["'']'
)

$apis = @()

# Buscar em arquivos .java, .kt, .xml
Get-ChildItem -Path $projectPath -Recurse -Include *.java,*.kt,*.xml -ErrorAction SilentlyContinue | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    
    if ($content) {
        foreach ($pattern in $patterns) {
            $matches = [regex]::Matches($content, $pattern)
            foreach ($match in $matches) {
                $api = $match.Value
                if ($api.Length -gt 5 -and $apis -notcontains $api) {
                    $apis += $api
                }
            }
        }
    }
}

# Salvar resultados
$apis | Sort-Object | Out-File $outputFile

Write-Host "✅ APIs extraídas com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📄 Total de APIs encontradas: $($apis.Count)" -ForegroundColor Yellow
Write-Host "📄 Arquivo gerado: $outputFile" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔍 Preview:" -ForegroundColor Cyan
$apis | Select-Object -First 10 | ForEach-Object { Write-Host "  - $_" }

if ($apis.Count -gt 10) {
    Write-Host "  ... e mais $($apis.Count - 10) APIs"
}
