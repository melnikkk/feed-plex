import { describe, expect, it } from 'vitest';
import { toFeed } from '../toFeed';
import type { FeedWithRelations } from '../toFeed';

const buildFeed = (overrides: Partial<FeedWithRelations> = {}): FeedWithRelations => ({
  id: 'feed-1',
  name: 'My feed',
  description: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  sources: [],
  interests: [],
  ...overrides,
});

describe('toFeed', () => {
  it('maps a feed row with no sources or interests', () => {
    const feed = toFeed(buildFeed());

    expect(feed).toEqual({
      id: 'feed-1',
      name: 'My feed',
      description: undefined,
      createdAt: '2026-01-01T00:00:00.000Z',
      sources: [],
      interests: [],
    });
  });

  it('preserves a non-null description', () => {
    const feed = toFeed(buildFeed({ description: 'About my feed' }));

    expect(feed.description).toBe('About my feed');
  });

  it('maps sources down to url and sourceAffinity, dropping db-only fields', () => {
    const feed = toFeed(
      buildFeed({
        sources: [
          {
            id: 'source-1',
            feedId: 'feed-1',
            url: 'https://example.com/feed.xml',
            sourceAffinity: 0.6,
            createdAt: new Date('2026-01-01T00:00:00Z'),
          },
        ],
      }),
    );

    expect(feed.sources).toEqual([{ url: 'https://example.com/feed.xml', sourceAffinity: 0.6 }]);
  });

  it.each([
    { description: 'a null interest embedding to undefined', embedding: null, expected: undefined },
    {
      description: 'a non-null interest embedding',
      embedding: [0.1, 0.2, 0.3],
      expected: [0.1, 0.2, 0.3],
    },
  ])('maps $description', ({ embedding, expected }) => {
    const feed = toFeed(
      buildFeed({
        interests: [
          {
            id: 'interest-1',
            feedId: 'feed-1',
            topic: 'ai',
            weight: 0.8,
            keywords: ['ai'],
            embedding,
            createdAt: new Date('2026-01-01T00:00:00Z'),
          },
        ],
      }),
    );

    expect(feed.interests[0]?.embedding).toEqual(expected);
  });
});
