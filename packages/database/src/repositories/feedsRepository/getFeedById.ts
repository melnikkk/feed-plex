import type { Feed } from '@feed-plex/contracts';
import { eq } from 'drizzle-orm';
import type { DbClient } from '../../client';
import { feeds } from '../../schema';
import { toFeed } from './toFeed';

export const getFeedById = async (db: DbClient, feedId: string): Promise<Feed | null> => {
  const feed = await db.query.feeds.findFirst({
    where: eq(feeds.id, feedId),
    with: { sources: true, interests: true },
  });

  if (!feed) {
    return null;
  }

  return toFeed(feed);
};
