import { createStep } from "@mastra/core/workflows";
import Parser from "rss-parser";
import { z } from "zod";
import { articleSchema } from "../../shared/schemas/articleSchema";

const parser = new Parser();

export const fetchFeedArticlesStep = createStep({
  id: "fetch-feed-articles",
  inputSchema: z.object({
    feedUrl: z.url(),
  }),
  outputSchema: z.object({
    articles: z.array(articleSchema),
  }),
  execute: async ({ inputData }) => {
    const { items = [] } = await parser.parseURL(inputData.feedUrl);

    return {
      articles: items.map((item) => ({
        title: item.title ?? "",
        link: item.link ?? "",
        summary: item.summary ?? item.contentSnippet ?? "",
        publishedAt: item.isoDate ?? item.pubDate ?? "",
      })),
    };
  },
});
