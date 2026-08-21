import { createFeedInputSchema, updateFeedInputSchema } from '@feed-plex/contracts';
import { createFeed, deleteFeed, getFeedById, listFeeds, updateFeed } from '@feed-plex/database';
import type { FastifyReply, FastifyRequest } from 'fastify';

export const createFeedHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = createFeedInputSchema.parse(request.body);
  const feed = await createFeed(request.server.db, body);

  return reply.code(201).send(feed);
};

export const listFeedsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const feeds = await listFeeds(request.server.db);

  return reply.send(feeds);
};

export const getFeedHandler = async (
  request: FastifyRequest<{ Params: { feedId: string } }>,
  reply: FastifyReply,
) => {
  const feed = await getFeedById(request.server.db, request.params.feedId);

  if (!feed) {
    return reply.code(404).send({ error: 'Feed not found' });
  }

  return reply.send(feed);
};

export const updateFeedHandler = async (
  request: FastifyRequest<{ Params: { feedId: string } }>,
  reply: FastifyReply,
) => {
  const body = updateFeedInputSchema.parse(request.body);
  const feed = await updateFeed(request.server.db, request.params.feedId, body);

  if (!feed) {
    return reply.code(404).send({ error: 'Feed not found' });
  }

  return reply.send(feed);
};

export const deleteFeedHandler = async (
  request: FastifyRequest<{ Params: { feedId: string } }>,
  reply: FastifyReply,
) => {
  const deleted = await deleteFeed(request.server.db, request.params.feedId);

  if (!deleted) {
    return reply.code(404).send({ error: 'Feed not found' });
  }

  return reply.code(204).send();
};
