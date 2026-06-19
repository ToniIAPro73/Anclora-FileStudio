# Spec Governance

## Purpose

This document defines how SDD specifications are created, reviewed, and evolved
for `Anclora FileStudio`.

## Principles

- SDD is the source of truth for product behavior, architecture, and validation.
- Browser, desktop portable, service API, and local agent surfaces must remain
  explicitly separated.
- File conversion behavior must be traceable from requirement to engine contract
  and test coverage.
- Security and privacy decisions must be documented before implementation.

## Documentation Conventions

- `sdd/README.md` describes the documentation system and workflow.
- `sdd/core/product-spec-v0.md` defines product vision and scope.
- `sdd/core/spec-core-v1.md` defines shared architecture and governance.
- Each feature lives in `sdd/features/<feature-id>/`.
- Each feature should include at minimum:
  - `<feature-id>-spec-v1.md`
  - `test-plan.md`

## Spec Lifecycle

1. `draft`
2. `review`
3. `approved`
4. `implemented`
5. `retired`

## Change Rules

- Scope changes require updating the affected spec and test plan.
- Architecture changes must be reflected in the core spec.
- Security, privacy, conversion fidelity, or engine behavior changes must include
  explicit acceptance criteria.
- Reversible decisions should be documented as assumptions, not closed facts.

## Required Traceability

- Every functional requirement has acceptance criteria.
- Every acceptance criterion maps to at least one test or manual validation.
- Every feature states dependencies and non-goals.
- Cross-references use stable feature IDs and relative links.

