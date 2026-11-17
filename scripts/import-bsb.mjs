import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { bibleBooks } from '../packages/domain/src/books.ts';

const sourceUrl = 'https://bereanbible.com/bsb.txt';
const expectedSha256 =
  '2ac3af1de52d4e68261cba91d85c320b7eadc6560e830d99e591767b8ff5ca96';
const destination = fileURLToPath(
  new URL('../apps/web/public/bibles/bsb/', import.meta.url),
);

// Accept a local copy for reproducible imports without another network request.
const bytes = process.argv[2]
  ? await readFile(process.argv[2])
  : await downloadSource();
const sha256 = createHash('sha256').update(bytes).digest('hex');
if (sha256 !== expectedSha256) {
  throw new Error(
    'The BSB source changed. Review the edition before updating the pinned checksum.',
  );
}

const books = new Map(
  bibleBooks.map((book) => [
    book.name,
    {
      bookId: book.id,
      chapters: Array.from({ length: book.chapterCount }, () => []),
    },
  ]),
);
const lines = bytes
  .toString('utf8')
  .replace(/^\uFEFF/, '')
  .split(/\r?\n/);
const header = lines.findIndex(
  (line) => line === 'Verse\tBerean Standard Bible',
);
if (header === -1) throw new Error('Unrecognized BSB source header.');

let verseCount = 0;
let emptyVerseRows = 0;
const seen = new Set();
for (const line of lines.slice(header + 1)) {
  if (!line) continue;
  const match = /^(.+) (\d+):(\d+)\t(.*)$/.exec(line);
  if (!match) throw new Error('Unrecognized source row.');
  const [, sourceName, chapterText, numberText, text] = match;
  const name = sourceName === 'Psalm' ? 'Psalms' : sourceName;
  const book = books.get(name);
  const chapter = Number(chapterText);
  const number = Number(numberText);
  const verses = book?.chapters[chapter - 1];
  if (!book || !verses || chapter < 1 || number < 1) {
    throw new Error(
      `Invalid passage reference: ${sourceName} ${chapter}:${number}`,
    );
  }
  const key = `${book.bookId}/${chapter}/${number}`;
  if (seen.has(key)) throw new Error(`Duplicate source verse: ${key}`);
  seen.add(key);
  // This edition leaves 16 verse rows blank. Preserve its numbering and do not
  // supply text from another translation for those omitted verses.
  if (text === '') {
    emptyVerseRows++;
    continue;
  }
  if (verses.length && verses.at(-1).number >= number) {
    throw new Error(`Out-of-order source verse: ${key}`);
  }
  verses.push({ number, text });
  verseCount++;
}

if (verseCount !== 31086 || emptyVerseRows !== 16) {
  throw new Error('Unexpected verse counts in the pinned BSB edition.');
}

await mkdir(destination, { recursive: true });
const bookChecksums = {};
for (const book of books.values()) {
  if (book.chapters.some((chapter) => chapter.length === 0)) {
    throw new Error(`Missing chapter in ${book.bookId}`);
  }
  const json = JSON.stringify(book) + '\n';
  bookChecksums[book.bookId] = createHash('sha256').update(json).digest('hex');
  await writeFile(`${destination}/${book.bookId}.json`, json);
}

await writeFile(
  `${destination}/source.json`,
  JSON.stringify(
    {
      translationId: 'BSB',
      name: 'Berean Standard Bible',
      edition:
        'Official current text, third printing; source last modified 2026-07-31',
      sourceUrl,
      sourceSha256: sha256,
      downloadsUrl: 'https://berean.bible/downloads.htm',
      rightsUrl: 'https://berean.bible/terms.htm',
      license: 'Public domain (CC0 dedication)',
      attribution: lines
        .slice(0, header)
        .map((line) => line.trim())
        .filter(Boolean)
        .join(' '),
      bookIdConvention:
        'USFM three-character book IDs; chapter and verse numbering retained from source',
      bookCount: books.size,
      chapterCount: 1189,
      verseCount,
      emptyVerseRows,
      bookChecksums,
    },
    null,
    2,
  ) + '\n',
);

console.log(
  `Imported ${books.size} BSB books, 1,189 chapters, and ${verseCount.toLocaleString()} verses.`,
);

async function downloadSource() {
  const response = await fetch(sourceUrl, {
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok)
    throw new Error(`Source download failed: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}
