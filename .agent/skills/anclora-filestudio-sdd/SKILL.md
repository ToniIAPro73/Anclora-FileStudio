# Anclora FileStudio SDD Skill

## Objective

Use this skill to plan, implement, and validate Anclora FileStudio work under the
workspace SDD standard.

## When To Use

- Adding or changing conversion capabilities.
- Touching browser, Desktop PRO, portable, service API, or local agent flows.
- Updating security, privacy, storage, or deployment behavior.
- Creating implementation docs, test matrices, or release gates.

## Domain Context

`Anclora FileStudio` is a file conversion product with multiple operating modes:

- Vercel web mode for browser-safe conversions.
- Desktop/portable mode for local conversions that need native tools.
- Service API and worker packages for managed conversion workloads.
- Local agent for privacy-preserving desktop integration.

## Recommended Flow

1. Read `sdd/core/product-spec-v0.md` and `sdd/core/spec-core-v1.md`.
2. Create or update a feature folder under `sdd/features/`.
3. Define requirements, non-goals, acceptance criteria, and test plan.
4. Implement in small tasks, keeping browser and desktop capabilities separated.
5. Run the relevant validation commands from the feature test plan.
6. Update docs when behavior, deployment, or user-visible copy changes.

## Required Checks

- `pnpm lint`
- `pnpm typecheck`
- Relevant `pnpm test:*` script for the touched area.
- `pnpm build` or `pnpm build:vercel` for deployment-facing changes.
- Portable smoke tests when touching Windows/Linux packaging.

