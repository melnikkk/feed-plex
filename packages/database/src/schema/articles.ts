import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const articles = pgTable('articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  link: text('link').notNull().unique(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }).notNull(),
  sourceUrl: text('source_url').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
