@echo off
echo ========================================
echo   PUSH DO SISTEMA DE REVENDEDORES
echo ========================================
echo.

cd /d "R:\Users\Usuario\Documents\MaxxControl\maxxcontrol-x-sistema"

echo [1/4] Verificando status...
git status
echo.

echo [2/4] Adicionando arquivos...
git add .
echo.

echo [3/4] Criando commit...
git commit -m "Implementar sistema completo de revendedores e clientes IPTV"
echo.

echo [4/4] Enviando para GitHub...
git push origin main
echo.

echo ========================================
echo   PUSH CONCLUIDO!
echo ========================================
echo.
echo O Render vai detectar e fazer deploy automaticamente!
echo.
pause
