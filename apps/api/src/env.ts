import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    PORT: z.coerce.number().int().positive().default(3000),
    HOST: z.string().min(1).default('0.0.0.0'),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
