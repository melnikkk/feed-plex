import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const feeds = pgTable('feeds', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  lastViewedAt: timestamp('last_viewed_at', { withTimezone: true }),
});
