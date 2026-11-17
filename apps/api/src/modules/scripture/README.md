# Scripture

Own future server-side passage lookup, translation metadata, source provenance,
and content rights. The current reader loads approved BSB text directly from static
book assets in `apps/web/public/bibles/bsb`; the API is not needed for reading.
The import retains edition/source metadata, checksums, and source numbering.

Expose approved text to clients and to study orchestration. Display rights and
permission to submit text to an LLM are separate capabilities; evaluate both for
each future licensed translation. A provider SDK must not decide these policies.

Reading should not depend on an LLM or a paid account. When server-side study is
built, resolve approved source text through this module using the same pinned
edition, without moving provider SDKs or licensing policy into the browser.
