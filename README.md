# Bible Study App

A Bible-first reading and study application. People should be able to read and
keep personal study material without creating an account. Optional accounts will
eventually add cloud backup and sync; subscriptions may fund additional AI usage.

This repository is a runnable architectural foundation. It contains a small web
shell, a public API health endpoint, shared types and contracts, and documented
module boundaries. Bible content, local saving, LLM calls, login, cloud sync, and
billing are not implemented yet.

## Start locally

Use Node.js 24 LTS and npm 11 or newer. With nvm installed:

```sh
nvm use
npm ci
npm run dev
```

- Web: <http://localhost:5173>
- API health: <http://localhost:3001/api/v1/health>
- The web development server forwards `/api` requests to the API.
- No account, database, API key, or paid service is needed.

The API defaults to `127.0.0.1:3001`. To override its configuration, copy
`apps/api/.env.example` to `apps/api/.env`. The web development proxy expects port
3001; adjust `apps/web/vite.config.ts` if you change that port.

## Repository structure

```text
apps/
  web/                       React + Vite; browser-specific presentation
    src/
      app/                   Application shell and composition
      features/
        reader/              Bible reading and passage selection
        study/               Questions, guided study, and source presentation
        library/             Personal notes, highlights, and saved findings
      platform/storage/      Browser persistence boundary
  api/                       Fastify; one modular backend
    src/
      modules/
        scripture/           Bible content and translation access
        study/               Study orchestration and source policies
        library/             Future account-owned cloud storage and sync
        access/              Guest identity, account access, and usage policy
      platform/
        llm/                 Provider-specific model integrations
        persistence/         Future database and durable usage storage
packages/
  domain/                    Framework-independent Scripture and study types
  contracts/                 Shared, runtime-validated HTTP contracts
docs/
  architecture.md            Responsibilities, data ownership, and key flows
  decisions/                 Reasons for the initial architecture
```

Feature directories currently contain responsibility notes, not placeholder
implementations. Add code when a feature is built. A native mobile app can become
another client later, consuming the API and shared packages.

## Development commands

```sh
npm run check                 # Formatting, types, tests, and production builds
npm run test:watch
npm run format
npm run build
```

After a build, `npm run start --workspace=@bible-study/api` starts the compiled
API. `npm run preview --workspace=@bible-study/web` previews the built web shell;
Vite's preview proxy is a local convenience, not the production deployment plan.
Production hosting should serve the web build and forward `/api` to the API on
the same origin. Hosting has not been configured.

Internal packages expose TypeScript source and are bundled by each application.
They are private workspace packages and are not intended for independent npm
publication. The production API runs compiled JavaScript.

## Architectural commitments

- Reading and local study do not require login.
- Optional cloud sync adds an account; it does not replace local storage.
- LLM credentials, usage decisions, and future billing credentials stay on the server.
- Paid model calls will require server-enforced quotas and spending controls before launch.
- The initial translation will be the public-domain Berean Standard Bible. Import
  its current official edition with source and version metadata when building
  the reader. No Bible corpus is included in this scaffold.
- Both quiet reading and proactive guided study fit the same reader and study modules.
- Study content should reflect a conservative evangelical/Protestant foundation,
  distinguish differing conservative interpretations, and retain supporting sources.

See [the architecture](docs/architecture.md) and
[the initial decision record](docs/decisions/0001-foundation.md).

An application source-code license has not been selected. Scripture and reference
materials retain their own upstream rights and terms.
