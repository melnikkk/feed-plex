import type { CreateFeedInput, Feed } from '@feed-plex/contracts';
import type { FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { createFeedMock, enqueueRelevantArticlesRunMock } = vi.hoisted(() => ({
  createFeedMock: vi.fn(),
  enqueueRelevantArticlesRunMock: vi.fn(),
}));

vi.mock('@feed-plex/database', () => ({
  createFeed: createFeedMock,
  deleteFeed: vi.fn(),
  getFeedById: vi.fn(),
  getSuggestionRunResult: vi.fn(),
  listFeeds: vi.fn(),
  markFeedViewed: vi.fn(),
  updateFeed: vi.fn(),
  createDbClient: vi.fn(() => ({})),
  closeDbClient: vi.fn(),
}));

vi.mock('@/routes/feeds/runs/queue', () => ({
  enqueueRelevantArticlesRun: enqueueRelevantArticlesRunMock,
  relevantArticlesQueue: { add: vi.fn(), getJob: vi.fn() },
}));

const createFeedInput: CreateFeedInput = {
  name: 'AI news',
  sources: [{ url: 'https://example.com/rss', sourceAffinity: 1 }],
  interests: [{ topic: 'llm', weight: 0.5, keywords: ['llm'] }],
};

const createdFeed: Feed = {
  id: '11111111-1111-4111-8111-111111111111',
  name: createFeedInput.name,
  sources: createFeedInput.sources,
  interests: createFeedInput.interests,
  createdAt: '2026-08-25T00:00:00.000Z',
  updatedAt: '2026-08-25T00:00:00.000Z',
};

describe('createFeedHandler', () => {
  let app: FastifyInstance | undefined;

  beforeEach(async () => {
    createFeedMock.mockResolvedValue(createdFeed);

    const { buildApp } = await import('@/app');

    app = buildApp();
  });

  afterEach(async () => {
    await app?.close();
  });

  it('enqueues a run for the created feed and returns its jobId', async () => {
    enqueueRelevantArticlesRunMock.mockResolvedValue('job-1');

    const response = await app!.inject({
      method: 'POST',
      url: '/api/feeds',
      payload: createFeedInput,
    });

    expect(response.statusCode).toBe(201);
    expect(enqueueRelevantArticlesRunMock).toHaveBeenCalledWith(createdFeed.id);
    expect(response.json()).toMatchObject({ id: createdFeed.id, jobId: 'job-1' });
  });

  it('still returns the created feed when enqueueing the run fails', async () => {
    enqueueRelevantArticlesRunMock.mockRejectedValue(new Error('Redis is down'));

    const response = await app!.inject({
      method: 'POST',
      url: '/api/feeds',
      payload: createFeedInput,
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ id: createdFeed.id });
    expect(response.json().jobId).toBeUndefined();
  });
});
