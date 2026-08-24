import { describe, expect, it } from 'vitest';
import {
  createFeedFormSchema,
  emptyCreateFeedForm,
  toCreateFeedInput,
} from '@/features/createFeed/model/createFeedForm';

const validValues = {
  name: 'Frontend weekly',
  description: 'Weekly frontend reading',
  sources: [{ url: 'https://example.com/feed.xml' }],
  interests: [{ topic: 'react', keywords: 'hooks, rsc' }],
};

describe('createFeedFormSchema', () => {
  it('accepts a fully populated form', () => {
    expect(createFeedFormSchema.safeParse(validValues).success).toBe(true);
  });

  it('rejects a blank name', () => {
    const result = createFeedFormSchema.safeParse({ ...validValues, name: '   ' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Name is required');
  });

  it('rejects an invalid source URL', () => {
    const result = createFeedFormSchema.safeParse({
      ...validValues,
      sources: [{ url: 'not-a-url' }],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Enter a valid URL');
  });

  it('rejects a blank interest topic', () => {
    const result = createFeedFormSchema.safeParse({
      ...validValues,
      interests: [{ topic: '', keywords: '' }],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Topic is required');
  });

  it('rejects empty source and interest lists', () => {
    expect(createFeedFormSchema.safeParse({ ...validValues, sources: [] }).success).toBe(false);
    expect(createFeedFormSchema.safeParse({ ...validValues, interests: [] }).success).toBe(false);
  });

  it('rejects the empty default form', () => {
    expect(createFeedFormSchema.safeParse(emptyCreateFeedForm).success).toBe(false);
  });

  it('rejects a repeated source URL, flagging the second row', () => {
    const result = createFeedFormSchema.safeParse({
      ...validValues,
      sources: [{ url: 'https://example.com/feed.xml' }, { url: 'https://example.com/feed.xml' }],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('This source is already listed');
    expect(result.error?.issues[0]?.path).toEqual(['sources', 1, 'url']);
  });

  it('rejects a repeated interest topic regardless of casing', () => {
    const result = createFeedFormSchema.safeParse({
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
    const result = createFeedFormSchema.safeParse({
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
