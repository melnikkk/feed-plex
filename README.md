# FeedPlex

A self-hosted feed reader that ranks and summarizes technical articles against your own interests, so you stop scrolling past 40 blog posts to find the 3 worth reading.

Point it at your blogs, RSS/Atom feeds, sitemaps, or archive pages. It fetches new articles, extracts the actual content, scores relevance against a personal interest profile, and hands you a readable summary of what matched — and why. No account, no subscription, no third party reading your feed list: it runs on your own infrastructure, for one reader.

- **Self-hosted, single-user.** Not a SaaS — your sources and interest profile stay on your own infra, no multi-tenant account system.
- **Any source, not just clean RSS.** Ingests RSS/Atom feeds, sitemaps, and archive/index pages, so sites without a proper feed are still trackable.
- **Explainable ranking.** Each summary is paired with why it matched your interests, not just a relevance score.
- **Modular-monolith architecture.** TypeScript monorepo with independently runnable web (TanStack Start/React), API (Fastify), and worker (Mastra workflows) apps — see [ADR 001](documentation/adr/001-monorepo-and-modular-monolith-foundation.md) for the full rationale.

## Status

FeedPlex is a personal research project, currently pre-implementation — only the architecture decision record exists so far (no runnable app yet).

**Current focus:** ingesting a set of provided feeds, matching new articles against a set of provided interests, and producing a readable, per-article summary of what's relevant and why.

**Planned next:** on-demand research requests — asking FeedPlex to dig into a topic beyond the standing feed subscriptions, using the same ranking/summarization pipeline.

## Getting started

Setup instructions will land here once the `apps/web`, `apps/api`, and `apps/worker` packages described in [ADR 001](documentation/adr/001-monorepo-and-modular-monolith-foundation.md) are scaffolded.
