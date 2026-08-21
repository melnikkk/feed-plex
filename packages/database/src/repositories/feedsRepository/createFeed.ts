import type { CreateFeedInput, Feed } from '@feed-plex/contracts';
import type { DbClient } from '../../client';
import { feeds, interests, sources } from '../../schema';
import { toFeed } from './toFeed';

export const createFeed = async (db: DbClient, input: CreateFeedInput): Promise<Feed> => {
  return db.transaction(async (tx) => {
    const [feed] = await tx
      .insert(feeds)
      .values({ name: input.name, description: input.description })
      .returning();

    if (!feed) {
      throw new Error('Failed to create feed');
    }

    const savedSources = await tx
      .insert(sources)
      .values(
        input.sources.map((source) => ({
          feedId: feed.id,
          url: source.url,
          sourceAffinity: source.sourceAffinity,
        })),
      )
      .returning();

    const savedInterests = await tx
      .insert(interests)
      .values(
        input.interests.map((interest) => ({
          feedId: feed.id,
          topic: interest.topic,
          weight: interest.weight,
          keywords: interest.keywords,
          embedding: interest.embedding,
        })),
      )
      .returning();

    return toFeed({ ...feed, sources: savedSources, interests: savedInterests });
  });
};
