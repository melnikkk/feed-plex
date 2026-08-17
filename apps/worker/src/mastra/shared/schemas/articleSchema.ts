import { z } from "zod";

export const articleSchema = z.object({
  title: z.string(),
  link: z.string(),
  summary: z.string(),
  publishedAt: z.string(),
  sourceUrl: z.url(),
});

export type Article = z.infer<typeof articleSchema>;
