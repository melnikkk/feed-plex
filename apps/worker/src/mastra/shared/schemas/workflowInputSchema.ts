import { interestSchema, sourceSchema } from '@feed-plex/contracts';
import { z } from 'zod';

export const workflowInputDataSchema = z.object({
  sources: z.array(sourceSchema).min(1),
  interests: z.array(interestSchema),
});

export type WorkflowInputData = z.infer<typeof workflowInputDataSchema>;
