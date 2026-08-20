import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { env } from './env';

const migrationClient = postgres(env.DATABASE_URL, { max: 1 });
const db = drizzle(migrationClient);

await migrate(db, { migrationsFolder: './migrations' });
await migrationClient.end();

console.log('Migrations applied');
