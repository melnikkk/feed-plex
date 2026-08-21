import type { Feed } from '@feed-plex/contracts';
import type { feeds, interests, sources } from '../../schema';

type FeedRow = typeof feeds.$inferSelect;
type SourceRow = typeof sources.$inferSelect;
type InterestRow = typeof interests.$inferSelect;

export type FeedWithRelations = FeedRow & {
  sources: Array<SourceRow>;
  interests: Array<InterestRow>;
};

export const toFeed = (feed: FeedWithRelations): Feed => ({
  id: feed.id,
  name: feed.name,
  description: feed.description ?? undefined,
  createdAt: feed.createdAt.toISOString(),
  sources: feed.sources.map((source) => ({
    url: source.url,
    sourceAffinity: source.sourceAffinity,
  })),
  interests: feed.interests.map((interest) => ({
    topic: interest.topic,
    weight: interest.weight,
    keywords: interest.keywords,
    embedding: interest.embedding ?? undefined,
  })),
});
