import { getFeedById, getLatestSuggestionRun } from '@feed-plex/database';
import type { FastifyReply, FastifyRequest } from 'fastify';

export const listFeedArticlesHandler = async (
  request: FastifyRequest<{ Params: { feedId: string } }>,
  reply: FastifyReply,
) => {
  const feed = await getFeedById(request.server.db, request.params.feedId);

  if (!feed) {
    return reply.code(404).send({ error: 'Feed not found' });
  }

  const run = await getLatestSuggestionRun(request.server.db, feed.id);

  if (!run) {
    return reply.send({ runId: null, completedAt: null, articles: [] });
  }

  return reply.send(run);
};
