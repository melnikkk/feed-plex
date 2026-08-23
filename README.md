# FeedPlex

A self-hosted feed reader that ranks and summarizes technical articles against your own interests, so you stop scrolling past 40 blog posts to find the 3 worth reading.

Point it at your blogs, RSS/Atom feeds, sitemaps, or archive pages. It fetches new articles, extracts the actual content, scores relevance against a personal interest profile, and hands you a readable summary of what matched — and why. No account, no subscription, no third party reading your feed list: it runs on your own infrastructure, for one reader.

- **Self-hosted, single-user.** Not a SaaS — your sources and interest profile stay on your own infra, no multi-tenant account system.
- **Any source, not just clean RSS.** Ingests RSS/Atom feeds, sitemaps, and archive/index pages, so sites without a proper feed are still trackable.
- **Explainable ranking.** Each summary is paired with why it matched your interests, not just a relevance score.
- **Queued, not request-blocking.** A Fastify API enqueues ranking runs onto a BullMQ/Redis job queue; a separate worker processes them and persists results to Postgres, so a slow run never ties up a request.
- **Modular-monolith architecture.** TypeScript monorepo with independently runnable web (Vite/React/TanStack Router SPA), API (Fastify), and worker (Mastra workflows) apps — see [ADR 001](documentation/adr/001-monorepo-and-modular-monolith-foundation.md) for the monorepo rationale and [ADR 004](documentation/adr/004-apps-web-as-a-new-workspace-package.md) for `apps/web`'s package shape.

## Status

FeedPlex is a personal research project.

**Running today:** feeds are persisted entities (`apps/api`, backed by Postgres via `packages/database`) — each feed owns its own sources and interest profile. Creating a run against a feed enqueues a Mastra workflow (`apps/worker`) that fetches the feed's sources and ranks every article with a transparent, content-based score — no LLM judgment call decides relevance, each score is a weighted sum of embedding-based semantic similarity, keyword overlap, freshness, and source affinity. You can run the workflow two ways:

- **One-shot script**, hardcoded feed/interests, results printed to stdout — see [Run the relevant-articles workflow](#run-the-relevant-articles-workflow).
- **Queued via the API** (`apps/api`) — `POST /api/feeds/:feedId/runs` enqueues a run on BullMQ/Redis for that feed's sources/interests and returns a `jobId`; `GET /api/feeds/:feedId/runs/:jobId` polls status/result. A long-running worker process (`queueWorker.ts`) consumes the queue and resolves `feedId` to its persisted sources/interests. Completed runs are persisted to Postgres, and the `GET` route falls back to Postgres once a job has expired from Redis — see [ADR 003](documentation/adr/003-bullmq-redis-for-relevant-articles-job-queue.md).

`apps/web` exists as a scaffolded SPA shell (shadcn UI, theme toggle, TanStack Router/Query wired up) that currently only shows API health status — it doesn't yet have a feed-management UI.

**Planned next:** a feed-management UI in `apps/web`, and on-demand research requests — asking FeedPlex to dig into a topic beyond the standing feed subscriptions, using the same ranking pipeline.

## Getting started

Requires Node 20+ and [pnpm](https://pnpm.io) 11+.

```bash
git clone https://github.com/melnikkk/feed-plex.git
cd feed-plex
pnpm install
docker compose up -d redis postgres
```

This installs the workspace root and every package under `apps/*` and `packages/*`: `apps/worker`
(the Mastra-based background worker), `apps/api` (the Fastify job-queue API), `apps/web` (the
Vite/React SPA), `packages/contracts` (shared types), and `packages/database` (Drizzle/Postgres
persistence). Redis is required for the job queue; Postgres is required by `apps/api` since every
route besides the health check is feed-backed.

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
pnpm --filter @feed-plex/database db:migrate   # apps/api requires DATABASE_URL
pnpm --filter @feed-plex/worker queue:worker    # start the queue consumer
pnpm --filter @feed-plex/api dev                # start the API, in another shell

curl -X POST http://localhost:3000/api/feeds \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Evil Martians",
    "sources": [{ "url": "https://evilmartians.com/atom.xml", "sourceAffinity": 1 }],
    "interests": [{ "topic": "typescript", "weight": 1, "keywords": ["typescript", "types"] }]
  }'
#=> {"id":"<feedId>","name":"Evil Martians",...}

curl -X POST http://localhost:3000/api/feeds/<feedId>/runs
#=> {"jobId":"1"}
curl http://localhost:3000/api/feeds/<feedId>/runs/1
#=> {"jobId":"1","status":"completed","result":[...]}
```
