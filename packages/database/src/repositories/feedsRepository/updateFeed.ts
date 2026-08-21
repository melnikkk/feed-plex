import type { Feed, Interest, Source, UpdateFeedInput } from '@feed-plex/contracts';
import { and, eq, notInArray, sql } from 'drizzle-orm';
import type { DbClient } from '../../client';
import { feeds, interests, sources } from '../../schema';
import { toFeed } from './toFeed';

type DbTransaction = Parameters<Parameters<DbClient['transaction']>[0]>[0];

const syncSources = async (
  tx: DbTransaction,
  feedId: string,
  inputSources: Array<Source>,
): Promise<Array<typeof sources.$inferSelect>> => {
  if (inputSources.length === 0) {
    await tx.delete(sources).where(eq(sources.feedId, feedId));

    return [];
  }

  const upserted = await tx
    .insert(sources)
    .values(
      inputSources.map((source) => ({
        feedId,
        url: source.url,
        sourceAffinity: source.sourceAffinity,
      })),
    )
    .onConflictDoUpdate({
      target: [sources.feedId, sources.url],
      set: { sourceAffinity: sql`excluded.source_affinity` },
    })
    .returning();

  await tx.delete(sources).where(
    and(
      eq(sources.feedId, feedId),
      notInArray(
        sources.url,
        inputSources.map((source) => source.url),
      ),
    ),
  );

  return upserted;
};

const syncInterests = async (
  tx: DbTransaction,
  feedId: string,
  inputInterests: Array<Interest>,
): Promise<Array<typeof interests.$inferSelect>> => {
  if (inputInterests.length === 0) {
    await tx.delete(interests).where(eq(interests.feedId, feedId));

    return [];
  }

  const upserted = await tx
    .insert(interests)
    .values(
      inputInterests.map((interest) => ({
        feedId,
        topic: interest.topic,
        weight: interest.weight,
        keywords: interest.keywords,
        embedding: interest.embedding,
      })),
    )
    .onConflictDoUpdate({
      target: [interests.feedId, interests.topic],
      set: {
        weight: sql`excluded.weight`,
        keywords: sql`excluded.keywords`,
        embedding: sql`excluded.embedding`,
      },
    })
    .returning();

  await tx.delete(interests).where(
    and(
      eq(interests.feedId, feedId),
      notInArray(
        interests.topic,
        inputInterests.map((interest) => interest.topic),
      ),
    ),
  );

  return upserted;
};

export const updateFeed = async (
  db: DbClient,
  feedId: string,
  input: UpdateFeedInput,
): Promise<Feed | null> => {
  return db.transaction(async (tx) => {
    const [feed] = await tx
      .update(feeds)
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
      })
      .where(eq(feeds.id, feedId))
      .returning();

    if (!feed) {
      return null;
    }

    const [feedSources, feedInterests] = await Promise.all([
      input.sources
        ? syncSources(tx, feedId, input.sources)
        : tx.query.sources.findMany({ where: eq(sources.feedId, feedId) }),
      input.interests
        ? syncInterests(tx, feedId, input.interests)
        : tx.query.interests.findMany({ where: eq(interests.feedId, feedId) }),
    ]);

    return toFeed({ ...feed, sources: feedSources, interests: feedInterests });
  });
};
