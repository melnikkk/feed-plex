import type { FastifyPluginAsync } from 'fastify';
import {
  createFeedHandler,
  deleteFeedHandler,
  getFeedHandler,
  listFeedsHandler,
  updateFeedHandler,
} from '@/routes/feeds/handlers';
import { feedRunsRoutes } from '@/routes/feeds/runs/route';

export const feedsRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', createFeedHandler);
  app.get('/', listFeedsHandler);

  app.get<{ Params: { feedId: string } }>('/:feedId', getFeedHandler);
  app.put<{ Params: { feedId: string } }>('/:feedId', updateFeedHandler);
  app.delete<{ Params: { feedId: string } }>('/:feedId', deleteFeedHandler);

  app.register(feedRunsRoutes, { prefix: '/:feedId/runs' });
};
