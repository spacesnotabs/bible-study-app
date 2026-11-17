import { z } from 'zod';

const providers = [
  'openai',
  'anthropic',
  'google',
  'openai-compatible',
] as const;
export type TextProvider = (typeof providers)[number];
export type ImageProvider = Exclude<TextProvider, 'anthropic'>;

export interface ModelConfiguration<P extends string> {
  readonly provider: P;
  readonly model: string;
  readonly apiKey?: string;
  readonly baseURL?: string;
}

export interface AiConfiguration {
  readonly text: ModelConfiguration<TextProvider> | null;
  readonly images: ModelConfiguration<ImageProvider> | null;
  readonly maxOutputTokens: number;
  readonly maxPromptCharacters: number;
  readonly textTimeoutMs: number;
  readonly imageTimeoutMs: number;
}

const SettingsSchema = z.object({
  AI_TEXT_PROVIDER: z.enum(['disabled', ...providers]).default('disabled'),
  AI_IMAGE_PROVIDER: z
    .enum(['disabled', 'openai', 'google', 'openai-compatible'])
    .default('disabled'),
  AI_MAX_OUTPUT_TOKENS: z.coerce.number().int().min(1).max(32768).default(1200),
  AI_MAX_PROMPT_CHARACTERS: z.coerce
    .number()
    .int()
    .min(1)
    .max(200000)
    .default(50000),
  AI_TEXT_TIMEOUT_MS: z.coerce.number().int().min(1).max(300000).default(30000),
  AI_IMAGE_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .min(1)
    .max(300000)
    .default(120000),
});

const conventionalKey = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  google: 'GOOGLE_GENERATIVE_AI_API_KEY',
  'openai-compatible': 'OPENAI_COMPATIBLE_API_KEY',
} as const;

/** Read only server environment configuration; do not log or serialize this result. */
export function readAiConfig(environment: NodeJS.ProcessEnv): AiConfiguration {
  const parsed = SettingsSchema.safeParse(environment);
  if (!parsed.success) {
    const fields = [
      ...new Set(parsed.error.issues.map((issue) => issue.path[0])),
    ];
    throw new Error(`Invalid AI configuration fields: ${fields.join(', ')}`);
  }
  const values = parsed.data;

  function model<P extends TextProvider>(
    role: 'TEXT' | 'IMAGE',
    provider: P | 'disabled',
  ): ModelConfiguration<P> | null {
    if (provider === 'disabled') return null;
    const prefix = `AI_${role}`;
    const modelId = environment[`${prefix}_MODEL`]?.trim();
    if (!modelId)
      throw new Error(
        `${prefix}_MODEL is required when ${prefix}_PROVIDER is enabled.`,
      );
    const apiKey =
      environment[`${prefix}_API_KEY`]?.trim() ||
      environment[conventionalKey[provider]]?.trim();
    if (!apiKey && provider !== 'openai-compatible') {
      throw new Error(
        `${prefix}_API_KEY or ${conventionalKey[provider]} is required.`,
      );
    }
    const baseURL = environment[`${prefix}_BASE_URL`]?.trim();
    if (provider === 'openai-compatible' && !baseURL) {
      throw new Error(
        `${prefix}_BASE_URL is required for an OpenAI-compatible provider.`,
      );
    }
    if (baseURL) {
      try {
        const url = new URL(baseURL);
        if (
          !['https:', 'http:'].includes(url.protocol) ||
          url.username ||
          url.password ||
          url.search ||
          url.hash
        ) {
          throw new Error();
        }
      } catch {
        throw new Error(
          `${prefix}_BASE_URL must be an HTTP(S) URL without embedded credentials, a query, or a fragment.`,
        );
      }
    }
    return {
      provider,
      model: modelId,
      ...(apiKey ? { apiKey } : {}),
      ...(baseURL ? { baseURL } : {}),
    };
  }

  return {
    text: model('TEXT', values.AI_TEXT_PROVIDER),
    images: model('IMAGE', values.AI_IMAGE_PROVIDER),
    maxOutputTokens: values.AI_MAX_OUTPUT_TOKENS,
    maxPromptCharacters: values.AI_MAX_PROMPT_CHARACTERS,
    textTimeoutMs: values.AI_TEXT_TIMEOUT_MS,
    imageTimeoutMs: values.AI_IMAGE_TIMEOUT_MS,
  };
}
