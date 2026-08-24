import type { Feed } from '@feed-plex/contracts';
import { eq, sql } from 'drizzle-orm';
import type { DbClient } from '../../client';
import { feeds } from '../../schema';
import { getFeedById } from './getFeedById';

export const markFeedViewed = async (db: DbClient, feedId: string): Promise<Feed | null> => {
  const [updated] = await db
    .update(feeds)
    .set({ lastViewedAt: sql`now()` })
    .where(eq(feeds.id, feedId))
    .returning({ id: feeds.id });

  if (!updated) {
    return null;
  }

  return getFeedById(db, feedId);
};
