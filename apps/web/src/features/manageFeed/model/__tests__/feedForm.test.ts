import { describe, expect, it } from 'vitest';
import type { Feed } from '@feed-plex/contracts';
import {
  emptyFeedForm,
  feedFormSchema,
  toCreateFeedInput,
  toFeedFormValues,
  toUpdateFeedInput,
} from '@/features/manageFeed/model/feedForm';

const validValues = {
  name: 'Frontend weekly',
  description: 'Weekly frontend reading',
  sources: [{ url: 'https://example.com/feed.xml' }],
  interests: [{ topic: 'react', keywords: 'hooks, rsc' }],
};

describe('feedFormSchema', () => {
  it('accepts a fully populated form', () => {
    expect(feedFormSchema.safeParse(validValues).success).toBe(true);
  });

  it('rejects a blank name', () => {
    const result = feedFormSchema.safeParse({ ...validValues, name: '   ' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Name is required');
  });

  it('rejects an invalid source URL', () => {
    const result = feedFormSchema.safeParse({
      ...validValues,
      sources: [{ url: 'not-a-url' }],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Enter a valid URL');
  });

  it('rejects a blank interest topic', () => {
    const result = feedFormSchema.safeParse({
      ...validValues,
      interests: [{ topic: '', keywords: '' }],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Topic is required');
  });

  it('rejects empty source and interest lists', () => {
    expect(feedFormSchema.safeParse({ ...validValues, sources: [] }).success).toBe(false);
    expect(feedFormSchema.safeParse({ ...validValues, interests: [] }).success).toBe(false);
  });

  it('rejects the empty default form', () => {
    expect(feedFormSchema.safeParse(emptyFeedForm).success).toBe(false);
  });

  it('rejects a repeated source URL, flagging the second row', () => {
    const result = feedFormSchema.safeParse({
      ...validValues,
      sources: [{ url: 'https://example.com/feed.xml' }, { url: 'https://example.com/feed.xml' }],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('This source is already listed');
    expect(result.error?.issues[0]?.path).toEqual(['sources', 1, 'url']);
  });

  it('rejects a repeated interest topic regardless of casing', () => {
    const result = feedFormSchema.safeParse({
      ...validValues,
      interests: [
        { topic: 'react', keywords: '' },
        { topic: 'React', keywords: '' },
      ],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('This topic is already listed');
    expect(result.error?.issues[0]?.path).toEqual(['interests', 1, 'topic']);
  });

  it('allows distinct sources and topics', () => {
    const result = feedFormSchema.safeParse({
      ...validValues,
      sources: [{ url: 'https://a.dev/rss' }, { url: 'https://b.dev/rss' }],
      interests: [
        { topic: 'react', keywords: '' },
        { topic: 'vite', keywords: '' },
      ],
    });

    expect(result.success).toBe(true);
  });
});

describe('toCreateFeedInput', () => {
  it('trims values and applies the hidden ranking defaults', () => {
    expect(
      toCreateFeedInput({
        name: '  Frontend weekly  ',
        description: '  Weekly reading  ',
        sources: [{ url: '  https://example.com/feed.xml  ' }],
        interests: [{ topic: '  react  ', keywords: 'hooks, rsc' }],
      }),
    ).toEqual({
      name: 'Frontend weekly',
      description: 'Weekly reading',
      sources: [{ url: 'https://example.com/feed.xml', sourceAffinity: 1 }],
      interests: [{ topic: 'react', weight: 0.5, keywords: ['hooks', 'rsc'] }],
    });
  });

  it('omits an empty description rather than sending a blank string', () => {
    expect(toCreateFeedInput({ ...validValues, description: '   ' }).description).toBeUndefined();
  });

  it('splits keywords on commas, trimming and discarding blanks', () => {
    const [interest] = toCreateFeedInput({
      ...validValues,
      interests: [{ topic: 'react', keywords: ' hooks , , rsc ,  ' }],
    }).interests;

    expect(interest?.keywords).toEqual(['hooks', 'rsc']);
  });

  it('produces an empty keyword list when none are given', () => {
    const [interest] = toCreateFeedInput({
      ...validValues,
      interests: [{ topic: 'react', keywords: '' }],
    }).interests;

    expect(interest?.keywords).toEqual([]);
  });

  it('maps every source and interest row', () => {
    const input = toCreateFeedInput({
      ...validValues,
      sources: [{ url: 'https://a.dev/rss' }, { url: 'https://b.dev/rss' }],
      interests: [
        { topic: 'react', keywords: 'hooks' },
        { topic: 'vite', keywords: '' },
      ],
    });

    expect(input.sources).toHaveLength(2);
    expect(input.interests.map(({ topic }) => topic)).toEqual(['react', 'vite']);
  });
});

/** Affinity and weight are deliberately off the create-time defaults of 1 and 0.5. */
const storedFeed: Feed = {
  id: 'feed-1',
  name: 'Frontend weekly',
  description: 'Weekly frontend reading',
  sources: [{ url: 'https://example.com/feed.xml', sourceAffinity: 0.25 }],
  interests: [{ topic: 'react', weight: 0.9, keywords: ['hooks', 'rsc'] }],
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-20T00:00:00.000Z',
};

describe('toFeedFormValues', () => {
  it('fills the form from a stored feed', () => {
    expect(toFeedFormValues(storedFeed)).toEqual({
      name: 'Frontend weekly',
      description: 'Weekly frontend reading',
      sources: [{ url: 'https://example.com/feed.xml' }],
      interests: [{ topic: 'react', keywords: 'hooks, rsc' }],
    });
  });

  it('renders a missing description as an empty field rather than undefined', () => {
    const values = toFeedFormValues({ ...storedFeed, description: undefined });

    expect(values.description).toBe('');
  });
});

describe('toUpdateFeedInput', () => {
  it('carries the stored affinity and weight through for untouched rows', () => {
    const input = toUpdateFeedInput(toFeedFormValues(storedFeed), storedFeed);

    expect(input.sources).toEqual([{ url: 'https://example.com/feed.xml', sourceAffinity: 0.25 }]);
    expect(input.interests).toEqual([{ topic: 'react', weight: 0.9, keywords: ['hooks', 'rsc'] }]);
  });

  it('falls back to the defaults for newly added rows', () => {
    const values = toFeedFormValues(storedFeed);
    const input = toUpdateFeedInput(
      {
        ...values,
        sources: [...values.sources, { url: 'https://new.dev/rss' }],
        interests: [...values.interests, { topic: 'vite', keywords: '' }],
      },
      storedFeed,
    );

    expect(input.sources?.[1]).toEqual({ url: 'https://new.dev/rss', sourceAffinity: 1 });
    expect(input.interests?.[1]).toEqual({ topic: 'vite', weight: 0.5, keywords: [] });
  });

  it('drops rows the user removed', () => {
    const input = toUpdateFeedInput(
      { ...toFeedFormValues(storedFeed), sources: [{ url: 'https://other.dev/rss' }] },
      storedFeed,
    );

    expect(input.sources).toEqual([{ url: 'https://other.dev/rss', sourceAffinity: 1 }]);
  });

  it('sends a cleared description as an empty string, since undefined means "leave unchanged"', () => {
    const input = toUpdateFeedInput(
      { ...toFeedFormValues(storedFeed), description: '   ' },
      storedFeed,
    );

    expect(input.description).toBe('');
  });

  it('trims before matching, so a padded url keeps its stored affinity', () => {
    const input = toUpdateFeedInput(
      { ...toFeedFormValues(storedFeed), sources: [{ url: '  https://example.com/feed.xml  ' }] },
      storedFeed,
    );

    expect(input.sources).toEqual([{ url: 'https://example.com/feed.xml', sourceAffinity: 0.25 }]);
  });
});
