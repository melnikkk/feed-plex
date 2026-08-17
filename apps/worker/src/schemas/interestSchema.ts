import { z } from "zod";

export const interestSchema = z.object({
  topic: z.string(),
  weight: z.number().min(0).max(1),
  embedding: z.array(z.number()).optional(),
  keywords: z.array(z.string()),
});

export type Interest = z.infer<typeof interestSchema>;
