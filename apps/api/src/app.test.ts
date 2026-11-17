import { afterEach, describe, expect, it } from 'vitest';
import { HealthResponseSchema } from '@bible-study/contracts';
import { buildApp } from './app';

describe('public API foundation', () => {
  const app = buildApp({ logger: false });

  afterEach(async () => {
    await app.close();
  });

  it('serves a valid health response without login or external credentials', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/v1/health' });

    expect(response.statusCode).toBe(200);
    expect(HealthResponseSchema.parse(response.json())).toEqual({
      status: 'ok',
    });
    expect(response.headers['set-cookie']).toBeUndefined();
  });
});
