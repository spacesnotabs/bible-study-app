# Reader

`BibleReader.tsx` is the one reader prototype. It offers book/chapter selection,
previous/next navigation across books, verse numbers, loading/retry states, and a
device-local last chapter. Styling deliberately stays minimal.

- Shared domain code owns book order, chapter counts, and adjacent-chapter rules.
- `location.ts` maps chapter references to shareable hashes such as `#JHN/3`.
- `load-book.ts` fetches one packaged static book and validates its content contract.
- `platform/storage/reading-position.ts` handles optional browser storage.

The reader works without an account, a model service, or the application API.
Changing books cancels the old load; failures offer a retry without stale verse
text. URL navigation takes precedence over a previously saved chapter. Storage
denial or corrupted saved data does not prevent reading.

Text is the pinned official BSB import in `public/bibles/bsb`. Verse wording and
source numbering are preserved. Footnotes, paragraph/poetry formatting, search,
translation switching, selection tools, and study panes are future slices.
