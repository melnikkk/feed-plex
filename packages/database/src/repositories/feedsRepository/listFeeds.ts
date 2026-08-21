import type { Feed } from '@feed-plex/contracts';
import type { DbClient } from '../../client';
import { toFeed } from './toFeed';

export const listFeeds = async (db: DbClient): Promise<Array<Feed>> => {
  const allFeeds = await db.query.feeds.findMany({
    with: { sources: true, interests: true },
  });

  return allFeeds.map(toFeed);
};
