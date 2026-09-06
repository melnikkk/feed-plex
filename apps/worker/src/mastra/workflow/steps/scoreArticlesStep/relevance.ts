import { cosineSimilarity } from 'ai';
import { MIN_SEMANTIC_RELEVANCE } from './constants';

export const computeSemanticSimilarity = (
  interestEmbedding: Array<number>,
  articleEmbedding: Array<number>,
): number => Math.max(0, cosineSimilarity(interestEmbedding, articleEmbedding));

export const computePeakSemanticSimilarity = (
  interestEmbeddings: Array<Array<number>>,
  articleEmbedding: Array<number>,
): number =>
  interestEmbeddings.reduce(
    (peak, interestEmbedding) =>
      Math.max(peak, computeSemanticSimilarity(interestEmbedding, articleEmbedding)),
    0,
  );

export const meetsSemanticRelevance = (peakSemanticSimilarity: number): boolean =>
  peakSemanticSimilarity >= MIN_SEMANTIC_RELEVANCE;
