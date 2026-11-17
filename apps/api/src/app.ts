import Fastify from 'fastify';
import type { FastifyServerOptions } from 'fastify';
import type { AiCapabilities, HealthResponse } from '@bible-study/contracts';
import type { AiServices } from './modules/study/models';

/** Build the HTTP application without opening a socket or calling external services. */
export function buildApp(
  options: FastifyServerOptions = {},
  services: { ai: AiServices } = { ai: { text: null, images: null } },
) {
  const app = Fastify(options);

  app.get('/api/v1/health', async (): Promise<HealthResponse> => ({
    status: 'ok',
  }));

  // Availability metadata only. Generation remains an internal server capability
  // until a study route has access checks and durable usage accounting.
  app.get('/api/v1/ai/capabilities', async (): Promise<AiCapabilities> => ({
    textGeneration: services.ai.text !== null,
    imageGeneration: services.ai.images !== null,
  }));

  return app;
}
