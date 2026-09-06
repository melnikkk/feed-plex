import { describe, expect, it } from 'vitest';
import {
  computePeakSemanticSimilarity,
  computeSemanticSimilarity,
  meetsSemanticRelevance,
} from '@/mastra/workflow/steps/scoreArticlesStep/relevance';
import { MEASURED_SEMANTIC_SIMILARITY } from './constants';
import { INTEREST_VECTOR, vectorWithCosine } from './utils';

const similarityAt = (cosine: number): number =>
  computeSemanticSimilarity(INTEREST_VECTOR, vectorWithCosine(cosine));

describe('computeSemanticSimilarity', () => {
  it.each([
    { description: 'an identical direction', cosine: 1, expected: 1 },
    { description: 'an orthogonal vector', cosine: 0, expected: 0 },
    { description: 'a measured on-topic pair', cosine: 0.4832, expected: 0.4832 },
  ])('returns $expected for $description', ({ cosine, expected }) => {
    expect(similarityAt(cosine)).toBeCloseTo(expected, 5);
  });

  it('clamps an opposed vector to zero rather than reporting negative relevance', () => {
    expect(computeSemanticSimilarity(INTEREST_VECTOR, [-1, 0])).toBe(0);
  });
});

describe('computePeakSemanticSimilarity', () => {
  it('reads the best-matching interest, not the profile average', () => {
    const article = INTEREST_VECTOR;
    const matchingInterest = vectorWithCosine(MEASURED_SEMANTIC_SIMILARITY.postgresAdjacent);
    const unrelatedInterests = Array.from({ length: 4 }, () =>
      vectorWithCosine(MEASURED_SEMANTIC_SIMILARITY.sourdoughVsTypescript),
    );

    const peak = computePeakSemanticSimilarity([matchingInterest, ...unrelatedInterests], article);

    expect(peak).toBeCloseTo(MEASURED_SEMANTIC_SIMILARITY.postgresAdjacent, 5);
    expect(meetsSemanticRelevance(peak)).toBe(true);
  });

  it('returns zero when there are no interests to match against', () => {
    expect(computePeakSemanticSimilarity([], INTEREST_VECTOR)).toBe(0);
  });
});

describe('meetsSemanticRelevance', () => {
  it.each([
    {
      description: 'the Ruby conference article this feed wrongly recommended',
      cosine: MEASURED_SEMANTIC_SIMILARITY.rubyConferenceVsTypescript,
      expected: false,
    },
    {
      description: 'a sourdough recipe scored against a Typescript interest',
      cosine: MEASURED_SEMANTIC_SIMILARITY.sourdoughVsTypescript,
      expected: false,
    },
    {
      description: 'a Vue article scored against a React interest',
      cosine: MEASURED_SEMANTIC_SIMILARITY.reactVsVue,
      expected: false,
    },
    {
      description: 'a Postgres operations article against a Postgres planning interest',
      cosine: MEASURED_SEMANTIC_SIMILARITY.postgresAdjacent,
      expected: true,
    },
  ])('returns $expected for $description', ({ cosine, expected }) => {
    expect(meetsSemanticRelevance(similarityAt(cosine))).toBe(expected);
  });

  it('separates the closest true positive from the closest true negative', () => {
    const { postgresAdjacent, reactVsVue } = MEASURED_SEMANTIC_SIMILARITY;

    expect(meetsSemanticRelevance(similarityAt(postgresAdjacent))).toBe(true);
    expect(meetsSemanticRelevance(similarityAt(reactVsVue))).toBe(false);
    expect(postgresAdjacent - reactVsVue).toBeLessThan(0.05);
  });
});
