import { createFeedInputSchema, feedSchema, updateFeedInputSchema } from '@feed-plex/contracts';
import { z } from 'zod';
import { errorResponseSchema, feedIdParamsSchema } from '@/routes/feeds/schema';
import {
  createFeedHandler,
  deleteFeedHandler,
  getFeedHandler,
  listFeedsHandler,
  updateFeedHandler,
} from '@/routes/feeds/handlers';
import { feedRunsRoutes } from '@/routes/feeds/runs/route';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

export const feedsRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/',
    { schema: { body: createFeedInputSchema, response: { 201: feedSchema } } },
    createFeedHandler,
  );

  app.get('/', { schema: { response: { 200: z.array(feedSchema) } } }, listFeedsHandler);

  app.get(
    '/:feedId',
    {
      schema: {
        params: feedIdParamsSchema,
        response: { 200: feedSchema, 404: errorResponseSchema },
      },
    },
    getFeedHandler,
  );

  app.put(
    '/:feedId',
    {
      schema: {
        params: feedIdParamsSchema,
        body: updateFeedInputSchema,
        response: { 200: feedSchema, 404: errorResponseSchema },
      },
    },
    updateFeedHandler,
  );

  app.delete(
    '/:feedId',
    { schema: { params: feedIdParamsSchema, response: { 404: errorResponseSchema } } },
    deleteFeedHandler,
  );

  app.register(feedRunsRoutes, { prefix: '/:feedId/runs' });
};
