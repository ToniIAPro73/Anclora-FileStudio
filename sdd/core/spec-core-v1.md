# Anclora FileStudio Core Spec v1

## Purpose

Establish the functional, architectural, and governance baseline for all
`Anclora FileStudio` work.

## Product Surfaces

- `web`: Vercel/browser-safe conversion experience.
- `desktop`: local Next.js runtime with native engine access.
- `portable`: packaged Windows/Linux distribution.
- `service-api`: managed API and worker packages.
- `local-agent`: privacy-preserving desktop bridge for Nexus.

## Architecture Principles

- Mode separation is explicit and enforced by configuration.
- Conversion capability is derived from the engine registry, not hardcoded UI
  assumptions.
- Every output is validated before a job is marked complete.
- External binaries are invoked without shells and with bounded inputs.
- Local file paths, download tokens, and temporary files are treated as sensitive.

## Core Modules

- `format-catalog`: allowed formats and category metadata.
- `engine-registry`: engine availability, routing, and diagnostics.
- `job-manager`: job lifecycle, progress, and history.
- `security`: path safety, filename sanitization, and token handling.
- `portable-build`: reproducible Windows/Linux packaging.
- `nexus-integration`: routing and local agent contracts.

## Security Rules

- Use `shell: false` for external process execution.
- Validate paths with resolved path and relative path checks.
- Store only token hashes when download tokens are needed.
- Keep `.env*`, `.vercel/`, SQLite files, and build outputs out of git.
- Do not expose server conversion APIs in Vercel web mode unless explicitly
  enabled by deployment configuration.

## Validation Rules

- Code changes run `pnpm lint` and `pnpm typecheck`.
- Shared behavior changes run the relevant `pnpm test:*` suite.
- Deployment changes run `pnpm build:vercel` or the relevant package build.
- Portable changes run platform smoke or verification scripts.
- User-visible text changes review Spanish and English copy.

## Documentation Rules

- New features live under `sdd/features/<feature-id>/`.
- Implementation reports under `docs/implementation/` should link back to SDD
  feature specs when the feature is formalized.
- Test matrices must name commands or manual validation steps.

