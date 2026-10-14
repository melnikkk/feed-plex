import { and, asc, inArray, isNotNull, lte, sql } from 'drizzle-orm';
import type { DbClient } from '../../client';
import { feeds } from '../../schema';
import { jitteredRefreshInterval } from '../refreshSchedule';

/**
 * Advancing `next_refresh_at` in the same statement that selects due feeds makes the claim
 * atomic, so overlapping sweeps can't enqueue the same feed twice, and a feed that missed several
 * intervals while the app was stopped is refreshed once rather than once per missed interval.
 * `SKIP LOCKED` lets concurrent sweeps claim disjoint batches instead of blocking on each other.
 */
export const claimDueFeeds = async (db: DbClient, limit: number): Promise<Array<string>> => {
  const dueFeeds = db
    .select({ id: feeds.id })
    .from(feeds)
    .where(and(isNotNull(feeds.refreshIntervalHours), lte(feeds.nextRefreshAt, sql`now()`)))
    .orderBy(asc(feeds.nextRefreshAt))
    .limit(limit)
    .for('update', { skipLocked: true });

  const claimed = await db
    .update(feeds)
    .set({ nextRefreshAt: sql`now() + ${jitteredRefreshInterval(feeds.refreshIntervalHours)}` })
    .where(inArray(feeds.id, dueFeeds))
    .returning({ id: feeds.id });

  return claimed.map(({ id }) => id);
};
