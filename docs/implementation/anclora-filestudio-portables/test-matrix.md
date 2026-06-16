# Portables — Test Matrix

## Linux

| Test | Script | Status | Notes |
|------|--------|--------|-------|
| Structural verify (46 checks) | `verify-linux-portable.sh` | ✅ PASS | 46/46 |
| Smoke (no false positive) | `smoke-linux-portable.sh` | ✅ PASS | artifact-absent → exit 1 |
| Runtime smoke (9 checks) | manual / inline | ✅ PASS | server starts, SQLite, analyze, restart, stop |
| Health endpoint | runtime smoke | ✅ PASS | node=v22.22.1, tools=10/10 |
| SQLite persistence | runtime smoke | ✅ PASS | history endpoint responds, data survives restart |
| JSON analyze | runtime smoke | ✅ PASS | kind=universal-file |
| PNG analyze | runtime smoke | ✅ PASS | kind=universal-file |
| Clean stop | runtime smoke | ✅ PASS | stop script, no residual processes |
| Bundled Node | verify + runtime | ✅ PASS | ELF x86-64, v22.22.1, SHA-256 verified from nodejs.org |

## Windows

| Test | Script | Status | Notes |
|------|--------|--------|-------|
| Structural smoke | `smoke-windows-portable.sh` | NOT EXECUTED | Build script rewrite in progress |
| Runtime smoke | manual | NOT EXECUTED | Requires Windows |

## CI gate requirement

Before merging to `main`:

- [x] Linux structural verify passes (exit 0)
- [x] Linux smoke passes (exit 0)
- [x] Linux runtime smoke: server starts with bundled node, SQLite works, clean stop
- [ ] Windows structural smoke passes when artifact exists
- [x] Neither smoke gives false positive when artifact is absent (exit 1)

## Known non-issues

- `server.js` and `required-server-files.json` contain `outputFileTracingRoot: "/home/toni/projects/anclora-fileStudio"` — this is baked in by Next.js build; excluded from dev-path grep scans with `--exclude` flags.
- Health `ok: false` in clean-PATH environment: expected when yt-dlp/7z are not in PATH. The server is running; the status reflects tool availability, not server health.
- `.next/node_modules/` must NOT be excluded from copy — Turbopack places external module stubs (`better-sqlite3-<hash>`, `sharp-<hash>`) there; required at runtime.

## Smoke test false-positive fix

Both smoke scripts previously had `exit 0` when the package was not found. Fixed to `exit 1` with an explicit error message.
