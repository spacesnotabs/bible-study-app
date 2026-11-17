import { bibleBooks, findBibleBook } from './books';

export interface ChapterReference {
  readonly bookId: string;
  readonly chapter: number;
}

export const firstChapter: ChapterReference = { bookId: 'GEN', chapter: 1 };

export function isChapterReference(value: unknown): value is ChapterReference {
  if (typeof value !== 'object' || value === null) return false;
  if (!('bookId' in value) || typeof value.bookId !== 'string') return false;
  if (!('chapter' in value) || typeof value.chapter !== 'number') return false;

  const book = findBibleBook(value.bookId);
  return (
    !!book &&
    Number.isInteger(value.chapter) &&
    value.chapter >= 1 &&
    value.chapter <= book.chapterCount
  );
}

/** Move across chapter and book boundaries; stop at either end of the Bible. */
export function adjacentChapter(
  position: ChapterReference,
  direction: -1 | 1,
): ChapterReference | null {
  if (!isChapterReference(position)) return null;
  const index = bibleBooks.findIndex((book) => book.id === position.bookId);
  const book = bibleBooks[index];
  if (!book) return null;

  const chapter = position.chapter + direction;
  if (chapter >= 1 && chapter <= book.chapterCount) {
    return { bookId: book.id, chapter };
  }

  const neighbor = bibleBooks[index + direction];
  if (!neighbor) return null;
  return {
    bookId: neighbor.id,
    chapter: direction === 1 ? 1 : neighbor.chapterCount,
  };
}
