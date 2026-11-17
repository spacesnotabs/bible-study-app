import { describe, expect, it } from 'vitest';
import { readConfig } from './config';

describe('API configuration', () => {
  it('starts locally without external service credentials', () => {
    expect(readConfig({})).toEqual({
      HOST: '127.0.0.1',
      PORT: 3001,
      LOG_LEVEL: 'info',
    });
  });

  it.each(['', 'not-a-port', '0', '65536', '3001.5'])(
    'rejects an invalid port: %j',
    (port) => {
      expect(() => readConfig({ PORT: port })).toThrow();
    },
  );
});
