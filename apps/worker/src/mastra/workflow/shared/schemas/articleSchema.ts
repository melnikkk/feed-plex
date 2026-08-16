import { z } from "zod";

export const articleSchema = z.object({
  title: z.string(),
  link: z.string(),
  summary: z.string(),
  publishedAt: z.string(),
});

export type Article = z.infer<typeof articleSchema>;
