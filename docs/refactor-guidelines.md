# Refactor Guidelines

## Layer boundaries

- `src/app/**`: routing, layout, and route handlers only.
- `src/features/**`: feature UI, feature-specific state, and React Query hooks.
- `src/lib/**`: cross-feature logic (API envelope helpers, DB repositories, validators).
- `src/components/**`: shared presentational components.

## Server and client component rules

- Keep pages/layouts server-first by default.
- Use `"use client"` only in interactive leaves.
- Avoid mixing route/data orchestration and view markup in one file when a component exceeds ~200 lines.

## State management rules

- Server state lives in React Query hooks.
- UI-only state (modals, selected rows, draft form controls) stays local.
- Use centralized query key factories under each feature (`query-keys.ts`).
- Invalidate query families via helper functions instead of ad-hoc key strings.

## API route handler rules

- Parse JSON via `readJsonOrFail`.
- Validate with `validateOrFail` and Zod schemas.
- Map domain errors with `mapDomainError`.
- Keep route handlers thin; business logic belongs in repositories/services.

## KISS and DRY checks before merge

- Repeated UI blocks should become shared components.
- Repeated payload transformations should become utility functions.
- Keep handlers focused and named by intent (`handleSaveArticle`, `handleSuggestSeo`, etc.).
- Prefer explicit typed state names over generic `data` where practical.
