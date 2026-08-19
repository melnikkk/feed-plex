import { createStep } from '@mastra/core/workflows';
import type { Source } from '@feed-plex/contracts';
import { articleSchema, sourceSchema } from '@feed-plex/contracts';
import Parser from 'rss-parser';
import { z } from 'zod';
import { logger } from '@/logger';
import { MAX_ARTICLES_PER_SOURCE, MAX_ARTICLE_AGE_DAYS } from './constants';
import { dedupeArticlesBySourceAffinity } from './dedupe';
import { takeMostRecentArticles } from './limit';
import { filterArticlesByMaxAge } from './recency';

const fetchSourceArticles = async (source: Source) => {
  const { items = [] } = await new Parser().parseURL(source.url);

  const articles = items.map((item) => ({
    title: item.title ?? '',
    link: item.link ?? '',
    summary: item.summary ?? item.contentSnippet ?? '',
    publishedAt: item.isoDate ?? item.pubDate ?? '',
    sourceUrl: source.url,
  }));

  return takeMostRecentArticles(articles, MAX_ARTICLES_PER_SOURCE);
};

export const fetchFeedArticlesStep = createStep({
  id: 'fetch-feed-articles',
  inputSchema: z.object({
    sources: z.array(sourceSchema),
  }),
  outputSchema: z.object({
    articles: z.array(articleSchema),
  }),
  execute: async ({ inputData }) => {
    const { sources } = inputData;

    const results = await Promise.allSettled(sources.map(fetchSourceArticles));

    const articles = results.flatMap((result, index) => {
      if (result.status === 'rejected') {
        logger.warn({ err: result.reason }, `Failed to fetch feed ${sources[index].url}`);
        return [];
      }

      return result.value;
    });

    const sourceAffinityByUrl = new Map(
      sources.map((source) => [source.url, source.sourceAffinity]),
    );

    const recentArticles = filterArticlesByMaxAge(articles, MAX_ARTICLE_AGE_DAYS);

    return {
      articles: dedupeArticlesBySourceAffinity(recentArticles, sourceAffinityByUrl),
    };
  },
});
