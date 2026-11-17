# 0002: One simple reader with static Bible content

Status: Accepted for the prototype.

## Context

We need a reader the user can try and iterate on before adding interactive study.
Styling and premature infrastructure should not make changes difficult.

## Decision

Keep one implementation in the existing web app. Use Git branches for experiments
instead of duplicating prototype applications into separate directories.

Use native book/chapter selectors, previous/next buttons, and verse text. Serve
the approved public-domain BSB as one static JSON asset per book, with a pinned
source checksum and runtime-validated book contracts. Static distribution supports
the reader without a backend request, credentials, or recurring Bible API fees.

Remember the last chapter in optional localStorage. Put chapter references in URL
hashes so links and browser history work on static hosting. No routing framework
or application state library is needed for this slice.

Use Sites for a hosted static prototype. The existing API remains available for
later server-side study; it is not required or deployed for this reading slice.

## Consequences

Iteration stays in one small reader feature. The browser requests only the selected
book; the complete Bible is not bundled into the JavaScript entrypoint. Generated
assets are committed, so CI and builds do not depend on the publisher's uptime.

This first reader shows verse text without footnotes or paragraph/poetry formatting.
It remembers the chapter, not a precise scroll location. Full offline support,
translation switching, notes, and study interactions remain later slices.
