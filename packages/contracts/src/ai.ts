import { z } from 'zod';

/** Configuration availability only; this does not grant permission to spend. */
export const AiCapabilitiesSchema = z.object({
  textGeneration: z.boolean(),
  imageGeneration: z.boolean(),
});

export type AiCapabilities = z.infer<typeof AiCapabilitiesSchema>;
