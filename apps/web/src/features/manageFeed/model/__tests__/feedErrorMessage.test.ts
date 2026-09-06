import { describe, expect, it } from 'vitest';
import { feedErrorMessage } from '@/features/manageFeed/model/feedErrorMessage';
import { ApiError } from '@/shared/api';

const CREATE_FALLBACK = 'Could not create the feed. Please try again.';

describe('feedErrorMessage', () => {
  it.each([
    { constraint: 'a taken name', body: { error: 'A feed with this name already exists.' } },
    {
      constraint: 'a repeated source',
      body: { error: 'This feed already lists that source URL.' },
    },
  ])('shows the 409 the API wrote for $constraint', ({ body }) => {
    expect(feedErrorMessage(new ApiError(409, '/feeds', body), 'create')).toBe(body.error);
  });

  it('falls back when a 409 arrives without a usable message', () => {
    expect(feedErrorMessage(new ApiError(409, '/feeds'), 'create')).toBe(CREATE_FALLBACK);
  });

  it.each([400, 422])('maps status %i to the invalid-fields message', (status) => {
    expect(feedErrorMessage(new ApiError(status, '/feeds'), 'create')).toBe(
      'Some fields are invalid. Check the form and try again.',
    );
  });

  it.each([
    {
      description: 'a 500',
      error: new ApiError(500, '/feeds', { error: 'Internal Server Error' }),
    },
    { description: 'a missing error body', error: new ApiError(500, '/feeds') },
    { description: 'a non-API error', error: new Error('network down') },
  ])('falls back for $description', ({ error }) => {
    expect(feedErrorMessage(error, 'create')).toBe(CREATE_FALLBACK);
  });

  it('phrases the fallback for the action it was given', () => {
    expect(feedErrorMessage(new Error('network down'), 'save')).toBe(
      'Could not save the feed. Please try again.',
    );
  });
});
