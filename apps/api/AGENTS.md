# apps/api

Fastify interactive serving boundary — REST validation, eventually auth/rate-limiting. Enqueues
BullMQ jobs; never runs workflow logic in-process (that's `apps/worker`'s job).

## Commands

- Dev (watch): `pnpm --filter @feed-plex/api dev`
- Start: `pnpm --filter @feed-plex/api start`
- Typecheck: `pnpm --filter @feed-plex/api typecheck`
- Test / coverage: `pnpm --filter @feed-plex/api test`, `... test:coverage`

## Env

Copy `.env.example` to `.env`. `REDIS_URL`, `PORT`, `HOST`, `DATABASE_URL` are all required (not
optional) — every route besides the health check is feed-backed, so `app.db` is always present
with no runtime null-checks needed. Validated at startup via `@t3-oss/env-core` in `src/env.ts`.
With `docker compose up -d redis postgres`, the default `DATABASE_URL` is
`postgresql://feedplex:feedplex@localhost:5432/feedplex`.

## Routes

Mounted under `/api/feeds`: feed CRUD (`POST /`, `GET /`, `GET /:feedId`, `PUT /:feedId`,
`DELETE /:feedId`) plus feed-scoped runs nested under it (`POST /:feedId/runs`,
`GET /:feedId/runs/:jobId`). The `GET .../runs/:jobId` route falls back to Postgres once a job
has expired from Redis.

## Testing quirk

`test.env` in `vitest.config.ts` stubs `DATABASE_URL`/`REDIS_URL` with well-formed-but-fake
values so `env.ts` parses without a live Postgres/Redis — `postgres-js`/`ioredis` connect lazily,
so `buildApp()` can be exercised via Fastify's `app.inject()` (see `src/__tests__/app.test.ts`)
for routes that don't actually touch the DB.
