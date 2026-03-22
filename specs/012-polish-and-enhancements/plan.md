# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Polish and enhance the Becslo application's core user experience, focusing on the 7-step wizard and PDF export functionality. This phase implements visual progress indicators, smooth transitions, robust real-time validation, and Local Storage persistence for session recovery. Technical improvements include client-side UUID generation for instant PDF availability and performance optimizations to ensure <100ms calculation updates.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript / NextJS 14.x (App Router)
**Primary Dependencies**: Tailwind CSS, Supabase (Auth/PostgreSQL), `uuid` (NEEDS CLARIFICATION), Framer Motion (NEEDS CLARIFICATION), Lucide React
**Storage**: Browser Local Storage, Supabase PostgreSQL
**Testing**: Playwright (E2E), Vitest (Unit)
**Target Platform**: Web / Mobile Responsive (Vercel)
**Project Type**: Web application (NextJS Monolith)
**Performance Goals**: <100ms real-time preview updates, 60fps UI transitions
**Constraints**: USD currency only, nearest dollar precision, 3/4 + 1/4 layout, manual hours input only
**Scale/Scope**: End-user wizard and PDF export (Admin Dashboard out of scope)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Rationale |
|------|--------|-----------|
| I. Authentication-First | ✅ PASS | Feature assumes functional email/password auth from Phase 0. |
| II. Data Privacy & Analytics | ✅ PASS | No personal save implemented; calculations stored for admin analytics. |
| III. Monolithic Architecture | ✅ PASS | Implemented as NextJS 14.x monolith with Supabase. |
| IV. Admin-Configured Pricing | ✅ PASS | Pricing logic remains configurable via admin DB (Phase 5). |
| V. MVP Incremental Dev | ✅ PASS | Phase 6 follows strict implementation order (after PDF/Admin). |
| Tech: USD Only | ✅ PASS | Success criteria explicitly enforce USD/nearest dollar. |
| UI: 3/4 + 1/4 Layout | ✅ PASS | Polish maintains constitution-mandated wizard layout. |

## Project Structure

### Documentation (this feature)

```text
specs/012-polish-and-enhancements/
├── plan.md              # Implementation strategy
├── research.md          # UUID & persistence strategy
├── data-model.md        # Client-side entities
├── quickstart.md        # Component snippets
├── contracts/           
│   └── uuid_integration.md # API update definitions
└── tasks.md             # Implementation tasks
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── Wizard/
│   │   │   ├── WizardStepWrapper.tsx   # Animates transitions
│   │   │   ├── ProgressBar.tsx        # Responsive progress visual
│   │   │   └── ValidationFeedback.tsx  # Error UI components
│   ├── hooks/
│   │   └── useWizardPersistence.ts     # LocalStorage state management
│   ├── utils/
│   │   ├── uuid.ts                     # Native randomUUID wrapper
│   │   └── validation.ts               # Input limits
│   └── types/
│       └── wizard.ts                   # WizardState interface
└── tests/
    └── e2e/
        └── wizard-polish.spec.ts       # Playwright E2E tests
```

**Structure Decision**: Web application monolith project structure (frontend focused). All new logic is contained within the standard NextJS `/frontend` workspace using React hooks and utility functions.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
