# LLM provider boundary

Keep provider SDKs, credentials, model names, streaming conversions, timeouts,
and usage normalization here. Only server code may import provider integrations.

Define the smallest interface needed by the first study use case. Return provider
usage as well as content. Use provider cancellation and output limits where
available; a disconnected client alone does not guarantee a call stopped billing.

Do not retry chargeable calls without an explicit retry and budget policy. Keep
personal notes out of prompts unless a user deliberately includes them. Do not
log credentials or whole prompts by default.

No provider has been selected or installed.
