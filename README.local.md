# Run Locally

## Prerequisites
- Node.js 18+ (required — `nvm use` picks up the pinned version in `.nvmrc`)
- npm
- PostgreSQL (local or remote)
- `ANTHROPIC_API_KEY` and `YOUTUBE_API_KEY` for later phases

## Install dependencies

```bash
cd /Users/andrei/Desktop/fluid_gym_prsnl/fluid_gym_app
npm install --legacy-peer-deps
```

## Start the API

```bash
npm run dev:api
```

The API runs at `http://localhost:4000`.

## Start the frontend

```bash
npm run dev:web
```

The web app runs at `http://localhost:5173` and proxies `/api` to the backend.

## Lint

```bash
npm run lint       # check apps/api, apps/web, packages/shared-types
npm run lint:fix
```

Single flat config (`eslint.config.mjs`) at the repo root covers all workspaces — TS recommended rules everywhere, plus `react-hooks`/`react-refresh` rules scoped to `apps/web`.

## Build for production

```bash
npm run build:api
npm run build:web
```

## Environment variables

Create a `.env` file in the project root with values such as:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/fluidgym"
ANTHROPIC_API_KEY="your-anthropic-key"
YOUTUBE_API_KEY="your-youtube-key"
JWT_SECRET="replace-with-a-secure-secret"
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
VITE_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
```

A `.env` with these placeholders already exists at the project root (gitignored) — swap in real values as you reach the phase that needs them.

- `JWT_SECRET`: any long random string (e.g. `openssl rand -hex 32`) — auth routes refuse to issue tokens while it's still the placeholder.
- `GOOGLE_CLIENT_ID` / `VITE_GOOGLE_CLIENT_ID`: same value, from Google Cloud Console → APIs & Services → Credentials → OAuth client ID → Web application. Not a secret (it's meant to ship in the frontend bundle), so no client secret is needed — the backend only verifies Google-issued ID tokens against it via `google-auth-library`. Add `http://localhost:5173` to the client's "Authorized JavaScript origins".

## Data layer (Phase 1)

```bash
npm run --workspace @fluidgym/api db:generate      # regenerate the Prisma client from schema.prisma
npm run --workspace @fluidgym/api db:migrate       # apply migrations (needs a real DATABASE_URL)
npm run --workspace @fluidgym/api generate:catalog -- <bodyPart> [count]
# e.g. npm run --workspace @fluidgym/api generate:catalog -- chest 10
```

`generate:catalog` needs real `ANTHROPIC_API_KEY` and `YOUTUBE_API_KEY` values — it exits early with a clear error if either is still a placeholder.

## Auth (Phase 2)

- `POST /api/auth/signup` `{ email, password }` → `{ token, user }`
- `POST /api/auth/login` `{ email, password }` → `{ token, user }`
- `POST /api/auth/google` `{ idToken }` → `{ token, user }` — `idToken` is the credential Google Identity Services hands back client-side, not an access token.
- `GET /api/me` with `Authorization: Bearer <token>` → `{ id, email }`

The frontend stores the token in `localStorage` and re-verifies it against `/api/me` on load rather than trusting it blindly.
