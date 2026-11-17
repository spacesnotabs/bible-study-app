import { describe, expect, it } from 'vitest';
import { readAiConfig } from './config';

describe('AI configuration', () => {
  it('keeps both capabilities disabled without credentials or model IDs', () => {
    const config = readAiConfig({});
    expect(config.text).toBeNull();
    expect(config.images).toBeNull();
  });

  it('selects providers, models, and credentials independently for text and images', () => {
    const config = readAiConfig({
      AI_TEXT_PROVIDER: 'anthropic',
      AI_TEXT_MODEL: 'study-model',
      ANTHROPIC_API_KEY: 'test-text-credential',
      AI_IMAGE_PROVIDER: 'google',
      AI_IMAGE_MODEL: 'image-model',
      GOOGLE_GENERATIVE_AI_API_KEY: 'test-image-credential',
    });
    expect(config.text).toEqual({
      provider: 'anthropic',
      model: 'study-model',
      apiKey: 'test-text-credential',
    });
    expect(config.images).toEqual({
      provider: 'google',
      model: 'image-model',
      apiKey: 'test-image-credential',
    });
  });

  it('lets a role override the conventional provider key', () => {
    const config = readAiConfig({
      AI_TEXT_PROVIDER: 'openai',
      AI_TEXT_MODEL: 'study-model',
      OPENAI_API_KEY: 'default-test-credential',
      AI_TEXT_API_KEY: 'override-test-credential',
    });
    expect(config.text?.apiKey).toBe('override-test-credential');
  });

  it('supports a local compatible endpoint without a key', () => {
    expect(
      readAiConfig({
        AI_TEXT_PROVIDER: 'openai-compatible',
        AI_TEXT_MODEL: 'local-model',
        AI_TEXT_BASE_URL: 'http://127.0.0.1:11434/v1',
      }).text,
    ).toEqual({
      provider: 'openai-compatible',
      model: 'local-model',
      baseURL: 'http://127.0.0.1:11434/v1',
    });
  });

  it.each([
    { AI_TEXT_PROVIDER: 'openai' },
    { AI_TEXT_PROVIDER: 'openai', AI_TEXT_MODEL: 'study-model' },
    { AI_TEXT_PROVIDER: 'openai-compatible', AI_TEXT_MODEL: 'local-model' },
    { AI_IMAGE_PROVIDER: 'anthropic' },
    { AI_MAX_OUTPUT_TOKENS: '0' },
    { AI_TEXT_TIMEOUT_MS: 'not-a-number' },
    {
      AI_IMAGE_PROVIDER: 'openai-compatible',
      AI_IMAGE_MODEL: 'image-model',
      AI_IMAGE_BASE_URL: 'file:///tmp/model',
    },
  ])(
    'rejects invalid or incomplete server configuration: %j',
    (environment) => {
      expect(() => readAiConfig(environment)).toThrow();
    },
  );

  it('does not include bad configuration values or credentials in errors', () => {
    for (const environment of [
      { AI_TEXT_PROVIDER: 'sensitive-test-value' },
      {
        AI_TEXT_PROVIDER: 'openai-compatible',
        AI_TEXT_MODEL: 'local',
        AI_TEXT_BASE_URL: 'https://user:sensitive-test-value@example.com/v1',
      },
    ]) {
      let failure: unknown;
      try {
        readAiConfig(environment);
      } catch (error) {
        failure = error;
      }
      expect(failure).toBeInstanceOf(Error);
      expect(String(failure)).not.toContain('sensitive-test-value');
    }
  });
});
