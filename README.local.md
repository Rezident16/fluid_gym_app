# Run Locally

## Prerequisites
- Node.js 18+ (recommended)
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
```
