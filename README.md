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

Copy `.env.example` to `.env.local` and set values:

- `OPENAI_API_KEY` (if you later switch tool execution to a live provider)
- `DATABASE_URL=file:./sqlite.db`

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
