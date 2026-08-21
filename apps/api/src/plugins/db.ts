import type { DbClient } from '@feed-plex/database';
import { closeDbClient, createDbClient } from '@feed-plex/database';
import fp from 'fastify-plugin';
import { env } from '@/env';

declare module 'fastify' {
  interface FastifyInstance {
    db: DbClient;
  }
}

export const dbPlugin = fp(async (app) => {
  const db = createDbClient(env.DATABASE_URL);

  app.decorate('db', db);

  app.addHook('onClose', async () => {
    await closeDbClient(db);
  });
});
