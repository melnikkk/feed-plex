import { FRESHNESS_HALF_LIFE_DAYS } from './constants';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const computeFreshnessScore = (publishedAt: string, now: Date = new Date()): number => {
  const publishedAtMs = Date.parse(publishedAt);

  if (Number.isNaN(publishedAtMs)) {
    return 0;
  }

  const ageInDays = Math.max(0, (now.getTime() - publishedAtMs) / MS_PER_DAY);

  return Math.exp((-Math.LN2 * ageInDays) / FRESHNESS_HALF_LIFE_DAYS);
};
