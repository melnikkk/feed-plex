import { feedArticlesResponseSchema } from '@feed-plex/contracts';
import { errorResponseSchema, feedIdParamsSchema } from '@/routes/feeds/schema';
import { listFeedArticlesHandler } from '@/routes/feeds/articles/handlers';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

export const feedArticlesRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/',
    {
      schema: {
        params: feedIdParamsSchema,
        response: { 200: feedArticlesResponseSchema, 404: errorResponseSchema },
      },
    },
    listFeedArticlesHandler,
  );
};
