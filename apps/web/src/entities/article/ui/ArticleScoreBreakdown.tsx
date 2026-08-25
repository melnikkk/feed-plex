import type { ArticleScore } from '@feed-plex/contracts';
import type { FC } from 'react';
import { formatRelevance } from '@/entities/article/model/formatRelevance';
import { getScoreFactors } from '@/entities/article/model/scoreFactors';

interface Props {
  breakdown: ArticleScore;
  score: number;
}

export const ArticleScoreBreakdown: FC<Props> = ({ breakdown, score }) => (
  <div className="flex flex-col gap-2 border-t pt-3">
    {getScoreFactors(breakdown).map((factor) => (
      <div key={factor.key} className="grid grid-cols-[7rem_1fr_auto] items-center gap-3">
        <span className="text-muted-foreground">{factor.label}</span>
        <div className="h-1.5 w-full bg-muted">
          <div
            className="h-full bg-primary"
            style={{ width: `${Math.min(Math.max(factor.value, 0), 1) * 100}%` }}
          />
        </div>
        <span className="text-muted-foreground tabular-nums">
          {factor.value.toFixed(2)} × {factor.weight}
        </span>
      </div>
    ))}
    <p className="text-muted-foreground">
      Weighted total <span className="text-foreground tabular-nums">{formatRelevance(score)}</span>
      {' — '}
      the ranking formula is a fixed weighted sum, not a model's judgement.
    </p>
  </div>
);
