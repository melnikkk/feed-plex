import { describe, expect, it } from 'vitest';
import { feedArticlesResponseSchema } from '../feedArticlesSchema';

const rankedArticle = {
  article: {
    title: 'A title',
    link: 'https://example.com/post',
    summary: 'A summary',
    publishedAt: '2026-08-25T00:00:00.000Z',
    sourceUrl: 'https://example.com/feed.xml',
  },
  score: 0.72,
  breakdown: {
    semanticSimilarity: 0.8,
    lexicalScore: 0.5,
    freshnessScore: 0.9,
    sourceAffinity: 0.6,
    noveltyPenalty: 0,
    diversityAdjustment: 0,
  },
};

describe('feedArticlesResponseSchema', () => {
  it.each([
    {
      description: 'a completed run with ranked articles',
      input: {
        runId: 'job-1',
        completedAt: '2026-08-25T00:00:00.000Z',
        articles: [rankedArticle],
      },
    },
    {
      description: 'a completed run that ranked nothing above the threshold',
      input: { runId: 'job-1', completedAt: '2026-08-25T00:00:00.000Z', articles: [] },
    },
    {
      description: 'a feed with no completed run yet',
      input: { runId: null, completedAt: null, articles: [] },
    },
  ])('accepts $description', ({ input }) => {
    const result = feedArticlesResponseSchema.safeParse(input);

    expect(result.success).toBe(true);
  });

  it('rejects a response missing the articles array', () => {
    const result = feedArticlesResponseSchema.safeParse({ runId: null, completedAt: null });

    expect(result.success).toBe(false);
  });
});
