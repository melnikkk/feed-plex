import { integer, pgTable, real, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { articles } from './articles';
import { suggestionRuns } from './suggestionRuns';

export const rankedArticleScores = pgTable('ranked_article_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  suggestionRunId: text('suggestion_run_id')
    .notNull()
    .references(() => suggestionRuns.id, { onDelete: 'cascade' }),
  articleId: uuid('article_id')
    .notNull()
    .references(() => articles.id),
  rank: integer('rank').notNull(),
  score: real('score').notNull(),
  semanticSimilarity: real('semantic_similarity').notNull(),
  lexicalScore: real('lexical_score').notNull(),
  freshnessScore: real('freshness_score').notNull(),
  sourceAffinity: real('source_affinity').notNull(),
  noveltyPenalty: real('novelty_penalty').notNull(),
  diversityAdjustment: real('diversity_adjustment').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
