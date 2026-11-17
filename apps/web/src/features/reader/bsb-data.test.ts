import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { bibleBooks } from '@bible-study/domain';
import { BibleBookTextSchema } from '@bible-study/contracts';

const directory = new URL('../../../public/bibles/bsb/', import.meta.url);

describe('packaged BSB content', () => {
  it('contains all books and chapters and matches the imported text checksums', async () => {
    const source: {
      bookCount: number;
      chapterCount: number;
      verseCount: number;
      bookChecksums: Record<string, string>;
    } = JSON.parse(await readFile(new URL('source.json', directory), 'utf8'));
    let chapters = 0;
    let verses = 0;
    expect(bibleBooks).toHaveLength(66);

    for (const book of bibleBooks) {
      const json = await readFile(
        new URL(`${book.id}.json`, directory),
        'utf8',
      );
      expect(createHash('sha256').update(json).digest('hex')).toBe(
        source.bookChecksums[book.id],
      );
      const data = BibleBookTextSchema.parse(JSON.parse(json));
      expect(data.bookId).toBe(book.id);
      expect(data.chapters).toHaveLength(book.chapterCount);
      chapters += data.chapters.length;
      for (const chapter of data.chapters) {
        verses += chapter.length;
        const numbers = chapter.map((verse) => verse.number);
        expect(numbers).toEqual([...new Set(numbers)].sort((a, b) => a - b));
      }
      if (book.id === 'GEN')
        expect(data.chapters[0]?.[0]?.text).toBe(
          'In the beginning God created the heavens and the earth.',
        );
      if (book.id === 'PSA') expect(data.chapters[118]).toHaveLength(176);
      if (book.id === 'REV')
        expect(data.chapters[21]?.at(-1)?.text).toBe(
          'The grace of the Lord Jesus be with all the saints. Amen.',
        );
    }

    expect(chapters).toBe(1189);
    expect(verses).toBe(31086);
    expect([source.bookCount, source.chapterCount, source.verseCount]).toEqual([
      66,
      chapters,
      verses,
    ]);
  });
});
