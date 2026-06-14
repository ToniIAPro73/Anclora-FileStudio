# =============================================================================
# start-link2media.ps1 — Lanzador interno de Link2Media (Windows)
# Invocado por INICIAR_LINK2MEDIA.bat
# NO ejecutar directamente; usar INICIAR_LINK2MEDIA.bat
# =============================================================================
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$BaseDir
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ── Rutas absolutas derivadas de BaseDir ────────────────────────────────────
$NodeExe      = Join-Path $BaseDir 'runtime\node.exe'
$ServerJs     = Join-Path $BaseDir 'app\server.js'
$YtdlpExe     = Join-Path $BaseDir 'tools\yt-dlp.exe'
$FfmpegExe    = Join-Path $BaseDir 'tools\ffmpeg\bin\ffmpeg.exe'
$FfprobeExe   = Join-Path $BaseDir 'tools\ffmpeg\bin\ffprobe.exe'
$TempDir      = Join-Path $BaseDir 'data\temp'
$LogDir       = Join-Path $BaseDir 'logs'
$PidFile      = Join-Path $BaseDir 'data\link2media.pid'
$PortFile     = Join-Path $BaseDir 'data\link2media.port'
$ServerLog    = Join-Path $LogDir  'server.log'
$ErrorLog     = Join-Path $LogDir  'error.log'

# ── Función: log de consola ──────────────────────────────────────────────────
function Write-Step([string]$msg) {
    Write-Host "  $msg" -ForegroundColor Cyan
}
function Write-Ok([string]$msg) {
    Write-Host "  [OK] $msg" -ForegroundColor Green
}
function Write-Err([string]$msg) {
    Write-Host ""
    Write-Host "  [ERROR] $msg" -ForegroundColor Red
}

Write-Host ""
Write-Host "  Link2Media — Iniciando..." -ForegroundColor White
Write-Host ""

# ── Verificar archivos obligatorios ─────────────────────────────────────────
Write-Step "Verificando archivos..."
$required = @($NodeExe, $ServerJs, $YtdlpExe, $FfmpegExe, $FfprobeExe)
foreach ($f in $required) {
    if (-not (Test-Path $f)) {
        Write-Err "No se encuentra un archivo necesario: $f"
        Write-Host ""
        Write-Host "  Extrae primero todo el contenido del ZIP en una carpeta" -ForegroundColor Yellow
        Write-Host "  local y vuelve a ejecutar INICIAR_LINK2MEDIA.bat" -ForegroundColor Yellow
        Write-Host ""
        Read-Host "  Pulsa Enter para cerrar"
        exit 1
    }
}
Write-Ok "Archivos verificados"

# ── Crear directorios ────────────────────────────────────────────────────────
if (-not (Test-Path $TempDir)) { New-Item -ItemType Directory -Path $TempDir -Force | Out-Null }
if (-not (Test-Path $LogDir))  { New-Item -ItemType Directory -Path $LogDir  -Force | Out-Null }

