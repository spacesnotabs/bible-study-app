import { z } from 'zod';

export const BibleVerseSchema = z.object({
  number: z.number().int().positive(),
  text: z.string().min(1),
});

/** Static book assets use this contract; chapters are indexed from zero. */
export const BibleBookTextSchema = z.object({
  bookId: z.string().min(1),
  chapters: z.array(z.array(BibleVerseSchema).min(1)).min(1),
});

export type BibleBookText = z.infer<typeof BibleBookTextSchema>;
