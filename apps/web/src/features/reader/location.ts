import { isChapterReference } from '@bible-study/domain';
import type { ChapterReference } from '@bible-study/domain';

export function parseReadingHash(hash: string): ChapterReference | null {
  const match = /^#([A-Za-z0-9]{3})\/(\d+)$/.exec(hash);
  if (!match?.[1] || !match[2]) return null;
  const position = {
    bookId: match[1].toUpperCase(),
    chapter: Number(match[2]),
  };
  return isChapterReference(position) ? position : null;
}

export function readingHash(position: ChapterReference): string {
  return `#${position.bookId}/${position.chapter}`;
}
