import { describe, expect, it } from 'vitest';
import { sourceSchema } from '../sourceSchema';

describe('sourceSchema', () => {
  it('accepts a valid url and an in-range affinity', () => {
    const result = sourceSchema.safeParse({
      url: 'https://example.com/feed.xml',
      sourceAffinity: 0.5,
    });

    expect(result.success).toBe(true);
  });

  it('rejects a non-url string', () => {
    const result = sourceSchema.safeParse({ url: 'not-a-url', sourceAffinity: 0.5 });

    expect(result.success).toBe(false);
  });

  it.each([-0.1, 1.1])('rejects sourceAffinity out of the [0, 1] range (%s)', (sourceAffinity) => {
    const result = sourceSchema.safeParse({
      url: 'https://example.com/feed.xml',
      sourceAffinity,
    });

    expect(result.success).toBe(false);
  });

  it.each([0, 1])('accepts sourceAffinity at the [0, 1] boundary (%s)', (sourceAffinity) => {
    const result = sourceSchema.safeParse({
      url: 'https://example.com/feed.xml',
      sourceAffinity,
    });

    expect(result.success).toBe(true);
  });
});
