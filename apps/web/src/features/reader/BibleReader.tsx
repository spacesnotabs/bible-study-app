import { useEffect, useState } from 'react';
import type { BibleBookText } from '@bible-study/contracts';
import {
  adjacentChapter,
  bibleBooks,
  findBibleBook,
  firstChapter,
} from '@bible-study/domain';
import type { ChapterReference } from '@bible-study/domain';
import {
  loadReadingPosition,
  saveReadingPosition,
} from '../../platform/storage/reading-position';
import { loadBook } from './load-book';
import { parseReadingHash, readingHash } from './location';

type BookState =
  | { bookId: string; status: 'loading' }
  | { bookId: string; status: 'ready'; content: BibleBookText }
  | { bookId: string; status: 'error' };

function initialPosition(): ChapterReference {
  return (
    parseReadingHash(window.location.hash) ??
    loadReadingPosition() ??
    firstChapter
  );
}

export function BibleReader() {
  const [position, setPosition] = useState(initialPosition);
  const [bookState, setBookState] = useState<BookState>({
    bookId: position.bookId,
    status: 'loading',
  });
  const [retry, setRetry] = useState(0);
  const book = findBibleBook(position.bookId)!;
  const previous = adjacentChapter(position, -1);
  const next = adjacentChapter(position, 1);
  const title = `${book.id === 'PSA' ? 'Psalm' : book.name} ${position.chapter}`;

  useEffect(() => {
    function onHashChange() {
      setPosition(parseReadingHash(window.location.hash) ?? firstChapter);
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    saveReadingPosition(position);
    const hash = readingHash(position);
    if (window.location.hash !== hash)
      window.history.replaceState(null, '', hash);
    document.title = `${title} · Bible Study`;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [position, title]);

  useEffect(() => {
    const controller = new AbortController();
    const bookId = position.bookId;
    setBookState({ bookId, status: 'loading' });
    loadBook(bookId, controller.signal).then(
      (content) => {
        if (!controller.signal.aborted)
          setBookState({ bookId, status: 'ready', content });
      },
      () => {
        if (!controller.signal.aborted)
          setBookState({ bookId, status: 'error' });
      },
    );
    return () => controller.abort();
  }, [position.bookId, retry]);

  function navigate(destination: ChapterReference | null) {
    if (destination) window.location.hash = readingHash(destination);
  }

  const current = bookState.bookId === book.id ? bookState : null;
  const verses =
    current?.status === 'ready'
      ? current.content.chapters[position.chapter - 1]
      : null;

  const chapterButtons = (
    <div className="chapter-buttons">
      <button
        type="button"
        disabled={!previous}
        onClick={() => navigate(previous)}
      >
        ← Previous
      </button>
      <button type="button" disabled={!next} onClick={() => navigate(next)}>
        Next →
      </button>
    </div>
  );

  return (
    <main className="reader">
      <header className="reader-header">
        <h1>Bible</h1>
        <a href="https://berean.bible/" target="_blank" rel="noreferrer">
          Berean Standard Bible
        </a>
      </header>

      <nav className="reader-controls" aria-label="Bible navigation">
        <label className="book-control">
          Book
          <select
            value={book.id}
            onChange={(event) =>
              navigate({ bookId: event.target.value, chapter: 1 })
            }
          >
            {(['old', 'new'] as const).map((testament) => (
              <optgroup
                key={testament}
                label={testament === 'old' ? 'Old Testament' : 'New Testament'}
              >
                {bibleBooks
                  .filter((item) => item.testament === testament)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="chapter-control">
          Chapter
          <select
            value={position.chapter}
            onChange={(event) =>
              navigate({ bookId: book.id, chapter: Number(event.target.value) })
            }
          >
            {Array.from({ length: book.chapterCount }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </select>
        </label>
        {chapterButtons}
      </nav>

      <article
        aria-labelledby="chapter-title"
        aria-busy={!current || current.status === 'loading'}
      >
        <h2 id="chapter-title">{title}</h2>
        {(!current || current.status === 'loading') && (
          <p role="status">Loading chapter…</p>
        )}
        {current?.status === 'error' && (
          <div role="alert">
            <p>This book could not be loaded. Please try again.</p>
            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
            >
              Try again
            </button>
          </div>
        )}
        {verses && (
          <div className="verses">
            {verses.map((verse) => (
              <p
                key={verse.number}
                className="verse"
                id={`verse-${verse.number}`}
              >
                <sup aria-label={`Verse ${verse.number}`}>{verse.number}</sup>{' '}
                {verse.text}
              </p>
            ))}
          </div>
        )}
      </article>

      {verses && (
        <nav className="chapter-footer" aria-label="Continue reading">
          {chapterButtons}
        </nav>
      )}
      <footer className="reader-footer">
        <p>
          Berean Standard Bible ·{' '}
          <a
            href="https://berean.bible/terms.htm"
            target="_blank"
            rel="noreferrer"
          >
            Public domain
          </a>
        </p>
      </footer>
    </main>
  );
}
