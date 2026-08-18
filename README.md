# FeedPlex

A self-hosted feed reader that ranks and summarizes technical articles against your own interests, so you stop scrolling past 40 blog posts to find the 3 worth reading.

Point it at your blogs, RSS/Atom feeds, sitemaps, or archive pages. It fetches new articles, extracts the actual content, scores relevance against a personal interest profile, and hands you a readable summary of what matched — and why. No account, no subscription, no third party reading your feed list: it runs on your own infrastructure, for one reader.

- **Self-hosted, single-user.** Not a SaaS — your sources and interest profile stay on your own infra, no multi-tenant account system.
- **Any source, not just clean RSS.** Ingests RSS/Atom feeds, sitemaps, and archive/index pages, so sites without a proper feed are still trackable.
- **Explainable ranking.** Each summary is paired with why it matched your interests, not just a relevance score.
- **Modular-monolith architecture.** TypeScript monorepo with independently runnable web (TanStack Start/React), API (Fastify), and worker (Mastra workflows) apps — see [ADR 001](documentation/adr/001-monorepo-and-modular-monolith-foundation.md) for the full rationale.

## Status

FeedPlex is a personal research project. [ADR 001](documentation/adr/001-monorepo-and-modular-monolith-foundation.md) describes the target architecture; `apps/api` is a bare Fastify scaffold with a health endpoint only, and `apps/web` doesn't exist yet.

**Running today:** `apps/worker`'s first vertical slice — a Mastra workflow that fetches one hardcoded Atom feed and ranks every article against a weighted interest profile with a transparent, content-based score. No LLM judgment call decides relevance: each score is a weighted sum of embedding-based semantic similarity, keyword overlap, freshness, and source affinity, so you can see why an article ranked where it did. See [Getting started](#run-the-relevant-articles-workflow) to run it.

**Planned next:** on-demand research requests — asking FeedPlex to dig into a topic beyond the standing feed subscriptions, using the same ranking pipeline.

## Getting started

Requires Node 20+ and [pnpm](https://pnpm.io) 11+.

```bash
git clone https://github.com/melnikkk/feed-plex.git
cd feed-plex
pnpm install
```

This installs the workspace root and every package under `apps/*` — currently `apps/worker`, the Mastra-based background worker described in [ADR 001](documentation/adr/001-monorepo-and-modular-monolith-foundation.md), and `apps/api`, a bare Fastify scaffold (health endpoint only, no business logic yet). `apps/web` isn't scaffolded yet.

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

The feed source, interest profile, and scoring weights are all hardcoded for
now — see `apps/worker/src/constants/interests.ts` and
`apps/worker/src/mastra/workflow/steps/scoreArticlesStep/constants.ts`.
