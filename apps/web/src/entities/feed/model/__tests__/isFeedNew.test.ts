import { describe, expect, it } from 'vitest';
import { isFeedNew } from '@/entities/feed/model/isFeedNew';

describe('isFeedNew', () => {
  it.each([
    {
      name: 'the feed has never been viewed',
      updatedAt: '2026-01-02T00:00:00Z',
      lastViewedAt: undefined,
      expected: true,
    },
    {
      name: 'the feed was updated after the last view',
      updatedAt: '2026-01-02T00:00:00Z',
      lastViewedAt: '2026-01-01T00:00:00Z',
      expected: true,
    },
    {
      name: 'viewed at or after the last update',
      updatedAt: '2026-01-01T00:00:00Z',
      lastViewedAt: '2026-01-02T00:00:00Z',
      expected: false,
    },
  ])('is $expected when $name', ({ updatedAt, lastViewedAt, expected }) => {
    expect(isFeedNew({ updatedAt, lastViewedAt })).toBe(expected);
  });
});
