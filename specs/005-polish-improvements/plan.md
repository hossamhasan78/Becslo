# Implementation Plan: Phase 5 Polish

**Branch**: `005-polish-improvements` | **Date**: 2026-03-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-polish-improvements/spec.md`

## Summary

Implement validation improvements, error handling, loading states, and edge case handling for the Becslo freelance pricing calculator. This is a polish phase focused on improving user experience by adding proper form validation, user-friendly error messages, loading indicators, and handling boundary conditions.

## Technical Context

**Language/Version**: TypeScript (NextJS 14.x)  
**Primary Dependencies**: React, Tailwind CSS, Supabase client (@supabase/supabase-js, @supabase/ssr)  
**Storage**: Supabase PostgreSQL (existing)  
**Testing**: Already defined in project  
**Target Platform**: Web (Vercel)  
**Project Type**: Web application  
**Performance Goals**: Validation feedback within 100ms (per SC-001)  
**Constraints**: 200ms threshold for loading states (per SC-003)  
**Scale/Scope**: Existing calculator wizard with admin dashboard

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| Google OAuth only | ✅ N/A - no auth changes in this phase |
| Real-Time Calculator Preview | ✅ Existing feature - validation improves UX |
| Privacy-First Analytics | ✅ N/A - no data changes |
| Admin Pricing Control | ✅ N/A - no config changes |
| MVP Simplicity | ✅ Polish aligns with simplicity principle |

**Constitution Alignment**: This phase enhances user experience without violating any core principles. All changes are additive improvements to existing functionality.

## Project Structure

### Documentation (this feature)

```text
specs/005-polish-improvements/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (N/A - no research needed)
├── data-model.md        # Phase 1 output (N/A - no data model changes)
├── quickstart.md        # Phase 1 output (existing quickstart)
├── contracts/           # Phase 1 output (N/A - no new contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── page.tsx              # Calculator main page
│   ├── api/                  # Backend API endpoints
│   │   ├── services/
│   │   ├── config/
│   │   ├── countries/
│   │   ├── calculation/
│   │   ├── export-pdf/
│   │   └── admin/
│   └── admin/                # Admin pages
│       ├── page.tsx
│       ├── analytics/
│       ├── services/
│       ├── config/
│       └── calculations/
├── components/
│   ├── wizard/               # Calculator wizard components
│   │   ├── PricingModelStep.tsx
│   │   ├── ServiceSelectionStep.tsx  # New - with validation
│   │   ├── ExperienceStep.tsx        # New - with validation
│   │   ├── GeographyStep.tsx         # New - with validation
│   │   ├── CostsStep.tsx             # New - with validation
│   │   ├── LivePreview.tsx
│   │   └── ResultsPreviewStep.tsx    # New
│   ├── admin/               # Admin components
│   │   └── Navigation.tsx
│   ├── ui/                  # UI components
│   │   ├── LoadingSpinner.tsx        # New
│   │   ├── SkeletonLoader.tsx       # New
│   │   └── ConfirmDialog.tsx        # New
│   └── ErrorBoundary.tsx             # New
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── pricing-engine.ts     # Pricing calculation logic
│   ├── validation.ts        # New - validation utilities
│   ├── sanitize.ts           # New - XSS sanitization
│   └── api-error.ts         # New - error handling
```

**Structure Decision**: Single project with NextJS 14.x monolith architecture. No new directories needed - polish involves improving existing components.

## Phase 0: Research

**Status**: Not Required

This phase focuses on polish improvements to existing functionality. No new technologies or integrations required. All technical decisions are based on existing project patterns.

## Phase 1: Design & Contracts

**Status**: Not Required

This phase does not require new data models or contracts. All validation, error handling, and loading states are UI-level improvements to existing components.

### Quickstart

To implement Phase 5 Polish, run:

```bash
# Start development server
npm run dev

# Run linting
npm run lint

# Run type checking
npx tsc --noEmit
```

### Implementation Approach

1. **Validation Improvements** (FR-001 to FR-004)
   - Add form validation to wizard step components
   - Display inline error messages
   - Validate numeric ranges (hours: 0-1000, years: 0-50)
   - Require mandatory fields before progression

2. **Error Handling** (FR-005 to FR-006)
   - Add try/catch with user-friendly messages
   - Implement automatic retry (3 attempts) for network calls
   - Handle session timeout with data preservation

3. **Loading States** (FR-007 to FR-008)
   - Add loading spinners for async operations >200ms
   - Disable buttons during processing
   - Add skeleton loaders for data fetching

4. **Edge Cases** (FR-009 to FR-014)
   - Sanitize input to prevent XSS
   - Handle maximum value calculations
   - Preserve data on errors
   - Add confirmation before discarding changes
