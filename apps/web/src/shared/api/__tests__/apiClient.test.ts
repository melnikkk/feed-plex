import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  NetworkError,
  createFeed,
  deleteFeed,
  getFeed,
  getHealth,
  markFeedViewed,
} from '@/shared/api';

describe('apiClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('requests the health endpoint from the configured API URL', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok' }), { status: 200 }),
    );

    const result = await getHealth();

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/health', undefined);
    expect(result).toEqual({ status: 'ok' });
  });

  it('throws when the response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }));

    await expect(getHealth()).rejects.toThrow('Request to /health failed with status 500');
  });

  it('throws a NetworkError when the server is unreachable', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(getHealth()).rejects.toBeInstanceOf(NetworkError);
  });

  describe('deleteFeed', () => {
    it('sends a DELETE request and resolves on 204', async () => {
      vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }));

      await expect(deleteFeed('feed-1')).resolves.toBeUndefined();
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/feeds/feed-1', {
        method: 'DELETE',
      });
    });

    it('throws an ApiError carrying the response status when not ok', async () => {
      vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 404 }));

      await expect(deleteFeed('feed-1')).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('getFeed', () => {
    it('sends a GET request and returns the feed', async () => {
      const feed = {
        id: 'feed-1',
        name: 'My feed',
        sources: [],
        interests: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };
      vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(feed), { status: 200 }));

      await expect(getFeed('feed-1')).resolves.toEqual(feed);
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/feeds/feed-1', undefined);
    });
  });

  describe('markFeedViewed', () => {
    it('sends a POST request and returns the updated feed', async () => {
      const feed = {
        id: 'feed-1',
        name: 'My feed',
        sources: [],
        interests: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };
      vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(feed), { status: 200 }));

      await expect(markFeedViewed('feed-1')).resolves.toEqual(feed);
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/feeds/feed-1/view', {
        method: 'POST',
      });
    });
  });

  describe('createFeed', () => {
    const input = {
      name: 'My feed',
      sources: [{ url: 'https://example.com/feed.xml', sourceAffinity: 1 }],
      interests: [{ topic: 'react', weight: 0.5, keywords: ['hooks'] }],
    };

    it('sends a JSON POST request and returns the created feed', async () => {
      const feed = {
        id: 'feed-1',
        ...input,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };
      vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(feed), { status: 201 }));

      await expect(createFeed(input)).resolves.toEqual(feed);
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
    });

    it('throws an ApiError carrying the parsed error body', async () => {
      const body = { error: 'Validation Error' };
      vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(body), { status: 400 }));

      await expect(createFeed(input)).rejects.toMatchObject({ status: 400, body });
    });

    it('leaves the body undefined when the error response has no JSON', async () => {
      vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }));

      await expect(createFeed(input)).rejects.toMatchObject({ status: 500, body: undefined });
    });
  });
});
