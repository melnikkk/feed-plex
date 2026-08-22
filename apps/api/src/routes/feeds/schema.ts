import { z } from 'zod';

export const feedIdParamsSchema = z.object({
  feedId: z.uuid(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
});
