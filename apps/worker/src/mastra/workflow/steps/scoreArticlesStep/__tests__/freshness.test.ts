import { describe, expect, it } from 'vitest';
import { computeFreshnessScore } from '@/mastra/workflow/steps/scoreArticlesStep/freshness';
import { FRESHNESS_HALF_LIFE_DAYS } from '@/mastra/workflow/steps/scoreArticlesStep/constants';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-01-01T00:00:00Z');

describe('computeFreshnessScore', () => {
  it.each([
    { description: 'published right now', offsetMs: 0, expected: 1 },
    {
      description: 'one half-life old',
      offsetMs: -FRESHNESS_HALF_LIFE_DAYS * ONE_DAY_MS,
      expected: 0.5,
    },
    {
      description: 'published slightly in the future, clamped',
      offsetMs: 60 * 60 * 1000,
      expected: 1,
    },
  ])('scores an article $description as $expected', ({ offsetMs, expected }) => {
    const publishedAt = new Date(NOW.getTime() + offsetMs).toISOString();

    expect(computeFreshnessScore(publishedAt, NOW)).toBeCloseTo(expected, 5);
  });

  it('returns 0 for an unparseable publishedAt value', () => {
    expect(computeFreshnessScore('not-a-date')).toBe(0);
  });
});
