import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { feeds } from './feeds';

export const suggestionRuns = pgTable(
  'suggestion_runs',
  {
    id: text('id').primaryKey(),
    feedId: uuid('feed_id')
      .notNull()
      .references(() => feeds.id, { onDelete: 'cascade' }),
    status: text('status').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('suggestion_runs_feed_id_created_at_idx').on(table.feedId, table.createdAt)],
);
