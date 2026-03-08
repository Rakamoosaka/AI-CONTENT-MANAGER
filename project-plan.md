# AI Content Manager - Detailed Project Plan

## 1. Goals And Scope

Build a mini-CMS with integrated AI assistant in **48 hours** using:

- Next.js 16.x (App Router + Route Handlers)
- React 19.x
- TanStack Query v5
- shadcn/ui
- Mastra (agent + 4 tools)
- Drizzle ORM + SQLite
- TypeScript 5.x

In scope:

- 4 pages only: `/`, `/content`, `/content/new`, `/content/[id]`, `/categories`
- Full CRUD for articles and categories
- AI tools integrated directly into editor and list UX (not separate chatbot page)
- Responsive desktop + tablet UX

Out of scope:

- Auth/AuthZ
- CI/CD and deployment
- Automated tests (can add lightweight smoke checks manually)
- Advanced performance optimization

## 2. Reference Constraints From Fresh Docs

### Next.js 16.1.1 (Context7 + project instruction)

- Use App Router and Route Handlers in `app/api/**/route.ts`.
- Keep server/client boundaries strict: interactive UI in Client Components, data/logic server-side.
- Use `revalidateTag(tag, 'max')` for stale-while-revalidate invalidation.
- `updateTag` only inside Server Actions (not Route Handlers).
- Request APIs like `headers()`/`cookies()` are async in App Router.

### TanStack Query v5 (Context7)

- Wrap app with `QueryClientProvider` in a client provider component.
- Use `useQuery` for reads, `useMutation` for writes.
- Invalidate by key after mutations (`queryClient.invalidateQueries({ queryKey: [...] })`).

### Drizzle + SQLite (Context7)

- Define schema with `drizzle-orm/sqlite-core`.
- Use `drizzle-kit generate` for SQL migration generation.
- Apply migrations with `drizzle-kit migrate`.

### shadcn/ui (Context7)

- Use CLI add-flow for core components (`table`, `dialog`, `sheet`, `select`, etc.).
- Use Sonner toaster in root layout for async feedback.

### Mastra (Mastra skill + remote docs)

- Agent via `Agent` class.
- Tools via `createTool({ id, description, inputSchema, outputSchema, execute })`.
- Attach tools through `tools: { ... }` on agent.
- Prefer clear tool descriptions + Zod schemas for reliable tool selection.
- For Next.js integration, call Mastra from route handlers; streaming optional.

## 3. Product Design Direction (UI/UX)

Design intent: clean editorial admin UI with warm neutral base + sharp accent, highly legible typography, soft motion.

### Visual system

- Layout: left navigation rail + top contextual header.
- Density: medium, table-focused on `/content`.
- Color tokens (CSS variables):
	- Base background: warm light (`#f7f5f2` range)
	- Surface cards: off-white (`#fffdf9` range)
	- Primary accent: deep teal (`#0f766e` range)
	- AI accent: amber (`#f59e0b` range)
	- Danger: rose/red semantic
- Typography:
	- Display/headings: `Manrope` or `Plus Jakarta Sans`
	- Body/UI: `IBM Plex Sans` or `Source Sans 3`
- Motion:
	- Stagger reveal for dashboard cards/table rows
	- Subtle pulse/skeleton on AI generation areas
	- Floating bulk-action toolbar slide/fade in

### Mandatory UX behaviors from your brief

- AI generation shows inline textarea pulse/skeleton ("AI is typing" feel).
- Category AI in editor is suggestion-first:
	- Show banner "AI suggests: <Category>"
	- Actions: Accept / Dismiss
- Bulk categorization opens modal with per-row editable proposed category before save.

## 4. Information Architecture

### Routes

- `/` dashboard
- `/content` article list
- `/content/new` article create
- `/content/[id]` article edit
- `/categories` category CRUD

### Navigation

- Sidebar items: Dashboard, Content, Categories
- Global quick CTA: "Create Article"

## 5. Data Model And Database Plan

