import { describe, expect, it } from 'vitest';
import { cosineSimilarity } from '@/mastra/workflow/steps/scoreArticlesStep/similarity';

describe('cosineSimilarity', () => {
  it.each([
    { description: 'identical vectors', a: [1, 2, 3], b: [1, 2, 3], expected: 1 },
    { description: 'orthogonal vectors', a: [1, 0], b: [0, 1], expected: 0 },
    { description: 'opposite vectors, clamped to 0', a: [1, 0], b: [-1, 0], expected: 0 },
    { description: 'a zero-magnitude vector', a: [0, 0], b: [1, 2], expected: 0 },
  ])('returns $expected for $description', ({ a, b, expected }) => {
    expect(cosineSimilarity(a, b)).toBeCloseTo(expected, 5);
  });
});
