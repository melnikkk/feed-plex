import { pgTable, real, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { feeds } from './feeds';

export const sources = pgTable(
  'sources',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    feedId: uuid('feed_id')
      .notNull()
      .references(() => feeds.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    sourceAffinity: real('source_affinity').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.feedId, table.url)],
);
