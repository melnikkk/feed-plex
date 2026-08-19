import { z } from 'zod';

const sourceSchema = z.object({
  url: z.url(),
  sourceAffinity: z.number().min(0).max(1),
});

const interestSchema = z.object({
  topic: z.string(),
  weight: z.number().min(0).max(1),
  embedding: z.array(z.number()).optional(),
  keywords: z.array(z.string()),
});

export const createRunBodySchema = z
  .object({
    sources: z.array(sourceSchema).min(1).optional(),
    interests: z.array(interestSchema).optional(),
  })
  .optional();
