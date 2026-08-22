import { z } from 'zod';
import { rankedArticleSchema } from '../article';

export const jobStatusSchema = z.enum(['queued', 'active', 'completed', 'failed']);

export type JobStatus = z.infer<typeof jobStatusSchema>;

export const jobStatusResponseSchema = z.discriminatedUnion('status', [
  z.object({ jobId: z.string(), status: z.literal('queued') }),
  z.object({ jobId: z.string(), status: z.literal('active') }),
  z.object({
    jobId: z.string(),
    status: z.literal('completed'),
    result: z.array(rankedArticleSchema),
  }),
  z.object({ jobId: z.string(), status: z.literal('failed'), error: z.string().optional() }),
]);

export type JobStatusResponse = z.infer<typeof jobStatusResponseSchema>;
