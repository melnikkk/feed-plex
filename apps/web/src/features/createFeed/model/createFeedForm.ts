import type { CreateFeedInput } from '@feed-plex/contracts';
import { z } from 'zod';

const DEFAULT_SOURCE_AFFINITY = 1;
const DEFAULT_INTEREST_WEIGHT = 0.5;

/**
 * The API stores sources and interests under `unique(feedId, url)` / `unique(feedId, topic)`, and
 * has no handling for the violation — a repeated row would come back as an opaque 500. Catching
 * it here keeps the error on the offending row instead.
 */
const rejectDuplicates = <T>(
  rows: Array<T>,
  toKey: (row: T) => string,
  field: string,
  message: string,
  ctx: z.RefinementCtx,
) => {
  const seen = new Set<string>();

  rows.forEach((row, index) => {
    const key = toKey(row);

    if (seen.has(key)) {
      ctx.addIssue({ code: 'custom', message, path: [index, field] });
    }

    seen.add(key);
  });
};

export const createFeedFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string(),
  sources: z
    .array(z.object({ url: z.url('Enter a valid URL') }))
    .min(1)
    .superRefine((sources, ctx) =>
      rejectDuplicates(
        sources,
        ({ url }) => url.trim().toLowerCase(),
        'url',
        'This source is already listed',
        ctx,
      ),
    ),
  interests: z
    .array(
      z.object({
        topic: z.string().trim().min(1, 'Topic is required'),
        keywords: z.string(),
      }),
    )
    .min(1)
    .superRefine((interests, ctx) =>
      rejectDuplicates(
        interests,
        ({ topic }) => topic.trim().toLowerCase(),
        'topic',
        'This topic is already listed',
        ctx,
      ),
    ),
});

export type CreateFeedFormValues = z.infer<typeof createFeedFormSchema>;

export const emptyCreateFeedForm: CreateFeedFormValues = {
  name: '',
  description: '',
  sources: [{ url: '' }],
  interests: [{ topic: '', keywords: '' }],
};

export const emptyCreateFeedSource = { url: '' };

export const emptyCreateFeedInterest = { topic: '', keywords: '' };

const toKeywords = (keywords: string): Array<string> =>
  keywords
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean);

export const toCreateFeedInput = (values: CreateFeedFormValues): CreateFeedInput => ({
  name: values.name.trim(),
  description: values.description.trim() || undefined,
  sources: values.sources.map(({ url }) => ({
    url: url.trim(),
    sourceAffinity: DEFAULT_SOURCE_AFFINITY,
  })),
  interests: values.interests.map(({ topic, keywords }) => ({
    topic: topic.trim(),
    weight: DEFAULT_INTEREST_WEIGHT,
    keywords: toKeywords(keywords),
  })),
});