## 5.1 Drizzle schema

### `articles`

- `id`: text primary key (UUID)
- `title`: text not null
- `body`: text not null
- `excerpt`: text nullable
- `status`: text enum-like check (`draft | published`)
- `locale`: text not null default `ru`
- `seoTitle`: text nullable
- `seoDescription`: text nullable
- `seoKeywords`: text as JSON string nullable
- `categoryId`: text nullable FK -> categories.id
- `createdAt`: integer timestamp not null
- `updatedAt`: integer timestamp not null

### `categories`

- `id`: text primary key (UUID)
- `name`: text not null
- `slug`: text unique not null
- `description`: text nullable

## 5.2 Data access layer

- `lib/db/client.ts`: drizzle sqlite connection singleton.
- `lib/db/schema.ts`: tables + relations.
- `lib/db/repositories/articles.ts`: article CRUD + list with filters/pagination.
- `lib/db/repositories/categories.ts`: category CRUD + slug uniqueness checks.

## 5.3 Migration workflow

- `drizzle.config.ts` configured for sqlite.
- Commands:
	- `npm run db:generate`
	- `npm run db:migrate`

## 6. API Design (`app/api`)

All endpoints return JSON with unified envelope:

- success: `{ data, meta? }`
- error: `{ error: { code, message, details? } }`

### `GET /api/articles`

- Query params: `search`, `categoryId`, `status`, `page`, `pageSize`, `sort`
- Returns paginated list + total

### `POST /api/articles`

- Create article
- Server computes `excerpt` from body (first N chars)

### `GET /api/articles/[id]`

- Return article by id

### `PATCH /api/articles/[id]`

- Update mutable fields
- Refresh `updatedAt`

### `DELETE /api/articles/[id]`

- Delete article

### `POST /api/articles/bulk-categorize`

- Body: `{ assignments: [{ articleId, categoryId }] }`
- Transactional bulk update

### `GET /api/categories`

- Return all categories sorted by name

### `POST /api/categories`

- Create category (slug unique validation)

### `PATCH /api/categories/[id]`

- Update category

### `DELETE /api/categories/[id]`

- Delete category (optional guard if linked articles exist)

### `POST /api/agent`

- Generic entrypoint for Mastra tool actions:
	- `generateContent`
	- `categorize`
	- `seoSuggestions`
	- `translateContent`
- Request-response mode for simplicity and predictable UX.

## 7. AI Agent Architecture (Mastra)

## 7.1 Agent setup

- `src/mastra/agents/content-agent.ts`
- Model string format: `provider/model-name` (e.g. `openai/gpt-5.1`)
- Agent instructions include:
	- Russian-first output by default
	- deterministic, editor-safe formatting
	- strict JSON outputs for tool compatibility

## 7.2 Tools contract

### `generateContent`

- Input: `{ topic, tone, targetLength }`
- Output: `{ title, body }`
- Notes:
	- Return clean markdown/plain text only
	- Respect approximate length bounds

### `categorize`

- Input: `{ body, categories: [{ id, name, slug }] }`
- Output: `{ categoryId, confidence, rationale }`
- UX uses result as suggestion only (no auto-apply)

### `seoSuggestions`

- Input: `{ title, body, locale }`
- Output: `{ seoTitle, seoDescription, seoKeywords: string[] }`
- Limit keyword count (5-10)

### `translateContent`

- Input: `{ title, body, targetLocale }`
- Output: `{ title, body, locale }`
- Preferred UX behavior:
	- Offer modal: "Replace current text" or "Create copy as new article"
	- Default to create-copy (smarter evaluator-facing UX)

## 7.3 AI endpoint flow

1. Validate request with Zod.
2. Map action -> corresponding tool.
3. Call Mastra agent `.generate()` with strict tool intent.
4. Parse/validate output schema.
5. Return typed JSON.
6. Handle failures with clear error code and fallback message.

## 7.4 Error handling and resilience

