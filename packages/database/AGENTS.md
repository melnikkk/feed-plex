# packages/database

Postgres persistence via Drizzle ORM. `feeds` is the owning entity (ADR 004): `sources` and
`interests` each carry a `feedId` FK with a composite unique constraint (`feedId` + `url`/`topic`),
and `suggestion_runs` carries a required `feedId` FK — every run is attributed to a feed.
`articles` stays a global, feed-unscoped content cache keyed by `link`.
`feeds.refresh_interval_hours` (null = off) and `feeds.next_refresh_at` hold the auto-refresh
schedule (ADR 005): `claimDueFeeds` claims due feeds atomically, and `saveSuggestionRun` advances
`next_refresh_at` after every completed run. `feedsRepository` covers feed CRUD;
`suggestionRunsRepository` covers upserting/querying suggestion runs and their ranked articles.

## Commands

- Generate migrations from schema changes: `pnpm --filter @feed-plex/database db:generate`
- Apply pending migrations: `pnpm --filter @feed-plex/database db:migrate`
- Typecheck: `pnpm --filter @feed-plex/database typecheck`
- Test / coverage: `pnpm --filter @feed-plex/database test`, `... test:coverage`

## Boundary

Never hand-write files under `migrations/` — they're `drizzle-kit` output from `db:generate`.
Change `src/schema/` and regenerate instead.

## Testing quirk

Repository functions are DB-bound and untested for now — only pure mapping logic (`toFeed.ts`)
has coverage. The repositories themselves would need integration tests against a real Postgres,
not unit tests.
