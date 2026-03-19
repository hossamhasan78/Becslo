# Implementation Plan: Wizard Flow & Frontend Integration

**Branch**: `009-frontend-wizard-flow` | **Date**: 2026-03-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-frontend-wizard-flow/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement a fully functional 7-step wizard flow with a persistent 1/4-width live preview panel for freelance fee calculation. The wizard collects pricing model, services, experience, geography, costs, and risk/profit inputs, with real-time price updates (<100ms) via client-side calculation. State is persisted in browser sessionStorage to survive page refreshes. The final step provides a "Calculate & Save" button that performs server-side validation, saves to the database, and displays the complete breakdown. PDF download is a separate optional action. Builds on existing pricing engine (008) within the monolithic NextJS 14.x + Supabase architecture.

## Technical Context

**Language/Version**: TypeScript 5.x with NextJS 14.x  
**Primary Dependencies**: NextJS 14.x (App Router), Supabase (Auth, PostgreSQL), React Context (state management), Tailwind CSS  
**Storage**: Supabase PostgreSQL (existing tables); sessionStorage (wizard state persistence)  
**Testing**: Vitest + React Testing Library (unit), Playwright (E2E)  
**Target Platform**: Vercel (serverless deployment)  
**Project Type**: Web service (monolithic NextJS application)  
**Performance Goals**: Sub-100ms real-time calculation preview; wizard step transitions < 200ms  
**Constraints**: Monolithic architecture only, USD currency only, email/password authentication only, calculation precision to nearest dollar, no server-side draft saving  
**Scale/Scope**: 7 wizard steps, ~120 services across 5 categories, ~200 countries, 1/4-width live preview panel

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Rationale |
|-----------|--------|-----------|
| I. Authentication-First | ✅ PASS | Wizard is only accessible to authenticated users; depends on existing Supabase Auth from Phase 0 |
| II. Data Privacy & Analytics | ✅ PASS | Calculations saved for admin analytics only via "Calculate & Save"; no personal draft saving |
| III. Monolithic Architecture | ✅ PASS | All wizard components, state management, and API routes within single NextJS 14.x codebase |
| IV. Admin-Configured Pricing | ✅ PASS | Wizard reads admin-configured services, countries, costs, and config from Supabase; all pricing is configurable |
| V. MVP Incremental Development | ✅ PASS | This is Phase 3 (Priority #4: Wizard Flow), building after auth (Phase 0), database (Phase 1), and pricing engine (Phase 2) |

**Gate Status**: ✅ ALL GATES PASSED - Proceed to Phase 0 research

## Project Structure

### Documentation (this feature)

```text
specs/009-frontend-wizard-flow/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api-contracts.md # API interface contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/
│   │   ├── calculate/
│   │   │   └── route.ts                    # Existing: preview calculation
│   │   └── v1/
│   │       ├── calculate-and-save/
│   │       │   └── route.ts                # NEW: Calculate + persist to DB
│   │       ├── services/route.ts           # Existing: services API
│   │       ├── categories/route.ts         # Existing: categories API
│   │       ├── countries/route.ts          # Existing: countries API
│   │       ├── costs/route.ts              # Existing: costs API
│   │       └── config/route.ts             # Existing: config API
│   └── (wizard)/
│       ├── page.tsx                        # Wizard page (existing, to be updated)
│       └── layout.tsx                      # Wizard layout (if needed)
├── components/
│   ├── context/
│   └── PricingContext.tsx              # To be merged into src/lib/context/WizardContext.tsx
├── wizard/
│   │   ├── WizardLayout.tsx               # Existing: update for responsive stacking
│   │   ├── StepNavigation.tsx             # Existing: update for free navigation
│   │   ├── LivePreview.tsx                # Existing: update for pricing-model-aware display
│   │   └── steps/                         # NEW: all step components
│   │       ├── PricingModelStep.tsx        # Step 1
│   │       ├── ServiceSelectionStep.tsx    # Step 2
│   │       ├── ExperienceStep.tsx          # Step 3
│   │       ├── GeographyStep.tsx           # Step 4
│   │       ├── CostsStep.tsx              # Step 5
│   │       ├── RiskProfitStep.tsx          # Step 6
│   │       └── ReviewStep.tsx             # Step 7
│   └── ui/                                # Existing: reusable UI components
├── lib/
│   ├── pricing-engine.ts                  # Existing: extend with pricingModel
│   ├── context/
│   │   └── WizardContext.tsx              # Existing: unified wizard+pricing context
│   ├── hooks/
│   │   └── useSessionStorage.ts           # NEW: sessionStorage sync hook
│   ├── types/
│   │   ├── pricing.ts                     # Existing: add pricingModel field
│   │   └── validation.ts                  # Existing: step validation schemas
│   ├── utils/
│   │   ├── formatting.ts                  # Existing: currency formatting
│   │   └── validation.ts                  # Existing: extend with step validators
│   └── validation/
│       └── step-validators.ts             # NEW: per-step validation functions
├── types/
│   ├── auth.ts                            # Existing
│   └── wizard.ts                          # Existing: extend with new fields
└── middleware.ts                            # Existing: route protection

tests/
├── unit/
│   ├── pricing-engine.test.ts             # Existing: extend for pricingModel
│   ├── step-validators.test.ts            # NEW: per-step validation tests
│   └── session-storage.test.ts            # NEW: sessionStorage hook tests
└── integration/
    └── wizard-flow.test.tsx               # NEW: full wizard flow tests
```

**Structure Decision**: Extends existing monolithic NextJS 14.x structure. Step components organized in a `steps/` subdirectory within `wizard/`. New API endpoint follows existing `v1/` versioning pattern. Validation logic split into step-aware validators separate from the existing full-input validator.

## Post-Design Constitution Check

*GATE: Re-verified after Phase 1 design completion*

| Principle | Status | Design Validation |
|-----------|--------|-------------------|
| I. Authentication-First | ✅ PASS | Wizard route protected by existing middleware; `POST /api/v1/calculate-and-save` requires Supabase JWT |
| II. Data Privacy & Analytics | ✅ PASS | Calculations saved to `calculations` table with user ID/email on explicit "Calculate & Save" click; no auto-save; sessionStorage is client-only |
| III. Monolithic Architecture | ✅ PASS | All step components, context, hooks, and API route within NextJS monolith; no external services |
| IV. Admin-Configured Pricing | ✅ PASS | Wizard reads all pricing data (services, countries, costs, config) from admin-configurable Supabase tables; slider ranges from config |
| V. MVP Incremental Development | ✅ PASS | Implements Phase 3 (Priority #4); depends on Phase 0 (auth), Phase 1 (database), Phase 2 (pricing engine); enables Phase 4 (PDF export) |

**Design Decision Verification**:
- ✅ Client-side calculation for <100ms live preview (using existing `calculatePrice()`)
- ✅ Server-side validation + save via `POST /api/v1/calculate-and-save`
- ✅ React Context for state management (extends existing `PricingContext`)
- ✅ sessionStorage for wizard persistence (ephemeral, survives refresh, no server drafts)
- ✅ USD currency only, nearest dollar precision
- ✅ Free navigation to completed steps, no skip-ahead
- ✅ "Calculate & Save" button triggers both display + DB persist
- ✅ PDF download is separate optional action
- ✅ Pricing model (hourly/project) changes calculation logic
- ✅ Hours input enforces min=1 at control level
- ✅ Responsive stacking on mobile (<768px)

**Gate Status**: ✅ ALL GATES PASSED - Design validated, ready for Phase 2 task decomposition

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| N/A | N/A | No constitutional violations |
