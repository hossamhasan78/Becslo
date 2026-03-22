# Implementation Plan: Admin Dashboard & Analytics

**Branch**: `011-admin-dashboard-analytics` | **Date**: 2026-03-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-admin-dashboard-analytics/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Enable admin users to manage services, pricing configuration, view analytics, and inspect calculations through a dedicated dashboard. This feature provides full CRUD operations for services, real-time configuration editing for pricing parameters, numeric analytics tables with date range filtering, and a calculations viewer with detailed breakdowns. All admin pages require authentication and role-based access control, with performance targets of under 3 seconds for analytics and 2 seconds for paginated calculations (supporting up to 10,000 calculations).

## Technical Context

**Language/Version**: TypeScript 5.x with NextJS 14.x (App Router)
**Primary Dependencies**: NextJS 14.x, Supabase (Auth, PostgreSQL), Tailwind CSS, React Context or Zustand (state management)
**Storage**: Supabase PostgreSQL with Row-Level Security (RLS)
**Testing**: npm test; npm run lint
**Target Platform**: Web (browser) deployed to Vercel
**Project Type**: web-service (NextJS monolithic application with admin dashboard)
**Performance Goals**: Analytics metrics update in <3 seconds, calculations list pagination loads in <2 seconds per page, configuration changes apply to new calculations in <5 seconds
**Constraints**: Monolithic NextJS architecture (no separate backend), USD currency only, nearest dollar precision, email/password authentication only, admin role required for all dashboard pages
**Scale/Scope**: Support up to 10,000 calculations with standard database indexing, 25 items per page pagination, admin session authentication for all operations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Compliance | Rationale |
|-----------|-------------|-----------|
| I. Authentication-First | ✅ PASS | All admin pages require authentication and role-based access control (FR-002, FR-026) |
| II. Data Privacy & Analytics | ✅ PASS | Admin analytics display user name/email for insights only, no personal save functionality (FR-022) |
| III. Monolithic Architecture | ✅ PASS | Admin dashboard built as part of NextJS 14.x monolith with Supabase backend (FR-025) |
| IV. Admin-Configured Pricing | ✅ PASS | Full configuration editor for multipliers, base rates, risk/profit ranges (FR-008 to FR-014) |
| V. MVP Incremental Development | ✅ PASS | Phase 5 follows priority order (auth, wizard, pricing, PDF, admin) as per Constitution |

**Gate Status**: ✅ PASS - All constitutional principles satisfied, Phase 0 research authorized

## Project Structure

### Documentation (this feature)

```text
specs/011-admin-dashboard-analytics/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── admin-api.md     # API endpoint contracts for admin operations
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# NextJS 14.x App Router Structure
src/
├── app/
│   ├── admin/
│   │   ├── layout.tsx           # Admin layout with sidebar navigation
│   │   ├── page.tsx             # Admin dashboard home
│   │   ├── services/
│   │   │   ├── page.tsx         # Services list and CRUD operations
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Service edit page
│   │   ├── config/
│   │   │   └── page.tsx         # Configuration editor
│   │   ├── analytics/
│   │   │   └── page.tsx         # Analytics dashboard with metrics tables
│   │   └── calculations/
│   │       ├── page.tsx         # Calculations list
│   │       └── [id]/
│   │           └── page.tsx     # Calculation details view
│   ├── api/
│   │   └── admin/
│   │       ├── analytics/
│   │       │   └── route.ts     # GET /api/admin/analytics
│   │       ├── services/
│   │       │   ├── route.ts     # GET/POST /api/admin/services
│   │       │   └── [id]/
│   │       │       └── route.ts # GET/PUT/DELETE /api/admin/services/[id]
│   │       ├── config/
│   │       │   └── route.ts     # GET/PUT /api/admin/config
│   │       └── calculations/
│   │           └── route.ts     # GET /api/admin/calculations
│   └── middleware.ts            # Role-based access control middleware
├── components/
│   └── admin/
│       ├── Sidebar.tsx          # Admin sidebar navigation
│       ├── ServicesTable.tsx     # Paginated services list
│       ├── ServiceForm.tsx      # Service add/edit form
│       ├── ConfigEditor.tsx      # Configuration parameters editor
│       ├── AnalyticsTables.tsx   # Numeric tables for metrics
│       ├── CalculationsList.tsx  # Paginated calculations list
│       └── CalculationDetails.tsx # Calculation breakdown view
├── lib/
│   ├── supabase/
│   │   ├── server.ts            # Supabase server client
│   │   └── client.ts            # Supabase browser client
│   └── analytics.ts             # Analytics aggregation logic
└── types/
    └── admin.ts                  # TypeScript types for admin operations

tests/
├── integration/
│   ├── admin/
│   │   ├── services.test.ts     # Services CRUD integration tests
│   │   ├── config.test.ts       # Configuration management tests
│   │   ├── analytics.test.ts    # Analytics aggregation tests
│   │   └── calculations.test.ts # Calculations viewer tests
│   └── auth/
│       └── rbac.test.ts         # Role-based access control tests
└── unit/
    └── lib/
        └── analytics.test.ts     # Analytics aggregation unit tests
```

**Structure Decision**: NextJS 14.x App Router with server components and API routes. Admin pages organized under `/admin` route group with shared layout for sidebar navigation. API endpoints follow RESTful convention under `/api/admin`. Components co-located with pages, utility functions in `/lib`. Testing organized by integration and unit, with admin-specific test suites.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | Constitution Check passed with all principles satisfied |
