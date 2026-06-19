# Anclora FileStudio Infrastructure v1 Spec

## Status

Implemented.

## Goal

Align FileStudio with the shared Anclora workspace infrastructure for agents,
SDD, GitHub promotion, VS Code settings, Codex, Claude, and Vercel hygiene.

## Scope

- Add `.agent` governance and repo-local skill.
- Add `.agents` tracked entrypoint.
- Add `.codex` MCP configuration.
- Add `.claude` settings for allowed local commands and memory sync.
- Add `.vscode` settings and MCP file.
- Add `sdd/` core documentation baseline.
- Add GitHub promotion workflows for `development -> staging -> production ->
  main`.
- Keep `.vercel/` local and ignored.

## Acceptance Criteria

- The repo has tracked infrastructure entrypoints equivalent to the Anclora
  workspace standard.
- The permanent branch workflow is documented in `AGENTS.md`.
- GitHub Actions can validate permanent branches and agent feature branches.
- Generated Vercel output, preview env files, and local project links remain
  untracked.

