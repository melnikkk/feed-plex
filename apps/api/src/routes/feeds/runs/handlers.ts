import { getFeedById, getSuggestionRunResult } from '@feed-plex/database';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { enqueueRelevantArticlesRun, relevantArticlesQueue } from '@/routes/feeds/runs/queue';
import { toJobStatus } from '@/routes/feeds/runs/utils';

export const createRunHandler = async (
  request: FastifyRequest<{ Params: { feedId: string } }>,
  reply: FastifyReply,
) => {
  const feed = await getFeedById(request.server.db, request.params.feedId);

  if (!feed) {
    return reply.code(404).send({ error: 'Feed not found' });
  }

  const jobId = await enqueueRelevantArticlesRun(feed.id);

  return reply.code(202).send({ jobId });
};

export const getRunHandler = async (
  request: FastifyRequest<{ Params: { feedId: string; jobId: string } }>,
  reply: FastifyReply,
) => {
  const job = await relevantArticlesQueue.getJob(request.params.jobId);

  if (!job || job.data.feedId !== request.params.feedId) {
    const result = await getSuggestionRunResult(
      request.server.db,
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

  if (!job.id) {
    throw new Error('Job is missing an id');
  }

  if (status === 'completed') {
    return reply.send({ jobId: job.id, status, result: job.returnvalue });
  }

  if (status === 'failed') {
    return reply.send({ jobId: job.id, status, error: job.failedReason });
  }

  return reply.send({ jobId: job.id, status });
};
