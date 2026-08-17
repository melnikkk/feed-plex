import { z } from "zod";

export const articleScoreSchema = z.object({
  semanticSimilarity: z.number(),
  lexicalScore: z.number(),
  freshnessScore: z.number(),
  sourceAffinity: z.number(),
  noveltyPenalty: z.number(),
  diversityAdjustment: z.number(),
});
