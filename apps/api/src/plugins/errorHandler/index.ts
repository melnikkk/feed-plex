import type { FastifyError } from 'fastify';
import fp from 'fastify-plugin';
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
} from 'fastify-type-provider-zod';
import { findUniqueViolation, uniqueViolationMessage } from './uniqueViolation';

export const errorHandlerPlugin = fp(async (app) => {
  app.setErrorHandler<FastifyError>((error, request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.code(400).send({ error: 'Validation Error', details: error.validation });
    }

    if (isResponseSerializationError(error)) {
      request.log.error({ err: error }, 'response serialization failed');

      return reply.code(500).send({ error: 'Internal Server Error' });
    }

    const uniqueViolation = findUniqueViolation(error);

    if (uniqueViolation) {
      request.log.info({ err: error }, 'unique constraint violated');

      return reply.code(409).send({ error: uniqueViolationMessage(uniqueViolation) });
    }

    request.log.error({ err: error }, 'unhandled error');

    const statusCode = error.statusCode ?? 500;

    if (statusCode >= 500) {
      return reply.code(statusCode).send({ error: 'Internal Server Error' });
    }

    return reply.code(statusCode).send({ error: error.message });
  });
});
