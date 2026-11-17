import Fastify from 'fastify';
import type { FastifyServerOptions } from 'fastify';
import type { HealthResponse } from '@bible-study/contracts';

/** Build the HTTP application without opening a socket or calling external services. */
export function buildApp(options: FastifyServerOptions = {}) {
  const app = Fastify(options);

  app.get('/api/v1/health', async (): Promise<HealthResponse> => ({
    status: 'ok',
  }));

  return app;
}