- Timeout guard for AI calls.
- User-visible toasts for failures.
- Preserve current editor state if AI fails.
- For category/SEO errors, show retry CTA near affected panel.

## 8. Frontend Architecture

## 8.1 App shell

- `app/layout.tsx` server layout.
- `components/layout/AppShell.tsx` for sidebar/header.
- `components/providers/QueryProvider.tsx` client wrapper for TanStack Query.
- `components/providers/ToasterProvider.tsx` for Sonner.

## 8.2 Feature folders

- `features/dashboard/*`
- `features/content/list/*`
- `features/content/editor/*`
- `features/categories/*`
- `features/ai/*` (hooks + API adapters)

## 8.3 Query keys

- `['dashboard-stats']`
- `['articles', filters]`
- `['article', id]`
- `['categories']`

Mutation invalidation strategy:

- After article create/update/delete -> invalidate `['articles']`, `['dashboard-stats']`
- After category CRUD -> invalidate `['categories']`, `['articles']`
- After bulk categorize -> invalidate `['articles']`, `['dashboard-stats']`

## 9. Page-by-Page Implementation Details

## 9.1 Dashboard (`/`)

Components:

- 3 stat cards: total articles, published, drafts
- Category distribution block (simple list with counts, no charts)
- Latest articles table (5-10 rows)
- Quick button "Create Article"

Data:

- Single query to `/api/dashboard` (or compose from `/api/articles` + `/api/categories`)

## 9.2 Content list (`/content`)

Components:

- Search input (client-side on current page data or server-side via query param)
- Filters: category, status
- Table columns: title, category, status, createdAt, locale
- Checkbox selection per row + select-all
- Pagination controls
- Floating bulk toolbar appears when selection > 0

Bulk categorization flow:

1. User selects articles.
2. Click "Categorize selected".
3. Open modal with rows:
	 - Article title
	 - Suggested category (from AI)
	 - Editable select override
4. Save applies bulk update via `/api/articles/bulk-categorize`.

## 9.3 Editor (`/content/new`, `/content/[id]`)

Layout:

- Left 60% (form)
- Right 40% sticky AI panel

Left column fields:

- Title input
- Body textarea (large)
- Category select + "AI" button near select
- Status segmented control (draft/published)
- Locale selector
- Collapsible SEO section:
	- `seoTitle`
	- `seoDescription`
	- `seoKeywords`

Right AI panel sections:

- Generation: topic + tone + length -> fill title/body with soft reveal animation
- SEO: one button "Suggest from text" -> fill SEO fields
- Translation: target locale + action button -> replace or create copy

Suggestion UX for categorization:

- AI call returns candidate category
- Show non-blocking banner above category field:
	- "AI suggests: <name>"
	- buttons: Accept / Dismiss

AI loading UX:

- While generating text, textarea overlays animated skeleton/pulse layer
- Disable conflicting actions in panel during active request

## 9.4 Categories (`/categories`)

Simple CRUD with minimal effort:

- Table of categories
- Create/edit dialog
- Delete confirmation dialog

## 10. Business Logic Rules

- `excerpt` derived automatically from `body` when saving.
- `updatedAt` always refreshed server-side.
- Slug normalization for category (`kebab-case`, unique check).
- Published status allowed without category (optional) unless business requires otherwise.
- Locale defaults to `ru`.
- SEO keywords internally stored as JSON string in SQLite, mapped to `string[]` in API.

## 11. File And Module Blueprint

Planned structure:

```text
app/
	(app)/
		page.tsx
		content/page.tsx
		content/new/page.tsx
		content/[id]/page.tsx
		categories/page.tsx
	api/
		articles/route.ts
		articles/[id]/route.ts
		articles/bulk-categorize/route.ts
		categories/route.ts
		categories/[id]/route.ts
		agent/route.ts
components/
	layout/
	ui/
features/
	dashboard/
	content/list/
	content/editor/
	categories/
	ai/
lib/
	db/
	api/
	validators/
	utils/
src/mastra/
	index.ts
	agents/content-agent.ts
	tools/
		generate-content.ts
		categorize.ts
		seo-suggestions.ts
		translate-content.ts
drizzle.config.ts
```

