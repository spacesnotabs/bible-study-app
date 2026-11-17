# Bible Study App

A Bible-first reading and study application. People should be able to read and
keep personal study material without creating an account. Optional accounts will
eventually add cloud backup and sync; subscriptions may fund additional AI usage.

The first prototype is a working Bible reader: all 66 books of the Berean Standard
Bible, book/chapter selectors, previous/next navigation, chapter URLs, and a
remembered last chapter. It uses simple native controls and one reader screen so
we can iterate without maintaining multiple prototype applications.

The Theme selector offers Light, Dark, and System appearance and remembers the
choice on this device. System mode follows the operating system's appearance.

The API includes configurable text and image model adapters, disabled by default.
Study use cases consume small provider-independent interfaces; provider/model IDs,
credentials, and limits stay on the server. See [model integration](docs/model-integration.md).
Interactive study, notes, highlights, login, cloud sync, and billing are not implemented yet.

## Start locally

Use Node.js 24.15 or later in the 24 LTS line and npm 11 or newer. With nvm installed:

```sh
nvm use
npm ci
npm run dev
```

- Web: <http://localhost:5173>
- API health: <http://localhost:3001/api/v1/health>
- Configured model availability: <http://localhost:3001/api/v1/ai/capabilities>
- The web development server forwards `/api` requests to the API.
- No account, database, API key, or paid service is needed.

Choose a book and chapter, or follow a chapter URL such as
<http://localhost:5173/#JHN/3>. Previous/next crosses book boundaries and browser
back/forward works. Your last chapter is stored on this device when browser storage
is available. A shared URL takes precedence over that saved position.

The Bible text is checked in as static book files. Only the selected book is
loaded; reading does not call the API or an external Bible service. The current
plain-text import includes verse text and numbering; footnotes and paragraph/poetry
formatting are not implemented. See [the content source and import instructions](apps/web/public/bibles/bsb/README.md).

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

The reader and reading-position storage are implemented. Other feature directories
contain responsibility notes or small application interfaces. Model adapters are
implemented in the server's `platform/llm` directory. A native mobile app can become
another client later, consuming the API and shared packages.

## Development commands

```sh
npm run check                 # Formatting, types, tests, and production builds
npm run test:watch
npm run format
npm run build
npm run build:site            # Static reader output in root dist/ for Sites
```

After a build, `npm run start --workspace=@bible-study/api` starts the compiled
API. `npm run preview --workspace=@bible-study/web` previews the built web shell;
Vite's preview proxy is a local convenience, not the production deployment plan.
The hosted prototype serves the static reader only. Its configuration is in
`.openai/hosting.json`; `npm run build:site` writes the selected `dist/` output.
The API is retained for local development and future study features. When those
features are deployed, serve the web build and forward `/api` on the same origin.

Internal packages expose TypeScript source and are bundled by each application.
They are private workspace packages and are not intended for independent npm
publication. The production API runs compiled JavaScript.

## Architectural commitments

- Reading and local study do not require login.
- Optional cloud sync adds an account; it does not replace local storage.
- LLM credentials, usage decisions, and future billing credentials stay on the server.
- Paid model calls will require server-enforced quotas and spending controls before launch.
- The reader includes the public-domain Berean Standard Bible, imported from the
  official current third-printing text with source and book checksums. Refresh it
  deliberately with `npm run import:bsb` after reviewing any upstream revision.
- Both quiet reading and proactive guided study fit the same reader and study modules.
- Study content should reflect a conservative evangelical/Protestant foundation,
  distinguish differing conservative interpretations, and retain supporting sources.

See [the architecture](docs/architecture.md) and
[the initial decision record](docs/decisions/0001-foundation.md).

An application source-code license has not been selected. Scripture and reference
materials retain their own upstream rights and terms.
