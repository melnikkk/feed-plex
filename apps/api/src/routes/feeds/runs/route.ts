import { jobStatusResponseSchema } from '@feed-plex/contracts';
import { errorResponseSchema } from '@/routes/feeds/schema';
import { createRunHandler, getRunHandler } from '@/routes/feeds/runs/handlers';
import {
  createRunResponseSchema,
  feedRunJobParamsSchema,
  feedRunParamsSchema,
} from '@/routes/feeds/runs/schema';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

export const feedRunsRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/',
    {
      schema: {
        params: feedRunParamsSchema,
        response: { 202: createRunResponseSchema, 404: errorResponseSchema },
      },
    },
    createRunHandler,
  );

  app.get(
    '/:jobId',
    {
      schema: {
        params: feedRunJobParamsSchema,
        response: { 200: jobStatusResponseSchema, 404: errorResponseSchema },
      },
    },
    getRunHandler,
  );
};
