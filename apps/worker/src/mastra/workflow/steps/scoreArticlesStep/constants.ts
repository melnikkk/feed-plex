export { SCORE_WEIGHTS } from '@feed-plex/contracts';

// No feedback loop exists yet (the workflow is stateless, per spec) — every
// article gets a neutral, zero-weight-contributing explicit feedback score
// until a persistence layer is added.
export const DEFAULT_EXPLICIT_FEEDBACK = 0;

// Reserved for a future re-ranking pass across the candidate set (penalizing
// repeat topics, boosting under-represented ones). Not part of this initial
// per-article score.
export const DEFAULT_NOVELTY_PENALTY = 0;
export const DEFAULT_DIVERSITY_ADJUSTMENT = 0;

export const FRESHNESS_HALF_LIFE_DAYS = 7;

export const RELEVANCE_THRESHOLD = 0.35;

export const ARTICLE_EMBEDDING_SUMMARY_MAX_LENGTH = 500;
