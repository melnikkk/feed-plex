import { describe, expect, it } from 'vitest';
import { jobStatusResponseSchema } from '../jobStatusSchema';
import {
  relevantArticlesJobDataSchema,
  relevantArticlesJobResultSchema,
} from '../relevantArticlesJob';

const validArticle = {
  title: 'Title',
  link: 'https://example.com/article',
  summary: 'Summary',
  publishedAt: '2026-01-01T00:00:00.000Z',
  sourceUrl: 'https://example.com/feed.xml',
};

const validScore = {
  semanticSimilarity: 0.5,
  lexicalScore: 0.5,
  freshnessScore: 0.5,
  sourceAffinity: 0.5,
  noveltyPenalty: 0,
  diversityAdjustment: 0,
};

const validRankedArticle = { article: validArticle, score: 0.5, breakdown: validScore };

describe('relevantArticlesJobDataSchema', () => {
  it('accepts a valid feedId', () => {
    const result = relevantArticlesJobDataSchema.safeParse({
      feedId: '123e4567-e89b-12d3-a456-426614174000',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a non-uuid feedId', () => {
    const result = relevantArticlesJobDataSchema.safeParse({ feedId: 'not-a-uuid' });

    expect(result.success).toBe(false);
  });
});

describe('relevantArticlesJobResultSchema', () => {
  it('accepts an array of ranked articles', () => {
    const result = relevantArticlesJobResultSchema.safeParse([validRankedArticle]);

    expect(result.success).toBe(true);
  });

  it('rejects a malformed ranked article', () => {
    const result = relevantArticlesJobResultSchema.safeParse([{ article: validArticle }]);

    expect(result.success).toBe(false);
  });
});

describe('jobStatusResponseSchema', () => {
  it.each([
    { description: 'a queued job', input: { jobId: '1', status: 'queued' } },
    { description: 'an active job', input: { jobId: '1', status: 'active' } },
    {
      description: 'a completed job with a result',
      input: { jobId: '1', status: 'completed', result: [validRankedArticle] },
    },
    {
      description: 'a failed job with an error message',
      input: { jobId: '1', status: 'failed', error: 'boom' },
    },
    {
      description: 'a failed job without an error message',
      input: { jobId: '1', status: 'failed' },
    },
  ])('accepts $description', ({ input }) => {
    const result = jobStatusResponseSchema.safeParse(input);

    expect(result.success).toBe(true);
  });

  it('rejects a completed job without a result', () => {
    const result = jobStatusResponseSchema.safeParse({ jobId: '1', status: 'completed' });

    expect(result.success).toBe(false);
  });

  it('rejects an unknown status', () => {
    const result = jobStatusResponseSchema.safeParse({ jobId: '1', status: 'unknown' });

    expect(result.success).toBe(false);
  });
});
