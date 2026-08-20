import type { DbClient } from '@feed-plex/database';
import { closeDbClient, createDbClient } from '@feed-plex/database';
import fp from 'fastify-plugin';
import { env } from '@/env';

declare module 'fastify' {
  interface FastifyInstance {
    db: DbClient | undefined;
  }
}

export const dbPlugin = fp(async (app) => {
  const db = env.DATABASE_URL ? createDbClient(env.DATABASE_URL) : undefined;

  app.decorate('db', db);

  if (db) {
    app.addHook('onClose', async () => {
      await closeDbClient(db);
    });
  }
});
