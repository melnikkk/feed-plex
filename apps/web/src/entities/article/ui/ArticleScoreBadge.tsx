import type { FC } from 'react';
import { formatRelevance } from '@/entities/article/model/formatRelevance';
import { cn } from '@/shared/lib';
import { Badge } from '@/shared/ui';

interface Props {
  score: number;
  className?: string;
}

export const ArticleScoreBadge: FC<Props> = ({ score, className }) => (
  <Badge
    variant="secondary"
    className={cn('tabular-nums', className)}
    title={`Relevance ${formatRelevance(score)} of a reachable 95`}
  >
    {formatRelevance(score)}
  </Badge>
);
