# 0001: Web first, shared TypeScript, one modular API

Status: Accepted as the starting architecture; revise when concrete needs change.

## Context

The first client is a web app. Native Android/iOS clients are possible later.
Reading and personal local study must work without an account. Optional accounts
may add cloud backup/sync; subscriptions may fund heavier LLM use. Model API costs
and translation rights need server-side control.

## Decision

- Use an npm-workspaces monorepo with React/Vite for web and Fastify for one API.
- Share framework-independent domain vocabulary and runtime-validated HTTP contracts.
- Organize feature responsibilities into modules; add abstractions as use cases need them.
- Design device-local saves first, with optional account-owned cloud sync later.
- Keep model calls, content permissions, usage policy, and future payment credentials
  on the server. Expose no live model endpoint before usage controls exist.
- Use the public-domain BSB initially. Pin its current official edition during import.
- Keep identity, billing, database, and model providers unselected until implementation
  requires them. PostgreSQL is the initial cloud-persistence candidate.

## Consequences

The reader does not depend on login or a model service. Future mobile clients can
reuse API contracts and relevant domain code, while supplying their own UI and
device storage. We do not assume React web components will transfer to native UI.

A separate web client and API require two local processes and production routing.
They provide an explicit client/server boundary that a future native app can use.
This is slightly more setup than a single full-stack framework, while keeping the
API independent of a web rendering framework. Initial public reading does not
require server rendering or a native app.

Local-first saving creates real future merge/conflict work; directory structure
alone does not solve synchronization. Anonymous AI use also requires abuse and
budget controls before launch. Deferring those implementations today keeps the
foundation small without losing their architectural boundaries.
