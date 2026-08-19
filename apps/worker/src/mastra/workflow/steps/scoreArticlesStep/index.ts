import { createStep } from '@mastra/core/workflows';
import type { Article, Interest } from '@feed-plex/contracts';
import {
  articleSchema,
  interestSchema,
  rankedArticleSchema,
  sourceSchema,
} from '@feed-plex/contracts';
import { embedMany } from 'ai';
import { z } from 'zod';
import { geminiEmbedding } from '@/mastra/models';
import { cosineSimilarity } from './similarity';
import { computeFreshnessScore } from './freshness';
import { computeKeywordMatchRatio } from './lexical';
import { weightedAverage } from './weightedProfile';
import {
  SCORE_WEIGHTS,
  DEFAULT_EXPLICIT_FEEDBACK,
  DEFAULT_NOVELTY_PENALTY,
  DEFAULT_DIVERSITY_ADJUSTMENT,
  RELEVANCE_THRESHOLD,
  ARTICLE_EMBEDDING_SUMMARY_MAX_LENGTH,
} from './constants';

const interestEmbeddingText = (interest: Interest): string =>
  [interest.topic, ...interest.keywords].join(', ');

const articleText = (article: Article): string => `${article.title}\n${article.summary}`;

const articleEmbeddingText = (article: Article): string =>
  articleText(article).slice(0, ARTICLE_EMBEDDING_SUMMARY_MAX_LENGTH);

const embedTexts = async (values: Array<string>): Promise<Array<Array<number>>> => {
  if (values.length === 0) return [];

  const { embeddings } = await embedMany({ model: geminiEmbedding, values });

  return embeddings;
};

export const scoreArticlesStep = createStep({
  id: 'score-articles',
  inputSchema: z.object({
    articles: z.array(articleSchema),
    interests: z.array(interestSchema),
    sources: z.array(sourceSchema),
  }),
  outputSchema: z.object({
    rankedArticles: z.array(rankedArticleSchema),
  }),
  execute: async ({ inputData }) => {
    const { articles, interests, sources } = inputData;

    const sourceAffinityByUrl = new Map(
      sources.map((source) => [source.url, source.sourceAffinity]),
    );

    const interestsMissingEmbedding = interests.filter((interest) => !interest.embedding);
    const computedInterestEmbeddings = await embedTexts(
      interestsMissingEmbedding.map(interestEmbeddingText),
    );

    let nextComputedEmbedding = 0;
    const interestsWithEmbeddings: Array<Interest & { embedding: Array<number> }> = interests.map(
      (interest) =>
        interest.embedding
          ? { ...interest, embedding: interest.embedding }
          : { ...interest, embedding: computedInterestEmbeddings[nextComputedEmbedding++] },
    );

    const articleEmbeddings = await embedTexts(articles.map(articleEmbeddingText));

    const rankedArticles = articles
      .map((article, index) => {
        const articleEmbedding = articleEmbeddings[index] ?? [];

        const semanticSimilarity = weightedAverage(interestsWithEmbeddings, (interest) =>
          cosineSimilarity(interest.embedding, articleEmbedding),
        );
        const lexicalScore = weightedAverage(interests, (interest) =>
          computeKeywordMatchRatio(articleText(article), interest.keywords),
        );
        const freshnessScore = computeFreshnessScore(article.publishedAt);
        const sourceAffinity = sourceAffinityByUrl.get(article.sourceUrl) ?? 0;

        const breakdown = {
          semanticSimilarity,
          lexicalScore,
          freshnessScore,
          sourceAffinity,
          noveltyPenalty: DEFAULT_NOVELTY_PENALTY,
          diversityAdjustment: DEFAULT_DIVERSITY_ADJUSTMENT,
        };

        const score =
          SCORE_WEIGHTS.semanticSimilarity * semanticSimilarity +
          SCORE_WEIGHTS.lexicalScore * lexicalScore +
          SCORE_WEIGHTS.freshnessScore * freshnessScore +
          SCORE_WEIGHTS.sourceAffinity * sourceAffinity +
          SCORE_WEIGHTS.explicitFeedback * DEFAULT_EXPLICIT_FEEDBACK;

        return { article, score, breakdown };
      })
      .filter((ranked) => ranked.score >= RELEVANCE_THRESHOLD)
      .toSorted((a, b) => b.score - a.score);

    return { rankedArticles };
  },
});
