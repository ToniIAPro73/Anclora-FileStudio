# Test Plan

## Static Checks

- `git status --short --untracked-files=all --ignored=matching`
- `git ls-files .agent .agents .github .vscode .claude .codex sdd`

## Workflow Checks

- Confirm workflow YAML parses by listing `.github/workflows/*.yml`.
- Confirm CI uses `pnpm install --frozen-lockfile`, `pnpm lint`,
  `pnpm typecheck`, `pnpm test`, and `pnpm build`.
- Confirm promotion workflows use the permanent branch order:
  `development -> staging -> production -> main`.

## Git Checks

- Push `development`, `staging`, `production`, and `main`.
- Leave the local repository on `development`.

