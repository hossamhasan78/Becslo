# Implementation Plan: Core Pricing Engine

**Branch**: `008-core-pricing-engine` | **Date**: 2026-03-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-core-pricing-engine/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement a comprehensive pricing calculation engine that enables freelancers to calculate project fees based on services, experience levels, geographic location, overhead costs, risk buffer, and profit margin. The engine must provide real-time price updates (<100ms) and store calculation results for admin analytics. Implementation follows the monolithic NextJS 14.x + Supabase architecture with email/password authentication.

## Technical Context

**Language/Version**: TypeScript 5.x with NextJS 14.x
**Primary Dependencies**: NextJS 14.x (App Router), Supabase (Auth, PostgreSQL), React Context or Zustand (state management)
**Storage**: Supabase PostgreSQL with Row-Level Security (RLS)
**Testing**: Jest + React Testing Library (unit), Playwright or Cypress (E2E for calculation flows)
**Target Platform**: Vercel (serverless deployment)
**Project Type**: Web service (monolithic NextJS application)
**Performance Goals**: Sub-100ms real-time calculation preview, support 1,000 concurrent users
**Constraints**: Monolithic architecture only, USD currency only, email/password authentication only, calculation precision to nearest dollar
**Scale/Scope**: ~120 services across 5 categories, ~200 countries with multipliers, admin-configurable pricing

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Rationale |
|-----------|--------|-----------|
| I. Authentication-First | ✅ PASS | Pricing engine depends on authenticated user access; will integrate with existing Supabase auth |
| II. Data Privacy & Analytics | ✅ PASS | Calculation results stored for admin analytics only; no personal save functionality |
| III. Monolithic Architecture | ✅ PASS | Implementation uses NextJS 14.x + Supabase within single monolithic codebase |
| IV. Admin-Configured Pricing | ✅ PASS | All pricing logic (rates, multipliers, formulas) will be configurable via admin dashboard |
| V. MVP Incremental Development | ✅ PASS | This is Phase 2 in implementation order (Priority #4 after authentication, wizard placeholder, service selection) |

**Gate Status**: ✅ ALL GATES PASSED - Proceed to Phase 0 research

## Project Structure

### Documentation (this feature)

```text
specs/008-core-pricing-engine/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-contracts.md # API interface contracts
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# NextJS 14.x Monolithic Application Structure
app/
├── api/
│   ├── calculate/
│   │   └── route.ts           # Server-side calculation endpoint
│   └── services/
│       └── route.ts           # Services API (existing from Phase 1)
├── wizard/
│   ├── page.tsx               # Wizard page (existing from Phase 0)
│   └── components/
│       ├── live-preview.tsx   # Real-time price preview panel
│       └── step-inputs/       # Wizard step components (Phase 3)
└── admin/
    └── analytics/              # Admin analytics (Phase 5)

lib/
├── pricing-engine.ts           # Core pricing calculation logic
├── types/
│   ├── pricing.ts              # Pricing types/interfaces
│   └── validation.ts           # Validation schemas
└── utils/
    ├── formatting.ts           # Currency formatting, rounding
    └── validation.ts           # Input validation helpers

components/
├── context/
│   └── PricingContext.tsx      # Global pricing state management
└── ui/                          # Reusable UI components

tests/
├── unit/
│   ├── pricing-engine.test.ts  # Pricing logic tests
│   └── validation.test.ts      # Input validation tests
└── integration/
    └── calculation-flow.test.tsx # End-to-end calculation flows
```

**Structure Decision**: Monolithic NextJS 14.x structure following App Router conventions. All pricing logic (client-side preview, server-side API, validation) within single codebase to maintain simplicity and align with constitutional requirement for monolithic architecture.

## Post-Design Constitution Check

*GATE: Re-verified after Phase 1 design completion*

| Principle | Status | Design Validation |
|-----------|--------|-------------------|
| I. Authentication-First | ✅ PASS | POST /api/calculate requires Supabase JWT; all user calculations linked to authenticated user ID |
| II. Data Privacy & Analytics | ✅ PASS | Calculation records stored in Supabase with user ID/email for admin analytics; no personal save feature |
| III. Monolithic Architecture | ✅ PASS | All pricing logic in NextJS monolith: client-side calculation (`lib/pricing-engine.ts`), server-side API (`app/api/calculate/route.ts`), no external services |
| IV. Admin-Configured Pricing | ✅ PASS | All pricing data (services, countries, costs, config) stored in Supabase tables with admin CRUD access via dashboard; rates and multipliers configurable without code changes |
| V. MVP Incremental Development | ✅ PASS | Implements Phase 2 (Priority #4); depends on Phase 0 (auth) and Phase 1 (database); enables Phase 3 (wizard flow) and Phase 5 (analytics) |

**Design Decision Verification**:
- ✅ Client-side calculation for <100ms performance (no server latency)
- ✅ Server-side validation API for security
- ✅ React Context for state management (simple, no external deps)
- ✅ Playwright for E2E testing (aligns with NextJS recommendations)
- ✅ USD currency only (per constitution)
- ✅ Calculation precision to nearest dollar (per constitution)
- ✅ Email/password authentication only (Supabase Auth)
- ✅ RLS policies ensure user isolation

**Gate Status**: ✅ ALL GATES PASSED - Design validated, ready for Phase 2 task decomposition

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | No constitutional violations |
