# SDD Handbook

## What This Is

This directory contains the living product documentation for `Anclora FileStudio`
under the Anclora SDD framework.

## Structure

- `sdd/core/` contains stable product and architecture baseline documents.
- `sdd/features/` contains specs by initiative or version.
- Every feature should include a spec and a test plan.

## Workflow

1. Start from the current product behavior and implementation docs.
2. Consolidate product vision in `core/product-spec-v0.md`.
3. Keep common rules in `core/spec-core-v1.md`.
4. Define each feature with scope, requirements, acceptance criteria, and tests.
5. Validate changes against the feature test plan before PR.

## Rules

- Product mode separation is mandatory: web, desktop portable, service API, and
  local agent are different surfaces.
- The core spec overrides individual feature specs when there is a conflict.
- Feature specs must not contradict the security and privacy model.
- Every new requirement needs test traceability.

## Naming

- Product: `Anclora FileStudio`
- Feature example: `anclora-filestudio-web-phase1`
- Spec file: `<feature-id>-spec-v1.md`
- Test file: `test-plan.md`

