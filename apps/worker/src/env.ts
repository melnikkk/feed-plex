import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),
    REDIS_URL: z.url(),
    DATABASE_URL: z.url().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
