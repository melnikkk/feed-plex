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
pnpm --filter @feed-plex/web typecheck
pnpm --filter @feed-plex/contracts typecheck
pnpm --filter @feed-plex/database typecheck

pnpm --filter @feed-plex/worker test         # vitest run, per-package (no root test script)
pnpm --filter @feed-plex/api test
pnpm --filter @feed-plex/web test
pnpm --filter @feed-plex/contracts test
pnpm --filter @feed-plex/database test
# each also has a test:coverage variant

pnpm --filter @feed-plex/worker start        # one-shot: run relevant-articles workflow against hardcoded feed/interests
pnpm --filter @feed-plex/worker dev          # tsx watch, BullMQ queue consumer (queueWorker.ts)
pnpm --filter @feed-plex/worker queue:worker # same consumer, no watch

pnpm --filter @feed-plex/api dev             # Fastify API with watch
pnpm --filter @feed-plex/api start

pnpm --filter @feed-plex/web dev             # Vite dev server (SPA)
pnpm --filter @feed-plex/web build           # production static build
pnpm --filter @feed-plex/web start           # vite preview, serves the production build

pnpm --filter @feed-plex/database db:generate  # generate Drizzle migrations from schema
pnpm --filter @feed-plex/database db:migrate   # run pending migrations

docker compose up -d redis postgres        # Redis and Postgres required
docker compose down                         # shut down services
```

Every app and package has its own `vitest.config.ts` (Vitest, latest v4) — no shared root config,
matching the per-package `typecheck` convention above. `apps/api`/`apps/worker`/`apps/web` configs
additionally set `resolve.tsconfigPaths: true` (Vite's native tsconfig-paths resolution, no plugin
needed) so the `@/*` alias works in tests (`packages/*` don't use that alias, so their configs omit
it), and stub `DATABASE_URL`/`REDIS_URL`/`GOOGLE_GENERATIVE_AI_API_KEY`/`VITE_API_URL` via `test.env`
with well-formed-but-fake values so `env.ts` parses without a real Postgres/Redis/Gemini key/live API
— `postgres-js`/`ioredis` clients connect lazily, so `apps/api`'s `buildApp()` can be exercised via
Fastify's documented `app.inject()` pattern (see `apps/api/src/__tests__/app.test.ts`) without a live
DB for routes that don't touch it. `apps/web` runs its component/hook tests under `jsdom` (the other
apps use the `node` environment) with `@testing-library/react`/`jest-dom`, loaded via
`test.setupFiles`. All configs set `restoreMocks: true` for test isolation. Tests live in a
`__tests__/` folder at the same directory level as the file they cover (e.g. `feeds/route.ts` →
`feeds/__tests__/route.test.ts`), not colocated as siblings — apps import the file under test via the
`@/*` alias from inside `__tests__/` (satisfies `import/no-relative-parent-imports`); `packages/*`
use a relative `../` import since they have no path alias and the lint rule is already off for
`packages/*/src/**`.
`packages/database`'s repository functions are DB-bound and untested for now — only pure mapping
logic (`toFeed.ts`) has coverage; the repositories themselves would need integration tests against a
real Postgres, not unit tests.

Each app needs its own `.env` (copy from `.env.example` in `apps/worker/`, `apps/api/`, `apps/web/`).
`apps/worker` requires `GOOGLE_GENERATIVE_AI_API_KEY` (Gemini, for embeddings) and `REDIS_URL`;
`apps/api` requires `REDIS_URL`, `PORT`, `HOST`, and `DATABASE_URL` — with `docker-compose`, the
default Postgres credentials are `postgresql://feedplex:feedplex@localhost:5432/feedplex`. `apps/web`
requires only `VITE_API_URL` (e.g. `http://localhost:3000/api`) — as a browser SPA it never touches
Redis/Postgres directly (ADR 004), and Vite only exposes env vars prefixed `VITE_` to client code.
`apps/api`'s `DATABASE_URL` is required (not optional) because every real route besides the health
check is feed-backed (ADR 004); `app.db` is always present, no runtime null-checks needed.
`apps/worker`'s `DATABASE_URL` stays optional in `env.ts` — `run.ts` deliberately shares that
module while staying DB-free, so the queue processor asserts `db` presence itself
(`relevantArticlesProcessor.ts`) rather than the env schema enforcing it repo-wide. Env is
validated at startup via `@t3-oss/env-core` in each app's `src/env.ts` — add new vars there, not
by reading `process.env` directly.

`pnpm prepare` installs lefthook; the pre-commit hook runs oxlint + oxfmt on staged files
(`stage_fixed: true` for format, so formatting fixes get re-staged automatically).

## Architecture

Modular-monolith monorepo (Turborepo + pnpm workspaces), not microservices — see ADR 001 for why.
Three independently runnable apps under `apps/*`, shared code under `packages/*`:

- **`apps/api`** — Fastify. Interactive serving boundary: REST endpoints, request validation,
  eventually auth/rate-limiting. Routes are mounted under `/api/feeds`: feed CRUD
  (`POST /`, `GET /`, `GET /:feedId`, `PUT /:feedId`, `DELETE /:feedId`) plus feed-scoped runs
  nested under it (`POST /:feedId/runs`, `GET /:feedId/runs/:jobId`). It enqueues jobs onto
  BullMQ — it never runs workflow logic in-process.
- **`apps/worker`** — background processing only, built on **Mastra workflows** (not agents — see
  ADR 002). Owns feed polling, parsing, extraction, embedding, and the scoring pipeline. Has two
  entrypoints: `run.ts` (one-shot script, hardcoded feed/interests, prints ranked results to
  stdout, no DB) and `queueWorker.ts` (long-running BullMQ `Worker` that consumes jobs enqueued by
  the API, resolves the job's `feedId` to its persisted sources/interests via
  `@feed-plex/database`, and invokes the workflow).
- **`apps/web`** — client-only SPA (ADR 004, superseding ADR 001's unevaluated placeholder stack):
  Vite + React + TanStack Router (file-based routes under `src/routes/`, tree generated to
  `src/routeTree.gen.ts` by the `@tanstack/router-plugin` Vite plugin on `dev`/`build` — committed
  to git per TanStack's guidance, since it's runtime source, not a build artifact; the plugin's
  `.tanstack/` tmp/atomic-write staging dir is gitignored) + TanStack Query. Ships as static assets
  and calls `apps/api` exclusively over REST via `src/lib/apiClient.ts` — it never imports
  `@feed-plex/database` or talks to Redis/Postgres directly. SSR is deferred, not ruled out; if
  added later, loaders must still call `apps/api` over HTTP rather than the database package.
- **`packages/contracts`** — shared types across `api`/`worker`: `Article`, `ArticleScore`,
  `RankedArticle`, `Interest`, `Source`, `Feed`/`CreateFeedInput`/`UpdateFeedInput`, and the
  `RelevantArticlesJobData` (`{ feedId: string }`)/`RelevantArticlesJobResult` job contract plus
  the `RELEVANT_ARTICLES_QUEUE_NAME` BullMQ queue name constant. Other packages listed in ADR 001's
  target layout (`domain`, `application`, `providers`, `ranking`, `evaluation`, `observability`,
  `ui`) don't exist yet — don't assume their presence.
- **`packages/database`** — Postgres persistence layer using Drizzle ORM. `feeds` is the owning
  entity (ADR 004): `sources` and `interests` each carry a `feedId` FK with a composite unique
  constraint (`feedId` + `url`/`topic`), and `suggestion_runs` carries a required `feedId` FK —
  every run is attributed to a feed. `articles` stays a global, feed-unscoped content cache keyed
  by `link`. `feedsRepository` covers feed CRUD; `suggestionRunsRepository` covers
  upserting/querying suggestion runs and their ranked articles.

**API ↔ worker boundary is BullMQ/Redis, not an in-process import** (ADR 003, deliberate: keeps
the request/response path free of background-job concerns). `apps/api`'s queue producer and
`apps/worker`'s queue consumer both import queue name and job data/result types from
`@feed-plex/contracts` — keep that the single source of truth. Queue-triggered workflow runs are
persisted to Postgres after success via the database package. The API's `GET /:feedId/runs/:jobId`
falls back to the database if the job has expired from Redis.

**Relevant-articles workflow** (`apps/worker/src/mastra/workflow/index.ts`): a fixed two-step
Mastra pipeline — `fetchFeedArticlesStep` then `scoreArticlesStep` — with typed schemas at each
boundary (`apps/worker/src/mastra/shared/schemas/`). Scoring
(`scoreArticlesStep/{similarity,lexical,freshness,weightedProfile}.ts`) combines embedding
similarity, keyword overlap, freshness decay, and source affinity into one weighted
`ArticleScore`; the only model calls are deterministic embedding lookups, never an LLM judgment
call. The workflow itself is feed-agnostic — it just takes flat `sources`/`interests` per run;
feed resolution happens one layer up, in `apps/worker/src/queue/relevantArticlesProcessor.ts`.
`apps/worker/src/constants/{config,interests}.ts` are hardcoded sources/interests used only by the
DB-free `run.ts` script, not by the queue-driven, feed-scoped path.

## Conventions

- Import shared types from `@feed-plex/contracts`, not by redefining shapes locally.
- Each app uses the `@/*` → `./src/*` TS path alias (see each app's `tsconfig.json`); prefer it
  over deep relative imports (`import/no-relative-parent-imports` is a lint warning).
- Linting/formatting via **oxlint**/**oxfmt**, not ESLint/Prettier — config in `.oxlintrc.json` /
  `.oxfmtrc.json`. Notable enforced rules: no `any` (error), prefer `import type` for type-only
  imports, filenames camelCase, single quotes, trailing commas, 100-char print width. The `react`
  plugin is enabled repo-wide for `apps/web` (`react/rules-of-hooks` error,
  `react/only-export-components` warn); `react/react-in-jsx-scope` is off since the app uses the
  automatic JSX runtime. `apps/web/src/routes/**` is exempted from `unicorn/filename-case` and
  `react/only-export-components` — TanStack Router's file-based routing mandates names
  (`__root.tsx`, `$param` segments) and a per-route `Route` export that don't fit those rules.
- New code should follow the existing step/route folder shape: a feature directory with
  `index.ts` plus focused files (`constants.ts`, `schema.ts`, `types.ts`, `utils.ts`) rather than
  one large file.

## Git

- **Branch naming**: `<category>-<kebab-case-slug>`, e.g. `feature-persisted-feeds`,
  `tech-vitest-testing-setup`. Categories: `feature` (user-facing capability), `tech` (tooling,
  scaffolding, docs, refactors), `fix` (defect resolution).
- **Commits**: `[category]: <imperative, present-tense summary>` — same category vocabulary as
  branch names (e.g. `[tech]: add oxc lint/format tooling and lefthook pre-commit hook`,
  `[feature]: add feeds as owning entity for sources, interests, and runs`). One branch is
  typically one logical change and lands as one commit.
- **PRs**: one PR per branch, always against `master`, title identical to the commit message
  (including the `[category]:` prefix) — `gh pr list` titles and `git log` subjects match 1:1.
  PR bodies are left empty; the title is the only description. PRs are squash-merged, which is why
  `master`'s history is fully linear with no merge commits.
