import { describe, expect, it } from 'vitest';
import {
  findUniqueViolation,
  uniqueViolationMessage,
} from '@/plugins/errorHandler/uniqueViolation';

const pgUniqueViolation = (constraintName: string) =>
  Object.assign(new Error(`duplicate key value violates unique constraint "${constraintName}"`), {
    code: '23505',
    constraint_name: constraintName,
  });

const drizzleWrapped = (cause: unknown) =>
  Object.assign(new Error('Failed query: insert into "feeds" ...\nparams: My feed'), { cause });

describe('findUniqueViolation', () => {
  it('finds a violation the driver threw directly', () => {
    expect(findUniqueViolation(pgUniqueViolation('feeds_name_unique'))).toMatchObject({
      code: '23505',
    });
  });

  it('finds one Drizzle wrapped in a cause', () => {
    expect(
      findUniqueViolation(drizzleWrapped(pgUniqueViolation('feeds_name_unique'))),
    ).toMatchObject({ constraint_name: 'feeds_name_unique' });
  });

  it('finds one nested several causes deep', () => {
    const nested = drizzleWrapped(drizzleWrapped(pgUniqueViolation('feeds_name_unique')));

    expect(findUniqueViolation(nested)).toMatchObject({ constraint_name: 'feeds_name_unique' });
  });

  it.each([
    {
      description: 'an unrelated postgres error',
      error: Object.assign(new Error('x'), { code: '42P01' }),
    },
    { description: 'a plain error', error: new Error('boom') },
    { description: 'a null cause chain', error: drizzleWrapped(undefined) },
    { description: 'a non-error value', error: 'nope' },
  ])('returns null for $description', ({ error }) => {
    expect(findUniqueViolation(error)).toBeNull();
  });

  it('gives up rather than looping on a self-referencing cause', () => {
    const cyclic: { cause?: unknown } = {};
    cyclic.cause = cyclic;

    expect(findUniqueViolation(cyclic)).toBeNull();
  });
});

describe('uniqueViolationMessage', () => {
  it.each([
    { constraint_name: 'feeds_name_unique', expected: 'A feed with this name already exists.' },
    {
      constraint_name: 'sources_feed_id_url_unique',
      expected: 'This feed already lists that source URL.',
    },
    {
      constraint_name: 'interests_feed_id_topic_unique',
      expected: 'This feed already lists that interest topic.',
    },
  ])('maps $constraint_name to its own copy', ({ constraint_name, expected }) => {
    expect(uniqueViolationMessage({ code: '23505', constraint_name })).toBe(expected);
  });

  it.each([
    { description: 'an unmapped constraint', constraint_name: 'something_else_unique' },
    { description: 'no constraint name at all', constraint_name: undefined },
  ])('falls back for $description', ({ constraint_name }) => {
    expect(uniqueViolationMessage({ code: '23505', constraint_name })).toBe(
      'That value is already taken.',
    );
  });

  it('never echoes the constraint name', () => {
    expect(
      uniqueViolationMessage({ code: '23505', constraint_name: 'feeds_name_unique' }),
    ).not.toContain('feeds_name_unique');
  });
});
