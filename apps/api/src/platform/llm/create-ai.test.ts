import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generateImage, generateText } from 'ai';
import { createAiServices } from './create-ai';
import { readAiConfig } from './config';

vi.mock('ai', () => ({ generateText: vi.fn(), generateImage: vi.fn() }));

const textResult = {
  text: 'A source-backed explanation.',
  finishReason: 'stop',
  usage: { inputTokens: 20, outputTokens: 10, totalTokens: 30 },
} as Awaited<ReturnType<typeof generateText>>;
const imageResult = {
  images: [{ uint8Array: new Uint8Array([1, 2]), mediaType: 'image/png' }],
  usage: {
    inputTokens: undefined,
    outputTokens: undefined,
    totalTokens: undefined,
  },
} as Awaited<ReturnType<typeof generateImage>>;

function configured(environment: NodeJS.ProcessEnv = {}) {
  return createAiServices(
    readAiConfig({
      AI_TEXT_PROVIDER: 'openai',
      AI_TEXT_MODEL: 'study-model',
      AI_TEXT_API_KEY: 'test-credential',
      AI_IMAGE_PROVIDER: 'openai',
      AI_IMAGE_MODEL: 'image-model',
      AI_IMAGE_API_KEY: 'test-credential',
      ...environment,
    }),
  );
}

beforeEach(() => {
  vi.mocked(generateText).mockReset().mockResolvedValue(textResult);
  vi.mocked(generateImage).mockReset().mockResolvedValue(imageResult);
});

describe('model adapters', () => {
  it('constructs disabled services without any model calls', () => {
    expect(createAiServices(readAiConfig({}))).toEqual({
      text: null,
      images: null,
    });
    expect(generateText).not.toHaveBeenCalled();
    expect(generateImage).not.toHaveBeenCalled();
  });

  it.each(['openai', 'anthropic', 'google', 'openai-compatible'])(
    'creates a direct text model for %s without routing through a gateway',
    async (provider) => {
      const ai = configured({
        AI_TEXT_PROVIDER: provider,
        AI_TEXT_BASE_URL: 'https://models.example/v1',
      });
      expect(generateText).not.toHaveBeenCalled();
      const result = await ai.text!.generate({
        prompt: 'Explain this passage.',
      });
      expect(result.provider).toBe(provider);
      expect(result.model).toBe('study-model');
      const model = vi.mocked(generateText).mock.calls[0]?.[0].model;
      expect(typeof model).toBe('object');
      expect((model as { modelId: string }).modelId).toBe('study-model');
    },
  );

  it.each(['openai', 'google', 'openai-compatible'])(
    'uses a separate image model for %s and returns normalized binary output',
    async (provider) => {
      const ai = configured({
        AI_IMAGE_PROVIDER: provider,
        AI_IMAGE_BASE_URL: 'https://images.example/v1',
      });
      const result = await ai.images!.generate({
        prompt: 'An ancient olive press.',
        size: '1024x1024',
      });
      expect(result.provider).toBe(provider);
      expect(result.images[0]).toEqual({
        bytes: new Uint8Array([1, 2]),
        mediaType: 'image/png',
      });
      expect(result.usage).toEqual({
        inputTokens: null,
        outputTokens: null,
        totalTokens: null,
      });
      expect(generateText).not.toHaveBeenCalled();
      expect(generateImage).toHaveBeenCalledWith(
        expect.objectContaining({ n: 1, maxRetries: 0, size: '1024x1024' }),
      );
      const model = vi.mocked(generateImage).mock.calls[0]?.[0].model;
      expect((model as { modelId: string }).modelId).toBe('image-model');
    },
  );

  it('bounds output tokens, preserves the system prompt, and records provider usage', async () => {
    const ai = configured({ AI_MAX_OUTPUT_TOKENS: '400' });
    const result = await ai.text!.generate({
      prompt: 'A question',
      system: 'Study instructions',
      maxOutputTokens: 9999,
    });
    expect(generateText).toHaveBeenCalledWith(
      expect.objectContaining({
        system: 'Study instructions',
        maxOutputTokens: 400,
        maxRetries: 0,
      }),
    );
    expect(result.usage.totalTokens).toBe(30);
  });

  it('rejects invalid prompts and conflicting image options before model calls', async () => {
    const ai = configured({ AI_MAX_PROMPT_CHARACTERS: '10' });
    await expect(ai.text!.generate({ prompt: ' ' })).rejects.toThrow();
    await expect(
      ai.text!.generate({ prompt: '123456', system: '123456' }),
    ).rejects.toThrow();
    await expect(
      ai.text!.generate({ prompt: 'Question', maxOutputTokens: 0 }),
    ).rejects.toThrow();
    await expect(
      ai.images!.generate({
        prompt: 'Picture',
        size: '1024x1024',
        aspectRatio: '1:1',
      }),
    ).rejects.toThrow();
    expect(generateText).not.toHaveBeenCalled();
    expect(generateImage).not.toHaveBeenCalled();
  });

  it('never starts an already-cancelled request and propagates later cancellation', async () => {
    const ai = configured();
    const controller = new AbortController();
    controller.abort();
    await expect(
      ai.text!.generate({ prompt: 'Question', signal: controller.signal }),
    ).rejects.toThrow();
    await expect(
      ai.images!.generate({ prompt: 'Picture', signal: controller.signal }),
    ).rejects.toThrow();
    expect(generateText).not.toHaveBeenCalled();
    expect(generateImage).not.toHaveBeenCalled();
    const active = new AbortController();
    await ai.text!.generate({ prompt: 'Question', signal: active.signal });
    const signal = vi.mocked(generateText).mock.calls[0]?.[0].abortSignal;
    active.abort();
    expect(signal?.aborted).toBe(true);
  });

  it('does not retry a failed provider call', async () => {
    vi.mocked(generateText).mockRejectedValue(
      new Error('Provider unavailable'),
    );
    await expect(
      configured().text!.generate({ prompt: 'Question' }),
    ).rejects.toThrow('Provider unavailable');
    expect(generateText).toHaveBeenCalledTimes(1);
  });

  it('passes configured deadlines to both model capabilities', async () => {
    const ai = configured({
      AI_TEXT_TIMEOUT_MS: '5',
      AI_IMAGE_TIMEOUT_MS: '5',
    });
    await ai.text!.generate({ prompt: 'Question' });
    await ai.images!.generate({ prompt: 'Picture' });
    await vi.waitFor(() => {
      expect(
        vi.mocked(generateText).mock.calls[0]?.[0].abortSignal?.aborted,
      ).toBe(true);
      expect(
        vi.mocked(generateImage).mock.calls[0]?.[0].abortSignal?.aborted,
      ).toBe(true);
    });
  });
});
