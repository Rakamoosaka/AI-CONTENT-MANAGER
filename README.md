# AI Content Manager

Mini CMS built with Next.js App Router, React Query, Drizzle + SQLite, and integrated AI actions.

## Stack

- Next.js 16.1.x (App Router + Route Handlers)
- React 19
- TanStack Query v5
- Drizzle ORM + SQLite
- Zod validation
- Sonner toasts
- Mastra-style agent module under `src/mastra/*`

## Required Environment

1. Copy `.env.example` to `.env.local` (or `.env`).
2. Set `OPENROUTER_API_KEY` to your own key.

Template values:

- `DATABASE_URL=file:./sqlite.db`
- `OPENROUTER_API_KEY=...`
- `OPENROUTER_BASE_URL=https://openrouter.ai/api/v1` (optional, default is set in code)
- `OPENROUTER_MODEL=qwen/qwen3.5-flash-02-23` (optional, default is set in code)
- `AI_ACTION_TIMEOUT_MS=90000` (optional, clamped to 10_000..180_000)

Current AI provider: OpenRouter (OpenAI-compatible API via `@ai-sdk/openai-compatible`).
Current default model: `qwen/qwen3.5-flash-02-23`.

## Commands

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

## Implemented Routes

- `/` dashboard
- `/content` article list + filtering + selection + bulk categorize modal
- `/content/new` create editor
- `/content/[id]` edit editor
- `/categories` category CRUD

## API Routes

- `GET/POST /api/articles`
- `GET/PATCH/DELETE /api/articles/[id]`
- `POST /api/articles/bulk-categorize`
- `GET/POST /api/categories`
- `PATCH/DELETE /api/categories/[id]`
- `GET /api/dashboard`
- `POST /api/agent`

## Notes

- Category suggestion in editor is suggestion-first with Accept/Dismiss.
- AI generation shows pulsing overlay on the body textarea.
- Translation flow asks whether to replace or create a copy.
- Bulk categorize modal allows per-row category edits before save.

## Architecture (Short)

- App Router (`src/app/*`) is used for pages and API route handlers (`src/app/api/*`).
- React Query (`src/features/**/hooks.ts`) handles client-side fetching, cache, and invalidation after mutations.
- Drizzle + SQLite (`src/lib/db/*`, `drizzle/*`) implement schema, queries, and migrations.
- Mastra-style AI orchestration (`src/mastra/*`) routes actions through one typed agent entrypoint with four tools:
  - `generateContent`
  - `categorize`
  - `seoSuggestions`
  - `translateContent`
