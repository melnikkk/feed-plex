import type { CreateFeedInput, Feed, UpdateFeedInput } from '@feed-plex/contracts';
import { z } from 'zod';

const DEFAULT_SOURCE_AFFINITY = 1;
const DEFAULT_INTEREST_WEIGHT = 0.5;

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

export const feedFormSchema = z.object({
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

export type FeedFormValues = z.infer<typeof feedFormSchema>;

export const emptyFeedForm: FeedFormValues = {
  name: '',
  description: '',
  sources: [{ url: '' }],
  interests: [{ topic: '', keywords: '' }],
};

export const emptyFeedSource = { url: '' };

export const emptyFeedInterest = { topic: '', keywords: '' };

const toKeywords = (keywords: string): Array<string> =>
  keywords
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean);

export const toCreateFeedInput = (values: FeedFormValues): CreateFeedInput => ({
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

export const toFeedFormValues = (feed: Feed): FeedFormValues => ({
  name: feed.name,
  description: feed.description ?? '',
  sources: feed.sources.map(({ url }) => ({ url })),
  interests: feed.interests.map(({ topic, keywords }) => ({
    topic,
    keywords: keywords.join(', '),
  })),
});

export const toUpdateFeedInput = (values: FeedFormValues, feed: Feed): UpdateFeedInput => {
  const affinityByUrl = new Map(
    feed.sources.map(({ url, sourceAffinity }) => [url, sourceAffinity]),
  );
  const weightByTopic = new Map(feed.interests.map(({ topic, weight }) => [topic, weight]));

  return {
    name: values.name.trim(),
    description: values.description.trim(),
    sources: values.sources.map(({ url }) => {
      const trimmedUrl = url.trim();

      return {
        url: trimmedUrl,
        sourceAffinity: affinityByUrl.get(trimmedUrl) ?? DEFAULT_SOURCE_AFFINITY,
      };
    }),
    interests: values.interests.map(({ topic, keywords }) => {
      const trimmedTopic = topic.trim();

      return {
        topic: trimmedTopic,
        weight: weightByTopic.get(trimmedTopic) ?? DEFAULT_INTEREST_WEIGHT,
        keywords: toKeywords(keywords),
      };
    }),
  };
};
