import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { feeds } from './feeds';

export const suggestionRuns = pgTable('suggestion_runs', {
  id: text('id').primaryKey(),
  feedId: uuid('feed_id')
    .notNull()
    .references(() => feeds.id, { onDelete: 'cascade' }),
  status: text('status').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
});
