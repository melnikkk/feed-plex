# FeedPlex

A self-hosted feed reader that ranks and summarizes technical articles against your own interests, so you stop scrolling past 40 blog posts to find the 3 worth reading.

Point it at your blogs, RSS/Atom feeds, sitemaps, or archive pages. It fetches new articles, extracts the actual content, scores relevance against a personal interest profile, and hands you a readable summary of what matched — and why. No account, no subscription, no third party reading your feed list: it runs on your own infrastructure, for one reader.

- **Self-hosted, single-user.** Not a SaaS — your sources and interest profile stay on your own infra, no multi-tenant account system.
- **Any source, not just clean RSS.** Ingests RSS/Atom feeds, sitemaps, and archive/index pages, so sites without a proper feed are still trackable.
- **Explainable ranking.** Each summary is paired with why it matched your interests, not just a relevance score.
- **Queued, not request-blocking.** A Fastify API enqueues ranking runs onto a BullMQ/Redis job queue; a separate worker processes them and persists results to Postgres, so a slow run never ties up a request.
- **Modular-monolith architecture.** TypeScript monorepo with independently runnable web (TanStack Start/React), API (Fastify), and worker (Mastra workflows) apps — see [ADR 001](documentation/adr/001-monorepo-and-modular-monolith-foundation.md) for the full rationale.

## Status

FeedPlex is a personal research project. [ADR 001](documentation/adr/001-monorepo-and-modular-monolith-foundation.md) describes the target architecture; `apps/web` doesn't exist yet.

**Running today:** a Mastra workflow (`apps/worker`) that fetches one or more Atom feeds and ranks every article against a weighted interest profile with a transparent, content-based score — no LLM judgment call decides relevance, each score is a weighted sum of embedding-based semantic similarity, keyword overlap, freshness, and source affinity. You can run it two ways:

- **One-shot script**, hardcoded feed/interests, results printed to stdout — see [Run the relevant-articles workflow](#run-the-relevant-articles-workflow).
- **Queued via the API** (`apps/api`) — `POST /api/workflows/relevant-articles/runs` enqueues a run on BullMQ/Redis (optionally with custom sources/interests) and returns a `jobId`; `GET /api/workflows/relevant-articles/runs/:jobId` polls status/result. A long-running worker process (`queueWorker.ts`) consumes the queue. If `DATABASE_URL` is set, completed runs are persisted to Postgres and the `GET` route falls back to Postgres once a job has expired from Redis — see [ADR 003](documentation/adr/003-bullmq-redis-for-relevant-articles-job-queue.md).

**Planned next:** on-demand research requests — asking FeedPlex to dig into a topic beyond the standing feed subscriptions, using the same ranking pipeline.

## Getting started

Requires Node 20+ and [pnpm](https://pnpm.io) 11+.

```bash
git clone https://github.com/melnikkk/feed-plex.git
cd feed-plex
pnpm install
docker compose up -d redis postgres
```

This installs the workspace root and every package under `apps/*` and `packages/*` — currently
`apps/worker` (the Mastra-based background worker), `apps/api` (the Fastify job-queue API),
`packages/contracts` (shared types), and `packages/database` (Drizzle/Postgres persistence).
`apps/web` isn't scaffolded yet. Redis is required for the job queue; Postgres is optional but
needed for persisted run results.

### Run the relevant-articles workflow

```bash
cp apps/worker/.env.example apps/worker/.env
# set GOOGLE_GENERATIVE_AI_API_KEY in apps/worker/.env — https://aistudio.google.com/apikey
pnpm --filter @feed-plex/worker start
```

Each line of output is a ranked article with its score breakdown:

```
0.612  https://evilmartians.com/chronicles/some-article
  Some Article Title
  semantic=0.710 lexical=0.400 freshness=0.550 source=1.000
```

The default feed sources, interest profile, and scoring weights are hardcoded — see
`apps/worker/src/constants/interests.ts` and
`apps/worker/src/mastra/workflow/steps/scoreArticlesStep/constants.ts`.

### Run it through the API instead

```bash
cp apps/api/.env.example apps/api/.env
cp apps/worker/.env.example apps/worker/.env
# set GOOGLE_GENERATIVE_AI_API_KEY in apps/worker/.env — https://aistudio.google.com/apikey
pnpm --filter @feed-plex/database db:migrate   # only if DATABASE_URL is set
pnpm --filter @feed-plex/worker queue:worker    # start the queue consumer
pnpm --filter @feed-plex/api dev                # start the API, in another shell

curl -X POST http://localhost:3000/api/workflows/relevant-articles/runs
#=> {"jobId":"1"}
curl http://localhost:3000/api/workflows/relevant-articles/runs/1
#=> {"jobId":"1","status":"completed","result":[...]}
```
