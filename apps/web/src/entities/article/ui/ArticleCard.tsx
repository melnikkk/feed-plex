import type { RankedArticle } from '@feed-plex/contracts';
import { ChevronDown, ExternalLink, Globe } from 'lucide-react';
import type { FC } from 'react';
import { useState } from 'react';
import { articleHostname } from '@/entities/article/model/articleHostname';
import { cn, formatRelativeTime } from '@/shared/lib';
import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui';
import { ArticleScoreBadge } from './ArticleScoreBadge';
import { ArticleScoreBreakdown } from './ArticleScoreBreakdown';

interface Props {
  ranked: RankedArticle;
}

export const ArticleCard: FC<Props> = ({ ranked }) => {
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const { article, score, breakdown } = ranked;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="min-w-0 pr-2 text-sm leading-snug">
          {article.link ? (
            <a
              href={article.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-start gap-1.5 hover:underline focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              {article.title || 'Untitled article'}
              <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            </a>
          ) : (
            <span>{article.title || 'Untitled article'}</span>
          )}
        </CardTitle>
        <CardAction>
          <ArticleScoreBadge score={score} />
        </CardAction>
      </CardHeader>
      {article.summary && (
        <CardContent className="line-clamp-3 text-muted-foreground">{article.summary}</CardContent>
      )}
      <CardFooter className="flex-col items-stretch gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <Globe className="size-3.5 shrink-0" />
            <span className="truncate">{articleHostname(article)}</span>
            <span aria-hidden>·</span>
            <span className="whitespace-nowrap">{formatRelativeTime(article.publishedAt)}</span>
          </span>
          <Button
            variant="ghost"
            size="xs"
            aria-expanded={isBreakdownOpen}
            onClick={() => setIsBreakdownOpen((open) => !open)}
          >
            Why this?
            <ChevronDown
              data-icon="inline-end"
              className={cn('transition-transform', isBreakdownOpen && 'rotate-180')}
            />
          </Button>
        </div>
        {isBreakdownOpen && <ArticleScoreBreakdown breakdown={breakdown} score={score} />}
      </CardFooter>
    </Card>
  );
};
