@echo off
chcp 65001 >nul 2>&1
setlocal EnableDelayedExpansion

:: ============================================================================
:: INICIAR_LINK2MEDIA.bat
:: Lanzador principal de Link2Media para Windows.
:: Haz doble clic para iniciar la aplicacion.
:: ============================================================================

title Link2Media — Iniciando...

:: ── Cambiar al directorio donde está el .bat ─────────────────────────────────
cd /d "%~dp0"
set "BASE_DIR=%~dp0"
:: Eliminar la barra final si existe
if "%BASE_DIR:~-1%"=="\" set "BASE_DIR=%BASE_DIR:~0,-1%"

echo.
echo  ╔══════════════════════════════════════╗
echo  ║          Link2Media  v0.1.0          ║
echo  ╚══════════════════════════════════════╝
echo.

:: ── Verificar que se ha extraído el ZIP ──────────────────────────────────────
if not exist "%BASE_DIR%\runtime\node.exe" (
    echo  [ERROR] No se puede iniciar Link2Media porque faltan archivos.
    echo.
    echo  Extrae primero todo el contenido del ZIP en una carpeta
    echo  local y vuelve a ejecutar INICIAR_LINK2MEDIA.bat
    echo.
    pause
    exit /b 1
)

if not exist "%BASE_DIR%\app\server.js" (
    echo  [ERROR] No se encuentra app\server.js
    echo.
    echo  Extrae primero todo el contenido del ZIP en una carpeta
    echo  local y vuelve a ejecutar INICIAR_LINK2MEDIA.bat
    echo.
    pause
    exit /b 1
)

if not exist "%BASE_DIR%\tools\yt-dlp.exe" (
    echo  [ERROR] No se encuentra tools\yt-dlp.exe
    echo.
    echo  Extrae primero todo el contenido del ZIP en una carpeta
    echo  local y vuelve a ejecutar INICIAR_LINK2MEDIA.bat
    echo.
    pause
    exit /b 1
)

if not exist "%BASE_DIR%\tools\ffmpeg\bin\ffmpeg.exe" (
    echo  [ERROR] No se encuentra tools\ffmpeg\bin\ffmpeg.exe
    echo.
    echo  Extrae primero todo el contenido del ZIP en una carpeta
    echo  local y vuelve a ejecutar INICIAR_LINK2MEDIA.bat
    echo.
    pause
    exit /b 1
)

:: ── Delegar en PowerShell para la lógica compleja ────────────────────────────
set "PS_SCRIPT=%BASE_DIR%\internal\start-link2media.ps1"

if not exist "%PS_SCRIPT%" (
    echo  [ERROR] No se encuentra el script interno: internal\start-link2media.ps1
    echo.
    echo  El paquete puede estar incompleto. Vuelve a descargar y extraer el ZIP.
    echo.
    pause
    exit /b 1
)

powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass ^
    -File "%PS_SCRIPT%" -BaseDir "%BASE_DIR%"

if errorlevel 1 (
    echo.
    echo  La aplicacion no pudo iniciarse.
    echo  Consulta logs\error.log para mas detalles.
    echo.
    pause
    exit /b 1
)

endlocal
