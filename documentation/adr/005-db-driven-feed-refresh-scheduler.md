# ADR 005: Postgres-driven scheduler for automatic feed refresh

## Context

Until now a feed was only re-ranked on demand — once on creation and whenever the user clicked
Refresh. Users should be able to pick a refresh interval per feed (off, 6h, 12h, daily, weekly)
and have runs happen on their own.

FeedPlex runs locally, so the worker is regularly stopped — the process is killed, the laptop
sleeps. Refreshes that came due during that downtime must still happen once the worker is back,
without one run per missed interval piling up.

BullMQ offers per-key job schedulers (`upsertJobScheduler`), so the obvious design is one
scheduler per feed. That splits the schedule across two stores: Postgres owns the feed, Redis
owns when it runs. Every feed create/update/delete in `apps/api` would need to keep the Redis
scheduler in sync, a Redis flush would silently stop every schedule, and catch-up after downtime
would depend on BullMQ's handling of overdue iterations rather than on a query we control.

## Decision

- **Postgres owns the schedule.** `feeds` gains `refresh_interval_hours` (nullable — null means
  off) and `next_refresh_at`. Creating a feed sets `next_refresh_at = now() + interval`; changing
  the interval recomputes it from the last completed run; every successful run (manual or
  scheduled) pushes it to `now() + interval`, so a manual refresh defers the next automatic one.
- **A single global BullMQ job scheduler drives the sweep.** `apps/worker` upserts one
  `feed-refresh-sweep` scheduler (every 5 minutes) and also enqueues one sweep at startup. BullMQ
  guarantees one sweep per tick across worker replicas.
- **The sweep claims atomically.** `claimDueFeeds` is a single
  `UPDATE … SET next_refresh_at = now() + interval WHERE next_refresh_at <= now() RETURNING id`,
  so overlapping sweeps can't enqueue a feed twice, and a feed overdue by several intervals gets
  exactly one run. Claimed feeds are enqueued on the existing `relevant-articles-workflow` queue
  with retry/backoff, and processed exactly like manual runs.
- **`apps/worker` becomes a second producer** on the relevant-articles queue. This amends ADR
  003's api-produces/worker-consumes split; the two apps still share only the queue contract in
  `packages/contracts` (job name, retention), never an in-process import.

## Consequences

- Catch-up after downtime is one explicit, testable query instead of implicit queue behaviour.
- Because the claim advances `next_refresh_at` before the run executes, a run that fails every
  retry waits a full interval before the next attempt rather than retrying every sweep.
- Load stays bounded as the feed count grows: claims run in batches of 500 with
  `FOR UPDATE SKIP LOCKED` (concurrent sweeps take disjoint batches), every `next_refresh_at` is
  jittered up to 5% past its interval so feeds created together don't come due together, and the
  relevant-articles worker has a configurable concurrency plus a global BullMQ `limiter`
  (`WORKER_RUNS_PER_MINUTE`) so a large backlog — e.g. after an outage — drains at a rate the
  embedding quota and source hosts can absorb.
- Not addressed yet: feeds sharing a source URL still fetch and embed it independently. Sharing
  that work across feeds is the main remaining cost lever at multi-user scale.
