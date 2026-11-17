import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AiCapabilitiesSchema,
  HealthResponseSchema,
} from '@bible-study/contracts';
import { buildApp } from './app';

describe('public API foundation', () => {
  let app: ReturnType<typeof buildApp>;

  afterEach(async () => {
    await app?.close();
  });

  it('serves a valid health response without login or external credentials', async () => {
    app = buildApp({ logger: false });
    const response = await app.inject({ method: 'GET', url: '/api/v1/health' });

    expect(response.statusCode).toBe(200);
    expect(HealthResponseSchema.parse(response.json())).toEqual({
      status: 'ok',
    });
    expect(response.headers['set-cookie']).toBeUndefined();
  });

  it('reports disabled capabilities by default and exposes no generation route', async () => {
    app = buildApp({ logger: false });
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/ai/capabilities',
    });
    expect(response.statusCode).toBe(200);
    expect(AiCapabilitiesSchema.parse(response.json())).toEqual({
      textGeneration: false,
      imageGeneration: false,
    });
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/api/v1/ai/text',
          payload: { prompt: 'Question' },
        })
      ).statusCode,
    ).toBe(404);
  });

  it('reports only availability without invoking a configured model', async () => {
    const generate = vi.fn();
    app = buildApp(
      { logger: false },
      { ai: { text: { generate }, images: null } },
    );
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/ai/capabilities',
    });
    expect(response.json()).toEqual({
      textGeneration: true,
      imageGeneration: false,
    });
    expect(generate).not.toHaveBeenCalled();
  });
});
