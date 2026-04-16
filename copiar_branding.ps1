# 📦 Script para copiar assets do TV MAXX Android para o painel web
# Execute no PowerShell como administrador

$src = "r:\Users\Usuario\Meu Drive\TV-MAXX-PRO-Android\app\src\main\res\drawable"
$dst = "r:\Users\Usuario\Meu Drive\Painel site Mxxcontrol-x-sistema\web\public\branding"

# Criar pasta destino
New-Item -ItemType Directory -Force -Path $dst | Out-Null

# Copiar logos principais
Copy-Item "$src\ic_launcher.png"        "$dst\ic_launcher.png"       -Force
Copy-Item "$src\ic_maxx_player.png"     "$dst\ic_maxx_player.png"    -Force
Copy-Item "$src\logo_move.png"          "$dst\logo_move.png"         -Force
Copy-Item "$src\maxx_logo_high.jpg"     "$dst\maxx_logo_high.jpg"    -Force

# Copiar banners
Copy-Item "$src\banner_apptv.png"       "$dst\banner_apptv.png"      -Force
Copy-Item "$src\banner_new.jpg"         "$dst\banner_new.jpg"        -Force
Copy-Item "$src\banner_mplay.png"       "$dst\banner_mplay.png"      -Force
Copy-Item "$src\banner_cru.png"         "$dst\banner_cru.png"        -Force
Copy-Item "$src\banner_glo.png"         "$dst\banner_glo.png"        -Force
Copy-Item "$src\banner_disney.png"      "$dst\banner_disney.png"     -Force
Copy-Item "$src\banner_star.png"        "$dst\banner_star.png"       -Force
Copy-Item "$src\banner_ntx.png"         "$dst\banner_ntx.png"        -Force
Copy-Item "$src\banner_pt.png"          "$dst\banner_pt.png"         -Force
Copy-Item "$src\maxx_banner_high.jpg"   "$dst\maxx_banner_high.jpg"  -Force

Write-Host "✅ $(Get-ChildItem $dst | Measure-Object | Select-Object -ExpandProperty Count) arquivos copiados para $dst"
