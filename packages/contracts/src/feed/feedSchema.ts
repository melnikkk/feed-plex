import { z } from 'zod';
import { interestSchema } from '../interest';
import { sourceSchema } from '../source';

export const feedSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  sources: z.array(sourceSchema),
  interests: z.array(interestSchema),
  createdAt: z.string(),
});

export type Feed = z.infer<typeof feedSchema>;

export const createFeedInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  sources: z.array(sourceSchema).min(1),
  interests: z.array(interestSchema).min(1),
});

export type CreateFeedInput = z.infer<typeof createFeedInputSchema>;

export const updateFeedInputSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  sources: z.array(sourceSchema).min(1).optional(),
  interests: z.array(interestSchema).min(1).optional(),
});

export type UpdateFeedInput = z.infer<typeof updateFeedInputSchema>;
