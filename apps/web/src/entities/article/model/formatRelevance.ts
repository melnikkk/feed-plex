/**
 * Rendered as a bare number, never a percentage: `explicitFeedback` is always 0,
 * so the reachable maximum is 95, not 100.
 */
export const formatRelevance = (score: number): number => Math.round(score * 100);
