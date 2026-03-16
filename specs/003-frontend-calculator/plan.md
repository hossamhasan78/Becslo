# Implementation Plan: Frontend - Calculator

**Branch**: `003-frontend-calculator` | **Date**: 2026-03-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/003-frontend-calculator/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement the frontend calculator wizard with 7 steps (pricing model, services, experience, geography, costs, results preview, PDF export) and a live preview panel. Users must authenticate via Google OAuth. The wizard uses a 3/4 left panel for steps and 1/4 right panel for live calculation preview.

## Technical Context

**Language/Version**: TypeScript (NextJS 14.x)  
**Primary Dependencies**: React, Tailwind CSS, Supabase client, @react-pdf/renderer  
**Storage**: Supabase PostgreSQL (via API)  
**Testing**: Jest + React Testing Library  
**Target Platform**: Web browser (Vercel)  
**Project Type**: web-application  
**Performance Goals**: Wizard loads < 2s, preview updates < 100ms  
**Constraints**: Must align with constitution (Google OAuth, Real-Time Preview 3/4 + 1/4 layout)  
**Scale/Scope**: Single page application, ~50 components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Google OAuth Authentication | PASS | Users must sign in per clarification |
| Real-Time Calculator Preview | PASS | 3/4 wizard + 1/4 preview layout per spec |
| Privacy-First Analytics | PASS | Calculations stored for admin analytics only |
| Admin Pricing Control | PASS | Configurable via admin dashboard |
| MVP Simplicity | PASS | USD-only, rounded calculations per constitution |

## Project Structure

### Documentation (this feature)

```
specs/003-frontend-calculator/
├── plan.md              # This file (/speckit.plan command output)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── tasks.md            # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# NextJS App Router with React components
src/
├── app/
│   ├── page.tsx        # Main calculator page
│   ├── layout.tsx      # Root layout
│   └── api/            # API routes (from Phase 2)
├── components/
│   ├── wizard/
│   │   ├── PricingModelStep.tsx
│   │   ├── ServiceSelectionStep.tsx
│   │   ├── ExperienceStep.tsx
│   │   ├── GeographyStep.tsx
│   │   ├── CostsStep.tsx
│   │   ├── ResultsPreviewStep.tsx
│   │   └── ExportPdfStep.tsx
│   ├── WizardContext.tsx
│   └── QuotePDF.tsx
├── lib/
│   ├── supabase.ts
│   └── pricing-engine.ts
└── types/
    └── database.ts
```

**Structure Decision**: NextJS App Router with React components. Wizard components in src/components/wizard/. Existing pricing-engine.ts and QuotePDF.tsx from Phase 2.

## Complexity Tracking

No complexity violations. Standard NextJS frontend with React components.
