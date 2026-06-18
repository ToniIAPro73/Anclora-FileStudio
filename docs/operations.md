# Operations

Operational checks:

- `GET /api/v1/health` confirms process liveness.
- `GET /api/v1/ready` checks configured dependencies.
- `GET /api/v1/metrics` exposes Prometheus metrics.
- Worker emits heartbeat logs and handles `SIGTERM`.
- Backup and restore scripts parse required `.env` keys instead of sourcing secrets as shell.

Docker is only for Service/VPS/CI. Desktop and Local Agent remain Docker-free.

## Desktop PRO

Desktop PRO runs locally and should bind to loopback only. Use diagnostics to
verify native tools before large jobs. Portables must not package `.env.local`,
`.git` or secrets.

Production deployment and GitHub Release creation require explicit approval.
