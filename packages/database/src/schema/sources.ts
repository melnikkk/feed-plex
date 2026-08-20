import { pgTable, real, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const sources = pgTable('sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  url: text('url').notNull().unique(),
  sourceAffinity: real('source_affinity').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
