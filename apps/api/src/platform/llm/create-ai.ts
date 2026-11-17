import { generateImage, generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import type { AiServices, ModelUsage } from '../../modules/study/models';
import type {
  AiConfiguration,
  ImageProvider,
  ModelConfiguration,
  TextProvider,
} from './config';

function connection(config: ModelConfiguration<string>) {
  return {
    ...(config.apiKey ? { apiKey: config.apiKey } : {}),
    ...(config.baseURL ? { baseURL: config.baseURL } : {}),
  };
}

function textModel(config: ModelConfiguration<TextProvider>) {
  const options = connection(config);
  switch (config.provider) {
    case 'openai':
      return createOpenAI(options).languageModel(config.model);
    case 'anthropic':
      return createAnthropic(options).languageModel(config.model);
    case 'google':
      return createGoogleGenerativeAI(options).languageModel(config.model);
    case 'openai-compatible':
      return createOpenAICompatible({
        ...options,
        name: 'configured-compatible',
        baseURL: config.baseURL!,
      }).languageModel(config.model);
  }
}

function imageModel(config: ModelConfiguration<ImageProvider>) {
  const options = connection(config);
  switch (config.provider) {
    case 'openai':
      return createOpenAI(options).imageModel(config.model);
    case 'google':
      return createGoogleGenerativeAI(options).image(config.model);
    case 'openai-compatible':
      return createOpenAICompatible({
        ...options,
        name: 'configured-compatible',
        baseURL: config.baseURL!,
      }).imageModel(config.model);
  }
}

function usage(value: {
  inputTokens?: number | undefined;
  outputTokens?: number | undefined;
  totalTokens?: number | undefined;
}): ModelUsage {
  return {
    inputTokens: value.inputTokens ?? null,
    outputTokens: value.outputTokens ?? null,
    totalTokens: value.totalTokens ?? null,
  };
}

function requestSignal(signal: AbortSignal | undefined, timeoutMs: number) {
  signal?.throwIfAborted();
  const timeout = AbortSignal.timeout(timeoutMs);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

function validatePrompt(
  prompt: string,
  system: string | undefined,
  maxCharacters: number,
) {
  if (typeof prompt !== 'string' || !prompt.trim())
    throw new Error('A nonempty prompt is required.');
  if (prompt.length + (system?.length ?? 0) > maxCharacters)
    throw new Error('The prompt exceeds the configured character limit.');
}

/** Construct direct provider clients without making network calls. */
export function createAiServices(config: AiConfiguration): AiServices {
  const text = config.text;
  const images = config.images;
  const selectedTextModel = text ? textModel(text) : null;
  const selectedImageModel = images ? imageModel(images) : null;

  return {
    text:
      text && selectedTextModel
        ? {
            async generate(request) {
              validatePrompt(
                request.prompt,
                request.system,
                config.maxPromptCharacters,
              );
              const requestedTokens =
                request.maxOutputTokens ?? config.maxOutputTokens;
              if (!Number.isInteger(requestedTokens) || requestedTokens < 1)
                throw new Error('maxOutputTokens must be a positive integer.');
              const result = await generateText({
                model: selectedTextModel,
                prompt: request.prompt,
                ...(request.system !== undefined
                  ? { system: request.system }
                  : {}),
                maxOutputTokens: Math.min(
                  requestedTokens,
                  config.maxOutputTokens,
                ),
                maxRetries: 0,
                abortSignal: requestSignal(
                  request.signal,
                  config.textTimeoutMs,
                ),
              });
              return {
                text: result.text,
                provider: text.provider,
                model: text.model,
                finishReason: result.finishReason,
                usage: usage(result.usage),
              };
            },
          }
        : null,
    images:
      images && selectedImageModel
        ? {
            async generate(request) {
              validatePrompt(
                request.prompt,
                undefined,
                config.maxPromptCharacters,
              );
              if (request.size && request.aspectRatio)
                throw new Error(
                  'Choose an image size or an aspect ratio, not both.',
                );
              if (request.size && !/^[1-9]\d*x[1-9]\d*$/.test(request.size))
                throw new Error('Invalid image size.');
              if (
                request.aspectRatio &&
                !/^[1-9]\d*:[1-9]\d*$/.test(request.aspectRatio)
              )
                throw new Error('Invalid image aspect ratio.');
              const result = await generateImage({
                model: selectedImageModel,
                prompt: request.prompt,
                n: 1,
                maxRetries: 0,
                ...(request.size ? { size: request.size } : {}),
                ...(request.aspectRatio
                  ? { aspectRatio: request.aspectRatio }
                  : {}),
                abortSignal: requestSignal(
                  request.signal,
                  config.imageTimeoutMs,
                ),
              });
              return {
                provider: images.provider,
                model: images.model,
                images: result.images.map((image) => ({
                  bytes: image.uint8Array,
                  mediaType: image.mediaType,
                })),
                usage: usage(result.usage),
              };
            },
          }
        : null,
  };
}
