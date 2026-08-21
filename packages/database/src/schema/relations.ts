import { relations } from 'drizzle-orm';
import { feeds } from './feeds';
import { interests } from './interests';
import { sources } from './sources';

export const feedsRelations = relations(feeds, ({ many }) => ({
  sources: many(sources),
  interests: many(interests),
}));

export const sourcesRelations = relations(sources, ({ one }) => ({
  feed: one(feeds, { fields: [sources.feedId], references: [feeds.id] }),
}));

export const interestsRelations = relations(interests, ({ one }) => ({
  feed: one(feeds, { fields: [interests.feedId], references: [feeds.id] }),
}));
