import type { Feed } from '@feed-plex/contracts';

export const isFeedNew = (feed: Pick<Feed, 'updatedAt' | 'lastViewedAt'>): boolean => {
  if (!feed.lastViewedAt) {
    return true;
  }

  return new Date(feed.updatedAt) > new Date(feed.lastViewedAt);
};
