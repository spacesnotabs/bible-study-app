# Shared domain

Framework-independent vocabulary and, as features are built, their business rules.
This package has no runtime dependencies. It must not import React, Fastify, a
database client, an LLM SDK, browser APIs, or environment configuration.

Passage references, reading modes, and translation IDs can be used by the web app,
API, and a future native app. Transport validation belongs in `contracts`; UI and
device persistence belong in the relevant client. Keep server-only source and
entitlement policies on the server.

Add domain behavior as actual use cases require it. There is no reason to create
an inheritance hierarchy or a generic repository here.
