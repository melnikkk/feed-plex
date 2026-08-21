import { eq } from 'drizzle-orm';
import type { DbClient } from '../../client';
import { feeds } from '../../schema';

export const deleteFeed = async (db: DbClient, feedId: string): Promise<boolean> => {
  const [deleted] = await db.delete(feeds).where(eq(feeds.id, feedId)).returning({ id: feeds.id });

  return Boolean(deleted);
};
