import { jsonb, pgTable, real, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { feeds } from './feeds';

export const interests = pgTable(
  'interests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    feedId: uuid('feed_id')
      .notNull()
      .references(() => feeds.id, { onDelete: 'cascade' }),
    topic: text('topic').notNull(),
    weight: real('weight').notNull(),
    keywords: jsonb('keywords').$type<Array<string>>().notNull(),
    embedding: jsonb('embedding').$type<Array<number>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.feedId, table.topic)],
);
