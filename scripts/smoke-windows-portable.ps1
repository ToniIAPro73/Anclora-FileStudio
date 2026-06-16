# smoke-windows-portable.ps1
# Native acceptance test for Anclora FileStudio Windows x64 portable.
# Validates runtime, better-sqlite3, Sharp 0.35.1, libvips 8.18.3, PNG->WebP.
# Usage: powershell.exe -ExecutionPolicy Bypass -File smoke-windows-portable.ps1 -ZipPath <path>
param(
    [Parameter(Mandatory = $true)]
    [string]$ZipPath,
    [string]$TempBase = $env:TEMP
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$Id       = [System.DateTime]::UtcNow.ToString("yyyyMMddHHmmss")
$SmokeDir = Join-Path $TempBase ("Anclora-FileStudio-Windows-Smoke-" + $Id)
$ExitCode = 0

try {
    if (-not (Test-Path $ZipPath)) {
        throw ("ZIP not found: " + $ZipPath)
    }
    Write-Host ""
    Write-Host "=== Anclora FileStudio - Native Windows Acceptance Test ==="
    Write-Host ("ZIP  : " + $ZipPath)
    Write-Host ("TEMP : " + $SmokeDir)
    Write-Host ""

    # ── 1. Extract ────────────────────────────────────────────────────────────
    Write-Host "[INFO] Extracting ZIP to Windows TEMP..."
    New-Item -ItemType Directory -Force -Path $SmokeDir | Out-Null
    Expand-Archive -Path $ZipPath -DestinationPath $SmokeDir -Force

    $PkgDir  = Join-Path $SmokeDir "Anclora-FileStudio-Windows-x64-Core"
    $NodeExe = Join-Path $PkgDir "runtime\node.exe"
    $AppDir  = Join-Path $PkgDir "app"

    if (-not (Test-Path $PkgDir))  { throw ("Package root not found: " + $PkgDir)  }
    if (-not (Test-Path $NodeExe)) { throw ("node.exe not found: " + $NodeExe) }
    if (-not (Test-Path $AppDir))  { throw ("app dir not found: " + $AppDir) }
    Write-Host "[OK]  Extracted"

    # JS paths use forward slashes to avoid PS escape issues
    $AppDirFwd = $AppDir -replace "\\", "/"

    # ── Helper ────────────────────────────────────────────────────────────────
    function Run-NodeScript {
        param([string]$JsCode, [string]$Label)
        $f = Join-Path $SmokeDir "smoke_fragment.cjs"
        [System.IO.File]::WriteAllText($f, $JsCode, [System.Text.UTF8Encoding]::new($false))
        $o = & $NodeExe $f 2>&1
        $ec = $LASTEXITCODE
        Remove-Item -Path $f -Force -ErrorAction SilentlyContinue
        if ($ec -ne 0) {
            Write-Host ("[FAIL] " + $Label + " (exit " + $ec + ")")
            $o | ForEach-Object { Write-Host ("       " + $_) }
            throw ("FAIL: " + $Label)
        }
        return $o
    }

    # ── 2. Runtime ────────────────────────────────────────────────────────────
    Write-Host "[INFO] Checking Node.js runtime..."
    $js = "var p = process;" + [char]10
    $js += "process.stdout.write('platform=' + p.platform + '\n');" + [char]10
    $js += "process.stdout.write('arch=' + p.arch + '\n');" + [char]10
    $js += "process.stdout.write('node=' + p.version + '\n');" + [char]10
    $js += "process.stdout.write('abi=' + p.versions.modules + '\n');" + [char]10
    $js += "if (p.platform !== 'win32') throw new Error('Bad platform: ' + p.platform);" + [char]10
    $js += "if (p.arch !== 'x64') throw new Error('Bad arch: ' + p.arch);" + [char]10
    $js += "if (p.versions.modules !== '137') throw new Error('Bad ABI: ' + p.versions.modules);" + [char]10
    $js += "process.stdout.write('RUNTIME_OK\n');"

    $out = Run-NodeScript -JsCode $js -Label "Runtime"
    $out | ForEach-Object { Write-Host ("  " + $_) }
    $outStr = ($out -join [char]10)
    if ($outStr -notmatch "RUNTIME_OK") { throw "RUNTIME_OK missing" }
    Write-Host "[PASS] RUNTIME_OK"

    # ── 3. better-sqlite3 ─────────────────────────────────────────────────────
    Write-Host "[INFO] Checking better-sqlite3..."
    $DbPath = (Join-Path $SmokeDir "smoke.db") -replace "\\", "/"

    $js2 = "var path = require('path');" + [char]10
    $js2 += "var Database = require(path.join('" + $AppDirFwd + "', 'node_modules', 'better-sqlite3'));" + [char]10
    $js2 += "var db = new Database('" + $DbPath + "');" + [char]10
    $js2 += "db.exec('CREATE TABLE t (id INTEGER PRIMARY KEY, val TEXT)');" + [char]10
    $js2 += "db.prepare('INSERT INTO t (val) VALUES (?)').run('hello-windows');" + [char]10
    $js2 += "var row = db.prepare('SELECT val FROM t WHERE id=1').get();" + [char]10
    $js2 += "if (!row || row.val !== 'hello-windows') throw new Error('mismatch: ' + JSON.stringify(row));" + [char]10
    $js2 += "db.close();" + [char]10
    $js2 += "process.stdout.write('SQLITE_OK\n');"

    $out2 = Run-NodeScript -JsCode $js2 -Label "SQLite"
    $out2 | ForEach-Object { Write-Host ("  " + $_) }
    $outStr2 = ($out2 -join [char]10)
    if ($outStr2 -notmatch "SQLITE_OK") { throw "SQLITE_OK missing" }
    Write-Host "[PASS] SQLITE_OK"

    # ── 4. Sharp + PNG->WebP ──────────────────────────────────────────────────
    Write-Host "[INFO] Checking Sharp 0.35.1 / libvips 8.18.3..."
    $WebpOutFwd = (Join-Path $SmokeDir "out.webp") -replace "\\", "/"
    $WebpOutReal = Join-Path $SmokeDir "out.webp"

    $js3 = "var path = require('path');" + [char]10
    $js3 += "var sharp = require(path.join('" + $AppDirFwd + "', 'node_modules', 'sharp'));" + [char]10
    $js3 += "var vs = sharp.versions;" + [char]10
    $js3 += "process.stdout.write('sharp=' + vs.sharp + '\n');" + [char]10
    $js3 += "process.stdout.write('vips=' + vs.vips + '\n');" + [char]10
    $js3 += "if (vs.sharp !== '0.35.1') throw new Error('Wrong sharp: ' + vs.sharp);" + [char]10
    $js3 += "if (vs.vips !== '8.18.3') throw new Error('Wrong vips: ' + vs.vips);" + [char]10
    $js3 += "process.stdout.write('SHARP_OK sharp=' + vs.sharp + ' vips=' + vs.vips + '\n');" + [char]10
    $js3 += "sharp({ create: { width: 4, height: 4, channels: 3, background: { r: 255, g: 0, b: 0 } } })" + [char]10
    $js3 += "  .webp({ quality: 80 })" + [char]10
    $js3 += "  .toFile('" + $WebpOutFwd + "')" + [char]10
    $js3 += "  .then(function(i) {" + [char]10
    $js3 += "    if (i.format !== 'webp') throw new Error('format: ' + i.format);" + [char]10
    $js3 += "    if (i.size === 0) throw new Error('empty output');" + [char]10
    $js3 += "    process.stdout.write('WEBP_OK size=' + i.size + '\n');" + [char]10
    $js3 += "    process.stdout.write('NATIVE_ACCEPTANCE_WINDOWS_PASS\n');" + [char]10
    $js3 += "  })" + [char]10
    $js3 += "  .catch(function(e) { process.stderr.write(e.message + '\n'); process.exit(1); });"

    $out3 = Run-NodeScript -JsCode $js3 -Label "Sharp PNG->WebP"
    $out3 | ForEach-Object { Write-Host ("  " + $_) }
    $outStr3 = ($out3 -join [char]10)
    if ($outStr3 -notmatch "SHARP_OK")   { throw "SHARP_OK missing" }
    if ($outStr3 -notmatch "WEBP_OK")    { throw "WEBP_OK missing" }
    if ($outStr3 -notmatch "NATIVE_ACCEPTANCE_WINDOWS_PASS") { throw "NATIVE_ACCEPTANCE_WINDOWS_PASS missing" }

    # Verify WebP magic bytes
    if (Test-Path $WebpOutReal) {
        $bytes = [System.IO.File]::ReadAllBytes($WebpOutReal)
        $riff  = [System.Text.Encoding]::ASCII.GetString($bytes, 0, 4)
        $webp  = [System.Text.Encoding]::ASCII.GetString($bytes, 8, 4)
        if ($riff -eq "RIFF" -and $webp -eq "WEBP") {
            Write-Host ("  Magic: RIFF=" + $riff + " WEBP=" + $webp + " size=" + $bytes.Length + " bytes")
            Write-Host "[PASS] WEBP_OK - magic bytes verified"
        } else {
            throw ("WebP magic bytes invalid: RIFF='" + $riff + "' WEBP='" + $webp + "'")
        }
    } else {
        throw ("WebP output not found: " + $WebpOutReal)
    }

    Write-Host ""
    Write-Host "[PASS] SHARP_OK sharp=0.35.1 vips=8.18.3"
    Write-Host ""
    Write-Host "=== NATIVE_ACCEPTANCE_WINDOWS_PASS ==="
    $ExitCode = 0
}
catch {
    Write-Error $_.Exception.Message
    Write-Host ""
    Write-Host "=== NATIVE_ACCEPTANCE_WINDOWS_FAIL ==="
    $ExitCode = 1
}
finally {
    if (Test-Path $SmokeDir) {
        Remove-Item -Recurse -Force $SmokeDir -ErrorAction SilentlyContinue
    }
}
exit $ExitCode
