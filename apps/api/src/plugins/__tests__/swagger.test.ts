import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '@/app';

describe('swaggerPlugin', () => {
  let app: FastifyInstance | undefined;

  afterEach(async () => {
    await app?.close();
  });

  it('serves a valid OpenAPI document at /docs/json', async () => {
    app = buildApp();

    const response = await app.inject({ method: 'GET', url: '/docs/json' });

    expect(response.statusCode).toBe(200);

    const body = response.json();

    expect(body.openapi).toBe('3.0.3');
    expect(body.paths).toHaveProperty('/api/health');
    expect(body.paths).toHaveProperty('/api/feeds/');
    expect(body.paths).toHaveProperty('/api/feeds/{feedId}');
  });

  it('serves the Swagger UI at /docs', async () => {
    app = buildApp();

    const response = await app.inject({ method: 'GET', url: '/docs' });

    expect(response.statusCode).toBe(200);
  });

  it('is not registered when NODE_ENV is production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.resetModules();

    const { buildApp: buildProductionApp } = await import('@/app');
    app = buildProductionApp();

    const response = await app.inject({ method: 'GET', url: '/docs/json' });

    expect(response.statusCode).toBe(404);

    vi.unstubAllEnvs();
  });
});
