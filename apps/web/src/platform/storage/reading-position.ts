import { isChapterReference } from '@bible-study/domain';
import type { ChapterReference } from '@bible-study/domain';

const key = 'bible-study:reading-position:v1';

export function loadReadingPosition(): ChapterReference | null {
  try {
    const saved: unknown = JSON.parse(
      window.localStorage.getItem(key) ?? 'null',
    );
    return isChapterReference(saved) ? saved : null;
  } catch {
    return null;
  }
}

export function saveReadingPosition(position: ChapterReference): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(position));
  } catch {
    // Reading still works when storage is disabled, unavailable, or full.
  }
}
