import { describe, expect, it } from 'vitest';
import { createFeedErrorMessage } from '@/features/createFeed/model/createFeedErrorMessage';
import { ApiError } from '@/shared/api';

const NAME_TAKEN = 'Could not create the feed — the name may already be taken.';
const FALLBACK = 'Could not create the feed. Please try again.';

/** Captured verbatim from `POST /api/feeds` with a name that already exists. */
const duplicateNameBody = {
  error:
    'Failed query: insert into "feeds" ("id", "name", "description", "created_at", "updated_at", "last_viewed_at") values (default, $1, default, default, default, default) returning "id", "name", "description", "created_at", "updated_at", "last_viewed_at"\nparams: My feed',
};

describe('createFeedErrorMessage', () => {
  it('recognises the 500 the API actually returns for a taken name', () => {
    expect(createFeedErrorMessage(new ApiError(500, '/feeds', duplicateNameBody))).toBe(NAME_TAKEN);
  });

  it('never leaks the raw failed query', () => {
    const message = createFeedErrorMessage(new ApiError(500, '/feeds', duplicateNameBody));

    expect(message).not.toContain('insert into');
    expect(message).not.toContain('params:');
  });

  it('recognises an explicit unique-constraint message', () => {
    const error = new ApiError(500, '/feeds', {
      error: 'duplicate key value violates unique constraint "feeds_name_unique"',
    });

    expect(createFeedErrorMessage(error)).toBe(NAME_TAKEN);
    expect(createFeedErrorMessage(error)).not.toContain('feeds_name_unique');
  });

  it('uses the conflict message if the API ever starts returning 409', () => {
    expect(createFeedErrorMessage(new ApiError(409, '/feeds'))).toBe(NAME_TAKEN);
  });

  it('maps a validation status to the invalid-fields message', () => {
    expect(createFeedErrorMessage(new ApiError(400, '/feeds'))).toBe(
      'Some fields are invalid. Check the form and try again.',
    );
  });

  it('falls back for an unrelated 500', () => {
    expect(createFeedErrorMessage(new ApiError(500, '/feeds', { error: 'boom' }))).toBe(FALLBACK);
  });

  it('falls back when the error body is missing entirely', () => {
    expect(createFeedErrorMessage(new ApiError(500, '/feeds'))).toBe(FALLBACK);
  });

  it('falls back for a non-API error', () => {
    expect(createFeedErrorMessage(new Error('network down'))).toBe(FALLBACK);
  });
});
