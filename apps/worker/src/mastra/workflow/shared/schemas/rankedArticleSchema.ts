import { z } from "zod";
import { articleSchema } from "./articleSchema";
import { articleScoreSchema } from "./articleScoreSchema";

export const rankedArticleSchema = z.object({
  article: articleSchema,
  score: z.number(),
  breakdown: articleScoreSchema,
});

export type RankedArticle = z.infer<typeof rankedArticleSchema>;
