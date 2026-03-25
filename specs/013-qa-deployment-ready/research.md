# Research: Testing & Deployment Readiness

## Decision 1: Playwright for End-to-End Testing
**Decision**: Use **Playwright** for the "Critical Path" E2E tests.
**Rationale**: Already indicated in the Implementation Plan. Playwright is native to modern NextJS/TypeScript stacks and provides excellent support for screenshot testing (crucial for PDF/UI validation).
**Alternatives considered**: Cypress (rejected due to slower execution and more complex CI setup).

## Decision 2: Deployment Sequence (Pre-Production)
**Decision**:
1.  **Migration-First**: Run Supabase SQL migrations against the target instance (Staging/Prod).
2.  **Staged Deploy**: Use Vercel's multi-stage environment logic (Preview for PRs, Production for `main`).
3.  **Smoke Test**: Automatically run a subset of E2E tests against the Vercel Preview URL before promoting to Production.
**Rationale**: Ensures database schema is consistent with application logic before users hit it.
**Alternatives considered**: App-first deployment (rejected due to high risk of downtime on schema changes).

## Decision 3: Administrative Handover Documentation
**Decision**: Use **Markdown** in the `docs/` directory for the Admin Setup Guide.
**Rationale**: Version-controlled, searchable, and readable via any standard developer environment (GitHub/VSCode).
**Alternatives considered**: Notion/External PDF (rejected to keep project self-contained).

## Decision 4: Observability Strategy
**Decision**: Utilize Platform-Native Observability (Vercel Log Drain / Supabase Dashboard).
**Rationale**: Minimal overhead for an MVP and provides sufficient data on performance and errors.
**Alternatives considered**: Sentry (deferred for post-MVP optimization unless requested).
