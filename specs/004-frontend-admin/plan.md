# Implementation Plan: Frontend - Admin

**Branch**: `004-frontend-admin` | **Date**: 2026-03-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/004-frontend-admin/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement the admin dashboard with analytics, service CRUD, configuration editor, and calculations viewer. Admin-only access enforced. Numeric analytics only (no charts per constitution).

## Technical Context

**Language/Version**: TypeScript (NextJS 14.x)  
**Primary Dependencies**: React, Tailwind CSS, Supabase client  
**Storage**: Supabase PostgreSQL (via API)  
**Testing**: Jest + React Testing Library  
**Target Platform**: Web browser (Vercel)  
**Project Type**: web-application (admin dashboard)  
**Performance Goals**: Pages load < 2 seconds  
**Constraints**: Must align with constitution (numeric analytics only, no PDF export)  
**Scale/Scope**: 4 admin pages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Google OAuth Authentication | PASS | Auth via Supabase - admin role enforced |
| Real-Time Calculator Preview | PASS | Not relevant to admin dashboard |
| Privacy-First Analytics | PASS | Numeric analytics only, no user-specific data |
| Admin Pricing Control | PASS | Config editor allows full pricing control |
| MVP Simplicity | PASS | USD-only, no PDF export per constitution |

## Project Structure

### Documentation (this feature)

```
specs/004-frontend-admin/
├── plan.md              # This file (/speckit.plan command output)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── tasks.md            # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# NextJS App Router admin pages
src/app/admin/
├── page.tsx            # /admin - Dashboard landing
├── analytics/
│   └── page.tsx        # /admin/analytics
├── services/
│   └── page.tsx       # /admin/services
├── config/
│   └── page.tsx       # /admin/config
└── calculations/
    └── page.tsx       # /admin/calculations

src/components/admin/   # Reusable admin components
```

**Structure Decision**: NextJS App Router admin pages under src/app/admin/. Reusable admin components in src/components/admin/.

## Complexity Tracking

No complexity violations. Simple admin dashboard with 4 pages.
