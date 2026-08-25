import type { Feed } from '@feed-plex/contracts';

export type FeedSortOption = 'recentlyUpdated' | 'recentlyAdded' | 'name';

const comparators: Record<FeedSortOption, (a: Feed, b: Feed) => number> = {
  recentlyUpdated: (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
  recentlyAdded: (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  name: (a, b) => a.name.localeCompare(b.name),
};

export const isFeedSortOption = (value: unknown): value is FeedSortOption =>
  typeof value === 'string' && Object.hasOwn(comparators, value);

export const sortFeeds = (feeds: Array<Feed>, option: FeedSortOption): Array<Feed> =>
  feeds.toSorted(comparators[option]);
