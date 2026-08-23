# apps/worker

Background processing only, built on **Mastra workflows** (deliberately not agents — see
ADR 002). Owns feed polling, parsing, extraction, embedding, and scoring.

## Commands

- One-shot script (hardcoded feed/interests, no DB, prints to stdout):
  `pnpm --filter @feed-plex/worker start`
- Queue consumer (watch): `pnpm --filter @feed-plex/worker dev`
- Queue consumer (no watch): `pnpm --filter @feed-plex/worker queue:worker`
- Typecheck: `pnpm --filter @feed-plex/worker typecheck`
- Test / coverage: `pnpm --filter @feed-plex/worker test`, `... test:coverage`

## Env

Copy `.env.example` to `.env`. `GOOGLE_GENERATIVE_AI_API_KEY` (Gemini, for embeddings) and
`REDIS_URL` are required. `DATABASE_URL` stays optional in `env.ts` — `run.ts` shares that module
while staying DB-free, so `relevantArticlesProcessor.ts` asserts `db` presence itself rather than
the env schema enforcing it repo-wide.

## Workflow

Fixed two-step Mastra pipeline (`src/mastra/workflow/index.ts`): `fetchFeedArticlesStep` then
`scoreArticlesStep`, typed schemas at each boundary (`src/mastra/shared/schemas/`). Scoring
(`scoreArticlesStep/{similarity,lexical,freshness,weightedProfile}.ts`) combines embedding
similarity, keyword overlap, freshness decay, and source affinity — the only model calls are
deterministic embedding lookups, never an LLM relevance judgment. The workflow is feed-agnostic
(flat `sources`/`interests` in, per run); feed resolution to a persisted feed happens one layer
up, in `src/queue/relevantArticlesProcessor.ts`.

## Boundary

`src/constants/{config,interests}.ts` are hardcoded sources/interests used only by the DB-free
`run.ts` script — never wire them into the queue-driven, feed-scoped path.
