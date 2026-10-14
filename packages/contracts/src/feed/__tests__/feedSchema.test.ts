import { describe, expect, it } from 'vitest';
import { createFeedInputSchema, updateFeedInputSchema } from '../feedSchema';

const validSource = { url: 'https://example.com/feed.xml', sourceAffinity: 0.5 };
const validInterest = { topic: 'ai', weight: 0.8, keywords: ['ai', 'llm'] };
const validCreateInput = { name: 'My feed', sources: [validSource], interests: [validInterest] };

describe('createFeedInputSchema', () => {
  it('accepts a name with at least one source and one interest', () => {
    const result = createFeedInputSchema.safeParse(validCreateInput);

    expect(result.success).toBe(true);
  });

  it.each([
    { description: 'sources', overrides: { sources: [] } },
    { description: 'interests', overrides: { interests: [] } },
    { description: 'name', overrides: { name: '' } },
  ])('rejects an empty $description', ({ overrides }) => {
    const result = createFeedInputSchema.safeParse({ ...validCreateInput, ...overrides });

    expect(result.success).toBe(false);
  });

  it('defaults the refresh interval to daily', () => {
    const result = createFeedInputSchema.parse(validCreateInput);

    expect(result.refreshIntervalHours).toBe(24);
  });

  it.each([6, 12, 24, 168, null])('accepts a refresh interval of %s', (refreshIntervalHours) => {
    const result = createFeedInputSchema.safeParse({ ...validCreateInput, refreshIntervalHours });

    expect(result.success).toBe(true);
  });

  it.each([0, 7, 48])('rejects a refresh interval of %s hours', (refreshIntervalHours) => {
    const result = createFeedInputSchema.safeParse({ ...validCreateInput, refreshIntervalHours });

    expect(result.success).toBe(false);
  });
});

describe('updateFeedInputSchema', () => {
  it.each([
    { description: 'an empty object, since every field is a partial update', input: {} },
    {
      description: 'name-only updates without sources or interests',
      input: { name: 'Renamed feed' },
    },
  ])('accepts $description', ({ input }) => {
    const result = updateFeedInputSchema.safeParse(input);

    expect(result.success).toBe(true);
  });

  it.each([
    { description: 'sources', overrides: { sources: [] } },
    { description: 'interests', overrides: { interests: [] } },
  ])('rejects an empty $description array when provided', ({ overrides }) => {
    const result = updateFeedInputSchema.safeParse(overrides);

    expect(result.success).toBe(false);
  });
});
