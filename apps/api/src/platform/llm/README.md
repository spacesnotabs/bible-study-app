# Model provider boundary

`config.ts` reads server-only model/provider settings and validates them without
including credentials or configuration values in error messages. `create-ai.ts`
constructs direct AI SDK provider clients and adapts text/image generation to the
application interfaces in `modules/study/models.ts`.

Text supports OpenAI, Anthropic, Google, and OpenAI-compatible services. Image
generation supports OpenAI, Google, and compatible image endpoints. Each capability
can use a different provider, model, endpoint, and credential. Model-specific
capabilities and supported image dimensions still depend on the selected service.

Both capabilities are disabled by default. Constructing clients does not generate
content. The API exposes only a capability-status GET endpoint alongside health;
it does not provide a public generation endpoint or browser model credentials.

Requests have prompt/output bounds and cancellation/deadline signals. Automatic
SDK retries are disabled and image generation requests one image at a time.
Normalized results retain token usage where supplied; missing values remain null,
not zero. These limits do not replace account/guest quotas, durable budget
reservations, concurrency controls, or a global spending stop.

Provider objects and SDK types stay here. Study code owns theological instructions,
sources, and access/budget policy. Keep personal notes out of prompts unless the
user includes them deliberately. Do not log keys, complete prompts, raw SDK errors,
or whole configuration objects. Future HTTP handlers should map failures to safe
client-facing errors.

See [configuration and examples](../../../../../docs/model-integration.md).
