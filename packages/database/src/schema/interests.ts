import { jsonb, pgTable, real, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const interests = pgTable('interests', {
  id: uuid('id').primaryKey().defaultRandom(),
  topic: text('topic').notNull().unique(),
  weight: real('weight').notNull(),
  keywords: jsonb('keywords').$type<Array<string>>().notNull(),
  embedding: jsonb('embedding').$type<Array<number>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
