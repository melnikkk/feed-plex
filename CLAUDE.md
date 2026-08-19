# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

FeedPlex is a self-hosted, single-user feed reader: it ingests RSS/Atom feeds, sitemaps, and
archive pages, scores articles against a personal interest profile, and surfaces an explainable
ranking (no LLM makes the relevance call — it's a weighted formula over semantic similarity,
keyword overlap, freshness, and source affinity). See `documentation/adr/` for the architectural
reasoning; each ADR there is load-bearing context, not historical record.

## Commands

Package manager is **pnpm** (`pnpm@11.5.1`, enforced via `packageManager`). Node 20+.

```bash
pnpm install                        # install all workspace packages

pnpm lint                           # oxlint . (root)
pnpm lint:fix                       # oxlint . --fix
pnpm format                         # oxfmt --write .
pnpm format:check                   # oxfmt --check .

pnpm --filter @feed-plex/worker typecheck   # tsc --noEmit, per-package (no root typecheck script)
pnpm --filter @feed-plex/api typecheck
pnpm --filter @feed-plex/contracts typecheck

pnpm --filter @feed-plex/worker start        # one-shot: run relevant-articles workflow against hardcoded feed/interests
pnpm --filter @feed-plex/worker dev          # tsx watch, BullMQ queue consumer (queueWorker.ts)
pnpm --filter @feed-plex/worker queue:worker # same consumer, no watch

pnpm --filter @feed-plex/api dev             # Fastify API with watch
pnpm --filter @feed-plex/api start

docker compose up -d redis          # Redis required for the API<->worker job queue
```

There is no test runner configured yet — don't assume one exists.

Each app needs its own `.env` (copy from `.env.example` in `apps/worker/` and `apps/api/`).
`apps/worker` requires `GOOGLE_GENERATIVE_AI_API_KEY` (Gemini, for embeddings) and `REDIS_URL`;
`apps/api` requires `REDIS_URL`, `PORT`, `HOST`. Env is validated at startup via `@t3-oss/env-core`
in each app's `src/env.ts` — add new vars there, not by reading `process.env` directly.

`pnpm prepare` installs lefthook; the pre-commit hook runs oxlint + oxfmt on staged files
(`stage_fixed: true` for format, so formatting fixes get re-staged automatically).

## Architecture

Modular-monolith monorepo (Turborepo + pnpm workspaces), not microservices — see ADR 001 for why.
Three independently runnable apps under `apps/*`, shared code under `packages/*`:

- **`apps/api`** — Fastify. Interactive serving boundary: REST endpoints, request validation,
  eventually auth/rate-limiting. Currently just a health check and the relevant-articles-runs
  route (`POST /api/workflows/relevant-articles/runs`, `GET .../runs/:jobId`). It enqueues jobs
  onto BullMQ — it never runs workflow logic in-process.
- **`apps/worker`** — background processing only, built on **Mastra workflows** (not agents — see
  ADR 002). Owns feed polling, parsing, extraction, embedding, and the scoring pipeline. Has two
  entrypoints: `run.ts` (one-shot script, hardcoded feed/interests, prints ranked results to
  stdout) and `queueWorker.ts` (long-running BullMQ `Worker` that consumes jobs enqueued by the
  API and invokes the same workflow).
- **`apps/web`** — does not exist yet. Planned: TanStack Start/React/Router/Query/Form.
- **`packages/contracts`** — the only shared package so far (`@feed-plex/contracts`). Holds Zod
  schemas and types shared across `api`/`worker`: `Article`, `ArticleScore`, `RankedArticle`,
  `Interest`, `Source`, and the `RelevantArticlesJobData`/`RelevantArticlesJobResult` job
  contract plus the `RELEVANT_ARTICLES_QUEUE_NAME` BullMQ queue name constant both apps import
  from. Other packages listed in ADR 001's target layout (`domain`, `application`, `database`,
  `providers`, `ranking`, `evaluation`, `observability`, `ui`) don't exist yet — don't assume
  their presence.

**API ↔ worker boundary is BullMQ/Redis, not an in-process import** (ADR 003, deliberate: keeps
the request/response path free of background-job concerns). `apps/api`'s queue producer and
`apps/worker`'s queue consumer both import queue name and job data/result types from
`@feed-plex/contracts` — keep that the single source of truth rather than re-duplicating shapes.
Job results live only in Redis via BullMQ's TTL-based retention; there's no Postgres yet (ADR 001
names Postgres as the eventual source of truth, but it isn't wired up).

**Relevant-articles workflow** (`apps/worker/src/mastra/workflow/index.ts`): a fixed two-step
Mastra pipeline — `fetchFeedArticlesStep` then `scoreArticlesStep` — with typed schemas at each
boundary (`apps/worker/src/mastra/shared/schemas/`). Scoring
(`scoreArticlesStep/{similarity,lexical,freshness,weightedProfile}.ts`) combines embedding
similarity, keyword overlap, freshness decay, and source affinity into one weighted
`ArticleScore`; the only model calls are deterministic embedding lookups, never an LLM judgment
call. Default feed sources and the interest profile are hardcoded in
`apps/worker/src/constants/interests.ts` and used as fallbacks when a queue job doesn't supply
its own `sources`/`interests`.

## Conventions

- Import shared types from `@feed-plex/contracts`, not by redefining shapes locally.
- Each app uses the `@/*` → `./src/*` TS path alias (see each app's `tsconfig.json`); prefer it
  over deep relative imports (`import/no-relative-parent-imports` is a lint warning).
- Linting/formatting via **oxlint**/**oxfmt**, not ESLint/Prettier — config in `.oxlintrc.json` /
  `.oxfmtrc.json`. Notable enforced rules: no `any` (error), prefer `import type` for type-only
  imports, filenames camelCase, single quotes, trailing commas, 100-char print width.
- New code should follow the existing step/route folder shape: a feature directory with
  `index.ts` plus focused files (`constants.ts`, `schema.ts`, `types.ts`, `utils.ts`) rather than
  one large file.
