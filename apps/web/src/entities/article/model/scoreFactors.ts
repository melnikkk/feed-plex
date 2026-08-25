import type { ArticleScore } from '@feed-plex/contracts';
import { SCORE_WEIGHTS } from '@feed-plex/contracts';

const FACTOR_LABELS = {
  semanticSimilarity: 'Topic match',
  lexicalScore: 'Keyword overlap',
  freshnessScore: 'Freshness',
  sourceAffinity: 'Source trust',
} as const;

type ScoreFactorKey = keyof typeof FACTOR_LABELS;

export interface ScoreFactor {
  key: ScoreFactorKey;
  label: string;
  value: number;
  weight: number;
  contribution: number;
}

const FACTOR_KEYS = Object.keys(FACTOR_LABELS) as Array<ScoreFactorKey>;

export const getScoreFactors = (breakdown: ArticleScore): Array<ScoreFactor> =>
  FACTOR_KEYS.map((key) => ({
    key,
    label: FACTOR_LABELS[key],
    value: breakdown[key],
    weight: SCORE_WEIGHTS[key],
    contribution: breakdown[key] * SCORE_WEIGHTS[key],
  }));
