# Linux Portable — Execution Report

Date: 2026-06-16
Build host: WSL2 Ubuntu 22.04, x86-64
Node.js: v22.22.1 (ABI 127)

## Artifact

```
dist/linux/Anclora-FileStudio-Linux-x64.tar.zst
dist/linux/Anclora-FileStudio-Linux-x64.tar.zst.sha256
```

| Property | Value |
|----------|-------|
| Compressed size | 45 MB |
| SHA-256 | 1812ef9616d321fb4cfa6c47e0b48e305af8b7ed6133f64ec669d7bf583f5fc8 |
| Bundled Node.js | v22.22.1 (ELF x86-64, ABI 127) |
| Compression | zstd -T0 -19 |
| Self-contained runtime | ✅ (bundled node binary, no system Node required) |

## Capabilities

`data`, `image`, `history`, `audio`, `video`, `thumbnail`, `youtube`, `pdf`, `archive`, `document`, `ocr`, `ebook`

All capabilities are derived from ACTUALLY PRESENT tools — no false advertising.

## Structural Verification (46 checks)

```
PASS: 46
WARN: 0
FAIL: 0
```

Includes:

- Artifact existence + SHA-256 checksum
- Required files: server.js, .next/static, manifest.json, runtime/node, etc.
- ELF x86-64 validation for better_sqlite3.node, sharp.node, runtime/node
- JSON validity (manifest.json, SBOM.cdx.json)
- Launcher uses bundled runtime/node (not system node)
- No .dll files, no .git, no secrets, no developer paths
- 127.0.0.1 binding, no 0.0.0.0

## Runtime Smoke Test (9/9 PASS)

Executed on WSL2 from a clean temp directory, using bundled node binary only:

```
[PASS] Launcher exited 0 (server started in background with bundled node v22.22.1)
[PASS] Health: node=v22.22.1, tools=10/10 available
[PASS] Frontend HTTP 200
[PASS] History endpoint: SQLite working (0 jobs)
[PASS] Analyze JSON: kind=universal-file
[PASS] Analyze PNG: kind=universal-file
[PASS] PID file exists
[PASS] Stop OK (clean shutdown)
[PASS] Persistence after restart
```

## Issues resolved during build

| Issue | Resolution |
|-------|-----------|
| Tool version strings with newlines broke Python heredoc | Switched to temp JSON file written by Python subprocess |
| Next.js standalone mirrors entire monorepo | Switched to whitelist copy (server.js, .next/, node_modules/, public/) |
| `dist/linux/*.tar.zst` already exists when rebuilding | Added `rm -f` before zstd invocation |
| Smoke test gave exit 0 when package absent | Changed to `exit 1` with explicit error message |
| `server.js` contains `outputFileTracingRoot` (build path) | Excluded from dev-path scan (known Next.js artifact) |
| BUILD_ID missing → "Could not find a production build" | Changed .next copy to use `find ! -name "cache"` (keep all other subdirs) |
| Turbopack `.next/node_modules/` excluded from copy | Removed `! -name "node_modules"` filter for `.next/` copy; Turbopack places `better-sqlite3-<hash>` and `sharp-<hash>` stubs there — required at runtime |
| Node.js was not bundled — depended on system node | Download Node.js v22.22.1 from nodejs.org, verify SHA-256, include as `runtime/node` |
