# Study

Own study use cases: questions, context, chapter suggestions, cross-references,
original-language exploration, and source-backed explanations.

A future request should follow this order:

1. Validate the request against the shared API contract.
2. Resolve a guest or authenticated actor and check server-owned access policy.
3. Load only source material whose rights permit this use.
4. Check for a reusable result and reserve an appropriate usage budget.
5. Invoke the LLM through `platform/llm`, with timeouts and output limits.
6. Retain source references and record actual provider usage; reconcile failed calls.

Keep prompts, theological/source policy, orchestration, and provider integration
separate. Provider adapters should not own doctrine, user plans, or HTTP responses.
The shared foundation is conservative evangelical/Protestant, with fair treatment
of differing conservative interpretations. AI explanations must remain distinct
from Scripture quotations and from personal notes.

No model endpoint or paid provider is enabled in this scaffold. Usage controls
must exist before adding live calls.
