import type { RankedArticle } from '@feed-plex/contracts';
import { describe, expect, it } from 'vitest';
import { sortArticles, isArticleSortOption } from '@/entities/article/model/sortArticles';

const buildRanked = (title: string, score: number, publishedAt: string): RankedArticle => ({
  article: {
    title,
    link: `https://example.com/${title}`,
    summary: '',
    publishedAt,
    sourceUrl: 'https://example.com/feed.xml',
  },
  score,
  breakdown: {
    semanticSimilarity: 0,
    lexicalScore: 0,
    freshnessScore: 0,
    sourceAffinity: 0,
    noveltyPenalty: 0,
    diversityAdjustment: 0,
  },
});

const older = buildRanked('older', 0.9, '2026-08-01T00:00:00.000Z');
const newer = buildRanked('newer', 0.4, '2026-08-20T00:00:00.000Z');

describe('sortArticles', () => {
  it.each([
    { option: 'relevance' as const, expected: ['older', 'newer'] },
    { option: 'newest' as const, expected: ['newer', 'older'] },
  ])('orders by $option', ({ option, expected }) => {
    const sorted = sortArticles([newer, older], option);

    expect(sorted.map((ranked) => ranked.article.title)).toEqual(expected);
  });

  it('does not mutate the input array', () => {
    const input = [newer, older];
    sortArticles(input, 'relevance');

    expect(input.map((ranked) => ranked.article.title)).toEqual(['newer', 'older']);
  });
});

describe('isArticleSortOption', () => {
  it.each([
    { value: 'relevance', expected: true },
    { value: 'newest', expected: true },
    { value: 'name', expected: false },
    { value: 42, expected: false },
  ])('returns $expected for $value', ({ value, expected }) => {
    expect(isArticleSortOption(value)).toBe(expected);
  });
});
