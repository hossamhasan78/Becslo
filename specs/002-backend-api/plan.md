# Implementation Plan: Backend API

**Branch**: `002-backend-api` | **Date**: 2026-03-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/002-backend-api/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement all backend API endpoints for the Becslo freelance pricing calculator, including user-facing endpoints for fetching services/config/countries and storing calculations, plus admin endpoints for analytics, service management, and configuration control. PDF generation endpoint included for client-facing exports.

## Technical Context

**Language/Version**: TypeScript (NextJS 14.x)  
**Primary Dependencies**: NextJS API Routes, Supabase client (@supabase/supabase-js, @supabase/ssr), React PDF (@react-pdf/renderer)  
**Storage**: Supabase PostgreSQL  
**Testing**: Jest + React Testing Library  
**Target Platform**: Vercel (serverless functions)  
**Project Type**: web-service (NextJS API routes)  
**Performance Goals**: API response under 2 seconds  
**Constraints**: Must align with constitution (Google OAuth, USD-only, no paid plans)  
**Scale/Scope**: Single project, MVP scope

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Google OAuth Authentication | PASS | Auth handled by Supabase - backend enforces via RLS |
| Real-Time Calculator Preview | PASS | Frontend concern - not in backend scope |
| Privacy-First Analytics | PASS | Calculations stored anonymously, admin-only access |
| Admin Pricing Control | PASS | Config endpoint allows admin-editable multipliers |
| MVP Simplicity | PASS | USD-only, rounded calculations per constitution |

## Project Structure

### Documentation (this feature)

```
specs/002-backend-api/
├── plan.md              # This file (/speckit.plan command output)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md            # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# NextJS App Router with API routes
src/
├── app/
│   ├── api/             # API route handlers
│   │   ├── services/
│   │   ├── config/
│   │   ├── countries/
│   │   ├── calculation/
│   │   ├── export-pdf/
│   │   └── admin/
│   │       ├── calculations/
│   │       ├── analytics/
│   │       ├── services/
│   │       └── config/
│   ├── page.tsx
│   └── layout.tsx
├── lib/
│   ├── supabase.ts      # Supabase client
│   └── pricing-engine.ts # Pricing calculation logic
└── types/
    └── database.ts       # Database type definitions

supabase/
├── migrations/          # Database migrations (from Phase 1)
└── schema.sql          # Full schema definition
```

**Structure Decision**: NextJS App Router API routes in src/app/api/. Existing src/lib/pricing-engine.ts handles calculation logic. No external contracts needed - internal API only.

## Complexity Tracking

No complexity violations. Simple single-project architecture with standard NextJS API routes.
