/** Application ports: SDK and provider objects stay outside study use cases. */
export interface ModelUsage {
  readonly inputTokens: number | null;
  readonly outputTokens: number | null;
  readonly totalTokens: number | null;
}

export interface TextRequest {
  readonly prompt: string;
  readonly system?: string;
  readonly maxOutputTokens?: number;
  readonly signal?: AbortSignal;
}

export interface TextResult {
  readonly text: string;
  readonly provider: string;
  readonly model: string;
  readonly finishReason: string;
  readonly usage: ModelUsage;
}

export interface ImageRequest {
  readonly prompt: string;
  readonly size?: `${number}x${number}`;
  readonly aspectRatio?: `${number}:${number}`;
  readonly signal?: AbortSignal;
}

export interface ImageResult {
  readonly provider: string;
  readonly model: string;
  readonly images: ReadonlyArray<{
    readonly bytes: Uint8Array;
    readonly mediaType: string;
  }>;
  readonly usage: ModelUsage;
}

export interface TextGenerator {
  generate(request: TextRequest): Promise<TextResult>;
}

export interface ImageGenerator {
  generate(request: ImageRequest): Promise<ImageResult>;
}

export interface AiServices {
  readonly text: TextGenerator | null;
  readonly images: ImageGenerator | null;
}
