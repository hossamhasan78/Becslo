# Implementation Plan: MVP Authentication & Wizard Skeleton

**Branch**: `006-mvp-auth-wizard` | **Date**: 2026-03-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-mvp-auth-wizard/spec.md`

**Note**: This template is filled in by `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement Google OAuth authentication as the only login method, create a monolithic NextJS 14.x application with Supabase backend, establish wizard layout skeleton with 3/4 left panel and 1/4 right panel, and seed an initial admin user for configuration and testing. This is Phase 0 of the MVP implementation and provides the foundation for all subsequent features.

## Technical Context

**Language/Version**: TypeScript with NextJS 14.x
**Primary Dependencies**: NextJS 14.x (App Router), Supabase (Auth, PostgreSQL), Tailwind CSS, React Context or Zustand for state management
**Storage**: Supabase PostgreSQL with Row-Level Security (RLS)
**Testing**: Manual testing for MVP (Jest, React Testing Library, Playwright available for future use, not included in current tasks)
**Target Platform**: Web (modern browsers)
**Project Type**: web-service (monolithic NextJS application)
**Performance Goals**: Authentication flow completes within 30 seconds, page load within 2 seconds, 95%+ OAuth success rate
**Constraints**: Google OAuth only (no alternative auth), monolithic NextJS (no microservices), environment variables for secrets, HTTPS required
**Scale/Scope**: MVP phase supporting initial user authentication and wizard layout foundation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Compliance Status

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Authentication-First | ✅ PASS | Google OAuth implemented before any wizard features |
| II. Data Privacy & Analytics | ✅ PASS | User data stored for analytics only (admin) |
| III. Monolithic Architecture | ✅ PASS | NextJS 14.x + Supabase, no microservices |
| IV. Admin-Configured Pricing | ⚠️ NOT APPLICABLE | Pricing configuration deferred to later phase |
| V. MVP Incremental Development | ✅ PASS | This is Phase 0, priority #1-2 only |

### Gate Evaluation (Pre-Design)

**Status**: ✅ PASSED - All applicable constitutional requirements met

No violations detected. Feature aligns with:
- Google OAuth as sole authentication method (Principle I)
- Monolithic NextJS + Supabase architecture (Principle III)
- Authentication-first development approach (Principle V)
- Data storage limited to analytics requirements (Principle II)

### Post-Design Re-Evaluation

**Status**: ✅ PASSED - Phase 1 design confirms constitutional compliance

After completing Phase 1 design (data model, contracts, quickstart), the following has been verified:

| Principle | Design Confirmation | Status |
|-----------|-------------------|--------|
| I. Authentication-First | Google OAuth integration with Supabase Auth, no alternative methods | ✅ PASS |
| II. Data Privacy & Analytics | User data (email, name) stored only in users table for analytics, no personal save | ✅ PASS |
| III. Monolithic Architecture | Single NextJS application with Supabase backend, no microservices | ✅ PASS |
| IV. Admin-Configured Pricing | Admin users table ready for pricing configuration (deferred to later phase) | ✅ PASS |
| V. MVP Incremental Development | Phase 0 focuses on authentication + wizard layout only (priority #1-2) | ✅ PASS |

**Design-Specific Constitutional Compliance**:

- **Data Model**: Row-Level Security (RLS) policies enforce user isolation (Principle II)
- **API Contracts**: All protected routes require authentication via middleware (Principle I, V)
- **Architecture**: Single database (PostgreSQL), single frontend (NextJS), monolithic deployment (Principle III)
- **Admin Foundation**: Admin users table and RLS policies established for future pricing configuration (Principle IV)

**Final Gate Status**: ✅ PASSED - Design is constitutionally compliant

No design decisions violated constitutional requirements. Proceed to Phase 2 (tasks generation).

## Project Structure

### Documentation (this feature)

```text
specs/006-mvp-auth-wizard/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/                          # NextJS app directory
├── app/                       # App Router
│   ├── (auth)/               # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx      # Login page with Google OAuth button
│   │   └── callback/          # OAuth callback handler
│   │       └── route.ts       # Server action to handle OAuth callback
│   ├── (wizard)/             # Wizard route group
│   │   └── wizard/
│   │       └── page.tsx      # Wizard placeholder with 3/4 + 1/4 layout
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── auth/
│   │   └── GoogleLoginButton.tsx
│   ├── wizard/
│   │   ├── WizardLayout.tsx   # 3/4 + 1/4 layout wrapper
│   │   ├── LeftPanel.tsx      # Step navigation placeholder
│   │   └── RightPanel.tsx     # Live preview placeholder
│   └── ui/                   # Reusable UI components
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Supabase client configuration
│   │   ├── server.ts          # Server-side Supabase client
│   │   └── middleware.ts     # Auth middleware for protected routes
│   ├── context/
│   │   └── AuthContext.tsx    # Authentication state management
│   └── utils/
│       └── validation.ts      # Input validation utilities
├── types/                    # TypeScript type definitions
│   ├── auth.ts
│   └── wizard.ts
└── middleware.ts              # Route protection middleware

tests/
├── unit/
│   ├── auth/
│   │   └── AuthContext.test.tsx
│   └── utils/
│       └── validation.test.ts
├── integration/
│   └── auth/
│       └── OAuthFlow.test.ts
└── e2e/
    └── auth.spec.ts          # Playwright E2E tests

supabase/                      # Database setup
├── migrations/                # Database migrations
│   └── 001_init_schema.sql   # Create users, admin_users tables, RLS policies
└── seed.sql                  # Initial admin user seed

public/                        # Static assets
└── images/
```

**Structure Decision**: Monolithic NextJS 14.x application with App Router. Authentication flow implemented using Supabase Auth with Google OAuth provider. State management via React Context (can be upgraded to Zustand if needed). Wizard layout follows constitutional requirement of 3/4 left panel + 1/4 right panel. All protected routes use middleware for authentication verification.

## Complexity Tracking

> **No constitutional violations requiring justification**

This feature is the foundation implementation that establishes the architectural pattern for the entire application. Complexity is minimal and focused on authentication infrastructure and UI framework.

| Aspect | Complexity | Rationale |
|---------|------------|-----------|
| OAuth Integration | Medium | Requires Google OAuth configuration and callback handling |
| Route Protection | Low | Standard middleware pattern for protected routes |
| Wizard Layout | Low | Basic CSS grid/flexbox layout with placeholders |
| Database Schema | Low | Two tables (users, admin_users) with RLS policies |
| State Management | Low | Simple React Context for auth state |

**Overall Complexity**: Low - Foundation infrastructure with straightforward implementation patterns.
