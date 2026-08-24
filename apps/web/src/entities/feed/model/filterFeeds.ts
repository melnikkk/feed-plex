import type { Feed } from '@feed-plex/contracts';

const searchableValues = (feed: Feed): Array<string> => [
  feed.name,
  feed.description ?? '',
  ...feed.interests.map((interest) => interest.topic),
  ...feed.sources.map((source) => source.url),
];

export const filterFeeds = (feeds: Array<Feed>, query: string): Array<Feed> => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return feeds;
  }

  return feeds.filter((feed) =>
    searchableValues(feed).some((value) => value.toLowerCase().includes(normalizedQuery)),
  );
};
