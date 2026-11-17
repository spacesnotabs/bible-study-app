/** Quiet reading and proactive study share the same Scripture workspace. */
export type ReadingMode = 'reading' | 'guided';

/** A stable translation identifier, separate from a display name. */
export type TranslationId = string;

/**
 * A passage anchor independent of a selected translation.
 * The importer must define its canonical book IDs and versification mapping.
 * Validate actual chapter/verse ranges against the imported corpus.
 */
export interface PassageReference {
  readonly bookId: string;
  readonly chapter: number;
  readonly verseStart?: number;
  readonly verseEnd?: number;
}
export { bibleBooks, findBibleBook } from './books';
export type { BibleBook } from './books';
export { firstChapter, isChapterReference, adjacentChapter } from './chapters';
export type { ChapterReference } from './chapters';
