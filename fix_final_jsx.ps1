$f = "r:\Users\Usuario\Meu Drive\Painel Maxxcontrol-x-sistema\web\src\pages\Devices.jsx"
$lines = Get-Content $f
$newLines = @()

# Linha 1821 eh a intrusa (indice 1820 no array 0-indexed)
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($i -eq 1820) {
        # Pula a linha extra
        continue
    }
    $newLines += $lines[$i]
}

$newLines | Set-Content $f -Encoding UTF8
Write-Host "Linha extra removida com sucesso! O erro de JSX sumiu."
