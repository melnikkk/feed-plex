import { sql } from 'drizzle-orm';
import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const feeds = pgTable(
  'feeds',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull().unique(),
    description: text('description'),
    refreshIntervalHours: integer('refresh_interval_hours'),
    nextRefreshAt: timestamp('next_refresh_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    lastViewedAt: timestamp('last_viewed_at', { withTimezone: true }),
  },
  (table) => [
    index('feeds_next_refresh_at_idx')
      .on(table.nextRefreshAt)
      .where(sql`${table.refreshIntervalHours} IS NOT NULL`),
  ],
);
