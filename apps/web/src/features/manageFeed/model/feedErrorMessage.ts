import { ApiError } from '@/shared/api';

export type FeedFormAction = 'create' | 'save';

const FALLBACK_MESSAGE: Record<FeedFormAction, string> = {
  create: 'Could not create the feed. Please try again.',
  save: 'Could not save the feed. Please try again.',
};

const VALIDATION_MESSAGE = 'Some fields are invalid. Check the form and try again.';

const conflictText = (body: unknown): string => {
  if (typeof body === 'object' && body !== null && 'error' in body) {
    const { error } = body as { error: unknown };

    if (typeof error === 'string' && error.length > 0) {
      return error;
    }
  }

  return '';
};

export const feedErrorMessage = (error: unknown, action: FeedFormAction): string => {
  if (!(error instanceof ApiError)) {
    return FALLBACK_MESSAGE[action];
  }

  if (error.status === 409) {
    return conflictText(error.body) || FALLBACK_MESSAGE[action];
  }

  if (error.status === 400 || error.status === 422) {
    return VALIDATION_MESSAGE;
  }

  return FALLBACK_MESSAGE[action];
};
