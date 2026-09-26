import { describe, expect, it } from 'vitest';
import { ApiError, NetworkError, getErrorReason } from '@/shared/api';

describe('getErrorReason', () => {
  it.each([
    [
      'a network failure',
      new NetworkError('/feeds'),
      "Couldn't reach the server. Check your connection and try again.",
    ],
    [
      'a server error',
      new ApiError(500, '/feeds', { error: 'Internal Server Error' }),
      'The server ran into a problem. Please try again in a moment.',
    ],
    [
      'a missing resource',
      new ApiError(404, '/feeds/1'),
      "We couldn't find what you were looking for.",
    ],
    [
      'a gateway timeout',
      new ApiError(504, '/feeds'),
      'The server took too long to respond. Please try again.',
    ],
    [
      'rate limiting',
      new ApiError(429, '/feeds'),
      "You're doing that too often. Please wait a moment and try again.",
    ],
    [
      'another client error',
      new ApiError(400, '/feeds'),
      'Something unexpected happened. Please try again.',
    ],
    ['a plain Error', new Error('boom'), 'Something unexpected happened. Please try again.'],
    ['a non-Error value', 'nope', 'Something unexpected happened. Please try again.'],
  ])('describes %s without technical details', (_label, error, expected) => {
    expect(getErrorReason(error)).toBe(expected);
  });
});