## 12. 48-Hour Execution Plan

## Phase 0 (Hour 0-2): Bootstrap

- Initialize Next.js 16 + TypeScript + Tailwind.
- Install shadcn/ui and base components.
- Install TanStack Query, Drizzle, better-sqlite/sqlite driver, Mastra packages.
- Set up lint/format scripts.

Deliverable:

- App runs with shell navigation and placeholder pages.

## Phase 1 (Hour 2-10): Data layer + API

- Implement schema + migrations.
- Seed few categories/articles.
- Build full categories CRUD routes.
- Build full articles CRUD routes + list filters/pagination.

Deliverable:

- API fully usable via REST client.

## Phase 2 (Hour 10-20): Core UI pages

- Dashboard page with stats + latest table.
- Content list with filters/search/pagination/selection.
- Categories page CRUD dialogs.

Deliverable:

- All non-AI CMS workflows complete.

## Phase 3 (Hour 20-34): Editor + AI panel + Mastra tools

- Build editor 60/40 layout.
- Implement Mastra agent + 4 tools.
- Add `/api/agent` contract.
- Wire TanStack mutations for each AI action.
- Add required UX states (pulse/suggestion/modal flow).

Deliverable:

- All 4 AI tools integrated in-place and functional.

## Phase 4 (Hour 34-42): Polish UX

- Skeletons, transitions, empty states.
- Toast messaging and robust error UX.
- Improve responsive behavior for tablet.

Deliverable:

- Evaluation-ready UX quality.

## Phase 5 (Hour 42-48): Hardening + README + final QA

- Manual end-to-end smoke pass.
- Fix edge cases and visual consistency.
- Write README with setup and architecture notes.
- Record model/provider and required env vars.

Deliverable:

- Submission-ready repository.

## 13. Manual Steps Required (Only Where Needed)

You need to do these manually because they depend on your local environment and credentials:

1. Set LLM API key in `.env.local`.
2. Choose provider/model for Mastra agent (e.g. OpenAI).
3. Run install and migration commands.
4. Validate final UX in browser and adjust copy/visual details.

Suggested `.env.local`:

```bash
OPENAI_API_KEY=...
DATABASE_URL=file:./sqlite.db
```

Suggested commands:

```bash
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

## 14. Acceptance Checklist (Mapped To Evaluation)

### UI/UX (40%)

- Distinct visual style, not boilerplate
- Responsive desktop/tablet
- Contextual AI actions inside editor/list
- Smooth loading and success/error feedback

### AI integration (40%)

- 4 tools work end-to-end
- Suggestion-based category UX implemented
- Bulk categorize modal with per-row edits
- Good error handling and loading states

### Code structure (10%)

- Clear feature modules
- Reusable typed hooks/components
- Clean API contracts + Zod validation

### Completeness (10%)

- All required pages
- CRUD for article/category
- Navigation and primary flows stable

## 15. Risk Register And Mitigation

- Risk: AI output not matching schema.
	- Mitigation: strict outputSchema + server-side parsing + fallback messaging.
- Risk: Bulk categorize latency for many rows.
	- Mitigation: batch processing with progress state and optimistic UI hints.
- Risk: Scope creep on categories/dashboard visuals.
	- Mitigation: keep these pages intentionally lightweight per brief.
- Risk: Translation UX confusion.
	- Mitigation: explicit modal with two actions and clear default.

## 16. Definition Of Done

Project is done when:

- All required routes/pages are implemented and navigable.
- CRUD operations for articles/categories work from UI.
- Mastra agent tools are callable via `/api/agent` and reflected in UI state.
- Required AI UX patterns are implemented exactly (typing feel, suggestion banner, bulk modal).
- README explains setup (`npm install && npm run dev`), architecture, model/provider/API key.

