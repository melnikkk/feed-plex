import type { Article } from '@feed-plex/contracts';

const hostnameOf = (url: string): string | undefined => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
};

export const articleHostname = (article: Pick<Article, 'link' | 'sourceUrl'>): string =>
  hostnameOf(article.link) ?? hostnameOf(article.sourceUrl) ?? 'Unknown source';
