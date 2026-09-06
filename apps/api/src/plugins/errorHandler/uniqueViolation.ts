const UNIQUE_VIOLATION_CODE = '23505';

const MAX_CAUSE_DEPTH = 5;

const CONFLICT_MESSAGES: Record<string, string> = {
  feeds_name_unique: 'A feed with this name already exists.',
  sources_feed_id_url_unique: 'This feed already lists that source URL.',
  interests_feed_id_topic_unique: 'This feed already lists that interest topic.',
  articles_link_unique: 'That article link is already stored.',
};

const FALLBACK_CONFLICT_MESSAGE = 'That value is already taken.';

interface UniqueViolation {
  code: string;
  constraint_name?: string;
}

const isUniqueViolation = (error: unknown): error is UniqueViolation =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code: unknown }).code === UNIQUE_VIOLATION_CODE;

export const findUniqueViolation = (error: unknown): UniqueViolation | null => {
  let current = error;

  for (let depth = 0; current && depth < MAX_CAUSE_DEPTH; depth += 1) {
    if (isUniqueViolation(current)) {
      return current;
    }

    current = (current as { cause?: unknown }).cause;
  }

  return null;
};

export const uniqueViolationMessage = ({ constraint_name }: UniqueViolation): string =>
  CONFLICT_MESSAGES[constraint_name ?? ''] ?? FALLBACK_CONFLICT_MESSAGE;
