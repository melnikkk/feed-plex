import type { Article, Interest, RankedArticle, Source } from '@feed-plex/contracts';
import type * as AiModule from 'ai';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MEASURED_SEMANTIC_SIMILARITY, TEST_SOURCE_URL } from './constants';
import { INTEREST_VECTOR, buildArticle, vectorWithCosine } from './utils';

const embedManyMock = vi.hoisted(() => vi.fn());

// Only the network call is mocked — cosineSimilarity stays the real one.
vi.mock('ai', async (importOriginal) => ({
  ...(await importOriginal<typeof AiModule>()),
  embedMany: embedManyMock,
}));
vi.mock('@/mastra/models', () => ({ geminiEmbedding: 'test-embedding-model' }));

const { scoreArticlesStep } = await import('@/mastra/workflow/steps/scoreArticlesStep');

const interest: Interest = {
  topic: 'Typescript',
  weight: 0.5,
  keywords: ['typescript', 'generics'],
};

const ON_TOPIC_TITLE = 'Typescript generics deep dive';
const OFF_TOPIC_TITLE = 'Sourdough starter routine';
const ON_TOPIC_TITLE_WITHOUT_KEYWORDS = 'Type-level programming without the boilerplate';

const onTopicArticle = buildArticle({
  title: ON_TOPIC_TITLE,
  link: 'https://example.com/typescript',
});

const offTopicArticle = buildArticle({
  title: OFF_TOPIC_TITLE,
  link: 'https://example.com/sourdough',
});

const ARTICLE_EMBEDDINGS: Array<[string, Array<number>]> = [
  [ON_TOPIC_TITLE, vectorWithCosine(MEASURED_SEMANTIC_SIMILARITY.postgresAdjacent)],
  [OFF_TOPIC_TITLE, vectorWithCosine(MEASURED_SEMANTIC_SIMILARITY.sourdoughVsTypescript)],
  [
    ON_TOPIC_TITLE_WITHOUT_KEYWORDS,
    vectorWithCosine(MEASURED_SEMANTIC_SIMILARITY.postgresAdjacent),
  ],
];

const embeddingForText = (text: string): Array<number> =>
  ARTICLE_EMBEDDINGS.find(([title]) => text.startsWith(title))?.[1] ?? INTEREST_VECTOR;

type ScoreStepExecute = (args: {
  inputData: { articles: Array<Article>; interests: Array<Interest>; sources: Array<Source> };
}) => Promise<{ rankedArticles: Array<RankedArticle> }>;

const executeStep = scoreArticlesStep.execute as unknown as ScoreStepExecute;

const runStep = (articles: Array<Article>, sourceAffinity = 1) =>
  executeStep({
    inputData: {
      articles,
      interests: [interest],
      sources: [{ url: TEST_SOURCE_URL, sourceAffinity }],
    },
  });

const daysAgo = (days: number): string =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

beforeEach(() => {
  embedManyMock.mockImplementation(({ values }: { values: Array<string> }) =>
    Promise.resolve({ embeddings: values.map(embeddingForText) }),
  );
});

describe('scoreArticlesStep', () => {
  it('drops an off-topic article despite maximum freshness and source affinity', async () => {
    const { rankedArticles } = await runStep([offTopicArticle]);

    expect(rankedArticles).toEqual([]);
  });

  it('drops an off-topic article that name-drops every interest keyword', async () => {
    const keywordStuffedArticle = buildArticle({
      title: OFF_TOPIC_TITLE,
      link: 'https://example.com/blogspam',
      summary: 'Filed under typescript, generics — subscribe for more.',
    });

    const { rankedArticles } = await runStep([keywordStuffedArticle]);

    expect(rankedArticles).toEqual([]);
  });

  it('keeps an on-topic article at its realistically measured similarity', async () => {
    const { rankedArticles } = await runStep([onTopicArticle]);

    expect(rankedArticles).toHaveLength(1);
    expect(rankedArticles[0].article.link).toBe(onTopicArticle.link);
    expect(rankedArticles[0].breakdown.semanticSimilarity).toBeCloseTo(
      MEASURED_SEMANTIC_SIMILARITY.postgresAdjacent,
      5,
    );
  });

  it('keeps an on-topic article whose interest keywords never appear literally', async () => {
    const article = buildArticle({
      title: ON_TOPIC_TITLE_WITHOUT_KEYWORDS,
      link: 'https://example.com/type-level',
      summary: 'Mapped and conditional types, explained from first principles.',
    });

    const { rankedArticles } = await runStep([article]);

    expect(rankedArticles).toHaveLength(1);
    expect(rankedArticles[0].breakdown.lexicalScore).toBe(0);
  });

  it('keeps a stale on-topic article from a barely trusted source', async () => {
    const staleArticle = buildArticle({
      title: ON_TOPIC_TITLE,
      link: 'https://example.com/stale-typescript',
      publishedAt: daysAgo(7),
    });

    const { rankedArticles } = await runStep([staleArticle], 0.1);

    expect(rankedArticles).toHaveLength(1);
  });

  it('ranks the articles that clear the gate by blended score', async () => {
    const staleArticle = buildArticle({
      title: ON_TOPIC_TITLE,
      link: 'https://example.com/stale-typescript',
      publishedAt: daysAgo(21),
    });

    const { rankedArticles } = await runStep([staleArticle, onTopicArticle, offTopicArticle]);

    expect(rankedArticles.map((ranked) => ranked.article.link)).toEqual([
      onTopicArticle.link,
      staleArticle.link,
    ]);
    expect(rankedArticles[0].score).toBeGreaterThan(rankedArticles[1].score);
  });
});
