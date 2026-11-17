# Shared HTTP contracts

Own API request/response schemas and their inferred TypeScript types. Zod provides
runtime validation so a client and server do not rely on TypeScript alone at a
network boundary. The current API namespace is `/api/v1`.

Share transport vocabulary rather than implementation. Do not export database
entities, environment variables, provider SDK objects, sessions, credentials, or
server-only code. Import shared domain vocabulary when a real endpoint needs it.

Only the health contract exists today. Add study, content, and sync contracts with
their implementations; do not invent a complete API in advance. A future native
client can reuse these schemas or consume documented HTTP contracts independently.
