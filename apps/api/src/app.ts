import cors from '@fastify/cors';
import Fastify from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { dbPlugin } from '@/plugins/db';
import { errorHandlerPlugin } from '@/plugins/errorHandler';
import { swaggerPlugin } from '@/plugins/swagger';
import { feedsRoutes } from '@/routes/feeds/route';
import { env } from '@/env';

const safeJsonParse = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

export const buildApp = () => {
  const app = Fastify({
    logger: {
      transport:
        env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
            }
          : undefined,
    },
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.addContentTypeParser('application/json', { parseAs: 'string' }, (_request, body, done) => {
    if (body === '') {
      done(null, undefined);
      return;
    }

    try {
      done(null, JSON.parse(body as string));
    } catch (error) {
      done(error as Error, undefined);
    }
  });

  if (env.NODE_ENV === 'development') {
    app.addHook('preHandler', (request, _reply, done) => {
      request.log.info({ body: request.body }, 'request body');
      done();
    });

    app.addHook('onSend', (request, _reply, payload, done) => {
      const body = typeof payload === 'string' ? safeJsonParse(payload) : payload;

      request.log.info({ body }, 'response body');
      done(null, payload);
    });
  }

  app.register(dbPlugin);

  app.register(cors, { origin: [env.CORS_ORIGIN] });

  app.register(errorHandlerPlugin);

  if (env.NODE_ENV !== 'production') {
    app.register(swaggerPlugin);
  }

  app.register(
    async (api) => {
      api.get(
        '/health',
        { schema: { response: { 200: z.object({ status: z.literal('ok') }) } } },
        async () => ({ status: 'ok' }),
      );

      api.register(feedsRoutes, { prefix: '/feeds' });
    },
    { prefix: '/api' },
  );

  return app;
};
