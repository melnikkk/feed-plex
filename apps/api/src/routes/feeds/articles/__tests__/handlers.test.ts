import type { Feed, RankedArticle } from '@feed-plex/contracts';
import type { FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { getFeedByIdMock, getLatestSuggestionRunMock } = vi.hoisted(() => ({
  getFeedByIdMock: vi.fn(),
  getLatestSuggestionRunMock: vi.fn(),
}));

vi.mock('@feed-plex/database', () => ({
  createFeed: vi.fn(),
  deleteFeed: vi.fn(),
  getFeedById: getFeedByIdMock,
  getLatestSuggestionRun: getLatestSuggestionRunMock,
  getSuggestionRunResult: vi.fn(),
  listFeeds: vi.fn(),
  markFeedViewed: vi.fn(),
  updateFeed: vi.fn(),
  createDbClient: vi.fn(() => ({})),
  closeDbClient: vi.fn(),
}));

vi.mock('@/routes/feeds/runs/queue', () => ({
  enqueueRelevantArticlesRun: vi.fn(),
  relevantArticlesQueue: { add: vi.fn(), getJob: vi.fn() },
}));

const feedId = '11111111-1111-4111-8111-111111111111';

const feed: Feed = {
  id: feedId,
  name: 'AI news',
  sources: [{ url: 'https://example.com/rss', sourceAffinity: 1 }],
  interests: [{ topic: 'llm', weight: 0.5, keywords: ['llm'] }],
  createdAt: '2026-08-25T00:00:00.000Z',
  updatedAt: '2026-08-25T00:00:00.000Z',
};

const rankedArticle: RankedArticle = {
  article: {
    title: 'A title',
    link: 'https://example.com/post',
    summary: 'A summary',
    publishedAt: '2026-08-25T00:00:00.000Z',
    sourceUrl: 'https://example.com/rss',
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

describe('listFeedArticlesHandler', () => {
  let app: FastifyInstance | undefined;

  beforeEach(async () => {
    getFeedByIdMock.mockClear();
    getLatestSuggestionRunMock.mockClear();

    const { buildApp } = await import('@/app');

    app = buildApp();
  });

  afterEach(async () => {
    await app?.close();
  });

  it('returns the latest completed run with its ranked articles', async () => {
    getFeedByIdMock.mockResolvedValue(feed);
    getLatestSuggestionRunMock.mockResolvedValue({
      runId: 'job-1',
      completedAt: '2026-08-25T00:00:00.000Z',
      articles: [rankedArticle],
    });

    const response = await app!.inject({ method: 'GET', url: `/api/feeds/${feedId}/articles` });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      runId: 'job-1',
      completedAt: '2026-08-25T00:00:00.000Z',
      articles: [rankedArticle],
    });
  });

  it('returns a null run when the feed has no completed run yet', async () => {
    getFeedByIdMock.mockResolvedValue(feed);
    getLatestSuggestionRunMock.mockResolvedValue(null);

    const response = await app!.inject({ method: 'GET', url: `/api/feeds/${feedId}/articles` });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ runId: null, completedAt: null, articles: [] });
  });

  it('returns 404 when the feed does not exist', async () => {
    getFeedByIdMock.mockResolvedValue(undefined);

    const response = await app!.inject({ method: 'GET', url: `/api/feeds/${feedId}/articles` });

    expect(response.statusCode).toBe(404);
    expect(getLatestSuggestionRunMock).not.toHaveBeenCalled();
  });
});
