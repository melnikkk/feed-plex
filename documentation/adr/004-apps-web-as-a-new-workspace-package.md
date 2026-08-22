# ADR 004: apps/web as a new client-only SPA workspace package

## Context

ADR 001 reserved an `apps/web` slot in the target monorepo layout but never made it real — it
listed a stack (TanStack Start, React, TanStack Router, TanStack Query, TanStack AI, TanStack
Form) as a placeholder alongside the modular-monolith decision, not something evaluated on its
own merits. The project is now moving from worker/API-only to actually needing a UI, so
`apps/web` needs to become a real, buildable package with a real rendering strategy rather than a
line in a tree diagram.

FeedPlex's web app is almost entirely personalized, authenticated content (a feed reader). The
classic SSR wins — SEO, fast first paint of shared/public content — don't apply to that surface.
The one place they would matter is a public-facing landing/marketing page: a shared hosted
deployment needs an unauthenticated entry point where new visitors can learn about the product
and sign up.

A full SSR framework (TanStack Start/Next.js) would also add a third Node server process to
operate, and — if used carelessly — tempts `apps/web`'s server-side loaders into calling
`@feed-plex/database` directly. That would break the `apps/api`/`apps/worker` boundary ADR 003's
BullMQ split already established: data access has to stay funneled through `apps/api`, whether
the caller is a browser or a server-rendered loader.

## Decision

Add `apps/web` as a new pnpm workspace package, `@feed-plex/web`, joining `apps/api` and
`apps/worker` as the third independently runnable app under `apps/*`. It follows the same
per-app conventions already established by `apps/api`/`apps/worker`:

- Its own `src/env.ts`, validated at startup via `@t3-oss/env-core`, rather than reading
  `process.env` directly.
- `@/*` → `./src/*` TS path alias.
- Imports shared types (`Article`, `Interest`, `Source`, `Feed`, `RankedArticle`, etc.) from
  `@feed-plex/contracts` rather than redefining them locally.

Its rendering strategy is a client-only SPA: Vite + TanStack Router + TanStack Query, shipped as
static assets, calling `apps/api` exclusively over REST.

SSR is not ruled out permanently — TanStack Router's API is close enough to TanStack Start's
that upgrading later isn't a rewrite — but it's deferred until there's a concrete need (e.g. an
auth-flash on protected routes, or a public landing page that needs to be crawlable/fast for new
visitors before they sign up). If that need materializes, any SSR server functions/loaders must
call `apps/api` over HTTP (BFF pattern), never `@feed-plex/database` directly, to preserve the
existing boundary.

This decision supersedes the placeholder stack ADR 001 listed for `apps/web` (TanStack Start,
TanStack AI, TanStack Form were never evaluated against real requirements).
