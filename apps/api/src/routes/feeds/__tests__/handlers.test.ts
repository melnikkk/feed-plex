import type { CreateFeedInput, Feed } from '@feed-plex/contracts';
import type { FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { createFeedMock, updateFeedMock, enqueueRelevantArticlesRunMock } = vi.hoisted(() => ({
  createFeedMock: vi.fn(),
  updateFeedMock: vi.fn(),
  enqueueRelevantArticlesRunMock: vi.fn(),
}));

vi.mock('@feed-plex/database', () => ({
  createFeed: createFeedMock,
  deleteFeed: vi.fn(),
  getFeedById: vi.fn(),
  getSuggestionRunResult: vi.fn(),
  listFeeds: vi.fn(),
  markFeedViewed: vi.fn(),
  updateFeed: updateFeedMock,
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

const duplicateNameError = () =>
  Object.assign(new Error('Failed query: insert into "feeds" ...\nparams: AI news'), {
    cause: Object.assign(
      new Error('duplicate key value violates unique constraint "feeds_name_unique"'),
      { code: '23505', constraint_name: 'feeds_name_unique' },
    ),
  });

describe('unique constraint handling', () => {
  let app: FastifyInstance | undefined;

  beforeEach(async () => {
    const { buildApp } = await import('@/app');

    app = buildApp();
  });

  afterEach(async () => {
    await app?.close();
  });

  it.each([
    {
      route: 'POST /api/feeds',
      mock: createFeedMock,
      inject: { method: 'POST' as const, url: '/api/feeds', payload: createFeedInput },
    },
    {
      route: 'PUT /api/feeds/:feedId',
      mock: updateFeedMock,
      inject: {
        method: 'PUT' as const,
        url: `/api/feeds/${createdFeed.id}`,
        payload: { name: 'AI news' },
      },
    },
  ])('answers $route with a 409 instead of the raw failed query', async ({ mock, inject }) => {
    mock.mockRejectedValue(duplicateNameError());

    const response = await app!.inject(inject);

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({ error: 'A feed with this name already exists.' });
    expect(response.body, 'the failed statement must never reach the client').not.toContain(
      'Failed query',
    );
    expect(response.body).not.toContain('feeds_name_unique');
  });

  it('keeps an unrelated database failure a 500 and withholds its message', async () => {
    createFeedMock.mockRejectedValue(
      new Error('Failed query: insert into "feeds" ...\nparams: secret'),
    );

    const response = await app!.inject({
      method: 'POST',
      url: '/api/feeds',
      payload: createFeedInput,
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ error: 'Internal Server Error' });
    expect(response.body).not.toContain('Failed query');
  });

  it('still reports a genuine client error in its own words', async () => {
    updateFeedMock.mockResolvedValue(null);

    const response = await app!.inject({
      method: 'PUT',
      url: `/api/feeds/${createdFeed.id}`,
      payload: { name: 'AI news' },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: 'Feed not found' });
  });
});
