# ADR 003: BullMQ/Redis job queue for API-triggered workflow runs

## Context

`apps/worker` owns the `relevant-articles-workflow` Mastra workflow and, until
now, the only way to run it was a one-shot script (`apps/worker/src/run.ts`).
`apps/api` needs a way to trigger a run on demand over HTTP and let a caller
check on its progress and result.

ADR 001 keeps the interactive serving workload (`apps/api`) and the
asynchronous processing workload (`apps/worker`) as separate deployables
specifically so background work — retries, long-running execution, partial
failure — doesn't leak into the request/response path of the API. Having
`apps/api` import and run the workflow in-process would collapse that
separation for the sake of convenience, and there is no shared `packages/*`
layer yet to mediate it even if we wanted to.

## Decision

Use BullMQ, backed by Redis, as the queue between `apps/api` (producer) and
`apps/worker` (consumer):

- `apps/api` exposes `POST /api/workflows/relevant-articles/runs` to enqueue
  a job and `GET /api/workflows/relevant-articles/runs/:jobId` to poll its
  status and result, using a BullMQ `Queue`.
- `apps/worker` gains a new long-running entrypoint (`queueWorker.ts`,
  started via a `queue:worker` script) that runs a BullMQ `Worker` consuming
  that queue and invoking `relevantArticlesWorkflow` the same way `run.ts`
  already does, alongside the existing one-shot script.
- Job results live only in Redis, via BullMQ's own `removeOnComplete` /
  `removeOnFail` age-based retention (a one-hour TTL) — no Postgres
  persistence is introduced for this.
- The queue name and job data/result shapes are duplicated in both apps by
  convention rather than extracted into a shared `packages/*` contracts
  package, since no such package exists yet and this is the first thing that
  would need one. Revisit if a second producer/consumer pair appears.

Local dev gets a single `redis` service via a root `docker-compose.yml`;
Postgres is deliberately not introduced by this change.
