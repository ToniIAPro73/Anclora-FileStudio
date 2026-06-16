# Portables — Final Report

Date: 2026-06-16
Branch: `build/anclora-filestudio-portables`

## Summary

| Item | Status |
|------|--------|
| Build orchestrator (`build-portables.sh`) | Done |
| Linux build script (complete rewrite) | Done |
| Linux artifact (tar.zst + sha256) | Done (51MB) |
| Linux structural verification (53 checks) | PASS |
| Linux Sharp libvips fix | PASS |
| Linux runtime smoke (9/9) | PASS |
| Windows build script (complete rewrite) | Done |
| Windows artifact (zip + sha256) | Done (250MB) |
| Windows structural smoke (20/20) | PASS |
| Windows runtime smoke | Pending (requires Windows) |
| Docs (7 markdown files) | Done |

## Linux artifact

```
dist/linux/Anclora-FileStudio-Linux-x64.tar.zst  (45 MB)
dist/linux/Anclora-FileStudio-Linux-x64.tar.zst.sha256
SHA-256: 1812ef9616d321fb4cfa6c47e0b48e305af8b7ed6133f64ec669d7bf583f5fc8
```

Bundled Node.js v22.22.1 (ELF x86-64, ABI 127) — no system Node required.

Runtime smoke results:

```
[PASS] Launcher: bundled node v22.22.1 starts server in background
[PASS] Health: node=v22.22.1, tools=10/10 available
[PASS] Frontend HTTP 200
[PASS] History endpoint: SQLite working
[PASS] Analyze JSON: kind=universal-file
[PASS] Analyze PNG: kind=universal-file
[PASS] PID file exists
[PASS] Stop script: clean shutdown
[PASS] Restart + persistence
```

## Windows artifact

```
dist/windows/Anclora-FileStudio-Windows-x64-Core.zip  (250 MB)
dist/windows/Anclora-FileStudio-Windows-x64-Core.zip.sha256
SHA-256: e7151cc5f3ad5090b7ca9df6ca22bcc682c1202ff6e7734d23f1a4c0de19155a
```

Bundled Node.js v24.16.0 (ABI 137, win-x64) — no system Node required.

Structural smoke: 20/20 PASS. Runtime smoke: pending (requires Windows).

## Security constraints met

- App listens only on 127.0.0.1 (verified in all launchers)
- No 0.0.0.0 binding
- No .env.local, .pem, .key files in package
- No .git directory in package
- No developer paths in launcher scripts
- No Linux .dll/.so files in Windows package; no Windows .dll in Linux package
- better_sqlite3.node: ELF x86-64 (Linux), Windows PE MZ (Windows)
- No Git operations in any build script
- All versions, URLs, and SHA-256 hashes from `scripts/toolchain.lock.json`
- No dynamic version resolution (no API calls, no `latest` URLs without hash)

## Key technical decisions

### Toolchain lock
All binary versions, download URLs, and SHA-256 hashes are stored in `scripts/toolchain.lock.json`.
Every download is verified against the lockfile hash before staging. If the hash doesn't match, the build fails.

### Whitelist copy instead of standalone mirror
Next.js `output: "standalone"` mirrors the full `outputFileTracingRoot` (repo root) into `.next/standalone`.
Using `cp -r "$STANDALONE/." "$app/"` copies everything including developer artifacts.
Fixed by explicitly copying only what the runtime needs: `server.js`, `.next/`, `node_modules/`, `public/`.

### Turbopack `.next/node_modules/` stubs
Turbopack places external module stubs in `.next/node_modules/` (e.g. `better-sqlite3-<hash>`, `sharp-<hash>`).
These are distinct from the top-level `standalone/node_modules/` and MUST NOT be excluded from the copy.
The previous filter `! -name "node_modules"` when copying `.next/` accidentally excluded these stubs,
causing `better-sqlite3` and `sharp` to fail at runtime with "Cannot find module 'better-sqlite3-<hash>'".

### BUILD_ID requirement
Next.js standalone server crashes with "Could not find a production build" if `BUILD_ID` is missing.
Fixed by using `find "$STANDALONE/.next" -mindepth 1 -maxdepth 1 ! -name "cache"` instead of an
explicit file list — this ensures `BUILD_ID` and all other `.next/` contents are always included.

### Native module ABI compatibility
- Linux: Node.js v22.22.1 (ABI 127) — bundled `better_sqlite3.node` is the Linux ELF version from pnpm
- Windows: Node.js v24.16.0 (ABI 137) — `better-sqlite3-v12.10.1-node-v137-win32-x64.tar.gz` prebuilt from GitHub

### Next.js build artifact paths
`server.js` and `required-server-files.json` inevitably contain `outputFileTracingRoot: "/home/toni/..."`.
These are excluded from developer-path grep scans via `--exclude` flags.

### FFmpeg rolling build
BtbN FFmpeg builds are rolling — the "latest" URL resolves to a new binary periodically.
The SHA-256 in `toolchain.lock.json` is the hash recorded at lock time (2026-06-16).
When the SHA changes, the cached file must be deleted and the lockfile updated.

## Pending work

- Windows runtime smoke test (requires Windows — PowerShell/cmd.exe)
- Update `docs/implementation/anclora-filestudio-portables/test-matrix.md` after Windows runtime test
