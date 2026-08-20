import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const suggestionRuns = pgTable('suggestion_runs', {
  id: text('id').primaryKey(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
});
