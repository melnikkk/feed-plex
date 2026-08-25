import { describe, expect, it } from 'vitest';
import { articleHostname } from '@/entities/article/model/articleHostname';

describe('articleHostname', () => {
  it.each([
    {
      description: 'the article link host, without a www prefix',
      article: { link: 'https://www.theverge.com/post', sourceUrl: 'https://feeds.io/rss' },
      expected: 'theverge.com',
    },
    {
      description: 'the source host when the link is empty',
      article: { link: '', sourceUrl: 'https://feeds.io/rss' },
      expected: 'feeds.io',
    },
    {
      description: 'the source host when the link is unparseable',
      article: { link: 'not a url', sourceUrl: 'https://feeds.io/rss' },
      expected: 'feeds.io',
    },
    {
      description: 'a fallback when neither parses',
      article: { link: '', sourceUrl: '' },
      expected: 'Unknown source',
    },
  ])('returns $description', ({ article, expected }) => {
    expect(articleHostname(article)).toBe(expected);
  });
});
