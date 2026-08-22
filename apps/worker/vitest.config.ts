import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
    restoreMocks: true,
    env: {
      NODE_ENV: 'test',
      REDIS_URL: 'redis://localhost:6379',
      GOOGLE_GENERATIVE_AI_API_KEY: 'test-key',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
    },
  },
});
