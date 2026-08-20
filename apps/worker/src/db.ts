import type { DbClient } from '@feed-plex/database';
import { createDbClient } from '@feed-plex/database';
import { env } from '@/env';

export const db: DbClient | undefined = env.DATABASE_URL
  ? createDbClient(env.DATABASE_URL)
  : undefined;
