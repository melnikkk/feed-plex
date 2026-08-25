import type { RankedArticle } from '@feed-plex/contracts';
import type { FC } from 'react';
import { ArticleCard } from '@/entities/article';

interface Props {
  articles: Array<RankedArticle>;
}

export const FeedArticlesList: FC<Props> = ({ articles }) => (
  <div className="flex flex-col gap-4">
    {articles.map((ranked) => (
      <ArticleCard key={ranked.article.link} ranked={ranked} />
    ))}
  </div>
);
