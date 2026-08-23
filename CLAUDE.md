@AGENTS.md

<!-- Claude Code-specific additions only. Do not repeat anything from
AGENTS.md above — it is imported automatically. -->

## Claude Code specifics

- Nested `AGENTS.md` files exist under `apps/*` and `packages/*` (nearest-file-wins) — Claude Code
  resolves those automatically without a matching nested `CLAUDE.md`.
- `.claude/skills/` available: `feature-sliced-design` (apps/web layer/slice placement),
  `mastra` (worker workflow/agent API lookup and CLI usage), `good-readme`, `show-me`,
  `ai-tools-adoption` (this doc-generation skill itself). `show-me` is force-enabled via
  `.claude/settings.json`'s `skillOverrides`.
- `pnpm prepare` installs **lefthook**, not a Claude Code hook — its pre-commit runs oxlint +
  oxfmt on staged files (`stage_fixed: true`, so format fixes get re-staged automatically). It
  will fire on any commit Claude Code creates in this repo.
- No `.claude/agents/` subagents are defined for this repo yet.
