// @vitest-environment jsdom

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BibleReader } from './BibleReader';

const directory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../public/bibles/bsb',
);
const key = 'bible-study:reading-position:v1';
const fetchBook = vi.fn(async (url: RequestInfo | URL) => {
  const filename = String(url).split('/').at(-1)!;
  return new Response(await readFile(resolve(directory, filename), 'utf8'), {
    headers: { 'Content-Type': 'application/json' },
  });
});

function topNavigation() {
  return within(screen.getByRole('navigation', { name: 'Bible navigation' }));
}

beforeEach(() => {
  window.history.replaceState(null, '', '/');
  window.localStorage.clear();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  fetchBook.mockClear();
  vi.stubGlobal('fetch', fetchBook);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Bible reader', () => {
  it('opens Genesis without login and loads actual packaged text', async () => {
    render(<BibleReader />);
    await screen.findByText(
      /In the beginning God created the heavens and the earth/,
    );
    expect(document.querySelectorAll('.verse')).toHaveLength(31);
    expect(
      topNavigation()
        .getByRole('button', { name: '← Previous' })
        .hasAttribute('disabled'),
    ).toBe(true);
    expect(
      screen.getByLabelText('Book').querySelectorAll('option'),
    ).toHaveLength(66);
  });

  it('uses a shared chapter URL ahead of a different saved position', async () => {
    window.localStorage.setItem(
      key,
      JSON.stringify({ bookId: 'PSA', chapter: 23 }),
    );
    window.history.replaceState(null, '', '/#JHN/3');
    render(<BibleReader />);
    await screen.findByText(/For God so loved the world/);
    expect(screen.getByRole('heading', { name: 'John 3' })).toBeTruthy();
  });

  it('navigates across book boundaries and supports browser back', async () => {
    window.history.replaceState(null, '', '/#GEN/50');
    render(<BibleReader />);
    await screen.findByText(/Joseph fell upon his father’s face/);
    fireEvent.click(topNavigation().getByRole('button', { name: 'Next →' }));
    await screen.findByText(/These are the names of the sons of Israel/);
    expect(screen.getByRole('heading', { name: 'Exodus 1' })).toBeTruthy();
    window.history.back();
    await screen.findByRole('heading', { name: 'Genesis 50' });
    await screen.findByText(/Joseph fell upon his father’s face/);
  });

  it('changes books at chapter one and remembers that chapter on a new visit', async () => {
    render(<BibleReader />);
    await screen.findByText(
      /In the beginning God created the heavens and the earth/,
    );
    fireEvent.change(screen.getByLabelText('Book'), {
      target: { value: 'JHN' },
    });
    await screen.findByText(/In the beginning was the Word/);
    fireEvent.change(screen.getByLabelText('Chapter'), {
      target: { value: '3' },
    });
    await screen.findByText(/For God so loved the world/);
    await waitFor(() =>
      expect(JSON.parse(window.localStorage.getItem(key)!)).toEqual({
        bookId: 'JHN',
        chapter: 3,
      }),
    );
    cleanup();
    window.history.replaceState(null, '', '/');
    render(<BibleReader />);
    await screen.findByText(/For God so loved the world/);
    expect(window.location.hash).toBe('#JHN/3');
  });

  it('keeps reading usable when browser storage is blocked', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    render(<BibleReader />);
    await screen.findByText(
      /In the beginning God created the heavens and the earth/,
    );
  });

  it('recovers from a bad URL and invalid saved data', async () => {
    window.history.replaceState(null, '', '/#REV/900');
    window.localStorage.setItem(key, '{broken JSON');
    render(<BibleReader />);
    await screen.findByText(
      /In the beginning God created the heavens and the earth/,
    );
    expect(window.location.hash).toBe('#GEN/1');
  });

  it('offers a retry after a failed content request', async () => {
    fetchBook.mockRejectedValueOnce(new Error('Unavailable'));
    render(<BibleReader />);
    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await screen.findByText(
      /In the beginning God created the heavens and the earth/,
    );
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('stops next navigation at the end of Revelation', async () => {
    window.history.replaceState(null, '', '/#REV/22');
    render(<BibleReader />);
    await screen.findByText(
      /The grace of the Lord Jesus be with all the saints/,
    );
    expect(
      topNavigation()
        .getByRole('button', { name: 'Next →' })
        .hasAttribute('disabled'),
    ).toBe(true);
  });
});
