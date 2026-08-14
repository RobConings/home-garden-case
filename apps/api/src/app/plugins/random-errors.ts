import { FastifyError, FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

/**
 * This plugin randomly throws errors to simulate API failures.
 * Useful for testing error handling and retry logic.
 */
export default fp(async function (fastify: FastifyInstance) {
  const enabled = process.env.RANDOM_ERRORS_ENABLED === 'true';
  const configuredErrorRate = Number(process.env.RANDOM_ERRORS_RATE ?? 10);
  const errorRate = Number.isFinite(configuredErrorRate) ? configuredErrorRate : 10;
  const rate = Math.max(0, Math.min(100, errorRate));
  const statusCode = 500;

  if (!enabled) {
    fastify.log.info('Random errors plugin is disabled');
    return;
  }

  fastify.log.info(
    `Random errors plugin enabled with ${rate}% error rate and status code ${statusCode}`,
  );

  fastify.addHook('onRequest', async (request) => {
    // Never throw errors on docs routes
    const url = request.url;
    if (url.startsWith('/docs')) {
      return;
    }

    const randomValue = Math.random() * 100;
    if (randomValue < rate) {
      fastify.log.info(
        `Random error thrown with ${rate}% error rate and status code ${statusCode}`,
      );
      const error = new Error('Random error thrown') as FastifyError;
      error.statusCode = statusCode;
      throw error;
    }
  });
});
