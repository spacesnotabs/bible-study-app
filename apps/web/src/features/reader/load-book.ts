import { BibleBookTextSchema } from '@bible-study/contracts';
import { findBibleBook } from '@bible-study/domain';

export async function loadBook(bookId: string, signal: AbortSignal) {
  const book = findBibleBook(bookId);
  if (!book) throw new Error('Unknown Bible book.');

  const response = await fetch(
    `${import.meta.env.BASE_URL}bibles/bsb/${book.id}.json`,
    { signal },
  );
  if (!response.ok) throw new Error('Could not load this book.');
  const data = BibleBookTextSchema.parse(await response.json());
  if (data.bookId !== book.id || data.chapters.length !== book.chapterCount) {
    throw new Error('This book’s content is incomplete.');
  }
  return data;
}
