import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),
    REDIS_URL: z.url(),
    DATABASE_URL: z.url().optional(),
    WORKER_CONCURRENCY: z.coerce.number().int().positive().default(4),
    WORKER_RUNS_PER_MINUTE: z.coerce.number().int().positive().default(30),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
