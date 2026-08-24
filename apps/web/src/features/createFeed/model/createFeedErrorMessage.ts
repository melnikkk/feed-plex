import { ApiError } from '@/shared/api';

const NAME_TAKEN_MESSAGE = 'Could not create the feed — the name may already be taken.';
const VALIDATION_MESSAGE = 'Some fields are invalid. Check the form and try again.';
const FALLBACK_MESSAGE = 'Could not create the feed. Please try again.';

const errorText = (body: unknown): string => {
  if (typeof body === 'object' && body !== null && 'error' in body) {
    return String((body as { error: unknown }).error);
  }

  return '';
};

/**
 * `POST /feeds` has no unique-constraint handling, so a taken name arrives as a 500 whose body is
 * the raw failed Drizzle insert — never show that. The form already rejects duplicate sources and
 * topics, so a failed insert into `feeds` is in practice the name, but the wording stays hedged
 * because the body carries no explicit constraint to confirm it.
 */
export const createFeedErrorMessage = (error: unknown): string => {
  if (!(error instanceof ApiError)) {
    return FALLBACK_MESSAGE;
  }

  if (error.status === 409) {
    return NAME_TAKEN_MESSAGE;
  }

  if (error.status === 400 || error.status === 422) {
    return VALIDATION_MESSAGE;
  }

  const text = errorText(error.body);

  if (/unique|duplicate key/i.test(text) || /insert into "feeds"/i.test(text)) {
    return NAME_TAKEN_MESSAGE;
  }

  return FALLBACK_MESSAGE;
};
