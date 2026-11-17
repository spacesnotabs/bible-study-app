import { describe, expect, it } from 'vitest';
import { adjacentChapter, isChapterReference } from './chapters';

describe('chapter navigation', () => {
  it('moves across book and testament boundaries in either direction', () => {
    expect(adjacentChapter({ bookId: 'GEN', chapter: 50 }, 1)).toEqual({
      bookId: 'EXO',
      chapter: 1,
    });
    expect(adjacentChapter({ bookId: 'MAT', chapter: 1 }, -1)).toEqual({
      bookId: 'MAL',
      chapter: 4,
    });
    expect(adjacentChapter({ bookId: 'PSA', chapter: 119 }, 1)).toEqual({
      bookId: 'PSA',
      chapter: 120,
    });
  });

  it('stops at the beginning and end of the Bible', () => {
    expect(adjacentChapter({ bookId: 'GEN', chapter: 1 }, -1)).toBeNull();
    expect(adjacentChapter({ bookId: 'REV', chapter: 22 }, 1)).toBeNull();
  });

  it.each([
    null,
    {},
    { bookId: 'BAD', chapter: 1 },
    { bookId: 'GEN', chapter: 0 },
    { bookId: 'PSA', chapter: 151 },
    { bookId: 'GEN', chapter: 1.5 },
    { bookId: 'GEN', chapter: '1' },
  ])('rejects an invalid saved or incoming position: %j', (value) =>
    expect(isChapterReference(value)).toBe(false),
  );
});
