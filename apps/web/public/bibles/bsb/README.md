# Berean Standard Bible text

The reader serves these static book files directly; it does not require a Bible
API, an account, a running application API, or a live call to an external service.
Only the selected book is requested. A browser can cache previously requested
content; complete offline availability is not implemented.

The source is the official current third-printing plain-text download:
<https://bereanbible.com/bsb.txt>. Its HTTP Last-Modified value at import was
July 31, 2026. The downloads page identifies the edition:
<https://berean.bible/downloads.htm>.

The BSB text is dedicated to the public domain. Rights and attribution:
<https://berean.bible/terms.htm>. The publisher's source attribution is retained
in `source.json` along with the source checksum and checksums for every book asset.

## Regeneration

From the repository root with Node.js 24:

```sh
npm run import:bsb
# Or use an already downloaded, checksum-matching copy:
npm run import:bsb -- /path/to/bsb.txt
```

The importer pins the exact source SHA-256 and refuses unexpected changes. Review
an upstream revision before changing that pin and regenerating the assets. The
generated JSON is checked in, so installation, CI, and builds need no content download.

Book IDs follow USFM's three-character convention. Book order and chapter counts
are in `packages/domain/src/books.ts`. The reader displays “Psalms”; source verse
labels use “Psalm.” All nonempty verse text is preserved unchanged as plain text.

The source includes 31,102 numbered rows, of which 16 have no verse text. The
importer skips those empty rows and preserves original verse numbers, producing
31,086 displayed verses across 1,189 chapters. It does not insert wording from
other translations. This first reader displays verse text; publisher footnotes,
section headings, and paragraph/poetry formatting are not in this plain-text import.
