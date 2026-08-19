import { interestSchema, sourceSchema } from '@feed-plex/contracts';
import { z } from 'zod';

export const createRunBodySchema = z
  .object({
    sources: z.array(sourceSchema).min(1).optional(),
    interests: z.array(interestSchema).optional(),
  })
  .optional();