# ── Limpiar temporales caducados (>2 horas) ──────────────────────────────────
Write-Step "Limpiando archivos temporales caducados..."
try {
    $cutoff = (Get-Date).AddHours(-2)
    Get-ChildItem -Path $TempDir -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.LastWriteTime -lt $cutoff } |
        Remove-Item -Force -ErrorAction SilentlyContinue
} catch { <# no crítico #> }

# ── Comprobar instancia existente ────────────────────────────────────────────
Write-Step "Comprobando instancias previas..."
if (Test-Path $PidFile) {
    $existingPid = Get-Content $PidFile -Raw -ErrorAction SilentlyContinue
    $existingPid = $existingPid.Trim()
    if ($existingPid -match '^\d+$') {
        $proc = Get-Process -Id ([int]$existingPid) -ErrorAction SilentlyContinue
        if ($proc -ne $null -and $proc.Name -match 'node') {
            $existingPort = ''
            if (Test-Path $PortFile) {
                $existingPort = (Get-Content $PortFile -Raw -ErrorAction SilentlyContinue).Trim()
            }
            $url = if ($existingPort) { "http://127.0.0.1:$existingPort" } else { "http://127.0.0.1:3000" }
            Write-Host ""
            Write-Host "  La aplicacion ya esta en ejecucion (PID $existingPid)." -ForegroundColor Green
            Write-Host "  Abriendo navegador en $url ..." -ForegroundColor Cyan
            Start-Process $url
            exit 0
        } else {
            # PID obsoleto
            Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
            Remove-Item $PortFile -Force -ErrorAction SilentlyContinue
        }
    }
}

# ── Seleccionar puerto libre ──────────────────────────────────────────────────
Write-Step "Buscando puerto disponible..."
$selectedPort = $null
foreach ($p in @(3000,3001,3002,3003,3004,3005,3006,3007,3008,3009,3010)) {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    try {
        $tcpClient.Connect('127.0.0.1', $p)
        $tcpClient.Close()
        # Puerto ocupado, continuar
    } catch {
        $selectedPort = $p
        break
    } finally {
        if ($tcpClient.Connected) { $tcpClient.Close() }
    }
}

if ($null -eq $selectedPort) {
    Write-Err "No se ha encontrado un puerto libre (3000-3010)."
    Write-Host "  Cierra otras aplicaciones y vuelve a intentarlo." -ForegroundColor Yellow
    Read-Host "  Pulsa Enter para cerrar"
    exit 1
}
Write-Ok "Puerto seleccionado: $selectedPort"

# ── Variables de entorno para el servidor ────────────────────────────────────
$env:NODE_ENV                 = 'production'
$env:NEXT_TELEMETRY_DISABLED  = '1'
$env:HOSTNAME                 = '127.0.0.1'
$env:PORT                     = "$selectedPort"
$env:YTDLP_BINARY             = $YtdlpExe
$env:FFMPEG_BINARY            = $FfmpegExe
$env:FFPROBE_BINARY           = $FfprobeExe
$env:MEDIA_TEMP_DIR           = $TempDir
$env:MAX_CONCURRENT_JOBS      = '1'
$env:MAX_ACTIVE_JOBS_PER_CLIENT = '1'

# ── Lanzar servidor en segundo plano ─────────────────────────────────────────
Write-Step "Iniciando servidor (puerto $selectedPort)..."

$procArgs = @{
    FilePath               = $NodeExe
    ArgumentList           = @($ServerJs)
    WorkingDirectory       = (Join-Path $BaseDir 'app')
    RedirectStandardOutput = $ServerLog
    RedirectStandardError  = $ErrorLog
    WindowStyle            = 'Hidden'
    PassThru               = $true
}

try {
    $serverProc = Start-Process @procArgs
} catch {
    Write-Err "No se pudo iniciar el servidor: $_"
    Write-Host "  Consulta: $ErrorLog" -ForegroundColor Yellow
    Read-Host "  Pulsa Enter para cerrar"
    exit 1
}

# Guardar PID y puerto
$serverProc.Id | Out-File $PidFile -Encoding ascii -NoNewline
"$selectedPort"  | Out-File $PortFile -Encoding ascii -NoNewline

# ── Esperar hasta que /api/health responda ────────────────────────────────────
Write-Step "Esperando que el servidor arranque..."
$healthUrl = "http://127.0.0.1:$selectedPort/api/health"
$maxWaitSec = 60
$waited = 0
$ready = $false

while ($waited -lt $maxWaitSec) {
    Start-Sleep -Seconds 2
    $waited += 2

    # Comprobar que el proceso sigue vivo
    $aliveCheck = Get-Process -Id $serverProc.Id -ErrorAction SilentlyContinue
    if ($null -eq $aliveCheck) {
        Write-Err "El servidor se ha cerrado inesperadamente."
        Write-Host "  Consulta el log de error: $ErrorLog" -ForegroundColor Yellow
        if (Test-Path $ErrorLog) {
            Write-Host ""
            Write-Host "  --- Ultimas lineas del log ---" -ForegroundColor DarkGray
            Get-Content $ErrorLog -Tail 10 -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
        }
        Remove-Item $PidFile  -Force -ErrorAction SilentlyContinue
        Remove-Item $PortFile -Force -ErrorAction SilentlyContinue
        Read-Host "  Pulsa Enter para cerrar"
        exit 1
    }

    try {
        $resp = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        if ($resp.StatusCode -eq 200) {
            $ready = $true
            break
        }
    } catch { <# aun no listo #> }

    Write-Host "  Esperando... ($waited/$maxWaitSec s)" -ForegroundColor DarkGray
}

if (-not $ready) {
    Write-Err "El servidor no arranco en $maxWaitSec segundos."
    Write-Host "  Consulta el log de error: $ErrorLog" -ForegroundColor Yellow
    # Terminar el proceso huerfano
    Stop-Process -Id $serverProc.Id -Force -ErrorAction SilentlyContinue
    Remove-Item $PidFile  -Force -ErrorAction SilentlyContinue
    Remove-Item $PortFile -Force -ErrorAction SilentlyContinue
    Read-Host "  Pulsa Enter para cerrar"
    exit 1
}

Write-Ok "Servidor listo en http://127.0.0.1:$selectedPort"

# ── Abrir navegador ──────────────────────────────────────────────────────────
Write-Step "Abriendo navegador..."
Start-Process "http://127.0.0.1:$selectedPort"

Write-Host ""
Write-Host "  Link2Media esta ejecutandose en http://127.0.0.1:$selectedPort" -ForegroundColor Green
Write-Host "  Para cerrar la aplicacion: doble clic en CERRAR_LINK2MEDIA.bat" -ForegroundColor White
Write-Host ""
