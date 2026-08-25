import type { ArticleScore } from '@feed-plex/contracts';
import { SCORE_WEIGHTS } from '@feed-plex/contracts';
import { describe, expect, it } from 'vitest';
import { getScoreFactors } from '@/entities/article/model/scoreFactors';

const breakdown: ArticleScore = {
  semanticSimilarity: 0.8,
  lexicalScore: 0.4,
  freshnessScore: 0.5,
  sourceAffinity: 1,
  noveltyPenalty: 0,
  diversityAdjustment: 0,
};

describe('getScoreFactors', () => {
  it('exposes only the four factors the worker computes', () => {
    expect(getScoreFactors(breakdown).map((factor) => factor.key)).toEqual([
      'semanticSimilarity',
      'lexicalScore',
      'freshnessScore',
      'sourceAffinity',
    ]);
  });

  it('weights each factor with the shared scoring weights', () => {
    const factors = getScoreFactors(breakdown);

    expect(factors[0]).toMatchObject({
      value: 0.8,
      weight: SCORE_WEIGHTS.semanticSimilarity,
      contribution: 0.8 * SCORE_WEIGHTS.semanticSimilarity,
    });
  });

  it('sums to the score the worker would have persisted', () => {
    const total = getScoreFactors(breakdown).reduce((sum, factor) => sum + factor.contribution, 0);

    expect(total).toBeCloseTo(0.8 * 0.4 + 0.4 * 0.25 + 0.5 * 0.2 + 1 * 0.1, 10);
  });
});
