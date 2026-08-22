import { z } from 'zod';

export const feedRunParamsSchema = z.object({
  feedId: z.uuid(),
});

export const feedRunJobParamsSchema = z.object({
  feedId: z.uuid(),
  jobId: z.string(),
});

export const createRunResponseSchema = z.object({
  jobId: z.string(),
});
