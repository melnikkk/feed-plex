import type { Article } from '@feed-plex/contracts';
import { describe, expect, it } from 'vitest';
import { dedupeArticlesBySourceAffinity } from '@/mastra/workflow/steps/fetchFeedArticlesStep/dedupe';

const buildArticle = (overrides: Partial<Article> = {}): Article => ({
  title: 'Article',
  link: 'https://example.com/article',
  summary: 'Summary',
  publishedAt: '2026-01-01T00:00:00Z',
  sourceUrl: 'https://example.com/feed.xml',
  ...overrides,
});

describe('dedupeArticlesBySourceAffinity', () => {
  it('keeps a single article untouched', () => {
    const article = buildArticle();

    expect(dedupeArticlesBySourceAffinity([article], new Map())).toEqual([article]);
  });

  it.each([
    {
      description: 'keeps the copy from the source with higher affinity when both are known',
      loserUrl: 'https://low.example.com/feed.xml',
      winnerUrl: 'https://high.example.com/feed.xml',
      sourceAffinityByUrl: new Map([
        ['https://low.example.com/feed.xml', 0.2],
        ['https://high.example.com/feed.xml', 0.9],
      ]),
    },
    {
      description: 'treats an unknown source affinity as 0',
      loserUrl: 'https://unknown.example.com/feed.xml',
      winnerUrl: 'https://known.example.com/feed.xml',
      sourceAffinityByUrl: new Map([['https://known.example.com/feed.xml', 0.1]]),
    },
  ])('$description', ({ loserUrl, winnerUrl, sourceAffinityByUrl }) => {
    const loser = buildArticle({ sourceUrl: loserUrl });
    const winner = buildArticle({ sourceUrl: winnerUrl });

    const result = dedupeArticlesBySourceAffinity([loser, winner], sourceAffinityByUrl);

    expect(result).toEqual([winner]);
  });
});
