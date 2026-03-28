# Becslo Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-28

## Active Technologies
- TypeScript 5.x / React 18 (NextJS 14.x App Router) + NextJS 14, Supabase JS client, Supabase CLI (migration runner) (016-db-service-cleanup)
- Supabase PostgreSQL — `categories`, `services`, `calculation_services` tables (016-db-service-cleanup)
- TypeScript 5.x / React 18 (Next.js 14.x App Router) + Next.js 14, Supabase JS client, Supabase CLI (migration runner), Zod (validation) (017-user-editable-costs)
- Supabase PostgreSQL — `costs`, `calculations`, new `calculation_costs` tables (017-user-editable-costs)
- TypeScript 5.x + React 18, Next.js 14.x (App Router) (021-interactive-wizard-nav)
- N/A — pure in-memory client-side state (021-interactive-wizard-nav)
- TypeScript 5.x + React 18, Next.js 14.x (App Router), Supabase JS client (auth session) (022-persistent-app-header)
- N/A — no new data stored (022-persistent-app-header)

- TypeScript 5.x / React 18 (NextJS 14.x App Router) + NextJS 14, React 18, Framer Motion (ProgressBar animation), Supabase JS client (015-remove-pricing-model)

## Project Structure

```text
src/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript 5.x / React 18 (NextJS 14.x App Router): Follow standard conventions

## Recent Changes
- 022-persistent-app-header: Added TypeScript 5.x + React 18, Next.js 14.x (App Router), Supabase JS client (auth session)
- 021-interactive-wizard-nav: Added TypeScript 5.x + React 18, Next.js 14.x (App Router)
- 017-user-editable-costs: Added TypeScript 5.x / React 18 (Next.js 14.x App Router) + Next.js 14, Supabase JS client, Supabase CLI (migration runner), Zod (validation)


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
