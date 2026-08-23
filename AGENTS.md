# AGENTS.md

FeedPlex is a self-hosted, single-user feed reader: it ingests RSS/Atom feeds, sitemaps, and
archive pages, then ranks articles against a personal interest profile with an explainable,
non-LLM scoring formula. TypeScript modular-monolith monorepo (Turborepo + pnpm workspaces,
**pnpm@11.5.1**, Node 20+) — see `documentation/adr/` for load-bearing architectural rationale.

## Commands

- Install: `pnpm install`. Services: `docker compose up -d redis postgres` (required for `api`/`worker`).
- Root-only (Turborepo/whole-repo): `pnpm lint[:fix]`, `pnpm format[:check]`, `pnpm build`,
  `pnpm test[:coverage]`.
- Dev servers, per-package typecheck/test: no root scripts — `pnpm --filter <name> <script>`, e.g.
  `pnpm --filter @feed-plex/api dev`. See each package's nested `AGENTS.md` for exact commands/env.

## Architecture

| Directory            | Responsibility                                                                    |
| -------------------- | --------------------------------------------------------------------------------- |
| `apps/api`           | Fastify REST boundary; enqueues BullMQ jobs, never runs workflow logic in-process |
| `apps/worker`        | Mastra-workflow background processing: feed polling, extraction, scoring          |
| `apps/web`           | Client-only SPA (Vite/React/TanStack), calls `apps/api` over REST only            |
| `packages/contracts` | Shared types + the BullMQ job/queue contract between `api` and `worker`           |
| `packages/database`  | Drizzle/Postgres persistence layer; `feeds` is the owning entity                  |
| `documentation/adr`  | Architectural decision records — read before changing app boundaries              |

`api` and `worker` talk only through BullMQ/Redis, never an in-process import (ADR 003).

## Code style

- **oxlint**/**oxfmt**, not ESLint/Prettier (`.oxlintrc.json`/`.oxfmtrc.json`). No `any` (error),
  `import type` for type-only imports, camelCase filenames, single quotes, trailing commas,
  100-char width.
- Prefer each app's `@/*` → `./src/*` alias over deep relative imports (`packages/*` have no
  alias — use relative `../` there).
- New feature code: a directory with `index.ts` plus focused files (`constants.ts`, `schema.ts`,
  `types.ts`, `utils.ts`), not one large file.

## Testing

Vitest, per-package config (no shared root config), `restoreMocks: true` everywhere — run via
`pnpm --filter <name> test`. Tests live in `__tests__/` beside the code they cover, not colocated
as siblings.

## Boundaries

- Never hand-edit `apps/web/src/app/routeTree.gen.ts` or `packages/database/migrations/*.sql` —
  both are generated (TanStack Router plugin; `drizzle-kit generate`, respectively).
- Never commit `.env` files (only `.env.example`), and never read `process.env` directly outside
  each app's `src/env.ts` — add new vars there. `coverage/`, `.turbo` are build artifacts.

## Git / PR conventions

- Branches: `<category>-<kebab-case-slug>` — categories `feature`, `tech`, `fix`.
- Commits: `[category]: <imperative summary>`, one branch = one logical change = one commit.
- PRs: always against `master`, title identical to the commit message, empty body, squash-merged.

## Further reading

- Nested `AGENTS.md` in each `apps/*` and `packages/*` for package-specific commands and quirks.
- `documentation/adr/` for the "why" behind the monorepo shape, Mastra-over-agent choice, BullMQ
  boundary, and `apps/web`'s package shape.
