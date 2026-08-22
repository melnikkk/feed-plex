import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fp from 'fastify-plugin';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';

// Kept in sync with the "version" field in apps/api/package.json — importing that file at
// runtime would need either JSON import attributes (unsupported by the configured module
// target) or a require() of a parent directory (disallowed by import/no-relative-parent-imports).
const API_VERSION = '0.1.0';

export const swaggerPlugin = fp(async (app) => {
  await app.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'Feed Plex API',
        version: API_VERSION,
        description: 'HTTP API for managing feeds, sources, interests, and relevance runs.',
      },
      servers: [{ url: '/', description: 'Current host' }],
    },
    transform: jsonSchemaTransform,
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
  });
});
