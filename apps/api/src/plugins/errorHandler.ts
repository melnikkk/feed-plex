import type { FastifyError } from 'fastify';
import fp from 'fastify-plugin';
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
} from 'fastify-type-provider-zod';

export const errorHandlerPlugin = fp(async (app) => {
  app.setErrorHandler<FastifyError>((error, request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.code(400).send({ error: 'Validation Error', details: error.validation });
    }

    if (isResponseSerializationError(error)) {
      request.log.error({ err: error }, 'response serialization failed');

      return reply.code(500).send({ error: 'Internal Server Error' });
    }

    request.log.error({ err: error }, 'unhandled error');

    return reply.code(error.statusCode ?? 500).send({ error: error.message });
  });
});
