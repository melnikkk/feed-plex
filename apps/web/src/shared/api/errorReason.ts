import { ApiError, NetworkError } from './apiClient';

const UNEXPECTED_REASON = 'Something unexpected happened. Please try again.';

const apiErrorReason = (status: number): string => {
  if (status === 404) {
    return "We couldn't find what you were looking for.";
  }

  if (status === 408 || status === 504) {
    return 'The server took too long to respond. Please try again.';
  }

  if (status === 429) {
    return "You're doing that too often. Please wait a moment and try again.";
  }

  if (status >= 500) {
    return 'The server ran into a problem. Please try again in a moment.';
  }

  return UNEXPECTED_REASON;
};

export const isRequestError = (error: unknown): error is ApiError | NetworkError =>
  error instanceof ApiError || error instanceof NetworkError;

export const getErrorReason = (error: unknown): string => {
  if (error instanceof NetworkError) {
    return "Couldn't reach the server. Check your connection and try again.";
  }

  if (error instanceof ApiError) {
    return apiErrorReason(error.status);
  }

  return UNEXPECTED_REASON;
};
