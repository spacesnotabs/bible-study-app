# Model integration

The Node API has a provider-independent text generator and a separate image
generator. Provider adapters use the AI SDK and connect directly to the configured
provider; no model-name string is handed to the SDK's default gateway.

This is integration infrastructure. There is no chat UI or public generation
endpoint yet. The hosted Sites reader is static and does not deploy the Node API.
Adding credentials to the API does not make the hosted reader perform AI calls.

## Configure the server

Copy `apps/api/.env.example` to `apps/api/.env` and choose providers/models there.
Both capabilities default to `disabled`; models have no automatic paid default.

| Capability | Provider values                                                  | Model setting    |
| ---------- | ---------------------------------------------------------------- | ---------------- |
| Text       | `openai`, `anthropic`, `google`, `openai-compatible`, `disabled` | `AI_TEXT_MODEL`  |
| Images     | `openai`, `google`, `openai-compatible`, `disabled`              | `AI_IMAGE_MODEL` |

For example, use different providers for study text and illustrations:

```dotenv
AI_TEXT_PROVIDER=anthropic
AI_TEXT_MODEL=your-supported-text-model-id
ANTHROPIC_API_KEY=your-provider-key

AI_IMAGE_PROVIDER=openai
AI_IMAGE_MODEL=your-supported-image-model-id
OPENAI_API_KEY=your-provider-key
```

These are placeholders, not selected model recommendations. Choose current model
IDs supported by your provider account. A configuration change requires restarting
the API. There is no client-supplied provider or model override.

Conventional credentials are `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`,
`GOOGLE_GENERATIVE_AI_API_KEY`, and `OPENAI_COMPATIBLE_API_KEY`. Optional
`AI_TEXT_API_KEY` and `AI_IMAGE_API_KEY` override the conventional key for that role.
Keep all credentials in the server environment, never in `VITE_` variables,
committed configuration, or browser requests.

`AI_TEXT_BASE_URL` and `AI_IMAGE_BASE_URL` optionally override the selected
provider's endpoint. Each must include the provider's API version path where
needed. An OpenAI-compatible configuration requires an explicit base URL:

```dotenv
AI_TEXT_PROVIDER=openai-compatible
AI_TEXT_MODEL=your-local-model-name
AI_TEXT_BASE_URL=http://127.0.0.1:11434/v1
```

A compatible service can omit its key if its API does not require authentication.
Use HTTPS for remote credential-bearing connections. URLs cannot embed credentials,
queries, or fragments. A compatible chat endpoint is not evidence that the service
also supports the OpenAI-compatible images API.

## Use from study code

`server.ts` composes `readAiConfig(process.env)` and `createAiServices(config)`.
It injects the resulting services into the HTTP application. Future study routes
can receive the same services explicitly through their module registration.

The application interface is `apps/api/src/modules/study/models.ts`:

```ts
// Inside a trusted server use case, after source/access/usage checks:
if (!models.text) throw new Error('Text generation is not configured.');
const answer = await models.text.generate({
  system: studyInstructions,
  prompt: passageAndQuestion,
  signal: requestSignal,
});

if (!models.images) throw new Error('Image generation is not configured.');
const illustration = await models.images.generate({
  prompt: illustrationDescription,
  aspectRatio: '1:1',
  signal: requestSignal,
});
```

Text results contain text, provider, configured model ID, finish reason, and token
usage. A length-limited result retains its finish reason for the caller to handle.
Image results contain binary images, media types, provider/model IDs, and any
reported token usage. Binary output is internal: a future image feature should
store it in an asset store and return a suitable asset response, not serialize
SDK objects into the browser. Supported dimensions/aspect ratios depend on the
model. Choose a size or an aspect ratio, not both.

Image generation is distinct from asking a vision-capable text model to analyze
an input image. This first interface supports text answers and new image generation;
image editing, vision inputs, streaming, and structured study responses can be
added when their user flows are built.

## Limits and costs

- `AI_MAX_OUTPUT_TOKENS`: text output ceiling, default 1,200. A request may lower it.
- `AI_MAX_PROMPT_CHARACTERS`: prompt plus system-instruction ceiling, default 50,000.
- `AI_TEXT_TIMEOUT_MS`: default 30,000.
- `AI_IMAGE_TIMEOUT_MS`: default 120,000.
- All model calls use zero automatic retries. No automatic provider fallback exists.
- Image requests generate one image. Missing provider usage counts remain null.

Token counts and image counts are usage evidence, not a price quote. Provider/model
pricing, caching, reasoning tokens, dimensions, and image quality can affect cost.
Cancellation is best-effort and does not guarantee a provider will stop billing.

Before exposing paid generation through HTTP, implement guest/account access and
durable quota/budget reservations, concurrency limits, accounting/reconciliation,
and a global spending stop. The adapters are ready for use behind those policies;
they do not implement a subscription system or a spending ledger.

`GET /api/v1/ai/capabilities` reports only two configuration booleans. It does not
invoke a model, prove a model is reachable, grant access, or reveal keys/endpoints.
Tests use mocked model execution and do not spend provider credits.

## Add another provider

Add its SDK adapter and configuration case in `platform/llm`, then test the model
selection and normalized results. Existing study use cases keep their `TextGenerator`
and `ImageGenerator` interfaces. Some providers support one capability only; do not
silently route image requests to a text-only model.

References: [AI SDK provider model interfaces](https://ai-sdk.dev/docs/foundations/providers-and-models),
[image generation](https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-image),
and [compatible providers](https://ai-sdk.dev/providers/openai-compatible-providers).
