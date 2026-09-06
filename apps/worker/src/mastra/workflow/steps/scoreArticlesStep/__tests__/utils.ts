import type { Article } from '@feed-plex/contracts';
import { TEST_SOURCE_URL } from './constants';

export const buildArticle = (overrides: Partial<Article> = {}): Article => ({
  title: 'Article',
  link: 'https://example.com/article',
  summary: 'Summary',
  publishedAt: new Date().toISOString(),
  sourceUrl: TEST_SOURCE_URL,
  ...overrides,
});

export const INTEREST_VECTOR = [1, 0];

export const vectorWithCosine = (cosine: number): Array<number> => [
  cosine,
  Math.sqrt(1 - cosine * cosine),
];
