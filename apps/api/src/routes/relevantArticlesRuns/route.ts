import type { FastifyPluginAsync } from 'fastify';
import { relevantArticlesQueue } from '@/routes/relevantArticlesRuns/queue';
import { createRunBodySchema } from '@/routes/relevantArticlesRuns/schema';
import { toJobStatus } from '@/routes/relevantArticlesRuns/utils';

export const relevantArticlesRunsRoutes: FastifyPluginAsync = async (app) => {
  app.post('/runs', async (request, reply) => {
    const body = createRunBodySchema.parse(request.body);

    const job = await relevantArticlesQueue.add('run', {
      sources: body?.sources,
      interests: body?.interests,
    });

    return reply.code(202).send({ jobId: job.id });
  });

  app.get<{ Params: { jobId: string } }>('/runs/:jobId', async (request, reply) => {
    const job = await relevantArticlesQueue.getJob(request.params.jobId);

    if (!job) {
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
