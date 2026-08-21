import { getFeedById, getSuggestionRunResult } from '@feed-plex/database';
import type { FastifyPluginAsync } from 'fastify';
import { relevantArticlesQueue } from '@/routes/feeds/runs/queue';
import { toJobStatus } from '@/routes/feeds/runs/utils';

export const feedRunsRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Params: { feedId: string } }>('/', async (request, reply) => {
    const feed = await getFeedById(app.db, request.params.feedId);

    if (!feed) {
      return reply.code(404).send({ error: 'Feed not found' });
    }

    const job = await relevantArticlesQueue.add('run', { feedId: feed.id });

    return reply.code(202).send({ jobId: job.id });
  });

  app.get<{ Params: { feedId: string; jobId: string } }>('/:jobId', async (request, reply) => {
    const job = await relevantArticlesQueue.getJob(request.params.jobId);

    if (!job || job.data.feedId !== request.params.feedId) {
      const result = await getSuggestionRunResult(
        app.db,
        request.params.jobId,
        request.params.feedId,
      );

      if (result) {
        return reply.send({ jobId: request.params.jobId, status: 'completed', result });
      }

      return reply.code(404).send({ error: 'Job not found' });
    }

    const state = await job.getState();
    const status = toJobStatus(state);

    if (status === 'completed') {
      return reply.send({ jobId: job.id, status, result: job.returnvalue });
    }

    if (status === 'failed') {
      return reply.send({ jobId: job.id, status, error: job.failedReason });
    }

    return reply.send({ jobId: job.id, status });
  });
};
