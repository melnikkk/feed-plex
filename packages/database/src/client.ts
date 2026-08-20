import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export type DbClient = ReturnType<typeof drizzle<typeof schema>>;

export const createDbClient = (databaseUrl: string): DbClient => {
  const queryClient = postgres(databaseUrl);

  return drizzle(queryClient, { schema });
};

export const closeDbClient = async (db: DbClient): Promise<void> => {
  await db.$client.end();
};
